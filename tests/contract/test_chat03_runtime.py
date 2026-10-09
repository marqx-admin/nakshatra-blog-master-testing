from __future__ import annotations

from dataclasses import dataclass

from fastapi.testclient import TestClient

from bp_api.app import create_app
from bp_api.media_delivery import DeliveredMedia
from bp_api.config import Settings
from tests.e2e.test_chat03_auth import PASSWORD, build


class _PrivateMediaDelivery:
    async def get(self, **kwargs):
        assert kwargs["preview_authorized"] is True
        return DeliveredMedia(b"private-image", "image/webp", "private-etag")


class _PreviewMediaValidator:
    async def validate_media_grant(self, raw_grant, *, site_key, media_id):
        return raw_grant == "valid-preview" and site_key == "SITE-01" and media_id == "media-1"


class _AdminMediaValidator:
    async def validate_media_grant(self, raw_grant, *, site_key, media_id):
        return raw_grant == "valid-admin" and site_key == "SITE-01" and media_id == "media-1"


def test_cors_preflight_is_exact_origin_credentialed_and_bounded():
    app, *_ = build()
    client = TestClient(app, base_url="https://admin.test")
    ok = client.options(
        "/api/v1/auth/login",
        headers={
            "Origin": "https://admin.test",
            "Access-Control-Request-Method": "POST",
            "Access-Control-Request-Headers": "content-type,x-request-id",
        },
    )
    assert ok.status_code == 204
    assert ok.headers["access-control-allow-origin"] == "https://admin.test"
    assert ok.headers["access-control-allow-credentials"] == "true"
    assert ok.headers["access-control-max-age"] == "600"
    assert "Origin" in ok.headers["vary"]

    denied = client.options(
        "/api/v1/auth/login",
        headers={
            "Origin": "https://evil.test",
            "Access-Control-Request-Method": "POST",
        },
    )
    assert denied.status_code == 403
    assert "access-control-allow-origin" not in denied.headers


def test_security_headers_and_no_store_are_applied_to_auth_and_preview_surfaces():
    app, *_ = build()
    client = TestClient(app, base_url="https://admin.test")
    response = client.post("/api/v1/auth/login", json={"email": "admin@example.test", "password": PASSWORD})
    assert response.status_code == 200
    assert response.headers["cache-control"] == "no-store"
    assert response.headers["x-content-type-options"] == "nosniff"
    assert response.headers["referrer-policy"] == "same-origin"
    assert response.headers["strict-transport-security"] == "max-age=31536000"
    csp = response.headers["content-security-policy"]
    assert "object-src 'none'" in csp and "frame-ancestors 'none'" in csp and "unsafe-eval" not in csp
    assert "camera=()" in response.headers["permissions-policy"]

    preview = client.get(
        "/api/v1/public/preview/posts/00000000-0000-0000-0000-000000000001",
        headers={"Origin": "https://evil.test"},
    )
    assert preview.status_code == 403
    assert preview.headers["cache-control"] == "no-store"
    assert preview.headers["referrer-policy"] == "no-referrer"


def test_private_media_conditional_response_remains_private_and_no_store():
    app, services, *_ = build()
    services.media_delivery = _PrivateMediaDelivery()
    services.preview_authority = _PreviewMediaValidator()
    client = TestClient(app, base_url="https://admin.test")
    path = "/m/SITE-01/media-1/native_webp.webp?preview_grant=valid-preview"

    first = client.get(path)
    assert first.status_code == 200
    assert first.headers["cache-control"] == "no-store, private"
    assert first.headers["etag"] == '"private-etag"'

    conditional = client.get(path, headers={"If-None-Match": '"private-etag"'})
    assert conditional.status_code == 304
    assert conditional.headers["cache-control"] == "no-store, private"
    assert conditional.headers["etag"] == '"private-etag"'


