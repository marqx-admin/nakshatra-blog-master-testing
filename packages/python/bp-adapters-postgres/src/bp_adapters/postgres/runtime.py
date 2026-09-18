from __future__ import annotations

"""Concrete PostgreSQL read/runtime adapters for the integrated two-site candidate.

This module adds no schema or product behavior.  It projects the accepted DOC-08
persistence model through the existing DOC-04/DOC-13/DOC-15 ports.  Every
site-owned read executes through ``SiteTransactionPort`` so PostgreSQL FORCE RLS
remains the final tenant boundary.
"""

from dataclasses import dataclass
from datetime import UTC, datetime
import hashlib
import json
import re
from typing import Any, AsyncIterator, Mapping
from urllib.parse import urlsplit

from sqlalchemy import text
from sqlalchemy.engine import Engine

from bp_domain.context import SiteContext, SiteRecord
from bp_domain.errors import NotFound, ValidationFault
from bp_domain.search import PublicSearchDocument
from bp_domain.security import AccountState, AdminPrincipal
from bp_domain.seo import (
    build_breadcrumb_trail,
    build_structured_data,
    resolve_canonical_url,
    resolve_document_title,
    resolve_meta_description,
    resolve_open_graph,
    robots_decision,
)
from bp_ports import SearchIndexPort, SiteTransactionPort


STATIC_ROUTES = {
    "ABOUT": ("PUB-STATIC-ABOUT-01", "/about", "About"),
    "CONTACT": ("PUB-STATIC-CONTACT-01", "/contact", "Contact"),
    "PRIVACY": ("PUB-STATIC-PRIVACY-01", "/privacy-policy", "Privacy Policy"),
    "TERMS": ("PUB-STATIC-TERMS-01", "/terms-of-use", "Terms of Use"),
    "DISCLAIMER": ("PUB-STATIC-DISCLAIMER-01", "/disclaimer", "Disclaimer"),
}
STATIC_BY_PATH = {route: (key, page_id, title) for key, (page_id, route, title) in STATIC_ROUTES.items()}
PAGE_KIND = {
    "PUB-HOME-01": "HOME",
    "PUB-ARTICLE-01": "ARTICLE",
    "PUB-CATEGORY-01": "CATEGORY",
    "PUB-TAG-01": "TAG",
    "PUB-AUTHOR-01": "AUTHOR",
    "PUB-SEARCH-01": "SEARCH",
    "PUB-STATIC-ABOUT-01": "STATIC",
    "PUB-STATIC-CONTACT-01": "STATIC",
    "PUB-STATIC-PRIVACY-01": "STATIC",
    "PUB-STATIC-TERMS-01": "STATIC",
    "PUB-STATIC-DISCLAIMER-01": "STATIC",
    "PUB-SYS-PREVIEW-01": "PREVIEW",
    "PUB-SYS-404-01": "SYSTEM",
    "PUB-SYS-410-01": "SYSTEM",
}


def _m(row: Any) -> dict[str, Any]:
    if row is None:
        return {}
    mapping = getattr(row, "_mapping", row)
    return dict(mapping)


def _iso(value: Any) -> str | None:
    if value is None:
        return None
    if isinstance(value, datetime):
        if value.tzinfo is None:
            value = value.replace(tzinfo=UTC)
        return value.astimezone(UTC).isoformat().replace("+00:00", "Z")
    return str(value)


def _json_object(value: Any) -> dict[str, Any]:
    if isinstance(value, dict):
        return dict(value)
    if isinstance(value, str):
        loaded = json.loads(value)
        return dict(loaded) if isinstance(loaded, dict) else {}
    return {}


def _social_profiles(raw: Any) -> list[dict[str, str]]:
    source = _json_object(raw)
    out: list[dict[str, str]] = []
    for platform, value in sorted(source.items()):
        if isinstance(value, str) and value.strip():
            out.append({"platform": str(platform), "url": value.strip()})
        elif isinstance(value, dict) and isinstance(value.get("url"), str) and value["url"].strip():
            out.append({"platform": str(value.get("platform") or platform), "url": value["url"].strip()})
    return out


def _body_text(body: Any) -> str:
    if not isinstance(body, dict):
        return ""
    pieces: list[str] = []
    for block in body.get("blocks") or []:
        if not isinstance(block, dict):
            continue
        for key in ("content", "quote", "caption", "title", "text"):
            value = block.get(key)
            if isinstance(value, str):
                pieces.append(value)
            elif isinstance(value, dict):
                for run in value.get("runs") or []:
                    if isinstance(run, dict) and isinstance(run.get("text"), str):
                        pieces.append(run["text"])
        for item in block.get("items") or []:
            if isinstance(item, str):
                pieces.append(item)
            elif isinstance(item, dict):
                for run in item.get("runs") or []:
                    if isinstance(run, dict) and isinstance(run.get("text"), str):
                        pieces.append(run["text"])
    return " ".join(pieces)


def _page_context(page_id: str, *, render_mode: str = "PUBLIC", locale: str | None = None) -> dict[str, Any]:
    semantic = PAGE_KIND[page_id]
    kind = "CONTENT" if semantic in {"HOME", "ARTICLE", "CATEGORY", "TAG", "AUTHOR", "SEARCH"} else semantic
    result: dict[str, Any] = {
        "page_id": page_id,
        "page_kind": kind,
        "render_mode": render_mode,
    }
    if locale:
        result["locale_code"] = locale
    return result


class PostgresSiteRegistry:
    """Trusted host/Site directory backed by DOC-08 ``sites`` + ``domains``."""

    def __init__(self, engine: Engine) -> None:
        self.engine = engine

    @staticmethod
    def _record(row: Any) -> SiteRecord | None:
        if row is None:
            return None
        data = _m(row)
        return SiteRecord(
            site_id=str(data["site_id"]),
            site_key=str(data["site_key"]),
            canonical_domain=str(data["canonical_domain"]),
            lifecycle=str(data["status"]),
            timezone=data.get("timezone_id"),
            locale=data.get("locale_code"),
            version_marker=_iso(data.get("updated_at")),
            display_name=data.get("display_name"),
        )

    def _by(self, where: str, params: Mapping[str, Any]) -> SiteRecord | None:
        sql = text(
            "SELECT s.site_id,s.site_key,s.display_name,s.status,s.timezone_id,s.locale_code,s.updated_at,"
            "d.hostname AS canonical_domain "
            "FROM sites s JOIN domains d ON d.site_id=s.site_id AND d.is_canonical=true AND d.is_active=true "
            f"WHERE {where} LIMIT 1"
        )
        with self.engine.connect() as connection:
            return self._record(connection.execute(sql, dict(params)).fetchone())

    async def resolve_host(self, normalized_host: str) -> SiteRecord | None:
        # Only explicit active rows resolve.  No implicit www/canonical fallback exists.
        sql = text(
            "SELECT s.site_id,s.site_key,s.display_name,s.status,s.timezone_id,s.locale_code,s.updated_at,"
            "canon.hostname AS canonical_domain "
            "FROM domains requested JOIN sites s ON s.site_id=requested.site_id "
            "JOIN domains canon ON canon.site_id=s.site_id AND canon.is_canonical=true AND canon.is_active=true "
            "WHERE requested.hostname_normalized=:host AND requested.is_active=true LIMIT 1"
        )
        with self.engine.connect() as connection:
            return self._record(connection.execute(sql, {"host": normalized_host}).fetchone())

    async def get_site_by_key(self, site_key: str) -> SiteRecord | None:
        return self._by("s.site_key=:site_key", {"site_key": site_key})

    async def get_site_by_id(self, site_id: str) -> SiteRecord | None:
        return self._by("s.site_id=:site_id", {"site_id": site_id})

    async def list_sites(self) -> list[SiteRecord]:
        sql = text(
            "SELECT s.site_id,s.site_key,s.display_name,s.status,s.timezone_id,s.locale_code,s.updated_at,"
            "d.hostname AS canonical_domain "
            "FROM sites s JOIN domains d ON d.site_id=s.site_id AND d.is_canonical=true AND d.is_active=true "
            "ORDER BY s.site_key"
        )
        with self.engine.connect() as connection:
            return [record for row in connection.execute(sql).fetchall() if (record := self._record(row)) is not None]


