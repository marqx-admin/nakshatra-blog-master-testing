from __future__ import annotations

import sys
from pathlib import Path

from starlette.requests import Request

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / "apps/api/src"))
for package_src in (ROOT / "packages/python").glob("*/src"):
    sys.path.insert(0, str(package_src))

from bp_api.http.public.routes import _effective_public_host


def _request(*, client_host: str, host: str, override: str | None = None) -> Request:
    headers = [(b"host", host.encode())]
    if override is not None:
        headers.append((b"x-bp-public-host", override.encode()))
    return Request(
        {
            "type": "http",
            "asgi": {"version": "3.0"},
            "http_version": "1.1",
            "method": "GET",
            "scheme": "http",
            "path": "/api/v1/public/page",
            "raw_path": b"/api/v1/public/page",
            "query_string": b"",
            "headers": headers,
            "client": (client_host, 54321),
            "server": ("api", 8080),
        }
    )


def test_internal_site_ssr_preserves_public_host_in_production(monkeypatch):
    monkeypatch.setenv("BP_ENV", "production")
    request = _request(
        client_host="172.20.0.12",
        host="api:8080",
        override="site-02.staging.example",
    )
    assert _effective_public_host(request) == "site-02.staging.example"


def test_public_ingress_cannot_spoof_internal_public_host(monkeypatch):
    monkeypatch.setenv("BP_ENV", "production")
    request = _request(
        client_host="172.20.0.2",
        host="api-public.example",
        override="ApkiRashi.com",
    )
    assert _effective_public_host(request) == "api-public.example"


def test_public_client_cannot_use_internal_service_host_override(monkeypatch):
    monkeypatch.setenv("BP_ENV", "production")
    request = _request(
        client_host="8.8.8.8",
        host="api:8080",
        override="ApkiRashi.com",
    )
    assert _effective_public_host(request) == "api:8080"


def test_development_loopback_override_remains_supported(monkeypatch):
    monkeypatch.setenv("BP_ENV", "development")
    request = _request(
        client_host="127.0.0.1",
        host="127.0.0.1:8080",
        override="ApkiRashi.com",
    )
    assert _effective_public_host(request) == "ApkiRashi.com"
