"""
ArogyaGPT - Chat & RAG Integration Tests
Comprehensive unit and integration tests for ChatService and Chat API endpoints.
"""

import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
class TestChatAPI:
    """Tests for /api/v1/chat endpoints."""

    async def test_ask_question_unauthenticated(self, client: AsyncClient):
        """Unauthenticated request to ask endpoint returns 401."""
        response = await client.post(
            "/api/v1/chat/ask",
            json={"question": "What is hemoglobin?"},
        )
        assert response.status_code == 401

    async def test_create_chat_session(
        self, client: AsyncClient, auth_headers: dict
    ):
        """Authenticated user can create a chat session."""
        response = await client.post(
            "/api/v1/chat/sessions",
            headers=auth_headers,
            json={
                "title": "General Health Query",
                "language_code": "en",
            },
        )
        assert response.status_code == 201
        data = response.json()
        assert data["success"] is True
        assert data["data"]["title"] == "General Health Query"
        assert "id" in data["data"]

    async def test_list_chat_sessions(
        self, client: AsyncClient, auth_headers: dict
    ):
        """List chat sessions returns paginated session list."""
        # Create two sessions first
        await client.post(
            "/api/v1/chat/sessions",
            headers=auth_headers,
            json={"title": "Session 1"},
        )
        await client.post(
            "/api/v1/chat/sessions",
            headers=auth_headers,
            json={"title": "Session 2"},
        )

        response = await client.get("/api/v1/chat/sessions", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert data["meta"]["total"] >= 2

    async def test_delete_chat_session(
        self, client: AsyncClient, auth_headers: dict
    ):
        """Deleting a session soft-deletes it."""
        create_res = await client.post(
            "/api/v1/chat/sessions",
            headers=auth_headers,
            json={"title": "To Delete"},
        )
        session_id = create_res.json()["data"]["id"]

        del_res = await client.delete(
            f"/api/v1/chat/sessions/{session_id}",
            headers=auth_headers,
        )
        assert del_res.status_code == 200

        # Subsequent fetch should return 404
        get_res = await client.get(
            f"/api/v1/chat/sessions/{session_id}",
            headers=auth_headers,
        )
        assert get_res.status_code == 404


@pytest.mark.asyncio
class TestTranslationAPI:
    """Tests for /api/v1/translation endpoints."""

    async def test_list_supported_languages(self, client: AsyncClient):
        """List supported languages returns 12 Indian languages."""
        response = await client.get("/api/v1/translation/languages")
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert "hi" in data["data"]["languages"]
        assert "ta" in data["data"]["languages"]
        assert data["data"]["total"] >= 12


@pytest.mark.asyncio
class TestVoiceAPI:
    """Tests for /api/v1/voice endpoints."""

    async def test_list_voice_history_empty(
        self, client: AsyncClient, auth_headers: dict
    ):
        """Voice history starts empty for new user."""
        response = await client.get("/api/v1/voice/history", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert data["meta"]["total"] == 0