class PostgresIdentityAuthorization:
    """DOC-02 principal projection from DOC-08 accounts/assignments/roles."""

    def __init__(self, engine: Engine) -> None:
        self.engine = engine

    def _principal(self, where: str, params: Mapping[str, Any]) -> AdminPrincipal | None:
        with self.engine.connect() as connection:
            row = connection.execute(
                text(
                    "SELECT admin_id,email,status,is_super_admin FROM admin_accounts WHERE " + where + " LIMIT 1"
                ),
                dict(params),
            ).fetchone()
            if row is None:
                return None
            data = _m(row)
            admin_id = str(data["admin_id"])
            site_rows = connection.execute(
                text(
                    "SELECT s.site_key,rp.permission_key FROM account_site_assignments asa "
                    "JOIN sites s ON s.site_id=asa.site_id "
                    "LEFT JOIN account_site_role_assignments asra ON asra.admin_id=asa.admin_id AND asra.site_id=asa.site_id "
                    "LEFT JOIN roles r ON r.role_id=asra.role_id AND r.scope='SITE' AND r.status='ACTIVE' "
                    "LEFT JOIN role_permissions rp ON rp.role_id=r.role_id AND rp.scope='SITE' "
                    "WHERE asa.admin_id=:admin_id ORDER BY s.site_key,rp.permission_key"
                ),
                {"admin_id": admin_id},
            ).fetchall()
            site_permissions: dict[str, set[str]] = {}
            for item in site_rows:
                item_data = _m(item)
                site_permissions.setdefault(str(item_data["site_key"]), set())
                if item_data.get("permission_key"):
                    site_permissions[str(item_data["site_key"])].add(str(item_data["permission_key"]))
            global_rows = connection.execute(
                text(
                    "SELECT rp.permission_key FROM account_global_role_assignments agra "
                    "JOIN roles r ON r.role_id=agra.role_id AND r.scope='GLOBAL' AND r.status='ACTIVE' "
                    "JOIN role_permissions rp ON rp.role_id=r.role_id AND rp.scope='GLOBAL' "
                    "WHERE agra.admin_id=:admin_id ORDER BY rp.permission_key"
                ),
                {"admin_id": admin_id},
            ).fetchall()
            return AdminPrincipal(
                admin_id=admin_id,
                email=str(data["email"]),
                state=AccountState(str(data["status"])),
                is_super_admin=bool(data["is_super_admin"]),
                global_permissions=frozenset(str(_m(item)["permission_key"]) for item in global_rows),
                site_permissions={key: frozenset(values) for key, values in site_permissions.items()},
            )

    async def get_principal(self, admin_id: str) -> AdminPrincipal | None:
        return self._principal("admin_id=:value", {"value": admin_id})

    async def find_principal_by_email(self, normalized_email: str) -> AdminPrincipal | None:
        return self._principal("email_normalized=:value", {"value": normalized_email})

    # Credential material is intentionally outside PostgreSQL under DOC-19.
    async def credential_verifier(self, admin_id: str) -> str | None:
        return None

    async def set_credential_verifier(self, admin_id: str, verifier: str) -> None:
        raise RuntimeError("credential verifier belongs to the security-state store")

    async def activate_invited_admin(self, admin_id: str) -> None:
        with self.engine.begin() as connection:
            result = connection.execute(
                text("UPDATE admin_accounts SET status='ACTIVE',updated_at=now() WHERE admin_id=:id AND status='INVITED'"),
                {"id": admin_id},
            )
            if result.rowcount != 1:
                raise NotFound("resource not found")


class PostgresAuditAdapter:
    def __init__(self, engine: Engine) -> None:
        self.engine = engine

    async def append(
        self,
        event_code: str,
        *,
        actor_admin_id: str | None,
        site_id: str | None,
        details: dict[str, Any],
    ) -> None:
        with self.engine.begin() as connection:
            raw_outcome = str(details.get("outcome", "SUCCESS")).upper()
            outcome = "FAILED" if raw_outcome in {"FAIL", "FAILURE", "FAILED"} else ("DENIED" if raw_outcome == "DENIED" else "SUCCESS")
            connection.execute(
                text(
                    "INSERT INTO audit_events(scope,site_id,actor_type,actor_admin_id,event_code,request_id,outcome,details) "
                    "VALUES (:scope,:site_id,:actor_type,:actor,:event_code,:request_id,:outcome,CAST(:details AS jsonb))"
                ),
                {
                    "scope": "SITE" if site_id is not None else "GLOBAL",
                    "site_id": site_id,
                    "actor_type": "ADMIN" if actor_admin_id is not None else "SYSTEM",
                    "actor": actor_admin_id,
                    "event_code": event_code,
                    "request_id": details.get("request_id"),
                    "outcome": outcome,
                    "details": json.dumps(details, sort_keys=True, default=str),
                },
            )


@dataclass(slots=True)
class PostgresAdminSiteContextPayload:
    site_transactions: SiteTransactionPort

    async def build(self, principal: AdminPrincipal, context: SiteContext) -> dict[str, Any]:
        if principal.is_super_admin:
            async with self.site_transactions.transaction(context) as connection:
                effective = [str(row[0]) for row in connection.execute(
                    text("SELECT permission_key FROM permissions WHERE scope='SITE' ORDER BY permission_key")
                ).fetchall()]
        else:
            effective = sorted(principal.site_permissions.get(context.site_key, frozenset()))
        return {
            "site_key": context.site_key,
            "display_name": context.display_name or context.site_key,
            "lifecycle_state": context.site_status,
            "effective_permissions": effective,
        }


@dataclass(slots=True)
class PostgresSiteDashboardPayload:
    site_transactions: SiteTransactionPort

    async def build(self, principal: AdminPrincipal, context: SiteContext) -> dict[str, Any]:
        async with self.site_transactions.transaction(context) as connection:
            counts = connection.execute(
                text(
                    "SELECT status,count(*) AS count FROM posts WHERE site_id=:site_id GROUP BY status"
                ),
                {"site_id": context.site_id},
            ).fetchall()
            count_by_status = {str(_m(row)["status"]): int(_m(row)["count"]) for row in counts}
            scheduled = int(count_by_status.get("SCHEDULED", 0))
            published = int(count_by_status.get("PUBLISHED", 0))
            draft = int(count_by_status.get("DRAFT", 0))
            total = sum(count_by_status.values())
            # A site dashboard is an editorial read model.  Reading the GLOBAL,
            # append-only audit ledger from the RLS-bound site connection both
            # violated that boundary and caused every dashboard request to fail
            # under the deliberately least-privileged db_site_runtime role.
            recent = connection.execute(
                text(
                    "SELECT count(*) FROM posts WHERE site_id=:site_id "
                    "AND updated_at >= now()-interval '7 days'"
                ),
                {"site_id": context.site_id},
            ).scalar_one()
        return {
            "metrics": [
                {"key": "total_posts", "label": "Total blogs", "value": total},
                {"key": "draft_posts", "label": "Draft posts", "value": draft},
                {"key": "scheduled_posts", "label": "Scheduled posts", "value": scheduled},
                {"key": "published_posts", "label": "Published posts", "value": published},
            ],
            "attention_items": [
                {"kind": "RECENT", "label": "Recently updated blogs", "count": int(recent or 0)},
                {"kind": "SCHEDULED", "label": "Upcoming scheduled blogs", "count": scheduled},
            ],
        }


