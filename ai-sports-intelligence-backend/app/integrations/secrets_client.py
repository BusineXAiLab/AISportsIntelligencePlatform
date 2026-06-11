"""Secrets abstraction: .env locally, Secrets Manager on AWS, Key Vault on Azure."""
import json
import os
from abc import ABC, abstractmethod
from functools import lru_cache

from app.core.config import settings


class SecretsClient(ABC):
    @abstractmethod
    def get_secret(self, name: str) -> str | None: ...


class EnvSecretsClient(SecretsClient):
    def get_secret(self, name: str) -> str | None:
        return os.environ.get(name)


class AwsSecretsManagerClient(SecretsClient):
    """Reads a JSON secret blob from AWS Secrets Manager once and caches it."""

    def __init__(self) -> None:
        import boto3

        client = boto3.client("secretsmanager", region_name=settings.AWS_REGION or None)
        response = client.get_secret_value(SecretId=settings.AWS_SECRETS_MANAGER_SECRET_ID)
        self._secrets: dict[str, str] = json.loads(response["SecretString"])

    def get_secret(self, name: str) -> str | None:
        return self._secrets.get(name) or os.environ.get(name)


class AzureKeyVaultClient(SecretsClient):
    def __init__(self) -> None:
        from azure.identity import DefaultAzureCredential
        from azure.keyvault.secrets import SecretClient

        self._client = SecretClient(
            vault_url=settings.AZURE_KEY_VAULT_URL,
            credential=DefaultAzureCredential(),
        )

    def get_secret(self, name: str) -> str | None:
        try:
            # Key Vault secret names use dashes instead of underscores.
            return self._client.get_secret(name.replace("_", "-")).value
        except Exception:
            return os.environ.get(name)


@lru_cache
def get_secrets_client() -> SecretsClient:
    provider = settings.SECRETS_PROVIDER
    if provider == "aws_secrets_manager":
        return AwsSecretsManagerClient()
    if provider == "azure_key_vault":
        return AzureKeyVaultClient()
    return EnvSecretsClient()
