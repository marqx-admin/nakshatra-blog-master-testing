import asyncio
from contextvars import ContextVar

import pytest

from bp_worker.async_bridge import close_worker_loop, run_worker_async


@pytest.fixture(autouse=True)
def clean_worker_loop():
    close_worker_loop()
    yield
    close_worker_loop()


def test_repeated_jobs_reuse_loop_bound_provider_state():
    pending = None

    async def provider_call(value):
        nonlocal pending
        loop = asyncio.get_running_loop()
        if pending is None:
            pending = loop.create_future()
        pending.get_loop().call_soon(pending.set_result, value)
        result = await pending
        pending = loop.create_future()
        return result

    assert run_worker_async(provider_call("first")) == "first"
    assert run_worker_async(provider_call("second")) == "second"


def test_jobs_keep_context_variables_isolated():
    marker = ContextVar("job_marker", default="unset")

    async def job(value):
        before = marker.get()
        marker.set(value)
        return before

    assert run_worker_async(job("first")) == "unset"
    assert run_worker_async(job("second")) == "unset"
