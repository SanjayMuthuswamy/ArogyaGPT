"""
ArogyaGPT - Database Session Manager
Async SQLAlchemy 2.0 engine, session factory, and dependency injection.
"""

from typing import AsyncGenerator

from sqlalchemy.ext.asyncio import (
    AsyncEngine,
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)
from sqlalchemy.orm import DeclarativeBase

from app.core.config import settings
from app.core.logging import get_logger

logger = get_logger(__name__)


class Base(DeclarativeBase):
    """
    SQLAlchemy declarative base for all ORM models.
    All models must inherit from this class.
    """
    pass


# --- Async Engine ---
engine_kwargs = {
    "echo": settings.DATABASE_ECHO,
}
if "sqlite" not in settings.DATABASE_URL:
    engine_kwargs.update({
        "pool_size": settings.DATABASE_POOL_SIZE,
        "max_overflow": settings.DATABASE_MAX_OVERFLOW,
        "pool_timeout": settings.DATABASE_POOL_TIMEOUT,
        "pool_recycle": settings.DATABASE_POOL_RECYCLE,
        "pool_pre_ping": True,
    })

engine: AsyncEngine = create_async_engine(
    settings.DATABASE_URL,
    **engine_kwargs
)

# --- Async Session Factory ---
AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """
    FastAPI dependency that provides a database session per request.
    Ensures the session is properly closed after each request.

    Yields:
        AsyncSession: An active database session.
    """
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()


async def init_db() -> None:
    """
    Initialize database by creating all tables.
    Should be called once on application startup.
    Use Alembic for production migrations.
    """
    logger.info("Initializing database tables...")
    async with engine.begin() as conn:
        # Import all models to register them with Base
        from app.models import (  # noqa: F401
            user,
            refresh_token,
            report,
            chat,
            translation,
            voice,
            audit,
        )
        await conn.run_sync(Base.metadata.create_all)
    logger.info("Database tables initialized successfully.")

    # Seed default user and admin if not exists
    try:
        from sqlalchemy import select
        from app.models.user import User
        from app.models.report import Report, LabResult, Abnormality, Diagnosis
        from app.core.security import hash_password
        import uuid

        async with AsyncSessionLocal() as session:
            res = await session.execute(select(User).where(User.email == "alex@arogyagpt.com"))
            alex_user = res.scalar_one_or_none()
            if not alex_user:
                alex_user = User(
                    id=str(uuid.uuid4()),
                    email="alex@arogyagpt.com",
                    hashed_password=hash_password("arogyagpt123"),
                    full_name="Alex Mercer",
                    role="patient",
                    preferred_language="ta",
                    is_active=True,
                    is_email_verified=True,
                )
                session.add(alex_user)
                await session.flush()
                logger.info("Seeded default test user: alex@arogyagpt.com")

            res = await session.execute(select(User).where(User.email == settings.FIRST_ADMIN_EMAIL.lower()))
            if not res.scalar_one_or_none():
                admin_user = User(
                    id=str(uuid.uuid4()),
                    email=settings.FIRST_ADMIN_EMAIL.lower(),
                    hashed_password=hash_password(settings.FIRST_ADMIN_PASSWORD),
                    full_name="System Admin",
                    role="admin",
                    is_superuser=True,
                    preferred_language="en",
                    is_active=True,
                    is_email_verified=True,
                )
                session.add(admin_user)
                await session.flush()
                logger.info(f"Seeded admin user: {settings.FIRST_ADMIN_EMAIL}")

            await session.commit()
    except Exception as e:
        logger.warning(f"Database seeding skipped or failed: {e}")


async def close_db() -> None:
    """Dispose the database engine connection pool on shutdown."""
    await engine.dispose()
    logger.info("Database connection pool closed.")
