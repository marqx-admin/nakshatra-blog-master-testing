"""Keep async provider connections on one event loop per worker process."""

from __future__ import annotations

import asyncio
import atexit
import os
from collections.abc import Coroutine
from contextvars import copy_context
from threading import RLock
from typing import Any

_lock = RLock()
_runner: asyncio.Runner | None = None
_runner_pid: int | None = None


def run_worker_async(coroutine: Coroutine[Any, Any, Any]) -> Any:
    global _runner, _runner_pid
    # Thread pools must also serialize access to the shared async clients. The
    # loop is created lazily, after Celery has forked its worker processes.
    with _lock:
        pid = os.getpid()
        if _runner is None or _runner_pid != pid:
            _runner = asyncio.Runner()
            _runner_pid = pid
        return _runner.run(coroutine, context=copy_context())


def close_worker_loop() -> None:
    global _runner, _runner_pid
    with _lock:
        if _runner is not None and _runner_pid == os.getpid():
            _runner.close()
        _runner = None
        _runner_pid = None


atexit.register(close_worker_loop)
