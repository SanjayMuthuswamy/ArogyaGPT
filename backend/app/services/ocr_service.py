"""
ArogyaGPT - OCR Service
Multi-provider OCR engine supporting Tesseract and PaddleOCR.
Handles PDF and image extraction with confidence scoring.
"""

import os
from pathlib import Path
from typing import Optional, Tuple

from app.core.config import settings
from app.core.exceptions import OCRProcessingError
from app.core.logging import get_logger

logger = get_logger(__name__)


class OCRService:
    """
    Multi-provider OCR service for extracting text from medical documents.

    Supports:
    - Tesseract (default, no GPU required)
    - PaddleOCR (higher accuracy, optional GPU)
    - PyMuPDF (for native PDF text extraction)
    - pdfplumber (for PDF with tabular data)
    """

    def __init__(self) -> None:
        self.provider = settings.OCR_PROVIDER

    async def extract_text(self, file_path: str) -> Tuple[str, Optional[float]]:
        """
        Extract text from a document file (PDF or image).

        Args:
            file_path: Absolute path to the file.

        Returns:
            Tuple of (extracted_text, confidence_score).

        Raises:
            OCRProcessingError: If text extraction fails.
        """
        path = Path(file_path)
        if not path.exists():
            raise OCRProcessingError(f"File not found: {file_path}")

        file_ext = path.suffix.lower().lstrip(".")

        try:
            if file_ext == "pdf":
                return await self._extract_from_pdf(file_path)
            elif file_ext in {"png", "jpg", "jpeg", "tiff", "bmp", "webp"}:
                return await self._extract_from_image(file_path)
            else:
                raise OCRProcessingError(f"Unsupported file type for OCR: {file_ext}")
        except OCRProcessingError:
            raise
        except Exception as e:
            logger.error(f"OCR extraction failed for {file_path}: {e}")
            raise OCRProcessingError(f"Could not extract text from document: {str(e)}")

    async def _extract_from_pdf(self, file_path: str) -> Tuple[str, float]:
        """
        Extract text from PDF using PyMuPDF (primary) with pdfplumber fallback.
        Automatically falls back to image-based OCR for scanned PDFs.
        """
        try:
            import fitz  # PyMuPDF
            text_parts = []
            doc = fitz.open(file_path)

            for page in doc:
                text = page.get_text("text")
                if text.strip():
                    text_parts.append(text)

            doc.close()

            if text_parts:
                full_text = "\n".join(text_parts)
                logger.debug(f"PyMuPDF extracted {len(full_text)} chars from {file_path}")
                return full_text, 0.95  # High confidence for native PDF text

        except ImportError:
            logger.warning("PyMuPDF not installed. Trying pdfplumber...")
        except Exception as e:
            logger.warning(f"PyMuPDF failed: {e}. Trying pdfplumber...")

        # Fallback: pdfplumber
        try:
            import pdfplumber
            text_parts = []
            with pdfplumber.open(file_path) as pdf:
                for page in pdf.pages:
                    text = page.extract_text()
                    if text:
                        text_parts.append(text)

            if text_parts:
                return "\n".join(text_parts), 0.90

        except Exception as e:
            logger.warning(f"pdfplumber failed: {e}. Falling back to image OCR...")

        # Last resort: Convert PDF pages to images and run OCR
        return await self._pdf_to_image_ocr(file_path)

    async def _pdf_to_image_ocr(self, file_path: str) -> Tuple[str, float]:
        """Convert PDF pages to images and apply Tesseract OCR."""
        try:
            import fitz
            from PIL import Image
            import io

            doc = fitz.open(file_path)
            text_parts = []
            total_confidence = []

            for page in doc:
                mat = fitz.Matrix(2.0, 2.0)  # 2x zoom for better OCR quality
                pix = page.get_pixmap(matrix=mat)
                img_bytes = pix.tobytes("png")
                image = Image.open(io.BytesIO(img_bytes))
                page_text = ""
                page_conf = 0.95
                try:
                    import winocr
                    res = await winocr.recognize_pil(image, "en")
                    if res:
                        lines = [l.text.strip() for l in res.lines if l.text.strip()] if hasattr(res, "lines") and res.lines else []
                        page_text = "\n".join(lines) if lines else (res.text or "").strip()
                except Exception:
                    pass

                if not page_text:
                    try:
                        page_text, page_conf = self._tesseract_ocr(image)
                    except Exception:
                        pass

                if page_text.strip():
                    text_parts.append(page_text)
                    total_confidence.append(page_conf)

            doc.close()
            avg_confidence = sum(total_confidence) / len(total_confidence) if total_confidence else 0.0
            return "\n".join(text_parts), avg_confidence

        except Exception as e:
            raise OCRProcessingError(f"PDF image OCR failed: {str(e)}")

    async def _extract_from_image(self, file_path: str) -> Tuple[str, float]:
        """Extract text from an image file using native fast OCR with line preservation."""
        try:
            from PIL import Image, ImageOps
            raw_image = Image.open(file_path)
            # Auto-orient based on camera EXIF tags
            image = ImageOps.exif_transpose(raw_image)
        except Exception as e:
            raise OCRProcessingError(f"Cannot open image: {str(e)}")

        # 1. Primary: Native Windows OCR (winocr) on original image with proper line separation
        try:
            import winocr
            result = await winocr.recognize_pil(image, "en")
            if result:
                lines = [line.text.strip() for line in result.lines if line.text.strip()] if hasattr(result, "lines") and result.lines else []
                text = "\n".join(lines) if lines else (result.text or "").strip()
                if len(text) > 10:
                    logger.info(f"WinOCR extracted {len(text)} chars ({len(lines)} lines) from {file_path}")
                    return text, 0.95
        except Exception as e:
            logger.warning(f"WinOCR extraction on raw image failed: {e}")

        # 1b. If raw image failed or had low yield, try preprocessed image
        try:
            import winocr
            preprocessed = self._preprocess_camera_image(image)
            result = await winocr.recognize_pil(preprocessed, "en")
            if result:
                lines = [line.text.strip() for line in result.lines if line.text.strip()] if hasattr(result, "lines") and result.lines else []
                text = "\n".join(lines) if lines else (result.text or "").strip()
                if len(text) > 10:
                    logger.info(f"WinOCR (preprocessed) extracted {len(text)} chars from {file_path}")
                    return text, 0.90
        except Exception as e:
            logger.warning(f"WinOCR preprocessed extraction failed: {e}")

        # 2. Fallback: PaddleOCR if configured
        if self.provider == "paddleocr":
            try:
                return await self._paddleocr(file_path)
            except Exception as e:
                logger.warning(f"PaddleOCR failed: {e}")

        # 3. Fallback: Tesseract OCR
        try:
            text, confidence = self._tesseract_ocr(image)
            if text and len(text.strip()) > 10:
                return text.strip(), confidence
        except Exception as e:
            logger.warning(f"Tesseract OCR failed: {e}")

        raise OCRProcessingError(
            "Could not detect clear text from this image. Please upload a clear photo or PDF of your medical report."
        )

    @staticmethod
    def _preprocess_camera_image(image):
        """
        Preprocess camera-captured photos of medical reports:
        - Auto-orient based on EXIF
        - Convert to grayscale
        - Enhance contrast and sharpness for low-light/blurry phone camera photos
        """
        try:
            from PIL import ImageEnhance, ImageOps

            # Auto-orient based on camera EXIF tags
            image = ImageOps.exif_transpose(image)

            # Convert to grayscale
            if image.mode != "L":
                image = image.convert("L")

            # Enhance contrast for camera shadows/glare
            contrast_enhancer = ImageEnhance.Contrast(image)
            image = contrast_enhancer.enhance(1.8)

            # Enhance sharpness for slightly blurry photos
            sharpness_enhancer = ImageEnhance.Sharpness(image)
            image = sharpness_enhancer.enhance(1.5)

            return image
        except Exception as e:
            logger.warning(f"Camera image preprocessing skipped: {e}")
            return image

    def _tesseract_ocr(self, image) -> Tuple[str, float]:
        """Run Tesseract OCR on a PIL Image."""
        try:
            import pytesseract
            if settings.TESSERACT_CMD and settings.TESSERACT_CMD != "tesseract":
                pytesseract.pytesseract.tesseract_cmd = settings.TESSERACT_CMD

            # Get detailed data for confidence scoring
            data = pytesseract.image_to_data(
                image,
                lang=settings.OCR_LANGUAGE,
                output_type=pytesseract.Output.DICT,
            )

            words = []
            confidences = []
            for i, word in enumerate(data["text"]):
                if word.strip() and data["conf"][i] > 0:
                    words.append(word)
                    confidences.append(data["conf"][i])

            text = " ".join(words)
            avg_confidence = (sum(confidences) / len(confidences) / 100) if confidences else 0.0

            logger.debug(f"Tesseract: {len(words)} words | confidence={avg_confidence:.2f}")
            return text, avg_confidence

        except ImportError:
            raise OCRProcessingError("pytesseract is not installed. Install it with: pip install pytesseract")
        except Exception as e:
            raise OCRProcessingError(f"Tesseract OCR failed: {str(e)}")

    async def _paddleocr(self, file_path: str) -> Tuple[str, float]:
        """Run PaddleOCR on a file path."""
        try:
            from paddleocr import PaddleOCR
            ocr = PaddleOCR(use_angle_cls=True, lang="en", use_gpu=False)
            result = ocr.ocr(file_path, cls=True)

            text_parts = []
            confidences = []
            for line in result:
                if line:
                    for item in line:
                        text_parts.append(item[1][0])
                        confidences.append(item[1][1])

            text = " ".join(text_parts)
            avg_confidence = sum(confidences) / len(confidences) if confidences else 0.0
            return text, avg_confidence

        except ImportError:
            logger.warning("PaddleOCR not installed. Falling back to Tesseract.")
            from PIL import Image
            image = Image.open(file_path)
            return self._tesseract_ocr(image)
        except Exception as e:
            raise OCRProcessingError(f"PaddleOCR failed: {str(e)}")
