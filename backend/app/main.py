"""
ArogyaGPT - FastAPI Application Entry Point
Production-grade application setup with all middleware, routers,
exception handlers, startup/shutdown lifecycle hooks, and health checks.
"""

import time
from contextlib import asynccontextmanager
from typing import AsyncGenerator

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.responses import JSONResponse

from app.core.config import settings
from app.core.logging import setup_logging, get_logger
from app.api.router import api_router
from app.api.middleware.exception_handler import register_exception_handlers
from app.api.middleware.logging_middleware import RequestLoggingMiddleware
from app.database.session import init_db, close_db
from app.cache.redis_manager import redis_manager

# Setup logging first — before anything else
setup_logging()
logger = get_logger(__name__)


# ==============================================================================
# Application Lifecycle
# ==============================================================================

@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """
    ASGI lifespan context manager.
    Code before yield runs on startup; code after yield runs on shutdown.
    """
    logger.info(
        f"🚀 Starting ArogyaGPT API v{settings.APP_VERSION} "
        f"[{settings.ENVIRONMENT.upper()}]"
    )

    # --- Startup ---
    try:
        # Initialize Redis
        await redis_manager.connect()

        # Initialize database tables (development only — use Alembic in production)
        if settings.is_development:
            await init_db()
        else:
            logger.info("Production mode: skipping auto create_all. Use Alembic migrations.")

        # Ensure upload directories exist
        from pathlib import Path
        Path(settings.UPLOAD_DIR).mkdir(parents=True, exist_ok=True)
        Path(settings.TTS_OUTPUT_DIR).mkdir(parents=True, exist_ok=True)
        Path(settings.FAISS_INDEX_PATH).mkdir(parents=True, exist_ok=True)
        Path("./logs").mkdir(parents=True, exist_ok=True)

        # Warm up RAG embedding model in background so first user upload is instant
        import asyncio
        from app.services.rag_service import RAGService
        asyncio.create_task(asyncio.to_thread(RAGService()._get_embedding_model))

        logger.info("✅ ArogyaGPT startup complete. Ready to serve requests.")

    except Exception as e:
        logger.error(f"❌ Startup failed: {e}")
        raise

    yield  # Application runs here

    # --- Shutdown ---
    logger.info("🛑 Shutting down ArogyaGPT API...")

    await redis_manager.disconnect()
    await close_db()

    logger.info("✅ ArogyaGPT shutdown complete.")


# ==============================================================================
# FastAPI Application
# ==============================================================================

app = FastAPI(
    title=settings.APP_NAME,
    description=settings.APP_DESCRIPTION,
    version=settings.APP_VERSION,
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
    lifespan=lifespan,
    contact={
        "name": "ArogyaGPT Team",
        "email": "support@arogyagpt.com",
    },
    license_info={
        "name": "MIT",
        "url": "https://opensource.org/licenses/MIT",
    },
)


# ==============================================================================
# Middleware Stack (order matters — outer middleware runs first)
# ==============================================================================

# 1. Trusted Hosts
if settings.is_production:
    app.add_middleware(
        TrustedHostMiddleware,
        allowed_hosts=settings.ALLOWED_HOSTS,
    )

# 2. GZip Compression
app.add_middleware(GZipMiddleware, minimum_size=1000)

# 3. CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=settings.CORS_ALLOW_CREDENTIALS,
    allow_methods=settings.CORS_ALLOW_METHODS,
    allow_headers=settings.CORS_ALLOW_HEADERS,
)

# 4. Request Logging (custom middleware)
app.add_middleware(RequestLoggingMiddleware)


# ==============================================================================
# Exception Handlers
# ==============================================================================

register_exception_handlers(app)


# ==============================================================================
# Security Headers Middleware
# ==============================================================================

@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    """Add security headers to all responses."""
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    if settings.is_production:
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    return response


# ==============================================================================
# API Routers
# ==============================================================================

app.include_router(api_router)


# ==============================================================================
# Health & Utility Endpoints
# ==============================================================================

@app.get(
    "/",
    tags=["Health"],
    include_in_schema=True,
    summary="API Root",
)
async def root():
    """API root — confirms the service is running."""
    return {
        "success": True,
        "service": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "environment": settings.ENVIRONMENT,
        "docs": "/docs",
        "redoc": "/redoc",
    }


@app.get(
    "/health",
    tags=["Health"],
    summary="Comprehensive health check",
    description="Returns health status of all dependent services (DB, Redis).",
)
async def health_check():
    """
    Liveness and readiness probe endpoint.
    Returns service status for load balancers and orchestration systems.
    """
    health: dict = {
        "status": "healthy",
        "version": settings.APP_VERSION,
        "environment": settings.ENVIRONMENT,
        "services": {},
    }

    # Check Redis
    health["services"]["redis"] = {
        "status": "connected" if redis_manager.is_connected else "disconnected",
    }

    # Check database
    try:
        from app.database.session import engine
        from sqlalchemy import text
        async with engine.connect() as conn:
            await conn.execute(text("SELECT 1"))
        health["services"]["database"] = {"status": "connected"}
    except Exception as e:
        health["services"]["database"] = {"status": "error", "detail": str(e)}
        health["status"] = "degraded"

    status_code = 200 if health["status"] == "healthy" else 503
    return JSONResponse(content=health, status_code=status_code)


@app.get("/health/live", tags=["Health"], include_in_schema=False)
async def liveness():
    """Simple liveness probe — just confirms the process is running."""
    return {"status": "alive"}


@app.get("/health/ready", tags=["Health"], include_in_schema=False)
async def readiness():
    """Readiness probe — confirms the app is ready to accept traffic."""
    return {"status": "ready"}
