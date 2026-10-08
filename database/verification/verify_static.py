#!/usr/bin/env python3
"""Source-level verification of the CHAT02 DOC-08 implementation.

This is intentionally independent of PostgreSQL runtime evidence. It verifies the checked-in
raw SQL, seed registries, isolation policy inventory and adapter boundaries before live tests.
"""
from __future__ import annotations

import hashlib
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
MIG = ROOT / "database" / "migrations"
SEEDS = ROOT / "database" / "seeds"
VERIFY = ROOT / "database" / "verification"
ADAPTER = ROOT / "packages" / "python" / "bp-adapters-postgres"
CONTRACT = json.loads((VERIFY / "doc08-contract.json").read_text())

EXPECTED_MIGRATIONS = [
    "0001_DB-MIG-001__bootstrap-database.sql",
    "0002_DB-MIG-002__tenancy-registry.sql",
    "0003_DB-MIG-003__admin-identity-authorization.sql",
    "0004_DB-MIG-004__taxonomy-media-author.sql",
    "0005_DB-MIG-005__post-core.sql",
    "0006_DB-MIG-006__post-relationships.sql",
    "0007_DB-MIG-007__post-history.sql",
    "0008_DB-MIG-008__media-usage.sql",
    "0009_DB-MIG-009__navigation-homepage.sql",
    "0010_DB-MIG-010__settings-redirects.sql",
    "0011_DB-MIG-011__audit-deletion-request.sql",
    "0012_DB-MIG-012__immutability-and-role-integrity.sql",
    "0013_DB-MIG-013__rls-policies.sql",
    "0014_DB-MIG-014__runtime-grants.sql",
    "0015_DB-MIG-015__required-system-seed.sql",
    "0016_DB-MIG-016__validation-gate.sql",
    "0017_DB-MIG-017__wave2-contract-reconciliation.sql",
    "0018_DB-MIG-018__site-identity-settings-write.sql",
    "0019_DB-MIG-019__launch-access-boundaries.sql",
    "0020_DB-MIG-020__universal-presentation-foundation.sql",
]
SITE_TABLES = {t for t, v in CONTRACT["tables"].items() if v["scope"] == "SITE"}
GLOBAL_TABLES = set(CONTRACT["tables"]) - SITE_TABLES
EXPECTED_DOMAINS = {
    "SITE-01": "WhatsYourRashi.in",
    "SITE-02": "ApkiRashi.com",
    "SITE-03": "DailyRashi360.com",
    "SITE-04": "ZodiacDaily.in",
    "SITE-05": "DailyHoroscope360.com",
    "SITE-06": "MyHoroscope360.com",
    "SITE-07": "AstroToday360.com",
    "SITE-08": "ApkiKundli.com",
    "SITE-09": "MatchYourKundli.com",
    "SITE-10": "ApkaNakshatra.com",
    "SITE-11": "JaniyePanchang.com",
    "SITE-12": "RashiRemedies.com",
    "SITE-13": "ApkaPandit.in",
    "SITE-14": "VastuShastra360.in",
}

checks: list[dict[str, object]] = []


def check(name: str, ok: bool, detail: str = "") -> None:
    checks.append({"check": name, "result": "PASS" if ok else "FAIL", "detail": detail})


def normalize_sql(text: str) -> str:
    text = re.sub(r"--[^\n]*", " ", text)
    return re.sub(r"\s+", " ", text).strip().lower()


files = sorted(MIG.glob("*.sql"))
check("migration_inventory_exact", [p.name for p in files] == EXPECTED_MIGRATIONS, ",".join(p.name for p in files))
all_sql = "\n".join(p.read_text() for p in files)

# Table inventory and exact DOC-08 column/type/nullability contract.
table_blocks: dict[str, str] = {}
for match in re.finditer(r"(?is)CREATE TABLE\s+([a-z_][a-z0-9_]*)\s*\((.*?)\n\);", all_sql):
    table_blocks[match.group(1)] = match.group(2)
check("table_inventory_33", set(table_blocks) == set(CONTRACT["tables"]), f"found={len(table_blocks)}")
check("table_scope_split_20_13", len(SITE_TABLES) == 20 and len(GLOBAL_TABLES) == 13)

