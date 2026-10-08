#!/usr/bin/env bash
set -u
set -o pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"
export PYTHONDONTWRITEBYTECODE=1
export PYTHONPATH="$ROOT/packages/python/bp-test-support/src${PYTHONPATH:+:$PYTHONPATH}"
CID="$(python3 - <<'PY'
import json
from pathlib import Path
print(json.loads(Path('tests/evidence/candidate/candidate.json').read_text())['candidate_id'])
PY
)"

failures=0
run_check() {
  local id="$1"
  local description="$2"
  shift 2
  python3 -m bp_test_support --repo-root . execute-foundation \
    --check-id "$id" --candidate-id "$CID" --description "$description" -- "$@"
  local rc=$?
  if [ "$rc" -ne 0 ]; then
    failures=$((failures + 1))
  fi
}

run_check C12-FND-001 "QA21 registry preserves exactly 180 IDs, family counts, evidence expressions and four-state status model" python3 -m bp_test_support --repo-root . validate-registry
run_check C12-FND-002 "Fourteen-site collision fixture preserves stable site UUIDs, intentional collisions and all 182 directed pairs" python3 -m bp_test_support --repo-root . validate-fixtures
run_check C12-FND-003 "CHAT12 Python foundation unit tests validate registry, fixtures, visual acceptance counts, initial NOT_EXECUTED state and OpenAPI binding" python3 -m unittest -v tests/contract/test_qa_foundation.py
run_check C12-FND-004 "Owner-approved RC9 OpenAPI source count/reference/scope verifier executes cleanly" python3 tooling/scripts/verify-openapi-contract.py
run_check C12-FND-005 "Existing JS/TS dependency boundary scanner reports a clean candidate graph" node tooling/scripts/check-js-boundaries.mjs
run_check C12-FND-006 "Existing Python dependency boundary scanner reports a clean candidate graph" python3 tooling/scripts/check-python-boundaries.py
run_check C12-FND-007 "No prohibited OpenAI/LLM/AI-provider runtime dependency is declared" python3 tests/contract/no-ai-runtime-dependencies.py
run_check C12-FND-008 "bp-test-support is not imported or declared by production runtime code" python3 tests/dependency/test-support-runtime-boundary.py
run_check C12-FND-009 "Integrated Wave-1 architecture/contract guard and RC9 contract test execute against this source candidate; the CHAT01-only empty-placeholder assertion is no longer applicable after CHAT02 population" bash -lc 'python3 tests/contract/wave1-integration-guard.py && node --test tests/contract/openapi-contract.test.mjs'
run_check C12-FND-010 "CHAT12 Python source compiles without syntax errors" python3 -m compileall -q packages/python/bp-test-support/src tests/contract tests/dependency tests/isolation
run_check C12-FND-011 "DOC-00-pinned source baseline and owner-approved RC9 provenance remain intact" python3 tests/contract/source-baseline-guard.py

python3 -m bp_test_support --repo-root . materialize-qa21
python3 -m bp_test_support --repo-root . coverage
python3 -m bp_test_support --repo-root . summarize-foundation
python3 -m bp_test_support --repo-root . certify-two-site
python3 -m bp_test_support --repo-root . certify-full

if [ "$failures" -ne 0 ]; then
  echo "FAIL CHAT12 foundation checks: $failures failed or blocked"
  exit 1
fi

echo "PASS CHAT12 foundation self-checks. QA21 release rows remain evidence-driven and unchanged unless actually executed."
