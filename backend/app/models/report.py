"""
ArogyaGPT - Medical Report ORM Models
Complete normalized schema for report storage, processing, and results.
"""

from datetime import datetime
from typing import Optional, TYPE_CHECKING

from sqlalchemy import (
    Boolean, DateTime, Enum, Float, ForeignKey, Index,
    Integer, String, Text, JSON
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.session import Base
from app.database.base import BaseModelMixin, UUIDMixin, TimestampMixin
from app.core.constants import ReportStatus, FileType, PipelineStage, AbnormalityType

if TYPE_CHECKING:
    from app.models.user import User
    from app.models.chat import ChatSession


class Report(Base, BaseModelMixin):
    """
    Master medical report record.
    One report can have multiple files and versions.
    """

    __tablename__ = "reports"
    __table_args__ = (
        Index("ix_reports_user_id", "user_id"),
        Index("ix_reports_status", "status"),
        Index("ix_reports_created_at", "created_at"),
    )

    user_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )

    # Metadata
    title: Mapped[str] = mapped_column(String(500), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    report_type: Mapped[Optional[str]] = mapped_column(
        String(100), nullable=True  # "blood_test" | "xray" | "mri" | "prescription" etc.
    )
    hospital_name: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    doctor_name: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    report_date: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    patient_age: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    patient_gender: Mapped[Optional[str]] = mapped_column(String(10), nullable=True)

    # Processing state
    status: Mapped[str] = mapped_column(
        String(50), default=ReportStatus.PENDING.value, nullable=False
    )
    pipeline_stage: Mapped[str] = mapped_column(
        String(50), default=PipelineStage.UPLOADED.value, nullable=False
    )
    processing_error: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    processing_started_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    processing_completed_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True), nullable=True
    )

    # Celery task tracking
    celery_task_id: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)

    # AI results
    simplified_text: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    simplified_text_hindi: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    summary: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    risk_level: Mapped[Optional[str]] = mapped_column(
        String(20), nullable=True  # "low" | "medium" | "high" | "critical"
    )
    ai_metadata: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)

    # Version tracking
    version: Mapped[int] = mapped_column(Integer, default=1, nullable=False)

    # --- Relationships ---
    user: Mapped["User"] = relationship("User", back_populates="reports")
    files: Mapped[list["ReportFile"]] = relationship(
        "ReportFile", back_populates="report", cascade="all, delete-orphan"
    )
    extracted_texts: Mapped[list["ExtractedText"]] = relationship(
        "ExtractedText", back_populates="report", cascade="all, delete-orphan"
    )
    chunks: Mapped[list["ReportChunk"]] = relationship(
        "ReportChunk", back_populates="report", cascade="all, delete-orphan"
    )
    abnormalities: Mapped[list["Abnormality"]] = relationship(
        "Abnormality", back_populates="report", cascade="all, delete-orphan"
    )
    diagnoses: Mapped[list["Diagnosis"]] = relationship(
        "Diagnosis", back_populates="report", cascade="all, delete-orphan"
    )
    medicines: Mapped[list["Medicine"]] = relationship(
        "Medicine", back_populates="report", cascade="all, delete-orphan"
    )
    lab_results: Mapped[list["LabResult"]] = relationship(
        "LabResult", back_populates="report", cascade="all, delete-orphan"
    )
    translations: Mapped[list["Translation"]] = relationship(
        "Translation", back_populates="report", cascade="all, delete-orphan"
    )
    voice_requests: Mapped[list["VoiceRequest"]] = relationship(
        "VoiceRequest", back_populates="report", cascade="all, delete-orphan"
    )
    chat_sessions: Mapped[list["ChatSession"]] = relationship(
        "ChatSession", back_populates="report"
    )
    versions: Mapped[list["ReportVersion"]] = relationship(
        "ReportVersion", back_populates="report", cascade="all, delete-orphan"
    )

    def __repr__(self) -> str:
        return f"<Report id={self.id} title={self.title!r} status={self.status}>"


