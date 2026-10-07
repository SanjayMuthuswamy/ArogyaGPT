"""
ArogyaGPT - Audit Log ORM Model
Comprehensive audit trail for all security-sensitive events.
"""

from typing import Optional, TYPE_CHECKING

from sqlalchemy import ForeignKey, Index, JSON, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.session import Base
from app.database.base import UUIDMixin, TimestampMixin

if TYPE_CHECKING:
    from app.models.user import User


class AuditLog(Base, UUIDMixin, TimestampMixin):
    """
    Immutable audit log for security, compliance, and debugging.

    Tracks:
    - Authentication events (login, logout, failed attempts)
    - Data access events (who accessed what report)
    - Mutation events (profile changes, password resets)
    - Admin actions
    - API usage
    """

    __tablename__ = "audit_logs"
    __table_args__ = (
        Index("ix_audit_logs_user_id", "user_id"),
        Index("ix_audit_logs_event_type", "event_type"),
        Index("ix_audit_logs_created_at", "created_at"),
        Index("ix_audit_logs_resource_type", "resource_type"),
    )

    # Who
    user_id: Mapped[Optional[str]] = mapped_column(
        String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )
    ip_address: Mapped[Optional[str]] = mapped_column(String(45), nullable=True)
    user_agent: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)

    # What
    event_type: Mapped[str] = mapped_column(
        String(100), nullable=False
        # Examples: "user.login", "user.logout", "report.upload", "report.access",
        #           "auth.failed", "password.reset", "admin.action"
    )
    resource_type: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    resource_id: Mapped[Optional[str]] = mapped_column(String(36), nullable=True)

    # Details
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    event_metadata: Mapped[Optional[dict]] = mapped_column("metadata", JSON, nullable=True)
    status: Mapped[str] = mapped_column(
        String(20), nullable=False, default="success"  # "success" | "failure"
    )

    # HTTP context
    http_method: Mapped[Optional[str]] = mapped_column(String(10), nullable=True)
    endpoint: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    http_status_code: Mapped[Optional[int]] = mapped_column(nullable=True)

    # Relationships
    user: Mapped[Optional["User"]] = relationship("User", back_populates="audit_logs")

    def __repr__(self) -> str:
        return f"<AuditLog id={self.id} event={self.event_type} user_id={self.user_id}>"


class APIUsage(Base, UUIDMixin, TimestampMixin):
    """Track per-user API usage for rate limiting and analytics."""

    __tablename__ = "api_usage"
    __table_args__ = (
        Index("ix_api_usage_user_id", "user_id"),
        Index("ix_api_usage_endpoint", "endpoint"),
    )

    user_id: Mapped[Optional[str]] = mapped_column(String(36), nullable=True)
    endpoint: Mapped[str] = mapped_column(String(500), nullable=False)
    method: Mapped[str] = mapped_column(String(10), nullable=False)
    status_code: Mapped[int] = mapped_column(nullable=False)
    response_time_ms: Mapped[Optional[float]] = mapped_column(nullable=True)
    request_size_bytes: Mapped[Optional[int]] = mapped_column(nullable=True)
    response_size_bytes: Mapped[Optional[int]] = mapped_column(nullable=True)
    ip_address: Mapped[Optional[str]] = mapped_column(String(45), nullable=True)
    request_id: Mapped[Optional[str]] = mapped_column(String(36), nullable=True)
