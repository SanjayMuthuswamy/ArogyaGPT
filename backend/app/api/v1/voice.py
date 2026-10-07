"""
ArogyaGPT - Voice (TTS) API Router
Text-to-speech generation, streaming, and download endpoints.

Endpoints:
  POST   /api/v1/voice/generate             - Generate audio from text
  GET    /api/v1/voice/{id}                 - Get voice request status
  GET    /api/v1/voice/{id}/download        - Download audio file
  GET    /api/v1/voice/{id}/stream          - Stream audio file
  GET    /api/v1/voice/history              - List all voice requests
  DELETE /api/v1/voice/{id}                 - Delete a voice request
"""

import os
import uuid
from pathlib import Path
from typing import Optional

from fastapi import APIRouter, Query, status
from fastapi.responses import FileResponse, StreamingResponse

from app.core.config import settings
from app.core.constants import APIMessage, LANGUAGE_NAMES
from app.core.dependencies import VerifiedUser, DBSession
from app.core.exceptions import ResourceNotFoundError, VoiceGenerationError
from app.schemas.base import PaginatedResponse, SuccessResponse
from app.schemas.report import VoiceGenerateRequest, VoiceResponse
from app.services.voice_service import VoiceService
from app.models.report import VoiceRequest
from app.core.logging import get_logger
from sqlalchemy import func, select

logger = get_logger(__name__)

router = APIRouter(prefix="/voice", tags=["Voice & TTS"])


# ==============================================================================
# POST /api/v1/voice/generate
# ==============================================================================

@router.post(
    "/generate",
    response_model=SuccessResponse[VoiceResponse],
    status_code=status.HTTP_201_CREATED,
    summary="Generate audio from text (Text-to-Speech)",
    description=(
        "Convert text to speech in any supported Indian language. "
        "Supports English, Hindi, Tamil, Telugu, Kannada, Malayalam, Marathi, and Bengali. "
        "Audio is saved as MP3 and available for download. "
        "Optionally link to a report for tracking."
    ),
)
async def generate_voice(
    payload: VoiceGenerateRequest,
    current_user: VerifiedUser,
    db: DBSession,
) -> SuccessResponse[VoiceResponse]:
    if payload.language_code not in LANGUAGE_NAMES:
        raise VoiceGenerationError(
            f"Language '{payload.language_code}' is not supported for TTS. "
            f"Supported: {', '.join(LANGUAGE_NAMES.keys())}"
        )

    # Create voice request record (pending)
    voice_req = VoiceRequest(
        id=str(uuid.uuid4()),
        user_id=current_user.id,
        report_id=payload.report_id,
        input_text=payload.text,
        language_code=payload.language_code,
        tts_provider=settings.TTS_PROVIDER,
        status="processing",
    )
    db.add(voice_req)
    await db.flush()

    # Generate audio synchronously (can be moved to Celery for long texts)
    try:
        service = VoiceService()
        audio_path, duration = await service.generate(
            text=payload.text,
            language_code=payload.language_code,
        )

        # Build public URL path for the audio file
        audio_filename = Path(audio_path).name
        audio_url = f"/api/v1/voice/{voice_req.id}/download"

        voice_req.audio_file_path = audio_path
        voice_req.audio_file_url = audio_url
        voice_req.audio_duration_seconds = duration
        voice_req.status = "completed"

        logger.info(
            f"Voice generated: id={voice_req.id} | lang={payload.language_code} | "
            f"duration={duration:.1f}s | user={current_user.email}"
        )

    except VoiceGenerationError as e:
        voice_req.status = "failed"
        await db.flush()
        raise

    await db.flush()

    return SuccessResponse(
        message=APIMessage.VOICE_GENERATED,
        data=VoiceResponse.model_validate(voice_req),
        status=201,
    )


# ==============================================================================
# GET /api/v1/voice/history
# ==============================================================================

@router.get(
    "/history",
    response_model=PaginatedResponse[VoiceResponse],
    status_code=status.HTTP_200_OK,
    summary="List voice generation history",
    description="Paginated list of all TTS requests made by the current user.",
)
async def list_voice_history(
    current_user: VerifiedUser,
    db: DBSession,
    page: int = Query(default=1, ge=1),
    per_page: int = Query(default=20, ge=1, le=100),
    language_code: Optional[str] = Query(default=None),
) -> PaginatedResponse[VoiceResponse]:
    query = select(VoiceRequest).where(VoiceRequest.user_id == current_user.id)
    if language_code:
        query = query.where(VoiceRequest.language_code == language_code)

    count_result = await db.execute(
        select(func.count()).select_from(query.subquery())
    )
    total = count_result.scalar() or 0

    offset = (page - 1) * per_page
    result = await db.execute(
        query.order_by(VoiceRequest.created_at.desc()).offset(offset).limit(per_page)
    )
    items = [VoiceResponse.model_validate(v) for v in result.scalars().all()]

    return PaginatedResponse.create(
        items=items,
        total=total,
        page=page,
        per_page=per_page,
        message="Voice history retrieved successfully.",
    )


