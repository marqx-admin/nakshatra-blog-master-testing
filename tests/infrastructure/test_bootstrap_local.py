from __future__ import annotations

import importlib.util
from pathlib import Path
import sys

import pytest

_SCRIPT = Path(__file__).parents[2] / "infrastructure" / "scripts" / "bootstrap_local.py"
_SPEC = importlib.util.spec_from_file_location("bootstrap_local", _SCRIPT)
assert _SPEC and _SPEC.loader
_MODULE = importlib.util.module_from_spec(_SPEC)
sys.modules["bootstrap_local"] = _MODULE
_SPEC.loader.exec_module(_MODULE)
_credential_file = _MODULE._credential_file
_expected_table_definition = _MODULE._expected_table_definition
_verify_table = _MODULE._verify_table


def test_credential_file_is_created_once_and_not_printed(tmp_path: Path):
    path = tmp_path / "postgres-site-runtime"
    first = _credential_file(path, "db_site_runtime")
    second = _credential_file(path, "db_site_runtime")
    assert first == second
    assert path.stat().st_mode & 0o777 == 0o600
    assert "db_site_runtime" in path.read_text()


def test_security_table_definition_matches_adapter_contract():
    definition = _expected_table_definition("bp-security-state-dev")
    assert definition["KeySchema"] == [
        {"AttributeName": "pk", "KeyType": "HASH"},
        {"AttributeName": "sk", "KeyType": "RANGE"},
    ]
    assert definition["GlobalSecondaryIndexes"][0]["IndexName"] == "gsi_admin"
    assert definition["GlobalSecondaryIndexes"][0]["Projection"] == {"ProjectionType": "ALL"}


class _FakeClient:
    def describe_table(self, *, TableName):
        return {"Table": _expected_table_definition(TableName)}

    def describe_time_to_live(self, *, TableName):
        return {"TimeToLiveDescription": {"AttributeName": "ttl_epoch", "TimeToLiveStatus": "ENABLED"}}


class _FakeTable:
    def __init__(self, description):
        self.description = description
        client = _FakeClient()
        client.describe_table = lambda *, TableName: {"Table": self.description}
        self.meta = type("Meta", (), {"client": client})()


def test_incompatible_security_table_is_rejected():
    description = _expected_table_definition("bp-security-state-dev")
    description["KeySchema"][0] = {"AttributeName": "wrong", "KeyType": "HASH"}
    with pytest.raises(RuntimeError, match="incompatible schema"):
        _verify_table(_FakeTable(description), "bp-security-state-dev")