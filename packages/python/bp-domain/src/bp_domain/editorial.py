from __future__ import annotations

import base64
import json
import re
import unicodedata
from datetime import UTC, datetime
from dataclasses import dataclass
from enum import StrEnum
from typing import Any, Iterable, Mapping
from urllib.parse import urlparse
from zoneinfo import ZoneInfo, ZoneInfoNotFoundError

from .errors import BadRequest, ErrorDetail, StateConflict, ValidationFault


class PostStatus(StrEnum):
    DRAFT = "DRAFT"
    SCHEDULED = "SCHEDULED"
    PUBLISHED = "PUBLISHED"
    ARCHIVED = "ARCHIVED"
    TRASH = "TRASH"


class BlockType(StrEnum):
    PARAGRAPH = "PARAGRAPH"
    HEADING = "HEADING"
    LIST = "LIST"
    QUOTE = "QUOTE"
    SEPARATOR = "SEPARATOR"
    MEDIA = "MEDIA"
    TABLE = "TABLE"
    EMBED = "EMBED"
    CALLOUT = "CALLOUT"
    CTA = "CTA"
    DISCLAIMER = "DISCLAIMER"
    SOURCES_REFERENCES = "SOURCES_REFERENCES"


ARTICLE_BLOCK_TYPES = frozenset(t.value for t in BlockType)
PERSISTED_POST_STATES = frozenset(t.value for t in PostStatus)
STATIC_PAGE_ROUTES = {
    "ABOUT": "/about",
    "CONTACT": "/contact",
    "PRIVACY": "/privacy-policy",
    "TERMS": "/terms-of-use",
    "DISCLAIMER": "/disclaimer",
}
STATIC_ROUTE_KEYS = {route: key for key, route in STATIC_PAGE_ROUTES.items()}


@dataclass(frozen=True, slots=True)
class EmbedProviderPolicy:
    provider_key: str
    source_kind: str
    allowed_hosts: tuple[str, ...] = ()
    id_pattern: str | None = None


def validate_embed_provider_registry(raw: Any) -> dict[str, EmbedProviderPolicy]:
    if raw is None:
        return {}
    if not isinstance(raw, dict) or set(raw) - {"version", "providers"}:
        raise ValueError("embed provider registry has invalid shape")
    providers = raw.get("providers")
    if not isinstance(providers, list):
        raise ValueError("embed provider registry providers must be an array")
    result: dict[str, EmbedProviderPolicy] = {}
    for item in providers:
        if not isinstance(item, dict):
            raise ValueError("embed provider entry must be an object")
        key = str(item.get("provider_key") or "").strip()
        source_kind = str(item.get("source_kind") or "").strip()
        if not re.fullmatch(r"[A-Za-z][A-Za-z0-9_-]{0,63}", key) or key in result:
            raise ValueError("embed provider key is invalid or duplicated")
        if source_kind not in {"URL", "ID"}:
            raise ValueError("embed provider source_kind must be URL or ID")
        allowed_hosts = tuple(str(v).strip().lower() for v in item.get("allowed_hosts") or [])
        id_pattern = item.get("id_pattern")
        if source_kind == "URL" and not allowed_hosts:
            raise ValueError("URL embed provider requires allowed_hosts")
        if source_kind == "ID" and (not isinstance(id_pattern, str) or not id_pattern):
            raise ValueError("ID embed provider requires id_pattern")
        if id_pattern is not None:
            re.compile(str(id_pattern))
        result[key] = EmbedProviderPolicy(key, source_kind, allowed_hosts, str(id_pattern) if id_pattern is not None else None)
    return result


def validate_embed_source(provider_key: Any, source: Any, registry: Mapping[str, EmbedProviderPolicy], field: str) -> None:
    key = _require_nonempty_text(provider_key, f"{field}.provider_key")
    raw_source = _require_nonempty_text(source, f"{field}.source_url_or_id")
    policy = registry.get(key)
    if policy is None:
        raise validation_error(f"{field}.provider_key", "Embed provider is not approved by the current provider registry.", "UNAPPROVED_EMBED_PROVIDER")
    if policy.source_kind == "URL":
        parsed = urlparse(raw_source)
        host = (parsed.hostname or "").lower()
        if parsed.scheme != "https" or not host or host not in policy.allowed_hosts or parsed.username or parsed.password:
            raise validation_error(f"{field}.source_url_or_id", "Embed URL must be HTTPS and match the approved provider host allowlist.")
    else:
        if not policy.id_pattern or re.fullmatch(policy.id_pattern, raw_source) is None:
            raise validation_error(f"{field}.source_url_or_id", "Embed source identifier does not match the approved provider policy.")

