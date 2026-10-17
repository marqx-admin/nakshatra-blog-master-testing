"""W2 synthetic SQL/transaction/application projections; no live database."""
from contextlib import contextmanager
from copy import deepcopy
from pathlib import Path
import json
import pytest
from jsonschema import Draft202012Validator, RefResolver
from bp_adapters.postgres.editorial import PostgresEditorialRepository
from bp_adapters.postgres.ports import PostgresSiteTransactionPort
from bp_application.editorial import EditorialApplication
from bp_application.authorization import AuthorizationService
from bp_api.composition.presentation import PresentationPolicy
from bp_domain.security import AdminPrincipal, AccountState, Denied, NotFound, ValidationFault
from bp_domain.editorial import validate_navigation_destination
from bp_domain.website_content import PAGE_KEYS, information_page_ready
from tests.fixtures.chat03_fakes import FakeAudit
from tests.fixtures.universal_parity import Estate, FixtureConnection, Result, SPEC, identifier


class Connection(FixtureConnection):
    def execute(self, statement, params=None):
        sql, params = str(statement), params or {}
        if sql.startswith("UPDATE site_settings"):
            assert params["site_id"] == self.site_id, "write must be scoped to trusted transaction"
            settings = self.estate.settings[self.site_id]
            if "homepage_h1=:value" in sql: settings["homepage_h1"] = params["value"]
            elif "homepage_intro_text=:value" in sql: settings["homepage_intro_text"] = params["value"]
            elif "homepage_lead_post_id=:lead" in sql: settings["homepage_lead_post_id"] = params["lead"]
            elif "static_pages=COALESCE(static_pages,'{}'::jsonb) || CAST(:static_pages AS jsonb)" in sql:
                settings["static_pages"].update(json.loads(params["static_pages"]))
            else: raise AssertionError(sql)
            return Result([])
        if self.site_id and "FROM homepage_sections" in sql: return Result([])
        if self.site_id and self.estate.sites[self.site_id]["site_key"] == "SITE-15" and "FROM posts" in sql:
            return Result([])
        return super().execute(statement, params)


class ContentEstate(Estate):
    def __init__(self):
        super().__init__()
        source = next(sid for sid, site in self.sites.items() if site["site_key"] == "SITE-02")
        sid = identifier("SITE-15", "site")
        self.sites[sid] = {**self.sites[source], "site_id": sid, "site_key": "SITE-15", "canonical_domain": "site15.example.test"}
        self.settings[sid] = deepcopy(self.settings[source])
        self.posts[sid] = deepcopy(self.posts[source]) # fixture implementation lookup only, never returned publicly
        self.settings[sid]["homepage_lead_post_id"] = None
        self.settings[sid]["static_pages"] = {key: {**page, "enabled": False} for key, page in self.settings[sid]["static_pages"].items()}

    @contextmanager
    def connect(self):
        yield Connection(self)


class Repository(PostgresEditorialRepository):
    def _site_settings_wire(self, connection, context):
        return [{"key": "static_pages", "value": deepcopy(connection.estate.settings[context.site_id]["static_pages"])}]

    def _sync_site_setting_media_usages(self, connection, context):
        pass # No media mutation in these test cases; production implementation is retained.

    async def relationships_exist(self, context, **kwargs):
        return not any(kwargs.values())


def setup():
    estate = ContentEstate()
    repo = Repository(PostgresSiteTransactionPort(estate))
    service = EditorialApplication(repo, AuthorizationService(None), FakeAudit(), static_pages_validator=PresentationPolicy(SPEC).static_pages.is_valid)
    principal = AdminPrincipal("test-editor", "editor@example.test", AccountState.ACTIVE,
        site_permissions={"SITE-15": frozenset({"navigation.view", "navigation.manage", "site_settings.view", "site_settings.edit"})})
    return estate, repo, service, principal


async def context(estate, key="SITE-15"):
    host = next(site["canonical_domain"] for site in estate.sites.values() if site["site_key"] == key)
    return await estate.contexts.public(host, request_id="w2-fixture")


async def execute(service, principal, ctx, operation, body):
    return await service.execute(operation, principal=principal, context=ctx, path_params={"site_key":ctx.site_key}, query={}, body=body)


@pytest.mark.asyncio
async def test_home_save_restore_projects_owned_hindi_english_and_preserves_latest_and_other_site():
    estate, repo, service, principal = setup(); ctx = await context(estate)
    original = deepcopy(estate.settings)
    for h1, intro in [("Saved home", "English supplied prose"), ("सहेजा गया शीर्षक", "हिंदी और English परिचय")]:
        await execute(service, principal, ctx, "API15-S-073", {"h1":h1,"intro_text":intro,"sections":[],"lead_post_id":None})
        restored = await repo.get_homepage(ctx)
        assert restored["h1"] == h1 and restored["intro_text"] == intro
        result = await estate.page("SITE-15", "/")
        assert result["data"]["intro"] == {"h1":h1,"intro_text":intro}
        assert result["data"]["latest_articles"] == []
        assert "lead_article" not in result["data"]
    await execute(service, principal, ctx, "API15-S-073", {"sections":[]})
    assert (await repo.get_homepage(ctx))["h1"] == "सहेजा गया शीर्षक", "older clients must not clear new fields"
    for sid in original:
        if sid != ctx.site_id: assert estate.settings[sid] == original[sid]


