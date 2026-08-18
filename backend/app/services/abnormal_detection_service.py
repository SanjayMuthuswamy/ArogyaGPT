"""
ArogyaGPT - Abnormality Detection Service
Hybrid rule engine + LLM validation for detecting abnormal lab values.
Uses clinical reference ranges database from constants.
"""

import re
from typing import Optional

from app.core.constants import CLINICAL_REFERENCE_RANGES, AbnormalityType
from app.core.logging import get_logger

logger = get_logger(__name__)


def _parse_numeric(value: str) -> Optional[float]:
    """Safely parse a string to float, handling ranges and operators."""
    if not value:
        return None
    # Remove operators and extract first number
    cleaned = re.sub(r"[<>≤≥=\s]", "", str(value))
    try:
        return float(cleaned.split("-")[0])
    except (ValueError, IndexError):
        return None


def _classify_abnormality(
    value: float,
    low: float,
    high: float,
    critical_low: float,
    critical_high: float,
) -> tuple[str, str]:
    """
    Classify a lab value against reference ranges.

    Returns:
        Tuple of (abnormality_type, severity).
    """
    if value <= critical_low:
        return AbnormalityType.CRITICAL_LOW.value, "critical"
    elif value >= critical_high:
        return AbnormalityType.CRITICAL_HIGH.value, "critical"
    elif value < low:
        severity = "severe" if value < (low * 0.8) else "moderate"
        return AbnormalityType.LOW.value, severity
    elif value > high:
        severity = "severe" if value > (high * 1.5) else "moderate"
        return AbnormalityType.HIGH.value, severity
    else:
        return AbnormalityType.NORMAL.value, "none"


