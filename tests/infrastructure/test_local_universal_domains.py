from importlib.util import module_from_spec, spec_from_file_location
from pathlib import Path

import pytest

from bp_application.context import TrustedContextService
from bp_domain.context import SiteRecord
from bp_domain.temporary_site_url import TemporarySiteUrlConfig, temporary_site_url

spec = spec_from_file_location("local_aliases", Path(__file__).parents[2] / "infrastructure/scripts/register_local_temporary_domains.py")
module = module_from_spec(spec)
spec.loader.exec_module(module)


def test_local_alias_repair_is_additive_idempotent_and_preserves_canonical_records():
    sites = [{"site_id": "a", "site_key": "SITE-15", "status": "DISABLED"}]
    domains = [{"site_id": "a", "hostname": "owner.example", "is_active": True}]
    planned = module.plan_aliases(sites, domains, "preview.localhost")
    assert planned == [{"site_id": "a", "site_key": "SITE-15", "hostname": "site-15.preview.localhost"}]
    assert domains == [{"site_id": "a", "hostname": "owner.example", "is_active": True}]
    assert module.plan_aliases(sites, domains + [{**planned[0], "is_active": True}], "preview.localhost") == []
    for wrong in [{**planned[0], "site_id": "b", "is_active": True}, {**planned[0], "is_active": False}]:
        with pytest.raises(ValueError):
            module.plan_aliases(sites, [wrong], "preview.localhost")
    with pytest.raises(ValueError):
        module.plan_aliases(sites, domains, "production.example")


@pytest.mark.asyncio
async def test_one_registry_resolves_100_local_sites_without_per_site_apps():
    sites = [{"site_id": f"tenant-{i}", "site_key": f"SITE-{i:02d}", "status": "ACTIVE"} for i in range(1, 101)]
    aliases = module.plan_aliases(sites, [], "preview.localhost")
    records = {row["hostname"]: SiteRecord(row["site_id"], row["site_key"], row["hostname"], "ACTIVE") for row in aliases}
    class Registry:
        async def resolve_host(self, host):
            return records.get(host)
    service = TrustedContextService(Registry())
    identities = set()
    for row in aliases:
        context = await service.public(row["hostname"] + ":3015", request_id=row["site_key"])
        assert context.site_id == row["site_id"] and context.site_key == row["site_key"]
        assert temporary_site_url(context.request_host, TemporarySiteUrlConfig("http", 3015)) == f"http://{row['hostname']}:3015/"
        identities.add(context.site_id)
    assert len(identities) == 100


@pytest.mark.parametrize("raw,expected", [
    ('{"username":"local_user","password":"fixture-value"}', ("local_user", "fixture-value")),
    ('{"password":"fixture-value"}', ("db_platform_runtime", "fixture-value")),
    ("local_user:fixture-value", ("local_user", "fixture-value")),
    ("local_user:fixture:with:colons", ("local_user", "fixture:with:colons")),
    ("fixture-value\n", ("db_platform_runtime", "fixture-value")),
])
def test_local_runtime_credentials_match_api_formats(tmp_path, raw, expected):
    credential = tmp_path / "credential.txt"
    credential.write_text(raw)
    assert module.read_runtime_credential(credential) == expected


@pytest.mark.parametrize("raw", ["", "  \n", "local_user:", ":fixture-value", '{"username":"local_user"}'])
def test_local_runtime_credentials_reject_empty_values_without_disclosing_content(tmp_path, raw):
    credential = tmp_path / "credential.txt"
    credential.write_text(raw)
    with pytest.raises(ValueError, match="empty or incomplete") as error:
        module.read_runtime_credential(credential)
    assert "fixture-value" not in str(error.value)
