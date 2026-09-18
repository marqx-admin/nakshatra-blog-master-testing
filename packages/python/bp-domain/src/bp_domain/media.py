from __future__ import annotations

from dataclasses import dataclass
from enum import StrEnum
import hashlib
import re
from urllib.parse import urlsplit


MAX_UPLOAD_BYTES = 20 * 1024 * 1024
MAX_DIMENSION = 12_000
MAX_PIXELS = 80_000_000

MIME_EXTENSIONS: dict[str, tuple[str, ...]] = {
    "image/jpeg": ("jpg", "jpeg"),
    "image/png": ("png",),
    "image/webp": ("webp",),
    "image/avif": ("avif",),
}


class MediaStatus(StrEnum):
    ACTIVE = "ACTIVE"
    DELETED = "DELETED"


@dataclass(frozen=True, slots=True)
class MediaVariantSpec:
    variant_key: str
    width: int | None
    height: int | None
    crop: bool
    mime_type: str
    extension: str
    required_when_source_satisfies: bool
    native: bool = False


VARIANT_CATALOG: tuple[MediaVariantSpec, ...] = (
    MediaVariantSpec("thumb256_avif", 256, 256, True, "image/avif", "avif", False),
    MediaVariantSpec("thumb256_webp", 256, 256, True, "image/webp", "webp", True),
    MediaVariantSpec("thumb512_avif", 512, 512, True, "image/avif", "avif", False),
    MediaVariantSpec("thumb512_webp", 512, 512, True, "image/webp", "webp", True),
    MediaVariantSpec("w320_avif", 320, None, False, "image/avif", "avif", False),
    MediaVariantSpec("w320_webp", 320, None, False, "image/webp", "webp", True),
    MediaVariantSpec("w640_avif", 640, None, False, "image/avif", "avif", False),
    MediaVariantSpec("w640_webp", 640, None, False, "image/webp", "webp", True),
    MediaVariantSpec("w960_avif", 960, None, False, "image/avif", "avif", False),
    MediaVariantSpec("w960_webp", 960, None, False, "image/webp", "webp", True),
    MediaVariantSpec("w1280_avif", 1280, None, False, "image/avif", "avif", False),
    MediaVariantSpec("w1280_webp", 1280, None, False, "image/webp", "webp", True),
    MediaVariantSpec("w1600_avif", 1600, None, False, "image/avif", "avif", False),
    MediaVariantSpec("w1600_webp", 1600, None, False, "image/webp", "webp", True),
    MediaVariantSpec("native_avif", None, None, False, "image/avif", "avif", False, True),
    MediaVariantSpec("native_webp", None, None, False, "image/webp", "webp", True, True),
)

VARIANT_BY_KEY = {item.variant_key: item for item in VARIANT_CATALOG}
if len(VARIANT_CATALOG) != 16:
    raise RuntimeError("DOC-17 requires exactly 16 variants")


def sanitize_filename(value: str) -> str:
    # Provenance only. Strip controls and path separators; keep a bounded human label.
    cleaned = "".join("_" if ch in {"/", "\\"} or ord(ch) < 32 or ord(ch) == 127 else ch for ch in value)
    cleaned = re.sub(r"\s+", " ", cleaned).strip(" .")
    return (cleaned or "upload")[:255]


def sniff_mime(data: bytes) -> str | None:
    if data.startswith(b"\xff\xd8\xff"):
        return "image/jpeg"
    if data.startswith(b"\x89PNG\r\n\x1a\n"):
        return "image/png"
    if len(data) >= 12 and data[:4] == b"RIFF" and data[8:12] == b"WEBP":
        return "image/webp"
    if len(data) >= 16 and data[4:8] == b"ftyp" and data[8:12] in {b"avif", b"avis"}:
        return "image/avif"
    return None


def validate_upload_bytes(data: bytes, *, declared_mime_type: str, original_filename: str) -> tuple[str, str]:
    if len(data) > MAX_UPLOAD_BYTES:
        raise ValueError("upload exceeds 20 MiB")
    if declared_mime_type not in MIME_EXTENSIONS:
        raise ValueError("media MIME type is not in the DOC-17 allowlist")
    sniffed = sniff_mime(data)
    if sniffed != declared_mime_type:
        raise ValueError("declared MIME type does not match file signature")
    extension = original_filename.rsplit(".", 1)[-1].lower() if "." in original_filename else ""
    if extension not in MIME_EXTENSIONS[declared_mime_type]:
        raise ValueError("filename extension does not agree with accepted MIME type")
    return hashlib.sha256(data).hexdigest(), sanitize_filename(original_filename)


