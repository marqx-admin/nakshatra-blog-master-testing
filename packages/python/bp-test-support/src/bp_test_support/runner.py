from __future__ import annotations

import os
import platform
import shlex
import subprocess
import sys
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from .evidence import redact_text
from .hashing import sha256_file
from .io import write_json
from .status import QAStatus


def utc_now() -> str:
    return datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")


def execute_foundation_check(
    *,
    check_id: str,
    command: list[str],
    repo_root: str | Path,
    candidate_id: str,
    output_dir: str | Path,
    description: str,
) -> dict[str, Any]:
    root = Path(repo_root).resolve()
    out_dir = Path(output_dir)
    out_dir.mkdir(parents=True, exist_ok=True)
    started = utc_now()
    completed: str
    try:
        process = subprocess.run(command, cwd=root, text=True, capture_output=True, check=False, env=os.environ.copy())
        completed = utc_now()
        status = QAStatus.PASS if process.returncode == 0 else QAStatus.FAIL
        stdout = redact_text(process.stdout)
        stderr = redact_text(process.stderr)
        return_code = process.returncode
    except FileNotFoundError as exc:
        completed = utc_now()
        status = QAStatus.BLOCKED
        stdout = ""
        stderr = str(exc)
        return_code = None

    log_path = out_dir / f"{check_id}.log"
    log_path.write_text(
        "\n".join(
            [
                f"check_id={check_id}",
                f"candidate_id={candidate_id}",
                f"description={description}",
                f"command={shlex.join(command)}",
                f"started_at={started}",
                f"completed_at={completed}",
                f"return_code={return_code}",
                "--- stdout ---",
                stdout,
                "--- stderr ---",
                stderr,
            ]
        )
        + "\n",
        encoding="utf-8",
    )
    result = {
        "test_id": check_id,
        "kind": "FOUNDATION_CHECK",
        "description": description,
        "candidate_id": candidate_id,
        "environment_class": "ENV21-UNIT",
        "status": status.value,
        "started_at": started,
        "completed_at": completed,
        "command": command,
        "return_code": return_code,
        "executor": {
            "python": platform.python_version(),
            "platform": platform.platform(),
            "executable": sys.executable,
        },
        "evidence": [
            {
                "evidence_class": "EV22-TEST",
                "path": log_path.relative_to(root).as_posix(),
                "sha256": sha256_file(log_path),
                "bytes": log_path.stat().st_size,
            }
        ],
    }
    if status is QAStatus.BLOCKED:
        result["blocked_reason"] = stderr
    elif status is QAStatus.FAIL:
        result["defect_id"] = f"DEF-C12-{check_id.removeprefix('C12-FND-')}"
    result_path = out_dir / f"{check_id}.json"
    write_json(result_path, result)
    return result
