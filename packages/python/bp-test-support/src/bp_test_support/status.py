from __future__ import annotations

from enum import StrEnum


class QAStatus(StrEnum):
    """Only result states permitted by the CHAT 12 execution contract."""

    PASS = "PASS"
    FAIL = "FAIL"
    BLOCKED = "BLOCKED"
    NOT_EXECUTED = "NOT_EXECUTED"
