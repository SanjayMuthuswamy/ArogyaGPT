"""
ArogyaGPT - Translation Service
Multi-provider translation supporting 12 Indian languages.
"""

from app.core.config import settings
from app.core.constants import LANGUAGE_NAMES
from app.core.exceptions import TranslationError
from app.core.logging import get_logger

logger = get_logger(__name__)


class TranslationService:
    """
    Translation service supporting Indian languages via deep-translator.

    Supported languages: en, hi, ta, te, kn, ml, mr, bn, gu, pa, or, ur
    Providers: deep-translator (Google Translate free API), googletrans
    """

    async def translate(
        self,
        text: str,
        target_lang: str,
        source_lang: str = "en",
    ) -> str:
        """
        Translate text to target language.

        Args:
            text: Source text to translate.
            target_lang: ISO 639-1 target language code.
            source_lang: ISO 639-1 source language code (default: 'en').

        Returns:
            Translated text string.

        Raises:
            TranslationError: If translation fails.
        """
        if target_lang == source_lang:
            return text

        if not text.strip():
            return text

        if target_lang not in LANGUAGE_NAMES:
            raise TranslationError(
                f"Language '{target_lang}' is not supported. "
                f"Supported languages: {list(LANGUAGE_NAMES.keys())}"
            )

        # Split long text into chunks to stay within API limits
        max_chunk = 4500
        if len(text) <= max_chunk:
            return await self._translate_chunk(text, target_lang, source_lang)

        chunks = self._split_into_chunks(text, max_chunk)
        translated_chunks = []
        for chunk in chunks:
            translated = await self._translate_chunk(chunk, target_lang, source_lang)
            translated_chunks.append(translated)

        return "\n".join(translated_chunks)

    async def _translate_chunk(
        self, text: str, target_lang: str, source_lang: str
    ) -> str:
        """Translate a single text chunk using the configured provider."""
        # Try deep-translator first
        try:
            from deep_translator import GoogleTranslator
            translator = GoogleTranslator(source=source_lang, target=target_lang)
            result = translator.translate(text)
            if result:
                logger.debug(
                    f"Translation: {source_lang} → {target_lang} | "
                    f"{len(text)} chars → {len(result)} chars"
                )
                return result
        except ImportError:
            logger.warning("deep-translator not installed. Trying googletrans...")
        except Exception as e:
            logger.warning(f"deep-translator failed: {e}. Trying googletrans...")

        # Fallback: googletrans
        try:
            from googletrans import Translator
            translator = Translator()
            result = await translator.translate(text, dest=target_lang, src=source_lang)
            return result.text
        except ImportError:
            raise TranslationError(
                "Neither deep-translator nor googletrans is installed. "
                "Run: pip install deep-translator"
            )
        except Exception as e:
            logger.error(f"All translation providers failed: {e}")
            raise TranslationError(f"Translation to '{target_lang}' failed: {str(e)}")

    @staticmethod
    def _split_into_chunks(text: str, max_length: int) -> list[str]:
        """Split text into chunks at sentence boundaries."""
        sentences = text.replace("\n", " \n ").split(". ")
        chunks = []
        current_chunk = []
        current_length = 0

        for sentence in sentences:
            sentence_len = len(sentence)
            if current_length + sentence_len > max_length and current_chunk:
                chunks.append(". ".join(current_chunk) + ".")
                current_chunk = [sentence]
                current_length = sentence_len
            else:
                current_chunk.append(sentence)
                current_length += sentence_len

        if current_chunk:
            chunks.append(". ".join(current_chunk))

        return chunks

    def get_supported_languages(self) -> dict[str, str]:
        """Return all supported language codes and their names."""
        return LANGUAGE_NAMES.copy()
