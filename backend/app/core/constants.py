"""
ArogyaGPT - Application Constants
Centralized definitions for enums, status codes, messages, and limits.
"""

from enum import Enum


# ==============================================================================
# User Roles
# ==============================================================================

class UserRole(str, Enum):
    PATIENT = "patient"
    DOCTOR = "doctor"
    ADMIN = "admin"


# ==============================================================================
# Report / File Status
# ==============================================================================

class ReportStatus(str, Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"
    ARCHIVED = "archived"


class FileType(str, Enum):
    PDF = "pdf"
    PNG = "png"
    JPG = "jpg"
    JPEG = "jpeg"


# ==============================================================================
# AI Pipeline Stages
# ==============================================================================

class PipelineStage(str, Enum):
    UPLOADED = "uploaded"
    OCR_PROCESSING = "ocr_processing"
    OCR_COMPLETED = "ocr_completed"
    TEXT_CLEANING = "text_cleaning"
    ENTITY_EXTRACTION = "entity_extraction"
    DISEASE_DETECTION = "disease_detection"
    ABNORMALITY_DETECTION = "abnormality_detection"
    LLM_SIMPLIFICATION = "llm_simplification"
    TRANSLATION = "translation"
    VOICE_GENERATION = "voice_generation"
    RAG_INDEXING = "rag_indexing"
    COMPLETED = "completed"
    FAILED = "failed"


# ==============================================================================
# Abnormality Types
# ==============================================================================

class AbnormalityType(str, Enum):
    HIGH = "high"
    LOW = "low"
    CRITICAL_HIGH = "critical_high"
    CRITICAL_LOW = "critical_low"
    NORMAL = "normal"
    BORDERLINE = "borderline"
    UNKNOWN = "unknown"


# ==============================================================================
# Supported Languages
# ==============================================================================

class SupportedLanguage(str, Enum):
    ENGLISH = "en"
    HINDI = "hi"
    TAMIL = "ta"
    TELUGU = "te"
    KANNADA = "kn"
    MALAYALAM = "ml"
    MARATHI = "mr"
    BENGALI = "bn"
    GUJARATI = "gu"
    PUNJABI = "pa"
    ODIA = "or"
    URDU = "ur"


LANGUAGE_NAMES: dict[str, str] = {
    "en": "English",
    "hi": "Hindi",
    "ta": "Tamil",
    "te": "Telugu",
    "kn": "Kannada",
    "ml": "Malayalam",
    "mr": "Marathi",
    "bn": "Bengali",
    "gu": "Gujarati",
    "pa": "Punjabi",
    "or": "Odia",
    "ur": "Urdu",
}


# ==============================================================================
# Chat Message Types
# ==============================================================================

class MessageRole(str, Enum):
    USER = "user"
    ASSISTANT = "assistant"
    SYSTEM = "system"


# ==============================================================================
# Voice Generation
# ==============================================================================

class TTSProvider(str, Enum):
    GTTS = "gtts"
    PYTTSX3 = "pyttsx3"
    AZURE = "azure"
    GOOGLE = "google"


# ==============================================================================
# Notification Types
# ==============================================================================

class NotificationType(str, Enum):
    EMAIL_VERIFICATION = "email_verification"
    PASSWORD_RESET = "password_reset"
    REPORT_READY = "report_ready"
    REPORT_FAILED = "report_failed"
    GENERAL = "general"


# ==============================================================================
# API Response Messages
# ==============================================================================

class APIMessage:
    # Auth
    REGISTER_SUCCESS = "Account created successfully. Please verify your email."
    LOGIN_SUCCESS = "Login successful."
    LOGOUT_SUCCESS = "Logged out successfully."
    TOKEN_REFRESHED = "Token refreshed successfully."
    PASSWORD_CHANGED = "Password changed successfully."
    PASSWORD_RESET_SENT = "Password reset instructions sent to your email."
    PASSWORD_RESET_SUCCESS = "Password reset successfully."
    EMAIL_VERIFIED = "Email verified successfully."
    EMAIL_RESENT = "Verification email resent successfully."

    # User
    USER_FETCHED = "User profile fetched successfully."
    USER_UPDATED = "User profile updated successfully."

    # Reports
    REPORT_UPLOADED = "Medical report uploaded successfully. Processing has started."
    REPORT_FETCHED = "Report fetched successfully."
    REPORTS_LISTED = "Reports retrieved successfully."
    REPORT_DELETED = "Report deleted successfully."
    REPORT_PROCESSING = "Report is currently being processed."

    # Chat
    CHAT_RESPONSE = "Response generated successfully."
    CHAT_SESSION_CREATED = "Chat session created."
    CHAT_HISTORY_FETCHED = "Chat history fetched successfully."

    # Translation
    TRANSLATION_SUCCESS = "Translation completed successfully."

    # Voice
    VOICE_GENERATED = "Audio generated successfully."

    # Generic
    NOT_FOUND = "Resource not found."
    UNAUTHORIZED = "Authentication required."
    FORBIDDEN = "You do not have permission to perform this action."
    VALIDATION_ERROR = "Validation failed."
    INTERNAL_ERROR = "An internal server error occurred. Please try again later."
    OPERATION_SUCCESS = "Operation completed successfully."


# ==============================================================================
# HTTP Status Codes
# ==============================================================================

class HTTPStatus:
    OK = 200
    CREATED = 201
    ACCEPTED = 202
    NO_CONTENT = 204
    BAD_REQUEST = 400
    UNAUTHORIZED = 401
    FORBIDDEN = 403
    NOT_FOUND = 404
    CONFLICT = 409
    UNPROCESSABLE_ENTITY = 422
    TOO_MANY_REQUESTS = 429
    INTERNAL_SERVER_ERROR = 500
    SERVICE_UNAVAILABLE = 503


# ==============================================================================
# Cache TTLs (seconds)
# ==============================================================================

class CacheTTL:
    USER_PROFILE = 300          # 5 minutes
    REPORT_LIST = 120           # 2 minutes
    TRANSLATION = 86400         # 24 hours
    FAISS_INDEX = 600           # 10 minutes
    LLM_RESPONSE = 3600         # 1 hour


# ==============================================================================
# Medical Reference Ranges (for abnormality detection)
# ==============================================================================

CLINICAL_REFERENCE_RANGES: dict[str, dict] = {
    # Hematology
    "hemoglobin": {
        "unit": "g/dL",
        "male": {"low": 13.5, "high": 17.5, "critical_low": 7.0, "critical_high": 20.0},
        "female": {"low": 12.0, "high": 15.5, "critical_low": 7.0, "critical_high": 20.0},
        "general": {"low": 12.0, "high": 17.5, "critical_low": 7.0, "critical_high": 20.0},
    },
    "hematocrit": {
        "unit": "%",
        "male": {"low": 41.0, "high": 53.0, "critical_low": 20.0, "critical_high": 65.0},
        "female": {"low": 36.0, "high": 46.0, "critical_low": 20.0, "critical_high": 65.0},
        "general": {"low": 36.0, "high": 53.0, "critical_low": 20.0, "critical_high": 65.0},
    },
    "wbc": {
        "unit": "10^3/uL",
        "general": {"low": 4.5, "high": 11.0, "critical_low": 2.0, "critical_high": 30.0},
    },
    "platelets": {
        "unit": "10^3/uL",
        "general": {"low": 150.0, "high": 400.0, "critical_low": 50.0, "critical_high": 1000.0},
    },
    # Glucose
    "glucose_fasting": {
        "unit": "mg/dL",
        "general": {"low": 70.0, "high": 100.0, "critical_low": 40.0, "critical_high": 500.0},
    },
    "hba1c": {
        "unit": "%",
        "general": {"low": 4.0, "high": 5.7, "critical_low": 2.0, "critical_high": 14.0},
    },
    # Lipids
    "cholesterol_total": {
        "unit": "mg/dL",
        "general": {"low": 0.0, "high": 200.0, "critical_low": 0.0, "critical_high": 400.0},
    },
    "ldl": {
        "unit": "mg/dL",
        "general": {"low": 0.0, "high": 100.0, "critical_low": 0.0, "critical_high": 300.0},
    },
    "hdl": {
        "unit": "mg/dL",
        "male": {"low": 40.0, "high": 200.0, "critical_low": 20.0, "critical_high": 200.0},
        "female": {"low": 50.0, "high": 200.0, "critical_low": 20.0, "critical_high": 200.0},
        "general": {"low": 40.0, "high": 200.0, "critical_low": 20.0, "critical_high": 200.0},
    },
    "triglycerides": {
        "unit": "mg/dL",
        "general": {"low": 0.0, "high": 150.0, "critical_low": 0.0, "critical_high": 1000.0},
    },
    # Liver
    "alt": {
        "unit": "U/L",
        "general": {"low": 7.0, "high": 56.0, "critical_low": 0.0, "critical_high": 2000.0},
    },
    "ast": {
        "unit": "U/L",
        "general": {"low": 10.0, "high": 40.0, "critical_low": 0.0, "critical_high": 2000.0},
    },
    "bilirubin_total": {
        "unit": "mg/dL",
        "general": {"low": 0.2, "high": 1.2, "critical_low": 0.0, "critical_high": 20.0},
    },
    # Kidney
    "creatinine": {
        "unit": "mg/dL",
        "male": {"low": 0.7, "high": 1.3, "critical_low": 0.0, "critical_high": 15.0},
        "female": {"low": 0.6, "high": 1.1, "critical_low": 0.0, "critical_high": 15.0},
        "general": {"low": 0.6, "high": 1.3, "critical_low": 0.0, "critical_high": 15.0},
    },
    "bun": {
        "unit": "mg/dL",
        "general": {"low": 7.0, "high": 20.0, "critical_low": 0.0, "critical_high": 100.0},
    },
    # Thyroid
    "tsh": {
        "unit": "mIU/L",
        "general": {"low": 0.4, "high": 4.0, "critical_low": 0.01, "critical_high": 100.0},
    },
    "t4_free": {
        "unit": "ng/dL",
        "general": {"low": 0.8, "high": 1.8, "critical_low": 0.0, "critical_high": 10.0},
    },
    # Electrolytes
    "sodium": {
        "unit": "mEq/L",
        "general": {"low": 136.0, "high": 145.0, "critical_low": 120.0, "critical_high": 160.0},
    },
    "potassium": {
        "unit": "mEq/L",
        "general": {"low": 3.5, "high": 5.0, "critical_low": 2.5, "critical_high": 6.5},
    },
}
