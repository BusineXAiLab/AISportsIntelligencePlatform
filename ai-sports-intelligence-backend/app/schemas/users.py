import uuid
from datetime import datetime

from pydantic import BaseModel, Field

from app.models.enums import SubscriptionPlan, TelegramAccountStatus, UserRole
from app.schemas.common import IDTimestamped, ORMModel


class UserRead(IDTimestamped):
    email: str
    full_name: str
    role: UserRole
    plan: SubscriptionPlan
    is_active: bool
    is_email_verified: bool


class UserProfile(UserRead):
    favorite_teams: list[str] = []
    favorite_leagues: list[str] = []
    notification_preferences: dict = {}
    telegram_status: TelegramAccountStatus = TelegramAccountStatus.NOT_CONNECTED


class UserUpdate(BaseModel):
    full_name: str | None = Field(default=None, min_length=1, max_length=255)


class PreferencesRead(ORMModel):
    favorite_teams: list
    favorite_leagues: list
    notification_preferences: dict
    timezone: str
    language: str


class PreferencesUpdate(BaseModel):
    favorite_teams: list[str] | None = None
    favorite_leagues: list[str] | None = None
    notification_preferences: dict | None = None
    timezone: str | None = None
    language: str | None = None


class WatchlistItemCreate(BaseModel):
    entity_type: str = Field(pattern="^(team|league|match)$")
    entity_id: uuid.UUID
    label: str | None = None


class WatchlistItemRead(IDTimestamped):
    entity_type: str
    entity_id: uuid.UUID
    label: str | None


class AdminUserUpdate(BaseModel):
    full_name: str | None = None
    role: UserRole | None = None
    plan: SubscriptionPlan | None = None
    is_active: bool | None = None


class UserAdminRead(UserRead):
    stripe_customer_id: str | None
    last_login_at: datetime | None
    deleted_at: datetime | None
