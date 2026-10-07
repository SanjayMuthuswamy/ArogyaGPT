"""
ArogyaGPT - User ORM Model
Fully normalized users table with RBAC, soft-delete, and preferences.
"""

from datetime import datetime
from typing import Optional, TYPE_CHECKING

from sqlalchemy import Boolean, DateTime, Enum, Index, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.session import Base
from app.database.base import BaseModelMixin
from app.core.constants import UserRole, SupportedLanguage

if TYPE_CHECKING:
    from app.models.refresh_token import RefreshToken
    from app.models.report import Report
    from app.models.chat import ChatSession
    from app.models.audit import AuditLog


class User(Base, BaseModelMixin):
    """
    Core user account model.

    Attributes:
        email: Unique, verified email address (login identifier).
        hashed_password: bcrypt-hashed password.
        full_name: User's display name.
        phone_number: Optional contact number.
        date_of_birth: Optional for age-specific medical reference ranges.
        gender: 'male' | 'female' | 'other' — used for gendered lab ranges.
        role: RBAC role (patient | doctor | admin).
        is_active: Account can log in.
        is_email_verified: Must be True to access protected routes.
        is_superuser: Bypass all permission checks.
        preferred_language: ISO 639-1 code for report translations.
        avatar_url: Profile picture URL.
        bio: Short personal bio for doctor profiles.
        medical_registration_number: For doctor role validation.
        specialization: Doctor's medical specialization.
    """

    __tablename__ = "users"
    __table_args__ = (
        Index("ix_users_email", "email"),
        Index("ix_users_role", "role"),
        Index("ix_users_is_active", "is_active"),
    )

    # Identity
    email: Mapped[str] = mapped_column(
        String(255), unique=True, nullable=False
    )
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    full_name: Mapped[str] = mapped_column(String(255), nullable=False)
    phone_number: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    date_of_birth: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    gender: Mapped[Optional[str]] = mapped_column(
        String(10), nullable=True  # 'male' | 'female' | 'other'
    )

    # Authorization
    role: Mapped[str] = mapped_column(
        Enum(UserRole, name="user_role_enum", values_callable=lambda e: [x.value for x in e]),
        default=UserRole.PATIENT.value,
        nullable=False,
    )
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    is_email_verified: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    is_superuser: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    # Preferences
    preferred_language: Mapped[str] = mapped_column(
        String(10), default=SupportedLanguage.ENGLISH.value, nullable=False
    )

    # Profile (optional)
    avatar_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    bio: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # Doctor-specific
    medical_registration_number: Mapped[Optional[str]] = mapped_column(
        String(100), nullable=True
    )
    specialization: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)

    # Session tracking
    last_login_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    failed_login_attempts: Mapped[int] = mapped_column(default=0, nullable=False)
    locked_until: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True), nullable=True
    )

    # --- Relationships ---
    refresh_tokens: Mapped[list["RefreshToken"]] = relationship(
        "RefreshToken", back_populates="user", cascade="all, delete-orphan"
    )
    reports: Mapped[list["Report"]] = relationship(
        "Report", back_populates="user", cascade="all, delete-orphan"
    )
    chat_sessions: Mapped[list["ChatSession"]] = relationship(
        "ChatSession", back_populates="user", cascade="all, delete-orphan"
    )
    audit_logs: Mapped[list["AuditLog"]] = relationship(
        "AuditLog", back_populates="user"
    )

    def __repr__(self) -> str:
        return f"<User id={self.id} email={self.email} role={self.role}>"