class PostgresPublicPageAdapter:
    """DOC-13 PageData projection from one RLS-bound site transaction."""

    def __init__(
        self,
        site_transactions: SiteTransactionPort,
        *,
        search: SearchIndexPort | None = None,
        media_cdn_origin: str,
        static_content: Mapping[str, Mapping[str, Any]] | None = None,
    ) -> None:
        self.site_transactions = site_transactions
        self.search = search
        self.media_cdn_origin = media_cdn_origin.rstrip("/")
        self.static_content = {str(k): dict(v) for k, v in (static_content or {}).items()}

    @staticmethod
    def _canonical(context: SiteContext, path: str) -> str:
        return f"https://{context.canonical_domain}{path}"

    @staticmethod
    def _destination(context: SiteContext, kind: str, path: str, page_id: str | None = None) -> dict[str, Any]:
        out: dict[str, Any] = {
            "kind": kind,
            "url": f"https://{context.canonical_domain}{path}",
            "is_external": False,
        }
        if page_id:
            out["page_id"] = page_id
        return out

    @staticmethod
    def _external_destination(url: str) -> dict[str, Any]:
        return {"kind": "EXTERNAL", "url": url, "is_external": True}

    def _site_identity(self, context: SiteContext, site: dict[str, Any], settings: dict[str, Any], logo: dict[str, Any] | None, favicon: dict[str, Any] | None) -> dict[str, Any]:
        out: dict[str, Any] = {
            "site_key": context.site_key,
            "display_name": site["display_name"],
            "canonical_domain": context.canonical_domain,
            "home_destination": self._destination(context, "HOME", "/", "PUB-HOME-01"),
            "timezone_id": site["timezone_id"],
        }
        if site.get("default_language_code"):
            out["default_language"] = site["default_language_code"]
        if site.get("locale_code"):
            out["locale_code"] = site["locale_code"]
        if logo:
            out["logo_media"] = logo
        if favicon:
            out["favicon_media"] = favicon
        return out

    def _public_settings(self, settings: dict[str, Any], default_social: dict[str, Any] | None) -> dict[str, Any]:
        out: dict[str, Any] = {"social_profiles": _social_profiles(settings.get("social_profiles"))}
        if settings.get("copyright_text"):
            out["copyright_text"] = settings["copyright_text"]
        if default_social:
            out["default_social_image"] = default_social
        return out

    def _media(self, connection: Any, context: SiteContext, media_id: str | None) -> dict[str, Any] | None:
        if not media_id:
            return None
        row = connection.execute(
            text("SELECT * FROM media WHERE site_id=:site_id AND media_id=:media_id AND status='ACTIVE'"),
            {"site_id": context.site_id, "media_id": media_id},
        ).fetchone()
        if row is None:
            return None
        data = _m(row)
        variants = connection.execute(
            text(
                "SELECT variant_key,mime_type,width_px,height_px FROM media_variants "
                "WHERE site_id=:site_id AND media_id=:media_id ORDER BY variant_key"
            ),
            {"site_id": context.site_id, "media_id": media_id},
        ).fetchall()
        variant_keys = {str(_m(v)["variant_key"]) for v in variants}
        if "native_webp" not in variant_keys:
            return None
        updated = data.get("updated_at") or data.get("created_at") or datetime.now(UTC)
        if isinstance(updated, datetime):
            epoch_ms = int(updated.timestamp() * 1000)
        else:
            epoch_ms = 0
        def url(key: str, mime_type: str) -> dict[str, Any]:
            extension = "avif" if mime_type == "image/avif" else "webp"
            return {
                "variant_key": key,
                "url": f"{self.media_cdn_origin}/m/{context.site_key}/{media_id}/{key}.{extension}?v={epoch_ms}",
                "mime_type": mime_type,
            }
        variant_payload: list[dict[str, Any]] = []
        for variant in variants:
            v = _m(variant)
            payload = url(str(v["variant_key"]), str(v["mime_type"]))
            if v.get("width_px") is not None:
                payload["width"] = int(v["width_px"])
            if v.get("height_px") is not None:
                payload["height"] = int(v["height_px"])
            variant_payload.append(payload)
        base = next((item for item in variant_payload if item["variant_key"] == "native_webp"), variant_payload[0])
        out: dict[str, Any] = {
            "media_id": str(data["media_id"]),
            "url": base["url"],
            "mime_type": base["mime_type"],
            "variants": variant_payload,
        }
        if data.get("width_px") is not None:
            out["width"] = int(data["width_px"])
        if data.get("height_px") is not None:
            out["height"] = int(data["height_px"])
        if data.get("alt_text"):
            out["alt_text"] = data["alt_text"]
        if data.get("caption"):
            out["caption"] = data["caption"]
        if data.get("credit_text"):
            out["credit_text"] = data["credit_text"]
        return out

    def _author_summary(self, connection: Any, context: SiteContext, author_id: str | None) -> dict[str, Any] | None:
        if not author_id:
            return None
        row = connection.execute(
            text("SELECT * FROM author_site_profiles WHERE site_id=:site_id AND author_profile_id=:id AND status='ACTIVE'"),
            {"site_id": context.site_id, "id": author_id},
        ).fetchone()
        if row is None:
            return None
        data = _m(row)
        out: dict[str, Any] = {"author_id": str(data["author_profile_id"]), "display_name": data["display_name"]}
        if data.get("slug"):
            out["destination"] = self._destination(context, "AUTHOR", f"/author/{data['slug']}", "PUB-AUTHOR-01")
        if data.get("photo_media_id"):
            avatar = self._media(connection, context, str(data["photo_media_id"]))
            if avatar:
                out["avatar_media"] = avatar
        if data.get("bio"):
            out["short_bio"] = data["bio"]
        return out

    def _taxonomy_summaries(self, connection: Any, context: SiteContext, post_id: str) -> tuple[list[dict[str, Any]], list[dict[str, Any]]]:
        cats = connection.execute(
            text(
                "SELECT c.category_id,c.name,c.slug FROM post_categories pc JOIN categories c "
                "ON c.site_id=pc.site_id AND c.category_id=pc.category_id "
                "WHERE pc.site_id=:site_id AND pc.post_id=:post_id AND c.status='ACTIVE' ORDER BY c.name,c.category_id"
            ),
            {"site_id": context.site_id, "post_id": post_id},
        ).fetchall()
        tags = connection.execute(
            text(
                "SELECT t.tag_id,t.name,t.slug FROM post_tags pt JOIN tags t "
                "ON t.site_id=pt.site_id AND t.tag_id=pt.tag_id "
                "WHERE pt.site_id=:site_id AND pt.post_id=:post_id AND t.status='ACTIVE' ORDER BY t.name,t.tag_id"
            ),
            {"site_id": context.site_id, "post_id": post_id},
        ).fetchall()
        return (
            [
                {
                    "kind": "CATEGORY",
                    "name": _m(row)["name"],
                    "destination": self._destination(context, "CATEGORY", f"/category/{_m(row)['slug']}", "PUB-CATEGORY-01"),
                }
                for row in cats
            ],
            [
                {
                    "kind": "TAG",
                    "name": _m(row)["name"],
                    "destination": self._destination(context, "TAG", f"/tag/{_m(row)['slug']}", "PUB-TAG-01"),
                }
                for row in tags
            ],
        )

    def _article_summary(self, connection: Any, context: SiteContext, row: Any) -> dict[str, Any]:
        data = _m(row)
        slug = data.get("slug")
        out: dict[str, Any] = {
            "article_id": str(data["post_id"]),
            "destination": self._destination(context, "ARTICLE", f"/article/{slug}", "PUB-ARTICLE-01"),
            "title": data["title"],
            "published_at": _iso(data["published_at"]),
        }
        if data.get("excerpt"):
            out["excerpt"] = data["excerpt"]
        if data.get("featured_media_id"):
            media = self._media(connection, context, str(data["featured_media_id"]))
            if media:
                out["featured_media"] = media
        author = self._author_summary(connection, context, str(data["author_site_profile_id"]) if data.get("author_site_profile_id") else None)
        if author:
            out["author"] = author
        if data.get("updated_at"):
            out["updated_at"] = _iso(data["updated_at"])
        return out

    def _article_detail(self, connection: Any, context: SiteContext, row: Any, *, preview: bool = False) -> dict[str, Any]:
        data = _m(row)
        post_id = str(data["post_id"])
        cats, tags = self._taxonomy_summaries(connection, context, post_id)
        body = data.get("body") if isinstance(data.get("body"), dict) else _json_object(data.get("body"))
        body = dict(body or {})
        body.setdefault("content_schema_version", str(data.get("content_schema_version") or 1))
        body.setdefault("blocks", [])
        body["content_schema_version"] = str(body["content_schema_version"])
        author = self._author_summary(connection, context, str(data["author_site_profile_id"]) if data.get("author_site_profile_id") else None)
        if not preview and author is None:
            # DOC-07 publish eligibility requires one active same-site author.  A
            # corrupted published row fails closed instead of fabricating public data.
            raise RuntimeError("published article is missing its required same-site author")
        if preview:
            out: dict[str, Any] = {
                "article_id": post_id,
                "title": data["title"],
                "body": body,
                "categories": cats,
                "tags": tags,
            }
            if data.get("slug"):
                out["public_destination"] = self._destination(context, "ARTICLE", f"/article/{data['slug']}", "PUB-ARTICLE-01")
        else:
            out = {
                "article_id": post_id,
                "destination": self._destination(context, "ARTICLE", f"/article/{data['slug']}", "PUB-ARTICLE-01"),
                "title": data["title"],
                "body": body,
                "author": author,
                "categories": cats,
                "tags": tags,
                "published_at": _iso(data["published_at"]),
            }
        if data.get("excerpt"):
            out["excerpt"] = data["excerpt"]
        if data.get("featured_media_id"):
            media = self._media(connection, context, str(data["featured_media_id"]))
            if media:
                out["featured_media"] = media
        if author and preview:
            out["author"] = author
        if data.get("published_at"):
            out["published_at"] = _iso(data["published_at"])
        if data.get("updated_at"):
            out["updated_at"] = _iso(data["updated_at"])
        return out

    def _base_rows(self, connection: Any, context: SiteContext) -> tuple[dict[str, Any], dict[str, Any]]:
        site_row = connection.execute(
            text("SELECT display_name,timezone_id,locale_code,default_language_code,status FROM sites WHERE site_id=:site_id"),
            {"site_id": context.site_id},
        ).fetchone()
        settings_row = connection.execute(text("SELECT * FROM site_settings WHERE site_id=:site_id"), {"site_id": context.site_id}).fetchone()
        if site_row is None or settings_row is None:
            raise NotFound("resource not found")
        return _m(site_row), _m(settings_row)

    def _resolve_destination(self, connection: Any, context: SiteContext, row: dict[str, Any]) -> dict[str, Any] | None:
        kind = str(row["destination_kind"])
        if kind == "HOME":
            return self._destination(context, "HOME", "/", "PUB-HOME-01")
        if kind == "SEARCH":
            return self._destination(context, "SEARCH", "/search", "PUB-SEARCH-01")
        if kind == "EXTERNAL":
            url = str(row.get("external_url") or "")
            if not url.startswith("https://"):
                return None
            return self._external_destination(url)
        if kind == "STATIC":
            key = str(row.get("static_page_key") or "")
            if key not in STATIC_ROUTES:
                return None
            page_id, path, _ = STATIC_ROUTES[key]
            return self._destination(context, "STATIC", path, page_id)
        table = {
            "POST": ("posts", "post_id", "slug", "status='PUBLISHED'", "ARTICLE", "/article/", "PUB-ARTICLE-01"),
            "CATEGORY": ("categories", "category_id", "slug", "status='ACTIVE'", "CATEGORY", "/category/", "PUB-CATEGORY-01"),
            "TAG": ("tags", "tag_id", "slug", "status='ACTIVE'", "TAG", "/tag/", "PUB-TAG-01"),
            "AUTHOR": ("author_site_profiles", "author_profile_id", "slug", "status='ACTIVE'", "AUTHOR", "/author/", "PUB-AUTHOR-01"),
        }.get(kind)
        if table is None:
            return None
        table_name, id_col, slug_col, eligibility, public_kind, prefix, page_id = table
        target_col = {
            "POST": "target_post_id",
            "CATEGORY": "target_category_id",
            "TAG": "target_tag_id",
            "AUTHOR": "target_author_profile_id",
        }[kind]
        target = row.get(target_col)
        if target is None:
            return None
        entity = connection.execute(
            text(f"SELECT {slug_col} AS slug FROM {table_name} WHERE site_id=:site_id AND {id_col}=:target AND {eligibility}"),
            {"site_id": context.site_id, "target": target},
        ).fetchone()
        if entity is None:
            return None
        return self._destination(context, public_kind, prefix + str(_m(entity)["slug"]), page_id)

    def _navigation(self, connection: Any, context: SiteContext) -> dict[str, Any]:
        result: dict[str, Any] = {}
        for menu_key, public_key in (("HEADER", "header"), ("FOOTER", "footer")):
            menu = connection.execute(
                text("SELECT menu_id FROM navigation_menus WHERE site_id=:site_id AND menu_key=:key"),
                {"site_id": context.site_id, "key": menu_key},
            ).fetchone()
            rows = [] if menu is None else connection.execute(
                text(
                    "SELECT * FROM navigation_items WHERE site_id=:site_id AND menu_id=:menu_id AND is_enabled=true "
                    "ORDER BY parent_item_id NULLS FIRST,sort_order,item_id"
                ),
                {"site_id": context.site_id, "menu_id": _m(menu)["menu_id"]},
            ).fetchall()
            nodes: dict[str, dict[str, Any]] = {}
            parents: dict[str, str | None] = {}
            for raw in rows:
                item = _m(raw)
                destination = self._resolve_destination(connection, context, item)
                if destination is None:
                    continue
                item_id = str(item["item_id"])
                nodes[item_id] = {"label": item["label"], "destination": destination, "children": []}
                parents[item_id] = str(item["parent_item_id"]) if item.get("parent_item_id") else None
            roots: list[dict[str, Any]] = []
            for item_id, node in nodes.items():
                parent = parents[item_id]
                if parent and parent in nodes:
                    nodes[parent]["children"].append(node)
                else:
                    roots.append(node)
            result[public_key] = {"menu_key": menu_key, "items": roots}
        return result

    def _contact_info(self, context: SiteContext, raw: Any) -> dict[str, Any]:
        source = _json_object(raw)
        items: list[dict[str, Any]] = []
        for key, value in sorted(source.items()):
            label = str(key).replace("_", " ").title()
            if isinstance(value, dict):
                display = str(value.get("display_value") or value.get("value") or "").strip()
                kind = str(value.get("kind") or "OTHER_APPROVED").upper()
                if kind not in {"EMAIL", "PHONE", "ADDRESS", "HOURS", "OTHER_APPROVED"}: kind = "OTHER_APPROVED"
                url = value.get("url")
            else:
                display = str(value).strip()
                kind = "OTHER_APPROVED"
                url = None
            if not display:
                continue
            item: dict[str, Any] = {"kind": kind, "label": label, "display_value": display}
            if isinstance(url, str) and url:
                if url.startswith("mailto:"):
                    item["destination"] = {"kind": "MAILTO", "url": url, "is_external": False}
                elif url.startswith("tel:"):
                    item["destination"] = {"kind": "TEL", "url": url, "is_external": False}
                elif url.startswith("https://"):
                    item["destination"] = self._external_destination(url)
            items.append(item)
        return {"items": items}

    def _seo_defaults(self, settings: dict[str, Any]) -> dict[str, Any]:
        return _json_object(settings.get("seo_defaults"))

    def _seo(
        self,
        context: SiteContext,
        *,
        page_id: str,
        page_class: str,
        page_title: str,
        summary: str | None,
        path: str,
        site: dict[str, Any],
        settings: dict[str, Any],
        public_status: int = 200,
        page: int = 1,
        object_index_policy: str | None = None,
        article_link_policy: str | None = None,
        canonical_override: str | None = None,
        post_og_title: str | None = None,
        post_og_description: str | None = None,
        og_image: dict[str, Any] | None = None,
        featured_media: dict[str, Any] | None = None,
        breadcrumbs: dict[str, Any] | None = None,
        structured_inputs: Any = None,
        author_name: str | None = None,
        author_url: str | None = None,
        published_at: str | None = None,
        updated_at: str | None = None,
    ) -> dict[str, Any]:
        defaults = self._seo_defaults(settings)
        title = resolve_document_title(
            page_title=page_title,
            site_name=site["display_name"],
            site_template=defaults.get("title_template"),
            allow_site_fallback=page_class == "HOME",
        )
        meta = resolve_meta_description(
            explicit=None,
            summary_source=summary,
            site_template=defaults.get("meta_description_template"),
            site_name=site["display_name"],
        )
        robots = robots_decision(
            page_id=page_id,
            site_status=site["status"],
            public_status=public_status,
            site_index_policy=str(defaults.get("index_policy") or "INHERIT"),
            object_index_policy=object_index_policy,
            site_link_policy=str(defaults.get("link_robots_policy") or "INHERIT"),
            article_link_policy=article_link_policy,
            conditional_gate=True,
            page=page,
        )
        default_url = self._canonical(context, path)
        canonical = resolve_canonical_url(
            page_id=page_id,
            default_url=default_url,
            page=page,
            base_archive_url=default_url if page == 1 else self._canonical(context, path),
            canonical_override=canonical_override,
            current_canonical_domain=context.canonical_domain,
        )
        og = resolve_open_graph(
            page_class=page_class,
            resolved_title=title,
            resolved_meta_description=meta,
            canonical_url=canonical,
            post_og_title=post_og_title,
            post_og_description=post_og_description,
            post_og_image=og_image,
            featured_media=featured_media,
            site_default_image=None,
        )
        source = {
            "canonical_url": canonical,
            "site_name": site["display_name"],
            "title": page_title,
            "headline": page_title,
            "description": meta,
            "display_name": author_name or page_title,
            "author_name": author_name,
            "author_url": author_url,
            "date_published": published_at,
            "date_modified": updated_at,
            "image_url": (og_image or featured_media or {}).get("url") if isinstance(og_image or featured_media, dict) else None,
            "robots_index": robots.index,
            "locale_code": site.get("locale_code"),
            "default_language": site.get("default_language_code"),
        }
        supplemental: list[dict[str, Any]] = []
        if isinstance(structured_inputs, dict):
            # RC8/DOC-07 RC2 persists one object keyed by generated schema type.
            # DOC-16's generator consumes the equivalent list of typed supplements.
            supplemental = [
                {"type": str(object_type), "values": dict(values)}
                for object_type, values in structured_inputs.items()
                if isinstance(values, dict)
            ]
        elif structured_inputs not in (None, {}):
            raise RuntimeError("structured_data_inputs persistence is not the RC8 canonical object shape")
        structured = build_structured_data(
            page_class=page_class,
            source=source,
            breadcrumbs=breadcrumbs,
            supplemental_inputs=supplemental,
        )
        baseline = "NOINDEX" if page_class in {"SEARCH", "PREVIEW", "404", "410"} else ("CONDITIONAL-INDEX" if page_class in {"CATEGORY", "TAG", "AUTHOR"} else "INDEX-ELIGIBLE")
        result: dict[str, Any] = {
            "baseline_indexability": baseline,
            "title": title,
            "robots": {"index": robots.index, "follow": robots.follow},
            "structured_data": structured,
        }
        if meta:
            result["meta_description"] = meta
        if canonical:
            result["canonical_url"] = canonical
        if og:
            result["open_graph"] = og
        return result

    def _system_page(self, context: SiteContext, *, code: int, site: dict[str, Any] | None = None, settings: dict[str, Any] | None = None, navigation: dict[str, Any] | None = None) -> dict[str, Any]:
        gone = code == 410
        page_id = "PUB-SYS-410-01" if gone else "PUB-SYS-404-01"
        title = "Content unavailable" if gone else "Page not found"
        body = "This content is no longer available." if gone else "The requested page is unavailable."
        payload: dict[str, Any] = {
            "context": _page_context(page_id, render_mode="SYSTEM", locale=context.locale),
            "message": {"code": code, "title": title, "body": body},
            "seo": {
                "baseline_indexability": "NOINDEX",
                "title": title,
                "robots": {"index": False, "follow": False},
                "structured_data": [],
            },
        }
        if site is not None and settings is not None and navigation is not None:
            logo = self._media(None, context, None) if False else None
            payload["site"] = self._site_identity(context, site, settings, logo, None)
            payload["settings"] = self._public_settings(settings, None)
            payload["navigation"] = navigation
            home = self._destination(context, "HOME", "/", "PUB-HOME-01")
            search = self._destination(context, "SEARCH", "/search", "PUB-SEARCH-01")
            payload["recovery"] = {"home": home, "search": search}
        elif gone:
            payload["recovery"] = {}
        return payload

    def _live_path(self, connection: Any, context: SiteContext, path: str) -> bool:
        if path in {"/", "/search", *STATIC_BY_PATH.keys()}:
            return True
        matchers = [
            (r"^/article/([^/]+)$", "SELECT 1 FROM posts WHERE site_id=:site_id AND slug=:slug AND status='PUBLISHED'"),
            (r"^/category/([^/]+)$", "SELECT 1 FROM categories WHERE site_id=:site_id AND slug=:slug AND status='ACTIVE'"),
            (r"^/tag/([^/]+)$", "SELECT 1 FROM tags WHERE site_id=:site_id AND slug=:slug AND status='ACTIVE'"),
            (r"^/author/([^/]+)$", "SELECT 1 FROM author_site_profiles WHERE site_id=:site_id AND slug=:slug AND status='ACTIVE'"),
        ]
        for pattern, sql in matchers:
            match = re.match(pattern, path)
            if match:
                return connection.execute(text(sql), {"site_id": context.site_id, "slug": match.group(1)}).fetchone() is not None
        return False

    def _manual_redirect(self, connection: Any, context: SiteContext, path: str) -> tuple[int, str] | None:
        row = connection.execute(
            text("SELECT destination_kind,destination_value,status_code FROM redirects WHERE site_id=:site_id AND source_path=:path AND is_active=true"),
            {"site_id": context.site_id, "path": path},
        ).fetchone()
        if row is None:
            return None
        data = _m(row)
        value = str(data["destination_value"])
        if data["destination_kind"] == "INTERNAL_PATH":
            if not value.startswith("/"):
                return None
            location = self._canonical(context, value)
        else:
            parsed = urlsplit(value)
            if parsed.scheme != "https" or not parsed.hostname:
                return None
            location = value
        return int(data["status_code"]), location

    def _historical_deleted(self, connection: Any, context: SiteContext, path: str) -> bool:
        match = re.match(r"^/article/([^/]+)$", path)
        if not match:
            return False
        row = connection.execute(
            text(
                "SELECT 1 FROM post_url_history h WHERE h.site_id=:site_id AND h.old_slug=:slug "
                "AND NOT EXISTS (SELECT 1 FROM posts p WHERE p.site_id=h.site_id AND p.post_id=h.post_id) LIMIT 1"
            ),
            {"site_id": context.site_id, "slug": match.group(1)},
        ).fetchone()
        return row is not None

    @staticmethod
    def _pagination(context: SiteContext, path: str, page: int, page_size: int, has_more: bool) -> dict[str, Any] | None:
        if page == 1 and not has_more:
            return None
        def destination(target_page: int) -> dict[str, Any]:
            sep = "&" if "?" in path else "?"
            url = f"https://{context.canonical_domain}{path}{sep}page={target_page}&page_size={page_size}"
            return {"kind": "SEARCH" if path.startswith("/search") else ("CATEGORY" if path.startswith("/category/") else "TAG" if path.startswith("/tag/") else "AUTHOR"), "url": url, "is_external": False}
        links: list[dict[str, Any]] = []
        for target_page in range(max(1, page - 1), page + (2 if has_more else 1)):
            links.append({"page_number": target_page, "destination": destination(target_page), "is_current": target_page == page})
        result: dict[str, Any] = {"current_page": page, "links": links}
        if page > 1:
            result["previous"] = destination(page - 1)
        if has_more:
            result["next"] = destination(page + 1)
        return result

    async def resolve_page(self, context: SiteContext, *, path: str, q: str | None, page: int, page_size: int) -> tuple[int, dict[str, Any], dict[str, str]]:
        # Canonical path normalization: repeated slash/trailing slash -> 308.
        normalized = re.sub(r"/{2,}", "/", path)
        if normalized != "/" and normalized.endswith("/"):
            normalized = normalized.rstrip("/")
        if normalized != path:
            return 308, {}, {"Location": self._canonical(context, normalized)}

        async with self.site_transactions.transaction(context) as connection:
            site, settings = self._base_rows(connection, context)
            logo = self._media(connection, context, str(settings["logo_media_id"]) if settings.get("logo_media_id") else None)
            favicon = self._media(connection, context, str(settings["favicon_media_id"]) if settings.get("favicon_media_id") else None)
            default_social = self._media(connection, context, str(settings["default_social_image_media_id"]) if settings.get("default_social_image_media_id") else None)
            site_identity = self._site_identity(context, site, settings, logo, favicon)
            public_settings = self._public_settings(settings, default_social)
            navigation = self._navigation(connection, context)

            # Current live route always wins over a redirect row.
            if not self._live_path(connection, context, path):
                redirect = self._manual_redirect(connection, context, path)
                if redirect:
                    return redirect[0], {}, {"Location": redirect[1]}
                code = 410 if self._historical_deleted(connection, context, path) else 404
                return code, self._system_page(context, code=code, site=site, settings=settings, navigation=navigation), {}

            common = {"site": site_identity, "settings": public_settings, "navigation": navigation}
            home_destination = self._destination(context, "HOME", "/", "PUB-HOME-01")

            if path == "/":
                latest_rows = connection.execute(
                    text(
                        "SELECT * FROM posts WHERE site_id=:site_id AND status='PUBLISHED' "
                        "ORDER BY published_at DESC,post_id ASC LIMIT :limit"
                    ),
                    {"site_id": context.site_id, "limit": min(page_size, 50)},
                ).fetchall()
                latest = [self._article_summary(connection, context, row) for row in latest_rows]
                lead = None
                if settings.get("homepage_lead_post_id"):
                    lead_row = connection.execute(
                        text("SELECT * FROM posts WHERE site_id=:site_id AND post_id=:id AND status='PUBLISHED'"),
                        {"site_id": context.site_id, "id": settings["homepage_lead_post_id"]},
                    ).fetchone()
                    if lead_row is not None:
                        lead = self._article_summary(connection, context, lead_row)
                sections: list[dict[str, Any]] = []
                section_rows = connection.execute(
                    text("SELECT * FROM homepage_sections WHERE site_id=:site_id AND is_enabled=true ORDER BY position_key,section_key"),
                    {"site_id": context.site_id},
                ).fetchall()
                for raw in section_rows:
                    section = _m(raw)
                    item: dict[str, Any] = {"section_key": section["section_key"], "section_kind": section["section_kind"]}
                    if section.get("display_label"):
                        item["label"] = section["display_label"]
                    if section["section_kind"] == "POST_SELECTION":
                        rows = connection.execute(
                            text(
                                "SELECT p.* FROM homepage_section_posts hp JOIN posts p ON p.site_id=hp.site_id AND p.post_id=hp.post_id "
                                "WHERE hp.site_id=:site_id AND hp.section_id=:section AND p.status='PUBLISHED' ORDER BY hp.position,p.post_id"
                            ),
                            {"site_id": context.site_id, "section": section["section_id"]},
                        ).fetchall()
                        item["posts"] = [self._article_summary(connection, context, row) for row in rows]
                    elif section["section_kind"] == "CATEGORY_SELECTION":
                        rows = connection.execute(
                            text(
                                "SELECT c.* FROM homepage_section_categories hc JOIN categories c ON c.site_id=hc.site_id AND c.category_id=hc.category_id "
                                "WHERE hc.site_id=:site_id AND hc.section_id=:section AND c.status='ACTIVE' ORDER BY hc.position,c.category_id"
                            ),
                            {"site_id": context.site_id, "section": section["section_id"]},
                        ).fetchall()
                        item["categories"] = [
                            {
                                "kind": "CATEGORY",
                                "name": _m(row)["name"],
                                "destination": self._destination(context, "CATEGORY", f"/category/{_m(row)['slug']}", "PUB-CATEGORY-01"),
                            }
                            for row in rows
                        ]
                    sections.append(item)
                intro = {"h1": site["display_name"]}
                seo = self._seo(context, page_id="PUB-HOME-01", page_class="HOME", page_title=site["display_name"], summary=None, path="/", site=site, settings=settings)
                payload = {"context": _page_context("PUB-HOME-01", locale=site.get("locale_code")), **common, "intro": intro, "sections": sections, "latest_articles": latest, "seo": seo}
                if lead:
                    payload["lead_article"] = lead
                return 200, payload, {}

            article_match = re.fullmatch(r"/article/([^/]+)", path)
            if article_match:
                row = connection.execute(
                    text("SELECT * FROM posts WHERE site_id=:site_id AND slug=:slug AND status='PUBLISHED'"),
                    {"site_id": context.site_id, "slug": article_match.group(1)},
                ).fetchone()
                if row is None:
                    return 404, self._system_page(context, code=404, site=site, settings=settings, navigation=navigation), {}
                data = _m(row)
                article = self._article_detail(connection, context, row)
                primary_category = article["categories"][0] if article.get("categories") else None
                breadcrumbs = build_breadcrumb_trail(
                    page_class="ARTICLE",
                    canonical_domain=context.canonical_domain,
                    current_label=data.get("breadcrumb_label") or data["title"],
                    home_destination=home_destination,
                    primary_category_label=primary_category.get("name") if primary_category else None,
                    primary_category_destination=primary_category.get("destination") if primary_category else None,
                )
                related_rows = connection.execute(
                    text(
                        "SELECT p.* FROM post_related_posts r JOIN posts p ON p.site_id=r.site_id AND p.post_id=r.related_post_id "
                        "WHERE r.site_id=:site_id AND r.post_id=:post_id AND p.status='PUBLISHED' ORDER BY r.position,p.post_id"
                    ),
                    {"site_id": context.site_id, "post_id": data["post_id"]},
                ).fetchall()
                related = [self._article_summary(connection, context, item) for item in related_rows]
                seo = self._seo(
                    context, page_id="PUB-ARTICLE-01", page_class="ARTICLE", page_title=data["title"], summary=data.get("excerpt") or _body_text(data.get("body")), path=path,
                    site=site, settings=settings, object_index_policy=data.get("index_policy"), article_link_policy=data.get("link_robots_policy"), canonical_override=data.get("canonical_override"),
                    post_og_title=data.get("og_title"), post_og_description=data.get("og_description"), featured_media=article.get("featured_media"), breadcrumbs=breadcrumbs,
                    structured_inputs=data.get("structured_data_inputs"), author_name=(article.get("author") or {}).get("display_name"), author_url=((article.get("author") or {}).get("destination") or {}).get("url"),
                    published_at=_iso(data.get("published_at")), updated_at=_iso(data.get("updated_at")),
                )
                payload = {"context": _page_context("PUB-ARTICLE-01", locale=site.get("locale_code")), **common, "article": article, "seo": seo}
                if breadcrumbs:
                    payload["breadcrumbs"] = breadcrumbs
                if related:
                    payload["related_content"] = {"articles": related}
                return 200, payload, {}

            for cls, prefix, table, id_col, page_id in (
                ("CATEGORY", "/category/", "categories", "category_id", "PUB-CATEGORY-01"),
                ("TAG", "/tag/", "tags", "tag_id", "PUB-TAG-01"),
                ("AUTHOR", "/author/", "author_site_profiles", "author_profile_id", "PUB-AUTHOR-01"),
            ):
                if path.startswith(prefix):
                    slug = path[len(prefix):]
                    entity = connection.execute(
                        text(f"SELECT * FROM {table} WHERE site_id=:site_id AND slug=:slug AND status='ACTIVE'"),
                        {"site_id": context.site_id, "slug": slug},
                    ).fetchone()
                    if entity is None:
                        return 404, self._system_page(context, code=404, site=site, settings=settings, navigation=navigation), {}
                    data = _m(entity)
                    relation = {"CATEGORY": ("post_categories", "category_id"), "TAG": ("post_tags", "tag_id")}.get(cls)
                    if relation:
                        relation_table, relation_col = relation
                        rows = connection.execute(
                            text(
                                f"SELECT p.* FROM {relation_table} x JOIN posts p ON p.site_id=x.site_id AND p.post_id=x.post_id "
                                f"WHERE x.site_id=:site_id AND x.{relation_col}=:entity AND p.status='PUBLISHED' "
                                "ORDER BY p.published_at DESC,p.post_id ASC LIMIT :limit OFFSET :offset"
                            ),
                            {"site_id": context.site_id, "entity": data[id_col], "limit": page_size + 1, "offset": (page - 1) * page_size},
                        ).fetchall()
                    else:
                        rows = connection.execute(
                            text(
                                "SELECT p.* FROM posts p WHERE p.site_id=:site_id AND p.author_site_profile_id=:entity AND p.status='PUBLISHED' "
                                "ORDER BY p.published_at DESC,p.post_id ASC LIMIT :limit OFFSET :offset"
                            ),
                            {"site_id": context.site_id, "entity": data[id_col], "limit": page_size + 1, "offset": (page - 1) * page_size},
                        ).fetchall()
                    has_more = len(rows) > page_size
                    articles = [self._article_summary(connection, context, item) for item in rows[:page_size]]
                    if cls == "CATEGORY":
                        detail = {"category_id": str(data[id_col]), "name": data["name"], "destination": self._destination(context, "CATEGORY", path, page_id)}
                        if data.get("description"): detail["description"] = data["description"]
                        field = "category"
                        title = data["name"]
                    elif cls == "TAG":
                        detail = {"tag_id": str(data[id_col]), "name": data["name"], "destination": self._destination(context, "TAG", path, page_id)}
                        if data.get("description"): detail["description"] = data["description"]
                        field = "tag"
                        title = data["name"]
                    else:
                        detail = {
                            "author_id": str(data[id_col]), "display_name": data["display_name"], "destination": self._destination(context, "AUTHOR", path, page_id),
                            "expertise": list(data.get("expertise") or []), "social_profiles": _social_profiles(data.get("social_profiles")),
                        }
                        if data.get("bio"): detail["bio"] = data["bio"]
                        avatar = self._media(connection, context, str(data["photo_media_id"]) if data.get("photo_media_id") else None)
                        if avatar: detail["avatar_media"] = avatar
                        field = "author"
                        title = data["display_name"]
                    breadcrumbs = build_breadcrumb_trail(page_class=cls, canonical_domain=context.canonical_domain, current_label=title, home_destination=home_destination)
                    seo = self._seo(context, page_id=page_id, page_class=cls, page_title=title, summary=data.get("description") or data.get("bio"), path=path, site=site, settings=settings, page=page, object_index_policy=data.get("index_policy"), canonical_override=data.get("canonical_override"), breadcrumbs=breadcrumbs, author_name=title, author_url=self._canonical(context, path))
                    payload = {"context": _page_context(page_id, locale=site.get("locale_code")), **common, field: detail, "articles": articles, "seo": seo}
                    if breadcrumbs: payload["breadcrumbs"] = breadcrumbs
                    pagination = self._pagination(context, path, page, page_size, has_more)
                    if pagination: payload["pagination"] = pagination
                    return 200, payload, {}

            if path == "/search":
                normalized_q = (q or "").strip()
                documents: list[PublicSearchDocument] = []
                has_more = False
                if normalized_q:
                    if self.search is not None:
                        documents, has_more = await self.search.query_public(site_id=context.site_id, q=normalized_q, page=page, page_size=page_size)
                    else:
                        # Production candidate should inject OpenSearch. This RLS-bound SQL fallback is
                        # intentionally deterministic and same-site, and keeps the public route usable
                        # while a search provider is degraded without ever becoming cross-site search.
                        rows = connection.execute(
                            text(
                                "SELECT * FROM posts WHERE site_id=:site_id AND status='PUBLISHED' "
                                "AND (title ILIKE :q OR COALESCE(excerpt,'') ILIKE :q) "
                                "ORDER BY published_at DESC,post_id ASC LIMIT :limit OFFSET :offset"
                            ),
                            {"site_id": context.site_id, "q": f"%{normalized_q}%", "limit": page_size + 1, "offset": (page - 1) * page_size},
                        ).fetchall()
                        has_more = len(rows) > page_size
                        articles = [self._article_summary(connection, context, item) for item in rows[:page_size]]
                        documents = []
                    if self.search is not None:
                        ids = [doc.post_id for doc in documents]
                        articles = []
                        for post_id in ids:
                            row = connection.execute(text("SELECT * FROM posts WHERE site_id=:site_id AND post_id=:post_id AND status='PUBLISHED'"), {"site_id": context.site_id, "post_id": post_id}).fetchone()
                            if row is not None:
                                articles.append(self._article_summary(connection, context, row))
                else:
                    articles = []
                state = "NO_QUERY" if not normalized_q else ("RESULTS" if articles else "EMPTY")
                result_summary = "Enter a search query." if state == "NO_QUERY" else (f"Search results for {normalized_q}" if state == "RESULTS" else f"No results for {normalized_q}")
                seo = self._seo(context, page_id="PUB-SEARCH-01", page_class="SEARCH", page_title="Search", summary=result_summary, path="/search", site=site, settings=settings, page=page)
                payload = {"context": _page_context("PUB-SEARCH-01", locale=site.get("locale_code")), **common, "intro": {"h1": "Search"}, "query": normalized_q, "search_state": state, "articles": articles, "result_summary": result_summary, "seo": seo}
                pagination = self._pagination(context, "/search", page, page_size, has_more) if normalized_q else None
                if pagination: payload["pagination"] = pagination
                return 200, payload, {}

            if path in STATIC_BY_PATH:
                static_key, page_id, default_title = STATIC_BY_PATH[path]
                source = dict(self.static_content.get(context.site_key, {}).get(static_key) or {})
                if not source:
                    return 404, self._system_page(context, code=404, site=site, settings=settings, navigation=navigation), {}
                title = str(source.get("title") or default_title)
                raw_sections = source.get("sections") or []
                sections = []
                for raw in raw_sections:
                    if not isinstance(raw, dict):
                        continue
                    def rich(value: Any) -> dict[str, Any]:
                        if isinstance(value, dict) and isinstance(value.get("runs"), list):
                            return value
                        return {"runs": [{"text": str(value), "marks": []}]}
                    section: dict[str, Any] = {"paragraphs": [rich(v) for v in (raw.get("paragraphs") or [])], "list_items": [rich(v) for v in (raw.get("list_items") or [])]}
                    if raw.get("heading"): section["heading"] = str(raw["heading"])
                    sections.append(section)
                if not sections:
                    raise RuntimeError(f"static content for {context.site_key}/{static_key} has no approved sections")
                content: dict[str, Any] = {"static_key": static_key, "title": title, "sections": sections}
                if source.get("intro_text"): content["intro_text"] = str(source["intro_text"])
                breadcrumbs = build_breadcrumb_trail(page_class="STATIC", canonical_domain=context.canonical_domain, current_label=title, home_destination=home_destination)
                seo = self._seo(context, page_id=page_id, page_class="STATIC", page_title=title, summary=source.get("intro_text"), path=path, site=site, settings=settings, breadcrumbs=breadcrumbs)
                payload = {"context": _page_context(page_id, locale=site.get("locale_code")), **common, "content": content, "seo": seo}
                if breadcrumbs: payload["breadcrumbs"] = breadcrumbs
                if static_key == "CONTACT": payload["contact_info"] = self._contact_info(context, settings.get("contact_info"))
                return 200, payload, {}

            return 404, self._system_page(context, code=404, site=site, settings=settings, navigation=navigation), {}

    async def resolve_preview(self, context: SiteContext, *, post_id: str, source_snapshot: str) -> dict[str, Any]:
        # Preview authority has already validated the site/post/source snapshot before this call.
        async with self.site_transactions.transaction(context) as connection:
            site, settings = self._base_rows(connection, context)
            row = connection.execute(text("SELECT * FROM posts WHERE site_id=:site_id AND post_id=:post_id"), {"site_id": context.site_id, "post_id": post_id}).fetchone()
            if row is None:
                raise NotFound("resource not found")
            data = _m(row)
            logo = self._media(connection, context, str(settings["logo_media_id"]) if settings.get("logo_media_id") else None)
            favicon = self._media(connection, context, str(settings["favicon_media_id"]) if settings.get("favicon_media_id") else None)
            default_social = self._media(connection, context, str(settings["default_social_image_media_id"]) if settings.get("default_social_image_media_id") else None)
            navigation = self._navigation(connection, context)
            article = self._article_detail(connection, context, row, preview=True)
            seo = {
                "baseline_indexability": "NOINDEX",
                "title": str(data.get("title") or "Preview"),
                "robots": {"index": False, "follow": False},
                "structured_data": [],
            }
            preview = {
                "lifecycle_status": str(data["status"]),
                "source_kind": "COMMITTED" if source_snapshot in {"CANONICAL", "COMMITTED"} else ("AUTOSAVE" if str(source_snapshot).startswith("AUTOSAVE") else "WORKING_COPY"),
                "notice_text": "Private preview",
            }
            payload: dict[str, Any] = {
                "context": _page_context("PUB-SYS-PREVIEW-01", render_mode="PREVIEW", locale=site.get("locale_code")),
                "site": self._site_identity(context, site, settings, logo, favicon),
                "settings": self._public_settings(settings, default_social),
                "navigation": navigation,
                "preview": preview,
                "article": article,
                "seo": seo,
            }
            related_rows = connection.execute(
                text(
                    "SELECT p.* FROM post_related_posts r JOIN posts p ON p.site_id=r.site_id AND p.post_id=r.related_post_id "
                    "WHERE r.site_id=:site_id AND r.post_id=:post_id AND p.status='PUBLISHED' ORDER BY r.position,p.post_id"
                ),
                {"site_id": context.site_id, "post_id": post_id},
            ).fetchall()
            related = [self._article_summary(connection, context, item) for item in related_rows]
            if related: payload["related_content"] = {"articles": related}
            return payload


