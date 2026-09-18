"""Private-origin media gateway for the self-hosted runtime."""

from __future__ import annotations

import hashlib
import re
from dataclasses import dataclass
from datetime import UTC, datetime
from typing import Any

from bp_domain.context import ContextKind, ContextSource, SiteContext
from sqlalchemy import text

_VARIANT = re.compile(r"^[a-z0-9_]+$")
_MIME_EXTENSION = {"image/avif": "avif", "image/webp": "webp"}


@dataclass(frozen=True, slots=True)
class DeliveredMedia:
    body: bytes
    content_type: str
    etag: str


class SelfHostedMediaDelivery:
    def __init__(self, *, sites: Any, transactions: Any, storage: Any) -> None:
        self.sites = sites
        self.transactions = transactions
        self.storage = storage

    async def get(
        self, *, site_key: str, media_id: str, variant_key: str, extension: str, request_id: str
    ) -> DeliveredMedia | None:
        if not _VARIANT.fullmatch(variant_key) or extension not in {"webp", "avif"}:
            return None
        site = await self.sites.get_site_by_key(site_key)
        if site is None or not site.public_eligible:
            return None
        context = SiteContext(
            kind=ContextKind.PUBLIC_SITE,
            site_id=site.site_id,
            site_key=site.site_key,
            site_status=site.lifecycle,
            canonical_domain=site.canonical_domain,
            context_source=ContextSource.PUBLIC_HOST,
            request_id=request_id,
            request_host=site.canonical_domain,
            timezone=site.timezone,
            locale=site.locale,
            resolved_at=datetime.now(UTC),
        )
        async with self.transactions.transaction(context) as connection:
            row = (
                connection.execute(
                    text(
                        """
                        SELECT mv.object_key, mv.mime_type
                        FROM media_variants mv
                        JOIN media m ON m.site_id=mv.site_id AND m.media_id=mv.media_id
                        WHERE mv.site_id=:site_id
                          AND mv.media_id=:media_id
                          AND mv.variant_key=:variant_key
                          AND m.status='ACTIVE'
                          AND EXISTS (
                            SELECT 1 FROM media_variants native
                            WHERE native.site_id=mv.site_id
                              AND native.media_id=mv.media_id
                              AND native.variant_key='native_webp'
                          )
                          AND EXISTS (
                            SELECT 1 FROM media_usages mu
                            LEFT JOIN posts p
                              ON p.site_id=mu.site_id AND p.post_id=mu.post_id
                            LEFT JOIN author_site_profiles a
                              ON a.site_id=mu.site_id
                             AND a.author_profile_id=mu.author_profile_id
                            WHERE mu.site_id=mv.site_id AND mu.media_id=mv.media_id
                              AND (
                                (mu.usage_kind IN ('POST_FEATURED','POST_BODY','POST_OG')
                                  AND p.status='PUBLISHED' AND p.published_at<=now())
                                OR (mu.usage_kind='AUTHOR_PHOTO' AND a.status='ACTIVE'
                                  AND EXISTS (
                                    SELECT 1 FROM posts ap
                                    WHERE ap.site_id=a.site_id
                                      AND ap.author_site_profile_id=a.author_profile_id
                                      AND ap.status='PUBLISHED' AND ap.published_at<=now()
                                  ))
                                OR mu.usage_kind IN (
                                  'SITE_LOGO','SITE_FAVICON','SITE_DEFAULT_SOCIAL'
                                )
                              )
                          )
                        LIMIT 1
                        """
                    ),
                    {"site_id": site.site_id, "media_id": media_id, "variant_key": variant_key},
                )
                .mappings()
                .first()
            )
        if row is None:
            return None
        content_type = str(row["mime_type"])
        if _MIME_EXTENSION.get(content_type) != extension:
            return None
        object_key = str(row["object_key"])
        owner_prefix = f"sites/{site.site_id}/media/{media_id}/g/"
        if not object_key.startswith(owner_prefix) or "/variants/" not in object_key:
            return None
        body = await self.storage.get_private(object_key)
        return DeliveredMedia(
            body=body, content_type=content_type, etag=hashlib.sha256(body).hexdigest()
        )