SEO_FIELDS = frozenset(
    {
        "slug",
        "seo_title",
        "meta_description",
        "canonical_override",
        "index_policy",
        "link_robots_policy",
        "og_title",
        "og_description",
        "og_image_media_id",
        "structured_data_inputs",
        "breadcrumb_label",
    }
)


def encode_working_copy_preview_snapshot(base_version: int, working_copy: dict[str, Any]) -> str:
    """Serialize an exact private working copy for the short-lived preview grant.

    This is an internal server-side snapshot format, not an HTTP/API field.  The
    RC8 request remains ``source_kind/base_version/working_copy`` and DOC-19's
    preview grant remains bound to the selected source snapshot.
    """
    raw = json.dumps(working_copy, sort_keys=True, separators=(",", ":"), ensure_ascii=False).encode("utf-8")
    encoded = base64.urlsafe_b64encode(raw).decode("ascii").rstrip("=")
    return f"WORKING_COPY:{base_version}:{encoded}"


def decode_working_copy_preview_snapshot(source_snapshot: str) -> tuple[int, dict[str, Any]] | None:
    parts = source_snapshot.split(":", 2)
    if len(parts) != 3 or parts[0] != "WORKING_COPY":
        return None
    try:
        base_version = int(parts[1])
        padding = "=" * (-len(parts[2]) % 4)
        payload = json.loads(base64.urlsafe_b64decode(parts[2] + padding).decode("utf-8"))
    except (ValueError, UnicodeDecodeError, json.JSONDecodeError):
        return None
    if base_version < 1 or not isinstance(payload, dict):
        return None
    return base_version, payload

RELATION_FIELDS = frozenset(
    {
        "author_site_profile_id",
        "category_ids",
        "tag_ids",
        "featured_media_id",
        "manual_related_post_ids",
        "og_image_media_id",
    }
)


def _detail(field: str, message: str, code: str = "INVALID_FIELD") -> ErrorDetail:
    return ErrorDetail(code=code, message=message, field=field)


def validation_error(field: str, message: str, code: str = "INVALID_FIELD") -> ValidationFault:
    return ValidationFault("request validation failed", details=(_detail(field, message, code),))


def parse_content_schema_version(value: Any) -> int:
    if isinstance(value, bool):
        raise validation_error("body.content_schema_version", "Content schema version must be positive.")
    if isinstance(value, int):
        result = value
    elif isinstance(value, str) and value.strip().isdigit():
        result = int(value.strip())
    else:
        raise validation_error("body.content_schema_version", "Content schema version must be positive.")
    if result <= 0 or result > 32767:
        raise validation_error("body.content_schema_version", "Content schema version is out of range.")
    return result


def normalize_slug(value: str) -> str:
    if not isinstance(value, str):
        raise validation_error("slug", "Slug must be text.")
    text = unicodedata.normalize("NFKC", value).strip().casefold()
    if not text or any(unicodedata.category(ch) == "Cc" for ch in text):
        raise validation_error("slug", "Slug is invalid.")
    if "/" in text or "\\" in text or "%2f" in text or "%5c" in text:
        raise validation_error("slug", "Slug cannot contain path delimiters.")
    out: list[str] = []
    sep = False
    for ch in text:
        cat = unicodedata.category(ch)
        if cat[0] in {"L", "M", "N"}:
            if sep and out and out[-1] != "-":
                out.append("-")
            out.append(ch)
            sep = False
        elif ch == "-" or ch == "_" or ch.isspace() or cat[0] in {"P", "Z", "S"}:
            sep = True
        else:
            sep = True
    slug = "".join(out).strip("-")
    slug = re.sub(r"-+", "-", slug)
    if not slug or slug in {".", ".."} or len(slug) > 160:
        raise validation_error("slug", "Slug is invalid or exceeds 160 Unicode code points.")
    return slug


