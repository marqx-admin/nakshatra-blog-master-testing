from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime
import re
import unicodedata
from typing import Iterable


@dataclass(frozen=True, slots=True)
class NormalizedSearchQuery:
    full_query: str
    tokens: tuple[str, ...]

    @property
    def has_query(self) -> bool:
        return bool(self.tokens)


def _is_mark_inside_letters(text: str, index: int) -> bool:
    ch = text[index]
    if not unicodedata.category(ch).startswith("M"):
        return False
    before = text[index - 1] if index > 0 else ""
    after = text[index + 1] if index + 1 < len(text) else ""
    return bool(before and unicodedata.category(before).startswith("L") and (not after or unicodedata.category(after)[0] in {"L", "M"}))


def normalize_search_query(value: str | None) -> NormalizedSearchQuery:
    """DOC-16 SRCH16-NORM-01 normalization, without transliteration/stemming."""
    if value is None:
        value = ""
    normalized = unicodedata.normalize("NFKC", value).strip().casefold()
    chars: list[str] = []
    for i, ch in enumerate(normalized):
        category = unicodedata.category(ch)
        if category.startswith("L") or category.startswith("N") or _is_mark_inside_letters(normalized, i):
            chars.append(ch)
        else:
            chars.append(" ")
    full = re.sub(r"\s+", " ", "".join(chars)).strip()
    token_stream = tuple(part for part in full.split(" ") if part)
    seen: set[str] = set()
    unique: list[str] = []
    for token in token_stream:
        if token not in seen:
            seen.add(token)
            unique.append(token)
    return NormalizedSearchQuery(full_query=full, tokens=tuple(unique))


def normalize_index_text(value: str | None) -> str:
    return normalize_search_query(value).full_query


@dataclass(frozen=True, slots=True)
class PublicSearchDocument:
    site_id: str
    post_id: str
    title_text: str
    seo_title_text: str
    excerpt_text: str
    body_text: str
    category_terms: tuple[str, ...]
    tag_terms: tuple[str, ...]
    author_text: str
    slug_text: str
    first_published_at: datetime | None
    updated_at: datetime

    def normalized_fields(self) -> dict[str, str]:
        return {
            "title_text": normalize_index_text(self.title_text),
            "seo_title_text": normalize_index_text(self.seo_title_text),
            "excerpt_text": normalize_index_text(self.excerpt_text),
            "body_text": normalize_index_text(self.body_text),
            "category_terms": normalize_index_text(" ".join(self.category_terms)),
            "tag_terms": normalize_index_text(" ".join(self.tag_terms)),
            "author_text": normalize_index_text(self.author_text),
            "slug_text": normalize_index_text(self.slug_text),
        }


def _coverage(tokens: tuple[str, ...], field_text: str) -> float:
    if not tokens:
        return 0.0
    field_tokens = set(normalize_search_query(field_text).tokens)
    matched = sum(1 for token in tokens if token in field_tokens)
    return matched / len(tokens)


def _contains_phrase(field_text: str, normalized_phrase: str) -> bool:
    """Match a normalized phrase on token boundaries, never as a substring of a token."""
    if not normalized_phrase:
        return False
    if field_text == normalized_phrase:
        return True
    return (
        field_text.startswith(normalized_phrase + " ")
        or field_text.endswith(" " + normalized_phrase)
        or (" " + normalized_phrase + " ") in field_text
    )


def public_search_score(document: PublicSearchDocument, query: NormalizedSearchQuery) -> float | None:
    """Exact DOC-16 public score. None means not a candidate."""
    if not query.tokens:
        return None
    fields = document.normalized_fields()
    q = query.full_query
    title = fields["title_text"]
    seo_title = fields["seo_title_text"]
    excerpt = fields["excerpt_text"]
    category = fields["category_terms"]
    tag = fields["tag_terms"]
    author = fields["author_text"]
    slug = fields["slug_text"]
    body = fields["body_text"]

    coverage_values = {
        "title": _coverage(query.tokens, title),
        "seo": _coverage(query.tokens, seo_title),
        "excerpt": _coverage(query.tokens, excerpt),
        "category": _coverage(query.tokens, category),
        "tag": _coverage(query.tokens, tag),
        "author": _coverage(query.tokens, author),
        "slug": _coverage(query.tokens, slug),
        "body": _coverage(query.tokens, body),
    }
    exact_phrase = any(_contains_phrase(field, q) for field in fields.values())
    token_match = any(value > 0 for value in coverage_values.values())
    if not exact_phrase and not token_match:
        return None

    score = 0.0
    if q == title:
        score += 160
    if _contains_phrase(title, q):
        score += 110
    if coverage_values["title"] == 1:
        score += 70
    score += 40 * coverage_values["title"]
    if _contains_phrase(seo_title, q):
        score += 45
    score += 20 * coverage_values["seo"]
    if _contains_phrase(excerpt, q):
        score += 30
    score += 18 * coverage_values["excerpt"]
    score += 18 * max(coverage_values["category"], coverage_values["tag"])
    score += 14 * coverage_values["author"]
    score += 10 * coverage_values["slug"]
    score += 8 * coverage_values["body"]
    return score


def rank_public_documents(
    documents: Iterable[PublicSearchDocument],
    *,
    site_id: str,
    query_text: str,
) -> list[tuple[PublicSearchDocument, float]]:
    query = normalize_search_query(query_text)
    if not query.tokens:
        return []
    scored: list[tuple[PublicSearchDocument, float]] = []
    for document in documents:
        if document.site_id != site_id:
            continue
        score = public_search_score(document, query)
        if score is not None:
            scored.append((document, score))

    def tie_key(item: tuple[PublicSearchDocument, float]):
        doc, score = item
        published = doc.first_published_at.timestamp() if doc.first_published_at is not None else float("-inf")
        return (-score, -published, doc.post_id)

    return sorted(scored, key=tie_key)


@dataclass(frozen=True, slots=True)
class AdminSearchDocument:
    site_id: str
    post_id: str
    title: str
    slug: str
    status: str
    excerpt: str
    body: str
    taxonomy: str
    author: str
    updated_at: datetime


def _admin_match_bucket(document: AdminSearchDocument, query: NormalizedSearchQuery) -> tuple[int, float] | None:
    title = normalize_index_text(document.title)
    slug = normalize_index_text(document.slug)
    rest = normalize_index_text(" ".join((document.excerpt, document.body, document.taxonomy, document.author)))
    q = query.full_query
    title_cov = _coverage(query.tokens, title)
    rest_cov = _coverage(query.tokens, rest)
    if q == title:
        return (1, 1.0)
    if q == slug:
        return (2, 1.0)
    if _contains_phrase(title, q):
        return (3, 1.0)
    if title_cov == 1.0:
        return (4, 1.0)
    if title_cov > 0:
        return (5, title_cov)
    if rest_cov > 0:
        return (6, rest_cov)
    return None


def rank_admin_documents(
    documents: Iterable[AdminSearchDocument],
    *,
    site_id: str,
    query_text: str,
    status: str | None = None,
) -> list[AdminSearchDocument]:
    query = normalize_search_query(query_text)
    if not query.tokens:
        return []
    ranked: list[tuple[AdminSearchDocument, int, float]] = []
    for doc in documents:
        if doc.site_id != site_id or (status is not None and doc.status != status):
            continue
        bucket = _admin_match_bucket(doc, query)
        if bucket is not None:
            ranked.append((doc, bucket[0], bucket[1]))
    ranked.sort(key=lambda item: (item[1], -item[2], -item[0].updated_at.timestamp(), item[0].post_id))
    return [item[0] for item in ranked]
