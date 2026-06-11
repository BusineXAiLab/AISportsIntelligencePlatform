"""LLM provider abstraction (OpenAI-compatible chat completions by default)."""
from abc import ABC, abstractmethod

import httpx

from app.core.config import settings
from app.core.exceptions import ExternalServiceError
from app.core.logging import get_logger

logger = get_logger(__name__)


class LLMClient(ABC):
    @abstractmethod
    async def generate(self, system_prompt: str, user_prompt: str,
                       max_tokens: int = 1200, temperature: float = 0.4) -> str: ...


class OpenAICompatibleClient(LLMClient):
    """Works with OpenAI, Azure OpenAI (compatible endpoint), Ollama, vLLM, etc."""

    def __init__(self) -> None:
        self.base_url = settings.LLM_BASE_URL.rstrip("/")
        self.api_key = settings.LLM_API_KEY
        self.model = settings.LLM_MODEL

    async def generate(self, system_prompt: str, user_prompt: str,
                       max_tokens: int = 1200, temperature: float = 0.4) -> str:
        payload = {
            "model": self.model,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
            "max_tokens": max_tokens,
            "temperature": temperature,
        }
        headers = {"Authorization": f"Bearer {self.api_key}"} if self.api_key else {}
        async with httpx.AsyncClient(timeout=60) as client:
            response = await client.post(
                f"{self.base_url}/chat/completions", json=payload, headers=headers
            )
        if response.status_code != 200:
            logger.error("llm_error", status=response.status_code, body=response.text[:500])
            raise ExternalServiceError(f"LLM provider returned {response.status_code}")
        data = response.json()
        return data["choices"][0]["message"]["content"]


class TemplateFallbackClient(LLMClient):
    """Deterministic non-LLM fallback used when no LLM credentials are set.

    Renders the structured user prompt directly so the platform remains
    functional in local development without external API keys.
    """

    async def generate(self, system_prompt: str, user_prompt: str,
                       max_tokens: int = 1200, temperature: float = 0.4) -> str:
        return user_prompt


def get_llm_client() -> LLMClient:
    if settings.LLM_PROVIDER == "openai_compatible" and settings.LLM_API_KEY:
        return OpenAICompatibleClient()
    return TemplateFallbackClient()
