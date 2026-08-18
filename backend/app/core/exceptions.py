"""
ArogyaGPT - Custom Exception Hierarchy
Typed, structured exceptions that map to HTTP responses.
"""

from typing import Any, Optional


class ArogyaGPTException(Exception):
    """Base exception for all ArogyaGPT application errors."""

    def __init__(
        self,
        message: str = "An application error occurred.",
        status_code: int = 500,
        errors: Optional[dict[str, Any]] = None,
        headers: Optional[dict[str, str]] = None,
    ) -> None:
        self.message = message
        self.status_code = status_code
        self.errors = errors or {}
        self.headers = headers or {}
        super().__init__(self.message)


# ==============================================================================
# Authentication Exceptions
# ==============================================================================

class AuthenticationError(ArogyaGPTException):
    """Raised when authentication credentials are missing or invalid."""

    def __init__(self, message: str = "Authentication required.", errors: Optional[dict] = None) -> None:
        super().__init__(
            message=message,
            status_code=401,
            errors=errors,
            headers={"WWW-Authenticate": "Bearer"},
        )


class InvalidCredentialsError(AuthenticationError):
    """Raised when email/password combination is incorrect."""

    def __init__(self) -> None:
        super().__init__(message="Invalid email or password.")


class TokenExpiredError(AuthenticationError):
    """Raised when a JWT token has expired."""

    def __init__(self) -> None:
        super().__init__(message="Token has expired. Please login again.")


class TokenInvalidError(AuthenticationError):
    """Raised when a JWT token is malformed or tampered with."""

    def __init__(self) -> None:
        super().__init__(message="Invalid or malformed token.")


class TokenBlacklistedError(AuthenticationError):
    """Raised when a token has been explicitly invalidated (logout)."""

    def __init__(self) -> None:
        super().__init__(message="Token has been revoked. Please login again.")


class EmailNotVerifiedError(AuthenticationError):
    """Raised when a user tries to login before verifying their email."""

    def __init__(self) -> None:
        super().__init__(message="Email address not verified. Please check your inbox.")


# ==============================================================================
# Authorization Exceptions
# ==============================================================================

class PermissionDeniedError(ArogyaGPTException):
    """Raised when an authenticated user lacks required permissions."""

    def __init__(self, message: str = "You do not have permission to perform this action.") -> None:
        super().__init__(message=message, status_code=403)


class InsufficientRoleError(PermissionDeniedError):
    """Raised when a user's role is insufficient for the requested action."""

    def __init__(self, required_role: str) -> None:
        super().__init__(message=f"This action requires '{required_role}' role or higher.")


# ==============================================================================
# Resource Exceptions
# ==============================================================================

class ResourceNotFoundError(ArogyaGPTException):
    """Raised when a requested resource does not exist."""

    def __init__(self, resource: str = "Resource", identifier: Optional[Any] = None) -> None:
        msg = f"{resource} not found."
        if identifier:
            msg = f"{resource} with identifier '{identifier}' not found."
        super().__init__(message=msg, status_code=404)


class UserNotFoundError(ResourceNotFoundError):
    def __init__(self, identifier: Optional[Any] = None) -> None:
        super().__init__(resource="User", identifier=identifier)


class ReportNotFoundError(ResourceNotFoundError):
    def __init__(self, identifier: Optional[Any] = None) -> None:
        super().__init__(resource="Medical report", identifier=identifier)


# ==============================================================================
# Conflict Exceptions
# ==============================================================================

class ResourceConflictError(ArogyaGPTException):
    """Raised when a resource already exists (duplicate)."""

    def __init__(self, message: str = "Resource already exists.") -> None:
        super().__init__(message=message, status_code=409)


class EmailAlreadyExistsError(ResourceConflictError):
    def __init__(self) -> None:
        super().__init__(message="An account with this email address already exists.")


# ==============================================================================
# Validation Exceptions
# ==============================================================================

class ValidationError(ArogyaGPTException):
    """Raised when input data fails business-rule validation."""

    def __init__(
        self,
        message: str = "Validation failed.",
        errors: Optional[dict[str, Any]] = None,
    ) -> None:
        super().__init__(message=message, status_code=422, errors=errors)


class WeakPasswordError(ValidationError):
    def __init__(self) -> None:
        super().__init__(
            message="Password does not meet security requirements.",
            errors={
                "password": [
                    "Must be at least 8 characters long.",
                    "Must contain uppercase and lowercase letters.",
                    "Must contain at least one digit.",
                    "Must contain at least one special character.",
                ]
            },
        )


# ==============================================================================
# File / Upload Exceptions
# ==============================================================================

class FileUploadError(ArogyaGPTException):
    """Raised when a file upload fails validation or processing."""

    def __init__(self, message: str = "File upload failed.") -> None:
        super().__init__(message=message, status_code=400)


class UnsupportedFileTypeError(FileUploadError):
    def __init__(self, file_type: str, allowed: list[str]) -> None:
        super().__init__(
            message=f"File type '{file_type}' is not supported. Allowed types: {', '.join(allowed)}."
        )


class FileTooLargeError(FileUploadError):
    def __init__(self, max_size_mb: int) -> None:
        super().__init__(message=f"File exceeds maximum allowed size of {max_size_mb} MB.")


# ==============================================================================
# Service Exceptions
# ==============================================================================

class OCRProcessingError(ArogyaGPTException):
    """Raised when OCR text extraction fails."""

    def __init__(self, message: str = "OCR processing failed for the uploaded document.") -> None:
        super().__init__(message=message, status_code=500)


class LLMServiceError(ArogyaGPTException):
    """Raised when the LLM API call fails."""

    def __init__(self, message: str = "AI language model service is unavailable.") -> None:
        super().__init__(message=message, status_code=503)


class TranslationError(ArogyaGPTException):
    """Raised when translation fails."""

    def __init__(self, message: str = "Translation service failed.") -> None:
        super().__init__(message=message, status_code=503)


class VoiceGenerationError(ArogyaGPTException):
    """Raised when TTS voice generation fails."""

    def __init__(self, message: str = "Voice generation failed.") -> None:
        super().__init__(message=message, status_code=503)


class RAGIndexingError(ArogyaGPTException):
    """Raised when FAISS indexing or retrieval fails."""

    def __init__(self, message: str = "RAG retrieval system encountered an error.") -> None:
        super().__init__(message=message, status_code=503)


class StorageError(ArogyaGPTException):
    """Raised when file storage (local or S3) fails."""

    def __init__(self, message: str = "File storage operation failed.") -> None:
        super().__init__(message=message, status_code=500)


class EmailServiceError(ArogyaGPTException):
    """Raised when email sending fails."""

    def __init__(self, message: str = "Email service is unavailable.") -> None:
        super().__init__(message=message, status_code=503)


class RateLimitExceededError(ArogyaGPTException):
    """Raised when a user exceeds the rate limit."""

    def __init__(self) -> None:
        super().__init__(
            message="Too many requests. Please slow down and try again later.",
            status_code=429,
        )


class DatabaseError(ArogyaGPTException):
    """Raised for unexpected database-level errors."""

    def __init__(self, message: str = "A database error occurred.") -> None:
        super().__init__(message=message, status_code=500)
