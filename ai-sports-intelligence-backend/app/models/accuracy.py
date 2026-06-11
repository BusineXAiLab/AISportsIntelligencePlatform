import uuid

from sqlalchemy import Boolean, Enum, Float, ForeignKey, String
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base, TimestampMixin, UUIDPrimaryKeyMixin
from app.models.enums import PredictionMarket
from app.models.prediction import Prediction


class PredictionAccuracy(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """Settlement record produced after the final match result is known."""

    __tablename__ = "prediction_accuracy"

    prediction_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("predictions.id", ondelete="CASCADE"),
        index=True,
        nullable=False,
    )
    market: Mapped[PredictionMarket] = mapped_column(
        Enum(PredictionMarket, native_enum=False, length=16), nullable=False
    )
    predicted_outcome: Mapped[str] = mapped_column(String(32), nullable=False)
    actual_outcome: Mapped[str] = mapped_column(String(32), nullable=False)
    predicted_probability: Mapped[float] = mapped_column(Float, nullable=False)
    was_correct: Mapped[bool] = mapped_column(Boolean, nullable=False)
    brier_score: Mapped[float | None] = mapped_column(Float, nullable=True)
    log_loss: Mapped[float | None] = mapped_column(Float, nullable=True)
    model_version: Mapped[str] = mapped_column(String(64), index=True, nullable=False)
    league_code: Mapped[str | None] = mapped_column(String(32), index=True, nullable=True)
    details: Mapped[dict | None] = mapped_column(JSONB, nullable=True)

    prediction: Mapped[Prediction] = relationship()
