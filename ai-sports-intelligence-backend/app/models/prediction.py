import uuid
from datetime import datetime

from sqlalchemy import DateTime, Enum, Float, ForeignKey, Index, String
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base, TimestampMixin, UUIDPrimaryKeyMixin
from app.models.enums import ConfidenceLevel, PredictionStatus, RiskLevel
from app.models.match import Fixture


class PredictionFeatureSnapshot(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """Immutable snapshot of the feature vector used to generate a prediction."""

    __tablename__ = "prediction_features"

    fixture_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("fixtures.id", ondelete="CASCADE"), index=True,
        nullable=False,
    )
    features: Mapped[dict] = mapped_column(JSONB, nullable=False)
    feature_version: Mapped[str] = mapped_column(String(32), default="v1", nullable=False)
    input_data_timestamp: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False
    )


class Prediction(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "predictions"
    __table_args__ = (
        Index("ix_predictions_fixture_status", "fixture_id", "status"),
        Index("ix_predictions_model_version", "model_version"),
    )

    fixture_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("fixtures.id", ondelete="CASCADE"), index=True,
        nullable=False,
    )
    model_version: Mapped[str] = mapped_column(String(64), nullable=False)
    status: Mapped[PredictionStatus] = mapped_column(
        Enum(PredictionStatus, native_enum=False, length=16),
        default=PredictionStatus.DRAFT,
        nullable=False,
    )

    home_win_probability: Mapped[float] = mapped_column(Float, nullable=False)
    draw_probability: Mapped[float] = mapped_column(Float, nullable=False)
    away_win_probability: Mapped[float] = mapped_column(Float, nullable=False)
    over_25_probability: Mapped[float | None] = mapped_column(Float, nullable=True)
    under_25_probability: Mapped[float | None] = mapped_column(Float, nullable=True)
    both_teams_to_score_probability: Mapped[float | None] = mapped_column(Float, nullable=True)
    correct_score_probability_ranges: Mapped[dict | None] = mapped_column(JSONB, nullable=True)

    confidence_score: Mapped[float] = mapped_column(Float, nullable=False)
    confidence_level: Mapped[ConfidenceLevel] = mapped_column(
        Enum(ConfidenceLevel, native_enum=False, length=8),
        default=ConfidenceLevel.MEDIUM,
        nullable=False,
    )
    risk_level: Mapped[RiskLevel] = mapped_column(
        Enum(RiskLevel, native_enum=False, length=8), default=RiskLevel.MEDIUM, nullable=False
    )
    key_factors: Mapped[list | None] = mapped_column(JSONB, nullable=True)
    explanation: Mapped[dict | None] = mapped_column(JSONB, nullable=True)

    feature_snapshot_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("prediction_features.id", ondelete="SET NULL"),
        nullable=True,
    )
    input_data_timestamp: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False
    )

    reviewed_by: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )
    reviewed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    review_note: Mapped[str | None] = mapped_column(String(1024), nullable=True)
    published_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    fixture: Mapped[Fixture] = relationship()
    feature_snapshot: Mapped[PredictionFeatureSnapshot | None] = relationship()
