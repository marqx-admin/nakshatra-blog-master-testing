from __future__ import annotations

from enum import StrEnum


class QueueId(StrEnum):
    PUBLISH = "q18.publish"
    MEDIA = "q18.media"
    SEARCH = "q18.search"
    SITEMAP = "q18.sitemap"
    CACHE = "q18.cache"
    MAINTENANCE = "q18.maintenance"


CANONICAL_QUEUES: tuple[QueueId, ...] = tuple(QueueId)
DLQ_BY_QUEUE: dict[QueueId, str] = {
    QueueId.PUBLISH: "dlq18.publish",
    QueueId.MEDIA: "dlq18.media",
    QueueId.SEARCH: "dlq18.search",
    QueueId.SITEMAP: "dlq18.sitemap",
    QueueId.CACHE: "dlq18.cache",
    QueueId.MAINTENANCE: "dlq18.maintenance",
}

if len(CANONICAL_QUEUES) != 6:  # frozen DOC-18 count guard
    raise RuntimeError("DOC-18 requires exactly six logical queues")
