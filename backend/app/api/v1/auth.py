"""
ArogyaGPT - Authentication API Router
All authentication endpoints: register, login, logout, token refresh,
email verification, and password management.

All endpoints return standardized response envelopes.
"""

from fastapi import APIRouter, Depends, Request, Response, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.core.config import settings
from app.core.constants import APIMessage
from app.core.dependencies import CurrentUser, DBSession, Cache, get_request_ip
from app.schemas.auth import (
    RegisterRequest,
    RegisterResponse,
    LoginRequest,
    LoginResponse,
    TokenResponse,
    RefreshTokenRequest,
    LogoutRequest,
    ChangePasswordRequest,
    ForgotPasswordRequest,
    ResetPasswordRequest,
    ResendVerificationRequest,
    UserProfileResponse,
)
from app.schemas.base import SuccessResponse
from app.services.auth_service import AuthService
from app.core.logging import get_logger

logger = get_logger(__name__)

router = APIRouter(prefix="/auth", tags=["Authentication"])
bearer_scheme = HTTPBearer(auto_error=False)


def _get_auth_service(db: DBSession, redis: Cache) -> AuthService:
    """Factory for AuthService — injected via FastAPI deps."""
    return AuthService(db=db, redis=redis)


# ==============================================================================
# POST /api/v1/auth/register
# ==============================================================================

@router.post(
    "/register",
    response_model=SuccessResponse[RegisterResponse],
    status_code=status.HTTP_201_CREATED,
    summary="Register a new user account",
    description=(
        "Create a new user account with email, password, and role. "
        "An email verification link will be sent to the provided email address."
    ),
)
async def register(
    payload: RegisterRequest,
    request: Request,
    db: DBSession,
    redis: Cache,
) -> SuccessResponse[RegisterResponse]:
    service = _get_auth_service(db, redis)
    ip = get_request_ip(request)
    user = await service.register(data=payload, ip_address=ip)

    return SuccessResponse(
        message=APIMessage.REGISTER_SUCCESS,
        data=RegisterResponse.model_validate(user),
        status=201,
    )


# ==============================================================================
# POST /api/v1/auth/login
# ==============================================================================

@router.post(
    "/login",
    response_model=SuccessResponse[LoginResponse],
    status_code=status.HTTP_200_OK,
    summary="Login and obtain JWT tokens",
    description=(
        "Authenticate with email and password. Returns access token (30 min) "
        "and refresh token (7 days)."
    ),
)
async def login(
    payload: LoginRequest,
    request: Request,
    db: DBSession,
    redis: Cache,
) -> SuccessResponse[LoginResponse]:
    service = _get_auth_service(db, redis)
    ip = get_request_ip(request)
    user_agent = request.headers.get("User-Agent", "")

    user, tokens = await service.login(
        data=payload, ip_address=ip, user_agent=user_agent
    )

    return SuccessResponse(
        message=APIMessage.LOGIN_SUCCESS,
        data=LoginResponse(
            tokens=tokens,
            user=UserProfileResponse.model_validate(user),
        ),
    )


# ==============================================================================
# POST /api/v1/auth/refresh
# ==============================================================================

@router.post(
    "/refresh",
    response_model=SuccessResponse[TokenResponse],
    status_code=status.HTTP_200_OK,
    summary="Refresh access token using refresh token",
    description=(
        "Exchange a valid refresh token for a new access token and rotated refresh token. "
        "The old refresh token is invalidated immediately (rotation policy)."
    ),
)
async def refresh_token(
    payload: RefreshTokenRequest,
    request: Request,
    db: DBSession,
    redis: Cache,
) -> SuccessResponse[TokenResponse]:
    service = _get_auth_service(db, redis)
    ip = get_request_ip(request)
    user_agent = request.headers.get("User-Agent", "")

    tokens = await service.refresh_tokens(
        refresh_token=payload.refresh_token,
        ip_address=ip,
        user_agent=user_agent,
    )

    return SuccessResponse(
        message=APIMessage.TOKEN_REFRESHED,
        data=tokens,
    )


# ==============================================================================
# POST /api/v1/auth/logout
# ==============================================================================