def _plain_rich_text(value: Any, field: str) -> str:
    if not isinstance(value, dict) or set(value) - {"runs"} or not isinstance(value.get("runs"), list):
        raise validation_error(field, "Rich text has an invalid shape.")
    parts: list[str] = []
    for index, run in enumerate(value["runs"]):
        run_field = f"{field}.runs.{index}"
        if not isinstance(run, dict):
            raise validation_error(run_field, "Rich-text run must be an object.")
        if set(run) - {"text", "marks", "link"}:
            raise validation_error(run_field, "Unknown rich-text run field.")
        text = run.get("text")
        marks = run.get("marks")
        if not isinstance(text, str) or not isinstance(marks, list):
            raise validation_error(run_field, "Rich-text run requires text and marks.")
        if len(set(marks)) != len(marks) or any(mark not in {"BOLD", "ITALIC"} for mark in marks):
            raise validation_error(f"{run_field}.marks", "Only BOLD and ITALIC marks are allowed.")
        if "link" in run:
            validate_link_destination(run["link"], f"{run_field}.link")
        parts.append(text)
    return "".join(parts)


def validate_link_destination(value: Any, field: str = "destination") -> None:
    if not isinstance(value, dict) or set(value) - {"kind", "target_type", "target_id", "static_page_key", "url"}:
        raise validation_error(field, "Link destination has an invalid shape.")
    kind = value.get("kind")
    if kind == "INTERNAL":
        target_type = value.get("target_type")
        if target_type not in {"ARTICLE", "CATEGORY", "TAG", "AUTHOR", "STATIC"}:
            raise validation_error(field, "Internal destination requires an approved target type.")
        if value.get("url") is not None:
            raise validation_error(field, "Internal destination may not carry an arbitrary URL.")
        if target_type == "STATIC":
            static_key = value.get("static_page_key")
            if static_key not in STATIC_PAGE_ROUTES or value.get("target_id") is not None:
                raise validation_error(field, "STATIC internal destination requires one fixed static_page_key and no target_id.")
        else:
            if not value.get("target_id") or value.get("static_page_key") is not None:
                raise validation_error(field, "Entity internal destination requires target_id and no static_page_key.")
    elif kind == "EXTERNAL":
        url = value.get("url")
        if value.get("target_type") is not None or value.get("target_id") is not None or value.get("static_page_key") is not None or not isinstance(url, str):
            raise validation_error(field, "External destination requires URL only.")
        parsed = urlparse(url)
        if parsed.scheme not in {"http", "https"} or not parsed.netloc:
            raise validation_error(field, "External URL must use HTTP or HTTPS.")
    else:
        raise validation_error(field, "Link kind must be INTERNAL or EXTERNAL.")


def _require_nonempty_text(value: Any, field: str) -> str:
    if not isinstance(value, str) or not value.strip():
        raise validation_error(field, "A non-empty value is required.")
    return value.strip()


