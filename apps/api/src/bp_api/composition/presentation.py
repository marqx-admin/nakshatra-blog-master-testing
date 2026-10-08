"""Frozen RC11 presentation/configuration validation shared by API adapters."""

from __future__ import annotations

from typing import Any

from bp_domain.errors import ValidationFault
from jsonschema import Draft202012Validator, RefResolver


class PresentationPolicy:
    def __init__(self, spec: dict[str, Any]) -> None:
        resolver = RefResolver.from_schema(spec)
        schemas = spec["components"]["schemas"]
        self.presentation = Draft202012Validator(
            schemas["PresentationConfig"],
            resolver=resolver,
            format_checker=Draft202012Validator.FORMAT_CHECKER,
        )
        self.static_pages = Draft202012Validator(
            schemas["StaticPages"],
            resolver=resolver,
            format_checker=Draft202012Validator.FORMAT_CHECKER,
        )

    def presentation_valid(self, value: Any) -> bool:
        return bool(self.presentation.is_valid(value))

    def require_presentation(self, value: Any) -> None:
        if not self.presentation_valid(value):
            raise ValidationFault("presentation does not satisfy canonical RC11")

    def require_static_pages(self, value: Any) -> None:
        if not self.static_pages.is_valid(value):
            raise ValidationFault("fixed information pages do not satisfy canonical RC11")


def presentation_references(value: dict[str, Any]) -> tuple[set[str], set[str]]:
    """Extract only the reference-bearing fields admitted by PresentationConfig."""
    media: set[str] = set()
    navigation: set[str] = set()
    for parent in ("branding", "hero"):
        part = value.get(parent)
        if not isinstance(part, dict):
            continue
        for field in ("logo_media_id", "media_id"):
            if isinstance(part.get(field), str):
                media.add(part[field])
        cta = part.get("cta")
        if (
            isinstance(cta, dict)
            and cta.get("enabled") is True
            and isinstance(cta.get("navigation_item_id"), str)
        ):
            navigation.add(cta["navigation_item_id"])
    return media, navigation
