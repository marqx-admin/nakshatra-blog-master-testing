"""Versioned appearance through existing tenant-bound persistence/projection.

Synthetic transaction rows only; no PostgreSQL connection or migration.
"""
from contextlib import contextmanager
from copy import deepcopy
import json
import subprocess
import pytest
from bp_application.editorial import EditorialApplication
from bp_application.authorization import AuthorizationService
from bp_adapters.postgres.ports import PostgresSiteTransactionPort
from bp_api.composition.presentation import PresentationPolicy
from bp_domain.security import Denied, ValidationFault
from tests.application.test_w2_website_content import ContentEstate, Connection, Repository, context, execute, setup
from tests.fixtures.chat03_fakes import FakeAudit
from tests.fixtures.universal_parity import Result, SPEC

CONFIGS=json.loads(subprocess.check_output(["node","--input-type=module","-e",'''import {APPEARANCE_IDS,appearanceConfig,customAppearanceConfig,readyStyleConfig} from "./packages/ts/presentation-catalogue/src/index.ts"; console.log(JSON.stringify({presets:APPEARANCE_IDS.map(id=>appearanceConfig(id)),custom:APPEARANCE_IDS.map(id=>customAppearanceConfig(id)),legacy:APPEARANCE_IDS.slice(1).map(id=>readyStyleConfig(id))}));'''],text=True))

class AppearanceConnection(Connection):
    def execute(self, statement, params=None):
        sql,params=str(statement),params or {}
        if sql.startswith("UPDATE site_settings") and "presentation_config" in params:
            assert params["site_id"]==self.site_id
            assert "presentation_schema_version=1" in sql
            self.estate.settings[self.site_id]["presentation_config"]=json.loads(params["presentation_config"])
            self.estate.settings[self.site_id]["presentation_schema_version"]=1
            return Result([])
        return super().execute(statement,params)

class AppearanceEstate(ContentEstate):
    @contextmanager
    def connect(self):yield AppearanceConnection(self)

class AppearanceRepository(Repository):
    def _site_settings_wire(self,connection,context):
        return [{"key":key,"value":deepcopy(connection.estate.settings[context.site_id][key])} for key in ["presentation_config","static_pages"]]

def fixture():
    estate=AppearanceEstate();repo=AppearanceRepository(PostgresSiteTransactionPort(estate));policy=PresentationPolicy(SPEC)
    service=EditorialApplication(repo,AuthorizationService(None),FakeAudit(),presentation_validator=policy.presentation_valid,static_pages_validator=policy.static_pages.is_valid)
    principal=setup()[3]
    return estate,repo,service,principal

@pytest.mark.asyncio
@pytest.mark.parametrize("config",CONFIGS["presets"]+CONFIGS["custom"],ids=lambda c:c["style_id"]+"/"+c.get("base_style_id", "preset"))
async def test_standard_presets_custom_persist_reload_and_do_not_touch_content_seo_or_other_tenants(config):
    estate,repo,service,principal=fixture();ctx=await context(estate)
    other_before=await estate.page("SITE-01","/");home_before=await estate.page("SITE-15","/")
    settings_before=deepcopy(estate.settings);posts_before=deepcopy(estate.posts)
    _,response,_=await execute(service,principal,ctx,"API15-S-097",{"settings":[{"key":"presentation_config","value":config}]})
    stored=next(entry["value"] for entry in response["settings"] if entry["key"]=="presentation_config")
    assert stored==config
    home_after=await estate.page("SITE-15","/")
    assert home_after["data"]["presentation"]=={"config":config,"source":"STORED"}
    for page in [home_before,home_after]:page["data"].pop("presentation",None)
    assert home_before==home_after
    assert await estate.page("SITE-01","/")==other_before
    assert estate.posts==posts_before
    assert estate.settings[ctx.site_id]["static_pages"]==settings_before[ctx.site_id]["static_pages"]
    for key,value in settings_before[ctx.site_id].items():
        if key not in {"presentation_config","presentation_schema_version"}:assert estate.settings[ctx.site_id][key]==value

def test_invalid_versions_unsafe_fields_unknown_ids_and_contrast_are_rejected():
    policy=PresentationPolicy(SPEC)
    for config in [
        {"schema_version":1,"style_id":"STANDARD"},
        {"schema_version":1,"recipe_version":1,"style_id":"CUSTOM","base_style_id":"STANDARD"},
        {"schema_version":1,"recipe_version":3,"style_id":"STYLE_01"},
        {**CONFIGS["custom"][0],"css":"body{display:none}"},
        {**CONFIGS["custom"][0],"typography_id":"url(javascript:alert(1))"},
        {**CONFIGS["custom"][0],"cards":{"article_card_profile_id":"CARD-31"}},
    ]:assert not policy.presentation_valid(config)
    bad=deepcopy(CONFIGS["custom"][0]);bad["palette"]={"mode":"CUSTOM","semantic_tokens":{"surface":"#ffffff","surface_alt":"#ffffff","text":"#ffffff","text_muted":"#ffffff","accent":"#ffffff","accent_text":"#ffffff","border":"#ffffff","focus":"#ffffff"}}
    assert not policy.presentation_valid(bad)
    for role in ("primary", "heading", "surface_alt"):
        bad=deepcopy(CONFIGS["custom"][0])
        bad["palette"]={"mode":"CUSTOM","semantic_tokens":{
            "surface":"#ffffff","surface_alt":"#eeeeee","text":"#111111","text_muted":"#444444",
            "accent":"#174f70","accent_text":"#ffffff","border":"#777777","focus":"#174f70",
            "primary":"#174f70","heading":"#222222","background":"#fafafa",
            role: "#111111" if role == "surface_alt" else "#ffffff",
        }}
        assert not policy.presentation_valid(bad),role
    for legacy in CONFIGS["legacy"]:assert policy.presentation_valid(legacy)

@pytest.mark.asyncio
async def test_standard_fallback_and_site_permission_guards_preserve_tenancy_and_legacy_projection():
    estate,repo,service,principal=fixture();ctx=await context(estate);other=await context(estate,"SITE-01")
    with pytest.raises(Denied):
        await execute(service,principal,other,"API15-S-097",{"settings":[{"key":"presentation_config","value":CONFIGS["presets"][0]}]})
    invalid={**CONFIGS["presets"][0],"typography_id":"TYPE-99"}
    with pytest.raises(ValidationFault):
        await execute(service,principal,ctx,"API15-S-097",{"settings":[{"key":"presentation_config","value":invalid}]})
    estate.settings[ctx.site_id]["presentation_config"]=invalid
    fallback=(await estate.page("SITE-15","/"))["data"]["presentation"]
    assert fallback=={"source":"PRESET_DEFAULT","config":{"schema_version":1,"recipe_version":2,"style_id":"STANDARD"}}
    for config in CONFIGS["legacy"]:
        estate.settings[ctx.site_id]["presentation_config"]=config
        assert (await estate.page("SITE-15","/"))["data"]["presentation"]["config"]==config
