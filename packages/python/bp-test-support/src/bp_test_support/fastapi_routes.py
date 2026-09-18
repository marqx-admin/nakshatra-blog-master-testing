from __future__ import annotations

from collections.abc import Iterable, Iterator
from typing import Any


def iter_effective_fastapi_routes(routes: Iterable[Any]) -> Iterator[Any]:
    """Yield the effective FastAPI route estate, including included routers.

    FastAPI 0.141.x preserves included routers as top-level router entries.
    ``iter_route_contexts`` expands those entries to the application routes that
    actually participate in request handling and OpenAPI generation. Older
    FastAPI releases flattened included routers into ``app.routes`` already, so
    the direct iterable is the compatible fallback used by legacy QA runners.
    """

    try:
        from fastapi.routing import iter_route_contexts
    except ImportError:
        yield from routes
        return

    yield from iter_route_contexts(routes)


def single_http_method(route: Any) -> str:
    """Return the sole registered HTTP method for a canonical API operation."""

    methods = sorted(route.methods or ())
    if len(methods) != 1:
        operation_id = getattr(route, "operation_id", None)
        raise AssertionError(
            f"canonical operation {operation_id!r} must register exactly one HTTP method; found {methods!r}"
        )
    return methods[0]
