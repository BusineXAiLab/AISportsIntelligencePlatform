"""Shared enum types used across models, schemas and services."""
from enum import StrEnum


class UserRole(StrEnum):
    FREE_USER = "FREE_USER"
    PREMIUM_USER = "PREMIUM_USER"
    ELITE_USER = "ELITE_USER"
    CONTENT_LEAD = "CONTENT_LEAD"
    ADMIN = "ADMIN"
    SUPER_ADMIN = "SUPER_ADMIN"


ADMIN_ROLES = {UserRole.CONTENT_LEAD, UserRole.ADMIN, UserRole.SUPER_ADMIN}


class SubscriptionPlan(StrEnum):
    FREE = "FREE"
    PREMIUM = "PREMIUM"
    ELITE = "ELITE"


class BillingInterval(StrEnum):
    MONTHLY = "MONTHLY"
    ANNUAL = "ANNUAL"


class SubscriptionStatus(StrEnum):
    ACTIVE = "ACTIVE"
    TRIALING = "TRIALING"
    PAST_DUE = "PAST_DUE"
    GRACE_PERIOD = "GRACE_PERIOD"
    CANCELED = "CANCELED"
    EXPIRED = "EXPIRED"
    INCOMPLETE = "INCOMPLETE"


class FixtureStatus(StrEnum):
    SCHEDULED = "SCHEDULED"
    LIVE = "LIVE"
    FINISHED = "FINISHED"
    POSTPONED = "POSTPONED"
    CANCELED = "CANCELED"


class PredictionStatus(StrEnum):
    DRAFT = "DRAFT"
    PENDING_REVIEW = "PENDING_REVIEW"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"
    PUBLISHED = "PUBLISHED"
    SETTLED = "SETTLED"


class RiskLevel(StrEnum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"


class ConfidenceLevel(StrEnum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"


class ReportType(StrEnum):
    MATCH_PREVIEW = "MATCH_PREVIEW"
    DAILY_INTELLIGENCE = "DAILY_INTELLIGENCE"
    TEAM_FORM_SUMMARY = "TEAM_FORM_SUMMARY"
    TACTICAL_OBSERVATION = "TACTICAL_OBSERVATION"
    INJURY_IMPACT = "INJURY_IMPACT"
    PERSONALIZED = "PERSONALIZED"
    TELEGRAM_SHORT = "TELEGRAM_SHORT"
    LONG_FORM_PREMIUM = "LONG_FORM_PREMIUM"


class ReportStatus(StrEnum):
    DRAFT = "DRAFT"
    PENDING_REVIEW = "PENDING_REVIEW"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"
    PUBLISHED = "PUBLISHED"
    ARCHIVED = "ARCHIVED"


class TelegramChannelType(StrEnum):
    PUBLIC = "PUBLIC"
    VIP = "VIP"


class TelegramAccountStatus(StrEnum):
    NOT_CONNECTED = "NOT_CONNECTED"
    PENDING_VERIFICATION = "PENDING_VERIFICATION"
    CONNECTED = "CONNECTED"
    VIP_ACTIVE = "VIP_ACTIVE"
    REVOKED = "REVOKED"


class TelegramMessageStatus(StrEnum):
    PENDING_APPROVAL = "PENDING_APPROVAL"
    APPROVED = "APPROVED"
    SENT = "SENT"
    FAILED = "FAILED"
    REJECTED = "REJECTED"


class NotificationChannel(StrEnum):
    EMAIL = "EMAIL"
    TELEGRAM = "TELEGRAM"
    IN_APP = "IN_APP"


class NotificationStatus(StrEnum):
    PENDING = "PENDING"
    SENT = "SENT"
    FAILED = "FAILED"


class DataFeedStatus(StrEnum):
    HEALTHY = "HEALTHY"
    DEGRADED = "DEGRADED"
    DOWN = "DOWN"


class ModelStatus(StrEnum):
    DEVELOPMENT = "DEVELOPMENT"
    STAGING = "STAGING"
    ACTIVE = "ACTIVE"
    RETIRED = "RETIRED"


class PredictionMarket(StrEnum):
    MATCH_RESULT = "MATCH_RESULT"
    OVER_UNDER_25 = "OVER_UNDER_25"
    BTTS = "BTTS"
    CORRECT_SCORE = "CORRECT_SCORE"
