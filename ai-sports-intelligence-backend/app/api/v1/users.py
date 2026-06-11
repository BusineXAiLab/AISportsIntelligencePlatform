import uuid

from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.permissions import get_current_user
from app.models.user import User
from app.schemas.common import MessageResponse
from app.schemas.users import (
    PreferencesRead,
    PreferencesUpdate,
    UserProfile,
    UserUpdate,
    WatchlistItemCreate,
    WatchlistItemRead,
)
from app.services.user_service import UserService

router = APIRouter(prefix="/users", tags=["users"])


@router.get("/me", response_model=UserProfile)
async def get_me(
    user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)
) -> UserProfile:
    profile = await UserService(db).get_profile(user)
    return UserProfile.model_validate(profile)


@router.patch("/me", response_model=UserProfile)
async def update_me(
    payload: UserUpdate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> UserProfile:
    service = UserService(db)
    await service.update_profile(user, payload)
    return UserProfile.model_validate(await service.get_profile(user))


@router.get("/preferences", response_model=PreferencesRead)
async def get_preferences(
    user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)
) -> PreferencesRead:
    prefs = await UserService(db).get_or_create_preferences(user)
    return PreferencesRead.model_validate(prefs)


@router.patch("/preferences", response_model=PreferencesRead)
async def update_preferences(
    payload: PreferencesUpdate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> PreferencesRead:
    prefs = await UserService(db).update_preferences(user, payload)
    return PreferencesRead.model_validate(prefs)


@router.get("/watchlist", response_model=list[WatchlistItemRead])
async def get_watchlist(
    user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)
) -> list[WatchlistItemRead]:
    items = await UserService(db).get_watchlist(user)
    return [WatchlistItemRead.model_validate(item) for item in items]


@router.post("/watchlist", response_model=WatchlistItemRead,
             status_code=status.HTTP_201_CREATED)
async def add_watchlist_item(
    payload: WatchlistItemCreate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> WatchlistItemRead:
    item = await UserService(db).add_watchlist_item(user, payload)
    return WatchlistItemRead.model_validate(item)


@router.delete("/watchlist/{item_id}", response_model=MessageResponse)
async def remove_watchlist_item(
    item_id: uuid.UUID,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> MessageResponse:
    await UserService(db).remove_watchlist_item(user, item_id)
    return MessageResponse(message="Removed from watchlist")
