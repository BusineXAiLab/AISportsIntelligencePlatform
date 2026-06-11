"""Telegram Bot API client using httpx."""
from typing import Any

import httpx

from app.core.config import settings
from app.core.exceptions import ExternalServiceError
from app.core.logging import get_logger
from app.models.enums import TelegramChannelType

logger = get_logger(__name__)

BASE_URL = "https://api.telegram.org"


class TelegramClient:
    def __init__(self, bot_token: str | None = None) -> None:
        self.bot_token = bot_token or settings.TELEGRAM_BOT_TOKEN

    @property
    def _api_base(self) -> str:
        return f"{BASE_URL}/bot{self.bot_token}"

    def channel_id_for(self, channel_type: TelegramChannelType) -> str:
        if channel_type == TelegramChannelType.VIP:
            return settings.TELEGRAM_VIP_CHANNEL_ID
        return settings.TELEGRAM_PUBLIC_CHANNEL_ID

    async def _call(self, method: str, payload: dict[str, Any]) -> dict[str, Any]:
        if not self.bot_token:
            raise ExternalServiceError("Telegram bot token is not configured")
        async with httpx.AsyncClient(timeout=15) as client:
            response = await client.post(f"{self._api_base}/{method}", json=payload)
        data = response.json()
        if not data.get("ok"):
            description = data.get("description", "unknown error")
            logger.error("telegram_api_error", method=method, description=description)
            raise ExternalServiceError(f"Telegram API error: {description}")
        return data["result"]

    async def send_message(
        self, chat_id: str, text: str, parse_mode: str = "HTML"
    ) -> dict[str, Any]:
        return await self._call(
            "sendMessage",
            {"chat_id": chat_id, "text": text, "parse_mode": parse_mode,
             "disable_web_page_preview": True},
        )

    async def send_channel_message(
        self, channel_type: TelegramChannelType, text: str
    ) -> dict[str, Any]:
        return await self.send_message(self.channel_id_for(channel_type), text)

    async def create_vip_invite_link(self, member_limit: int = 1) -> str:
        result = await self._call(
            "createChatInviteLink",
            {"chat_id": settings.TELEGRAM_VIP_CHANNEL_ID, "member_limit": member_limit},
        )
        return result["invite_link"]

    async def kick_from_vip(self, telegram_user_id: str) -> None:
        """Ban then unban so the user is removed but can rejoin if re-invited."""
        chat_id = settings.TELEGRAM_VIP_CHANNEL_ID
        await self._call("banChatMember", {"chat_id": chat_id, "user_id": int(telegram_user_id)})
        await self._call(
            "unbanChatMember",
            {"chat_id": chat_id, "user_id": int(telegram_user_id), "only_if_banned": True},
        )

    async def get_me(self) -> dict[str, Any]:
        return await self._call("getMe", {})


telegram_client = TelegramClient()
