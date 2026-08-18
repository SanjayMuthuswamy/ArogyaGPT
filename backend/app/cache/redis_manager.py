"""
ArogyaGPT - Redis Cache Manager
Async Redis client for caching, token blacklisting, and session management.
"""

from typing import Any, Optional
import json

import redis.asyncio as aioredis
from loguru import logger

from app.core.config import settings


class RedisManager:
    """
    Async Redis connection manager.

    Provides:
    - Generic key-value cache with TTL
    - JWT token blacklisting
    - Rate limiting counters
    - Session storage
    """

    def __init__(self) -> None:
        self._client: Optional[aioredis.Redis] = None
        self._blacklist_client: Optional[aioredis.Redis] = None

    async def connect(self) -> None:
        """Initialize Redis connection pool."""
        try:
            self._client = await aioredis.from_url(
                settings.REDIS_URL,
                encoding="utf-8",
                decode_responses=True,
                max_connections=20,
            )
            self._blacklist_client = await aioredis.from_url(
                settings.REDIS_URL.rsplit("/", 1)[0] + f"/{settings.REDIS_TOKEN_BLACKLIST_DB}",
                encoding="utf-8",
                decode_responses=True,
                max_connections=10,
            )
            # Ping to verify connection
            await self._client.ping()
            logger.info("Redis connection established successfully.")
        except Exception as e:
            logger.warning(f"Redis connection failed: {e}. Falling back to no-cache mode.")
            self._client = None
            self._blacklist_client = None

    async def disconnect(self) -> None:
        """Close Redis connections."""
        if self._client:
            await self._client.aclose()
        if self._blacklist_client:
            await self._blacklist_client.aclose()
        logger.info("Redis connections closed.")

    @property
    def is_connected(self) -> bool:
        return self._client is not None

    # --- Generic Cache ---

    async def get(self, key: str) -> Optional[Any]:
        """Get a value from the cache by key."""
        if not self._client:
            return None
        try:
            value = await self._client.get(key)
            if value is None:
                return None
            try:
                return json.loads(value)
            except (json.JSONDecodeError, TypeError):
                return value
        except Exception as e:
            logger.error(f"Redis GET error for key '{key}': {e}")
            return None

    async def set(
        self,
        key: str,
        value: Any,
        ttl_seconds: int = settings.REDIS_TTL_SECONDS,
    ) -> bool:
        """Set a value in the cache with TTL."""
        if not self._client:
            return False
        try:
            serialized = json.dumps(value) if not isinstance(value, str) else value
            await self._client.setex(key, ttl_seconds, serialized)
            return True
        except Exception as e:
            logger.error(f"Redis SET error for key '{key}': {e}")
            return False

    async def delete(self, key: str) -> bool:
        """Delete a cache key."""
        if not self._client:
            return False
        try:
            await self._client.delete(key)
            return True
        except Exception as e:
            logger.error(f"Redis DELETE error for key '{key}': {e}")
            return False

    async def delete_pattern(self, pattern: str) -> int:
        """Delete all keys matching a pattern (use with caution)."""
        if not self._client:
            return 0
        try:
            keys = await self._client.keys(pattern)
            if keys:
                return await self._client.delete(*keys)
            return 0
        except Exception as e:
            logger.error(f"Redis DELETE PATTERN error for '{pattern}': {e}")
            return 0

    async def exists(self, key: str) -> bool:
        """Check if a cache key exists."""
        if not self._client:
            return False
        try:
            return bool(await self._client.exists(key))
        except Exception:
            return False

    async def expire(self, key: str, ttl_seconds: int) -> bool:
        """Set or update TTL on an existing key."""
        if not self._client:
            return False
        try:
            return bool(await self._client.expire(key, ttl_seconds))
        except Exception:
            return False

    # --- Token Blacklist ---

    async def blacklist_token(self, jti: str, ttl_seconds: int) -> bool:
        """
        Add a JWT ID (jti) to the blacklist.
        The TTL should match the token's remaining lifetime.
        """
        if not self._blacklist_client:
            logger.warning("Token blacklist unavailable (Redis offline). Token cannot be revoked.")
            return False
        try:
            key = f"blacklist:jti:{jti}"
            await self._blacklist_client.setex(key, ttl_seconds, "1")
            logger.debug(f"Token JTI blacklisted: {jti}")
            return True
        except Exception as e:
            logger.error(f"Failed to blacklist token JTI '{jti}': {e}")
            return False

    async def is_token_blacklisted(self, jti: str) -> bool:
        """Check if a JWT JTI is in the blacklist."""
        if not self._blacklist_client:
            return False  # If Redis is down, cannot verify — allow token (fail open)
        try:
            key = f"blacklist:jti:{jti}"
            return bool(await self._blacklist_client.exists(key))
        except Exception as e:
            logger.error(f"Blacklist check error for JTI '{jti}': {e}")
            return False

    # --- Rate Limiting ---

    async def increment_counter(self, key: str, ttl_seconds: int = 60) -> int:
        """
        Increment a counter for rate limiting.
        Returns the current count after incrementing.
        """
        if not self._client:
            return 0
        try:
            pipe = self._client.pipeline()
            pipe.incr(key)
            pipe.expire(key, ttl_seconds)
            results = await pipe.execute()
            return results[0]
        except Exception as e:
            logger.error(f"Redis INCR error for key '{key}': {e}")
            return 0

    async def get_counter(self, key: str) -> int:
        """Get the current value of a rate limit counter."""
        if not self._client:
            return 0
        try:
            value = await self._client.get(key)
            return int(value) if value else 0
        except Exception:
            return 0

    # --- Cache Key Builders ---

    @staticmethod
    def user_profile_key(user_id: str) -> str:
        return f"cache:user:profile:{user_id}"

    @staticmethod
    def report_list_key(user_id: str, page: int) -> str:
        return f"cache:report:list:{user_id}:{page}"

    @staticmethod
    def report_detail_key(report_id: str) -> str:
        return f"cache:report:detail:{report_id}"

    @staticmethod
    def translation_key(report_id: str, language: str) -> str:
        return f"cache:translation:{report_id}:{language}"

    @staticmethod
    def rate_limit_key(ip: str, endpoint: str) -> str:
        return f"rate_limit:{ip}:{endpoint}"

    @staticmethod
    def auth_rate_limit_key(ip: str) -> str:
        return f"rate_limit:auth:{ip}"


# Singleton instance
redis_manager = RedisManager()


async def get_redis() -> RedisManager:
    """FastAPI dependency to inject the Redis manager."""
    return redis_manager
