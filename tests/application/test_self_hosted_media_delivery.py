from __future__ import annotations

import hashlib
from contextlib import asynccontextmanager

import pytest
from bp_adapters_object_storage import InMemoryObjectStorageAdapter
from bp_domain.context import SiteRecord

from bp_api.media_delivery import SelfHostedMediaDelivery

SITE_ID = "10000000-0000-4000-8000-000000000001"
MEDIA_ID = "32000000-0000-4000-8000-000000000001"
OBJECT_KEY = f"sites/{SITE_ID}/media/{MEDIA_ID}/g/{'a' * 64}/variants/native_webp.webp"


class _Sites:
    async def get_site_by_key(self, key: str):
        if key != "SITE-01":
            return None
        return SiteRecord(SITE_ID, "SITE-01", "WhatsYourRashi.in")


class _Result:
    def mappings(self):
        return self

    def first(self):
        return {"object_key": OBJECT_KEY, "mime_type": "image/webp"}


class _Connection:
    def execute(self, statement, parameters):
        assert parameters == {
            "site_id": SITE_ID,
            "media_id": MEDIA_ID,
            "variant_key": "native_webp",
        }
        return _Result()


class _Transactions:
    @asynccontextmanager
    async def transaction(self, context):
        assert context.site_id == SITE_ID
        yield _Connection()


@pytest.mark.asyncio
async def test_self_hosted_delivery_reads_only_owned_private_variant():
    storage = InMemoryObjectStorageAdapter()
    body = b"verified-webp"
    checksum = hashlib.sha256(body).hexdigest()
    await storage.put_private_create_only(
        key=OBJECT_KEY,
        data=body,
        content_type="image/webp",
        checksum_sha256=checksum,
    )
    delivery = SelfHostedMediaDelivery(
        sites=_Sites(), transactions=_Transactions(), storage=storage
    )
    item = await delivery.get(
        site_key="SITE-01",
        media_id=MEDIA_ID,
        variant_key="native_webp",
        extension="webp",
        request_id="test-media",
    )
    assert item is not None
    assert item.body == body
    assert item.content_type == "image/webp"
    assert item.etag == checksum


@pytest.mark.asyncio
async def test_self_hosted_delivery_rejects_extension_mismatch_before_storage_read():
    delivery = SelfHostedMediaDelivery(
        sites=_Sites(),
        transactions=_Transactions(),
        storage=InMemoryObjectStorageAdapter(),
    )
    assert (
        await delivery.get(
            site_key="SITE-01",
            media_id=MEDIA_ID,
            variant_key="native_webp",
            extension="avif",
            request_id="test-media",
        )
        is None
    )
