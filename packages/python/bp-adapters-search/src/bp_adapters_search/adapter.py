from __future__ import annotations

from collections import defaultdict
from typing import Any, Callable, Iterable

from bp_domain.search import PublicSearchDocument, rank_public_documents


class InMemorySearchIndexAdapter:
    def __init__(self) -> None:
        self._active_generation: dict[str, str] = {}
        self._generations: dict[tuple[str, str], dict[str, PublicSearchDocument]] = defaultdict(dict)

    def _active(self, site_id: str) -> str:
        return self._active_generation.setdefault(site_id, "active-v1")

    async def upsert_public(self, document: PublicSearchDocument, *, generation: str | None = None) -> None:
        gen = generation or self._active(document.site_id)
        self._generations[(document.site_id, gen)][document.post_id] = document

    async def delete_public(self, *, site_id: str, post_id: str, generation: str | None = None) -> None:
        gen = generation or self._active(site_id)
        self._generations[(site_id, gen)].pop(post_id, None)

    async def query_public(self, *, site_id: str, q: str, page: int, page_size: int) -> tuple[list[PublicSearchDocument], bool]:
        if page < 1 or page_size < 1 or page_size > 50:
            raise ValueError("invalid DOC-16 public pagination")
        gen = self._active(site_id)
        ranked = rank_public_documents(self._generations[(site_id, gen)].values(), site_id=site_id, query_text=q)
        start = (page - 1) * page_size
        page_items = ranked[start : start + page_size + 1]
        has_more = len(page_items) > page_size
        return [doc for doc, _ in page_items[:page_size]], has_more

    async def begin_reindex(self, *, site_id: str, generation: str) -> None:
        if generation == self._active(site_id):
            raise ValueError("shadow reindex generation cannot equal active generation")
        self._generations[(site_id, generation)] = {}

    async def validate_generation(self, *, site_id: str, generation: str, expected_count: int) -> bool:
        docs = self._generations.get((site_id, generation))
        return docs is not None and len(docs) == expected_count and all(doc.site_id == site_id for doc in docs.values())

    async def activate_generation(self, *, site_id: str, generation: str) -> None:
        if (site_id, generation) not in self._generations:
            raise ValueError("generation does not exist")
        self._active_generation[site_id] = generation

    async def discard_generation(self, *, site_id: str, generation: str) -> None:
        if self._active_generation.get(site_id) == generation:
            raise ValueError("cannot discard active generation")
        self._generations.pop((site_id, generation), None)


