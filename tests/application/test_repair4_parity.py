"""Code/fixture parity proof; never real tenant or PostgreSQL acceptance."""
import asyncio
from copy import deepcopy
import json
import subprocess

from jsonschema import Draft202012Validator, RefResolver
import pytest

from bp_api.composition.presentation import PresentationPolicy
from bp_domain.errors import NotFound
from tests.fixtures.universal_parity import Estate, PLAN, ROOT, ROUTES, SPEC

SCHEMAS = dict(zip(ROUTES, ["HomePageData", "ArticlePageData", "CategoryPageData", "TagPageData", "AuthorPageData", "SearchPageData", *(["StaticPageData"] * 5), "NotFoundPageData", "GonePageData"], strict=True))


def test_catalogue_plan_is_complete_rc13_and_sql_preserves_existing_settings():
    assert len(PLAN) == 14
    policy = PresentationPolicy(SPEC)
    for entry in PLAN:
        policy.require_provisioning_presentation(entry["presentation"])
    sql = subprocess.check_output(["node", "tooling/scripts/plan-legacy-parity.mjs", "--sql"], cwd=ROOT, text=True)
    assert "BEGIN;" in sql and "COMMIT;" in sql and "ON_ERROR_STOP" in sql
    assert "current_user <> 'db_site_runtime'" in sql
    assert sql.count("INTO STRICT target FROM sites") == 14
    assert sql.count("set_config('app.site_id', target::text, true)") == 14
    assert sql.count("FOR UPDATE") == 14
    assert sql.count("WHERE site_id=target AND presentation_config IS NULL AND presentation_schema_version=1") == 14
    assert "INSERT" not in sql and "DELETE" not in sql and "domains" not in sql
    assert "static_pages=" not in sql and "navigation_items" not in sql


@pytest.mark.asyncio
@pytest.mark.parametrize("entry", PLAN, ids=lambda entry: entry["site_key"])
async def test_fourteen_trusted_hosts_project_their_own_settings_content_and_seo(entry):
    estate = Estate()
    key = entry["site_key"]
    for path in ROUTES:
        response = await estate.page(key, path)
        assert response["status"] == (404 if path == "/missing" else 410 if path.endswith("/gone") else 200)
        data = response["data"]
        assert data["site"]["site_key"] == key
        assert data["presentation"] == {"source": "STORED", "config": entry["presentation"]}
        validator = Draft202012Validator(SPEC["components"]["schemas"][SCHEMAS[path]], resolver=RefResolver.from_schema(SPEC), format_checker=Draft202012Validator.FORMAT_CHECKER)
        assert list(validator.iter_errors(data)) == [], path
        assert data["navigation"]["header"]["items"][0]["label"] == f"{key} navigation"
        if response["status"] == 200:
            assert data["seo"]["canonical_url"].startswith(f"https://{data['site']['canonical_domain']}/")
            if path == "/search":
                assert data["seo"]["title"] == "Search" and data["seo"]["robots"]["index"] is False
                assert data["articles"][0]["title"] == f"{key} fixture article"
            else:
                assert key in data["seo"]["title"] or entry["name"] in data["seo"]["title"]
        if path == "/article/story":
            assert data["article"]["body"]["blocks"][0]["payload"]["content"]["runs"][0]["text"] == f"{key} fixture body"
            assert data["seo"]["title"].startswith(f"{key} stored article SEO")
        assert not any(other["site_key"] in json.dumps(data) for other in PLAN if other["site_key"] != key)


@pytest.mark.asyncio
async def test_sequential_and_interleaved_tenants_keep_context_and_owner_edits():
    estate = Estate()
    keys = ["SITE-01", "SITE-04", "SITE-01", "SITE-11", "SITE-06", "SITE-14"]
    async def request(key):
        await asyncio.sleep(0)
        return await estate.page(key, "/")
    replies = await asyncio.gather(*(request(key) for key in keys * 2))
    assert [reply["data"]["site"]["site_key"] for reply in replies] == keys * 2
    target = next(site_id for site_id, row in estate.sites.items() if row["site_key"] == "SITE-04")
    customized = deepcopy(estate.settings[target]["presentation_config"])
    customized["palette"]["preset_id"] = "PAL-30"
    estate.settings[target]["presentation_config"] = customized
    assert (await estate.page("SITE-04", "/"))["data"]["presentation"]["config"] == customized
    estate.settings[target]["presentation_config"] = {"schema_version": 99}
    assert (await estate.page("SITE-04", "/"))["data"]["presentation"]["source"] == "SAFE_DEFAULT"
    assert (await estate.page("SITE-01", "/"))["data"]["presentation"]["config"] == PLAN[0]["presentation"]
    estate.settings[target]["static_pages"]["ABOUT"]["enabled"] = False
    assert (await estate.page("SITE-04", "/about"))["status"] == 404
    with pytest.raises(NotFound):
        await estate.contexts.public("unknown.example", request_id="unknown")
    estate.sites[target]["status"] = "DISABLED"
    with pytest.raises(NotFound):
        await estate.page("SITE-04", "/")
