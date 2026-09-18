# CHAT 12 - QA Foundation Handoff

## Candidate identity

- Candidate: `WAVE1-INTEGRATED-4f08467ef901`
- Starting bundle SHA-256: `d41bb2a3b83dde4b8af53cbb58bda7ad0655f360a40565bbc093b853078bd5ba`
- Canonical RC7 OpenAPI SHA-256: `b338acb443500f06ed2141db66b416f7f0378d26fc96a57b93bfef50d19eff15`
- Scope: QA foundation rebound to the integrated Wave-1 source candidate; not a feature-complete release candidate.

## Ownership delivered

- `tests/` - QA registries, deterministic fixtures, static/contract checks, DB/E2E/load/DR harness structure, evidence, results, defect register and coverage.
- `packages/python/bp-test-support/` - stdlib-only test/evidence support package and CLI.

No product behavior is changed and no OpenAI/LLM/AI provider runtime dependency is added.

## Executed foundation evidence

- Foundation self-checks: **PASS** (11/11 PASS).
- These C12-FND checks prove only the QA foundation/static source candidate checks; they do **not** mark QA21 release rows PASS.
- QA21 release rows: **180 NOT_EXECUTED**.
- Two-site certification: **NOT_EXECUTED**; no `C12 - TWO_SITE_E2E_PASS` signal emitted.
- Full release certification: **NOT_EXECUTED**; no `C12 - FULL_QA_PASS` signal emitted.
- Defect register: 0 recorded defects. An empty register is not release evidence.

## Required later execution

1. Integrate specialist outputs through CHAT00 and bind the exact candidate identity.
2. Run applicable QA21 families in the DOC-21 environment class required for each row and attach the DOC-22 evidence expression.
3. Execute the real SITE-01/SITE-02 collision proof only after the frontend/backend/worker/search/media path is integrated.
4. After `C00 - FEATURE_COMPLETE_CANDIDATE_READY`, execute G21-0 through G21-7, DOC-25 89 assertions, DOC-26 112 assertions and DOC-27 2,281 assertions against that exact candidate.
5. For DOC-27 pixel-golden execution, use approved lossless goldens/font/assets and the approved acceptance companion. The current source bundle does not contain a production-ready expanded `contracts/acceptance.csv`; this handoff deliberately does not invent it.

## Key handoff paths

- `tests/run-foundation.sh`
- `tests/qa/qa21-registry.json`
- `tests/qa/source-authority-map.json`
- `tests/qa/environment-classes.json`
- `tests/qa/visual-acceptance-registry.json`
- `tests/fixtures/tenant-collision-v1.json`
- `tests/fixtures/permission-principal-templates-v1.json`
- `tests/evidence/candidate/candidate.json`
- `tests/evidence/manifests/evidence-manifest.json`
- `tests/evidence/results/qa21/qa21-status.json`
- `tests/evidence/results/foundation/foundation-summary.json`
- `tests/evidence/coverage/qa21-coverage-map.csv`
- `tests/evidence/coverage/release-gates.csv`
- `tests/evidence/coverage/visual-coverage-map.csv`
- `tests/evidence/defects/defect-register.json`
- `tests/evidence/two-site-certification.json`
- `tests/evidence/release-certification.json`
- `packages/python/bp-test-support/src/bp_test_support/`


## Wave-1 integration reconciliation

- CHAT02 database source, CHAT03 API/security source and CHAT11 infrastructure source are now present in the same candidate.
- CHAT03-specific tests remain preserved under `tests/`; CHAT12 is the continuing owner of the shared `tests/*` tree, while CHAT03 remains responsible for implementation fixes when those tests expose CHAT03 defects.
- This rebinding does not mark any of the 180 QA21 rows PASS. Runtime-dependent families remain NOT_EXECUTED/BLOCKED until their required environments and implementations exist.
