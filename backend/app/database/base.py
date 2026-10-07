"""
ArogyaGPT - Base ORM Mixin
Provides common columns (UUID PK, timestamps, soft-delete) for all models.
"""

import uuid
from datetime import datetime, timezone

from sqlalchemy import Boolean, DateTime, String, func
from sqlalchemy.orm import Mapped, mapped_column


class UUIDMixin:
    """Primary key as UUID string."""

    id: Mapped[str] = mapped_column(
        String(36),
        primary_key=True,
        default=lambda: str(uuid.uuid4()),
        index=True,
    )


class TimestampMixin:
    """Automatic created_at and updated_at timestamps."""

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )


class SoftDeleteMixin:
    """Soft-delete support via is_deleted flag and deleted_at timestamp."""

    is_deleted: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    deleted_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True, default=None
    )


class BaseModelMixin(UUIDMixin, TimestampMixin, SoftDeleteMixin):
    """
    Combined base mixin providing:
    - UUID primary key
    - created_at / updated_at timestamps
    - Soft-delete (is_deleted, deleted_at)
    """
    pass
