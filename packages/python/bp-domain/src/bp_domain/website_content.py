"""Site-owned plain content rules; no starter prose is served by this module."""
import re

PAGE_KEYS = frozenset({"ABOUT", "CONTACT", "PRIVACY", "TERMS", "DISCLAIMER"})
_PLACEHOLDER = re.compile(r"\[(?:Website Name|Primary Topic|Approved Topic|Topic|approved [^\]]+|Owner[^\]]*|email[^\]]*|\s*)\]", re.I)


def unresolved_placeholder(value: str) -> bool:
    return bool(_PLACEHOLDER.search(value))


def public_text(value: object, *, required: bool = False) -> bool:
    return isinstance(value, str) and (bool(value.strip()) or not required) and not any(c in value for c in "<>") and not unresolved_placeholder(value)


def information_page_ready(page: object) -> bool:
    if not isinstance(page, dict) or not public_text(page.get("title"), required=True) or not public_text(page.get("intro_text", "")):
        return False
    sections = page.get("body_sections")
    if not isinstance(sections, list) or not sections:
        return False
    for section in sections:
        if not isinstance(section, dict) or not public_text(section.get("heading", "")):
            return False
        paragraphs, items = section.get("paragraphs"), section.get("list_items")
        if not isinstance(paragraphs, list) or not isinstance(items, list) or not paragraphs + items:
            return False
        if not all(public_text(text, required=True) for text in paragraphs + items):
            return False
    return True