@router.post(
    "/logout",
    response_model=SuccessResponse,
    status_code=status.HTTP_200_OK,
    summary="Logout and invalidate tokens",
    description=(
        "Invalidates the current access token (added to Redis blacklist) "
        "and optionally revokes the refresh token."
    ),
)
async def logout(
    payload: LogoutRequest,
    request: Request,
    current_user: CurrentUser,
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
    db: DBSession = Depends(lambda db: db),
    redis: Cache = Depends(lambda redis: redis),
) -> SuccessResponse:
    service = AuthService(db=db, redis=redis)
    access_token = credentials.credentials if credentials else ""
    await service.logout(
        user=current_user,
        access_token=access_token,
        refresh_token=payload.refresh_token,
    )
    return SuccessResponse(message=APIMessage.LOGOUT_SUCCESS)


# ==============================================================================
# GET /api/v1/auth/me
# ==============================================================================

@router.get(
    "/me",
    response_model=SuccessResponse[UserProfileResponse],
    status_code=status.HTTP_200_OK,
    summary="Get current authenticated user's profile",
    description="Returns the full profile of the currently authenticated user.",
)
async def get_me(current_user: CurrentUser) -> SuccessResponse[UserProfileResponse]:
    return SuccessResponse(
        message=APIMessage.USER_FETCHED,
        data=UserProfileResponse.model_validate(current_user),
    )


# ==============================================================================
# PUT /api/v1/auth/change-password
# ==============================================================================

@router.put(
    "/change-password",
    response_model=SuccessResponse,
    status_code=status.HTTP_200_OK,
    summary="Change password for the current user",
    description=(
        "Change password by providing current password and new password. "
        "All existing sessions on other devices will be invalidated."
    ),
)
async def change_password(
    payload: ChangePasswordRequest,
    current_user: CurrentUser,
    db: DBSession,
    redis: Cache,
) -> SuccessResponse:
    service = AuthService(db=db, redis=redis)
    await service.change_password(user=current_user, data=payload)
    return SuccessResponse(message=APIMessage.PASSWORD_CHANGED)


# ==============================================================================
# POST /api/v1/auth/forgot-password
# ==============================================================================

@router.post(
    "/forgot-password",
    response_model=SuccessResponse,
    status_code=status.HTTP_200_OK,
    summary="Request password reset via email",
    description=(
        "Send a password reset link to the registered email. "
        "Always returns 200 to prevent email enumeration attacks."
    ),
)
async def forgot_password(
    payload: ForgotPasswordRequest,
    db: DBSession,
    redis: Cache,
) -> SuccessResponse:
    service = AuthService(db=db, redis=redis)
    await service.request_password_reset(email=payload.email)
    return SuccessResponse(message=APIMessage.PASSWORD_RESET_SENT)


# ==============================================================================
# POST /api/v1/auth/reset-password
# ==============================================================================

@router.post(
    "/reset-password",
    response_model=SuccessResponse,
    status_code=status.HTTP_200_OK,
    summary="Reset password using email token",
    description="Provide the token from the reset email and a new password.",
)
async def reset_password(
    payload: ResetPasswordRequest,
    db: DBSession,
    redis: Cache,
) -> SuccessResponse:
    service = AuthService(db=db, redis=redis)
    await service.reset_password(
        token=payload.token, new_password=payload.new_password
    )
    return SuccessResponse(message=APIMessage.PASSWORD_RESET_SUCCESS)


# ==============================================================================
# POST /api/v1/auth/resend-verification
# ==============================================================================

@router.post(
    "/resend-verification",
    response_model=SuccessResponse,
    status_code=status.HTTP_200_OK,
    summary="Resend email verification link",
    description="Request a new verification email for an unverified account.",
)
async def resend_verification(
    payload: ResendVerificationRequest,
    db: DBSession,
    redis: Cache,
) -> SuccessResponse:
    service = AuthService(db=db, redis=redis)
    await service.send_verification_email(email=payload.email)
    return SuccessResponse(message=APIMessage.EMAIL_RESENT)


# ==============================================================================
# GET /api/v1/auth/verify-email/{token}
# ==============================================================================

@router.get(
    "/verify-email/{token}",
    response_model=SuccessResponse[UserProfileResponse],
    status_code=status.HTTP_200_OK,
    summary="Verify email address via token",
    description=(
        "Verify email address using the token from the verification link. "
        "The token is valid for 24 hours."
    ),
)
async def verify_email(
    token: str,
    db: DBSession,
    redis: Cache,
) -> SuccessResponse[UserProfileResponse]:
    service = AuthService(db=db, redis=redis)
    user = await service.verify_email(token=token)
    return SuccessResponse(
        message=APIMessage.EMAIL_VERIFIED,
        data=UserProfileResponse.model_validate(user),
    )
