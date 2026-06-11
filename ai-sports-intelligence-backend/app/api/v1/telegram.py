from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.permissions import get_current_user, require_admin
from app.models.user import User
from app.schemas.common import MessageResponse
from app.schemas.telegram import (
    TelegramConnectResponse,
    TelegramMessageRead,
    TelegramSendTestRequest,
    TelegramStatusResponse,
    TelegramVerifyRequest,
)
from app.services.telegram_service import TelegramService

router = APIRouter(prefix="/telegram", tags=["telegram"])


@router.get("/status", response_model=TelegramStatusResponse)
async def telegram_status(
    user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)
) -> TelegramStatusResponse:
    return TelegramStatusResponse(**await TelegramService(db).get_status(user))


@router.post("/connect", response_model=TelegramConnectResponse)
async def telegram_connect(
    user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)
) -> TelegramConnectResponse:
    return TelegramConnectResponse(**await TelegramService(db).start_connect(user))


@router.post("/verify", response_model=TelegramStatusResponse)
async def telegram_verify(
    payload: TelegramVerifyRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> TelegramStatusResponse:
    service = TelegramService(db)
    await service.verify(
        user,
        telegram_user_id=payload.telegram_user_id,
        verification_code=payload.verification_code,
        telegram_username=payload.telegram_username,
    )
    return TelegramStatusResponse(**await service.get_status(user))


@router.post("/disconnect", response_model=MessageResponse)
async def telegram_disconnect(
    user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)
) -> MessageResponse:
    await TelegramService(db).disconnect(user)
    return MessageResponse(message="Telegram account disconnected")


@router.post("/send-test", response_model=TelegramMessageRead)
async def telegram_send_test(
    payload: TelegramSendTestRequest,
    admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
) -> TelegramMessageRead:
    message = await TelegramService(db).send_test(admin, payload.content, payload.channel_type)
    return TelegramMessageRead.model_validate(message)
