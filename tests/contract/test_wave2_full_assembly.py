from __future__ import annotations

import hashlib
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
for rel in [
    "apps/api/src",
    "apps/worker/src",
    "packages/python/bp-domain/src",
    "packages/python/bp-application/src",
    "packages/python/bp-ports/src",
    "packages/python/bp-background-contracts/src",
    "packages/python/bp-adapters-postgres/src",
    "packages/python/bp-adapters-redis/src",
    "packages/python/bp-adapters-queue/src",
    "packages/python/bp-adapters-search/src",
    "packages/python/bp-adapters-object-storage/src",
    "packages/python/bp-adapters-media/src",
    "packages/python/bp-adapters-security-store/src",
    "packages/python/bp-adapters-secrets/src",
    "packages/python/bp-adapters-mail/src",
    "packages/python/bp-observability/src",
]:
    sys.path.insert(0, str(ROOT / rel))


def _sha256(path: Path) -> str:
    h = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            h.update(chunk)
    return h.hexdigest()


def test_wave2_full_assembly_static_guards():
    # One documented Hybrid Monorepo with exact deployable application classes.
    site_dirs = sorted(p.name for p in (ROOT / "apps/sites").iterdir() if p.is_dir())
    assert len(site_dirs) == 14
    assert (ROOT / "apps/admin").is_dir()
    assert (ROOT / "apps/api").is_dir()
    assert (ROOT / "apps/worker").is_dir()

    # Canonical RC8 source is the owner-authorized Wave-2 reconciliation authority.
    canon = ROOT / "contracts/http/BLOG-DOC-15_openapi_v1.0-RC8.yaml"
    assert _sha256(canon) == "bf577a463b4c5d8fdceddc2087f53216426ef88d67d8e1a0d22ccf819751cd00"

    # CHAT04 frozen content guards.
    from bp_domain.editorial import ARTICLE_BLOCK_TYPES, PERSISTED_POST_STATES

    assert len(ARTICLE_BLOCK_TYPES) == 12
    assert PERSISTED_POST_STATES == {"DRAFT", "SCHEDULED", "PUBLISHED", "ARCHIVED", "TRASH"}

    # CHAT05 frozen worker guards.
    from bp_background_contracts import CANONICAL_JOB_TYPES, CANONICAL_QUEUES, RETRY_PROFILES

    assert len(CANONICAL_QUEUES) == 6
    assert len(CANONICAL_JOB_TYPES) == 11
    assert len(RETRY_PROFILES) == 7

    # CHAT06 canonical Admin estate.
    pages = json.loads((ROOT / "apps/admin/src/app/router/admin-pages.json").read_text())
    assert len(pages) == 36
    site_pages = [p for p in pages if p["scope"] == "SITE"]
    global_pages = [p for p in pages if p["scope"] == "GLOBAL"]
    assert len(site_pages) == 20
    assert len(global_pages) == 16
    site_modules = {p["moduleId"] for p in site_pages}
    global_modules = {p["moduleId"] for p in global_pages}
    assert len(site_modules) == 12
    assert len(global_modules) == 7
    assert len(site_modules | global_modules) == 19

    # CHAT05 provider/adaptor implementation homes exist exactly where DOC-23/CHAT00 assigns them.
    required_dirs = [
        "packages/python/bp-background-contracts",
        "packages/python/bp-adapters-redis",
        "packages/python/bp-adapters-queue",
        "packages/python/bp-adapters-search",
        "packages/python/bp-adapters-object-storage",
        "packages/python/bp-adapters-media",
    ]
    for rel in required_dirs:
        assert (ROOT / rel).is_dir(), rel

    # No duplicate Python package trees for the CHAT05 integration roots.
    package_roots = {}
    for src in (ROOT / "packages/python").glob("*/src"):
        for child in src.iterdir():
            if child.is_dir() and (child / "__init__.py").exists():
                package_roots.setdefault(child.name, []).append(child)
    dupes = {name: paths for name, paths in package_roots.items() if len(paths) > 1}
    assert not dupes, dupes


def test_no_chat07_public_site_implementation_was_added_by_wave2_integration():
    # Wave-2 specialist ownership is backend/worker/Admin. Public-site source must remain the Wave-1/provisional baseline.
    baseline = ROOT.parent / "base/NAKSHATRA_MASTER_WAVE2_PROVISIONAL_HANDOFF/apps/sites"
    if not baseline.exists():
        # In a packaged candidate the external integration workspace is absent; the invariant is verified during packaging.
        return
    def digest_tree(root: Path):
        return {
            str(path.relative_to(root)): _sha256(path)
            for path in sorted(root.rglob("*"))
            if path.is_file()
        }
    assert digest_tree(ROOT / "apps/sites") == digest_tree(baseline)


def test_wave2_api_registration_is_canonical_without_duplicate_routes():
    import yaml
    from bp_api.app import create_app
    from bp_api.config import Settings
    from bp_api.http.site import CHAT04_OPERATION_IDS
    from bp_api.http.admin_site.derived_routes import CHAT05_OPERATION_IDS
    from bp_test_support.fastapi_routes import iter_effective_fastapi_routes, single_http_method

    canon = ROOT / "contracts/http/BLOG-DOC-15_openapi_v1.0-RC8.yaml"
    spec = yaml.safe_load(canon.read_text())
    canonical = {}
    for path, item in spec["paths"].items():
        for method, op in item.items():
            if isinstance(op, dict) and op.get("operationId"):
                canonical[op["operationId"]] = (method.upper(), path, int(op["x-success-status"]))

    app = create_app(
        settings=Settings("test", str(canon), ("https://admin.test",), "https://admin.test/reset", False)
    )
    registered = {}
    method_paths = []
    for route in iter_effective_fastapi_routes(app.routes):
        oid = getattr(route, "operation_id", None)
        if not oid or not route.path.startswith("/api/v1/"):
            continue
        method = single_http_method(route)
        key = (method, route.path)
        method_paths.append(key)
        assert oid not in registered, f"duplicate operationId {oid}"
        registered[oid] = (method, route.path, int(route.status_code))

    assert len(method_paths) == len(set(method_paths))
    assert len(registered) == 113
    assert len(CHAT04_OPERATION_IDS) == 42
    assert len(CHAT05_OPERATION_IDS) == 19
    assert set(CHAT04_OPERATION_IDS).issubset(registered)
    assert set(CHAT05_OPERATION_IDS).issubset(registered)
    assert all(registered[oid] == canonical[oid] for oid in registered)
    assert set(canonical) == set(registered)

    generated = app.openapi()
    generated_operation_ids = {
        op["operationId"]
        for item in generated["paths"].values()
        for op in item.values()
        if isinstance(op, dict) and op.get("operationId")
    }
    assert generated_operation_ids == set(canonical)
