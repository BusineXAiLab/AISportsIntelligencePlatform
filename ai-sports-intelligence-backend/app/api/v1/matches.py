import uuid

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.schemas.matches import (
    LeagueRead,
    MatchRead,
    MatchTimeline,
    TeamForm,
    TeamRead,
)
from app.services.match_service import MatchService

router = APIRouter(tags=["matches"])


@router.get("/matches/today", response_model=list[MatchRead])
async def matches_today(db: AsyncSession = Depends(get_db)) -> list[MatchRead]:
    fixtures = await MatchService(db).get_today()
    return [MatchRead.model_validate(f) for f in fixtures]


@router.get("/matches/upcoming", response_model=list[MatchRead])
async def matches_upcoming(
    days: int = Query(7, ge=1, le=30),
    league_id: uuid.UUID | None = None,
    db: AsyncSession = Depends(get_db),
) -> list[MatchRead]:
    fixtures = await MatchService(db).get_upcoming(days=days, league_id=league_id)
    return [MatchRead.model_validate(f) for f in fixtures]


@router.get("/matches/{match_id}", response_model=MatchRead)
async def match_detail(match_id: uuid.UUID, db: AsyncSession = Depends(get_db)) -> MatchRead:
    return MatchRead.model_validate(await MatchService(db).get_match(match_id))


@router.get("/matches/{match_id}/timeline", response_model=MatchTimeline)
async def match_timeline(
    match_id: uuid.UUID, db: AsyncSession = Depends(get_db)
) -> MatchTimeline:
    return MatchTimeline.model_validate(await MatchService(db).get_timeline(match_id))


@router.get("/leagues", response_model=list[LeagueRead])
async def list_leagues(db: AsyncSession = Depends(get_db)) -> list[LeagueRead]:
    leagues = await MatchService(db).list_leagues()
    return [LeagueRead.model_validate(league) for league in leagues]


@router.get("/teams/{team_id}", response_model=TeamRead)
async def team_detail(team_id: uuid.UUID, db: AsyncSession = Depends(get_db)) -> TeamRead:
    return TeamRead.model_validate(await MatchService(db).get_team(team_id))


@router.get("/teams/{team_id}/form", response_model=TeamForm)
async def team_form(team_id: uuid.UUID, db: AsyncSession = Depends(get_db)) -> TeamForm:
    return TeamForm.model_validate(await MatchService(db).get_team_form(team_id))
