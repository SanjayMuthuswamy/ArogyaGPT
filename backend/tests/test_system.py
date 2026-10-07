"""
ArogyaGPT - System Maintenance Tests
Unit tests for system maintenance endpoints.
"""

import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
class TestSystemAPI:
    """Tests for /api/v1/system endpoints."""

    async def test_ping(self, client: AsyncClient):
        """Ping endpoint returns pong and online status."""
        response = await client.get("/api/v1/system/ping")
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert data["message"] == "pong"
        assert data["data"]["status"] == "online"
