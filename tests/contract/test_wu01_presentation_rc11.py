"""RC11 admits controlled Universal IDs while retaining the RC10 wire shape."""

from __future__ import annotations

from copy import deepcopy
from hashlib import sha256
from pathlib import Path

import pytest
import yaml
from jsonschema import Draft202012Validator, RefResolver

from bp_api.composition.presentation import PresentationPolicy

ROOT = Path(__file__).resolve().parents[2]
RC10 = ROOT / "contracts/http/BLOG-DOC-15_openapi_v1.0-RC10.yaml"
RC11 = ROOT / "contracts/http/BLOG-DOC-15_openapi_v1.0-RC11.yaml"
SPEC = yaml.safe_load(RC11.read_text())
VALIDATOR = Draft202012Validator(
    {"$ref": "#/components/schemas/PresentationConfig"},
    resolver=RefResolver.from_schema(SPEC),
    format_checker=Draft202012Validator.FORMAT_CHECKER,
)


def valid(value: dict) -> bool:
    return VALIDATOR.is_valid(value)


def full_config() -> dict:
    return {
        "schema_version": 1,
        "style_id": "STYLE_01",
        "palette": {"mode": "PRESET", "preset_id": "PAL-30"},
        "typography_id": "TYPE-28",
        "layout": {
            "width_id": "WIDTH-FLUID-CAPPED",
            "density_id": "DENSITY-AIRY",
            "spacing_id": "SPACIOUS",
            "radius_id": "RADIUS-ROUND",
            "border_id": "BORDER-RULE-DRIVEN",
            "elevation_id": "ELEVATION-FLOATING",
        },
        "cards": {
            "article_card_profile_id": "CARD-30",
            "category_card_profile_id": "CAT-25",
            "author_card_profile_id": "AUTH-25",
        },
        "hero": {"profile_id": "HERO-26", "image_profile_id": "IMG-12"},
        "homepage": {"recipe_id": "HOME-25"},
        "article": {
            "layout_id": "ART-16",
            "image_profile_id": "IMG-12",
            "related_card_profile_id": "CARD-30",
        },
        "collections": {
            "category_layout_id": "COL-12",
            "tag_layout_id": "COL-12",
            "author_articles_layout_id": "COL-12",
            "search_layout_id": "COL-12",
            "article_card_profile_id": "CARD-30",
        },
        "controls": {"button_profile_id": "BTN-12"},
    }


def test_rc10_historical_bytes_and_stored_payload_remain_valid() -> None:
    assert sha256(RC10.read_bytes()).hexdigest() == (
        "001363acaf1f40d65edde67fb06f36990269e89ed1c699f221c4d545a6ea2e65"
    )
    assert valid({"schema_version": 1, "style_id": "STYLE_01"})
    assert valid(
        {"schema_version": 1, "style_id": "STYLE_01", "article_card": {"variant": "COMPACT"}}
    )


def test_rc11_controlled_shape_is_valid_and_site_settings_transport_accepts_it() -> None:
    config = full_config()
    assert valid(config)
    assert PresentationPolicy(SPEC).presentation_valid(config)
    settings = Draft202012Validator(
        {"$ref": "#/components/schemas/SiteSettingsInput"},
        resolver=RefResolver.from_schema(SPEC),
        format_checker=Draft202012Validator.FORMAT_CHECKER,
    )
    assert settings.is_valid({"settings": [{"key": "presentation_config", "value": config}]})


@pytest.mark.parametrize(
    ("path", "value"),
    [
        (("palette", "preset_id"), "PAL-31"),
        (("typography_id",), "TYPE-29"),
        (("cards", "article_card_profile_id"), "CARD-31"),
        (("cards", "category_card_profile_id"), "CAT-08"),
        (("cards", "author_card_profile_id"), "AUTH-26"),
        (("hero", "profile_id"), "HERO-27"),
        (("hero", "image_profile_id"), "IMG-13"),
        (("homepage", "recipe_id"), "HOME-26"),
        (("article", "layout_id"), "ART-17"),
        (("collections", "search_layout_id"), "COL-13"),
        (("controls", "button_profile_id"), "BTN-13"),
        (("layout", "density_id"), "DENSITY-UNKNOWN"),
        (("controls", "header_cta_navigation_item_id"), "00000000-0000-0000-0000-000000000001"),
        (("header_profile_id",), "HDR-01"),
        (("footer_profile_id",), "FTR-01"),
        (("css",), "body { display: none }"),
        (("font_url",), "https://example.invalid/font.woff"),
    ],
)
def test_unknown_or_forbidden_registry_and_code_fields_are_rejected(
    path: tuple[str, ...], value: str
) -> None:
    config = full_config()
    target = config
    for segment in path[:-1]:
        target = target[segment]
    target[path[-1]] = value
    assert not valid(config)
    assert not PresentationPolicy(SPEC).presentation_valid(config)


def test_custom_palette_remains_semantic_and_cannot_claim_preset_id() -> None:
    config = full_config()
    required = SPEC["components"]["schemas"]["PresentationPaletteTokens"]["required"]
    tokens = {key: "#112233" for key in required}
    config["palette"] = {"mode": "CUSTOM", "semantic_tokens": tokens}
    assert valid(config)
    with_preset = deepcopy(config)
    with_preset["palette"]["preset_id"] = "PAL-01"
    assert not valid(with_preset)
    with_css = deepcopy(config)
    with_css["palette"]["semantic_tokens"]["css"] = "body { color: red }"
    assert not valid(with_css)