class PostgresDerivedSource:
    """Authoritative DOC-18 job source backed only by canonical PostgreSQL truth."""

    def __init__(self, site_transactions: SiteTransactionPort) -> None:
        self.site_transactions = site_transactions

    async def publish_due(self, context: SiteContext, *, post_id: str, source_version: int, scheduled_for_utc: datetime) -> str:
        async with self.site_transactions.transaction(context) as connection:
            row = connection.execute(
                text("SELECT status,version,scheduled_for_utc FROM posts WHERE site_id=:site_id AND post_id=:post_id FOR UPDATE"),
                {"site_id": context.site_id, "post_id": post_id},
            ).fetchone()
            if row is None: return "STALE_NOOP"
            data = _m(row)
            if data["status"] != "SCHEDULED" or int(data["version"]) != int(source_version) or data.get("scheduled_for_utc") != scheduled_for_utc:
                return "STALE_NOOP"
            # The worker may publish only a currently fenced scheduled row.  The mutation is
            # the existing DOC-07 transition, not a sixth state or hidden schedule behavior.
            connection.execute(
                text(
                    "UPDATE posts SET status='PUBLISHED',version=version+1,published_at=COALESCE(published_at,now()),"
                    "first_published_at=COALESCE(first_published_at,now()),scheduled_for_utc=NULL,schedule_local_input=NULL,"
                    "schedule_timezone_id=NULL,updated_at=now() WHERE site_id=:site_id AND post_id=:post_id"
                ),
                {"site_id": context.site_id, "post_id": post_id},
            )
            return "PUBLISHED"

    async def media_generation(self, context: SiteContext, *, media_id: str) -> dict[str, Any] | None:
        async with self.site_transactions.transaction(context) as connection:
            row = connection.execute(text("SELECT media_id,checksum_sha256,object_key,mime_type,width_px,height_px,status FROM media WHERE site_id=:site_id AND media_id=:id"), {"site_id": context.site_id, "id": media_id}).fetchone()
            return None if row is None else _m(row)

    async def public_search_document(self, context: SiteContext, *, post_id: str) -> PublicSearchDocument | None:
        async with self.site_transactions.transaction(context) as connection:
            row = connection.execute(text("SELECT * FROM posts WHERE site_id=:site_id AND post_id=:id AND status='PUBLISHED'"), {"site_id": context.site_id, "id": post_id}).fetchone()
            if row is None: return None
            return self._search_document(connection, context, row)

    def _search_document(self, connection: Any, context: SiteContext, row: Any) -> PublicSearchDocument:
        data = _m(row)
        post_id = str(data["post_id"])
        cats = connection.execute(text("SELECT c.name FROM post_categories pc JOIN categories c ON c.site_id=pc.site_id AND c.category_id=pc.category_id WHERE pc.site_id=:site_id AND pc.post_id=:post_id AND c.status='ACTIVE' ORDER BY c.name"), {"site_id": context.site_id, "post_id": post_id}).fetchall()
        tags = connection.execute(text("SELECT t.name FROM post_tags pt JOIN tags t ON t.site_id=pt.site_id AND t.tag_id=pt.tag_id WHERE pt.site_id=:site_id AND pt.post_id=:post_id AND t.status='ACTIVE' ORDER BY t.name"), {"site_id": context.site_id, "post_id": post_id}).fetchall()
        author = ""
        if data.get("author_site_profile_id"):
            a = connection.execute(text("SELECT display_name FROM author_site_profiles WHERE site_id=:site_id AND author_profile_id=:id"), {"site_id": context.site_id, "id": data["author_site_profile_id"]}).fetchone()
            if a is not None: author = str(_m(a)["display_name"])
        updated = data.get("updated_at") or datetime.now(UTC)
        if isinstance(updated, datetime) and updated.tzinfo is None: updated = updated.replace(tzinfo=UTC)
        first = data.get("first_published_at") or data.get("published_at")
        if isinstance(first, datetime) and first.tzinfo is None: first = first.replace(tzinfo=UTC)
        return PublicSearchDocument(
            site_id=context.site_id,
            post_id=post_id,
            title_text=str(data.get("title") or ""),
            seo_title_text=str(data.get("seo_title") or ""),
            excerpt_text=str(data.get("excerpt") or ""),
            body_text=_body_text(data.get("body")),
            category_terms=tuple(str(_m(item)["name"]) for item in cats),
            tag_terms=tuple(str(_m(item)["name"]) for item in tags),
            author_text=author,
            slug_text=str(data.get("slug") or ""),
            first_published_at=first,
            updated_at=updated,
        )

    async def current_search_fingerprint(self, context: SiteContext, *, entity_type: str, entity_id: str, source_version: int | str | None = None) -> str:
        async with self.site_transactions.transaction(context) as connection:
            if entity_type == "POST":
                row = connection.execute(text("SELECT version,updated_at FROM posts WHERE site_id=:site_id AND post_id=:id"), {"site_id": context.site_id, "id": entity_id}).fetchone()
            elif entity_type == "CATEGORY":
                row = connection.execute(text("SELECT updated_at FROM categories WHERE site_id=:site_id AND category_id=:id"), {"site_id": context.site_id, "id": entity_id}).fetchone()
            elif entity_type == "TAG":
                row = connection.execute(text("SELECT updated_at FROM tags WHERE site_id=:site_id AND tag_id=:id"), {"site_id": context.site_id, "id": entity_id}).fetchone()
            elif entity_type == "AUTHOR":
                row = connection.execute(text("SELECT updated_at FROM author_site_profiles WHERE site_id=:site_id AND author_profile_id=:id"), {"site_id": context.site_id, "id": entity_id}).fetchone()
            else:
                row = None
            raw = json.dumps({"site_id": context.site_id, "type": entity_type, "id": entity_id, "source_version": source_version, "row": _m(row)}, default=str, sort_keys=True)
            return hashlib.sha256(raw.encode()).hexdigest()

    async def affected_public_posts(self, context: SiteContext, *, entity_type: str, entity_id: str) -> list[str]:
        relation = {
            "CATEGORY": ("post_categories", "category_id"),
            "TAG": ("post_tags", "tag_id"),
            "AUTHOR": ("posts", "author_site_profile_id"),
        }.get(entity_type)
        if relation is None: return []
        async with self.site_transactions.transaction(context) as connection:
            if entity_type == "AUTHOR":
                rows = connection.execute(text("SELECT post_id FROM posts WHERE site_id=:site_id AND author_site_profile_id=:id AND status='PUBLISHED' ORDER BY post_id"), {"site_id": context.site_id, "id": entity_id}).fetchall()
            else:
                table, field = relation
                rows = connection.execute(text(f"SELECT p.post_id FROM {table} x JOIN posts p ON p.site_id=x.site_id AND p.post_id=x.post_id WHERE x.site_id=:site_id AND x.{field}=:id AND p.status='PUBLISHED' ORDER BY p.post_id"), {"site_id": context.site_id, "id": entity_id}).fetchall()
            return [str(row[0]) for row in rows]

    async def reindex_documents(self, context: SiteContext) -> AsyncIterator[PublicSearchDocument]:
        async with self.site_transactions.transaction(context) as connection:
            rows = connection.execute(text("SELECT * FROM posts WHERE site_id=:site_id AND status='PUBLISHED' ORDER BY post_id"), {"site_id": context.site_id}).fetchall()
            docs = [self._search_document(connection, context, row) for row in rows]
        for doc in docs:
            yield doc

    async def sitemap_entries(self, context: SiteContext) -> list[dict[str, Any]]:
        async with self.site_transactions.transaction(context) as connection:
            rows = connection.execute(text("SELECT slug,updated_at FROM posts WHERE site_id=:site_id AND status='PUBLISHED' AND slug IS NOT NULL ORDER BY slug"), {"site_id": context.site_id}).fetchall()
            entries = [{"url": f"https://{context.canonical_domain}/article/{_m(row)['slug']}", "resource_type": "articles", "lastmod": _iso(_m(row).get("updated_at"))} for row in rows]
            entries.append({"url": f"https://{context.canonical_domain}/", "resource_type": "pages", "lastmod": None})
            return entries

    async def reconcile_due_schedules(self, context: SiteContext, *, now: datetime) -> list[dict[str, Any]]:
        async with self.site_transactions.transaction(context) as connection:
            rows = connection.execute(text("SELECT post_id,version,scheduled_for_utc FROM posts WHERE site_id=:site_id AND status='SCHEDULED' AND scheduled_for_utc<=:now ORDER BY scheduled_for_utc,post_id"), {"site_id": context.site_id, "now": now}).fetchall()
            return [{"post_id": str(_m(row)["post_id"]), "source_version": int(_m(row)["version"]), "scheduled_for_utc": _iso(_m(row)["scheduled_for_utc"])} for row in rows]

    async def reconcile_media(self, context: SiteContext) -> list[dict[str, Any]]:
        return []

    async def reconcile_search(self, context: SiteContext) -> list[dict[str, Any]]:
        return []

    async def reconcile_sitemap(self, context: SiteContext) -> bool:
        return True


