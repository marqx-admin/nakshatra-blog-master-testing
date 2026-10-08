"""RC11 correction: complex Site Settings values remain strongly typed."""
from __future__ import annotations

from hashlib import sha256
from pathlib import Path

import pytest
import yaml
from jsonschema import Draft202012Validator, RefResolver


ROOT = Path(__file__).resolve().parents[2]
RC9 = ROOT / "contracts/http/BLOG-DOC-15_openapi_v1.0-RC9.yaml"
RC11 = ROOT / "contracts/http/BLOG-DOC-15_openapi_v1.0-RC11.yaml"
SPEC = yaml.safe_load(RC11.read_text())
SCHEMAS = SPEC["components"]["schemas"]


def accepts(schema_name: str, entry: dict) -> bool:
    validator = Draft202012Validator(
        SCHEMAS[schema_name],
        resolver=RefResolver.from_schema(SPEC),
        format_checker=Draft202012Validator.FORMAT_CHECKER,
    )
    return validator.is_valid({"settings": [entry]})


def page() -> dict:
    return {
        "enabled": True, "content_version": 1, "title": "About",
        "intro_text": "Welcome", "body_sections": [
            {"heading": "Our story", "paragraphs": ["A plain-text paragraph"], "list_items": []}
        ],
    }


def static_pages() -> dict:
    return {key: page() for key in ("ABOUT", "CONTACT", "PRIVACY", "TERMS", "DISCLAIMER")}


def presentation() -> dict:
    return {"schema_version": 1, "style_id": "STYLE_01", "branding": {"tagline": "Plain text"}}


def test_api15_s_097_uses_site_specific_entry_schema() -> None:
    operation = SPEC["paths"]["/api/v1/admin/sites/{site_key}/settings"]["patch"]
    assert operation["operationId"] == "API15-S-097"
    assert operation["requestBody"]["content"]["application/json"]["schema"]["$ref"] == "#/components/schemas/SiteSettingsInput"
    assert SCHEMAS["SiteSettingsInput"]["properties"]["settings"]["items"]["$ref"] == "#/components/schemas/SiteSettingEntry"


def test_nested_presentation_and_static_pages_are_accepted() -> None:
    assert accepts("SiteSettingsInput", {"key": "presentation_config", "value": presentation()})
    assert accepts("SiteSettingsInput", {"key": "static_pages", "value": static_pages()})
    assert accepts("SiteSettingsResponse", {"key": "presentation_config", "value": presentation()})
    assert accepts("SiteSettingsResponse", {"key": "static_pages", "value": static_pages()})


@pytest.mark.parametrize("key", ["presentation_config", "static_pages"])
def test_reserved_keys_cannot_bypass_typed_schemas(key: str) -> None:
    assert not accepts("SiteSettingsInput", {"key": key, "value": {"unknown": "scalar"}})
    assert not accepts("SiteSettingsInput", {"key": key, "value": "serialized JSON"})


def test_existing_ordinary_settings_remain_compatible_without_arbitrary_nesting() -> None:
    assert accepts("SiteSettingsInput", {"key": "display_name", "value": "Site name"})
    assert accepts("SiteSettingsInput", {"key": "seo_defaults", "value": {"seo_title": "{page_title}"}})
    assert not accepts("SiteSettingsInput", {"key": "seo_defaults", "value": {"nested": {"code": "payload"}}})
    assert not accepts("SiteSettingsInput", {"key": "unrecognized_setting", "value": "value"})
    assert not accepts("SiteSettingsInput", {"key": "presentation_schema_version", "value": 99})


@pytest.mark.parametrize("field", ["css", "html", "javascript", "jsx", "react", "template", "import_path", "font_url", "header", "footer", "category_image_media_id"])
def test_arbitrary_code_style_and_structural_fields_are_rejected(field: str) -> None:
    value = presentation()
    value[field] = "arbitrary"
    assert not accepts("SiteSettingsInput", {"key": "presentation_config", "value": value})


def test_rc9_and_ordinary_value_schema_are_historical_and_unchanged() -> None:
    assert sha256(RC9.read_bytes()).hexdigest() == "f0d55354f79d7ff43385f5e761670b3cc8bf30a0a19de1623777be83f23ac172"
    prior = yaml.safe_load(RC9.read_text())
    assert SCHEMAS["SettingJsonValue"] == prior["components"]["schemas"]["SettingJsonValue"]
    assert SCHEMAS["StaticContent"] == prior["components"]["schemas"]["StaticContent"]
    assert SCHEMAS["StaticSection"] == prior["components"]["schemas"]["StaticSection"]
