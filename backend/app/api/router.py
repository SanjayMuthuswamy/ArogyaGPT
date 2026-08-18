"""
ArogyaGPT - Main API Router
Assembles all v1 sub-routers into a single API router.
"""

from fastapi import APIRouter

from app.api.v1.auth import router as auth_router
from app.api.v1.users import router as users_router
from app.api.v1.reports import router as reports_router
from app.api.v1.chat import router as chat_router
from app.api.v1.translation import router as translation_router
from app.api.v1.voice import router as voice_router
from app.api.v1.admin import router as admin_router
from app.api.v1.system import router as system_router
from app.websocket.router import router as ws_router

# Main router with v1 prefix
api_router = APIRouter(prefix="/api/v1")

# --- REST API sub-routers ---
api_router.include_router(auth_router)
api_router.include_router(users_router)
api_router.include_router(reports_router)
api_router.include_router(chat_router)
api_router.include_router(translation_router)
api_router.include_router(voice_router)
api_router.include_router(admin_router)
api_router.include_router(system_router)

# --- WebSocket sub-router ---
api_router.include_router(ws_router)
