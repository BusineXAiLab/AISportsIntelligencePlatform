import uuid
from datetime import datetime

from pydantic import BaseModel

from app.models.enums import FixtureStatus
from app.schemas.common import IDTimestamped, ORMModel


class LeagueRead(IDTimestamped):
    name: str
    country: str | None
    code: str
    logo_url: str | None
    is_active: bool


class TeamRead(IDTimestamped):
    name: str
    short_name: str | None
    country: str | None
    logo_url: str | None
    league_id: uuid.UUID | None


class ResultRead(ORMModel):
    home_score: int
    away_score: int
    half_time_home_score: int | None
    half_time_away_score: int | None
    finalized_at: datetime | None


class MatchRead(IDTimestamped):
    league: LeagueRead
    home_team: TeamRead
    away_team: TeamRead
    kickoff_time: datetime
    status: FixtureStatus
    referee: str | None
    result: ResultRead | None = None


class MatchTimelineEvent(BaseModel):
    minute: int | None = None
    event_type: str
    team: str | None = None
    player: str | None = None
    detail: str | None = None


class MatchTimeline(BaseModel):
    match_id: uuid.UUID
    status: FixtureStatus
    events: list[MatchTimelineEvent]


class TeamFormEntry(BaseModel):
    fixture_id: uuid.UUID
    opponent: str
    kickoff_time: datetime
    home_or_away: str
    goals_for: int
    goals_against: int
    outcome: str  # W | D | L


class TeamForm(BaseModel):
    team_id: uuid.UUID
    team_name: str
    last_matches: list[TeamFormEntry]
    wins: int
    draws: int
    losses: int
    goals_scored: int
    goals_conceded: int
    form_string: str  # e.g. "WWDLW"
