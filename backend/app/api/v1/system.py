"""
ArogyaGPT - Additional System Health & Maintenance Router
Utility endpoints for database health, task queues, and cache inspection.

Endpoints:
  GET /api/v1/system/ping          - Lightweight ping/pong
  GET /api/v1/system/cache-stats   - Inspection of Redis cache status
"""

from fastapi import APIRouter, status
from app.core.dependencies import AdminUser, Cache
from app.schemas.base import SuccessResponse
from app.core.logging import get_logger

logger = get_logger(__name__)

router = APIRouter(prefix="/system", tags=["System Maintenance"])


@router.get(
    "/ping",
    response_model=SuccessResponse[dict],
    status_code=status.HTTP_200_OK,
    summary="Ping/pong service check",
)
async def ping() -> SuccessResponse[dict]:
    return SuccessResponse(
        message="pong",
        data={"status": "online"},
    )


@router.get(
    "/cache-stats",
    response_model=SuccessResponse[dict],
    status_code=status.HTTP_200_OK,
    summary="Redis cache stats (Admin only)",
)
async def cache_stats(
    _: AdminUser,
    redis: Cache,
) -> SuccessResponse[dict]:
    is_connected = redis.is_connected
    return SuccessResponse(
        message="Cache status retrieved.",
        data={
            "redis_connected": is_connected,
        },
    )
