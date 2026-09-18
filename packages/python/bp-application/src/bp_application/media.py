from __future__ import annotations

from dataclasses import dataclass
from datetime import UTC, datetime
import hashlib
from typing import Any
from uuid import uuid4

from bp_domain.context import SiteContext
from bp_domain.effects import SiteEffectEnvelope
from bp_domain.errors import Conflict, NotFound, ValidationFault
from bp_domain.media import (
    MAX_UPLOAD_BYTES,
    VARIANT_BY_KEY,
    cdn_variant_url,
    original_object_key,
    validate_dimensions,
    validate_media_metadata,
    validate_upload_bytes,
    variant_object_key,
)
from bp_ports import DownstreamEffectsPort, MediaProcessorPort, MediaRepositoryPort, ObjectStoragePort


@dataclass(slots=True)
class MediaService:
    repository: MediaRepositoryPort
    storage: ObjectStoragePort
    processor: MediaProcessorPort
    effects: DownstreamEffectsPort
    media_cdn_origin: str = "https://media.invalid"

    def _admin_view(self, context: SiteContext, media: dict[str, Any]) -> dict[str, Any]:
        result = dict(media)
        variants = media.get("variants") or []
        if any(item.get("variant_key") == "native_webp" for item in variants if isinstance(item, dict)):
            raw_updated = str(media.get("updated_at") or media.get("created_at") or "")
            try:
                updated = datetime.fromisoformat(raw_updated.replace("Z", "+00:00"))
                epoch_ms = int(updated.timestamp() * 1000)
            except ValueError:
                epoch_ms = 0
            result["public_url"] = cdn_variant_url(
                media_cdn_origin=self.media_cdn_origin,
                site_key=context.site_key,
                media_id=str(media["media_id"]),
                variant_key="native_webp",
                updated_at_epoch_ms=epoch_ms,
            )
        return result

    @staticmethod
    def _validate_metadata(body: dict[str, Any]) -> dict[str, Any]:
        try:
            return validate_media_metadata(
                alt_text=body.get("alt_text"),
                title=body.get("title"),
                caption=body.get("caption"),
                credit_text=body.get("credit"),
                source_url=body.get("source_url"),
            )
        except ValueError as exc:
            raise ValidationFault(str(exc)) from exc

    @staticmethod
    def _file_payload(body: dict[str, Any]) -> tuple[bytes, str, str]:
        file = body.get("file")
        if not isinstance(file, dict) or not isinstance(file.get("bytes"), (bytes, bytearray)):
            raise ValidationFault("multipart file is required")
        data = bytes(file["bytes"])
        if len(data) > MAX_UPLOAD_BYTES:
            raise ValidationFault("upload exceeds 20 MiB")
        filename = str(file.get("filename") or "upload")
        mime_type = str(file.get("content_type") or "application/octet-stream").lower()
        return data, filename, mime_type

    async def list(self, context: SiteContext, query: dict[str, Any]) -> dict[str, Any]:
        items, has_more = await self.repository.list_media(context, query=query)
        return {"items": [self._admin_view(context, item) for item in items], "page": {"page": int(query.get("page", 1)), "page_size": int(query.get("page_size", 50)), "has_more": has_more}}

    async def get(self, context: SiteContext, media_id: str) -> dict[str, Any]:
        media = await self.repository.get_media(context, media_id)
        if media is None:
            raise NotFound("media not found")
        return {"media": self._admin_view(context, media)}

    async def upload(self, context: SiteContext, body: dict[str, Any], *, actor_admin_id: str) -> dict[str, Any]:
        data, filename, mime_type = self._file_payload(body)
        metadata = self._validate_metadata(body)
        try:
            checksum, sanitized = validate_upload_bytes(data, declared_mime_type=mime_type, original_filename=filename)
            decoded = await self.processor.inspect(data=data, mime_type=mime_type)
            validate_dimensions(decoded.width, decoded.height, frames=decoded.frames)
        except (ValueError, RuntimeError) as exc:
            raise ValidationFault(str(exc)) from exc

        media_id = str(uuid4())
        original_key = original_object_key(site_id=context.site_id, media_id=media_id, checksum_sha256=checksum, mime_type=mime_type)
        await self.storage.put_private_create_only(key=original_key, data=data, content_type=mime_type, checksum_sha256=checksum)
        native = await self.processor.generate_variant(data=data, source_mime_type=mime_type, variant_key="native_webp")
        if native is None:
            raise ValidationFault("native_webp baseline could not be generated")
        if native.mime_type != "image/webp" or native.width != decoded.width or native.height != decoded.height or not native.data:
            raise ValidationFault("native_webp baseline failed DOC-17 verification")
        native_checksum = hashlib.sha256(native.data).hexdigest()
        native_key = variant_object_key(site_id=context.site_id, media_id=media_id, checksum_sha256=checksum, variant_key="native_webp")
        await self.storage.put_private_create_only(key=native_key, data=native.data, content_type=native.mime_type, checksum_sha256=native_checksum)
        native_stored = await self.storage.head_private(native_key)
        if (
            native_stored is None
            or native_stored.checksum_sha256 != native_checksum
            or native_stored.byte_size != len(native.data)
            or native_stored.content_type != "image/webp"
        ):
            raise ValidationFault("stored native_webp baseline failed integrity verification")
        now = datetime.now(UTC)
        generation = {
            "media_id": media_id,
            "filename": sanitized,
            "mime_type": mime_type,
            "size_bytes": len(data),
            "width": decoded.width,
            "height": decoded.height,
            "status": "ACTIVE",
            "object_key": original_key,
            "checksum_sha256": checksum,
            "created_at": now.isoformat(),
            "updated_at": now.isoformat(),
            "usage_count": 0,
            **metadata,
        }
        native_row = {
            "variant_key": "native_webp", "mime_type": native.mime_type, "byte_size": len(native.data),
            "width": native.width, "height": native.height, "object_key": native_key,
        }
        created = await self.repository.create_media(context, generation, native_row, actor_admin_id=actor_admin_id)
        await self.effects.emit(SiteEffectEnvelope(
            effect_type="MEDIA_UPLOAD_BASELINE_READY", context=context, entity_type="MEDIA", entity_id=media_id,
            correlation_id=context.request_id, source_version=created.get("updated_at"), payload={"checksum_sha256": checksum},
        ))
        return {"media": self._admin_view(context, created)}

    async def update_metadata(self, context: SiteContext, media_id: str, body: dict[str, Any], *, actor_admin_id: str) -> dict[str, Any]:
        fields = self._validate_metadata(body)
        supplied = {k: v for k, v in fields.items() if ({"credit_text": "credit"}.get(k, k)) in body}
        if not supplied:
            raise ValidationFault("at least one media metadata property is required")
        updated = await self.repository.update_metadata(context, media_id, supplied, actor_admin_id=actor_admin_id)
        if not updated:
            raise NotFound("media not found")
        await self.effects.emit(SiteEffectEnvelope(
            effect_type="MEDIA_METADATA_CHANGE", context=context, entity_type="MEDIA", entity_id=media_id,
            correlation_id=context.request_id, source_version=updated.get("updated_at"), payload={},
        ))
        return {"media": self._admin_view(context, updated)}

    async def replace(self, context: SiteContext, media_id: str, body: dict[str, Any], *, actor_admin_id: str) -> dict[str, Any]:
        current = await self.repository.get_media(context, media_id)
        if current is None:
            raise NotFound("media not found")
        data, filename, mime_type = self._file_payload(body)
        metadata = self._validate_metadata(body)
        supplied_metadata = {k: v for k, v in metadata.items() if ({"credit_text": "credit"}.get(k, k)) in body}
        try:
            checksum, sanitized = validate_upload_bytes(data, declared_mime_type=mime_type, original_filename=filename)
            decoded = await self.processor.inspect(data=data, mime_type=mime_type)
            validate_dimensions(decoded.width, decoded.height, frames=decoded.frames)
        except (ValueError, RuntimeError) as exc:
            raise ValidationFault(str(exc)) from exc
        original_key = original_object_key(site_id=context.site_id, media_id=media_id, checksum_sha256=checksum, mime_type=mime_type)
        await self.storage.put_private_create_only(key=original_key, data=data, content_type=mime_type, checksum_sha256=checksum)
        native = await self.processor.generate_variant(data=data, source_mime_type=mime_type, variant_key="native_webp")
        if native is None:
            raise ValidationFault("replacement native_webp baseline could not be generated")
        if native.mime_type != "image/webp" or native.width != decoded.width or native.height != decoded.height or not native.data:
            raise ValidationFault("replacement native_webp baseline failed DOC-17 verification")
        native_checksum = hashlib.sha256(native.data).hexdigest()
        native_key = variant_object_key(site_id=context.site_id, media_id=media_id, checksum_sha256=checksum, variant_key="native_webp")
        await self.storage.put_private_create_only(
            key=native_key, data=native.data, content_type=native.mime_type,
            checksum_sha256=native_checksum,
        )
        native_stored = await self.storage.head_private(native_key)
        if (
            native_stored is None
            or native_stored.checksum_sha256 != native_checksum
            or native_stored.byte_size != len(native.data)
            or native_stored.content_type != "image/webp"
        ):
            raise ValidationFault("stored replacement native_webp baseline failed integrity verification")
        now = datetime.now(UTC)
        generation = {
            "filename": sanitized, "mime_type": mime_type, "size_bytes": len(data), "width": decoded.width,
            "height": decoded.height, "object_key": original_key, "checksum_sha256": checksum, "updated_at": now.isoformat(),
        }
        native_row = {"variant_key": "native_webp", "mime_type": native.mime_type, "byte_size": len(native.data), "width": native.width, "height": native.height, "object_key": native_key}
        updated = await self.repository.replace_generation(context, media_id, generation, native_row, supplied_metadata, actor_admin_id=actor_admin_id)
        await self.effects.emit(SiteEffectEnvelope(
            effect_type="MEDIA_REPLACE_BASELINE_READY", context=context, entity_type="MEDIA", entity_id=media_id,
            correlation_id=context.request_id, source_version=updated.get("updated_at"), payload={"checksum_sha256": checksum},
        ))
        return {"media": self._admin_view(context, updated)}

    async def usage(self, context: SiteContext, media_id: str) -> dict[str, Any]:
        if await self.repository.get_media(context, media_id) is None:
            raise NotFound("media not found")
        usages = await self.repository.authoritative_usages(context, media_id)
        return {"items": [{"resource_type": item["resource_type"], "resource_id": item["resource_id"], "label": item.get("label") or "Referenced content"} for item in usages]}

    async def delete(self, context: SiteContext, media_id: str, *, actor_admin_id: str) -> None:
        if await self.repository.get_media(context, media_id) is None:
            raise NotFound("media not found")
        usages = await self.repository.authoritative_usages(context, media_id)
        if usages:
            raise Conflict("media is still referenced")
        if not await self.repository.tombstone_if_unused(context, media_id, actor_admin_id=actor_admin_id):
            # Repository must recheck authoritative references in its serialized transaction.
            raise Conflict("media became referenced before deletion")
        await self.effects.emit(SiteEffectEnvelope(
            effect_type="MEDIA_DELETE", context=context, entity_type="MEDIA", entity_id=media_id,
            correlation_id=context.request_id, payload={},
        ))