class OpenSearchAdapter:
    """Provider adapter that preserves DOC-16 scoring as application-owned logic.

    The injected `scan` callable must yield all matching same-site source documents from the
    selected generation. OpenSearch BM25 ordering is never treated as canonical: candidates are
    normalized/scored/tie-broken by bp_domain.search after tenant filtering.
    """

    def __init__(self, *, client: Any, scan: Callable[..., Iterable[dict[str, Any]]]) -> None:
        self.client = client
        self.scan = scan
        self._active_alias = "bp-public-search-active"

    @staticmethod
    def _index_name(site_id: str, generation: str) -> str:
        safe_site = site_id.lower().replace("-", "")
        safe_generation = generation.lower().replace("-", "")[:32]
        return f"bp-v1-s-{safe_site}-g-{safe_generation}"

    @staticmethod
    def _source(document: PublicSearchDocument) -> dict[str, Any]:
        return {
            "site_id": document.site_id,
            "post_id": document.post_id,
            "title_text": document.title_text,
            "seo_title_text": document.seo_title_text,
            "excerpt_text": document.excerpt_text,
            "body_text": document.body_text,
            "category_terms": list(document.category_terms),
            "tag_terms": list(document.tag_terms),
            "author_text": document.author_text,
            "slug_text": document.slug_text,
            "first_published_at": document.first_published_at.isoformat() if document.first_published_at else None,
            "updated_at": document.updated_at.isoformat(),
        }

    @staticmethod
    def _from_source(source: dict[str, Any]) -> PublicSearchDocument:
        from datetime import datetime
        def dt(v):
            return None if v is None else datetime.fromisoformat(str(v).replace("Z", "+00:00"))
        return PublicSearchDocument(
            site_id=str(source["site_id"]), post_id=str(source["post_id"]),
            title_text=str(source.get("title_text", "")), seo_title_text=str(source.get("seo_title_text", "")),
            excerpt_text=str(source.get("excerpt_text", "")), body_text=str(source.get("body_text", "")),
            category_terms=tuple(source.get("category_terms", ())), tag_terms=tuple(source.get("tag_terms", ())),
            author_text=str(source.get("author_text", "")), slug_text=str(source.get("slug_text", "")),
            first_published_at=dt(source.get("first_published_at")), updated_at=dt(source["updated_at"]),
        )

    async def _active_index(self, site_id: str) -> str:
        alias = f"{self._active_alias}-{site_id.lower().replace('-', '')}"
        aliases = self.client.indices.get_alias(name=alias)
        names = sorted(aliases)
        if len(names) != 1:
            raise RuntimeError("public search alias must resolve to exactly one site generation")
        return names[0]

    async def upsert_public(self, document: PublicSearchDocument, *, generation: str | None = None) -> None:
        index = self._index_name(document.site_id, generation) if generation else await self._active_index(document.site_id)
        self.client.index(index=index, id=document.post_id, body=self._source(document), refresh=False)

    async def delete_public(self, *, site_id: str, post_id: str, generation: str | None = None) -> None:
        index = self._index_name(site_id, generation) if generation else await self._active_index(site_id)
        try:
            self.client.delete(index=index, id=post_id, refresh=False)
        except Exception as exc:
            if getattr(exc, "status_code", None) != 404:
                raise

    async def query_public(self, *, site_id: str, q: str, page: int, page_size: int) -> tuple[list[PublicSearchDocument], bool]:
        if page < 1 or page_size < 1 or page_size > 50:
            raise ValueError("invalid DOC-16 public pagination")
        index = await self._active_index(site_id)
        # Provider is used only as same-site candidate store. No cross-site alias and no BM25 authority.
        hits = self.scan(
            self.client,
            index=index,
            query={"query": {"term": {"site_id": site_id}}},
            _source=True,
        )
        docs = []
        for hit in hits:
            source = hit.get("_source", {})
            if source.get("site_id") != site_id:
                raise RuntimeError("OpenSearch tenant boundary violation")
            docs.append(self._from_source(source))
        ranked = rank_public_documents(docs, site_id=site_id, query_text=q)
        start = (page - 1) * page_size
        selected = ranked[start : start + page_size + 1]
        return [doc for doc, _ in selected[:page_size]], len(selected) > page_size

    async def begin_reindex(self, *, site_id: str, generation: str) -> None:
        index = self._index_name(site_id, generation)
        self.client.indices.create(
            index=index,
            body={
                "mappings": {
                    "dynamic": "strict",
                    "properties": {
                        "site_id": {"type": "keyword"}, "post_id": {"type": "keyword"},
                        "title_text": {"type": "text"}, "seo_title_text": {"type": "text"},
                        "excerpt_text": {"type": "text"}, "body_text": {"type": "text"},
                        "category_terms": {"type": "text"}, "tag_terms": {"type": "text"},
                        "author_text": {"type": "text"}, "slug_text": {"type": "text"},
                        "first_published_at": {"type": "date"}, "updated_at": {"type": "date"},
                    },
                },
            },
        )

    async def validate_generation(self, *, site_id: str, generation: str, expected_count: int) -> bool:
        index = self._index_name(site_id, generation)
        # Upserts intentionally use refresh=False; force one generation-local refresh
        # before the activation count gate so a just-built shadow cannot undercount.
        self.client.indices.refresh(index=index)
        result = self.client.count(index=index, body={"query": {"term": {"site_id": site_id}}})
        total = self.client.count(index=index, body={"query": {"match_all": {}}})
        return int(result["count"]) == expected_count == int(total["count"])

    async def activate_generation(self, *, site_id: str, generation: str) -> None:
        index = self._index_name(site_id, generation)
        alias = f"{self._active_alias}-{site_id.lower().replace('-', '')}"
        existing = self.client.indices.get_alias(name=alias, ignore_unavailable=True)
        actions = [{"remove": {"index": name, "alias": alias}} for name in existing]
        actions.append({"add": {"index": index, "alias": alias}})
        self.client.indices.update_aliases(body={"actions": actions})

    async def discard_generation(self, *, site_id: str, generation: str) -> None:
        self.client.indices.delete(index=self._index_name(site_id, generation), ignore_unavailable=True)
