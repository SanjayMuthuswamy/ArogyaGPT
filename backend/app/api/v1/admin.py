"""
ArogyaGPT - Admin API Router
Admin-only endpoints for user management, system analytics, and audit logs.

Endpoints:
  GET    /api/v1/admin/users               - List all users (paginated)
  GET    /api/v1/admin/users/{id}          - Get any user's full profile
  PATCH  /api/v1/admin/users/{id}          - Update user status/role
  DELETE /api/v1/admin/users/{id}          - Soft-delete a user
  GET    /api/v1/admin/reports             - List all reports (all users)
  GET    /api/v1/admin/stats               - System statistics dashboard
  GET    /api/v1/admin/audit-logs          - Paginated audit log viewer
  GET    /api/v1/admin/api-usage           - API usage analytics
"""

from datetime import datetime, timezone, timedelta
from typing import Optional

from fastapi import APIRouter, Query, status
from sqlalchemy import func, select
from sqlalchemy.orm import selectinload

from app.core.constants import APIMessage, UserRole
from app.core.dependencies import AdminUser, DBSession, Cache
from app.core.exceptions import UserNotFoundError
from app.models.audit import AuditLog, APIUsage
from app.models.report import Report
from app.models.user import User
from app.schemas.base import PaginatedResponse, SuccessResponse
from app.schemas.user import AdminUpdateUserRequest, UserDetailResponse
from app.schemas.report import ReportSummaryResponse
from app.core.logging import get_logger
from app.cache.redis_manager import RedisManager

logger = get_logger(__name__)

router = APIRouter(prefix="/admin", tags=["Admin"])


# ==============================================================================
# GET /api/v1/admin/stats
# ==============================================================================

@router.get(
    "/stats",
    response_model=SuccessResponse[dict],
    status_code=status.HTTP_200_OK,
    summary="System statistics dashboard",
    description="Returns aggregate statistics: user counts, report counts, processing metrics, and recent activity.",
)
async def get_system_stats(
    _: AdminUser,
    db: DBSession,
) -> SuccessResponse[dict]:
    # Total users by role
    user_counts = await db.execute(
        select(User.role, func.count(User.id).label("count"))
        .where(User.is_deleted == False)
        .group_by(User.role)
    )
    user_stats = {row.role: row.count for row in user_counts}

    # Total reports by status
    report_counts = await db.execute(
        select(Report.status, func.count(Report.id).label("count"))
        .where(Report.is_deleted == False)
        .group_by(Report.status)
    )
    report_stats = {row.status: row.count for row in report_counts}

    # Reports this week
    week_ago = datetime.now(timezone.utc) - timedelta(days=7)
    recent_reports_result = await db.execute(
        select(func.count(Report.id)).where(
            Report.created_at >= week_ago,
            Report.is_deleted == False,
        )
    )
    reports_this_week = recent_reports_result.scalar() or 0

    # New users this week
    new_users_result = await db.execute(
        select(func.count(User.id)).where(
            User.created_at >= week_ago,
            User.is_deleted == False,
        )
    )
    new_users_this_week = new_users_result.scalar() or 0

    # Verified vs unverified users
    verified_result = await db.execute(
        select(func.count(User.id)).where(
            User.is_email_verified == True,
            User.is_deleted == False,
        )
    )
    verified_users = verified_result.scalar() or 0

    total_users_result = await db.execute(
        select(func.count(User.id)).where(User.is_deleted == False)
    )
    total_users = total_users_result.scalar() or 0

    stats = {
        "users": {
            "total": total_users,
            "verified": verified_users,
            "unverified": total_users - verified_users,
            "by_role": user_stats,
            "new_this_week": new_users_this_week,
        },
        "reports": {
            "total": sum(report_stats.values()),
            "by_status": report_stats,
            "uploaded_this_week": reports_this_week,
        },
        "generated_at": datetime.now(timezone.utc).isoformat(),
    }

    return SuccessResponse(
        message="System statistics retrieved successfully.",
        data=stats,
    )


# ==============================================================================
# GET /api/v1/admin/users
# ==============================================================================

