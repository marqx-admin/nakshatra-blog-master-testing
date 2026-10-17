"""W4 setup regressions using synthetic state and in-process transports."""
from contextlib import asynccontextmanager
from dataclasses import replace
from datetime import timedelta
from types import SimpleNamespace
import json

import pytest
from bp_adapters.security_store import InMemorySecurityStateStore
from bp_application.authorization import AuthorizationService
from bp_application.security import SessionAuthority, now_utc
from bp_application.public_page import PublicPageService
from bp_application.website_preview import PREVIEW_PERMISSIONS, WebsitePreviewAuthority
from bp_domain.context import ContextKind, ContextSource, SiteContext
from bp_domain.errors import Conflict, Denied, Unauthenticated
from bp_domain.security import AccountState, AdminPrincipal, SessionRecord
from bp_api.composition.global_postgres import PostgresGlobalOperations
from bp_api.composition.presentation import PresentationPolicy
from bp_api.composition.website_readiness import WebsiteReadinessProjection
from tests.application.test_wu02_foundation import SPEC, _ProvisionConnection, _ProvisionEngine, _Row, _pages, _presentation, _principal


def preview_context(key="SITE-15", host="site-15.example.test"):
    return SiteContext(ContextKind.PREVIEW_SITE,"uuid-"+key,key,"DISABLED",host,ContextSource.PREVIEW,"request",request_host=host)


@pytest.mark.asyncio
async def test_website_grant_is_single_use_host_and_site_scoped_and_parent_revocable():
    state=InMemorySecurityStateStore();now=now_utc()
    session=SessionRecord("parent-hash","admin",now,now,now+timedelta(hours=1),now+timedelta(hours=2),"PASSWORD","csrf")
    await state.put_session(session)
    identities=SimpleNamespace()
    identities.principal=AdminPrincipal("admin","admin@example.test",AccountState.ACTIVE,site_permissions={"SITE-15":frozenset(PREVIEW_PERMISSIONS)})
    async def fresh(_): return identities.principal
    identities.get_principal=fresh
    authority=WebsitePreviewAuthority(state,SessionAuthority(state,identities),AuthorizationService(identities))
    context=preview_context()
    handoff,_=await authority.issue(context,session)
    with pytest.raises(Unauthenticated):await authority.exchange(preview_context("SITE-01","site-01.example.test"),handoff)
    raw,_=await authority.exchange(context,handoff)
    with pytest.raises(Unauthenticated):await authority.exchange(context,handoff)
    assert (await authority.validate(context,raw)).admin_id == "admin"
    with pytest.raises(Unauthenticated):await authority.validate(replace(context,request_host="other.example.test"),raw)
    identities.principal=replace(identities.principal,site_permissions={})
    with pytest.raises(Denied):await authority.validate(context,raw)
    identities.principal=replace(identities.principal,site_permissions={"SITE-15":frozenset(PREVIEW_PERMISSIONS)})
    await state.revoke_session("parent-hash","OWNER_LOGOUT")
    with pytest.raises(Unauthenticated):await authority.validate(context,raw)


class ReplayConnection(_ProvisionConnection):
    response = None
    def execute(self, statement, params=None):
        sql=str(statement)
        if "MAX(substring" in sql:
            self.statements.append(sql)
            return _Row(15)
        if "SELECT details FROM audit_events" in sql:
            return _Row({"details":self.response} if self.response else None)
        if "INSERT INTO audit_events" in sql:
            self.response=json.loads(params["details"])
        return super().execute(statement,params)


@pytest.mark.asyncio
async def test_auto_identity_uses_serialized_existing_transaction_and_same_request_replays_without_new_site():
    engine=_ProvisionEngine();engine.connection=ReplayConnection()
    backend=PostgresGlobalOperations(engine,None,None,temporary_domain_suffix="example.test",presentation_policy=PresentationPolicy(SPEC))
    body={"display_name":"साझा Website","timezone_id":"Asia/Kolkata","presentation":_presentation(),"static_pages":_pages(),"homepage":{"h1":"अपना परिचय","intro_text":"Owner-supplied English / हिंदी prose"}}
    args=dict(principal=_principal(),context=None,path_params={},query={},body=body,headers={"idempotency-key":"owner-request-123456"})
    first=await backend.execute("API15-G-011",**args)
    second=await backend.execute("API15-G-011",**args)
    assert first == second and first[1]["site"]["site_key"] == "SITE-15"
    statements=engine.connection.statements
    assert next(i for i,s in enumerate(statements) if "LOCK TABLE sites" in s) < next(i for i,s in enumerate(statements) if "MAX(substring" in s)
    assert sum("INSERT INTO sites" in s for s in statements) == 1
    assert not any("INSERT INTO posts" in s or "UPDATE sites" in s for s in statements)
    baseline=next(params for sql,params in engine.connection.calls if "insert_website_site_baseline" in sql)
    assert json.loads(baseline["home"])["h1"] == "अपना परिचय" and baseline["site_id"] == "site-a"
    assert not any("UPDATE site_settings" in sql for sql in statements)
    with pytest.raises(Conflict):
        await backend.execute("API15-G-011",**{**args,"body":{**body,"display_name":"Different"}})