def validate_article_body(body: Any, *, require_meaningful: bool = False, embed_registry: Mapping[str, EmbedProviderPolicy] | None = None) -> int:
    if not isinstance(body, dict) or set(body) - {"content_schema_version", "blocks"}:
        raise validation_error("body", "ArticleBody has an invalid envelope.")
    version = parse_content_schema_version(body.get("content_schema_version"))
    blocks = body.get("blocks")
    if not isinstance(blocks, list):
        raise validation_error("body.blocks", "Blocks must be an ordered array.")
    seen: set[str] = set()
    meaningful = False
    for index, block in enumerate(blocks):
        field = f"body.blocks.{index}"
        if not isinstance(block, dict):
            raise validation_error(field, "Block must be an object.")
        block_id = _require_nonempty_text(block.get("block_id"), f"{field}.block_id")
        if block_id in seen:
            raise validation_error(f"{field}.block_id", "Block IDs must be unique.", "DUPLICATE_BLOCK_ID")
        seen.add(block_id)
        block_type = block.get("type")
        if block_type not in ARTICLE_BLOCK_TYPES:
            raise validation_error(f"{field}.type", "Unknown, custom, raw HTML, script and style blocks are invalid.")
        expected_fields: dict[str, set[str]] = {
            "PARAGRAPH": {"block_id", "type", "content"},
            "HEADING": {"block_id", "type", "level", "content"},
            "LIST": {"block_id", "type", "style", "items"},
            "QUOTE": {"block_id", "type", "quote", "attribution", "source"},
            "SEPARATOR": {"block_id", "type"},
            "MEDIA": {"block_id", "type", "media_id", "alt_override", "caption"},
            "TABLE": {"block_id", "type", "header_row", "rows"},
            "EMBED": {"block_id", "type", "provider_key", "source_url_or_id", "caption"},
            "CALLOUT": {"block_id", "type", "label", "body"},
            "CTA": {"block_id", "type", "label", "supporting_text", "destination"},
            "DISCLAIMER": {"block_id", "type", "label", "body"},
            "SOURCES_REFERENCES": {"block_id", "type", "entries"},
        }[block_type]
        if set(block) - expected_fields:
            raise validation_error(field, "Unknown block payload field.")
        for optional_text in ("attribution", "source", "alt_override", "caption", "label", "supporting_text"):
            if optional_text in block and block[optional_text] is not None and not isinstance(block[optional_text], str):
                raise validation_error(f"{field}.{optional_text}", "Optional text value must be text when supplied.")
        if block_type == "PARAGRAPH":
            text_value = _plain_rich_text(block.get("content"), f"{field}.content").strip()
            if not text_value:
                raise validation_error(f"{field}.content", "Paragraph content must be meaningful.")
            meaningful = True
        elif block_type == "HEADING":
            if block.get("level") not in {2, 3, 4}:
                raise validation_error(f"{field}.level", "Heading level must be H2, H3 or H4.")
            text_value = _plain_rich_text(block.get("content"), f"{field}.content").strip()
            if not text_value:
                raise validation_error(f"{field}.content", "Heading content may not be empty.")
            meaningful = True
        elif block_type == "LIST":
            if block.get("style") not in {"ORDERED", "UNORDERED"}:
                raise validation_error(f"{field}.style", "List style is invalid.")
            items = block.get("items")
            if not isinstance(items, list) or not items:
                raise validation_error(f"{field}.items", "List requires at least one item.")
            values = [_plain_rich_text(item, f"{field}.items.{i}").strip() for i, item in enumerate(items)]
            if any(not value for value in values):
                raise validation_error(f"{field}.items", "List items may not be empty.")
            meaningful = True
        elif block_type == "QUOTE":
            text_value = _plain_rich_text(block.get("quote"), f"{field}.quote").strip()
            if not text_value:
                raise validation_error(f"{field}.quote", "Quote content is required.")
            meaningful = True
        elif block_type == "SEPARATOR":
            pass
        elif block_type == "MEDIA":
            _require_nonempty_text(block.get("media_id"), f"{field}.media_id")
            for optional_key in ("alt_override", "caption"):
                if optional_key in block and block[optional_key] is not None and not isinstance(block[optional_key], str):
                    raise validation_error(f"{field}.{optional_key}", "Media override/caption must be text.")
            meaningful = True
        elif block_type == "TABLE":
            if not isinstance(block.get("header_row"), bool):
                raise validation_error(f"{field}.header_row", "header_row must be boolean.")
            rows = block.get("rows")
            if not isinstance(rows, list) or not rows or not isinstance(rows[0], list) or not rows[0]:
                raise validation_error(f"{field}.rows", "Table requires at least one row and one cell.")
            width = len(rows[0])
            for ri, row in enumerate(rows):
                if not isinstance(row, list) or len(row) != width:
                    raise validation_error(f"{field}.rows.{ri}", "Table rows must be rectangular.")
                for ci, cell in enumerate(row):
                    _plain_rich_text(cell, f"{field}.rows.{ri}.{ci}")
            meaningful = True
        elif block_type == "EMBED":
            validate_embed_source(
                block.get("provider_key"),
                block.get("source_url_or_id"),
                embed_registry or {},
                field,
            )
            meaningful = True
        elif block_type in {"CALLOUT", "DISCLAIMER"}:
            text_value = _plain_rich_text(block.get("body"), f"{field}.body").strip()
            if not text_value:
                raise validation_error(f"{field}.body", f"{block_type.title()} body is required.")
            meaningful = True
        elif block_type == "CTA":
            _require_nonempty_text(block.get("label"), f"{field}.label")
            if "supporting_text" in block and block["supporting_text"] is not None and not isinstance(block["supporting_text"], str):
                raise validation_error(f"{field}.supporting_text", "CTA supporting text must be text.")
            validate_link_destination(block.get("destination"), f"{field}.destination")
            meaningful = True
        elif block_type == "SOURCES_REFERENCES":
            entries = block.get("entries")
            if not isinstance(entries, list) or not entries:
                raise validation_error(f"{field}.entries", "Sources/References requires at least one entry.")
            for ei, entry in enumerate(entries):
                if not isinstance(entry, dict) or set(entry) - {"title", "url", "publisher", "note"}:
                    raise validation_error(f"{field}.entries.{ei}", "Reference entry has an invalid shape.")
                _require_nonempty_text(entry.get("title"), f"{field}.entries.{ei}.title")
                for optional_key in ("publisher", "note"):
                    if optional_key in entry and entry[optional_key] is not None and not isinstance(entry[optional_key], str):
                        raise validation_error(f"{field}.entries.{ei}.{optional_key}", "Reference metadata must be text.")
                if entry.get("url") is not None:
                    parsed = urlparse(str(entry["url"]))
                    if parsed.scheme not in {"http", "https"} or not parsed.netloc:
                        raise validation_error(f"{field}.entries.{ei}.url", "Reference URL must use HTTP or HTTPS.")
            meaningful = True
    if require_meaningful and not meaningful:
        raise validation_error("body.blocks", "Schedule and Publish require at least one meaningful block.", "MEANINGFUL_CONTENT_REQUIRED")
    return version


