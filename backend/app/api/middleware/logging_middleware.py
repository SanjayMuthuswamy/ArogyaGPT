"""
ArogyaGPT - Request Logging Middleware
Logs every HTTP request and response with timing and request ID tracing.
"""

import time
import uuid
from typing import Callable

from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.types import ASGIApp

from app.core.logging import get_logger

logger = get_logger(__name__)


class RequestLoggingMiddleware(BaseHTTPMiddleware):
    """
    ASGI middleware that logs every request/response with:
    - Unique request ID (X-Request-ID header)
    - HTTP method and path
    - Response status code
    - Processing duration in milliseconds
    - Client IP
    """

    def __init__(self, app: ASGIApp) -> None:
        super().__init__(app)

    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        # Generate or inherit request ID
        request_id = request.headers.get("X-Request-ID", str(uuid.uuid4()))
        start_time = time.perf_counter()

        # Get client IP
        client_ip = (
            request.headers.get("X-Forwarded-For", "").split(",")[0].strip()
            or request.headers.get("X-Real-IP", "")
            or (request.client.host if request.client else "unknown")
        )

        # Log incoming request
        logger.info(
            f"→ {request.method} {request.url.path} | "
            f"ip={client_ip} | request_id={request_id}"
        )

        # Process request
        response = await call_next(request)

        # Calculate duration
        duration_ms = (time.perf_counter() - start_time) * 1000

        # Inject request ID and timing into response headers
        response.headers["X-Request-ID"] = request_id
        response.headers["X-Response-Time"] = f"{duration_ms:.2f}ms"

        # Log response
        log_level = "info" if response.status_code < 400 else "warning"
        if response.status_code >= 500:
            log_level = "error"

        getattr(logger, log_level)(
            f"← {request.method} {request.url.path} | "
            f"status={response.status_code} | "
            f"duration={duration_ms:.2f}ms | "
            f"request_id={request_id}"
        )

        return response