actual_columns: dict[str, dict[str, tuple[str, bool]]] = {}
for table, block in table_blocks.items():
    cols: dict[str, tuple[str, bool]] = {}
    for raw in block.splitlines():
        line = raw.strip().rstrip(",")
        if not line or line.upper().startswith("CONSTRAINT "):
            continue
        m = re.match(
            r"([a-z_][a-z0-9_]*)\s+"
            r"(timestamp without time zone|char\(64\)|text\[\]|timestamptz|uuid|text|boolean|bigint|integer|smallint|jsonb)(?=\s|$)(.*)",
            line,
            re.I,
        )
        if not m:
            continue
        typ = m.group(2).lower()
        typ = {"char(64)": "character(64)", "timestamptz": "timestamp with time zone"}.get(typ, typ)
        nullable = re.search(r"\bNOT\s+NULL\b", m.group(3), re.I) is None
        cols[m.group(1)] = (typ, nullable)
    actual_columns[table] = cols

# Forward-only migrations may extend existing canonical tables. Apply ADD COLUMN clauses to
# the source-level column model instead of rewriting historical CREATE TABLE migrations.
for match in re.finditer(
    r"(?is)ALTER TABLE\s+([a-z_][a-z0-9_]*)\s+ADD COLUMN\s+([a-z_][a-z0-9_]*)\s+"
    r"(timestamp without time zone|char\(64\)|text\[\]|timestamptz|uuid|text|boolean|bigint|integer|smallint|jsonb)(?=\s|;)(.*?);",
    all_sql,
):
    table, column, typ, tail = match.groups()
    typ = typ.lower()
    typ = {"char(64)": "character(64)", "timestamptz": "timestamp with time zone"}.get(typ, typ)
    nullable = re.search(r"\bNOT\s+NULL\b", tail, re.I) is None
    # A later ALTER COLUMN ... SET NOT NULL overrides ADD COLUMN nullability.
    set_not_null = re.search(
        rf"(?is)ALTER TABLE\s+{re.escape(table)}\s+ALTER COLUMN\s+{re.escape(column)}\s+SET NOT NULL",
        all_sql,
    )
    if set_not_null:
        nullable = False
    actual_columns.setdefault(table, {})[column] = (typ, nullable)

expected_column_count = 0
for table, spec in CONTRACT["tables"].items():
    expected = {c: (v["type"], v["nullable"]) for c, v in spec["columns"].items()}
    expected_column_count += len(expected)
    actual = actual_columns.get(table, {})
    check(
        f"columns_{table}",
        actual == expected,
        f"missing={sorted(set(expected)-set(actual))} extra={sorted(set(actual)-set(expected))} mismatched={sorted(c for c in set(expected)&set(actual) if expected[c]!=actual[c])}",
    )
check("column_inventory_329", expected_column_count == 329 and sum(map(len, actual_columns.values())) == 329)

# Every SITE table owns a NOT NULL site_id physically.
for table in sorted(SITE_TABLES):
    check(f"site_owner_{table}", actual_columns[table].get("site_id") == ("uuid", False))

# Constraint families and required same-site composite relationships.
constraint_kinds = {
    "pk": len(re.findall(r"(?i)CONSTRAINT\s+[a-z_][a-z0-9_]*\s+PRIMARY\s+KEY", all_sql)),
    "uq": len(re.findall(r"(?i)CONSTRAINT\s+[a-z_][a-z0-9_]*\s+UNIQUE", all_sql)),
    "fk": len(re.findall(r"(?i)CONSTRAINT\s+[a-z_][a-z0-9_]*\s+FOREIGN\s+KEY", all_sql)),
    "ck": len(re.findall(r"(?i)CONSTRAINT\s+[a-z_][a-z0-9_]*\s+CHECK", all_sql)),
}
# Forward migrations keep historical definitions in source; subtract constraints explicitly dropped.
constraint_kinds["uq"] -= len(re.findall(r"(?i)DROP\s+CONSTRAINT\s+uq_[a-z_][a-z0-9_]*", all_sql))
check("primary_key_count", constraint_kinds["pk"] == 33, str(constraint_kinds))
check("unique_constraint_count", constraint_kinds["uq"] == 39, str(constraint_kinds))
check("foreign_key_count", constraint_kinds["fk"] == 73, str(constraint_kinds))
check("check_constraint_count", constraint_kinds["ck"] == 81, str(constraint_kinds))
check("named_constraint_count", sum(constraint_kinds.values()) == 226, str(constraint_kinds))

