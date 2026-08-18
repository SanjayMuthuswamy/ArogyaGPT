"""
ArogyaGPT - Text Cleaning Utility
Cleans and normalizes OCR-extracted medical text for downstream NLP processing.
"""

import re


def clean_medical_text(raw_text: str) -> str:
    """
    Clean and normalize raw OCR text from medical reports.

    Operations:
    1. Remove non-printable and control characters
    2. Normalize whitespace
    3. Fix common OCR artifacts
    4. Preserve medical symbols and units
    5. Normalize newlines

    Args:
        raw_text: Raw OCR-extracted text.

    Returns:
        Cleaned, normalized text string.
    """
    if not raw_text:
        return ""

    text = raw_text

    # Remove null bytes and non-printable characters (keep newlines and tabs)
    text = re.sub(r"[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]", "", text)

    # Fix common OCR errors in medical text
    ocr_corrections = {
        r"\b0\b(?=\s*[A-Za-z])": "O",  # Zero misread as O in context
        r"\bl\b(?=\s*\d)": "1",         # Lowercase L misread as 1
        r"(?<=\d)O(?=\d)": "0",         # Capital O misread as zero between digits
        r"\brn\b": "m",                  # 'rn' frequently misread as 'm'
    }
    for pattern, replacement in ocr_corrections.items():
        text = re.sub(pattern, replacement, text)

    # Normalize multiple spaces/tabs to single space
    text = re.sub(r"[ \t]+", " ", text)

    # Normalize multiple newlines to max 2
    text = re.sub(r"\n{3,}", "\n\n", text)

    # Remove stray periods and commas at line starts
    text = re.sub(r"^\s*[.,]\s*", "", text, flags=re.MULTILINE)

    # Normalize various dash types
    text = re.sub(r"[–—−]", "-", text)

    # Fix spacing around colons (medical reports use "Key: Value")
    text = re.sub(r"\s*:\s*", ": ", text)

    # Strip leading/trailing whitespace from each line
    lines = [line.strip() for line in text.split("\n")]
    text = "\n".join(line for line in lines if line)  # Remove blank lines

    return text.strip()


def extract_sections(text: str) -> dict[str, str]:
    """
    Attempt to split a medical report into logical sections.

    Common sections: Patient Info, Test Results, Diagnosis, Impression, Recommendations.

    Args:
        text: Cleaned report text.

    Returns:
        Dictionary mapping section name to section content.
    """
    sections = {}
    section_headers = [
        "PATIENT INFORMATION",
        "CLINICAL HISTORY",
        "TEST RESULTS",
        "LABORATORY RESULTS",
        "HAEMATOLOGY",
        "HEMATOLOGY",
        "BIOCHEMISTRY",
        "LIPID PROFILE",
        "THYROID FUNCTION",
        "LIVER FUNCTION",
        "KIDNEY FUNCTION",
        "DIAGNOSIS",
        "IMPRESSION",
        "CONCLUSION",
        "RECOMMENDATIONS",
        "ADVICE",
        "DOCTOR'S NOTE",
    ]

    pattern = r"(" + "|".join(re.escape(h) for h in section_headers) + r")"
    parts = re.split(pattern, text, flags=re.IGNORECASE)

    current_section = "GENERAL"
    current_content = []

    for part in parts:
        if part.strip().upper() in section_headers:
            if current_content:
                sections[current_section] = " ".join(current_content).strip()
            current_section = part.strip().upper()
            current_content = []
        else:
            current_content.append(part.strip())

    if current_content:
        sections[current_section] = " ".join(current_content).strip()

    return sections


def count_words(text: str) -> int:
    """Count the number of words in a text string."""
    return len(text.split())


def truncate_text(text: str, max_words: int) -> str:
    """Truncate text to a maximum word count, adding ellipsis."""
    words = text.split()
    if len(words) <= max_words:
        return text
    return " ".join(words[:max_words]) + "..."
