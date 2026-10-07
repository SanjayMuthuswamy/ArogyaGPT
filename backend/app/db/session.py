"""
Compatibility shim: app.db.session → app.database.session
Old code imported from app.db.session. This shim re-exports everything
from the new location to avoid breaking changes during migration.
"""

from app.database.session import Base, engine, AsyncSessionLocal, get_db, init_db, close_db

__all__ = ["Base", "engine", "AsyncSessionLocal", "get_db", "init_db", "close_db"]
