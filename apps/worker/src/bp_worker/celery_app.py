from __future__ import annotations


def create_celery(*, broker_url: str):
    try:
        from celery import Celery  # type: ignore
    except ImportError as exc:
        raise RuntimeError("Celery 5.6 runtime is required by DOC-23") from exc
    app = Celery("bp_worker", broker=broker_url)
    app.conf.update(
        task_acks_late=True,
        task_reject_on_worker_lost=True,
        worker_prefetch_multiplier=1,
        task_ignore_result=True,
        result_backend=None,
        task_serializer="json",
        accept_content=["json"],
        timezone="UTC",
        enable_utc=True,
        # Preserve DOC-18 P0..P4 dispatch ordering on Redis instead of collapsing
        # Celery's default sparse priority steps.
        broker_transport_options={"priority_steps": list(range(10)), "queue_order_strategy": "priority"},
    )
    return app