class ReportFile(Base, UUIDMixin, TimestampMixin):
    """Individual file associated with a report (PDF, image, etc.)."""

    __tablename__ = "report_files"
    __table_args__ = (Index("ix_report_files_report_id", "report_id"),)

    report_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("reports.id", ondelete="CASCADE"), nullable=False
    )
    original_filename: Mapped[str] = mapped_column(String(500), nullable=False)
    stored_filename: Mapped[str] = mapped_column(String(500), nullable=False)
    file_path: Mapped[str] = mapped_column(String(1000), nullable=False)
    file_url: Mapped[Optional[str]] = mapped_column(String(1000), nullable=True)
    file_type: Mapped[str] = mapped_column(String(10), nullable=False)  # pdf | png | jpg
    file_size_bytes: Mapped[int] = mapped_column(Integer, nullable=False)
    mime_type: Mapped[str] = mapped_column(String(100), nullable=False)
    checksum_md5: Mapped[Optional[str]] = mapped_column(String(32), nullable=True)
    is_primary: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    page_count: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)

    report: Mapped["Report"] = relationship("Report", back_populates="files")


class ReportVersion(Base, UUIDMixin, TimestampMixin):
    """Snapshot of a report at a specific version for audit/history."""

    __tablename__ = "report_versions"
    __table_args__ = (Index("ix_report_versions_report_id", "report_id"),)

    report_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("reports.id", ondelete="CASCADE"), nullable=False
    )
    version_number: Mapped[int] = mapped_column(Integer, nullable=False)
    snapshot_data: Mapped[dict] = mapped_column(JSON, nullable=False)
    changed_by_user_id: Mapped[Optional[str]] = mapped_column(String(36), nullable=True)
    change_reason: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)

    report: Mapped["Report"] = relationship("Report", back_populates="versions")


class ExtractedText(Base, UUIDMixin, TimestampMixin):
    """Raw OCR-extracted text from a report file."""

    __tablename__ = "extracted_texts"
    __table_args__ = (Index("ix_extracted_texts_report_id", "report_id"),)

    report_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("reports.id", ondelete="CASCADE"), nullable=False
    )
    file_id: Mapped[Optional[str]] = mapped_column(String(36), nullable=True)
    raw_text: Mapped[str] = mapped_column(Text, nullable=False)
    cleaned_text: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    ocr_provider: Mapped[str] = mapped_column(String(50), nullable=False, default="tesseract")
    ocr_confidence: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    language_detected: Mapped[Optional[str]] = mapped_column(String(10), nullable=True)
    page_number: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    word_count: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)

    report: Mapped["Report"] = relationship("Report", back_populates="extracted_texts")


class ReportChunk(Base, UUIDMixin, TimestampMixin):
    """Text chunks for RAG (Retrieval-Augmented Generation) indexing."""

    __tablename__ = "report_chunks"
    __table_args__ = (
        Index("ix_report_chunks_report_id", "report_id"),
        Index("ix_report_chunks_chunk_index", "chunk_index"),
    )

    report_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("reports.id", ondelete="CASCADE"), nullable=False
    )
    chunk_index: Mapped[int] = mapped_column(Integer, nullable=False)
    chunk_text: Mapped[str] = mapped_column(Text, nullable=False)
    chunk_size: Mapped[int] = mapped_column(Integer, nullable=False)  # token count
    faiss_vector_id: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    embedding_model: Mapped[str] = mapped_column(String(200), nullable=False)

    report: Mapped["Report"] = relationship("Report", back_populates="chunks")


class Abnormality(Base, UUIDMixin, TimestampMixin):
    """Detected abnormal laboratory values or clinical findings."""

    __tablename__ = "abnormalities"
    __table_args__ = (Index("ix_abnormalities_report_id", "report_id"),)

    report_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("reports.id", ondelete="CASCADE"), nullable=False
    )
    parameter_name: Mapped[str] = mapped_column(String(255), nullable=False)
    parameter_unit: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    detected_value: Mapped[str] = mapped_column(String(100), nullable=False)
    numeric_value: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    reference_range_low: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    reference_range_high: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    reference_range_text: Mapped[Optional[str]] = mapped_column(String(200), nullable=True)
    abnormality_type: Mapped[str] = mapped_column(
        String(20), default=AbnormalityType.UNKNOWN.value, nullable=False
    )
    severity: Mapped[str] = mapped_column(
        String(20), default="moderate", nullable=False  # mild | moderate | severe | critical
    )
    clinical_significance: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    plain_language_explanation: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    is_llm_validated: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    report: Mapped["Report"] = relationship("Report", back_populates="abnormalities")