class PostgresWorkerMediaRepository:
    """Worker-side media-variant persistence using the existing DOC-08 table.

    The worker writes only same-site derivative metadata under an RLS-bound
    transaction; originals and public eligibility remain owned by the media row.
    """

    def __init__(self, site_transactions: SiteTransactionPort) -> None:
        self.site_transactions = site_transactions

    async def upsert_variant(self, context: SiteContext, media_id: str, variant: dict[str, Any]) -> None:
        async with self.site_transactions.transaction(context) as connection:
            exists = connection.execute(
                text("SELECT 1 FROM media WHERE site_id=:site_id AND media_id=:media_id AND status='ACTIVE'"),
                {"site_id": context.site_id, "media_id": media_id},
            ).fetchone()
            if exists is None:
                raise NotFound("resource not found")
            connection.execute(
                text(
                    "INSERT INTO media_variants(site_id,media_id,variant_key,mime_type,byte_size,width_px,height_px,object_key) "
                    "VALUES (:site_id,:media_id,:variant_key,:mime_type,:byte_size,:width_px,:height_px,:object_key) "
                    "ON CONFLICT (site_id,media_id,variant_key) DO UPDATE SET "
                    "mime_type=EXCLUDED.mime_type,byte_size=EXCLUDED.byte_size,width_px=EXCLUDED.width_px,"
                    "height_px=EXCLUDED.height_px,object_key=EXCLUDED.object_key"
                ),
                {
                    "site_id": context.site_id,
                    "media_id": media_id,
                    "variant_key": variant["variant_key"],
                    "mime_type": variant["mime_type"],
                    "byte_size": int(variant["byte_size"]),
                    "width_px": int(variant["width"]),
                    "height_px": int(variant["height"]),
                    "object_key": variant["object_key"],
                },
            )