@router.get(
    "/users",
    response_model=PaginatedResponse[UserDetailResponse],
    status_code=status.HTTP_200_OK,
    summary="List all registered users",
    description="Paginated, searchable, sortable list of all system users.",
)
async def list_all_users(
    _: AdminUser,
    db: DBSession,
    page: int = Query(default=1, ge=1),
    per_page: int = Query(default=20, ge=1, le=100),
    search: Optional[str] = Query(default=None, description="Search by email or name."),
    role: Optional[str] = Query(default=None, description="Filter by role."),
    is_active: Optional[bool] = Query(default=None),
    is_verified: Optional[bool] = Query(default=None),
    sort_by: str = Query(default="created_at"),
    sort_order: str = Query(default="desc", pattern="^(asc|desc)$"),
) -> PaginatedResponse[UserDetailResponse]:
    query = select(User).where(User.is_deleted == False)

    if search:
        query = query.where(
            (User.email.ilike(f"%{search}%")) |
            (User.full_name.ilike(f"%{search}%"))
        )
    if role:
        query = query.where(User.role == role)
    if is_active is not None:
        query = query.where(User.is_active == is_active)
    if is_verified is not None:
        query = query.where(User.is_email_verified == is_verified)

    sort_col = getattr(User, sort_by, User.created_at)
    query = query.order_by(sort_col.desc() if sort_order == "desc" else sort_col.asc())

    count_result = await db.execute(select(func.count()).select_from(query.subquery()))
    total = count_result.scalar() or 0

    offset = (page - 1) * per_page
    result = await db.execute(query.offset(offset).limit(per_page))
    items = [UserDetailResponse.model_validate(u) for u in result.scalars().all()]

    return PaginatedResponse.create(
        items=items, total=total, page=page, per_page=per_page,
        message="Users retrieved successfully.",
    )


# ==============================================================================
# GET /api/v1/admin/users/{user_id}
# ==============================================================================

@router.get(
    "/users/{user_id}",
    response_model=SuccessResponse[UserDetailResponse],
    status_code=status.HTTP_200_OK,
    summary="Get full profile of any user",
)
async def get_user_by_id(
    user_id: str,
    _: AdminUser,
    db: DBSession,
) -> SuccessResponse[UserDetailResponse]:
    result = await db.execute(
        select(User).where(User.id == user_id, User.is_deleted == False)
    )
    user = result.scalar_one_or_none()
    if not user:
        raise UserNotFoundError(identifier=user_id)

    return SuccessResponse(
        message=APIMessage.USER_FETCHED,
        data=UserDetailResponse.model_validate(user),
    )


# ==============================================================================
# PATCH /api/v1/admin/users/{user_id}
# ==============================================================================

@router.patch(
    "/users/{user_id}",
    response_model=SuccessResponse[UserDetailResponse],
    status_code=status.HTTP_200_OK,
    summary="Update user status or role",
    description="Admin can update is_active, is_email_verified, role, and is_superuser.",
)
async def update_user(
    user_id: str,
    payload: AdminUpdateUserRequest,
    admin: AdminUser,
    db: DBSession,
    redis: Cache,
) -> SuccessResponse[UserDetailResponse]:
    result = await db.execute(
        select(User).where(User.id == user_id, User.is_deleted == False)
    )
    user = result.scalar_one_or_none()
    if not user:
        raise UserNotFoundError(identifier=user_id)

    update_data = payload.model_dump(exclude_none=True)
    for field, value in update_data.items():
        setattr(user, field, value)

    await db.flush()

    # Invalidate profile cache
    await redis.delete(RedisManager.user_profile_key(user_id))

    logger.info(
        f"Admin {admin.email} updated user {user.email} | changes={list(update_data.keys())}"
    )

    return SuccessResponse(
        message=APIMessage.USER_UPDATED,
        data=UserDetailResponse.model_validate(user),
    )


# ==============================================================================
# DELETE /api/v1/admin/users/{user_id}
# ==============================================================================

