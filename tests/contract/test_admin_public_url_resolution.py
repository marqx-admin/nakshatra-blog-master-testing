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
    ) == "https://yz6xuvrpj3v7nzamccow2pek.187.127.169.228.sslip.io"


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


def test_local_admin_header_uses_only_server_registered_local_temporary_destination():
    from bp_api.http.admin_site.routes import _local_temporary_destination
    url = "http://site-100.preview.localhost:3015/"
    assert _local_temporary_destination("development", "localhost:5173", url) == url
    assert _local_temporary_destination("test", "127.0.0.1:8001", url) == url
    assert _local_temporary_destination("production", "localhost", url) is None
    assert _local_temporary_destination("development", "admin.example", url) is None
    assert _local_temporary_destination("development", "localhost", None) is None
    assert _local_temporary_destination("development", "localhost", "https://production.example/") is None
