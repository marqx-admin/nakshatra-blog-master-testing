from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[2]
for rel in [
    "apps/api/src",
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
]:
    sys.path.insert(0, str(ROOT / rel))

import yaml

from bp_api.app import create_app
from bp_api.config import Settings
from bp_api.http.site import CHAT04_OPERATION_IDS
from bp_api.http.admin_site.derived_routes import CHAT05_OPERATION_IDS

CANON = ROOT / "contracts/http/BLOG-DOC-15_openapi_v1.0-RC11.yaml"


def _canonical_operations(spec):
    result = {}
    for path, item in spec["paths"].items():
        for method, op in item.items():
            if isinstance(op, dict) and op.get("operationId"):
                result[op["operationId"]] = (method.upper(), path, int(op["x-success-status"]))
    return result


def test_wave2_full_registers_chat03_chat04_chat05_without_route_collisions():
    spec = yaml.safe_load(CANON.read_text())
    app = create_app(
        settings=Settings("test", str(CANON), ("https://admin.test",), "https://admin.test/reset", False)
    )
    canonical = _canonical_operations(spec)
    registered = {}
    method_paths = []
    for route in app.routes:
        oid = getattr(route, "operation_id", None)
        if not oid or not route.path.startswith("/api/v1/"):
            continue
        method = next(iter(route.methods))
        key = (method, route.path)
        method_paths.append(key)
        assert oid not in registered, f"duplicate operationId {oid}"
        registered[oid] = (method, route.path, int(route.status_code))

    assert len(method_paths) == len(set(method_paths)), "duplicate method/path registration"
    assert len(registered) == 113
    assert set(CHAT04_OPERATION_IDS).issubset(registered)
    assert set(CHAT05_OPERATION_IDS).issubset(registered)

    expected_chat03 = {
        oid
        for oid in canonical
        if oid.startswith(("API15-PUB-", "API15-AUTH-", "API15-G-")) or oid in {"API15-S-001", "API15-S-002"}
    }
    assert len(expected_chat03) == 52
    expected = expected_chat03 | set(CHAT04_OPERATION_IDS) | set(CHAT05_OPERATION_IDS)
    assert set(registered) == expected
    assert all(registered[oid] == canonical[oid] for oid in registered)

    missing = set(canonical) - set(registered)
    assert not missing
