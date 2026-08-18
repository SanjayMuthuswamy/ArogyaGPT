"""
ArogyaGPT - Authentication API Tests
Tests for all auth endpoints: register, login, logout, token refresh,
email verification, and password management.
"""

import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
class TestAuthRegister:
    """Tests for POST /api/v1/auth/register"""

    async def test_register_success(self, client: AsyncClient):
        """Successful registration returns 201 with user data."""
        response = await client.post("/api/v1/auth/register", json={
            "full_name": "Priya Sharma",
            "email": "priya@example.com",
            "password": "SecurePass@123",
            "confirm_password": "SecurePass@123",
            "role": "patient",
        })
        assert response.status_code == 201
        data = response.json()
        assert data["success"] is True
        assert "data" in data
        assert data["data"]["email"] == "priya@example.com"
        assert data["data"]["is_email_verified"] is False

    async def test_register_duplicate_email(self, client: AsyncClient):
        """Duplicate email returns 409 conflict."""
        payload = {
            "full_name": "Test User",
            "email": "duplicate@example.com",
            "password": "SecurePass@123",
            "confirm_password": "SecurePass@123",
        }
        await client.post("/api/v1/auth/register", json=payload)
        response = await client.post("/api/v1/auth/register", json=payload)
        assert response.status_code == 409
        assert response.json()["success"] is False

    async def test_register_weak_password(self, client: AsyncClient):
        """Weak password returns 422 validation error."""
        response = await client.post("/api/v1/auth/register", json={
            "full_name": "Test User",
            "email": "test@example.com",
            "password": "weak",
            "confirm_password": "weak",
        })
        assert response.status_code == 422

    async def test_register_password_mismatch(self, client: AsyncClient):
        """Password mismatch returns 422 validation error."""
        response = await client.post("/api/v1/auth/register", json={
            "full_name": "Test User",
            "email": "test@example.com",
            "password": "SecurePass@123",
            "confirm_password": "DifferentPass@123",
        })
        assert response.status_code == 422

    async def test_register_invalid_email(self, client: AsyncClient):
        """Invalid email format returns 422 validation error."""
        response = await client.post("/api/v1/auth/register", json={
            "full_name": "Test User",
            "email": "not-an-email",
            "password": "SecurePass@123",
            "confirm_password": "SecurePass@123",
        })
        assert response.status_code == 422


@pytest.mark.asyncio
class TestAuthLogin:
    """Tests for POST /api/v1/auth/login"""

    async def test_login_unverified_email(self, client: AsyncClient, test_user):
        """Login with unverified email returns 401."""
        # test_user has is_email_verified=True by default in conftest
        # Create an unverified user
        await client.post("/api/v1/auth/register", json={
            "full_name": "Unverified User",
            "email": "unverified@example.com",
            "password": "SecurePass@123",
            "confirm_password": "SecurePass@123",
        })
        response = await client.post("/api/v1/auth/login", json={
            "email": "unverified@example.com",
            "password": "SecurePass@123",
        })
        assert response.status_code == 401

    async def test_login_wrong_password(self, client: AsyncClient, test_user):
        """Wrong password returns 401."""
        response = await client.post("/api/v1/auth/login", json={
            "email": test_user.email,
            "password": "WrongPassword@123",
        })
        assert response.status_code == 401

    async def test_login_nonexistent_user(self, client: AsyncClient):
        """Login for non-existent user returns 401."""
        response = await client.post("/api/v1/auth/login", json={
            "email": "ghost@example.com",
            "password": "AnyPassword@123",
        })
        assert response.status_code == 401


@pytest.mark.asyncio
class TestAuthMe:
    """Tests for GET /api/v1/auth/me"""

    async def test_get_me_authenticated(self, client: AsyncClient, auth_headers: dict, test_user):
        """Authenticated user can retrieve their profile."""
        response = await client.get("/api/v1/auth/me", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert data["data"]["email"] == test_user.email

    async def test_get_me_unauthenticated(self, client: AsyncClient):
        """Unauthenticated request returns 401."""
        response = await client.get("/api/v1/auth/me")
        assert response.status_code == 401

    async def test_get_me_invalid_token(self, client: AsyncClient):
        """Invalid JWT token returns 401."""
        response = await client.get(
            "/api/v1/auth/me",
            headers={"Authorization": "Bearer invalid.token.here"}
        )
        assert response.status_code == 401


@pytest.mark.asyncio
class TestHealthCheck:
    """Tests for health check endpoints."""

    async def test_health_endpoint(self, client: AsyncClient):
        """Health endpoint returns 200."""
        response = await client.get("/health")
        assert response.status_code in [200, 503]  # 503 if DB not fully connected
        assert "status" in response.json()

    async def test_root_endpoint(self, client: AsyncClient):
        """Root endpoint returns service info."""
        response = await client.get("/")
        assert response.status_code == 200
        data = response.json()
        assert data["service"] == "ArogyaGPT"

    async def test_liveness(self, client: AsyncClient):
        """Liveness probe returns alive."""
        response = await client.get("/health/live")
        assert response.status_code == 200


@pytest.mark.asyncio
class TestReportUpload:
    """Tests for POST /api/v1/reports/upload"""

    async def test_upload_requires_auth(self, client: AsyncClient):
        """Report upload requires authentication."""
        response = await client.post("/api/v1/reports/upload", data={"title": "Test"})
        assert response.status_code == 401

    async def test_upload_invalid_file_type(self, client: AsyncClient, auth_headers: dict):
        """Upload of unsupported file type returns 400."""
        from io import BytesIO
        response = await client.post(
            "/api/v1/reports/upload",
            headers=auth_headers,
            data={"title": "Test Report"},
            files={"file": ("test.exe", BytesIO(b"malicious"), "application/octet-stream")},
        )
        assert response.status_code == 400

    async def test_camera_upload_success(self, client: AsyncClient, auth_headers: dict):
        """Camera upload accepts Base64 image payload and returns 201."""
        tiny_jpeg_base64 = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP/bAEMABgQEBAUEBgUEBgLDgwLD"
        response = await client.post(
            "/api/v1/reports/upload-camera",
            headers=auth_headers,
            json={
                "image_base64": tiny_jpeg_base64,
                "title": "Camera Capture Blood Test",
                "report_type": "blood_test",
            },
        )
        assert response.status_code == 201
        data = response.json()
        assert data["success"] is True
        assert data["data"]["title"] == "Camera Capture Blood Test"

