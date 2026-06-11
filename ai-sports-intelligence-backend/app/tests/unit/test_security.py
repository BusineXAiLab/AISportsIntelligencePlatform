import pytest

from app.core.exceptions import UnauthorizedError
from app.core.security import (
    create_access_token,
    create_refresh_token,
    decode_token,
    hash_password,
    verify_password,
)


class TestPasswordHashing:
    def test_hash_and_verify(self):
        hashed = hash_password("SuperSecret123!")
        assert hashed != "SuperSecret123!"
        assert verify_password("SuperSecret123!", hashed)

    def test_wrong_password_fails(self):
        hashed = hash_password("SuperSecret123!")
        assert not verify_password("WrongPassword", hashed)


class TestJWT:
    def test_access_token_roundtrip(self):
        token = create_access_token("user-123", "FREE_USER")
        payload = decode_token(token, "access")
        assert payload["sub"] == "user-123"
        assert payload["role"] == "FREE_USER"
        assert payload["type"] == "access"

    def test_refresh_token_roundtrip(self):
        token = create_refresh_token("user-123")
        payload = decode_token(token, "refresh")
        assert payload["sub"] == "user-123"
        assert "jti" in payload

    def test_wrong_token_type_rejected(self):
        token = create_access_token("user-123", "FREE_USER")
        with pytest.raises(UnauthorizedError):
            decode_token(token, "refresh")

    def test_garbage_token_rejected(self):
        with pytest.raises(UnauthorizedError):
            decode_token("not-a-token", "access")
