"""Object storage abstraction supporting S3, Azure Blob and local filesystem."""
import asyncio
from abc import ABC, abstractmethod
from pathlib import Path

from app.core.config import settings
from app.core.exceptions import ExternalServiceError


class ObjectStorageClient(ABC):
    @abstractmethod
    async def upload_file(self, key: str, content: bytes, content_type: str) -> str: ...

    @abstractmethod
    async def download_file(self, key: str) -> bytes: ...

    @abstractmethod
    async def delete_file(self, key: str) -> None: ...


class LocalStorageClient(ObjectStorageClient):
    def __init__(self, base_path: str | None = None) -> None:
        self.base_path = Path(base_path or settings.LOCAL_STORAGE_PATH)
        self.base_path.mkdir(parents=True, exist_ok=True)

    def _path(self, key: str) -> Path:
        path = (self.base_path / key).resolve()
        if not path.is_relative_to(self.base_path.resolve()):
            raise ExternalServiceError("Invalid storage key")
        return path

    async def upload_file(self, key: str, content: bytes, content_type: str) -> str:
        path = self._path(key)
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_bytes(content)
        return str(path)

    async def download_file(self, key: str) -> bytes:
        path = self._path(key)
        if not path.exists():
            raise ExternalServiceError(f"Object not found: {key}")
        return path.read_bytes()

    async def delete_file(self, key: str) -> None:
        path = self._path(key)
        path.unlink(missing_ok=True)


class S3StorageClient(ObjectStorageClient):
    def __init__(self) -> None:
        import boto3

        self.bucket = settings.AWS_S3_BUCKET
        self.client = boto3.client("s3", region_name=settings.AWS_REGION or None)

    async def upload_file(self, key: str, content: bytes, content_type: str) -> str:
        await asyncio.to_thread(
            self.client.put_object,
            Bucket=self.bucket, Key=key, Body=content, ContentType=content_type,
        )
        return f"s3://{self.bucket}/{key}"

    async def download_file(self, key: str) -> bytes:
        response = await asyncio.to_thread(
            self.client.get_object, Bucket=self.bucket, Key=key
        )
        return response["Body"].read()

    async def delete_file(self, key: str) -> None:
        await asyncio.to_thread(self.client.delete_object, Bucket=self.bucket, Key=key)


class AzureBlobStorageClient(ObjectStorageClient):
    def __init__(self) -> None:
        from azure.storage.blob import BlobServiceClient

        service = BlobServiceClient.from_connection_string(
            settings.AZURE_STORAGE_CONNECTION_STRING
        )
        self.container = service.get_container_client(settings.AZURE_BLOB_CONTAINER)

    async def upload_file(self, key: str, content: bytes, content_type: str) -> str:
        from azure.storage.blob import ContentSettings

        await asyncio.to_thread(
            self.container.upload_blob,
            name=key,
            data=content,
            overwrite=True,
            content_settings=ContentSettings(content_type=content_type),
        )
        return f"azure://{settings.AZURE_BLOB_CONTAINER}/{key}"

    async def download_file(self, key: str) -> bytes:
        blob = await asyncio.to_thread(self.container.download_blob, key)
        return await asyncio.to_thread(blob.readall)

    async def delete_file(self, key: str) -> None:
        await asyncio.to_thread(self.container.delete_blob, key)


def get_storage_client() -> ObjectStorageClient:
    provider = settings.OBJECT_STORAGE_PROVIDER
    if provider == "s3":
        return S3StorageClient()
    if provider == "azure_blob":
        return AzureBlobStorageClient()
    return LocalStorageClient()
