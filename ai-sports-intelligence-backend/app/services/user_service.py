"""User profile, preferences and watchlist management."""
import uuid

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import ConflictError, NotFoundError
from app.models.enums import TelegramAccountStatus
from app.models.user import User, UserPreferences, WatchlistItem
from app.repositories.telegram_repository import TelegramRepository
from app.repositories.user_repository import UserRepository
from app.schemas.users import PreferencesUpdate, UserUpdate, WatchlistItemCreate


class UserService:
    def __init__(self, db: AsyncSession) -> None:
        self.db = db
        self.users = UserRepository(db)
        self.telegram = TelegramRepository(db)

    async def get_profile(self, user: User) -> dict:
        prefs = await self.users.get_preferences(user.id)
        telegram_account = await self.telegram.get_for_user(user.id)
        return {
            "id": user.id,
            "email": user.email,
            "full_name": user.full_name,
            "role": user.role,
            "plan": user.plan,
            "is_active": user.is_active,
            "is_email_verified": user.is_email_verified,
            "favorite_teams": prefs.favorite_teams if prefs else [],
            "favorite_leagues": prefs.favorite_leagues if prefs else [],
            "notification_preferences": prefs.notification_preferences if prefs else {},
            "telegram_status": (
                telegram_account.status
                if telegram_account
                else TelegramAccountStatus.NOT_CONNECTED
            ),
            "created_at": user.created_at,
            "updated_at": user.updated_at,
        }

    async def update_profile(self, user: User, data: UserUpdate) -> User:
        if data.full_name is not None:
            user.full_name = data.full_name
        await self.db.flush()
        return user

    async def get_or_create_preferences(self, user: User) -> UserPreferences:
        prefs = await self.users.get_preferences(user.id)
        if prefs is None:
            prefs = UserPreferences(user_id=user.id)
            self.db.add(prefs)
            await self.db.flush()
        return prefs

    async def update_preferences(self, user: User, data: PreferencesUpdate) -> UserPreferences:
        prefs = await self.get_or_create_preferences(user)
        for attr in (
            "favorite_teams",
            "favorite_leagues",
            "notification_preferences",
            "timezone",
            "language",
        ):
            value = getattr(data, attr)
            if value is not None:
                setattr(prefs, attr, value)
        await self.db.flush()
        return prefs

    async def get_watchlist(self, user: User) -> list[WatchlistItem]:
        return await self.users.get_watchlist(user.id)

    async def add_watchlist_item(self, user: User, data: WatchlistItemCreate) -> WatchlistItem:
        existing = await self.users.get_watchlist(user.id)
        for item in existing:
            if item.entity_type == data.entity_type and item.entity_id == data.entity_id:
                raise ConflictError("Item is already in your watchlist")
        item = WatchlistItem(
            user_id=user.id,
            entity_type=data.entity_type,
            entity_id=data.entity_id,
            label=data.label,
        )
        self.db.add(item)
        await self.db.flush()
        return item

    async def remove_watchlist_item(self, user: User, item_id: uuid.UUID) -> None:
        items = await self.users.get_watchlist(user.id)
        target = next((i for i in items if i.id == item_id), None)
        if target is None:
            raise NotFoundError("Watchlist item not found")
        await self.db.delete(target)
        await self.db.flush()