norm = normalize_sql(all_sql)
same_site_fragments = [
    "foreign key (site_id, parent_category_id) references categories(site_id, category_id)",
    "foreign key (site_id, merged_into_tag_id) references tags(site_id, tag_id)",
    "foreign key (site_id, media_id) references media(site_id, media_id)",
    "foreign key (site_id, photo_media_id) references media(site_id, media_id)",
    "foreign key (site_id, author_site_profile_id) references author_site_profiles(site_id, author_profile_id)",
    "foreign key (site_id, featured_media_id) references media(site_id, media_id)",
    "foreign key (site_id, og_image_media_id) references media(site_id, media_id)",
    "foreign key (site_id, post_id) references posts(site_id, post_id)",
    "foreign key (site_id, category_id) references categories(site_id, category_id)",
    "foreign key (site_id, tag_id) references tags(site_id, tag_id)",
    "foreign key (site_id, related_post_id) references posts(site_id, post_id)",
    "foreign key (site_id, author_profile_id) references author_site_profiles(site_id, author_profile_id)",
    "foreign key (site_id, menu_id) references navigation_menus(site_id, menu_id)",
    "foreign key (site_id, menu_id, parent_item_id) references navigation_items(site_id, menu_id, item_id)",
    "foreign key (site_id, target_post_id) references posts(site_id, post_id)",
    "foreign key (site_id, target_category_id) references categories(site_id, category_id)",
    "foreign key (site_id, target_tag_id) references tags(site_id, tag_id)",
    "foreign key (site_id, target_author_profile_id) references author_site_profiles(site_id, author_profile_id)",
    "foreign key (site_id, section_id) references homepage_sections(site_id, section_id)",
    "foreign key (site_id, logo_media_id) references media(site_id, media_id)",
    "foreign key (site_id, favicon_media_id) references media(site_id, media_id)",
    "foreign key (site_id, default_social_image_media_id) references media(site_id, media_id)",
    "foreign key (site_id, homepage_lead_post_id) references posts(site_id, post_id)",
]
for fragment in same_site_fragments:
    check("same_site_fk_" + hashlib.sha1(fragment.encode()).hexdigest()[:10], fragment in norm, fragment)
check("post_url_history_survives_post_delete", "foreign key (site_id, post_id) references posts(site_id, post_id)" not in normalize_sql(table_blocks["post_url_history"]))

# Exact DOC-08 Section 20 baseline index / uniqueness object registry.
for item in CONTRACT["required_baseline_indexes"]:
    check(f"baseline_index_{item['name']}", re.search(rf"\b{re.escape(item['name'])}\b", all_sql) is not None, item["table"])
check("baseline_index_registry_72", len(CONTRACT["required_baseline_indexes"]) == 72)

# RLS + immutability inventory is exactly the canonical 20 SITE tables.
rls_sql = (MIG / EXPECTED_MIGRATIONS[12]).read_text()
rls_array = re.search(r"FOREACH t IN ARRAY ARRAY\[(.*?)\] LOOP", rls_sql, re.S)
rls_tables = set(re.findall(r"'([a-z_]+)'", rls_array.group(1))) if rls_array else set()
check("rls_table_set_exact", rls_tables == SITE_TABLES, f"found={sorted(rls_tables)}")
check("rls_enable_force", "ENABLE ROW LEVEL SECURITY" in rls_sql and "FORCE ROW LEVEL SECURITY" in rls_sql)
check("rls_using_with_check", "USING (site_id = app.current_site_id()) WITH CHECK (site_id = app.current_site_id())" in rls_sql)