@pytest.mark.asyncio
@pytest.mark.parametrize("key,path", [("ABOUT","/about"),("CONTACT","/contact"),("PRIVACY","/privacy-policy"),("TERMS","/terms-of-use"),("DISCLAIMER","/disclaimer")])
async def test_each_fixed_page_save_restore_and_order_is_independent(key, path):
    estate, repo, service, principal = setup(); ctx=await context(estate)
    before=deepcopy(estate.settings)
    page={"enabled":True,"content_version":7,"title":f"Saved {key}","intro_text":"हिंदी / English", "body_sections":[
        {"heading":"Second authored heading","paragraphs":["Second supplied text"],"list_items":["दो","one"]},
        {"heading":"First authored heading","paragraphs":["First supplied text"],"list_items":[]}]}
    await execute(service,principal,ctx,"API15-S-097",{"settings":[{"key":"static_pages","value":{key:page}}]})
    stored=estate.settings[ctx.site_id]["static_pages"]
    assert stored[key] == page
    for sibling in PAGE_KEYS-{key}: assert stored[sibling] == before[ctx.site_id]["static_pages"][sibling]
    projected=(await estate.page("SITE-15",path))["data"]["content"]
    assert projected["intro_text"]==page["intro_text"]
    assert [s["heading"] for s in projected["sections"]]==[s["heading"] for s in page["body_sections"]]
    page["enabled"]=False
    await execute(service,principal,ctx,"API15-S-097",{"settings":[{"key":"static_pages","value":{key:page}}]})
    assert (await estate.page("SITE-15",path))["status"] == 404
    for sid in before:
        if sid!=ctx.site_id: assert estate.settings[sid]==before[sid]


@pytest.mark.asyncio
async def test_disabled_legal_drafts_round_trip_but_cannot_be_enabled_with_placeholders():
    estate,repo,service,principal=setup();ctx=await context(estate)
    for key in ["PRIVACY","TERMS","DISCLAIMER"]:
        page={"enabled":False,"content_version":1,"title":key,"intro_text":"[Website Name]", "body_sections":[{"heading":"Owner review","paragraphs":[],"list_items":[]}]}
        await execute(service,principal,ctx,"API15-S-097",{"settings":[{"key":"static_pages","value":{key:page}}]})
        assert estate.settings[ctx.site_id]["static_pages"][key]==page
        page["enabled"]=True
        with pytest.raises(ValidationFault):
            await execute(service,principal,ctx,"API15-S-097",{"settings":[{"key":"static_pages","value":{key:page}}]})
        assert estate.settings[ctx.site_id]["static_pages"][key]["enabled"] is False
    with pytest.raises(ValidationFault):
        await execute(service,principal,ctx,"API15-S-073",{"h1":"Explore [Primary Topic]","sections":[]})


@pytest.mark.asyncio
async def test_ownership_permissions_and_typed_navigation_eligibility():
    estate,repo,service,principal=setup(); own=await context(estate); other=await context(estate,"SITE-01")
    for op,body in [("API15-S-073",{"h1":"wrong site","sections":[]}), ("API15-S-097",{"settings":[{"key":"static_pages","value":{}}]})]:
        with pytest.raises(Denied): await execute(service,principal,other,op,body)
    with pytest.raises(NotFound):
        await service.execute("API15-S-073",principal=principal,context=own,path_params={"site_key":"SITE-01"},query={},body={"sections":[]})
    with estate.connect() as conn:
        conn.site_id=own.site_id
        for kind,path in [("HOME","/"),("BLOG","/blog"),("SEARCH","/search")]:
            assert validate_navigation_destination({"kind":kind},"destination")=={"kind":kind}
            assert estate.adapter._resolve_destination(conn,own,{"destination_kind":kind},{})["url"].endswith(path)
            with pytest.raises(ValidationFault): validate_navigation_destination({"kind":kind,"url":"https://other.test"},"destination")
        for kind,values in [("UNKNOWN",{}),("STATIC",{"static_page_key":"ABOUT"}),("STATIC",{"static_page_key":"UNKNOWN"})]:
            assert estate.adapter._resolve_destination(conn,own,{"destination_kind":kind,**values},estate.settings[own.site_id]["static_pages"]) is None


def test_additive_migration_is_insert_only_and_preserves_rls_and_existing_rows():
    migration=Path("database/migrations/0022_DB-MIG-022__website-content-navigation.sql").read_text()
    assert "website baseline already exists" in migration
    assert "('HOME','Home','मुखपृष्ठ',0),('BLOG','All Articles','सभी लेख',1),('SEARCH','Search','खोजें',2)" in migration
    assert "UPDATE public.site_settings" not in migration
    assert "INSERT INTO public.posts" not in migration
    assert "DISABLE ROW LEVEL SECURITY" not in migration
    assert "SECURITY DEFINER\nSET search_path = pg_catalog, pg_temp" in migration
    validator=Draft202012Validator(SPEC["components"]["schemas"]["SiteSettingsInput"],resolver=RefResolver.from_schema(SPEC))
    page={"enabled":False,"content_version":1,"title":"Draft","intro_text":"","body_sections":[]}
    assert validator.is_valid({"settings":[{"key":"static_pages","value":{"ABOUT":page}}]})
    assert not validator.is_valid({"settings":[{"key":"static_pages","value":{"OTHER":page}}]})
    assert not information_page_ready(page)
