"""Role-based access control helpers and FastAPI dependencies."""
import uuid

from fastapi import Depends
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.exceptions import ForbiddenError, UnauthorizedError
from app.core.security import decode_token
from app.models.enums import ADMIN_ROLES, SubscriptionPlan, UserRole
from app.models.user import User

bearer_scheme = HTTPBearer(auto_error=False)

PLAN_RANK = {SubscriptionPlan.FREE: 0, SubscriptionPlan.PREMIUM: 1, SubscriptionPlan.ELITE: 2}


async def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
    db: AsyncSession = Depends(get_db),
) -> User:
    if credentials is None:
        raise UnauthorizedError("Missing authorization header")
    payload = decode_token(credentials.credentials, "access")
    user = await db.get(User, uuid.UUID(payload["sub"]))
    if user is None or user.deleted_at is not None:
        raise UnauthorizedError("User not found")
    if not user.is_active:
        raise ForbiddenError("Account is disabled")
    return user


async def get_optional_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
    db: AsyncSession = Depends(get_db),
) -> User | None:
    if credentials is None:
        return None
    try:
        return await get_current_user(credentials, db)
    except UnauthorizedError:
        return None


class RequireRoles:
    """Dependency enforcing that the current user holds one of the given roles."""

    def __init__(self, *roles: UserRole) -> None:
        self.roles = set(roles)

    async def __call__(self, user: User = Depends(get_current_user)) -> User:
        if user.role not in self.roles:
            raise ForbiddenError("Insufficient role for this operation")
        return user


require_admin = RequireRoles(*ADMIN_ROLES)
require_super_admin = RequireRoles(UserRole.SUPER_ADMIN)
require_content_lead = RequireRoles(UserRole.CONTENT_LEAD, UserRole.ADMIN, UserRole.SUPER_ADMIN)


class RequirePlan:
    """Dependency enforcing a minimum subscription plan (entitlement gate)."""

    def __init__(self, minimum_plan: SubscriptionPlan) -> None:
        self.minimum_plan = minimum_plan

    async def __call__(
        self,
        user: User = Depends(get_current_user),
        db: AsyncSession = Depends(get_db),
    ) -> User:
        from app.services.entitlement_service import EntitlementService

        service = EntitlementService(db)
        if not await service.has_plan(user, self.minimum_plan):
            raise ForbiddenError(
                f"This feature requires the {self.minimum_plan.value} plan or higher"
            )
        return user


require_premium = RequirePlan(SubscriptionPlan.PREMIUM)
require_elite = RequirePlan(SubscriptionPlan.ELITE)


async def get_user_by_email(db: AsyncSession, email: str) -> User | None:
    result = await db.execute(select(User).where(User.email == email))
    return result.scalar_one_or_none()
