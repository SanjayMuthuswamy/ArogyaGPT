"""
ArogyaGPT - FastAPI Dependencies
Shared, reusable dependency functions for authentication, DB, cache, and RBAC.
"""

from typing import Annotated, Optional
from datetime import datetime, timezone

from fastapi import Depends, Header, HTTPException, Request, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.session import get_db
from app.cache.redis_manager import RedisManager, get_redis
from app.core.config import settings
from app.core.security import decode_token
from app.core.exceptions import (
    AuthenticationError,
    TokenExpiredError,
    TokenInvalidError,
    TokenBlacklistedError,
    EmailNotVerifiedError,
    PermissionDeniedError,
    InsufficientRoleError,
)
from app.core.constants import UserRole
from app.core.logging import get_logger
from app.models.user import User

logger = get_logger(__name__)

# HTTP Bearer scheme (extracts token from Authorization header)
bearer_scheme = HTTPBearer(auto_error=False)


async def get_current_user(
    credentials: Annotated[Optional[HTTPAuthorizationCredentials], Depends(bearer_scheme)],
    db: Annotated[AsyncSession, Depends(get_db)],
    redis: Annotated[RedisManager, Depends(get_redis)],
) -> User:
    """
    Core authentication dependency.

    Validates the JWT access token:
    1. Extracts token from Authorization: Bearer <token>
    2. Decodes and verifies signature + expiry
    3. Checks token JTI against the Redis blacklist
    4. Loads and returns the User from the database

    Raises:
        AuthenticationError: If no token provided.
        TokenInvalidError: If token signature/format is bad.
        TokenExpiredError: If token has expired.
        TokenBlacklistedError: If token JTI is on the blacklist.
        AuthenticationError: If user not found or inactive.
    """
    if credentials is None:
        raise AuthenticationError("Authentication token is required.")

    token = credentials.credentials

    try:
        payload = decode_token(token)
    except JWTError as exc:
        error_msg = str(exc).lower()
        if "expired" in error_msg:
            raise TokenExpiredError()
        raise TokenInvalidError()

    # Verify token type
    if payload.get("type") != "access":
        raise TokenInvalidError()

    # Check blacklist
    jti = payload.get("jti")
    if jti and await redis.is_token_blacklisted(jti):
        raise TokenBlacklistedError()

    # Load user from DB
    user_id = payload.get("sub")
    if not user_id:
        raise TokenInvalidError()

    from sqlalchemy import select
    result = await db.execute(
        select(User).where(User.id == user_id, User.is_deleted == False)
    )
    user = result.scalar_one_or_none()

    if not user:
        raise AuthenticationError("User account not found.")

    if not user.is_active:
        raise AuthenticationError("Your account has been deactivated. Contact support.")

    return user


async def get_current_verified_user(
    current_user: Annotated[User, Depends(get_current_user)],
) -> User:
    """
    Extends get_current_user to require email verification.

    Raises:
        EmailNotVerifiedError: If user hasn't verified their email.
    """
    if settings.EMAIL_ENABLED and not current_user.is_email_verified:
        raise EmailNotVerifiedError()
    return current_user


def require_roles(*roles: UserRole):
    """
    Role-based access control factory.

    Usage:
        @router.get("/admin-only")
        async def admin_route(user: User = Depends(require_roles(UserRole.ADMIN))):
            ...
    """
    async def role_checker(
        current_user: Annotated[User, Depends(get_current_verified_user)],
    ) -> User:
        if current_user.is_superuser:
            return current_user
        if current_user.role not in [r.value for r in roles]:
            raise InsufficientRoleError(required_role=roles[0].value)
        return current_user
    return role_checker


async def get_optional_user(
    credentials: Annotated[Optional[HTTPAuthorizationCredentials], Depends(bearer_scheme)],
    db: Annotated[AsyncSession, Depends(get_db)],
    redis: Annotated[RedisManager, Depends(get_redis)],
) -> Optional[User]:
    """
    Optional authentication — returns None if no token provided.
    Used for public endpoints that can optionally serve personalized content.
    """
    if credentials is None:
        return None
    try:
        return await get_current_user(credentials, db, redis)
    except Exception:
        return None


def get_request_ip(request: Request) -> str:
    """Extract client IP address from request headers or connection info."""
    forwarded_for = request.headers.get("X-Forwarded-For")
    if forwarded_for:
        return forwarded_for.split(",")[0].strip()
    real_ip = request.headers.get("X-Real-IP")
    if real_ip:
        return real_ip.strip()
    if request.client:
        return request.client.host
    return "unknown"


# Type aliases for cleaner endpoint signatures
CurrentUser = Annotated[User, Depends(get_current_user)]
VerifiedUser = Annotated[User, Depends(get_current_verified_user)]
AdminUser = Annotated[User, Depends(require_roles(UserRole.ADMIN))]
DoctorOrAdmin = Annotated[User, Depends(require_roles(UserRole.DOCTOR, UserRole.ADMIN))]
DBSession = Annotated[AsyncSession, Depends(get_db)]
Cache = Annotated[RedisManager, Depends(get_redis)]
