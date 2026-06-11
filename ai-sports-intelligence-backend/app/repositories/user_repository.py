import uuid

from sqlalchemy import func, select

from app.models.enums import SubscriptionPlan, UserRole
from app.models.user import RefreshToken, User, UserPreferences, WatchlistItem
from app.repositories.base import BaseRepository


class UserRepository(BaseRepository[User]):
    model = User

    async def get_by_email(self, email: str) -> User | None:
        result = await self.db.execute(
            select(User).where(User.email == email.lower(), User.deleted_at.is_(None))
        )
        return result.scalar_one_or_none()

    async def get_by_verification_token(self, token: str) -> User | None:
        result = await self.db.execute(
            select(User).where(User.email_verification_token == token)
        )
        return result.scalar_one_or_none()

    async def get_by_reset_token(self, token: str) -> User | None:
        result = await self.db.execute(select(User).where(User.password_reset_token == token))
        return result.scalar_one_or_none()

    async def get_by_stripe_customer(self, customer_id: str) -> User | None:
        result = await self.db.execute(
            select(User).where(User.stripe_customer_id == customer_id)
        )
        return result.scalar_one_or_none()

    async def get_preferences(self, user_id: uuid.UUID) -> UserPreferences | None:
        result = await self.db.execute(
            select(UserPreferences).where(UserPreferences.user_id == user_id)
        )
        return result.scalar_one_or_none()

    async def get_watchlist(self, user_id: uuid.UUID) -> list[WatchlistItem]:
        result = await self.db.execute(
            select(WatchlistItem)
            .where(WatchlistItem.user_id == user_id)
            .order_by(WatchlistItem.created_at.desc())
        )
        return list(result.scalars().all())

    async def get_refresh_token(self, jti: str) -> RefreshToken | None:
        result = await self.db.execute(select(RefreshToken).where(RefreshToken.jti == jti))
        return result.scalar_one_or_none()

    async def count_by_plan(self) -> dict[str, int]:
        result = await self.db.execute(
            select(User.plan, func.count(User.id))
            .where(User.deleted_at.is_(None))
            .group_by(User.plan)
        )
        return {plan.value: count for plan, count in result.all()}

    async def count_active(self) -> int:
        result = await self.db.execute(
            select(func.count(User.id)).where(
                User.is_active.is_(True), User.deleted_at.is_(None)
            )
        )
        return result.scalar_one()

    async def count_total(self) -> int:
        result = await self.db.execute(
            select(func.count(User.id)).where(User.deleted_at.is_(None))
        )
        return result.scalar_one()

    def list_query(
        self,
        role: UserRole | None = None,
        plan: SubscriptionPlan | None = None,
        search: str | None = None,
    ):
        query = select(User).where(User.deleted_at.is_(None)).order_by(User.created_at.desc())
        if role:
            query = query.where(User.role == role)
        if plan:
            query = query.where(User.plan == plan)
        if search:
            pattern = f"%{search.lower()}%"
            query = query.where(
                func.lower(User.email).like(pattern) | func.lower(User.full_name).like(pattern)
            )
        return query
