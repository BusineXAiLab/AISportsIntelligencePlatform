"""LLM-backed report text generation from structured prediction data only."""
from typing import Any

from app.core.logging import get_logger
from app.integrations.llm_client import LLMClient, get_llm_client
from app.models.enums import ReportType

logger = get_logger(__name__)

SYSTEM_PROMPT = """You are a football intelligence analyst writing for a premium
sports insights platform. Rules you must always follow:
- Use ONLY the structured data provided. Never invent facts, statistics, injuries,
  lineups or quotes.
- Express predictions as probabilities and likelihoods, never certainties.
- Never use betting language such as "guaranteed win", "sure prediction",
  "risk-free", "100% accurate" or "bet now".
- Prefer phrases like "model probability indicates higher likelihood",
  "high-confidence model signal", "lower-risk according to current model factors".
- Keep an analytical, measured and professional tone."""

TEMPLATES: dict[ReportType, str] = {
    ReportType.MATCH_PREVIEW: (
        "Write a match preview (250-400 words) for the fixture below using only "
        "this structured data:\n{data}"
    ),
    ReportType.DAILY_INTELLIGENCE: (
        "Write a daily football intelligence briefing (300-500 words) summarising "
        "the model's view of today's fixtures using only this structured data:\n{data}"
    ),
    ReportType.TEAM_FORM_SUMMARY: (
        "Write a concise team form summary (150-250 words) using only this "
        "structured data:\n{data}"
    ),
    ReportType.TACTICAL_OBSERVATION: (
        "Write tactical observations (200-300 words) strictly derived from the "
        "statistical signals in this structured data:\n{data}"
    ),
    ReportType.INJURY_IMPACT: (
        "Write an injury impact note (100-200 words). If the data contains no "
        "injury information, state that no verified injury data is available. "
        "Structured data:\n{data}"
    ),
    ReportType.PERSONALIZED: (
        "Write a personalized insights digest (200-350 words) for a user with the "
        "favorite teams and leagues listed, using only this structured data:\n{data}"
    ),
    ReportType.TELEGRAM_SHORT: (
        "Write a short Telegram post (under 600 characters) summarising the "
        "model's headline probabilities from this structured data. No emojis "
        "unless present in the data:\n{data}"
    ),
    ReportType.LONG_FORM_PREMIUM: (
        "Write a long-form premium analysis (600-900 words) with sections for "
        "probabilities, key factors, risk assessment and historical accuracy, "
        "using only this structured data:\n{data}"
    ),
}


class LLMService:
    def __init__(self, client: LLMClient | None = None) -> None:
        self.client = client or get_llm_client()

    async def generate_report_text(
        self, report_type: ReportType, structured_data: dict[str, Any]
    ) -> str:
        template = TEMPLATES[report_type]
        user_prompt = template.format(data=self._render_data(structured_data))
        max_tokens = 1600 if report_type == ReportType.LONG_FORM_PREMIUM else 900
        text = await self.client.generate(SYSTEM_PROMPT, user_prompt, max_tokens=max_tokens)
        return text.strip()

    @staticmethod
    def _render_data(data: dict[str, Any]) -> str:
        import json

        return json.dumps(data, indent=2, default=str)