immut_sql = (MIG / EXPECTED_MIGRATIONS[11]).read_text()
immut_array = re.search(r"FOREACH t IN ARRAY ARRAY\[(.*?)\] LOOP", immut_sql, re.S)
immut_tables = set(re.findall(r"'([a-z_]+)'", immut_array.group(1))) if immut_array else set()
check("site_id_immutability_table_set_exact", immut_tables == SITE_TABLES)
check("role_integrity_trigger_present", "trg_roles__integrity" in immut_sql and "enforce_role_integrity" in immut_sql)

boot = (MIG / EXPECTED_MIGRATIONS[0]).read_text()
check("site_context_helper_fail_closed", "NULLIF(current_setting('app.site_id', true), '')::uuid" in boot)
check("migrator_bypass_only_deployment_role", re.search(r"ALTER ROLE db_migrator .*BYPASSRLS", boot) is not None)
check("site_runtime_nobypass", re.search(r"ALTER ROLE db_site_runtime .*NOBYPASSRLS", boot) is not None)
check("platform_runtime_nobypass", re.search(r"ALTER ROLE db_platform_runtime .*NOBYPASSRLS", boot) is not None)
check("global_read_owner_nologin", re.search(r"ALTER ROLE db_global_read_owner NOLOGIN .*BYPASSRLS", boot) is not None)

# Runtime grants preserve DOC-08 retention/immutability restrictions.
grants = normalize_sql((MIG / EXPECTED_MIGRATIONS[13]).read_text())
check("runtime_no_public_schema_create", "revoke create on schema public from public" in grants)
check("runtime_public_schema_usage_explicit", "grant usage on schema public to db_site_runtime, db_platform_runtime" in grants)
check("site_runtime_audit_append", "grant insert on audit_events to db_site_runtime" in grants)
for table in ("categories", "tags", "media", "author_site_profiles"):
    check(f"soft_retained_no_delete_{table}", not re.search(rf"grant [^;]*delete[^;]*\b{table}\b[^;]* to db_site_runtime", grants))
check("post_runtime_delete_allowed", re.search(r"grant select, insert, update, delete on posts,", grants) is not None)
check("revisions_runtime_immutable", "grant select, insert on post_revisions to db_site_runtime" in grants)
check("audit_runtime_append_only", "grant select, insert on audit_events to db_platform_runtime" in grants)
check("homepage_registry_no_insert_delete", "grant select, update on homepage_sections to db_site_runtime" in grants)
check("platform_setting_registry_no_insert_delete", "grant select, update on platform_settings to db_platform_runtime" in grants)
for table in sorted(SITE_TABLES):
    check(f"platform_no_site_grant_{table}", not re.search(rf"grant [^;]*\b{table}\b[^;]* to db_platform_runtime", grants))

# Seed registries.
permission_seed = (SEEDS / "permissions.sql").read_text()
perm_block = permission_seed.split("INSERT INTO permissions", 1)[1].split("ON CONFLICT (permission_key)", 1)[0]
perm_rows = re.findall(r"\('([^']+)',\s*'(SITE|GLOBAL)'", perm_block)
check("permission_seed_69", len(perm_rows) == 69, f"found={len(perm_rows)}")
check("permission_seed_44_25", sum(s == "SITE" for _, s in perm_rows) == 44 and sum(s == "GLOBAL" for _, s in perm_rows) == 25)
check("permission_keys_unique", len({k for k, _ in perm_rows}) == 69)
expected_permission_registry = {
    (row["permission_key"], row["scope"], row["module_key"], row["risk"])
    for row in CONTRACT["permission_registry"]
}
seed_permission_registry = set(
    re.findall(
        r"\('([^']+)',\s*'(SITE|GLOBAL)',\s*'([^']+)',\s*'(STANDARD|SENSITIVE|DESTRUCTIVE)'",
        perm_block,
    )
)
check("permission_registry_exact_source", seed_permission_registry == expected_permission_registry, f"found={len(seed_permission_registry)} expected={len(expected_permission_registry)}")
check("permission_seed_no_wildcard_or_forbidden", all("*" not in k for k, _ in perm_rows) and not ({"tags.merge", "authors.reassign", "roles.duplicate"} & {k for k, _ in perm_rows}))
prereq_block = permission_seed.split("INSERT INTO permission_prerequisites", 1)[1].split("ON CONFLICT (permission_key, required_permission_key)", 1)[0]
prereqs = re.findall(r"\('([^']+)',\s*'([^']+)'\)", prereq_block)
check("permission_prerequisite_57", len(prereqs) == 57, f"found={len(prereqs)}")
expected_prereqs = {
    (row["permission_key"], row["required_permission_key"])
    for row in CONTRACT["permission_prerequisites"]
}
check("permission_prerequisites_exact_source", set(prereqs) == expected_prereqs)
check("permission_prerequisites_known", all(a in {k for k, _ in perm_rows} and b in {k for k, _ in perm_rows} and a != b for a, b in prereqs))

