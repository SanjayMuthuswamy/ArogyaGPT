"""
ArogyaGPT - WebSocket Manager
Connection registry and broadcast system for real-time pipeline updates.
"""

import json
from typing import Optional
from fastapi import WebSocket
from app.core.logging import get_logger

logger = get_logger(__name__)


class ConnectionManager:
    """
    WebSocket connection registry.

    Maintains a mapping of user_id → list[WebSocket] to support
    multi-device sessions. Enables targeted broadcasts to specific users.
    """

    def __init__(self) -> None:
        # user_id → list of active WebSocket connections
        self._connections: dict[str, list[WebSocket]] = {}
        # report_id → list of WebSocket connections watching that report
        self._report_watchers: dict[str, list[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, user_id: str) -> None:
        """Accept and register a new WebSocket connection."""
        await websocket.accept()
        if user_id not in self._connections:
            self._connections[user_id] = []
        self._connections[user_id].append(websocket)
        logger.info(f"WebSocket connected: user_id={user_id} | total={self._count()}")

    def disconnect(self, websocket: WebSocket, user_id: str) -> None:
        """Remove a disconnected WebSocket."""
        if user_id in self._connections:
            self._connections[user_id] = [
                ws for ws in self._connections[user_id] if ws != websocket
            ]
            if not self._connections[user_id]:
                del self._connections[user_id]

        # Remove from report watchers
        for report_id, watchers in list(self._report_watchers.items()):
            self._report_watchers[report_id] = [w for w in watchers if w != websocket]
            if not self._report_watchers[report_id]:
                del self._report_watchers[report_id]

        logger.info(f"WebSocket disconnected: user_id={user_id} | total={self._count()}")

    def watch_report(self, websocket: WebSocket, report_id: str) -> None:
        """Register a connection as watching a specific report."""
        if report_id not in self._report_watchers:
            self._report_watchers[report_id] = []
        if websocket not in self._report_watchers[report_id]:
            self._report_watchers[report_id].append(websocket)

    async def send_to_user(self, user_id: str, message: dict) -> None:
        """Send a JSON message to all connections for a specific user."""
        connections = self._connections.get(user_id, [])
        dead_connections = []
        for ws in connections:
            try:
                await ws.send_json(message)
            except Exception:
                dead_connections.append(ws)

        # Clean up dead connections
        for ws in dead_connections:
            self._connections[user_id] = [
                c for c in self._connections[user_id] if c != ws
            ]

    async def broadcast_report_update(self, report_id: str, event: dict) -> None:
        """Broadcast a pipeline event to all clients watching a specific report."""
        watchers = self._report_watchers.get(report_id, [])
        dead = []
        for ws in watchers:
            try:
                await ws.send_json(event)
            except Exception:
                dead.append(ws)

        for ws in dead:
            self._report_watchers[report_id] = [
                w for w in self._report_watchers[report_id] if w != ws
            ]

    async def broadcast_all(self, message: dict) -> None:
        """Broadcast a message to all connected clients (admin use)."""
        for user_id, connections in self._connections.items():
            for ws in connections:
                try:
                    await ws.send_json(message)
                except Exception:
                    pass

    def _count(self) -> int:
        """Total number of active connections."""
        return sum(len(conns) for conns in self._connections.values())

    @property
    def active_users(self) -> list[str]:
        """List of currently connected user IDs."""
        return list(self._connections.keys())


# Singleton connection manager
connection_manager = ConnectionManager()


def build_pipeline_event(
    report_id: str,
    stage: str,
    status: str,
    progress_pct: int = 0,
    message: Optional[str] = None,
    data: Optional[dict] = None,
) -> dict:
    """
    Build a standardized pipeline progress event payload.

    Args:
        report_id: UUID of the report being processed.
        stage: Current pipeline stage name.
        status: 'processing' | 'completed' | 'failed'.
        progress_pct: Estimated completion percentage (0-100).
        message: Human-readable status message.
        data: Optional additional payload.

    Returns:
        Dict ready to serialize as WebSocket JSON message.
    """
    return {
        "type": "pipeline_update",
        "report_id": report_id,
        "stage": stage,
        "status": status,
        "progress_pct": progress_pct,
        "message": message or f"Stage: {stage} — {status}",
        "data": data or {},
    }