# ==============================================================================
# GET /api/v1/voice/{voice_id}
# ==============================================================================

@router.get(
    "/{voice_id}",
    response_model=SuccessResponse[VoiceResponse],
    status_code=status.HTTP_200_OK,
    summary="Get voice request status and metadata",
)
async def get_voice_request(
    voice_id: str,
    current_user: VerifiedUser,
    db: DBSession,
) -> SuccessResponse[VoiceResponse]:
    result = await db.execute(
        select(VoiceRequest).where(
            VoiceRequest.id == voice_id,
            VoiceRequest.user_id == current_user.id,
        )
    )
    voice_req = result.scalar_one_or_none()
    if not voice_req:
        raise ResourceNotFoundError("Voice request", voice_id)

    return SuccessResponse(
        message="Voice request retrieved successfully.",
        data=VoiceResponse.model_validate(voice_req),
    )


# ==============================================================================
# GET /api/v1/voice/{voice_id}/download
# ==============================================================================

@router.get(
    "/{voice_id}/download",
    status_code=status.HTTP_200_OK,
    summary="Download audio file as MP3",
    description="Download the generated MP3 audio file directly.",
    response_class=FileResponse,
)
async def download_voice_audio(
    voice_id: str,
    current_user: VerifiedUser,
    db: DBSession,
):
    result = await db.execute(
        select(VoiceRequest).where(
            VoiceRequest.id == voice_id,
            VoiceRequest.user_id == current_user.id,
        )
    )
    voice_req = result.scalar_one_or_none()
    if not voice_req:
        raise ResourceNotFoundError("Voice request", voice_id)

    if not voice_req.audio_file_path or not Path(voice_req.audio_file_path).exists():
        raise VoiceGenerationError("Audio file not found. It may have been deleted.")

    filename = f"arogyagpt_audio_{voice_req.language_code}_{voice_req.id[:8]}.mp3"

    return FileResponse(
        path=voice_req.audio_file_path,
        media_type="audio/mpeg",
        filename=filename,
        headers={
            "Content-Disposition": f'attachment; filename="{filename}"',
            "Cache-Control": "public, max-age=3600",
        },
    )


# ==============================================================================
# GET /api/v1/voice/{voice_id}/stream
# ==============================================================================

@router.get(
    "/{voice_id}/stream",
    status_code=status.HTTP_200_OK,
    summary="Stream audio for in-browser playback",
    description="Stream the MP3 audio for direct playback in a browser or media player.",
    response_class=StreamingResponse,
)
async def stream_voice_audio(
    voice_id: str,
    current_user: VerifiedUser,
    db: DBSession,
):
    result = await db.execute(
        select(VoiceRequest).where(
            VoiceRequest.id == voice_id,
            VoiceRequest.user_id == current_user.id,
        )
    )
    voice_req = result.scalar_one_or_none()
    if not voice_req:
        raise ResourceNotFoundError("Voice request", voice_id)

    audio_path = voice_req.audio_file_path
    if not audio_path or not Path(audio_path).exists():
        raise VoiceGenerationError("Audio file not found.")

    file_size = Path(audio_path).stat().st_size

    def iterfile():
        with open(audio_path, "rb") as f:
            while chunk := f.read(8192):
                yield chunk

    return StreamingResponse(
        iterfile(),
        media_type="audio/mpeg",
        headers={
            "Content-Length": str(file_size),
            "Accept-Ranges": "bytes",
            "Cache-Control": "public, max-age=3600",
        },
    )


# ==============================================================================
# DELETE /api/v1/voice/{voice_id}
# ==============================================================================

@router.delete(
    "/{voice_id}",
    response_model=SuccessResponse,
    status_code=status.HTTP_200_OK,
    summary="Delete a voice request and its audio file",
)
async def delete_voice_request(
    voice_id: str,
    current_user: VerifiedUser,
    db: DBSession,
) -> SuccessResponse:
    result = await db.execute(
        select(VoiceRequest).where(
            VoiceRequest.id == voice_id,
            VoiceRequest.user_id == current_user.id,
        )
    )
    voice_req = result.scalar_one_or_none()
    if not voice_req:
        raise ResourceNotFoundError("Voice request", voice_id)

    # Delete audio file from disk
    if voice_req.audio_file_path:
        audio_path = Path(voice_req.audio_file_path)
        if audio_path.exists():
            audio_path.unlink()
            logger.info(f"Audio file deleted: {audio_path}")

    await db.delete(voice_req)
    await db.flush()

    return SuccessResponse(message="Voice request and audio file deleted successfully.")