estate = (SEEDS / "initial-sites.sql").read_text()
for idx, (key, domain) in enumerate(EXPECTED_DOMAINS.items(), 1):
    stable = f"10000000-0000-4000-8000-{idx:012d}"
    check(f"initial_site_{key}", key in estate and stable in estate and domain in estate)
check("timezone_values_are_external_inputs", all(f"app.bootstrap_timezone_site_{i:02d}" in estate for i in range(1, 15)))
check("no_invented_fixed_timezone", "Asia/Kolkata" not in estate and "'UTC'" not in estate)
check("initial_site_settings_seed", "INSERT INTO site_settings(site_id)" in estate)
check("initial_header_footer_seed", "('HEADER'),('FOOTER')" in estate)

migration_seed = (MIG / EXPECTED_MIGRATIONS[14]).read_text()
check("migration_seed_permission_registry_matches", {k for k, _ in re.findall(r"\('([^']+)',\s*'(SITE|GLOBAL)'", migration_seed)} == {k for k, _ in perm_rows})
migration_perm_block = migration_seed.split("INSERT INTO permissions", 1)[1].split("ON CONFLICT (permission_key)", 1)[0]
migration_permission_registry = set(re.findall(r"\('([^']+)',\s*'(SITE|GLOBAL)',\s*'([^']+)',\s*'(STANDARD|SENSITIVE|DESTRUCTIVE)'", migration_perm_block))
check("migration_seed_permission_registry_exact_source", migration_permission_registry == expected_permission_registry)
migration_prereq_block = migration_seed.split("INSERT INTO permission_prerequisites", 1)[1].split("ON CONFLICT (permission_key, required_permission_key)", 1)[0]
migration_prereqs = set(re.findall(r"\('([^']+)',\s*'([^']+)'\)", migration_prereq_block))
check("migration_seed_prerequisites_exact_source", migration_prereqs == expected_prereqs)
for key, domain in EXPECTED_DOMAINS.items():
    check(f"migration_seed_domain_{key}", key in migration_seed and domain in migration_seed)

bootstrap = (SEEDS / "bootstrap_owner.sql").read_text()
check("bootstrap_owner_external_identity", "app.bootstrap_owner_email" in bootstrap and "app.bootstrap_owner_display_name" in bootstrap)
check("bootstrap_owner_no_default_secret", not re.search(r"(?i)password|secret|api[_-]?key", re.sub(r"--[^\n]*", "", bootstrap)))
check("bootstrap_owner_initializes_access_levels", "app.ensure_system_access_levels()" in bootstrap)

launch_access = (MIG / EXPECTED_MIGRATIONS[18]).read_text()
check("ordinary_global_assignment_database_guard", "trg_account_global_role_assignments__super_admin_only" in launch_access)
check("system_access_levels_database_protected", "trg_roles__protect_system_access_levels" in launch_access)
check("system_access_levels_idempotent_initializer", "app.ensure_system_access_levels()" in launch_access)
check("content_editor_no_destructive_media", "'media.replace','media.delete'" not in launch_access.split("INSERT INTO public.role_permissions", 2)[1])
universal_foundation = (MIG / EXPECTED_MIGRATIONS[19]).read_text()
check("wu01_site_settings_only", "ALTER TABLE site_settings" in universal_foundation and "CREATE TABLE" not in universal_foundation)
def protected_permission_sets(source: str) -> list[set[str]]:
    arrays = re.findall(r"WHERE permission_key = ANY \(ARRAY\[(.*?)\]\)", source, re.S)
    return [set(re.findall(r"'([^']+)'", array)) for array in arrays]


