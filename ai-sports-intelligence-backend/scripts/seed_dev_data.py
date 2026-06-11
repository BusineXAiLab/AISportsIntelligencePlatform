"""Seed development data: users, leagues, teams, fixtures, predictions, reports.

Usage:
    python scripts/seed_dev_data.py
"""
import asyncio
import sys
from datetime import UTC, datetime, timedelta
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from sqlalchemy import select  # noqa: E402

from app.core.database import async_session_factory  # noqa: E402
from app.core.security import hash_password  # noqa: E402
from app.models.enums import (  # noqa: E402
    ConfidenceLevel,
    FixtureStatus,
    ModelStatus,
    PredictionStatus,
    ReportStatus,
    ReportType,
    RiskLevel,
    SubscriptionPlan,
    TelegramAccountStatus,
    UserRole,
)
from app.models.league import League  # noqa: E402
from app.models.match import Fixture  # noqa: E402
from app.models.model_registry import ModelRegistryEntry  # noqa: E402
from app.models.prediction import Prediction, PredictionFeatureSnapshot  # noqa: E402
from app.models.report import Report  # noqa: E402
from app.models.team import Team  # noqa: E402
from app.models.telegram import TelegramAccount  # noqa: E402
from app.models.user import User, UserPreferences  # noqa: E402

LEAGUES = [
    ("EPL", "Premier League", "England"),
    ("LALIGA", "La Liga", "Spain"),
    ("SERIEA", "Serie A", "Italy"),
    ("BUNDESLIGA", "Bundesliga", "Germany"),
    ("UCL", "UEFA Champions League", "Europe"),
]

TEAMS = {
    "EPL": ["Manchester City", "Chelsea", "Arsenal", "Liverpool"],
    "LALIGA": ["Real Madrid", "Barcelona"],
    "SERIEA": ["Inter Milan", "Juventus"],
    "BUNDESLIGA": ["Bayern Munich", "Borussia Dortmund"],
    "UCL": [],
}

USERS = [
    ("admin@sportsai.local", "AdminPass123!", "Platform Admin", UserRole.SUPER_ADMIN,
     SubscriptionPlan.ELITE),
    ("free@sportsai.local", "FreePass123!", "Free User", UserRole.FREE_USER,
     SubscriptionPlan.FREE),
    ("premium@sportsai.local", "PremiumPass123!", "Premium User", UserRole.PREMIUM_USER,
     SubscriptionPlan.PREMIUM),
    ("elite@sportsai.local", "ElitePass123!", "Elite User", UserRole.ELITE_USER,
     SubscriptionPlan.ELITE),
]


