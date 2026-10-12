"""Synthetic tenant-owned rows through real registry/transaction/PageData code.

No database connection, production content or browser is used. JSON export feeds
the Universal component tests so backend projections are tested by the renderer.
"""
from __future__ import annotations

import asyncio
from contextlib import contextmanager
from copy import deepcopy
from datetime import UTC, datetime
import json
from pathlib import Path
import re
import subprocess
from uuid import NAMESPACE_URL, uuid5

import yaml
from bp_adapters.postgres.ports import PostgresSiteTransactionPort
from bp_adapters.postgres.runtime import PostgresPublicPageAdapter, PostgresSiteRegistry
from bp_api.composition.presentation import PresentationPolicy
from bp_application.context import TrustedContextService

ROOT = Path(__file__).resolve().parents[2]
SPEC = yaml.safe_load((ROOT / "contracts/http/BLOG-DOC-15_openapi_v1.0-RC13.yaml").read_text())
PLAN = json.loads(subprocess.check_output(["node", "tooling/scripts/plan-legacy-parity.mjs"], cwd=ROOT))
ROUTES = ["/", "/article/story", "/category/topic", "/tag/topic", "/author/writer", "/search", "/about", "/contact", "/privacy-policy", "/terms-of-use", "/disclaimer", "/missing", "/article/gone"]


def identifier(key: str, kind: str) -> str:
    return str(uuid5(NAMESPACE_URL, f"fixture:{key}:{kind}"))


class Result:
    def __init__(self, rows):
        self.rows = rows

    def fetchone(self):
        return self.rows[0] if self.rows else None

    def fetchall(self):
        return self.rows

    def scalar_one(self):
        return self.rows[0]


class FixtureConnection:
    def __init__(self, estate):
        self.estate = estate
        self.site_id = None

    @contextmanager
    def begin(self):
        try:
            yield self
        finally:
            self.site_id = None

    def execute(self, statement, params=None):
        sql, params = str(statement), params or {}
        if "set_config" in sql:
            self.site_id = params["site_id"]
            return Result([self.site_id])
        if "app.current_site_id()" in sql:
            return Result([self.site_id])
        if "requested.hostname_normalized" in sql:
            row = next((site for site in self.estate.sites.values() if site["canonical_domain"] == params["host"]), None)
            return Result([row] if row else [])
        assert self.site_id and params.get("site_id") == self.site_id, (sql, params)
        self.estate.reads.append((self.site_id, sql))
        row = self.estate.sites[self.site_id]
        key = row["site_key"]
        post = self.estate.posts[self.site_id]
        if "FROM sites" in sql:
            return Result([row])
        if "FROM site_settings" in sql:
            return Result([deepcopy(self.estate.settings[self.site_id])])
        if "FROM media_variants" in sql:
            return Result([{"variant_key": "native_webp", "mime_type": "image/webp", "width_px": 800, "height_px": 600}])
        if "FROM media " in sql:
            return Result([{"media_id": params["media_id"], "alt_text": f"{key} fixture media", "updated_at": datetime(2026, 1, 1, tzinfo=UTC)}])
        if "FROM navigation_menus" in sql:
            return Result([{"menu_id": params["key"]}])
        if "FROM navigation_items" in sql:
            return Result([{"item_id": identifier(key, params["menu_id"]), "label": f"{key} navigation", "destination_kind": "HOME", "parent_item_id": None}])
        if "FROM homepage_sections" in sql:
            return Result([{"section_id": "posts", "section_key": "selected", "section_kind": "POST_SELECTION", "display_label": f"{key} selected stories"}, {"section_id": "topics", "section_key": "topics", "section_kind": "CATEGORY_SELECTION"}])
        if "FROM post_url_history" in sql:
            return Result([1] if params["slug"] == "gone" else [])
        if "FROM redirects" in sql:
            return Result([])
        if "SELECT p.*" in sql or "SELECT * FROM posts" in sql:
            return Result([] if params.get("slug") == "gone" else [post])
        if "SELECT 1 FROM posts" in sql:
            return Result([] if params.get("slug") == "gone" else [1])
        if "author_site_profiles" in sql:
            return Result([{"author_profile_id": identifier(key, "author"), "display_name": f"{key} fixture writer", "slug": "writer", "bio": f"{key} biography", "expertise": [], "social_profiles": [], "seo_title": f"{key} writer SEO"}])
        if "categories" in sql:
            return Result([{"category_id": identifier(key, "category"), "name": f"{key} fixture category", "slug": "topic", "seo_title": f"{key} category SEO"}])
        if "tags" in sql:
            return Result([{"tag_id": identifier(key, "tag"), "name": f"{key} fixture tag", "slug": "topic", "seo_title": f"{key} tag SEO"}])
        raise AssertionError(f"Unhandled fixture SQL: {sql}")


