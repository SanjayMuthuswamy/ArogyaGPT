"""
ArogyaGPT - Medical NLP Service
Medical entity extraction using spaCy with fallback rule-based patterns.
Detects diseases, medicines, dosages, lab parameters, and clinical entities.
"""

import re
from typing import Optional

from app.core.config import settings
from app.core.logging import get_logger

logger = get_logger(__name__)

# Common medical entity patterns (fallback when NLP model unavailable)
DISEASE_PATTERNS = [
    r"\b(diabetes|diabetic|type\s*2\s*diabetes|type\s*1\s*diabetes|DM\s*type\s*[12])\b",
    r"\b(hypertension|high\s*blood\s*pressure|HTN)\b",
    r"\b(hypothyroidism|hyperthyroidism|thyroid\s*disorder)\b",
    r"\b(anemia|anaemia)\b",
    r"\b(chronic\s*kidney\s*disease|CKD|renal\s*failure)\b",
    r"\b(coronary\s*artery\s*disease|CAD|heart\s*disease|myocardial\s*infarction)\b",
    r"\b(hepatitis\s*[ABC])\b",
    r"\b(asthma|COPD|bronchitis)\b",
    r"\b(dyslipidemia|hyperlipidemia|hypercholesterolemia)\b",
    r"\b(osteoporosis|osteopenia)\b",
    r"\b(urinary\s*tract\s*infection|UTI)\b",
    r"\b(dengue|malaria|typhoid|tuberculosis|TB)\b",
    r"\b(COVID-19|SARS-CoV-2|coronavirus)\b",
]

MEDICINE_PATTERNS = [
    r"\b(metformin|glipizide|glimepiride|insulin|sitagliptin)\b",
    r"\b(amlodipine|lisinopril|losartan|atenolol|ramipril|telmisartan)\b",
    r"\b(atorvastatin|rosuvastatin|simvastatin|pravastatin)\b",
    r"\b(levothyroxine|thyroxine|eltroxin)\b",
    r"\b(aspirin|clopidogrel|warfarin|heparin|rivaroxaban)\b",
    r"\b(amoxicillin|azithromycin|ciprofloxacin|doxycycline|cefixime)\b",
    r"\b(omeprazole|pantoprazole|ranitidine|domperidone)\b",
    r"\b(paracetamol|ibuprofen|diclofenac|tramadol)\b",
    r"\b(salbutamol|montelukast|budesonide)\b",
    r"\b(vitamin\s*[BDCK]|folic\s*acid|iron\s*tablets?|calcium)\b",
]

DOSAGE_PATTERN = r"\b(\d+(?:\.\d+)?)\s*(mg|mcg|g|ml|IU|units?|mmol|mEq)\b"


class MedicalNLPService:
    """
    Medical entity extraction service.

    Primary: spaCy with en_core_web_sm (or en_core_sci_sm if available)
    Fallback: Rule-based regex patterns
    """

    def __init__(self) -> None:
        self._nlp = None
        self._scispacy_available = False

    def _load_spacy_model(self):
        """Lazy-load the spaCy model."""
        if self._nlp is None:
            try:
                import spacy
                # Try scispaCy first (better for medical text)
                try:
                    self._nlp = spacy.load("en_core_sci_sm")
                    self._scispacy_available = True
                    logger.info("scispaCy model loaded: en_core_sci_sm")
                except OSError:
                    # Fallback to standard spaCy
                    self._nlp = spacy.load(settings.SPACY_MODEL)
                    logger.info(f"spaCy model loaded: {settings.SPACY_MODEL}")
            except ImportError:
                logger.warning("spaCy not installed. Using rule-based entity extraction.")
            except OSError:
                logger.warning(
                    f"spaCy model '{settings.SPACY_MODEL}' not found. "
                    "Run: python -m spacy download en_core_web_sm"
                )
        return self._nlp

    async def extract_entities(self, text: str) -> dict:
        """
        Extract medical entities from cleaned text.

        Returns:
            Dictionary with keys:
            - diseases: list of {name, confidence}
            - medicines: list of {name, dosage, frequency}
            - lab_values: list of {test, value, unit}
            - symptoms: list of strings
        """
        entities = {
            "diseases": [],
            "medicines": [],
            "lab_values": [],
            "symptoms": [],
        }

        nlp = self._load_spacy_model()

        if nlp:
            entities = await self._spacy_extraction(text, nlp, entities)
        else:
            entities = self._regex_extraction(text, entities)

        # Always run regex as supplemental extraction
        entities = self._regex_extraction(text, entities)

        # Deduplicate
        entities["diseases"] = self._deduplicate(entities["diseases"], "name")
        entities["medicines"] = self._deduplicate(entities["medicines"], "name")

        logger.info(
            f"NLP extraction complete | "
            f"diseases={len(entities['diseases'])} | "
            f"medicines={len(entities['medicines'])} | "
            f"lab_values={len(entities['lab_values'])}"
        )

        return entities

    async def _spacy_extraction(self, text: str, nlp, entities: dict) -> dict:
        """Use spaCy NER to extract named medical entities."""
        try:
            # Process in chunks to handle long texts
            max_length = 100000
            chunks = [text[i:i+max_length] for i in range(0, len(text), max_length)]

            for chunk in chunks:
                doc = nlp(chunk)
                for ent in doc.ents:
                    label = ent.label_.upper()
                    name = ent.text.strip()

                    if label in {"DISEASE", "DISORDER", "CONDITION"}:
                        entities["diseases"].append({"name": name, "confidence": 0.85, "source": "spacy"})
                    elif label in {"CHEMICAL", "DRUG", "MEDICATION"}:
                        entities["medicines"].append({"name": name, "source": "spacy"})
                    elif label in {"SYMPTOM"}:
                        entities["symptoms"].append(name)

        except Exception as e:
            logger.warning(f"spaCy extraction error: {e}")

        return entities

    def _regex_extraction(self, text: str, entities: dict) -> dict:
        """Rule-based regex extraction as fallback/supplement."""
        text_lower = text.lower()

        # Disease detection
        for pattern in DISEASE_PATTERNS:
            matches = re.findall(pattern, text, re.IGNORECASE)
            for match in matches:
                name = match.strip()
                entities["diseases"].append({
                    "name": name,
                    "confidence": 0.75,
                    "source": "regex",
                })

        # Medicine detection
        for pattern in MEDICINE_PATTERNS:
            matches = re.findall(pattern, text, re.IGNORECASE)
            for match in matches:
                entities["medicines"].append({
                    "name": match.strip(),
                    "source": "regex",
                })

        # Lab value extraction (e.g., "Hemoglobin: 8.5 g/dL")
        lab_pattern = r"([A-Za-z][A-Za-z\s\(\)]+?)[:=\s]+(\d+(?:\.\d+)?)\s*(g/dL|mg/dL|mIU/L|U/L|mmol/L|mEq/L|%|IU/L|10\^3/uL|ng/dL|pg/mL)"
        for match in re.finditer(lab_pattern, text, re.IGNORECASE):
            test_name = match.group(1).strip()
            if len(test_name) < 50:  # Reasonable test name length
                entities["lab_values"].append({
                    "test": test_name,
                    "value": match.group(2),
                    "unit": match.group(3),
                })

        return entities

    @staticmethod
    def _deduplicate(items: list[dict], key: str) -> list[dict]:
        """Remove duplicate entries by a given key (case-insensitive)."""
        seen = set()
        unique = []
        for item in items:
            val = item.get(key, "").lower()
            if val and val not in seen:
                seen.add(val)
                unique.append(item)
        return unique
