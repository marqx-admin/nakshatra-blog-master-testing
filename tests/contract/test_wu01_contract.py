from __future__ import annotations

from copy import deepcopy
from pathlib import Path

import pytest
import yaml
from jsonschema import Draft202012Validator, RefResolver


ROOT = Path(__file__).resolve().parents[2]
SPEC = yaml.safe_load(
    (ROOT / "contracts/http/BLOG-DOC-15_openapi_v1.0-RC11.yaml").read_text()
)
SCHEMAS = SPEC["components"]["schemas"]


def accepts(name: str, value: object) -> bool:
    schema = {"$ref": f"#/components/schemas/{name}"}
    validator = Draft202012Validator(
        schema,
        resolver=RefResolver.from_schema(SPEC),
        format_checker=Draft202012Validator.FORMAT_CHECKER,
    )
    return validator.is_valid(value)


@pytest.mark.parametrize("site_key", ["SITE-01", "SITE-15", "SITE-100", "SITE-999"])
def test_future_site_keys_are_valid_in_identity_and_create_contract(site_key: str) -> None:
    pattern = SCHEMAS["SiteIdentity"]["properties"]["site_key"]
    assert Draft202012Validator(pattern).is_valid(site_key)
    assert SCHEMAS["CreateWebsiteInput"]["properties"]["site_key"]["pattern"] == pattern["pattern"]


@pytest.mark.parametrize("site_key", ["SITE-1", "SITE-A", "OTHER-100"])
def test_invalid_site_keys_are_rejected(site_key: str) -> None:
    assert not Draft202012Validator(
        SCHEMAS["SiteIdentity"]["properties"]["site_key"]
    ).is_valid(site_key)


def test_presentation_rejects_unknown_registry_ids_and_code_fields() -> None:
    preset = {"schema_version": 1, "style_id": "STYLE_01"}
    assert accepts("PresentationConfig", preset)
    assert accepts(
        "PresentationConfig",
        {"schema_version": 1, "style_id": "CUSTOM", "base_style_id": "STYLE_01"},
    )
    for invalid in (
        {"schema_version": 2, "style_id": "STYLE_01"},
        {"schema_version": 1, "style_id": "UNKNOWN"},
        {"schema_version": 1, "style_id": "CUSTOM"},
        {**preset, "css": "body { display: none }"},
        {**preset, "header": {"profile_id": "other"}},
        {**preset, "footer": {"profile_id": "other"}},
        {**preset, "typography": {"font_url": "https://example.invalid/font.woff"}},
        {**preset, "category_card": {"variant": "IMAGE"}},
        {**preset, "hero": {"cta": {"enabled": True}}},
    ):
        assert not accepts("PresentationConfig", invalid)


def test_custom_palette_accepts_only_semantic_hex_tokens() -> None:
    keys = SCHEMAS["PresentationPaletteTokens"]["required"]
    tokens = {key: "#112233" for key in keys}
    config = {
        "schema_version": 1,
        "style_id": "CUSTOM",
        "base_style_id": "STYLE_01",
        "palette": {"mode": "CUSTOM", "semantic_tokens": tokens},
    }
    assert accepts("PresentationConfig", config)
    invalid = deepcopy(config)
    invalid["palette"]["semantic_tokens"]["selector"] = "body"
    assert not accepts("PresentationConfig", invalid)


def test_information_pages_are_exactly_five_plain_text_pages() -> None:
    page = {
        "enabled": True,
        "content_version": 1,
        "title": "About",
        "intro_text": "Introduction",
        "body_sections": [{"paragraphs": ["Text"], "list_items": []}],
    }
    pages = {key: deepcopy(page) for key in SCHEMAS["StaticPages"]["required"]}
    assert accepts("StaticPages", pages)
    assert not accepts("StaticPages", {**pages, "FAQ": page})
    assert not accepts("StaticPages", {key: value for key, value in pages.items() if key != "TERMS"})
    assert not accepts("StaticPages", {**pages, "ABOUT": {**page, "title": "<script>"}})


def test_create_website_contract_and_trusted_page_projection() -> None:
    page = {
        "enabled": False,
        "content_version": 1,
        "title": "Page",
        "intro_text": "",
        "body_sections": [],
    }
    request = {
        "site_key": "SITE-100",
        "display_name": "Example",
        "timezone_id": "UTC",
        "presentation": {"schema_version": 1, "style_id": "STYLE_01"},
        "static_pages": {key: page for key in SCHEMAS["StaticPages"]["required"]},
    }
    assert accepts("CreateWebsiteInput", request)
    assert not accepts("CreateWebsiteInput", {**request, "canonical_domain": "example.invalid"})
    assert "readiness" in SCHEMAS["CreateWebsiteResponse"]["required"]
    assert "SETUP" not in SCHEMAS["SiteAdminResource"]["properties"]["lifecycle_state"]["enum"]
    for name in (
        "HomePageData", "ArticlePageData", "CategoryPageData", "TagPageData",
        "AuthorPageData", "SearchPageData", "StaticPageData", "PreviewPageData",
        "NotFoundPageData", "GonePageData",
    ):
        assert SCHEMAS[name]["properties"]["presentation"] == {
            "$ref": "#/components/schemas/TrustedPresentation"
        }
