"""
ArogyaGPT - User Schemas
Pydantic v2 schemas for user profile read/update operations.
"""

from datetime import datetime
from typing import Optional

from pydantic import EmailStr, Field

from app.schemas.base import BaseSchema
from app.core.constants import SupportedLanguage


class UpdateProfileRequest(BaseSchema):
    """Request body for PUT /api/v1/users/me"""

    full_name: Optional[str] = Field(default=None, min_length=2, max_length=255)
    phone_number: Optional[str] = Field(default=None, max_length=20)
    gender: Optional[str] = Field(default=None, pattern="^(male|female|other)$")
    bio: Optional[str] = Field(default=None, max_length=1000)
    preferred_language: Optional[str] = Field(
        default=None,
        description="ISO 639-1 language code (e.g., 'en', 'hi', 'ta')"
    )
    avatar_url: Optional[str] = Field(default=None, max_length=500)
    specialization: Optional[str] = Field(default=None, max_length=100)
    medical_registration_number: Optional[str] = Field(default=None, max_length=100)


class UserSummaryResponse(BaseSchema):
    """Compact user representation for listings."""

    id: str
    email: str
    full_name: str
    role: str
    is_active: bool
    is_email_verified: bool
    preferred_language: str
    created_at: datetime


class UserDetailResponse(BaseSchema):
    """Full user profile for admin or self-access."""

    id: str
    email: str
    full_name: str
    role: str
    is_active: bool
    is_email_verified: bool
    is_superuser: bool
    preferred_language: str
    phone_number: Optional[str]
    gender: Optional[str]
    avatar_url: Optional[str]
    bio: Optional[str]
    specialization: Optional[str]
    medical_registration_number: Optional[str]
    last_login_at: Optional[datetime]
    failed_login_attempts: int
    created_at: datetime
    updated_at: datetime


class AdminUpdateUserRequest(BaseSchema):
    """Admin-only: update any field on any user."""

    is_active: Optional[bool] = None
    is_email_verified: Optional[bool] = None
    role: Optional[str] = None
    is_superuser: Optional[bool] = None
