from __future__ import annotations

import importlib.util
import sys
from pathlib import Path

import pytest
import yaml

ROOT = Path(__file__).parents[2]
COMPOSE_PATH = ROOT / "infrastructure" / "coolify" / "compose.yaml"
WORKER_MAIN_PATH = ROOT / "apps" / "worker" / "src" / "bp_worker" / "__main__.py"
ONE_SHOT_SERVICES = {"migrate", "roles", "minio-init", "security-init"}


def _memory_bytes(value: str) -> int:
    suffixes = {"m": 1024**2, "g": 1024**3}
    return int(value[:-1]) * suffixes[value[-1].lower()]


def _load_worker_main():
    spec = importlib.util.spec_from_file_location("bp_worker_main_for_limits", WORKER_MAIN_PATH)
    assert spec and spec.loader
    module = importlib.util.module_from_spec(spec)
    sys.modules[spec.name] = module
    spec.loader.exec_module(module)
    return module


def test_long_running_services_fit_the_8gb_budget() -> None:
    compose = yaml.safe_load(COMPOSE_PATH.read_text())
    services = compose["services"]
    long_running = {
        name: service for name, service in services.items() if name not in ONE_SHOT_SERVICES
    }

    assert all("mem_limit" in service for service in long_running.values())
    total = sum(_memory_bytes(service["mem_limit"]) for service in long_running.values())
    assert total == 7168 * 1024**2
    assert total <= 7 * 1024**3


def test_worker_profile_uses_one_solo_process_per_queue() -> None:
    compose = yaml.safe_load(COMPOSE_PATH.read_text())
    for name, service in compose["services"].items():
        if not name.startswith("worker-"):
            continue
        environment = service["environment"]
        assert environment["BP_WORKER_CONCURRENCY"] == "1"
        assert environment["BP_WORKER_POOL"] == "solo"
        assert environment["BP_POSTGRES_POOL_MAX"] == "2"


def test_worker_cli_limits_are_validated(monkeypatch: pytest.MonkeyPatch) -> None:
    worker_main = _load_worker_main()
    monkeypatch.setenv("BP_WORKER_CONCURRENCY", "1")
    monkeypatch.setenv("BP_WORKER_POOL", "solo")
    arguments = worker_main._worker_arguments(queue_name="q18.media", loglevel="INFO")
    assert arguments[-4:] == ["--concurrency", "1", "--pool", "solo"]

    monkeypatch.setenv("BP_WORKER_CONCURRENCY", "0")
    with pytest.raises(RuntimeError, match="positive integer"):
        worker_main._worker_arguments(queue_name="q18.media", loglevel="INFO")
