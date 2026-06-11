"""Create an admin user.

Usage:
    python scripts/create_admin_user.py --email admin@example.com --password Secret123! \
        --name "Platform Admin" --role SUPER_ADMIN
"""
import argparse
import asyncio
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.core.database import async_session_factory  # noqa: E402
from app.core.security import hash_password  # noqa: E402
from app.models.enums import SubscriptionPlan, UserRole  # noqa: E402
from app.models.user import User, UserPreferences  # noqa: E402
from app.repositories.user_repository import UserRepository  # noqa: E402


async def create_admin(email: str, password: str, name: str, role: str) -> None:
    async with async_session_factory() as session:
        repository = UserRepository(session)
        existing = await repository.get_by_email(email)
        if existing is not None:
            print(f"User {email} already exists (role={existing.role.value})")
            return
        user = User(
            email=email.lower(),
            hashed_password=hash_password(password),
            full_name=name,
            role=UserRole(role),
            plan=SubscriptionPlan.ELITE,
            is_email_verified=True,
        )
        session.add(user)
        await session.flush()
        session.add(UserPreferences(user_id=user.id))
        await session.commit()
        print(f"Created {role} user: {email}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Create an admin user")
    parser.add_argument("--email", required=True)
    parser.add_argument("--password", required=True)
    parser.add_argument("--name", default="Platform Admin")
    parser.add_argument(
        "--role",
        default=UserRole.SUPER_ADMIN.value,
        choices=[UserRole.ADMIN.value, UserRole.CONTENT_LEAD.value, UserRole.SUPER_ADMIN.value],
    )
    args = parser.parse_args()
    asyncio.run(create_admin(args.email, args.password, args.name, args.role))
