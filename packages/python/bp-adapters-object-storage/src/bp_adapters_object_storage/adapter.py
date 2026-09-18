from __future__ import annotations

from dataclasses import dataclass
import hashlib
from typing import Any

from bp_ports.derived import ObjectMetadata


class InMemoryObjectStorageAdapter:
    def __init__(self) -> None:
        self.objects: dict[str, tuple[bytes, ObjectMetadata]] = {}

    async def put_private_create_only(self, *, key: str, data: bytes, content_type: str, checksum_sha256: str) -> None:
        if key in self.objects:
            existing, metadata = self.objects[key]
            if metadata.checksum_sha256 == checksum_sha256 and existing == data:
                return
            raise FileExistsError("immutable object key already exists with different content")
        actual = hashlib.sha256(data).hexdigest()
        if actual != checksum_sha256:
            raise ValueError("object checksum mismatch")
        self.objects[key] = (bytes(data), ObjectMetadata(len(data), content_type, checksum_sha256))

    async def head_private(self, key: str) -> ObjectMetadata | None:
        item = self.objects.get(key)
        return None if item is None else item[1]

    async def get_private(self, key: str) -> bytes:
        return self.objects[key][0]

    async def delete_private(self, key: str) -> None:
        self.objects.pop(key, None)


class S3CompatibleObjectStorageAdapter:
    """S3-compatible private-origin adapter. No public ACL or signed URL behavior is exposed."""

    def __init__(self, *, s3_client: Any, bucket: str) -> None:
        self.s3 = s3_client
        self.bucket = bucket

    async def put_private_create_only(self, *, key: str, data: bytes, content_type: str, checksum_sha256: str) -> None:
        try:
            head = self.s3.head_object(Bucket=self.bucket, Key=key)
        except Exception as exc:
            status = getattr(exc, "response", {}).get("ResponseMetadata", {}).get("HTTPStatusCode")
            if status not in {404, None}:
                raise
            head = None
        if head is not None:
            existing = head.get("Metadata", {}).get("sha256")
            if existing == checksum_sha256 and int(head.get("ContentLength", -1)) == len(data):
                return
            raise FileExistsError("immutable object key collision")
        if hashlib.sha256(data).hexdigest() != checksum_sha256:
            raise ValueError("object checksum mismatch")
        self.s3.put_object(
            Bucket=self.bucket,
            Key=key,
            Body=data,
            ContentType=content_type,
            Metadata={"sha256": checksum_sha256},
        )

    async def head_private(self, key: str) -> ObjectMetadata | None:
        try:
            head = self.s3.head_object(Bucket=self.bucket, Key=key)
        except Exception as exc:
            status = getattr(exc, "response", {}).get("ResponseMetadata", {}).get("HTTPStatusCode")
            if status == 404:
                return None
            raise
        return ObjectMetadata(
            byte_size=int(head["ContentLength"]),
            content_type=str(head.get("ContentType") or "application/octet-stream"),
            checksum_sha256=str(head.get("Metadata", {}).get("sha256") or ""),
        )

    async def get_private(self, key: str) -> bytes:
        return self.s3.get_object(Bucket=self.bucket, Key=key)["Body"].read()

    async def delete_private(self, key: str) -> None:
        self.s3.delete_object(Bucket=self.bucket, Key=key)
