"""
ArogyaGPT - Authentication Schemas
Pydantic v2 models for all auth-related request/response bodies.
"""

import re
from datetime import datetime
from typing import Optional

from pydantic import EmailStr, Field, field_validator, model_validator

from app.schemas.base import BaseSchema
from app.core.config import settings
from app.core.constants import UserRole


# ==============================================================================
# Registration
# ==============================================================================

class RegisterRequest(BaseSchema):
    """Request body for POST /api/v1/auth/register"""

    full_name: str = Field(
        ..., min_length=2, max_length=255, description="Full legal name."
    )
    email: EmailStr = Field(..., description="Valid email address.")
    password: str = Field(
        ...,
        min_length=settings.PASSWORD_MIN_LENGTH,
        max_length=settings.PASSWORD_MAX_LENGTH,
        description="Strong password.",
    )
    confirm_password: str = Field(..., description="Must match password.")
    role: UserRole = Field(default=UserRole.PATIENT, description="Account role.")
    preferred_language: str = Field(default="en", description="ISO 639-1 language code.")
    phone_number: Optional[str] = Field(default=None, max_length=20)
    gender: Optional[str] = Field(default=None, pattern="^(male|female|other)$")

    @field_validator("password")
    @classmethod
    def validate_password_strength(cls, v: str) -> str:
        errors = []
        if not re.search(r"[A-Z]", v):
            errors.append("Must contain at least one uppercase letter.")
        if not re.search(r"[a-z]", v):
            errors.append("Must contain at least one lowercase letter.")
        if not re.search(r"\d", v):
            errors.append("Must contain at least one digit.")
        if not re.search(r"[!@#$%^&*()_+\-=\[\]{}|;':\",./<>?]", v):
            errors.append("Must contain at least one special character.")
        if errors:
            raise ValueError(" ".join(errors))
        return v

    @model_validator(mode="after")
    def passwords_must_match(self) -> "RegisterRequest":
        if self.password != self.confirm_password:
            raise ValueError("Passwords do not match.")
        return self

    @field_validator("email")
    @classmethod
    def lowercase_email(cls, v: str) -> str:
        return v.lower().strip()


class RegisterResponse(BaseSchema):
    """Response body for successful registration."""

    id: str
    email: str
    full_name: str
    role: str
    is_email_verified: bool
    created_at: datetime


# ==============================================================================
# Login
# ==============================================================================

class LoginRequest(BaseSchema):
    """Request body for POST /api/v1/auth/login"""

    email: EmailStr
    password: str = Field(..., min_length=1)

    @field_validator("email")
    @classmethod
    def lowercase_email(cls, v: str) -> str:
        return v.lower().strip()


class TokenResponse(BaseSchema):
    """JWT token pair returned after successful login."""

    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int  # Access token TTL in seconds


class LoginResponse(BaseSchema):
    """Full login response with tokens and user profile."""

    tokens: TokenResponse
    user: "UserProfileResponse"


# ==============================================================================
# Token Refresh
# ==============================================================================

class RefreshTokenRequest(BaseSchema):
    """Request body for POST /api/v1/auth/refresh"""

    refresh_token: str


# ==============================================================================
# Logout
# ==============================================================================

class LogoutRequest(BaseSchema):
    """Request body for POST /api/v1/auth/logout"""

    refresh_token: Optional[str] = Field(
        default=None, description="Refresh token to revoke (optional)."
    )


# ==============================================================================
# Password Management
# ==============================================================================

class ChangePasswordRequest(BaseSchema):
    """Request body for PUT /api/v1/auth/change-password"""

    current_password: str = Field(..., min_length=1)
    new_password: str = Field(
        ...,
        min_length=settings.PASSWORD_MIN_LENGTH,
        max_length=settings.PASSWORD_MAX_LENGTH,
    )
    confirm_new_password: str

    @field_validator("new_password")
    @classmethod
    def validate_password_strength(cls, v: str) -> str:
        errors = []
        if not re.search(r"[A-Z]", v):
            errors.append("Must contain at least one uppercase letter.")
        if not re.search(r"[a-z]", v):
            errors.append("Must contain at least one lowercase letter.")
        if not re.search(r"\d", v):
            errors.append("Must contain at least one digit.")
        if not re.search(r"[!@#$%^&*()_+\-=\[\]{}|;':\",./<>?]", v):
            errors.append("Must contain at least one special character.")
        if errors:
            raise ValueError(" ".join(errors))
        return v

    @model_validator(mode="after")
    def passwords_must_match(self) -> "ChangePasswordRequest":
        if self.new_password != self.confirm_new_password:
            raise ValueError("New passwords do not match.")
        if self.current_password == self.new_password:
            raise ValueError("New password must be different from current password.")
        return self


class ForgotPasswordRequest(BaseSchema):
    """Request body for POST /api/v1/auth/forgot-password"""

    email: EmailStr

    @field_validator("email")
    @classmethod
    def lowercase_email(cls, v: str) -> str:
        return v.lower().strip()


class ResetPasswordRequest(BaseSchema):
    """Request body for POST /api/v1/auth/reset-password"""

    token: str = Field(..., description="Password reset token received via email.")
    new_password: str = Field(
        ...,
        min_length=settings.PASSWORD_MIN_LENGTH,
        max_length=settings.PASSWORD_MAX_LENGTH,
    )
    confirm_new_password: str

    @model_validator(mode="after")
    def passwords_must_match(self) -> "ResetPasswordRequest":
        if self.new_password != self.confirm_new_password:
            raise ValueError("Passwords do not match.")
        return self


class ResendVerificationRequest(BaseSchema):
    """Request body for POST /api/v1/auth/resend-verification"""

    email: EmailStr

    @field_validator("email")
    @classmethod
    def lowercase_email(cls, v: str) -> str:
        return v.lower().strip()


# ==============================================================================
# User Profile (used by /auth/me)
# ==============================================================================

class UserProfileResponse(BaseSchema):
    """Public user profile returned from /auth/me and in login response."""

    id: str
    email: str
    full_name: str
    role: str
    is_active: bool
    is_email_verified: bool
    preferred_language: str
    phone_number: Optional[str]
    gender: Optional[str]
    avatar_url: Optional[str]
    bio: Optional[str]
    specialization: Optional[str]
    medical_registration_number: Optional[str]
    last_login_at: Optional[datetime]
    created_at: datetime
    updated_at: datetime
