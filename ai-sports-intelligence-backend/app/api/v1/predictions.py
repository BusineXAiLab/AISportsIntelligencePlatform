import uuid

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.pagination import PageParams, build_page, paginate
from app.core.permissions import get_current_user, get_optional_user
from app.models.user import User
from app.repositories.prediction_repository import PredictionRepository
from app.schemas.common import PageResponse
from app.schemas.predictions import (
    AccuracySummary,
    ModelStatusInfo,
    PredictionWithMatch,
)
from app.services.accuracy_service import AccuracyService
from app.services.prediction_service import PredictionService

router = APIRouter(prefix="/predictions", tags=["predictions"])


@router.get("/today", response_model=list[PredictionWithMatch])
async def predictions_today(
    user: User | None = Depends(get_optional_user),
    db: AsyncSession = Depends(get_db),
) -> list[PredictionWithMatch]:
    service = PredictionService(db)
    predictions = await service.get_today()
    payloads = [
        await service.redact_for_plan(user, service.to_match_payload(p))
        for p in predictions
    ]
    return [PredictionWithMatch.model_validate(p) for p in payloads]


@router.get("/history", response_model=PageResponse[PredictionWithMatch])
async def predictions_history(
    params: PageParams = Depends(),
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> PageResponse[PredictionWithMatch]:
    service = PredictionService(db)
    query = PredictionRepository(db).history_query()
    rows, total = await paginate(db, query, params)
    items = [
        PredictionWithMatch.model_validate(
            await service.redact_for_plan(user, service.to_match_payload(p))
        )
        for p in rows
    ]
    return PageResponse[PredictionWithMatch](**build_page(items, total, params))


@router.get("/accuracy", response_model=AccuracySummary)
async def prediction_accuracy(
    model_version: str | None = None, db: AsyncSession = Depends(get_db)
) -> AccuracySummary:
    summary = await AccuracyService(db).summary(model_version=model_version)
    return AccuracySummary.model_validate(summary)


@router.get("/model-status", response_model=list[ModelStatusInfo])
async def model_status(db: AsyncSession = Depends(get_db)) -> list[ModelStatusInfo]:
    statuses = await PredictionService(db).model_status()
    return [ModelStatusInfo.model_validate(s) for s in statuses]


@router.get("/{match_id}", response_model=PredictionWithMatch)
async def prediction_for_match(
    match_id: uuid.UUID,
    user: User | None = Depends(get_optional_user),
    db: AsyncSession = Depends(get_db),
) -> PredictionWithMatch:
    service = PredictionService(db)
    prediction = await service.get_for_match(match_id)
    payload = await service.redact_for_plan(user, service.to_match_payload(prediction))
    return PredictionWithMatch.model_validate(payload)
