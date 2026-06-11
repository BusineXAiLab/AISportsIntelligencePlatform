"""Email delivery abstraction. Logs emails locally; swap in SES/ACS/SendGrid in prod."""
from abc import ABC, abstractmethod

from app.core.logging import get_logger

logger = get_logger(__name__)


class EmailClient(ABC):
    @abstractmethod
    async def send_email(self, to: str, subject: str, body: str) -> None: ...


class ConsoleEmailClient(EmailClient):
    """Development email client that logs instead of sending."""

    async def send_email(self, to: str, subject: str, body: str) -> None:
        logger.info("email_sent", to=to, subject=subject, body_preview=body[:200])


def get_email_client() -> EmailClient:
    return ConsoleEmailClient()
