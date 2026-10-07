"""
ArogyaGPT - WebSocket Router
Real-time pipeline status updates via WebSocket.

Endpoints:
  WS  /api/v1/ws/pipeline/{report_id}  - Watch report processing progress
  WS  /api/v1/ws/notifications          - Receive general user notifications
"""

import asyncio
import json
from datetime import datetime, timezone

from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Query
from jose import JWTError

from app.core.security import decode_token
from app.core.logging import get_logger
from app.websocket.connection_manager import connection_manager, build_pipeline_event

logger = get_logger(__name__)

router = APIRouter(prefix="/ws", tags=["WebSocket"])


async def _authenticate_websocket(
    websocket: WebSocket,
    token: str,
) -> tuple[bool, str | None]:
    """
    Authenticate a WebSocket connection using a JWT token passed as a query param.

    Returns:
        Tuple of (is_valid: bool, user_id: str | None).
    """
    try:
        payload = decode_token(token)
        if payload.get("type") != "access":
            return False, None
        user_id = payload.get("sub")
        return bool(user_id), user_id
    except JWTError:
        return False, None


# ==============================================================================
# WS /api/v1/ws/pipeline/{report_id}
# ==============================================================================

@router.websocket("/pipeline/{report_id}")
async def websocket_pipeline_status(
    websocket: WebSocket,
    report_id: str,
    token: str = Query(..., description="JWT access token for authentication."),
):
    """
    WebSocket endpoint for real-time report processing pipeline updates.

    Connect with: ws://localhost:8000/api/v1/ws/pipeline/{report_id}?token=<access_token>

    Events received from server:
      - pipeline_update: Stage transitions with progress percentage
      - completed: Final success event with report summary
      - failed: Error event with failure reason
      - ping: Keepalive heartbeat (respond with pong)

    Events sent to server:
      - {"type": "pong"}: Keepalive response
      - {"type": "unwatch"}: Stop watching this report
    """
    # Authenticate
    is_valid, user_id = await _authenticate_websocket(websocket, token)
    if not is_valid:
        await websocket.close(code=4001, reason="Unauthorized: Invalid or expired token.")
        return

    # Accept and register
    await connection_manager.connect(websocket, user_id)
    connection_manager.watch_report(websocket, report_id)

    # Send initial connection confirmation
    await websocket.send_json({
        "type": "connected",
        "report_id": report_id,
        "message": f"Now watching pipeline for report {report_id}.",
        "timestamp": datetime.now(timezone.utc).isoformat(),
    })

    # Check current report status and send immediately
    try:
        from app.database.session import AsyncSessionLocal
        from sqlalchemy import select
        from app.models.report import Report

        async with AsyncSessionLocal() as db:
            result = await db.execute(
                select(Report).where(Report.id == report_id, Report.user_id == user_id)
            )
            report = result.scalar_one_or_none()

            if report:
                await websocket.send_json(build_pipeline_event(
                    report_id=report_id,
                    stage=report.pipeline_stage,
                    status=report.status,
                    progress_pct=_stage_to_progress(report.pipeline_stage),
                    message=f"Current stage: {report.pipeline_stage}",
                ))
            else:
                await websocket.send_json({
                    "type": "error",
                    "message": "Report not found or access denied.",
                })
                connection_manager.disconnect(websocket, user_id)
                return

    except Exception as e:
        logger.error(f"WebSocket DB check error: {e}")

    # Keep connection alive — handle incoming messages + heartbeat
    try:
        while True:
            try:
                # Wait for client message with timeout (heartbeat check)
                data = await asyncio.wait_for(
                    websocket.receive_text(),
                    timeout=30.0,
                )
                try:
                    message = json.loads(data)
                    msg_type = message.get("type")

                    if msg_type == "pong":
                        pass  # Heartbeat response
                    elif msg_type == "unwatch":
                        break
                    else:
                        await websocket.send_json({
                            "type": "error",
                            "message": f"Unknown message type: {msg_type}",
                        })
                except json.JSONDecodeError:
                    pass

            except asyncio.TimeoutError:
                # Send ping to check if client is still connected
                try:
                    await websocket.send_json({
                        "type": "ping",
                        "timestamp": datetime.now(timezone.utc).isoformat(),
                    })
                except Exception:
                    break

    except WebSocketDisconnect:
        logger.info(f"WebSocket disconnected: user={user_id} | report={report_id}")
    except Exception as e:
        logger.error(f"WebSocket error: user={user_id} | {e}")
    finally:
        connection_manager.disconnect(websocket, user_id)


# ==============================================================================
# WS /api/v1/ws/notifications
# ==============================================================================

@router.websocket("/notifications")
async def websocket_notifications(
    websocket: WebSocket,
    token: str = Query(..., description="JWT access token."),
):
    """
    WebSocket endpoint for general user notifications.

    Connect with: ws://localhost:8000/api/v1/ws/notifications?token=<access_token>

    Events received:
      - report_ready: Report processing completed
      - report_failed: Report processing failed
      - system: System-wide announcements
      - ping: Keepalive
    """
    is_valid, user_id = await _authenticate_websocket(websocket, token)
    if not is_valid:
        await websocket.close(code=4001, reason="Unauthorized.")
        return

    await connection_manager.connect(websocket, user_id)

    await websocket.send_json({
        "type": "connected",
        "message": "Notification channel active.",
        "timestamp": datetime.now(timezone.utc).isoformat(),
    })

    try:
        while True:
            try:
                data = await asyncio.wait_for(
                    websocket.receive_text(), timeout=30.0
                )
                try:
                    message = json.loads(data)
                    if message.get("type") == "pong":
                        pass
                except json.JSONDecodeError:
                    pass
            except asyncio.TimeoutError:
                try:
                    await websocket.send_json({
                        "type": "ping",
                        "timestamp": datetime.now(timezone.utc).isoformat(),
                    })
                except Exception:
                    break

    except WebSocketDisconnect:
        logger.info(f"Notification WebSocket disconnected: user={user_id}")
    finally:
        connection_manager.disconnect(websocket, user_id)


def _stage_to_progress(stage: str) -> int:
    """Map pipeline stage to estimated progress percentage."""
    stage_progress = {
        "uploaded": 5,
        "ocr_processing": 15,
        "ocr_completed": 25,
        "text_cleaning": 30,
        "entity_extraction": 40,
        "disease_detection": 50,
        "abnormality_detection": 60,
        "llm_simplification": 70,
        "translation": 80,
        "voice_generation": 85,
        "rag_indexing": 92,
        "completed": 100,
        "failed": 0,
    }
    return stage_progress.get(stage, 0)
