"""
ArogyaGPT - Test Configuration
Pytest fixtures for database, auth, and API client testing.
"""

import asyncio
from typing import AsyncGenerator

import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from app.main import app
from app.database.session import Base, get_db
from app.core.security import hash_password, create_access_token
from app.core.constants import UserRole


# Use in-memory SQLite for tests (no PostgreSQL required for unit tests)
TEST_DATABASE_URL = "sqlite+aiosqlite:///:memory:"


@pytest.fixture(scope="session")
def event_loop():
    """Create a single event loop for all tests."""
    loop = asyncio.new_event_loop()
    yield loop
    loop.close()


@pytest_asyncio.fixture(scope="function")
async def test_db() -> AsyncGenerator[AsyncSession, None]:
    """Create a fresh test database for each test function."""
    engine = create_async_engine(TEST_DATABASE_URL, echo=False)
    session_factory = async_sessionmaker(engine, expire_on_commit=False)

    async with engine.begin() as conn:
        from app.models import (  # noqa: F401
            User, RefreshToken, Report, ReportFile, ReportVersion,
            ExtractedText, ReportChunk, Abnormality, Diagnosis,
            Medicine, LabResult, Translation, VoiceRequest,
            ChatSession, ChatMessage, AuditLog, APIUsage,
        )
        await conn.run_sync(Base.metadata.create_all)

    async with session_factory() as session:
        yield session

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)

    await engine.dispose()


@pytest_asyncio.fixture(scope="function")
async def client(test_db: AsyncSession) -> AsyncGenerator[AsyncClient, None]:
    """HTTP test client with DB override."""
    async def override_get_db():
        yield test_db

    app.dependency_overrides[get_db] = override_get_db

    async with AsyncClient(
        transport=ASGITransport(app=app),
        base_url="http://testserver",
    ) as ac:
        yield ac

    app.dependency_overrides.clear()


@pytest_asyncio.fixture
async def test_user(test_db: AsyncSession):
    """Create a verified test user."""
    import uuid
    from app.models.user import User

    user = User(
        id=str(uuid.uuid4()),
        email="testuser@arogyagpt.com",
        full_name="Test User",
        hashed_password=hash_password("TestPassword@123"),
        role=UserRole.PATIENT.value,
        is_active=True,
        is_email_verified=True,
        preferred_language="en",
    )
    test_db.add(user)
    await test_db.commit()
    return user


@pytest_asyncio.fixture
async def auth_headers(test_user) -> dict:
    """JWT auth headers for the test user."""
    token = create_access_token(subject=test_user.id, role=test_user.role)
    return {"Authorization": f"Bearer {token}"}


@pytest_asyncio.fixture
async def admin_user(test_db: AsyncSession):
    """Create an admin test user."""
    import uuid
    from app.models.user import User

    user = User(
        id=str(uuid.uuid4()),
        email="admin@arogyagpt.com",
        full_name="Admin User",
        hashed_password=hash_password("AdminPassword@123"),
        role=UserRole.ADMIN.value,
        is_active=True,
        is_email_verified=True,
        is_superuser=True,
        preferred_language="en",
    )
    test_db.add(user)
    await test_db.commit()
    return user
