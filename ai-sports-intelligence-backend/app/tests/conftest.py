"""Shared test fixtures.

Integration tests require a running PostgreSQL (see DATABASE_URL); they are
skipped automatically when the database is unreachable.
"""
import asyncio

import pytest
import pytest_asyncio
from httpx import ASGITransport, AsyncClient

from app.core.database import Base, async_session_factory, engine


def _database_available() -> bool:
    async def check() -> bool:
        try:
            async with engine.connect():
                return True
        except Exception:  # noqa: BLE001
            return False

    try:
        return asyncio.run(check())
    except RuntimeError:
        return False


DATABASE_AVAILABLE = _database_available()

requires_database = pytest.mark.skipif(
    not DATABASE_AVAILABLE, reason="PostgreSQL is not available"
)


@pytest_asyncio.fixture
async def db_schema():
    """Create all tables before the test and drop them afterwards."""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)


@pytest_asyncio.fixture
async def db_session(db_schema):
    async with async_session_factory() as session:
        yield session
        await session.rollback()


@pytest_asyncio.fixture
async def client(db_schema):
    from app.main import app

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as test_client:
        yield test_client