def validate_dimensions(width: int, height: int, *, frames: int = 1) -> None:
    if frames != 1:
        raise ValueError("animated or multi-page media is not accepted")
    if width < 1 or height < 1 or width > MAX_DIMENSION or height > MAX_DIMENSION:
        raise ValueError("media dimensions are outside DOC-17 bounds")
    if width * height > MAX_PIXELS:
        raise ValueError("decoded media pixel area exceeds DOC-17 limit")


def canonical_extension(mime_type: str) -> str:
    return MIME_EXTENSIONS[mime_type][0]


def original_object_key(*, site_id: str, media_id: str, checksum_sha256: str, mime_type: str) -> str:
    return f"sites/{site_id}/media/{media_id}/g/{checksum_sha256}/original.{canonical_extension(mime_type)}"


def variant_object_key(*, site_id: str, media_id: str, checksum_sha256: str, variant_key: str) -> str:
    spec = VARIANT_BY_KEY[variant_key]
    return f"sites/{site_id}/media/{media_id}/g/{checksum_sha256}/variants/{variant_key}.{spec.extension}"


def staging_object_key(*, site_id: str, request_id: str, opaque_upload_id: str) -> str:
    return f"_staging/sites/{site_id}/{request_id}/{opaque_upload_id}"


def uncropped_size(width: int, height: int, target_width: int) -> tuple[int, int] | None:
    validate_dimensions(width, height)
    if width <= target_width:
        return None
    out_h = max(1, round(height * target_width / width))
    return target_width, out_h


@dataclass(frozen=True, slots=True)
class CropPlan:
    left: float
    top: float
    width: float
    height: float
    output_width: int
    output_height: int


def square_crop_plan(width: int, height: int, target: int, *, fx: float = 0.5, fy: float = 0.5) -> CropPlan | None:
    validate_dimensions(width, height)
    crop_w = min(float(width), float(height))
    crop_h = crop_w
    if crop_w < target or crop_h < target:
        return None
    left = min(max(fx * width - crop_w / 2, 0.0), width - crop_w)
    top = min(max(fy * height - crop_h / 2, 0.0), height - crop_h)
    return CropPlan(left=left, top=top, width=crop_w, height=crop_h, output_width=target, output_height=target)


def planned_variants(width: int, height: int) -> tuple[str, ...]:
    validate_dimensions(width, height)
    available: list[str] = []
    for spec in VARIANT_CATALOG:
        if spec.native:
            available.append(spec.variant_key)
        elif spec.crop:
            if square_crop_plan(width, height, int(spec.width or 0)) is not None:
                available.append(spec.variant_key)
        elif spec.width is not None and width > spec.width:
            available.append(spec.variant_key)
    return tuple(available)


def normalize_optional_metadata(value: str | None) -> str | None:
    if value is None:
        return None
    normalized = re.sub(r"\s+", " ", value.strip())
    return normalized or None


def validate_source_url(value: str | None) -> str | None:
    normalized = normalize_optional_metadata(value)
    if normalized is None:
        return None
    parsed = urlsplit(normalized)
    if not parsed.scheme or any(ch.isspace() for ch in normalized):
        raise ValueError("source_url must be an absolute URI")
    if parsed.scheme in {"http", "https"} and not parsed.netloc:
        raise ValueError("HTTP(S) source_url requires a host")
    if len(normalized) > 2048:
        raise ValueError("source_url exceeds 2048 characters")
    return normalized


def validate_media_metadata(*, alt_text: str | None = None, title: str | None = None, caption: str | None = None, credit_text: str | None = None, source_url: str | None = None) -> dict[str, str | None]:
    title_value = normalize_optional_metadata(title)
    if title_value is not None and len(title_value) > 300:
        raise ValueError("title exceeds 300 characters")
    return {
        "alt_text": normalize_optional_metadata(alt_text),
        "title": title_value,
        "caption": normalize_optional_metadata(caption),
        "credit_text": normalize_optional_metadata(credit_text),
        "source_url": validate_source_url(source_url),
    }


def cdn_variant_url(*, media_cdn_origin: str, site_key: str, media_id: str, variant_key: str, updated_at_epoch_ms: int) -> str:
    spec = VARIANT_BY_KEY[variant_key]
    origin = media_cdn_origin.rstrip("/")
    return f"{origin}/m/{site_key}/{media_id}/{variant_key}.{spec.extension}?v={updated_at_epoch_ms}"


def publicly_deliverable(*, media_status: str, media_site_id: str, site_id: str, site_status: str, selected_by_public_projection: bool, namespace_matches_owner: bool, native_webp_verified: bool) -> bool:
    return (
        media_status == "ACTIVE"
        and media_site_id == site_id
        and site_status == "ACTIVE"
        and selected_by_public_projection
        and namespace_matches_owner
        and native_webp_verified
    )
