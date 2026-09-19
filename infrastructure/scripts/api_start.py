#!/usr/bin/env python3
"""Prepare self-hosted security state and optional Super Admin before API startup."""

from __future__ import annotations

import os

from bootstrap_security_state import main as bootstrap_security_state
from bootstrap_super_admin import main as bootstrap_super_admin


def main() -> int:
    security_status = bootstrap_security_state()
    if security_status:
        return security_status
    admin_status = bootstrap_super_admin()
    if admin_status:
        return admin_status
    os.execvp("python", ["python", "-m", "bp_api"])
    return 127


if __name__ == "__main__":
    raise SystemExit(main())
