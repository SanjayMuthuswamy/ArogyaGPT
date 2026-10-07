"""
ArogyaGPT - Chat ORM Models
Conversational sessions and message history for RAG-powered Q&A.
"""

from typing import Optional, TYPE_CHECKING

from sqlalchemy import Boolean, ForeignKey, Index, Integer, String, Text, JSON, Float
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.session import Base
from app.database.base import BaseModelMixin, UUIDMixin, TimestampMixin
from app.core.constants import MessageRole

if TYPE_CHECKING:
    from app.models.user import User
    from app.models.report import Report


class ChatSession(Base, BaseModelMixin):
    """
    Represents a conversational session between a user and the AI
    in the context of a specific medical report.
    """

    __tablename__ = "chat_sessions"
    __table_args__ = (
        Index("ix_chat_sessions_user_id", "user_id"),
        Index("ix_chat_sessions_report_id", "report_id"),
    )

    user_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    report_id: Mapped[Optional[str]] = mapped_column(
        String(36), ForeignKey("reports.id", ondelete="SET NULL"), nullable=True
    )
    title: Mapped[str] = mapped_column(
        String(500), nullable=False, default="Medical Report Chat"
    )
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    message_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    language_code: Mapped[str] = mapped_column(String(10), default="en", nullable=False)

    # Memory window — how many messages to retain for context
    context_window_size: Mapped[int] = mapped_column(Integer, default=10, nullable=False)

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="chat_sessions")
    report: Mapped[Optional["Report"]] = relationship("Report", back_populates="chat_sessions")
    messages: Mapped[list["ChatMessage"]] = relationship(
        "ChatMessage", back_populates="session", cascade="all, delete-orphan",
        order_by="ChatMessage.created_at"
    )

    def __repr__(self) -> str:
        return f"<ChatSession id={self.id} user_id={self.user_id} report_id={self.report_id}>"


class ChatMessage(Base, UUIDMixin, TimestampMixin):
    """A single message turn in a chat session."""

    __tablename__ = "chat_messages"
    __table_args__ = (
        Index("ix_chat_messages_session_id", "session_id"),
        Index("ix_chat_messages_created_at", "created_at"),
    )

    session_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("chat_sessions.id", ondelete="CASCADE"), nullable=False
    )
    role: Mapped[str] = mapped_column(
        String(20), nullable=False  # "user" | "assistant" | "system"
    )
    content: Mapped[str] = mapped_column(Text, nullable=False)

    # RAG citations
    source_chunks: Mapped[Optional[list]] = mapped_column(JSON, nullable=True)
    retrieved_context: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # Model metadata
    model_used: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    tokens_used: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    latency_ms: Mapped[Optional[float]] = mapped_column(Float, nullable=True)

    # Feedback
    is_helpful: Mapped[Optional[bool]] = mapped_column(Boolean, nullable=True)
    feedback_text: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    session: Mapped["ChatSession"] = relationship("ChatSession", back_populates="messages")

    def __repr__(self) -> str:
        return f"<ChatMessage id={self.id} role={self.role} session_id={self.session_id}>"