def validate_unique_ids(values: Iterable[str], field: str, *, disallow: str | None = None) -> list[str]:
    result = [str(value) for value in values]
    if len(result) != len(set(result)):
        raise validation_error(field, "Duplicate identifiers are not allowed.")
    if disallow is not None and disallow in result:
        raise validation_error(field, "A Post cannot relate to itself.")
    return result


def resolve_schedule(local_input: str, timezone_id: str, *, now: datetime | None = None) -> datetime:
    _require_nonempty_text(local_input, "schedule_local_input")
    _require_nonempty_text(timezone_id, "schedule_timezone_id")
    try:
        zone = ZoneInfo(timezone_id)
    except ZoneInfoNotFoundError as exc:
        raise validation_error("schedule_timezone_id", "Timezone must be a valid IANA identifier.") from exc
    try:
        local = datetime.fromisoformat(local_input)
    except ValueError as exc:
        raise validation_error("schedule_local_input", "Schedule local input must be a valid local datetime.") from exc
    if local.tzinfo is not None:
        raise validation_error("schedule_local_input", "Schedule local input must not include an offset; timezone is supplied separately.")
    aware = local.replace(tzinfo=zone)
    # A local time that round-trips differently is nonexistent (DST gap).
    round_trip = aware.astimezone(UTC).astimezone(zone).replace(tzinfo=None)
    if round_trip != local:
        raise validation_error("schedule_local_input", "Schedule local time does not exist in the selected timezone.")
    # Reject ambiguous folds instead of selecting one ad hoc.
    alt = local.replace(tzinfo=zone, fold=1)
    if alt.utcoffset() != aware.utcoffset():
        raise validation_error("schedule_local_input", "Schedule local time is ambiguous in the selected timezone.")
    utc_value = aware.astimezone(UTC)
    current = (now or datetime.now(UTC)).astimezone(UTC)
    if utc_value <= current:
        raise validation_error("schedule_local_input", "Schedule must resolve to a future instant.")
    return utc_value


