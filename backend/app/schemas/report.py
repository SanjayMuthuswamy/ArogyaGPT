"""
ArogyaGPT - Report Schemas
Pydantic v2 models for medical report upload, processing, and results.
"""

from datetime import datetime
from typing import Optional

from pydantic import Field

from app.schemas.base import BaseSchema
from app.core.constants import ReportStatus, PipelineStage, AbnormalityType


# ==============================================================================
# Upload
# ==============================================================================

class ReportUploadMetadata(BaseSchema):
    """Metadata submitted alongside report file upload (as form fields)."""

    title: str = Field(..., min_length=1, max_length=500, description="Report title.")
    description: Optional[str] = Field(default=None, max_length=1000)
    report_type: Optional[str] = Field(
        default=None,
        description="blood_test | xray | mri | ecg | prescription | discharge_summary | other"
    )
    hospital_name: Optional[str] = Field(default=None, max_length=255)
    doctor_name: Optional[str] = Field(default=None, max_length=255)
    report_date: Optional[datetime] = None
    patient_age: Optional[int] = Field(default=None, ge=0, le=150)
    patient_gender: Optional[str] = Field(default=None, pattern="^(male|female|other)$")
    preferred_language: Optional[str] = Field(
        default=None, description="Language for AI simplification output."
    )


class CameraUploadRequest(BaseSchema):
    """Payload for direct Base64 camera image capture upload."""

    image_base64: str = Field(
        ...,
        description="Base64 encoded camera image string (data:image/jpeg;base64,... or raw base64).",
    )
    title: str = Field(default="Camera Capture Report", min_length=1, max_length=500)
    description: Optional[str] = Field(default=None, max_length=1000)
    report_type: Optional[str] = Field(default="prescription")
    hospital_name: Optional[str] = Field(default=None)
    doctor_name: Optional[str] = Field(default=None)
    preferred_language: Optional[str] = Field(default=None)



# ==============================================================================
# Report State
# ==============================================================================

class MedicalTermExplanationRequest(BaseSchema):
    """Request for a patient-friendly explanation of a report finding."""

    term: str = Field(..., min_length=1, max_length=300)
    language_code: str = Field(default="en", min_length=2, max_length=10)


class ReportFileResponse(BaseSchema):
    """File metadata returned in report responses."""

    id: str
    original_filename: str
    file_type: str
    file_size_bytes: int
    mime_type: str
    page_count: Optional[int]
    is_primary: bool
    created_at: datetime


class AbnormalityResponse(BaseSchema):
    """A single detected abnormality."""

    id: str
    parameter_name: str
    parameter_unit: Optional[str]
    detected_value: str
    numeric_value: Optional[float]
    reference_range_low: Optional[float]
    reference_range_high: Optional[float]
    reference_range_text: Optional[str]
    abnormality_type: str
    severity: str
    clinical_significance: Optional[str]
    plain_language_explanation: Optional[str]
    is_llm_validated: bool


class DiagnosisResponse(BaseSchema):
    """A detected disease/condition."""

    id: str
    condition_name: str
    icd10_code: Optional[str]
    confidence_score: Optional[float]
    source: str
    plain_language: Optional[str]


class MedicineResponse(BaseSchema):
    """An extracted medicine entry."""

    id: str
    medicine_name: str
    generic_name: Optional[str]
    dosage: Optional[str]
    frequency: Optional[str]
    duration: Optional[str]
    route: Optional[str]
    purpose: Optional[str]
    plain_language: Optional[str]


class LabResultResponse(BaseSchema):
    """A single lab test result."""

    id: str
    test_name: str
    test_code: Optional[str]
    result_value: str
    numeric_value: Optional[float]
    unit: Optional[str]
    reference_range: Optional[str]
    is_abnormal: bool
    abnormality_direction: Optional[str]
    category: Optional[str]


class ExtractedTextResponse(BaseSchema):
    """OCR-extracted text block."""

    id: str
    raw_text: str
    cleaned_text: Optional[str]
    ocr_provider: str
    ocr_confidence: Optional[float]
    language_detected: Optional[str]
    page_number: Optional[int]
    word_count: Optional[int]