def test_admin_media_grant_uses_the_same_private_delivery_boundary():
    app, services, *_ = build()
    services.media_delivery = _PrivateMediaDelivery()
    services.sessions = _AdminMediaValidator()
    client = TestClient(app, base_url="https://admin.test")

    allowed = client.get(
        "/m/SITE-01/media-1/native_webp.webp?admin_grant=valid-admin"
    )
    assert allowed.status_code == 200
    assert allowed.headers["cache-control"] == "no-store, private"

    denied = client.get(
        "/m/SITE-01/media-1/native_webp.webp?admin_grant=wrong"
    )
    assert denied.status_code == 404
    assert denied.headers["cache-control"] == "no-store"


def test_error_envelope_never_echoes_sensitive_request_values():
    app, *_ = build()
    client = TestClient(app, base_url="https://admin.test")
    secret = "this-password-must-not-be-reflected"
    response = client.post(
        "/api/v1/auth/login",
        json={"email": "nobody@example.test", "password": secret, "unexpected": "raw-secret-value"},
    )
    assert response.status_code == 422
    rendered = response.text
    assert secret not in rendered
    assert "raw-secret-value" not in rendered
    assert response.json()["error"]["code"] == "VALIDATION_FAILED"


def test_request_correlation_accepts_bounded_id_and_replaces_oversize_input():
    app, *_ = build()
    client = TestClient(app, base_url="https://admin.test")
    good = client.post(
        "/api/v1/auth/login",
        json={"email": "nobody@example.test", "password": PASSWORD},
        headers={"X-Request-ID": "caller-123"},
    )
    assert good.headers["x-request-id"] == "caller-123"
    oversized = client.post(
        "/api/v1/auth/login",
        json={"email": "nobody2@example.test", "password": PASSWORD},
        headers={"X-Request-ID": "x" * 129},
    )
    assert oversized.headers["x-request-id"] != "x" * 129
    assert 1 <= len(oversized.headers["x-request-id"]) <= 128


def test_unknown_public_host_returns_neutral_contract_valid_404_without_tenant_fallback():
    app, *_ = build()
    client = TestClient(app, base_url="https://unknown.test")
    response = client.get("/api/v1/public/page", params={"path": "/article/hidden"})
    assert response.status_code == 404
    body = response.json()
    assert body["context"]["page_id"] == "PUB-SYS-404-01"
    assert "site" not in body and "site_id" not in response.text


def test_protected_http_rejects_non_https_when_enabled():
    app, services, *_ = build()
    settings = Settings(
        "test",
        "contracts/http/BLOG-DOC-15_openapi_v1.0-RC12.yaml",
        ("http://admin.test",),
        "http://admin.test/reset",
        True,
        invitation_setup_base_url="http://admin.test/setup",
    )
    app = create_app(settings=settings, services=services)
    client = TestClient(app, base_url="http://admin.test")
    response = client.post("/api/v1/auth/login", json={"email": "admin@example.test", "password": PASSWORD})
    assert response.status_code == 400
    assert response.json()["error"]["message"] == "HTTPS required."


class Lifecycle:
    def __init__(self, events): self.events = events
    async def start(self): self.events.append("start")
    async def close(self): self.events.append("close")


class Ready:
    async def check(self): return True, {"config": "ok", "postgres": "ok", "security_state": "ok"}


def test_lifespan_and_health_boundaries_are_explicit_and_outside_canonical_api():
    app, services, *_ = build()
    events = []
    services.lifecycle = (Lifecycle(events),)
    services.readiness = Ready()
    settings = Settings(
        "test",
        "contracts/http/BLOG-DOC-15_openapi_v1.0-RC12.yaml",
        ("https://admin.test",),
        "https://admin.test/reset",
        False,
        invitation_setup_base_url="https://admin.test/setup",
    )
    app = create_app(settings=settings, services=services)
    with TestClient(app, base_url="https://admin.test") as client:
        assert events == ["start"]
        assert client.get("/health/live").json() == {"status": "ok"}
        ready = client.get("/health/ready")
        assert ready.status_code == 200
        assert ready.json()["components"] == {"config": "ok", "postgres": "ok", "security_state": "ok"}
    assert events == ["start", "close"]
    assert all(getattr(route, "operation_id", None) is None for route in app.routes if route.path.startswith("/health/"))
