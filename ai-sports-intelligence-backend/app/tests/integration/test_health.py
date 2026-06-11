import pytest

from app.tests.conftest import requires_database

pytestmark = [requires_database, pytest.mark.asyncio]


class TestHealth:
    async def test_liveness(self, client):
        response = await client.get("/api/v1/health/live")
        assert response.status_code == 200
        assert response.json()["status"] == "ok"

    async def test_readiness(self, client):
        response = await client.get("/api/v1/health/ready")
        assert response.status_code == 200

    async def test_full_health(self, client):
        response = await client.get("/api/v1/health")
        assert response.status_code == 200
        assert response.json()["checks"]["database"] == "ok"
