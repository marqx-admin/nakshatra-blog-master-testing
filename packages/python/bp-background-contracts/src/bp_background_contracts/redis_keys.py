from __future__ import annotations

import hashlib


def hash32(value: str) -> str:
    return hashlib.sha256(value.encode("utf-8")).hexdigest()[:32]


def _site(site_id: str) -> str:
    value = str(site_id).strip().lower()
    if not value:
        raise ValueError("site_id is required for every site-owned Redis key")
    return value


def public_epoch(site_id: str) -> str:
    return f"bp:v1:s:{_site(site_id)}:epoch:public"


def page_cache(site_id: str, epoch: int, canonical_host: str, canonical_route: str) -> str:
    return f"bp:v1:s:{_site(site_id)}:cache:page:e{int(epoch)}:{hash32(canonical_host)}:{hash32(canonical_route)}"


def data_cache(site_id: str, epoch: int, page_id: str, identity: str, query: str) -> str:
    return f"bp:v1:s:{_site(site_id)}:cache:data:e{int(epoch)}:{page_id}:{hash32(identity)}:{hash32(query)}"


def object_cache(site_id: str, entity_type: str, entity_id: str, version_token: str | int) -> str:
    return f"bp:v1:s:{_site(site_id)}:cache:obj:{entity_type}:{entity_id}:v{version_token}"


def dependency_set(site_id: str, dep_type: str, dep_id: str) -> str:
    return f"bp:v1:s:{_site(site_id)}:dep:{dep_type}:{dep_id}"


def dedupe(site_id: str, job_type: str, idempotency_identity: str) -> str:
    return f"bp:v1:s:{_site(site_id)}:dedupe:{job_type}:{hash32(idempotency_identity)}"


def lock(site_id: str, purpose: str, identity: str) -> str:
    return f"bp:v1:s:{_site(site_id)}:lock:{purpose}:{hash32(identity)}"


def search_status(site_id: str) -> str:
    return f"bp:v1:s:{_site(site_id)}:search:status"


def sitemap_desired(site_id: str) -> str:
    return f"bp:v1:s:{_site(site_id)}:sitemap:desired_seq"


def sitemap_built(site_id: str) -> str:
    return f"bp:v1:s:{_site(site_id)}:sitemap:built_seq"


def global_lock(purpose: str) -> str:
    if not purpose:
        raise ValueError("purpose is required")
    return f"bp:v1:g:lock:{purpose}"
