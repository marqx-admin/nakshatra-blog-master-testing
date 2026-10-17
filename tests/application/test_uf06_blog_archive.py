"""UF-06 regression coverage, authored but not executed in coding-only mode.

Uses real registry/context/transaction/projection code with synthetic SQL rows.
This is not live PostgreSQL or FORCE-RLS acceptance evidence.
"""
from contextlib import contextmanager
from copy import deepcopy
from datetime import UTC, datetime

import pytest
from jsonschema import Draft202012Validator, RefResolver

from bp_domain.errors import NotFound
from tests.fixtures.universal_parity import Estate, FixtureConnection, Result, SPEC, identifier
from bp_application.public_page import PublicPageService
from fastapi.testclient import TestClient
from tests.e2e.test_chat03_auth import build


class ArchiveConnection(FixtureConnection):
    def execute(self, statement, params=None):
        sql, params = str(statement), params or {}
        if "SELECT * FROM posts" in sql and "OFFSET :offset" in sql and "author_site_profile_id" not in sql:
            assert self.site_id == params["site_id"], "query must use the transaction-bound trusted site"
            assert "WHERE site_id=:site_id AND status='PUBLISHED'" in sql
            assert "ORDER BY published_at DESC,post_id ASC" in sql
            self.estate.archive_reads.append((self.site_id, dict(params)))
            rows = [row for row in self.estate.archive_rows if row["site_id"] == self.site_id and row["status"] == "PUBLISHED"]
            rows.sort(key=lambda row: row["post_id"])
            rows.sort(key=lambda row: row["published_at"], reverse=True)
            return Result(rows[params["offset"]:params["offset"] + params["limit"]])
        return super().execute(statement, params)


class ArchiveEstate(Estate):
    def __init__(self):
        super().__init__()
        self.archive_reads, self.archive_rows = [], []
        for site_id, site in self.sites.items():
            key = site["site_key"]
            if key not in {"SITE-01", "SITE-02"}:
                continue
            for number, state in enumerate(["PUBLISHED", "DRAFT", "PUBLISHED", "SCHEDULED", "PUBLISHED", "ARCHIVED"]):
                post = deepcopy(self.posts[site_id])
                post.update(site_id=site_id, post_id=identifier(key, f"archive-{number}"), status=state,
                            slug=f"archive-{number}", title=f"{key} {state} {number}",
                            published_at=datetime(2026, 1, 1 if number < 3 else 2, tzinfo=UTC))
                self.archive_rows.insert(0, post)

    @contextmanager
    def connect(self):
        yield ArchiveConnection(self)

    async def load(self, key, *, page=1, page_size=2, path="/blog", q=None):
        site = next(row for row in self.sites.values() if row["site_key"] == key)
        context = await self.contexts.public(site["canonical_domain"], request_id=f"uf06-{key}")
        return await self.adapter.resolve_page(context, path=path, q=q, page=page, page_size=page_size)


def validate_archive(data):
    validator = Draft202012Validator(SPEC["components"]["schemas"]["BlogPageData"], resolver=RefResolver.from_schema(SPEC), format_checker=Draft202012Validator.FORMAT_CHECKER)
    assert list(validator.iter_errors(data)) == []


@pytest.mark.asyncio
async def test_archive_is_site_scoped_published_only_stable_and_paginated():
    estate = ArchiveEstate()
    for key in ["SITE-01", "SITE-02", "SITE-01"]:
        status, first, _ = await estate.load(key, q="not-a-search-filter")
        assert status == 200
        validate_archive(first)
        status, second, _ = await estate.load(key, page=2)
        assert status == 200
        validate_archive(second)
        articles = first["articles"] + second["articles"]
        site_id = next(site_id for site_id, site in estate.sites.items() if site["site_key"] == key)
        expected = [row for row in estate.archive_rows if row["site_id"] == site_id and row["status"] == "PUBLISHED"]
        expected.sort(key=lambda row: row["post_id"])
        expected.sort(key=lambda row: row["published_at"], reverse=True)
        assert [item["article_id"] for item in articles] == [row["post_id"] for row in expected]
        assert len(articles) == 3
        assert all(item["title"].startswith(f"{key} PUBLISHED") for item in articles)
        assert not ({item["article_id"] for item in first["articles"]} & {item["article_id"] for item in second["articles"]})
        assert first["pagination"]["next"]["url"].endswith("/blog?page=2&page_size=2")
        assert second["pagination"]["previous"]["url"].endswith("/blog?page=1&page_size=2")
        assert "next" not in second["pagination"]
        assert first["context"]["page_id"] == "PUB-BLOG-01"
        assert first["context"]["page_kind"] == "CONTENT"
        assert first["seo"]["robots"]["index"] is True
        assert second["seo"]["robots"] == {"index": False, "follow": True}
        assert first["seo"]["canonical_url"] == second["seo"]["canonical_url"]
        assert first["seo"]["canonical_url"].endswith("/blog")
        assert any(item["@type"] == "CollectionPage" for item in first["seo"]["structured_data"])
        assert first["breadcrumbs"]["items"][-1] == {"label": "Articles", "is_current": True}
    assert all(params["limit"] == 3 for _, params in estate.archive_reads)


