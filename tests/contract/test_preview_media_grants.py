from bp_api.http.public.routes import (
    _attach_preview_media_grants,
    _preview_media_references,
)


MEDIA_ORIGIN = "https://media.example"


def test_preview_media_grants_are_attached_only_to_matching_media_objects():
    media_id = "32000000-0000-4000-8000-000000000001"
    other_id = "32000000-0000-4000-8000-000000000002"

    body = {
        "featured_media": {
            "media_id": media_id,
            "url": f"{MEDIA_ORIGIN}/m/SITE-01/{media_id}/native_webp.webp?v=7",
            "variants": [
                {
                    "url": f"{MEDIA_ORIGIN}/m/SITE-01/{media_id}/w640_webp.webp?v=7"
                },
                {
                    "url": f"{MEDIA_ORIGIN}/m/SITE-01/{other_id}/native_webp.webp?v=8"
                },
            ],
        }
    }

    assert _preview_media_references(
        body, media_origin=MEDIA_ORIGIN
    ) == {("SITE-01", media_id)}

    rewritten = _attach_preview_media_grants(
        body,
        {("SITE-01", media_id): "grant-1"},
        media_origin=MEDIA_ORIGIN,
    )

    assert "preview_grant=grant-1" in rewritten["featured_media"]["url"]
    assert "preview_grant=grant-1" in rewritten["featured_media"]["variants"][0]["url"]
    assert "preview_grant" not in rewritten["featured_media"]["variants"][1]["url"]


def test_preview_media_grant_never_leaks_to_external_origin():
    media_id = "32000000-0000-4000-8000-000000000001"

    body = {
        "image": {
            "media_id": media_id,
            "url": f"https://evil.example/m/SITE-01/{media_id}/native_webp.webp",
        }
    }

    assert _preview_media_references(
        body, media_origin=MEDIA_ORIGIN
    ) == set()

    rewritten = _attach_preview_media_grants(
        body,
        {("SITE-01", media_id): "secret-grant"},
        media_origin=MEDIA_ORIGIN,
    )

    assert rewritten == body
    assert "preview_grant" not in rewritten["image"]["url"]


def test_preview_media_grant_does_not_modify_article_text_or_normal_links():
    media_id = "32000000-0000-4000-8000-000000000001"
    media_url = f"{MEDIA_ORIGIN}/m/SITE-01/{media_id}/native_webp.webp"

    body = {
        "paragraph": {"text": f"Read this reference: {media_url}"},
        "link": {"url": media_url},
    }

    assert _preview_media_references(
        body, media_origin=MEDIA_ORIGIN
    ) == set()

    rewritten = _attach_preview_media_grants(
        body,
        {("SITE-01", media_id): "secret-grant"},
        media_origin=MEDIA_ORIGIN,
    )

    assert rewritten == body
