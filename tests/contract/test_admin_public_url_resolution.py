from __future__ import annotations

import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
for rel in [
    "packages/python/bp-adapters-postgres/src",
    "packages/python/bp-domain/src",
    "packages/python/bp-ports/src",
]:
    sys.path.insert(0, str(ROOT / rel))

from bp_adapters.postgres.runtime import _preferred_public_url


def test_staging_admin_uses_matching_active_temporary_alias():
    domains = [
        ("ApkiRashi.com", True),
        ("yz6xuvrpj3v7nzamccow2pek.187.127.169.228.sslip.io", False),
    ]
    assert _preferred_public_url(
        "ecst95lbadgfzh4dyga1tczv.187.127.169.228.sslip.io", domains
    ) == "http://yz6xuvrpj3v7nzamccow2pek.187.127.169.228.sslip.io"


def test_production_admin_uses_current_canonical_domain():
    domains = [
        ("ApkiRashi.com", True),
        ("yz6xuvrpj3v7nzamccow2pek.187.127.169.228.sslip.io", False),
    ]
    assert _preferred_public_url("admin.nakshatrauniverse.com", domains) == "https://ApkiRashi.com"


def test_canonical_domain_change_requires_no_user_level_url_change():
    before = [("ApkiRashi.com", True)]
    after = [("NewApkiRashi.com", True), ("ApkiRashi.com", False)]
    assert _preferred_public_url("admin.nakshatrauniverse.com", before) == "https://ApkiRashi.com"
    assert _preferred_public_url("admin.nakshatrauniverse.com", after) == "https://NewApkiRashi.com"
