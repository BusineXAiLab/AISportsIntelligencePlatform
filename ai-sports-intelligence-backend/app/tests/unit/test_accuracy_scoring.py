import pytest

from app.services.accuracy_service import AccuracyService


class TestScoring:
    def test_brier_correct_confident(self):
        assert AccuracyService._brier(0.9, True) == pytest.approx(0.01)

    def test_brier_wrong_confident(self):
        assert AccuracyService._brier(0.9, False) == pytest.approx(0.81)

    def test_log_loss_bounds(self):
        confident_right = AccuracyService._log_loss(0.9, True)
        confident_wrong = AccuracyService._log_loss(0.9, False)
        assert confident_right < confident_wrong

    def test_log_loss_handles_extremes(self):
        # Should not raise on p=1.0 / p=0.0 thanks to clamping.
        assert AccuracyService._log_loss(1.0, True) >= 0.0
        assert AccuracyService._log_loss(0.0, False) >= 0.0