class Diagnosis(Base, UUIDMixin, TimestampMixin):
    """Diseases and conditions detected from the report."""

    __tablename__ = "diagnoses"
    __table_args__ = (Index("ix_diagnoses_report_id", "report_id"),)

    report_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("reports.id", ondelete="CASCADE"), nullable=False
    )
    condition_name: Mapped[str] = mapped_column(String(255), nullable=False)
    icd10_code: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    confidence_score: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    source: Mapped[str] = mapped_column(
        String(50), nullable=False, default="llm"  # "llm" | "nlp" | "rule"
    )
    plain_language: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    report: Mapped["Report"] = relationship("Report", back_populates="diagnoses")


class Medicine(Base, UUIDMixin, TimestampMixin):
    """Medicines and drugs extracted from the report or prescription."""

    __tablename__ = "medicines"
    __table_args__ = (Index("ix_medicines_report_id", "report_id"),)

    report_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("reports.id", ondelete="CASCADE"), nullable=False
    )
    medicine_name: Mapped[str] = mapped_column(String(255), nullable=False)
    generic_name: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    dosage: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    frequency: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    duration: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    route: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    purpose: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    plain_language: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    report: Mapped["Report"] = relationship("Report", back_populates="medicines")


class LabResult(Base, UUIDMixin, TimestampMixin):
    """Individual laboratory test results extracted from the report."""

    __tablename__ = "lab_results"
    __table_args__ = (Index("ix_lab_results_report_id", "report_id"),)

    report_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("reports.id", ondelete="CASCADE"), nullable=False
    )
    test_name: Mapped[str] = mapped_column(String(255), nullable=False)
    test_code: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    result_value: Mapped[str] = mapped_column(String(100), nullable=False)
    numeric_value: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    unit: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    reference_range: Mapped[Optional[str]] = mapped_column(String(200), nullable=True)
    is_abnormal: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    abnormality_direction: Mapped[Optional[str]] = mapped_column(
        String(10), nullable=True  # "high" | "low"
    )
    category: Mapped[Optional[str]] = mapped_column(
        String(100), nullable=True  # "hematology" | "biochemistry" | "lipids" etc.
    )

    report: Mapped["Report"] = relationship("Report", back_populates="lab_results")


class Translation(Base, UUIDMixin, TimestampMixin):
    """Translated versions of simplified report text."""

    __tablename__ = "translations"
    __table_args__ = (
        Index("ix_translations_report_id", "report_id"),
        Index("ix_translations_language_code", "language_code"),
    )

    report_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("reports.id", ondelete="CASCADE"), nullable=False
    )
    language_code: Mapped[str] = mapped_column(String(10), nullable=False)
    language_name: Mapped[str] = mapped_column(String(50), nullable=False)
    original_text: Mapped[str] = mapped_column(Text, nullable=False)
    translated_text: Mapped[str] = mapped_column(Text, nullable=False)
    translation_provider: Mapped[str] = mapped_column(
        String(50), nullable=False, default="deep_translator"
    )
    character_count: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)

    report: Mapped["Report"] = relationship("Report", back_populates="translations")


class VoiceRequest(Base, UUIDMixin, TimestampMixin):
    """Audio generation requests for text-to-speech conversion."""

    __tablename__ = "voice_requests"
    __table_args__ = (Index("ix_voice_requests_report_id", "report_id"),)

    report_id: Mapped[Optional[str]] = mapped_column(
        String(36), ForeignKey("reports.id", ondelete="CASCADE"), nullable=True
    )
    user_id: Mapped[str] = mapped_column(String(36), nullable=False)
    input_text: Mapped[str] = mapped_column(Text, nullable=False)
    language_code: Mapped[str] = mapped_column(String(10), nullable=False, default="en")
    tts_provider: Mapped[str] = mapped_column(String(50), nullable=False, default="gtts")
    audio_file_path: Mapped[Optional[str]] = mapped_column(String(1000), nullable=True)
    audio_file_url: Mapped[Optional[str]] = mapped_column(String(1000), nullable=True)
    audio_duration_seconds: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    file_size_bytes: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    status: Mapped[str] = mapped_column(String(20), default="pending", nullable=False)

    report: Mapped[Optional["Report"]] = relationship("Report", back_populates="voice_requests")