def require_transition(current: str, action: str) -> str | None:
    if current not in PERSISTED_POST_STATES:
        raise StateConflict("invalid current lifecycle state")
    transitions: dict[str, dict[str, str | None]] = {
        "SCHEDULE": {"DRAFT": "SCHEDULED", "SCHEDULED": "SCHEDULED", "ARCHIVED": "SCHEDULED"},
        "UNSCHEDULE": {"SCHEDULED": "DRAFT"},
        "PUBLISH": {"DRAFT": "PUBLISHED", "SCHEDULED": "PUBLISHED", "ARCHIVED": "PUBLISHED"},
        "ARCHIVE": {"PUBLISHED": "ARCHIVED", "SCHEDULED": "ARCHIVED"},
        "TRASH": {"DRAFT": "TRASH", "SCHEDULED": "TRASH", "PUBLISHED": "TRASH", "ARCHIVED": "TRASH"},
        "RESTORE": {"TRASH": "DRAFT"},
        "PERMANENT_DELETE": {"TRASH": None},
        "REVISION_RESTORE": {"DRAFT": "DRAFT", "SCHEDULED": "SCHEDULED", "PUBLISHED": "PUBLISHED", "ARCHIVED": "ARCHIVED"},
        "EDIT": {"DRAFT": "DRAFT", "SCHEDULED": "SCHEDULED", "PUBLISHED": "PUBLISHED", "ARCHIVED": "ARCHIVED"},
    }
    target = transitions.get(action, {}).get(current, "__ILLEGAL__")
    if target == "__ILLEGAL__":
        raise StateConflict("requested lifecycle transition is not allowed")
    return target


def validate_publish_eligibility(post: dict[str, Any], *, embed_registry: Mapping[str, EmbedProviderPolicy] | None = None) -> None:
    if not isinstance(post.get("title"), str) or not post["title"].strip():
        raise validation_error("title", "Schedule and Publish require a non-empty title.")
    validate_article_body(post.get("body"), require_meaningful=True, embed_registry=embed_registry)
    if not post.get("author_site_profile_id"):
        raise validation_error("author_site_profile_id", "Schedule and Publish require an active same-site author.")
    if not post.get("slug"):
        raise validation_error("slug", "Schedule and Publish require a slug.")


def validate_structured_data_inputs(value: Any, field: str = "structured_data_inputs") -> dict[str, Any]:
    if not isinstance(value, dict):
        raise validation_error(field, "Structured-data inputs must be an object keyed by generated object type.")
    result: dict[str, Any] = {}
    for type_key, values in value.items():
        if not isinstance(type_key, str) or re.fullmatch(r"[A-Za-z][A-Za-z0-9_]{0,63}", type_key) is None:
            raise validation_error(field, "Structured-data type key is invalid.")
        if not isinstance(values, dict) or not values:
            raise validation_error(f"{field}.{type_key}", "Structured-data type values must be a non-empty object.")
        clean: dict[str, Any] = {}
        for key, item in values.items():
            if not isinstance(key, str) or key.startswith("@") or re.fullmatch(r"[A-Za-z][A-Za-z0-9_]{0,63}", key) is None:
                raise validation_error(f"{field}.{type_key}", "Raw JSON-LD directives and invalid keys are prohibited.")
            if isinstance(item, (str, int, float, bool)) and not isinstance(item, complex):
                clean[key] = item
            elif isinstance(item, list) and all(isinstance(v, (str, int, float, bool)) and not isinstance(v, complex) for v in item):
                clean[key] = list(item)
            else:
                raise validation_error(f"{field}.{type_key}.{key}", "Structured-data values must be scalar or arrays of scalar values; nested arbitrary objects are prohibited.")
        result[type_key] = clean
    return result


def assert_no_unresolved_structured_data_transport(body: dict[str, Any]) -> None:
    # Compatibility name retained for CHAT04 callers; RC8 reconciles transport and
    # persistence to the same canonical JSON object rather than blocking the field.
    if "structured_data_inputs" in body:
        body["structured_data_inputs"] = validate_structured_data_inputs(body["structured_data_inputs"])