class AbnormalDetectionService:
    """
    Hybrid abnormality detection engine.

    Step 1: Rule-based check against clinical reference ranges database.
    Step 2: NLP-extracted lab values cross-checked against ranges.
    Step 3: LLM validation for ambiguous cases (if enabled).
    """

    async def analyze(
        self,
        text: str,
        entities: dict,
        patient_gender: str = "general",
    ) -> tuple[list[dict], list[dict]]:
        """
        Analyze a report for abnormal lab values.

        Args:
            text: Cleaned report text.
            entities: NLP-extracted entities (from MedicalNLPService).
            patient_gender: 'male' | 'female' | 'general'.

        Returns:
            Tuple of (lab_results, abnormalities) — lists of dicts ready for ORM insertion.
        """
        lab_results = []
        abnormalities = []

        # Analyze extracted lab values from NLP
        for lab_val in entities.get("lab_values", []):
            test_name = lab_val.get("test", "").strip().lower()
            value_str = lab_val.get("value", "")
            unit = lab_val.get("unit", "")
            numeric_value = _parse_numeric(value_str)

            lab_result = {
                "test_name": lab_val.get("test", "Unknown"),
                "result_value": value_str,
                "numeric_value": numeric_value,
                "unit": unit,
                "is_abnormal": False,
                "abnormality_direction": None,
            }

            # Look up in reference ranges
            matched_range = self._find_reference_range(test_name)

            if matched_range and numeric_value is not None:
                gender_ranges = (
                    matched_range.get(patient_gender)
                    or matched_range.get("general")
                )

                if gender_ranges:
                    lab_result["reference_range"] = (
                        f"{gender_ranges['low']}-{gender_ranges['high']} "
                        f"{matched_range.get('unit', '')}"
                    )

                    ab_type, severity = _classify_abnormality(
                        value=numeric_value,
                        low=gender_ranges["low"],
                        high=gender_ranges["high"],
                        critical_low=gender_ranges.get("critical_low", 0),
                        critical_high=gender_ranges.get("critical_high", 9999),
                    )

                    if ab_type != AbnormalityType.NORMAL.value:
                        lab_result["is_abnormal"] = True
                        lab_result["abnormality_direction"] = (
                            "high" if "high" in ab_type.lower() else "low"
                        )

                        abnormalities.append({
                            "parameter_name": lab_val.get("test", "Unknown"),
                            "parameter_unit": unit or matched_range.get("unit"),
                            "detected_value": value_str,
                            "numeric_value": numeric_value,
                            "reference_range_low": gender_ranges["low"],
                            "reference_range_high": gender_ranges["high"],
                            "reference_range_text": lab_result["reference_range"],
                            "abnormality_type": ab_type,
                            "severity": severity,
                            "clinical_significance": self._get_clinical_significance(
                                test_name, ab_type, severity
                            ),
                            "plain_language_explanation": self._plain_language(
                                lab_val.get("test", "Unknown"), ab_type, numeric_value,
                                gender_ranges["low"], gender_ranges["high"]
                            ),
                            "is_llm_validated": False,
                        })

            lab_results.append(lab_result)

        # Also scan text for explicit abnormality markers
        text_abnormalities = self._scan_text_for_abnormalities(text)
        abnormalities.extend(text_abnormalities)

        logger.info(
            f"Abnormality detection: {len(lab_results)} lab values | "
            f"{len(abnormalities)} abnormalities found"
        )

        return lab_results, abnormalities

    def _find_reference_range(self, test_name: str) -> Optional[dict]:
        """Find matching reference range by fuzzy test name matching."""
        test_lower = test_name.lower()
        for key, ranges in CLINICAL_REFERENCE_RANGES.items():
            if key in test_lower or test_lower in key:
                return ranges
            # Aliased names
            aliases = {
                "hb": "hemoglobin",
                "haemoglobin": "hemoglobin",
                "rbc": "hemoglobin",
                "wbc count": "wbc",
                "blood sugar": "glucose_fasting",
                "fbs": "glucose_fasting",
                "ppbs": "glucose_fasting",
                "tsh level": "tsh",
                "ft4": "t4_free",
                "alt sgpt": "alt",
                "ast sgot": "ast",
                "s.creatinine": "creatinine",
                "blood urea nitrogen": "bun",
                "total bilirubin": "bilirubin_total",
                "cholesterol": "cholesterol_total",
                "triglycerides": "triglycerides",
                "hdl cholesterol": "hdl",
                "ldl cholesterol": "ldl",
                "platelet count": "platelets",
                "plt": "platelets",
                "potassium k": "potassium",
                "sodium na": "sodium",
                "hba1c": "hba1c",
            }
            alias_key = aliases.get(test_lower)
            if alias_key and alias_key in CLINICAL_REFERENCE_RANGES:
                return CLINICAL_REFERENCE_RANGES[alias_key]

        return None

    def _get_clinical_significance(
        self, test_name: str, ab_type: str, severity: str
    ) -> str:
        """Return a brief clinical significance note."""
        significance_map = {
            "hemoglobin": {
                "low": "Low hemoglobin indicates anemia, which can cause fatigue, weakness, and shortness of breath.",
                "high": "Elevated hemoglobin may indicate dehydration or polycythemia.",
                "critical_low": "Critically low hemoglobin requires immediate medical attention.",
            },
            "glucose_fasting": {
                "high": "Elevated fasting blood glucose may indicate pre-diabetes or diabetes mellitus.",
                "low": "Low blood glucose (hypoglycemia) can cause dizziness, sweating, and confusion.",
                "critical_high": "Critically high blood glucose requires emergency medical care.",
                "critical_low": "Severely low blood glucose is a medical emergency.",
            },
            "tsh": {
                "high": "Elevated TSH typically indicates hypothyroidism (underactive thyroid).",
                "low": "Low TSH may indicate hyperthyroidism (overactive thyroid).",
            },
        }

        test_key = None
        for key in significance_map:
            if key in test_name.lower():
                test_key = key
                break

        if test_key:
            direction = "low" if "low" in ab_type else "high"
            return significance_map[test_key].get(
                direction, f"{ab_type.replace('_', ' ').title()} value detected."
            )

        return f"{severity.title()} {ab_type.replace('_', ' ')} value detected."

    def _plain_language(
        self,
        test_name: str,
        ab_type: str,
        value: float,
        low: float,
        high: float,
    ) -> str:
        """Generate simple patient-friendly explanation."""
        direction = "higher" if "high" in ab_type else "lower"
        return (
            f"Your {test_name} level is {value}, which is {direction} than the "
            f"normal range of {low}-{high}. Please discuss this with your doctor."
        )

    def _scan_text_for_abnormalities(self, text: str) -> list[dict]:
        """
        Scan raw text for explicit abnormality keywords as supplemental detection.
        Looks for patterns like "HIGH", "LOW", "ABNORMAL", "H", "L" flags.
        """
        found = []
        patterns = [
            r"([A-Za-z\s]+):\s*(\d+\.?\d*)\s*([A-Za-z/%^]+)?\s*(HIGH|H|ABOVE NORMAL|ELEVATED)",
            r"([A-Za-z\s]+):\s*(\d+\.?\d*)\s*([A-Za-z/%^]+)?\s*(LOW|L|BELOW NORMAL|DECREASED)",
            r"([A-Za-z\s]+):\s*(\d+\.?\d*)\s*([A-Za-z/%^]+)?\s*(CRITICAL|PANIC|ALERT)",
        ]

        for pattern in patterns:
            for match in re.finditer(pattern, text, re.IGNORECASE):
                test_name = match.group(1).strip()
                value_str = match.group(2)
                unit = match.group(3) or ""
                flag = match.group(4).upper()

                if len(test_name) < 60 and len(test_name) > 2:
                    ab_type = (
                        AbnormalityType.CRITICAL_HIGH.value if "CRITICAL" in flag
                        else AbnormalityType.HIGH.value if flag in {"HIGH", "H", "ELEVATED", "ABOVE NORMAL"}
                        else AbnormalityType.LOW.value
                    )
                    found.append({
                        "parameter_name": test_name,
                        "parameter_unit": unit,
                        "detected_value": value_str,
                        "numeric_value": _parse_numeric(value_str),
                        "reference_range_low": None,
                        "reference_range_high": None,
                        "reference_range_text": None,
                        "abnormality_type": ab_type,
                        "severity": "critical" if "CRITICAL" in flag else "moderate",
                        "clinical_significance": f"{flag} flag detected in report.",
                        "plain_language_explanation": (
                            f"Your {test_name} was flagged as {flag} in the report. "
                            "Please consult your doctor."
                        ),
                        "is_llm_validated": False,
                    })

        return found
