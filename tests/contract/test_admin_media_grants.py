from types import SimpleNamespace
from urllib.parse import parse_qs, urlsplit

import pytest

from bp_api.http.admin_site.derived_routes import (
    _admin_media_url_with_grant,
    _secure_admin_media_payload,
)

MEDIA_ORIGIN = "https://media.example"
MEDIA_ID = "32000000-0000-4000-8000-000000000001"


def test_admin_media_grant_is_attached_only_to_the_expected_media_url():
    source = f"{MEDIA_ORIGIN}/m/SITE-01/{MEDIA_ID}/native_webp.webp?v=7"
    secured = _admin_media_url_with_grant(
        source,
        "grant-1",
        media_origin=MEDIA_ORIGIN,
        site_key="SITE-01",
        media_id=MEDIA_ID,
    )

    query = parse_qs(urlsplit(secured).query)
    assert query == {"v": ["7"], "admin_grant": ["grant-1"]}


def test_admin_media_grant_is_not_attached_to_external_or_mismatched_urls():
    external = f"https://evil.example/m/SITE-01/{MEDIA_ID}/native_webp.webp"
    wrong_site = f"{MEDIA_ORIGIN}/m/SITE-02/{MEDIA_ID}/native_webp.webp"
    wrong_media = (
        f"{MEDIA_ORIGIN}/m/SITE-01/32000000-0000-4000-8000-000000000002/"
        "native_webp.webp"
    )

    for source in (external, wrong_site, wrong_media):
        assert _admin_media_url_with_grant(
            source,
            "secret-grant",
            media_origin=MEDIA_ORIGIN,
            site_key="SITE-01",
            media_id=MEDIA_ID,
        ) == source


@pytest.mark.asyncio
async def test_admin_media_list_payload_receives_scoped_rendering_grants():
    class _Sessions:
        async def issue_media_grant(self, session, *, site_id, site_key, media_id):
            assert session == "session-record"
            assert (site_id, site_key) == ("site-uuid-01", "SITE-01")
            return f"grant-for-{media_id}"

    payload = {
        "items": [
            {
                "media_id": MEDIA_ID,
                "public_url": f"{MEDIA_ORIGIN}/m/SITE-01/{MEDIA_ID}/native_webp.webp?v=7",
            }
        ],
        "page": {"page": 1, "page_size": 24, "has_more": False},
    }
    secured = await _secure_admin_media_payload(
        payload,
        sessions=_Sessions(),
        session="session-record",
        context=SimpleNamespace(site_id="site-uuid-01", site_key="SITE-01"),
        media_origin=MEDIA_ORIGIN,
    )

    query = parse_qs(urlsplit(secured["items"][0]["public_url"]).query)
    assert query["admin_grant"] == [f"grant-for-{MEDIA_ID}"]
    assert payload["items"][0]["public_url"].endswith("?v=7")
