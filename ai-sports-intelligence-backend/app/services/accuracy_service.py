"""Settlement of predictions against final results and accuracy aggregation."""
import math

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.logging import get_logger
from app.models.accuracy import PredictionAccuracy
from app.models.enums import PredictionMarket, PredictionStatus
from app.models.match import Fixture
from app.models.prediction import Prediction
from app.repositories.match_repository import MatchRepository
from app.repositories.prediction_repository import PredictionRepository

logger = get_logger(__name__)


class AccuracyService:
    def __init__(self, db: AsyncSession) -> None:
        self.db = db
        self.predictions = PredictionRepository(db)
        self.matches = MatchRepository(db)

    @staticmethod
    def _brier(probability: float, was_correct: bool) -> float:
        return (probability - (1.0 if was_correct else 0.0)) ** 2

    @staticmethod
    def _log_loss(probability: float, was_correct: bool) -> float:
        p = min(max(probability if was_correct else 1 - probability, 1e-9), 1 - 1e-9)
        return -math.log(p)

    def _settle_match_result(self, prediction: Prediction, fixture: Fixture
                             ) -> PredictionAccuracy:
        assert fixture.result is not None
        actual = fixture.result.outcome
        probabilities = {
            "HOME_WIN": prediction.home_win_probability,
            "DRAW": prediction.draw_probability,
            "AWAY_WIN": prediction.away_win_probability,
        }
        predicted = max(probabilities, key=probabilities.__getitem__)
        was_correct = predicted == actual
        prob = probabilities[predicted]
        return PredictionAccuracy(
            prediction_id=prediction.id,
            market=PredictionMarket.MATCH_RESULT,
            predicted_outcome=predicted,
            actual_outcome=actual,
            predicted_probability=prob,
            was_correct=was_correct,
            brier_score=self._brier(prob, was_correct),
            log_loss=self._log_loss(prob, was_correct),
            model_version=prediction.model_version,
            league_code=fixture.league.code,
        )

    def _settle_over_under(self, prediction: Prediction, fixture: Fixture
                           ) -> PredictionAccuracy | None:
        if prediction.over_25_probability is None or fixture.result is None:
            return None
        total_goals = fixture.result.home_score + fixture.result.away_score
        actual = "OVER_25" if total_goals >= 3 else "UNDER_25"
        predicted = "OVER_25" if prediction.over_25_probability >= 0.5 else "UNDER_25"
        prob = (
            prediction.over_25_probability
            if predicted == "OVER_25"
            else 1 - prediction.over_25_probability
        )
        was_correct = predicted == actual
        return PredictionAccuracy(
            prediction_id=prediction.id,
            market=PredictionMarket.OVER_UNDER_25,
            predicted_outcome=predicted,
            actual_outcome=actual,
            predicted_probability=prob,
            was_correct=was_correct,
            brier_score=self._brier(prob, was_correct),
            log_loss=self._log_loss(prob, was_correct),
            model_version=prediction.model_version,
            league_code=fixture.league.code,
        )

    def _settle_btts(self, prediction: Prediction, fixture: Fixture
                     ) -> PredictionAccuracy | None:
        if prediction.both_teams_to_score_probability is None or fixture.result is None:
            return None
        actual = (
            "BTTS_YES"
            if fixture.result.home_score > 0 and fixture.result.away_score > 0
            else "BTTS_NO"
        )
        p_yes = prediction.both_teams_to_score_probability
        predicted = "BTTS_YES" if p_yes >= 0.5 else "BTTS_NO"
        prob = p_yes if predicted == "BTTS_YES" else 1 - p_yes
        was_correct = predicted == actual
        return PredictionAccuracy(
            prediction_id=prediction.id,
            market=PredictionMarket.BTTS,
            predicted_outcome=predicted,
            actual_outcome=actual,
            predicted_probability=prob,
            was_correct=was_correct,
            brier_score=self._brier(prob, was_correct),
            log_loss=self._log_loss(prob, was_correct),
            model_version=prediction.model_version,
            league_code=fixture.league.code,
        )

    async def settle_finished_fixtures(self) -> int:
        """Settle all published predictions on finished fixtures."""
        settled = 0
        fixtures = await self.matches.list_finished_without_settlement()
        for fixture in fixtures:
            if fixture.result is None:
                continue
            for prediction in await self.predictions.list_unsettled_for_fixture(fixture.id):
                if await self.predictions.has_settlement(prediction.id):
                    prediction.status = PredictionStatus.SETTLED
                    continue
                records = [self._settle_match_result(prediction, fixture)]
                for extra in (
                    self._settle_over_under(prediction, fixture),
                    self._settle_btts(prediction, fixture),
                ):
                    if extra is not None:
                        records.append(extra)
                for record in records:
                    self.db.add(record)
                prediction.status = PredictionStatus.SETTLED
                settled += 1
        await self.db.flush()
        logger.info("predictions_settled", count=settled)
        return settled

    async def summary(self, model_version: str | None = None) -> dict:
        rows = await self.predictions.accuracy_rows(model_version=model_version)
        if not rows:
            return {
                "total_settled": 0,
                "correct": 0,
                "accuracy_pct": 0.0,
                "average_brier_score": None,
                "by_market": {},
                "by_league": {},
                "model_version": model_version,
            }
        correct = sum(1 for r in rows if r.was_correct)
        briers = [r.brier_score for r in rows if r.brier_score is not None]

        def group_accuracy(key_fn) -> dict[str, float]:
            groups: dict[str, list[bool]] = {}
            for r in rows:
                key = key_fn(r)
                if key:
                    groups.setdefault(key, []).append(r.was_correct)
            return {
                k: round(100.0 * sum(v) / len(v), 2) for k, v in groups.items()
            }

        return {
            "total_settled": len(rows),
            "correct": correct,
            "accuracy_pct": round(100.0 * correct / len(rows), 2),
            "average_brier_score": (
                round(sum(briers) / len(briers), 4) if briers else None
            ),
            "by_market": group_accuracy(lambda r: r.market.value),
            "by_league": group_accuracy(lambda r: r.league_code),
            "model_version": model_version,
        }
