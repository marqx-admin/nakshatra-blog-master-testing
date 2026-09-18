from __future__ import annotations

import importlib
import sys
from pathlib import Path

root = Path.cwd()
srcs = [root / "apps/api/src", root / "apps/worker/src"] + sorted((root / "packages/python").glob("*/src"))
for src in reversed(srcs):
    sys.path.insert(0, str(src))
modules = [
    "bp_api", "bp_worker", "bp_domain", "bp_ports", "bp_application", "bp_background_contracts",
    "bp_adapters.postgres", "bp_adapters.redis", "bp_adapters.queue", "bp_adapters.search",
    "bp_adapters.object_storage", "bp_adapters.media", "bp_adapters.security_store",
    "bp_adapters.secrets", "bp_adapters.mail", "bp_observability", "bp_test_support",
]
failed = []
for name in modules:
    try:
        importlib.import_module(name)
    except Exception as exc:  # noqa: BLE001
        failed.append(f"{name}: {exc}")
if failed:
    print("FAIL Python namespace resolution", file=sys.stderr)
    for item in failed:
        print(f"  {item}", file=sys.stderr)
    raise SystemExit(1)
print(f"PASS Python namespace resolution ({len(modules)} import namespaces)")
