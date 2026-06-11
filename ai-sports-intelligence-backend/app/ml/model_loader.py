"""Model loading and registry resolution."""
from functools import lru_cache

from app.core.logging import get_logger
from app.ml.baseline_models import BaseMatchModel, HeuristicBaselineModel

logger = get_logger(__name__)

DEFAULT_MODEL_VERSION = "mvp-baseline-v1"


@lru_cache
def load_model(version: str = DEFAULT_MODEL_VERSION) -> BaseMatchModel:
    """Load a model by version.

    The MVP only ships the heuristic baseline. Trained artifacts should be
    stored in object storage (artifact_uri on the model_registry row),
    deserialised here and wrapped in SklearnModelAdapter.
    """
    if version == DEFAULT_MODEL_VERSION:
        return HeuristicBaselineModel()

    logger.warning("unknown_model_version_falling_back", requested=version)
    return HeuristicBaselineModel()
