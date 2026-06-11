"""End-to-end auth flow against the real app and database."""
import pytest

from app.tests.conftest import requires_database

pytestmark = [requires_database, pytest.mark.asyncio]

REGISTER_PAYLOAD = {
    "email": "tester@example.com",
    "password": "StrongPass123!",
    "full_name": "Integration Tester",
}


class TestAuthFlow:
    async def test_register_login_refresh_logout(self, client):
        # Register
        response = await client.post("/api/v1/auth/register", json=REGISTER_PAYLOAD)
        assert response.status_code == 201, response.text
        body = response.json()
        assert body["email"] == REGISTER_PAYLOAD["email"]
        assert body["role"] == "FREE_USER"

        # Duplicate registration rejected
        response = await client.post("/api/v1/auth/register", json=REGISTER_PAYLOAD)
        assert response.status_code == 409

        # Login
        response = await client.post(
            "/api/v1/auth/login",
            json={"email": REGISTER_PAYLOAD["email"], "password": REGISTER_PAYLOAD["password"]},
        )
        assert response.status_code == 200, response.text
        tokens = response.json()
        assert tokens["access_token"]
        assert tokens["refresh_token"]

        # Authenticated profile
        headers = {"Authorization": f"Bearer {tokens['access_token']}"}
        response = await client.get("/api/v1/users/me", headers=headers)
        assert response.status_code == 200
        assert response.json()["email"] == REGISTER_PAYLOAD["email"]

        # Refresh rotates tokens
        response = await client.post(
            "/api/v1/auth/refresh", json={"refresh_token": tokens["refresh_token"]}
        )
        assert response.status_code == 200
        new_tokens = response.json()
        assert new_tokens["refresh_token"] != tokens["refresh_token"]

        # Old refresh token is now revoked
        response = await client.post(
            "/api/v1/auth/refresh", json={"refresh_token": tokens["refresh_token"]}
        )
        assert response.status_code == 401

        # Logout
        response = await client.post(
            "/api/v1/auth/logout", json={"refresh_token": new_tokens["refresh_token"]}
        )
        assert response.status_code == 200

    async def test_login_with_bad_password(self, client):
        await client.post("/api/v1/auth/register", json=REGISTER_PAYLOAD)
        response = await client.post(
            "/api/v1/auth/login",
            json={"email": REGISTER_PAYLOAD["email"], "password": "WrongPassword1!"},
        )
        assert response.status_code == 401