def validate_site_settings_entries(entries: Any) -> dict[str, Any]:
    if not isinstance(entries, list):
        raise validation_error("settings", "Settings must be an array.")
    allowed = {
        "display_name", "locale_code", "default_language_code", "timezone_id",
        "logo_media_id", "favicon_media_id", "default_social_image_media_id",
        "copyright_text", "contact_info", "social_profiles", "seo_defaults",
        "analytics_verification",
    }
    object_keys = {"contact_info", "social_profiles", "seo_defaults", "analytics_verification"}
    result: dict[str, Any] = {}
    for index, entry in enumerate(entries):
        if not isinstance(entry, dict) or set(entry) != {"key", "value"}:
            raise validation_error(f"settings.{index}", "Setting entry has an invalid shape.")
        key = entry["key"]
        if key not in allowed:
            raise validation_error(f"settings.{index}.key", "Setting key is not part of the approved Site Settings contract.")
        if key in result:
            raise validation_error(f"settings.{index}.key", "Setting keys must be unique.")
        value = entry["value"]
        if key in object_keys:
            if not isinstance(value, dict):
                raise validation_error(f"settings.{index}.value", "This Site Setting requires a JSON object value.")
            for child_key, child_value in value.items():
                if not isinstance(child_key, str) or not child_key:
                    raise validation_error(f"settings.{index}.value", "Structured Site Setting keys must be non-empty text.")
                scalar = child_value is None or isinstance(child_value, (str, int, float, bool))
                scalar_array = isinstance(child_value, list) and all(v is None or isinstance(v, (str, int, float, bool)) for v in child_value)
                if not scalar and not scalar_array:
                    raise validation_error(f"settings.{index}.value.{child_key}", "Structured Site Setting values must be JSON scalars or arrays of scalars; undocumented nested objects are prohibited.")
        if key not in object_keys and isinstance(value, (dict, list)):
            raise validation_error(f"settings.{index}.value", "This Site Setting does not accept a structured JSON value.")
        if key == "timezone_id":
            try:
                ZoneInfo(str(value))
            except ZoneInfoNotFoundError as exc:
                raise validation_error(f"settings.{index}.value", "Timezone must be a valid IANA identifier.") from exc
        result[key] = value
    return result


def validate_navigation_destination(value: Any, field: str) -> dict[str, Any]:
    if not isinstance(value, dict) or set(value) - {"kind", "target_id", "static_page_key", "url"}:
        raise validation_error(field, "Navigation destination must be a typed object.")
    kind = value.get("kind")
    if kind not in {"HOME", "ARTICLE", "CATEGORY", "TAG", "AUTHOR", "SEARCH", "STATIC", "EXTERNAL"}:
        raise validation_error(field, "Navigation destination kind is invalid.")
    target = value.get("target_id")
    static_key = value.get("static_page_key")
    url = value.get("url")
    if kind in {"ARTICLE", "CATEGORY", "TAG", "AUTHOR"}:
        if not target or static_key is not None or url is not None:
            raise validation_error(field, "This internal destination requires target_id only.")
    elif kind == "STATIC":
        if static_key not in STATIC_PAGE_ROUTES or target is not None or url is not None:
            raise validation_error(field, "STATIC navigation requires one fixed static_page_key and no target_id or URL.")
    elif kind == "EXTERNAL":
        parsed = urlparse(str(url or ""))
        if target is not None or static_key is not None or parsed.scheme not in {"http", "https"} or not parsed.netloc:
            raise validation_error(field, "External navigation requires a valid HTTP(S) URL only.")
    else:
        if target is not None or static_key is not None or url is not None:
            raise validation_error(field, "HOME and SEARCH destinations accept no target or URL.")
    return dict(value)


def validate_navigation_items(items: Any, *, depth: int = 0, max_depth: int = 8) -> list[dict[str, Any]]:
    if not isinstance(items, list):
        raise validation_error("items", "Navigation items must be an array.")
    if depth > max_depth:
        raise BadRequest("navigation nesting exceeds supported safety bound")
    result: list[dict[str, Any]] = []
    for index, item in enumerate(items):
        field = f"items.{index}" if depth == 0 else f"children.{index}"
        if not isinstance(item, dict) or set(item) - {"label", "destination", "children"}:
            raise validation_error(field, "Navigation item has an invalid shape.")
        label = _require_nonempty_text(item.get("label"), f"{field}.label")
        destination = validate_navigation_destination(item.get("destination"), f"{field}.destination")
        children = validate_navigation_items(item.get("children"), depth=depth + 1, max_depth=max_depth)
        result.append({"label": label, "destination": destination, "children": children})
    return result
