"""
ArogyaGPT - Security Module
JWT token creation/verification, password hashing, and token management.
"""

import uuid
from datetime import datetime, timedelta, timezone
from typing import Any, Optional

import bcrypt
if not hasattr(bcrypt, "__about__"):
    bcrypt.__about__ = type("about", (), {"__version__": getattr(bcrypt, "__version__", "4.0.0")})()

from jose import JWTError, jwt
from passlib.context import CryptContext

from app.core.config import settings


# --- Password Hashing ---
pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto",
    bcrypt__rounds=12,
)


def hash_password(password: str) -> str:
    """Hash a plain-text password using bcrypt."""
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a plain-text password against its bcrypt hash."""
    return pwd_context.verify(plain_password, hashed_password)


# --- JWT Token Management ---

def _create_token(
    subject: str,
    token_type: str,
    expires_delta: timedelta,
    additional_claims: Optional[dict] = None,
) -> str:
    """
    Internal helper to create a signed JWT token.

    Args:
        subject: The token subject (usually user ID as string).
        token_type: Token type identifier ('access' | 'refresh' | 'email_verify' | 'password_reset').
        expires_delta: Token lifetime.
        additional_claims: Extra claims to embed in the payload.

    Returns:
        Signed JWT string.
    """
    now = datetime.now(timezone.utc)
    payload: dict[str, Any] = {
        "sub": str(subject),
        "type": token_type,
        "iat": now,
        "exp": now + expires_delta,
        "jti": str(uuid.uuid4()),  # Unique token ID for blacklisting
    }
    if additional_claims:
        payload.update(additional_claims)

    return jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def create_access_token(
    subject: str,
    role: str = "patient",
    additional_claims: Optional[dict] = None,
) -> str:
    """
    Create a short-lived JWT access token.

    Args:
        subject: User UUID as string.
        role: User role for RBAC.
        additional_claims: Optional extra payload claims.

    Returns:
        Signed JWT access token string.
    """
    claims = {"role": role}
    if additional_claims:
        claims.update(additional_claims)

    return _create_token(
        subject=subject,
        token_type="access",
        expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES),
        additional_claims=claims,
    )


def create_refresh_token(subject: str) -> str:
    """
    Create a long-lived JWT refresh token.

    Args:
        subject: User UUID as string.

    Returns:
        Signed JWT refresh token string.
    """
    return _create_token(
        subject=subject,
        token_type="refresh",
        expires_delta=timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS),
    )


def create_email_verification_token(subject: str) -> str:
    """Create a token for email address verification."""
    return _create_token(
        subject=subject,
        token_type="email_verify",
        expires_delta=timedelta(hours=settings.EMAIL_VERIFICATION_TOKEN_EXPIRE_HOURS),
    )


def create_password_reset_token(subject: str) -> str:
    """Create a token for password reset flow."""
    return _create_token(
        subject=subject,
        token_type="password_reset",
        expires_delta=timedelta(hours=settings.PASSWORD_RESET_TOKEN_EXPIRE_HOURS),
    )


def decode_token(token: str) -> dict[str, Any]:
    """
    Decode and validate a JWT token.

    Args:
        token: The JWT string to decode.

    Returns:
        Decoded payload dictionary.

    Raises:
        JWTError: If the token is invalid, expired, or tampered with.
    """
    return jwt.decode(
        token,
        settings.SECRET_KEY,
        algorithms=[settings.ALGORITHM],
    )


def get_token_jti(token: str) -> Optional[str]:
    """Extract the JTI (JWT ID) from a token without full validation."""
    try:
        payload = jwt.get_unverified_claims(token)
        return payload.get("jti")
    except JWTError:
        return None


def get_token_expiry(token: str) -> Optional[datetime]:
    """Get the expiry datetime of a token without full validation."""
    try:
        payload = jwt.get_unverified_claims(token)
        exp = payload.get("exp")
        if exp:
            return datetime.fromtimestamp(exp, tz=timezone.utc)
        return None
    except JWTError:
        return None