@router.delete(
    "/users/{user_id}",
    response_model=SuccessResponse,
    status_code=status.HTTP_200_OK,
    summary="Soft-delete a user account",
)
async def delete_user(
    user_id: str,
    admin: AdminUser,
    db: DBSession,
    redis: Cache,
) -> SuccessResponse:
    result = await db.execute(
        select(User).where(User.id == user_id, User.is_deleted == False)
    )
    user = result.scalar_one_or_none()
    if not user:
        raise UserNotFoundError(identifier=user_id)

    user.is_deleted = True
    user.deleted_at = datetime.now(timezone.utc)
    user.is_active = False
    await db.flush()

    await redis.delete(RedisManager.user_profile_key(user_id))

    logger.warning(f"Admin {admin.email} deleted user account: {user.email} (id={user_id})")

    return SuccessResponse(message="User account deleted successfully.")


# ==============================================================================
# GET /api/v1/admin/reports
# ==============================================================================

@router.get(
    "/reports",
    response_model=PaginatedResponse[ReportSummaryResponse],
    status_code=status.HTTP_200_OK,
    summary="List all reports (all users)",
    description="Admin view of all uploaded reports across the system.",
)
async def list_all_reports(
    _: AdminUser,
    db: DBSession,
    page: int = Query(default=1, ge=1),
    per_page: int = Query(default=20, ge=1, le=100),
    status_filter: Optional[str] = Query(default=None, alias="status"),
    user_id_filter: Optional[str] = Query(default=None, alias="user_id"),
) -> PaginatedResponse[ReportSummaryResponse]:
    from sqlalchemy.orm import selectinload

    query = select(Report).where(Report.is_deleted == False)
    if status_filter:
        query = query.where(Report.status == status_filter)
    if user_id_filter:
        query = query.where(Report.user_id == user_id_filter)

    query = query.order_by(Report.created_at.desc())

    count_result = await db.execute(select(func.count()).select_from(query.subquery()))
    total = count_result.scalar() or 0

    offset = (page - 1) * per_page
    result = await db.execute(
        query.options(selectinload(Report.files)).offset(offset).limit(per_page)
    )
    reports = result.scalars().all()

    items = [
        ReportSummaryResponse(
            id=r.id, title=r.title, report_type=r.report_type,
            status=r.status, pipeline_stage=r.pipeline_stage,
            risk_level=r.risk_level, hospital_name=r.hospital_name,
            report_date=r.report_date, version=r.version,
            created_at=r.created_at, updated_at=r.updated_at,
            file_count=len(r.files),
        )
        for r in reports
    ]

    return PaginatedResponse.create(
        items=items, total=total, page=page, per_page=per_page,
        message="Reports retrieved successfully.",
    )


# ==============================================================================
# GET /api/v1/admin/audit-logs
# ==============================================================================

@router.get(
    "/audit-logs",
    response_model=SuccessResponse[list[dict]],
    status_code=status.HTTP_200_OK,
    summary="View security audit logs",
    description="Paginated view of all security events (logins, logouts, failures, admin actions).",
)
async def get_audit_logs(
    _: AdminUser,
    db: DBSession,
    page: int = Query(default=1, ge=1),
    per_page: int = Query(default=50, ge=1, le=200),
    event_type: Optional[str] = Query(default=None),
    user_id_filter: Optional[str] = Query(default=None, alias="user_id"),
    start_date: Optional[datetime] = Query(default=None),
    end_date: Optional[datetime] = Query(default=None),
) -> SuccessResponse[list[dict]]:
    query = select(AuditLog).order_by(AuditLog.created_at.desc())

    if event_type:
        query = query.where(AuditLog.event_type.ilike(f"%{event_type}%"))
    if user_id_filter:
        query = query.where(AuditLog.user_id == user_id_filter)
    if start_date:
        query = query.where(AuditLog.created_at >= start_date)
    if end_date:
        query = query.where(AuditLog.created_at <= end_date)

    offset = (page - 1) * per_page
    result = await db.execute(query.offset(offset).limit(per_page))
    logs = result.scalars().all()

    return SuccessResponse(
        message=f"Audit logs retrieved ({len(logs)} entries).",
        data=[
            {
                "id": log.id,
                "user_id": log.user_id,
                "event_type": log.event_type,
                "resource_type": log.resource_type,
                "resource_id": log.resource_id,
                "description": log.description,
                "status": log.status,
                "ip_address": log.ip_address,
                "http_method": log.http_method,
                "endpoint": log.endpoint,
                "http_status_code": log.http_status_code,
                "created_at": log.created_at.isoformat(),
            }
            for log in logs
        ],
    )