class Estate:
    def __init__(self):
        domains = re.findall(r"'10000000-[^']+'::uuid, '([^']+)', true, true", (ROOT / "database/seeds/initial-sites.sql").read_text())
        self.sites, self.settings, self.posts, self.reads = {}, {}, {}, []
        for entry, host in zip(PLAN, domains, strict=True):
            key = entry["site_key"]
            site_id = identifier(key, "site")
            self.sites[site_id] = {"site_id": site_id, "site_key": key, "display_name": entry["name"], "status": "ACTIVE", "timezone_id": "Asia/Kolkata", "locale_code": "hi-IN" if key == "SITE-11" else "en", "default_language_code": "hi" if key == "SITE-11" else "en", "canonical_domain": host.lower()}
            self.settings[site_id] = {"presentation_schema_version": 1, "presentation_config": deepcopy(entry["presentation"]), "logo_media_id": identifier(key, "logo"), "favicon_media_id": identifier(key, "favicon"), "default_social_image_media_id": identifier(key, "social"), "homepage_lead_post_id": identifier(key, "post"), "social_profiles": [], "seo_defaults": {"meta_description": f"{key} fixture site description"}, "static_pages": {page: {"enabled": True, "content_version": 1, "title": f"{key} fixture {page}", "intro_text": "Fixture only", "body_sections": [{"heading": "Fixture", "paragraphs": [f"{key} synthetic content for {page}"], "list_items": []}]} for page in ("ABOUT", "CONTACT", "PRIVACY", "TERMS", "DISCLAIMER")}}
            self.posts[site_id] = {"post_id": identifier(key, "post"), "title": f"{key} fixture article", "slug": "story", "status": "PUBLISHED", "published_at": datetime(2026, 1, 1, tzinfo=UTC), "author_site_profile_id": identifier(key, "author"), "featured_media_id": identifier(key, "featured"), "seo_title": f"{key} stored article SEO", "meta_description": f"{key} stored article description", "body": {"content_schema_version": 1, "blocks": [{"block_id": "paragraph-1", "type": "PARAGRAPH", "content": {"runs": [{"text": f"{key} fixture body", "marks": []}]}}]}}
        self.contexts = TrustedContextService(PostgresSiteRegistry(self))
        self.adapter = PostgresPublicPageAdapter(PostgresSiteTransactionPort(self), media_cdn_origin="https://media.example.test", presentation_validator=PresentationPolicy(SPEC).presentation_valid)

    @contextmanager
    def connect(self):
        yield FixtureConnection(self)

    async def page(self, key, path):
        host = next(site["canonical_domain"] for site in self.sites.values() if site["site_key"] == key)
        context = await self.contexts.public(host, request_id=f"fixture-{key}")
        status, data, _ = await self.adapter.resolve_page(context, path=path, q="fixture", page=1, page_size=20)
        return {"status": status, "data": data}


async def export():
    estate = Estate()
    return {entry["site_key"]: {path: await estate.page(entry["site_key"], path) for path in ROUTES} for entry in PLAN}


if __name__ == "__main__":
    print(json.dumps(asyncio.run(export())))