class TranslationResponse(BaseSchema):
    """A translated report."""

    id: str
    language_code: str
    language_name: str
    translated_text: str
    translation_provider: str
    created_at: datetime


# ==============================================================================
# Report Detail
# ==============================================================================

class ReportSummaryResponse(BaseSchema):
    """Compact report card for listing endpoints."""

    id: str
    title: str
    report_type: Optional[str]
    status: str
    pipeline_stage: str
    risk_level: Optional[str]
    hospital_name: Optional[str]
    report_date: Optional[datetime]
    version: int
    created_at: datetime
    updated_at: datetime
    file_count: int = 0


class ReportDetailResponse(BaseSchema):
    """Full report detail with all AI processing results."""

    id: str
    user_id: str
    title: str
    description: Optional[str]
    report_type: Optional[str]
    hospital_name: Optional[str]
    doctor_name: Optional[str]
    report_date: Optional[datetime]
    patient_age: Optional[int]
    patient_gender: Optional[str]

    status: str
    pipeline_stage: str
    processing_error: Optional[str]
    processing_started_at: Optional[datetime]
    processing_completed_at: Optional[datetime]

    simplified_text: Optional[str]
    summary: Optional[str]
    risk_level: Optional[str]

    version: int
    created_at: datetime
    updated_at: datetime

    files: list[ReportFileResponse] = []
    abnormalities: list[AbnormalityResponse] = []
    diagnoses: list[DiagnosisResponse] = []
    medicines: list[MedicineResponse] = []
    lab_results: list[LabResultResponse] = []
    translations: list[TranslationResponse] = []


# ==============================================================================
# Chat
# ==============================================================================

class ChatMessageResponse(BaseSchema):
    """A single chat message."""

    id: str
    session_id: str
    role: str
    content: str
    source_chunks: Optional[list] = None
    model_used: Optional[str]
    tokens_used: Optional[int]
    latency_ms: Optional[float]
    is_helpful: Optional[bool]
    created_at: datetime


class ChatSessionResponse(BaseSchema):
    """Chat session summary."""

    id: str
    report_id: Optional[str]
    title: str
    is_active: bool
    message_count: int
    language_code: str
    created_at: datetime
    updated_at: datetime


class AskQuestionRequest(BaseSchema):
    """Request body for POST /api/v1/chat/ask"""

    question: str = Field(..., min_length=1, max_length=2000, description="User question.")
    session_id: Optional[str] = Field(
        default=None, description="Existing session ID. Omit to create a new session."
    )
    report_id: Optional[str] = Field(
        default=None, description="Report to query against."
    )
    language_code: str = Field(default="en", description="Response language.")


class AskQuestionResponse(BaseSchema):
    """Response from the RAG chat endpoint."""

    answer: str
    session_id: str
    message_id: str
    source_chunks: list[dict] = []
    model_used: str
    tokens_used: Optional[int]
    latency_ms: Optional[float]


# ==============================================================================
# Translation
# ==============================================================================

class TranslateRequest(BaseSchema):
    """Request body for translating report content."""

    report_id: str
    target_language: str = Field(..., description="ISO 639-1 language code, e.g. 'hi', 'ta'")
    text_to_translate: Optional[str] = Field(
        default=None, description="Custom text to translate. Uses simplified_text if omitted."
    )


# ==============================================================================
# Voice
# ==============================================================================

class VoiceGenerateRequest(BaseSchema):
    """Request body for POST /api/v1/voice/generate"""

    text: str = Field(..., min_length=1, max_length=5000)
    language_code: str = Field(default="en")
    report_id: Optional[str] = None


class VoiceResponse(BaseSchema):
    """Voice generation result."""

    id: str
    audio_file_url: Optional[str]
    audio_duration_seconds: Optional[float]
    language_code: str
    tts_provider: str
    status: str
    created_at: datetime
