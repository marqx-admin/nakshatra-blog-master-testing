import pytest

from bp_application.authorization import AuthorizationService
from bp_application.context import TrustedContextService, normalize_host
from bp_domain.context import ContextKind, GlobalContext, SiteContext
from bp_domain.security import AccountState, AdminPrincipal, Denied, NotFound
from tests.fixtures.chat03_fakes import FakeSites


def principal(*, super_admin=False, site=True, global_perm=True):
    return AdminPrincipal(
        "admin-1",
        "admin@example.test",
        AccountState.ACTIVE,
        is_super_admin=super_admin,
        global_permissions=frozenset({"sites.view"}) if global_perm else frozenset(),
        site_permissions={"SITE-01": frozenset({"posts.view"})} if site else {},
    )


@pytest.mark.asyncio
async def test_host_to_site_is_trusted_and_fail_closed():
    svc = TrustedContextService(FakeSites())
    ctx = await svc.public("WHATSYOURRASHI.IN", request_id="req-1")
    assert ctx.site_key == "SITE-01" and ctx.site_id == "site-uuid-01"
    assert ctx.kind is ContextKind.PUBLIC_SITE
    assert ctx.request_host == "whatsyourrashi.in"
    with pytest.raises(NotFound):
        await svc.public("unknown.example", request_id="req-2")
    with pytest.raises(NotFound):
        await svc.public("disabled.example", request_id="req-3")


def test_hostname_normalization_matches_v1_safety_rules():
    assert normalize_host("WWW.Example.com.:443") == "www.example.com"
    assert normalize_host("Buecher.example") == "buecher.example"
    for value in ("https://example.com/path", "bad host.example", "name@example.com", "[::1]"):
        with pytest.raises(NotFound):
            normalize_host(value)


@pytest.mark.asyncio
async def test_admin_site_assignment_is_non_disclosing_but_super_admin_still_has_explicit_context():
    svc = TrustedContextService(FakeSites())
    ctx = await svc.admin_site("SITE-01", principal=principal(), request_id="req-4")
    assert ctx.site_key == "SITE-01" and ctx.kind is ContextKind.ADMIN_SITE
    with pytest.raises(NotFound):
        await svc.admin_site("SITE-01", principal=principal(site=False), request_id="req-5")
    with pytest.raises(NotFound):
        await svc.admin_site("SITE-77", principal=principal(), request_id="req-6")
    super_ctx = await svc.admin_site("SITE-01", principal=principal(super_admin=True, site=False), request_id="req-7")
    assert super_ctx.site_key == "SITE-01"


def test_global_is_explicit_and_typed_separately():
    svc = TrustedContextService(FakeSites())
    with pytest.raises(Denied):
        svc.global_context(principal=principal(global_perm=False), request_id="req-8")
    global_ctx = svc.global_context(principal=principal(), request_id="req-9")
    assert isinstance(global_ctx, GlobalContext)
    assert not isinstance(global_ctx, SiteContext)
    assert global_ctx.kind is ContextKind.GLOBAL


def test_authorization_super_admin_does_not_need_role_permissions_but_scope_is_separate():
    super_p = principal(super_admin=True, site=False, global_perm=False)
    AuthorizationService.require_site(super_p, "SITE-01", {"posts.view"})
    AuthorizationService.require_global(super_p, {"sites.view"})
    with pytest.raises(Denied):
        AuthorizationService.require_site(principal(site=False), "SITE-01", {"posts.view"})