async def seed() -> None:
    async with async_session_factory() as session:
        existing = (
            await session.execute(select(User).where(User.email == USERS[0][0]))
        ).scalar_one_or_none()
        if existing is not None:
            print("Seed data already present, skipping.")
            return

        # Users
        users: dict[str, User] = {}
        for email, password, name, role, plan in USERS:
            user = User(
                email=email,
                hashed_password=hash_password(password),
                full_name=name,
                role=role,
                plan=plan,
                is_email_verified=True,
            )
            session.add(user)
            await session.flush()
            session.add(
                UserPreferences(
                    user_id=user.id,
                    favorite_teams=["Manchester City"],
                    favorite_leagues=["Premier League"],
                )
            )
            users[email] = user

        # Telegram status sample
        session.add(
            TelegramAccount(
                user_id=users["premium@sportsai.local"].id,
                telegram_user_id="100200300",
                telegram_username="premium_fan",
                status=TelegramAccountStatus.VIP_ACTIVE,
                vip_granted_at=datetime.now(UTC),
            )
        )

        # Leagues and teams
        leagues: dict[str, League] = {}
        teams: dict[str, Team] = {}
        for code, name, country in LEAGUES:
            league = League(code=code, name=name, country=country)
            session.add(league)
            await session.flush()
            leagues[code] = league
            for team_name in TEAMS[code]:
                team = Team(name=team_name, league_id=league.id, country=country)
                session.add(team)
                await session.flush()
                teams[team_name] = team

        # Model registry
        session.add(
            ModelRegistryEntry(
                name="mvp-baseline",
                version="mvp-baseline-v1",
                model_type="heuristic_poisson",
                status=ModelStatus.ACTIVE,
                description="Form-based Poisson baseline model for the MVP",
                feature_version="v1",
                activated_at=datetime.now(UTC),
            )
        )

        # Sample fixture: Manchester City vs Chelsea
        kickoff = datetime.now(UTC) + timedelta(days=1)
        fixture = Fixture(
            league_id=leagues["EPL"].id,
            home_team_id=teams["Manchester City"].id,
            away_team_id=teams["Chelsea"].id,
            kickoff_time=kickoff,
            status=FixtureStatus.SCHEDULED,
            referee="M. Oliver",
            provider_fixture_id="seed-mci-che",
            provider_name="seed",
        )
        session.add(fixture)
        await session.flush()

        snapshot = PredictionFeatureSnapshot(
            fixture_id=fixture.id,
            features={
                "home_form_points": 13,
                "away_form_points": 8,
                "home_goals_scored_avg": 2.4,
                "away_goals_scored_avg": 1.4,
                "home_goals_conceded_avg": 0.8,
                "away_goals_conceded_avg": 1.2,
                "home_advantage": 1.0,
                "form_differential": 5,
            },
            feature_version="v1",
            input_data_timestamp=datetime.now(UTC),
        )
        session.add(snapshot)
        await session.flush()

        prediction = Prediction(
            fixture_id=fixture.id,
            model_version="mvp-baseline-v1",
            status=PredictionStatus.PUBLISHED,
            home_win_probability=0.58,
            draw_probability=0.24,
            away_win_probability=0.18,
            over_25_probability=0.61,
            under_25_probability=0.39,
            both_teams_to_score_probability=0.55,
            correct_score_probability_ranges={
                "low_scoring_0_1_goals": 0.18,
                "moderate_2_3_goals": 0.52,
                "high_scoring_4_plus": 0.30,
            },
            confidence_score=0.62,
            confidence_level=ConfidenceLevel.HIGH,
            risk_level=RiskLevel.MEDIUM,
            key_factors=[
                "Home side holds a clear recent-form advantage",
                "Home attack has been scoring above average",
                "Home advantage factored into the model output",
            ],
            explanation={
                "narrative": (
                    "Model probability indicates higher likelihood of a home win "
                    "(58%) based on recent form, scoring trends and home advantage."
                )
            },
            feature_snapshot_id=snapshot.id,
            input_data_timestamp=datetime.now(UTC),
            published_at=datetime.now(UTC),
        )
        session.add(prediction)
        await session.flush()

        session.add(
            Report(
                title="Manchester City vs Chelsea: Match Preview",
                report_type=ReportType.MATCH_PREVIEW,
                status=ReportStatus.PUBLISHED,
                content=(
                    "Manchester City host Chelsea with the model assigning a 58% "
                    "probability to a home win, 24% to a draw and 18% to an away win. "
                    "The model signal is high-confidence with a medium risk level, "
                    "driven by City's superior recent form and home scoring rate.\n\n"
                    "Insights are model-generated probabilities, not guarantees. "
                    "Past accuracy does not assure future outcomes."
                ),
                summary="City carry a high-confidence model signal at home to Chelsea.",
                minimum_plan=SubscriptionPlan.FREE,
                fixture_id=fixture.id,
                prediction_id=prediction.id,
                report_date=datetime.now(UTC),
                published_at=datetime.now(UTC),
            )
        )

        await session.commit()
        print("Seed data created.")
        print("Users:")
        for email, password, _, role, _ in USERS:
            print(f"  {email} / {password} ({role.value})")


if __name__ == "__main__":
    asyncio.run(seed())
