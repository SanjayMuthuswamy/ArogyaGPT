"""
ArogyaGPT - Chat & RAG API Router
Endpoints for conversational medical report Q&A with RAG citations.

Endpoints:
  POST   /api/v1/chat/ask                    - Ask a question (RAG-powered)
  POST   /api/v1/chat/sessions               - Create a new chat session
  GET    /api/v1/chat/sessions               - List all sessions
  GET    /api/v1/chat/sessions/{id}          - Get session details
  DELETE /api/v1/chat/sessions/{id}          - Delete a session
  GET    /api/v1/chat/sessions/{id}/messages - Get message history
  POST   /api/v1/chat/messages/{id}/feedback - Submit message feedback
"""

from typing import Optional

from fastapi import APIRouter, Query, status

from app.core.constants import APIMessage
from app.core.dependencies import VerifiedUser, DBSession, Cache
from app.schemas.base import PaginatedResponse, SuccessResponse
from app.schemas.report import (
    AskQuestionRequest,
    AskQuestionResponse,
    ChatSessionResponse,
    ChatMessageResponse,
)
from pydantic import BaseModel, Field
from app.services.chat_service import ChatService
from app.core.logging import get_logger

logger = get_logger(__name__)

router = APIRouter(prefix="/chat", tags=["Chat & RAG"])


class CreateSessionRequest(BaseModel):
    """Request body for creating a new chat session."""
    report_id: Optional[str] = Field(default=None, description="Link session to a specific report.")
    title: str = Field(default="Medical Report Chat", max_length=500)
    language_code: str = Field(default="en", description="Preferred response language.")


class FeedbackRequest(BaseModel):
    """Request body for message feedback."""
    is_helpful: bool
    feedback_text: Optional[str] = Field(default=None, max_length=1000)


# ==============================================================================
# POST /api/v1/chat/ask
# ==============================================================================

@router.post(
    "/ask",
    response_model=SuccessResponse[AskQuestionResponse],
    status_code=status.HTTP_200_OK,
    summary="Ask a question about a medical report (RAG-powered)",
    description=(
        "Submit a natural language question about an uploaded medical report. "
        "The AI retrieves the most relevant passages using FAISS vector search, "
        "then generates a contextually grounded answer using Groq LLM. "
        "Provide `session_id` to continue an existing conversation, or omit it "
        "to start a new session automatically. Source citations are included in the response."
    ),
)
async def ask_question(
    payload: AskQuestionRequest,
    current_user: VerifiedUser,
    db: DBSession,
) -> SuccessResponse[AskQuestionResponse]:
    service = ChatService(db=db)
    response = await service.ask(user=current_user, payload=payload)
    return SuccessResponse(
        message=APIMessage.CHAT_RESPONSE,
        data=response,
    )


# ==============================================================================
# POST /api/v1/chat/sessions
# ==============================================================================

@router.post(
    "/sessions",
    response_model=SuccessResponse[ChatSessionResponse],
    status_code=status.HTTP_201_CREATED,
    summary="Create a new chat session",
    description="Explicitly create a chat session linked to a report (optional). Sessions are also auto-created when calling /ask.",
)
async def create_session(
    payload: CreateSessionRequest,
    current_user: VerifiedUser,
    db: DBSession,
) -> SuccessResponse[ChatSessionResponse]:
    service = ChatService(db=db)
    session = await service.create_session(
        user=current_user,
        report_id=payload.report_id,
        title=payload.title,
        language_code=payload.language_code,
    )
    return SuccessResponse(
        message=APIMessage.CHAT_SESSION_CREATED,
        data=ChatSessionResponse.model_validate(session),
        status=201,
    )


# ==============================================================================
# GET /api/v1/chat/sessions
# ==============================================================================

