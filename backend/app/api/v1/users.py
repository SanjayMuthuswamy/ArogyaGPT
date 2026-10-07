"""
ArogyaGPT - Users API Router
User profile management endpoints.
"""

from fastapi import APIRouter, status

from app.core.constants import APIMessage
from app.core.dependencies import CurrentUser, VerifiedUser, DBSession, Cache
from app.schemas.base import SuccessResponse
from app.schemas.user import UpdateProfileRequest, UserDetailResponse
from app.core.logging import get_logger
from sqlalchemy import update
from app.models.user import User
from app.cache.redis_manager import RedisManager

logger = get_logger(__name__)

router = APIRouter(prefix="/users", tags=["Users"])


@router.get(
    "/me",
    response_model=SuccessResponse[UserDetailResponse],
    status_code=status.HTTP_200_OK,
    summary="Get current user's full profile",
)
async def get_my_profile(
    current_user: VerifiedUser,
) -> SuccessResponse[UserDetailResponse]:
    return SuccessResponse(
        message=APIMessage.USER_FETCHED,
        data=UserDetailResponse.model_validate(current_user),
    )


@router.put(
    "/me",
    response_model=SuccessResponse[UserDetailResponse],
    status_code=status.HTTP_200_OK,
    summary="Update current user's profile",
    description="Update editable fields on the current user's profile.",
)
async def update_my_profile(
    payload: UpdateProfileRequest,
    current_user: VerifiedUser,
    db: DBSession,
    redis: Cache,
) -> SuccessResponse[UserDetailResponse]:
    # Apply only provided (non-None) fields
    update_data = payload.model_dump(exclude_none=True)
    if not update_data:
        return SuccessResponse(
            message="No changes provided.",
            data=UserDetailResponse.model_validate(current_user),
        )

    for field, value in update_data.items():
        setattr(current_user, field, value)

    await db.flush()

    # Invalidate profile cache
    await redis.delete(RedisManager.user_profile_key(current_user.id))

    logger.info(f"Profile updated for user: {current_user.email} | fields={list(update_data.keys())}")

    return SuccessResponse(
        message=APIMessage.USER_UPDATED,
        data=UserDetailResponse.model_validate(current_user),
    )
