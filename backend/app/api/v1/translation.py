"""
ArogyaGPT - Translation API Router
On-demand translation of medical report content into Indian languages.

Endpoints:
  POST   /api/v1/translation/translate      - Translate report text
  GET    /api/v1/translation/languages      - List supported languages
  GET    /api/v1/translation/report/{id}    - Get all translations for a report
  DELETE /api/v1/translation/{id}           - Delete a translation
"""

import uuid
from typing import Optional

from fastapi import APIRouter, Query, status

from app.core.constants import APIMessage, LANGUAGE_NAMES
from app.core.dependencies import VerifiedUser, DBSession, Cache
from app.core.exceptions import ReportNotFoundError, ResourceNotFoundError, TranslationError
from app.schemas.base import SuccessResponse
from app.schemas.report import TranslateRequest, TranslationResponse
from app.services.translation_service import TranslationService
from app.core.logging import get_logger
from sqlalchemy import select
from app.models.report import Report, Translation
from app.cache.redis_manager import RedisManager

logger = get_logger(__name__)

router = APIRouter(prefix="/translation", tags=["Translation"])


# ==============================================================================
# GET /api/v1/translation/languages
# ==============================================================================

@router.get(
    "/languages",
    response_model=SuccessResponse[dict],
    status_code=status.HTTP_200_OK,
    summary="List all supported languages",
    description="Returns all supported language codes and their display names for translation.",
)
async def get_supported_languages() -> SuccessResponse[dict]:
    service = TranslationService()
    languages = service.get_supported_languages()
    return SuccessResponse(
        message="Supported languages retrieved successfully.",
        data={"languages": languages, "total": len(languages)},
    )


# ==============================================================================
# POST /api/v1/translation/translate
# ==============================================================================

@router.post(
    "/translate",
    response_model=SuccessResponse[TranslationResponse],
    status_code=status.HTTP_200_OK,
    summary="Translate a medical report into another language",
    description=(
        "Translate the simplified report text into a target Indian language. "
        "Results are cached — re-requesting the same report+language returns the stored translation. "
        "Supported languages: English, Hindi, Tamil, Telugu, Kannada, Malayalam, Marathi, Bengali, etc."
    ),
)
async def translate_report(
    payload: TranslateRequest,
    current_user: VerifiedUser,
    db: DBSession,
    redis: Cache,
) -> SuccessResponse[TranslationResponse]:
    # Validate target language
    if payload.target_language not in LANGUAGE_NAMES:
        raise TranslationError(
            f"Language '{payload.target_language}' is not supported. "
            f"Call GET /translation/languages to see available options."
        )

    # Check cache first
    cache_key = RedisManager.translation_key(payload.report_id, payload.target_language)
    cached = await redis.get(cache_key)
    if cached:
        logger.debug(f"Translation cache hit: {cache_key}")
        return SuccessResponse(
            message=APIMessage.TRANSLATION_SUCCESS,
            data=TranslationResponse(**cached),
        )

    # Load report
    result = await db.execute(
        select(Report).where(
            Report.id == payload.report_id,
            Report.user_id == current_user.id,
            Report.is_deleted == False,
        )
    )
    report = result.scalar_one_or_none()
    if not report:
        raise ReportNotFoundError(identifier=payload.report_id)

    # Check if translation already exists in DB
    existing = await db.execute(
        select(Translation).where(
            Translation.report_id == payload.report_id,
            Translation.language_code == payload.target_language,
        )
    )
    existing_translation = existing.scalar_one_or_none()
    if existing_translation:
        response_data = TranslationResponse.model_validate(existing_translation)
        await redis.set(cache_key, response_data.model_dump(mode="json"), ttl_seconds=86400)
        return SuccessResponse(
            message=APIMessage.TRANSLATION_SUCCESS,
            data=response_data,
        )

    # Determine source text
    source_text = payload.text_to_translate or report.simplified_text
    if not source_text:
        raise TranslationError(
            "This report does not have simplified text yet. "
            "Please wait for AI processing to complete before translating."
        )

    # Perform translation
    service = TranslationService()
    translated_text = await service.translate(
        text=source_text,
        target_lang=payload.target_language,
    )

    # Persist to database
    translation = Translation(
        id=str(uuid.uuid4()),
        report_id=payload.report_id,
        language_code=payload.target_language,
        language_name=LANGUAGE_NAMES.get(payload.target_language, payload.target_language),
        original_text=source_text,
        translated_text=translated_text,
        translation_provider="deep_translator",
        character_count=len(translated_text),
    )
    db.add(translation)
    await db.flush()

    logger.info(
        f"Translation completed: report={payload.report_id} | "
        f"lang={payload.target_language} | {len(translated_text)} chars"
    )

    response_data = TranslationResponse.model_validate(translation)

    # Cache result
    await redis.set(cache_key, response_data.model_dump(mode="json"), ttl_seconds=86400)

    return SuccessResponse(
        message=APIMessage.TRANSLATION_SUCCESS,
        data=response_data,
    )


# ==============================================================================
# GET /api/v1/translation/report/{report_id}
# ==============================================================================

@router.get(
    "/report/{report_id}",
    response_model=SuccessResponse[list[TranslationResponse]],
    status_code=status.HTTP_200_OK,
    summary="Get all translations for a report",
    description="Returns all previously generated translations for a given report.",
)
async def get_report_translations(
    report_id: str,
    current_user: VerifiedUser,
    db: DBSession,
) -> SuccessResponse[list[TranslationResponse]]:
    # Verify report ownership
    report_result = await db.execute(
        select(Report).where(
            Report.id == report_id,
            Report.user_id == current_user.id,
            Report.is_deleted == False,
        )
    )
    if not report_result.scalar_one_or_none():
        raise ReportNotFoundError(identifier=report_id)

    result = await db.execute(
        select(Translation)
        .where(Translation.report_id == report_id)
        .order_by(Translation.created_at.desc())
    )
    translations = list(result.scalars().all())

    return SuccessResponse(
        message=f"Found {len(translations)} translation(s) for this report.",
        data=[TranslationResponse.model_validate(t) for t in translations],
    )


# ==============================================================================
# DELETE /api/v1/translation/{translation_id}
# ==============================================================================

@router.delete(
    "/{translation_id}",
    response_model=SuccessResponse,
    status_code=status.HTTP_200_OK,
    summary="Delete a translation",
)
async def delete_translation(
    translation_id: str,
    current_user: VerifiedUser,
    db: DBSession,
    redis: Cache,
) -> SuccessResponse:
    result = await db.execute(
        select(Translation)
        .join(Report, Report.id == Translation.report_id)
        .where(
            Translation.id == translation_id,
            Report.user_id == current_user.id,
        )
    )
    translation = result.scalar_one_or_none()
    if not translation:
        raise ResourceNotFoundError("Translation", translation_id)

    # Evict cache
    cache_key = RedisManager.translation_key(translation.report_id, translation.language_code)
    await redis.delete(cache_key)

    await db.delete(translation)
    await db.flush()

    return SuccessResponse(message="Translation deleted successfully.")