old_roles = protected_permission_sets(launch_access)
new_roles = protected_permission_sets(universal_foundation)
check("wu01_exact_protected_role_delta", len(old_roles) == len(new_roles) == 2
      and new_roles[0] == old_roles[0] | {"tags.view"}
      and new_roles[1] == old_roles[1] | {"tags.view", "tags.create", "tags.edit", "tags.delete"})
local_bootstrap = (ROOT / "infrastructure/scripts/bootstrap_local.py").read_text()
check("wu01_local_role_seed_tags", '"tags.view"' in local_bootstrap
      and all(f'"tags.{action}"' in local_bootstrap for action in ("create", "edit", "delete")))

dev = (SEEDS / "development-only.sql").read_text()
check("development_fixture_guard", "app.environment" in dev and "development" in dev)
isolation = (SEEDS / "isolation-fixtures.sql").read_text()
check("isolation_fixture_guard", "app.environment" in isolation and "test" in isolation)
for token in ["future-of-ai", "Technology", "'AI'", "Test Author", "hero.jpg", "sites/SITE-01/test/hero.jpg", "sites/SITE-02/test/hero.jpg"]:
    check("collision_fixture_" + hashlib.sha1(token.encode()).hexdigest()[:8], token in isolation, token)

# Verification and migration harness required by DOC-24 ordering.
for path in ["apply-chain.sql", "apply_from_empty.sh", "apply_test_fixtures.sh", "verify-schema.sql", "verify-rls.sql", "verify-seeds.sql", "verify-behavior.sql", "verify_runtime.py"]:
    check(f"verification_artifact_{path}", (VERIFY / path).is_file())
apply_chain = (VERIFY / "apply-chain.sql").read_text()
positions = [apply_chain.find(name) for name in EXPECTED_MIGRATIONS]
check("apply_chain_exact_order", all(p >= 0 for p in positions) and positions == sorted(positions))
check("apply_chain_advisory_lock", "pg_advisory_lock" in apply_chain and "pg_advisory_unlock" in apply_chain)
check("apply_chain_migrator_role", "SET ROLE db_migrator" in apply_chain)

# Adapter boundary: SQLAlchemy/Psycopg only for access, no DDL/schema authority or HTTP/business provider.
adapter_code = "\n".join(p.read_text(errors="ignore") for p in (ADAPTER / "src").rglob("*.py"))
check("adapter_no_schema_push", not re.search(r"\b(create_all|drop_all)\s*\(", adapter_code))
check("adapter_transaction_local_site", "set_config('app.site_id', :site_id, true)" in adapter_code)
check("adapter_platform_context_clear", "set_config('app.site_id', '', true)" in adapter_code)
check("adapter_no_http_framework", not re.search(r"(?i)\bfastapi\b", adapter_code))
check("adapter_no_ai_provider", not re.search(r"(?i)\b(openai|anthropic|langchain|litellm)\b", adapter_code))
check("adapter_cas_version", "and version=:expected_version" in normalize_sql(adapter_code) and "version = version + 1" in adapter_code)
check("adapter_jsonb_parameterization", "cast(:v_{column} as jsonb)" in normalize_sql(adapter_code) and "cast(:details_json as jsonb)" in normalize_sql(adapter_code))
check("adapter_site_audit_context_bound", "'site', app.current_site_id()" in normalize_sql(adapter_code))
check("adapter_combined_api_pool_cap", "combined api replica pool budget may not exceed 20 connections" in adapter_code.lower())
pyproject = (ADAPTER / "pyproject.toml").read_text()
check("adapter_dependencies_sqlalchemy_psycopg", "SQLAlchemy" in pyproject and "psycopg" in pyproject)
check("no_second_schema_sql", not (ROOT / "database" / "schema.sql").exists())
check("no_ai_in_owned_files", not re.search(r"(?i)\b(openai|anthropic|langchain|litellm)\b", all_sql + permission_seed + estate + adapter_code))

failed = [c for c in checks if c["result"] == "FAIL"]
result = {"overall": "PASS" if not failed else "FAIL", "check_count": len(checks), "failed_count": len(failed), "checks": checks}
print(json.dumps(result, indent=2))
sys.exit(0 if not failed else 1)
