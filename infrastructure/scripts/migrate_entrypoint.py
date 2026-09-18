#!/usr/bin/env python3
"""Run canonical migrations using the persistent Coolify migration ledger."""

from __future__ import annotations

import os
from pathlib import Path

from migrate import main as migrate_main

LEDGER = Path(os.getenv("BP_MIGRATION_LEDGER", "/var/lib/bp-migrations/current.json"))


def main() -> int:
    import sys

    arguments = [
        "migrate.py",
        "--manifest-out",
        str(LEDGER),
    ]
    if LEDGER.is_file():
        arguments.extend(("--applied-ledger", str(LEDGER)))
    sys.argv = arguments
    return migrate_main()


if __name__ == "__main__":
    raise SystemExit(main())