@pytest.mark.asyncio
async def test_readiness_never_invents_launch_evidence_or_treats_disabled_legal_templates_as_approved():
    class Connection:
        def execute(self, statement, params):
            assert params["sid"] == "uuid-SITE-15"
            if "FROM domains" in str(statement):
                return SimpleNamespace(fetchall=lambda:[SimpleNamespace(_mapping={"hostname":"site-15.example.test","is_canonical":True})])
            if "FROM navigation_items" in str(statement):return SimpleNamespace(fetchall=lambda:[])
            return _Row(2)
    class Transactions:
        @asynccontextmanager
        async def transaction(self,context):
            assert context.site_key == "SITE-15"
            yield Connection()
    pages=_pages();pages["PRIVACY"]["enabled"]=False
    settings={"presentation_config":_presentation(),"static_pages":pages,"homepage_h1":"Owned heading","homepage_intro_text":"Owned intro"}
    backend=SimpleNamespace(site_transactions=Transactions(),_base_rows=lambda *_:({"display_name":"Owned site","timezone_id":"UTC","status":"DISABLED"},settings),
        _navigation=lambda *_:{"header":{"items":[{}]},"footer":{"items":[{}]}},_presentation_references_valid=lambda *_:True,_seo_defaults=lambda *_:{"seo_title":"Owned SEO"})
    result=await WebsiteReadinessProjection(backend,PresentationPolicy(SPEC),"example.test").build(preview_context())
    assert result["provisioned"] is True and result["content_ready"] is False and result["launch_ready"] is False
    checks={item["key"]:item for item in result["checks"]}
    assert checks["PRIVACY"]["status"] == "NEEDS_ATTENTION"
    assert checks["PERMANENT_DOMAIN_TLS"]["status"] == "NOT_VERIFIED"
    assert checks["PUBLIC_ACTIVATION"]["status"] == "NEEDS_ATTENTION"


def test_http_disabled_site_preview_keeps_public_access_closed_and_revokes_with_admin_logout():
    """In-process transport fixture only; never starts a server or database."""
    from urllib.parse import parse_qs, urlsplit
    from fastapi.testclient import TestClient
    from tests.e2e.test_chat03_auth import build, PASSWORD
    app,services,_,state,_,_,_=build(super_admin=True,require_mfa_on_login=False)
    sites=services.contexts.sites
    site=replace(sites.by_key["SITE-01"],lifecycle="DISABLED")
    sites.by_key[site.site_key]=site;sites.by_id[site.site_id]=site;sites.by_host[site.canonical_domain]=site
    services.website_preview=WebsitePreviewAuthority(state,services.sessions,services.authorization)
    class Backend:
        async def resolve_page(self,context,**query):
            assert context.kind is ContextKind.PREVIEW_SITE and context.site_key == "SITE-01"
            return 200,{
                "context":{"page_id":"PUB-HOME-01","page_kind":"CONTENT","render_mode":"PUBLIC"},
                "site":{"site_key":context.site_key,"display_name":"Synthetic private fixture","canonical_domain":context.canonical_domain,"timezone_id":"UTC","home_destination":{"kind":"HOME","url":"https://"+context.canonical_domain+"/","is_external":False}},
                "settings":{"social_profiles":[]},"navigation":{"header":{"menu_key":"HEADER","items":[]},"footer":{"menu_key":"FOOTER","items":[]}},
                "intro":{"h1":"Synthetic private fixture"},"latest_articles":[],"sections":[],
                "seo":{"baseline_indexability":"INDEX-ELIGIBLE","title":"Synthetic fixture","robots":{"index":True,"follow":True},"structured_data":[]},
            },{}
    services.public_pages=PublicPageService(Backend())
    client=TestClient(app,base_url="https://admin.test")
    assert client.post("/api/v1/auth/login",json={"email":"admin@example.test","password":PASSWORD}).status_code == 200
    csrf=client.cookies.get("__Host-bp_csrf")
    endpoint="/api/v1/admin/sites/SITE-01/website-preview"
    assert client.post(endpoint).status_code == 403
    issued=client.post(endpoint,headers={"Origin":"https://admin.test","X-CSRF-Token":csrf})
    assert issued.status_code == 201
    handoff=parse_qs(urlsplit(issued.json()["preview_url"]).query)["handoff"][0]
    assert client.get("https://apkirashi.com/api/v1/public/preview/website",params={"path":"/","handoff":handoff}).status_code == 401
    origin="https://"+site.canonical_domain
    private=client.get(origin+"/api/v1/public/preview/website",params={"path":"/","handoff":handoff})
    assert private.status_code == 200 and private.json()["latest_articles"] == []
    assert private.json()["seo"]["robots"] == {"index":False,"follow":False}
    assert "no-store" in private.headers["cache-control"] and private.headers["x-robots-tag"] == "noindex, nofollow"
    assert "HttpOnly" in private.headers["set-cookie"] and "Secure" in private.headers["set-cookie"]
    assert client.get(origin+"/api/v1/public/page",params={"path":"/"}).status_code == 404
    assert client.post("/api/v1/auth/logout",headers={"Origin":"https://admin.test","X-CSRF-Token":csrf}).status_code == 204
    assert client.get(origin+"/api/v1/public/preview/website",params={"path":"/"}).status_code == 401
