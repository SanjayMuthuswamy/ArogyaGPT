"""
ArogyaGPT - Celery Worker
Asynchronous background task processing for OCR, embeddings, translation, voice, and email.
"""

from celery import Celery
from celery.utils.log import get_task_logger
from app.core.config import settings

# Initialize Celery app
celery_app = Celery(
    "arogyagpt",
    broker=settings.CELERY_BROKER_URL,
    backend=settings.CELERY_RESULT_BACKEND,
)

# Configure Celery
celery_app.conf.update(
    task_serializer=settings.CELERY_TASK_SERIALIZER,
    result_serializer=settings.CELERY_RESULT_SERIALIZER,
    accept_content=settings.CELERY_ACCEPT_CONTENT,
    timezone=settings.CELERY_TIMEZONE,
    enable_utc=True,
    task_track_started=True,
    task_acks_late=True,
    worker_prefetch_multiplier=1,  # Process one task at a time per worker
    result_expires=3600,           # Expire task results after 1 hour
    task_soft_time_limit=300,      # Soft limit: 5 minutes
    task_time_limit=600,           # Hard limit: 10 minutes
)

# Auto-discover tasks in the workers module
celery_app.autodiscover_tasks(["app.workers"])

logger = get_task_logger(__name__)
