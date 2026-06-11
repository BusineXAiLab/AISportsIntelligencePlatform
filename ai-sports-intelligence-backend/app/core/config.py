"""Application configuration loaded from environment variables."""
from functools import lru_cache

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    # App
    APP_NAME: str = "AI Sports Intelligence Platform"
    ENVIRONMENT: str = "local"
    API_PREFIX: str = "/api/v1"
    DEBUG: bool = False
    CORS_ORIGINS: list[str] = ["http://localhost:3000", "http://localhost:5173"]

    # Security
    SECRET_KEY: str = "dev-secret-key-change-me"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 30
    RATE_LIMIT_PER_MINUTE: int = 120

    # Datastores
    DATABASE_URL: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/sports_ai"
    REDIS_URL: str = "redis://localhost:6379/0"

    # Stripe
    STRIPE_SECRET_KEY: str = ""
    STRIPE_WEBHOOK_SECRET: str = ""
    STRIPE_PREMIUM_PRICE_ID: str = ""
    STRIPE_ELITE_PRICE_ID: str = ""
    STRIPE_PREMIUM_ANNUAL_PRICE_ID: str = ""
    STRIPE_ELITE_ANNUAL_PRICE_ID: str = ""

    # Telegram
    TELEGRAM_BOT_TOKEN: str = ""
    TELEGRAM_PUBLIC_CHANNEL_ID: str = ""
    TELEGRAM_VIP_CHANNEL_ID: str = ""
    TELEGRAM_WEBHOOK_SECRET: str = ""

    # Sports data
    SPORTS_DATA_PROVIDER: str = "mock"
    SPORTS_DATA_API_KEY: str = ""
    SPORTS_DATA_BASE_URL: str = ""

    # LLM
    LLM_PROVIDER: str = "openai_compatible"
    LLM_API_KEY: str = ""
    LLM_BASE_URL: str = "https://api.openai.com/v1"
    LLM_MODEL: str = "gpt-4o-mini"

    # Object storage
    OBJECT_STORAGE_PROVIDER: str = "local"  # local | s3 | azure_blob
    LOCAL_STORAGE_PATH: str = "./storage"
    AWS_REGION: str = ""
    AWS_S3_BUCKET: str = ""
    AZURE_STORAGE_CONNECTION_STRING: str = ""
    AZURE_BLOB_CONTAINER: str = ""

    # Secrets backend
    SECRETS_PROVIDER: str = "env"  # env | aws_secrets_manager | azure_key_vault
    AWS_SECRETS_MANAGER_SECRET_ID: str = ""
    AZURE_KEY_VAULT_URL: str = ""

    # Observability
    LOG_LEVEL: str = "INFO"
    SENTRY_DSN: str = ""

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def split_origins(cls, v: object) -> object:
        if isinstance(v, str) and not v.startswith("["):
            return [origin.strip() for origin in v.split(",") if origin.strip()]
        return v

    @property
    def is_production(self) -> bool:
        return self.ENVIRONMENT in {"production", "prod"}

    @property
    def sync_database_url(self) -> str:
        """Synchronous driver URL used by Alembic and Celery jobs."""
        return self.DATABASE_URL.replace("+asyncpg", "+psycopg2")


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
