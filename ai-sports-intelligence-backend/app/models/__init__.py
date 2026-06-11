"""Import all models so Alembic autogenerate and relationship resolution work."""
from app.models.accuracy import PredictionAccuracy
from app.models.audit_log import AdminAction, AuditLog
from app.models.data_feed import DataFeed
from app.models.league import League, Season
from app.models.match import Fixture, Result, Venue
from app.models.model_registry import ModelRegistryEntry
from app.models.notification import Notification
from app.models.player import Player
from app.models.prediction import Prediction, PredictionFeatureSnapshot
from app.models.report import Report, ReportVersion
from app.models.subscription import Subscription, SubscriptionEvent
from app.models.team import Team
from app.models.telegram import TelegramAccount, TelegramMessage
from app.models.user import ApiKey, RefreshToken, User, UserPreferences, WatchlistItem

__all__ = [
    "AdminAction",
    "ApiKey",
    "AuditLog",
    "DataFeed",
    "Fixture",
    "League",
    "ModelRegistryEntry",
    "Notification",
    "Player",
    "Prediction",
    "PredictionAccuracy",
    "PredictionFeatureSnapshot",
    "RefreshToken",
    "Report",
    "ReportVersion",
    "Result",
    "Season",
    "Subscription",
    "SubscriptionEvent",
    "Team",
    "TelegramAccount",
    "TelegramMessage",
    "User",
    "UserPreferences",
    "Venue",
    "WatchlistItem",
]
