from datetime import datetime

from pydantic import BaseModel, Field

from app.models.enums import (
    TelegramAccountStatus,
    TelegramChannelType,
    TelegramMessageStatus,
)
from app.schemas.common import IDTimestamped


class TelegramStatusResponse(BaseModel):
    status: TelegramAccountStatus
    telegram_username: str | None = None
    vip_active: bool = False
    vip_granted_at: datetime | None = None


class TelegramConnectResponse(BaseModel):
    verification_code: str
    bot_username_hint: str
    expires_at: datetime
    instructions: str


class TelegramVerifyRequest(BaseModel):
    telegram_user_id: str = Field(min_length=1, max_length=64)
    verification_code: str = Field(min_length=4, max_length=16)
    telegram_username: str | None = None


class TelegramMessageRead(IDTimestamped):
    channel_type: TelegramChannelType
    content: str
    status: TelegramMessageStatus
    requires_approval: bool
    scheduled_for: datetime | None
    sent_at: datetime | None
    error_detail: str | None


class TelegramSendTestRequest(BaseModel):
    content: str = Field(min_length=1, max_length=4000)
    channel_type: TelegramChannelType = TelegramChannelType.PUBLIC
