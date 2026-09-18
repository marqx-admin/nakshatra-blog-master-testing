# bp-test-support

CHAT 12-owned Python support for deterministic QA result handling, fixture validation, evidence hashing/redaction, release-coverage aggregation, and candidate-specific execution records.

The package intentionally uses only the Python standard library in this handoff, so CHAT 12 does not alter the root `uv.lock`. It is a test-support package only and must never become a production-runtime dependency of API, Worker, Admin, or public site applications.

Run from the repository root with:

```bash
PYTHONPATH=packages/python/bp-test-support/src python3 -m bp_test_support --repo-root . validate-foundation
```

Result vocabulary is deliberately restricted to `PASS`, `FAIL`, `BLOCKED`, and `NOT_EXECUTED`. A QA21 release row is not changed to PASS merely because a source/static foundation check succeeds.
