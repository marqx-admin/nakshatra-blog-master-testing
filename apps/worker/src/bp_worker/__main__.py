from __future__ import annotations

import asyncio
import os

_SUPPORTED_WORKER_POOLS = {"prefork", "solo", "threads"}


def _select_runtime():
    composition = (os.getenv("BP_RUNTIME_COMPOSITION") or "").strip()
    env = (os.getenv("BP_ENV") or "development").strip().lower()
    if composition == "two-site-e2e":
        from .composition import build_two_site_worker_runtime

        return "two-site-e2e", build_two_site_worker_runtime()
    if composition == "self-hosted":
        from .composition import build_self_hosted_worker_runtime

        return "self-hosted", build_self_hosted_worker_runtime()
    if composition != "":
        raise RuntimeError(f"unsupported Worker runtime composition: {composition}")
    if env in {"staging", "production"}:
        from .composition import build_production_worker_runtime

        return "production", build_production_worker_runtime()
    raise RuntimeError(
        "development/test Worker requires explicit BP_RUNTIME_COMPOSITION=two-site-e2e"
    )


def _close(runtime: object) -> None:
    close = getattr(runtime, "close", None)
    if close is not None:
        asyncio.run(close())


def _worker_arguments(*, queue_name: str, loglevel: str) -> list[str]:
    arguments = [
        "worker",
        "--loglevel",
        loglevel,
        "--queues",
        queue_name,
        "--without-gossip",
        "--without-mingle",
    ]
    concurrency = (os.getenv("BP_WORKER_CONCURRENCY") or "").strip()
    if concurrency:
        try:
            concurrency_value = int(concurrency)
        except ValueError as exc:
            raise RuntimeError("BP_WORKER_CONCURRENCY must be a positive integer") from exc
        if concurrency_value < 1:
            raise RuntimeError("BP_WORKER_CONCURRENCY must be a positive integer")
        arguments.extend(["--concurrency", str(concurrency_value)])

    pool = (os.getenv("BP_WORKER_POOL") or "").strip().lower()
    if pool:
        if pool not in _SUPPORTED_WORKER_POOLS:
            supported = ", ".join(sorted(_SUPPORTED_WORKER_POOLS))
            raise RuntimeError(f"BP_WORKER_POOL must be one of: {supported}")
        arguments.extend(["--pool", pool])
    return arguments


def main() -> None:
    composition, runtime = _select_runtime()
    try:
        if composition in {"production", "self-hosted"} and runtime.is_scheduler:
            asyncio.run(runtime.run_scheduler_forever())
            return
        loglevel = os.getenv("BP_LOG_LEVEL", "INFO")
        runtime.celery_app.worker_main(
            _worker_arguments(queue_name=runtime.queue_name, loglevel=loglevel)
        )
    finally:
        _close(runtime)


if __name__ == "__main__":
    main()