@pytest.mark.asyncio
async def test_empty_and_exhausted_archives_are_honest_and_do_not_cross_sites():
    estate = ArchiveEstate()
    status, empty, _ = await estate.load("SITE-03")
    assert status == 200 and empty["articles"] == [] and "pagination" not in empty
    validate_archive(empty)
    status, exhausted, _ = await estate.load("SITE-01", page=10)
    assert status == 200 and exhausted["articles"] == []
    assert exhausted["pagination"]["previous"]["url"].endswith("page=9&page_size=2")
    assert "next" not in exhausted["pagination"]


@pytest.mark.asyncio
async def test_archive_respects_the_existing_site_noindex_policy():
    estate = ArchiveEstate()
    site_id = next(site_id for site_id, site in estate.sites.items() if site["site_key"] == "SITE-01")
    estate.settings[site_id]["seo_defaults"]["index_policy"] = "NOINDEX"
    status, data, _ = await estate.load("SITE-01")
    assert status == 200 and data["seo"]["robots"]["index"] is False
    assert data["seo"]["canonical_url"].endswith("/blog")


@pytest.mark.asyncio
async def test_blog_normalization_unknown_hosts_and_existing_routes_are_preserved():
    estate = ArchiveEstate()
    assert await estate.load("SITE-01", path="/blog/") == (308, {}, {"Location": "/blog"})
    status, home, _ = await estate.load("SITE-01", path="/")
    assert status == 200 and home["context"]["page_id"] == "PUB-HOME-01"
    status, search, _ = await estate.load("SITE-01", path="/search")
    assert status == 200 and search["search_state"] == "NO_QUERY" and search["articles"] == []
    for path, page_id in [("/article/story", "PUB-ARTICLE-01"), ("/category/topic", "PUB-CATEGORY-01"), ("/tag/topic", "PUB-TAG-01"), ("/author/writer", "PUB-AUTHOR-01")]:
        status, data, _ = await estate.load("SITE-01", path=path)
        assert status == 200 and data["context"]["page_id"] == page_id
    with pytest.raises(NotFound):
        await estate.contexts.public("unregistered.example.test", request_id="uf06-unknown")


def test_archive_http_transport_validates_contract_and_resolves_each_host():
    estate = ArchiveEstate()
    app, services, *_ = build()
    services.contexts = estate.contexts
    services.public_pages = PublicPageService(estate.adapter)
    for key in ["SITE-01", "SITE-02", "SITE-01"]:
        site = next(row for row in estate.sites.values() if row["site_key"] == key)
        client = TestClient(app, base_url=f"https://{site['canonical_domain']}")
        response = client.get("/api/v1/public/page", params={"path": "/blog", "page_size": 2})
        assert response.status_code == 200, response.text
        data = response.json()
        assert data["context"]["page_id"] == "PUB-BLOG-01"
        assert data["site"]["site_key"] == key
        assert len(data["articles"]) == 2
        assert all(article["title"].startswith(f"{key} PUBLISHED") for article in data["articles"])
    unknown = TestClient(app, base_url="https://unregistered.example.test")
    response = unknown.get("/api/v1/public/page", params={"path": "/blog"})
    assert response.status_code == 404 and "site" not in response.json()
