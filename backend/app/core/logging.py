"""
ArogyaGPT - Logging Configuration
Structured logging using Loguru with request tracing support.
"""

import sys
import logging
from pathlib import Path
from loguru import logger

from app.core.config import settings


class InterceptHandler(logging.Handler):
    """
    Intercept standard logging messages and redirect them to Loguru.
    This ensures all library logs (SQLAlchemy, uvicorn, etc.) go through Loguru.
    """

    def emit(self, record: logging.LogRecord) -> None:
        try:
            level = logger.level(record.levelname).name
        except ValueError:
            level = record.levelno

        frame, depth = logging.currentframe(), 2
        while frame.f_code.co_filename == logging.__file__:
            frame = frame.f_back  # type: ignore
            depth += 1

        logger.opt(depth=depth, exception=record.exc_info).log(
            level, record.getMessage()
        )


def setup_logging() -> None:
    """
    Configure Loguru as the global logging handler.
    Sets up console and file sinks with rotation and retention.
    """
    # Remove default Loguru handler
    logger.remove()

    # Determine log format
    if settings.LOG_JSON_FORMAT:
        log_format = (
            '{{"time":"{time:YYYY-MM-DD HH:mm:ss.SSS}", '
            '"level":"{level}", '
            '"name":"{name}", '
            '"message":"{message}", '
            '"function":"{function}", '
            '"line":{line}}}'
        )
    else:
        log_format = (
            "<green>{time:YYYY-MM-DD HH:mm:ss.SSS}</green> | "
            "<level>{level: <8}</level> | "
            "<cyan>{name}</cyan>:<cyan>{function}</cyan>:<cyan>{line}</cyan> | "
            "<level>{message}</level>"
        )

    # Console sink
    logger.add(
        sys.stderr,
        format=log_format,
        level=settings.LOG_LEVEL,
        colorize=not settings.LOG_JSON_FORMAT,
        backtrace=settings.DEBUG,
        diagnose=settings.DEBUG,
    )

    # File sink
    log_file_path = Path(settings.LOG_FILE)
    log_file_path.parent.mkdir(parents=True, exist_ok=True)

    logger.add(
        str(log_file_path),
        format=log_format,
        level=settings.LOG_LEVEL,
        rotation=settings.LOG_ROTATION,
        retention=settings.LOG_RETENTION,
        compression="zip",
        backtrace=True,
        diagnose=settings.DEBUG,
        enqueue=True,  # Thread-safe logging
    )

    # Intercept standard library logging
    logging.basicConfig(handlers=[InterceptHandler()], level=0, force=True)

    # Silence noisy loggers in production
    if settings.is_production:
        for noisy_logger in ["uvicorn.access", "sqlalchemy.engine"]:
            logging.getLogger(noisy_logger).setLevel(logging.WARNING)

    logger.info(
        f"Logging configured | level={settings.LOG_LEVEL} | "
        f"env={settings.ENVIRONMENT} | file={settings.LOG_FILE}"
    )


def get_logger(name: str):
    """Get a named logger instance."""
    return logger.bind(module=name)
