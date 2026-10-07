"""
ArogyaGPT - Exception Handler Middleware
Converts all application exceptions to standardized JSON responses.
Maps custom exceptions and FastAPI/Pydantic validation errors to the
standard response envelope.
"""

import traceback
from typing import Any

from fastapi import FastAPI, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from pydantic import ValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException

from app.core.exceptions import ArogyaGPTException
from app.core.logging import get_logger

logger = get_logger(__name__)


def register_exception_handlers(app: FastAPI) -> None:
    """Register all exception handlers on the FastAPI app."""

    @app.exception_handler(ArogyaGPTException)
    async def arogyagpt_exception_handler(
        request: Request, exc: ArogyaGPTException
    ) -> JSONResponse:
        """Handle all custom application exceptions."""
        logger.warning(
            f"App error [{exc.status_code}]: {exc.message} | "
            f"path={request.url.path} | errors={exc.errors}"
        )
        return JSONResponse(
            status_code=exc.status_code,
            content={
                "success": False,
                "message": exc.message,
                "errors": exc.errors,
                "status": exc.status_code,
            },
            headers=exc.headers,
        )

    @app.exception_handler(RequestValidationError)
    async def request_validation_handler(
        request: Request, exc: RequestValidationError
    ) -> JSONResponse:
        """Handle Pydantic validation errors from request parsing."""
        errors: dict[str, list[str]] = {}
        for error in exc.errors():
            field_path = " → ".join(str(loc) for loc in error["loc"] if loc != "body")
            if not field_path:
                field_path = "request"
            errors.setdefault(field_path, []).append(error["msg"])

        logger.warning(
            f"Validation error | path={request.url.path} | errors={errors}"
        )
        return JSONResponse(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            content={
                "success": False,
                "message": "Request validation failed.",
                "errors": errors,
                "status": 422,
            },
        )

    @app.exception_handler(StarletteHTTPException)
    async def http_exception_handler(
        request: Request, exc: StarletteHTTPException
    ) -> JSONResponse:
        """Handle generic FastAPI/Starlette HTTP exceptions."""
        logger.warning(
            f"HTTP error [{exc.status_code}]: {exc.detail} | path={request.url.path}"
        )
        return JSONResponse(
            status_code=exc.status_code,
            content={
                "success": False,
                "message": str(exc.detail),
                "errors": {},
                "status": exc.status_code,
            },
        )

    @app.exception_handler(Exception)
    async def unhandled_exception_handler(
        request: Request, exc: Exception
    ) -> JSONResponse:
        """Catch-all handler for unexpected errors."""
        logger.error(
            f"Unhandled exception | path={request.url.path} | "
            f"type={type(exc).__name__} | error={str(exc)}\n"
            f"{traceback.format_exc()}"
        )
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={
                "success": False,
                "message": "An internal server error occurred. Our team has been notified.",
                "errors": {},
                "status": 500,
            },
        )
