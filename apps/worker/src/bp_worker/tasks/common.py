from __future__ import annotations

from datetime import UTC, datetime

from bp_background_contracts import RETRY_PROFILE_BY_JOB, RETRY_PROFILES, JobEnvelope

from ..async_bridge import run_worker_async


def register_job(celery_app, *, task_name: str, queue: str, job_type: str, runtime):
    from bp_background_contracts import JobType
    profile = RETRY_PROFILES[RETRY_PROFILE_BY_JOB[JobType(job_type)]]

    @celery_app.task(
        bind=True,
        name=task_name,
        queue=queue,
        acks_late=True,
        reject_on_worker_lost=True,
        ignore_result=True,
        soft_time_limit=profile.attempt_timeout_seconds,
        time_limit=profile.attempt_timeout_seconds,
    )
    def task(self, raw_envelope: dict, first_failed_at: str | None = None):
        envelope = JobEnvelope.from_wire(raw_envelope)
        if envelope.job_type.value != job_type or envelope.queue.value != queue:
            raise RuntimeError("DOC18_JOB_QUEUE_MISMATCH")
        attempt = int(getattr(self.request, "retries", 0)) + 1
        first = (
            datetime.fromisoformat(first_failed_at.replace("Z", "+00:00"))
            if first_failed_at else None
        )
        decision = run_worker_async(
            runtime.execute(envelope, attempt=attempt, first_failed_at=first)
        )
        if decision.retry:
            # Countdown is computed by DOC-18 RetryProfile, never Celery default backoff/jitter.
            when = first_failed_at or datetime.now(UTC).isoformat().replace("+00:00", "Z")
            raise self.retry(
                countdown=decision.countdown_seconds,
                kwargs={"first_failed_at": when},
                max_retries=profile.max_attempts - 1,
            )
        return None
    return task