@router.get(
    "/sessions",
    response_model=PaginatedResponse[ChatSessionResponse],
    status_code=status.HTTP_200_OK,
    summary="List all chat sessions",
    description="Retrieve a paginated list of the current user's chat sessions.",
)
async def list_sessions(
    current_user: VerifiedUser,
    db: DBSession,
    report_id: Optional[str] = Query(default=None, description="Filter sessions by report ID."),
    page: int = Query(default=1, ge=1),
    per_page: int = Query(default=20, ge=1, le=100),
) -> PaginatedResponse[ChatSessionResponse]:
    service = ChatService(db=db)
    sessions, total = await service.list_sessions(
        user_id=current_user.id,
        report_id=report_id,
        page=page,
        per_page=per_page,
    )
    items = [ChatSessionResponse.model_validate(s) for s in sessions]
    return PaginatedResponse.create(
        items=items,
        total=total,
        page=page,
        per_page=per_page,
        message="Chat sessions retrieved successfully.",
    )


# ==============================================================================
# GET /api/v1/chat/sessions/{session_id}
# ==============================================================================

@router.get(
    "/sessions/{session_id}",
    response_model=SuccessResponse[ChatSessionResponse],
    status_code=status.HTTP_200_OK,
    summary="Get a specific chat session",
)
async def get_session(
    session_id: str,
    current_user: VerifiedUser,
    db: DBSession,
) -> SuccessResponse[ChatSessionResponse]:
    service = ChatService(db=db)
    session = await service.get_session(session_id, current_user.id)
    return SuccessResponse(
        message="Chat session retrieved successfully.",
        data=ChatSessionResponse.model_validate(session),
    )


# ==============================================================================
# DELETE /api/v1/chat/sessions/{session_id}
# ==============================================================================

@router.delete(
    "/sessions/{session_id}",
    response_model=SuccessResponse,
    status_code=status.HTTP_200_OK,
    summary="Delete a chat session",
    description="Soft-deletes the session and all its messages.",
)
async def delete_session(
    session_id: str,
    current_user: VerifiedUser,
    db: DBSession,
) -> SuccessResponse:
    service = ChatService(db=db)
    await service.delete_session(session_id, current_user.id)
    return SuccessResponse(message="Chat session deleted successfully.")


# ==============================================================================
# GET /api/v1/chat/sessions/{session_id}/messages
# ==============================================================================

@router.get(
    "/sessions/{session_id}/messages",
    response_model=SuccessResponse[list[ChatMessageResponse]],
    status_code=status.HTTP_200_OK,
    summary="Get message history for a session",
    description=(
        "Retrieve the full ordered conversation history for a chat session. "
        "Each AI message includes the source chunks used for the answer (citations)."
    ),
)
async def get_session_messages(
    session_id: str,
    current_user: VerifiedUser,
    db: DBSession,
    limit: int = Query(default=50, ge=1, le=200),
) -> SuccessResponse[list[ChatMessageResponse]]:
    service = ChatService(db=db)
    messages = await service.get_session_history(
        session_id=session_id,
        user_id=current_user.id,
        limit=limit,
    )
    return SuccessResponse(
        message=APIMessage.CHAT_HISTORY_FETCHED,
        data=[ChatMessageResponse.model_validate(m) for m in messages],
    )


# ==============================================================================
# POST /api/v1/chat/messages/{message_id}/feedback
# ==============================================================================

@router.post(
    "/messages/{message_id}/feedback",
    response_model=SuccessResponse,
    status_code=status.HTTP_200_OK,
    summary="Submit feedback on an AI response",
    description="Rate an AI-generated message as helpful or not helpful. Used for model quality improvement.",
)
async def submit_message_feedback(
    message_id: str,
    payload: FeedbackRequest,
    current_user: VerifiedUser,
    db: DBSession,
) -> SuccessResponse:
    service = ChatService(db=db)
    await service.submit_feedback(
        message_id=message_id,
        user_id=current_user.id,
        is_helpful=payload.is_helpful,
        feedback_text=payload.feedback_text,
    )
    return SuccessResponse(message="Feedback submitted. Thank you!")
