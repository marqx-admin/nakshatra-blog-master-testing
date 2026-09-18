# CHAT 12 QA, Acceptance, Evidence and Release Certification

This directory is the executable QA ownership zone for CHAT 12. DOC-21 defines release test behavior and evidence; DOC-22 defines trace/evidence governance. Expected behavior always comes from the specialist owning document referenced by the QA21 row.

## Evidence rule

Specification is not implementation evidence. Source existing is not PASS. A release result is PASS only after that exact QA21 test instance executes against an identified candidate and the required evidence is attached. The only result states in this CHAT 12 handoff are `PASS`, `FAIL`, `BLOCKED`, and `NOT_EXECUTED`.

The initial handoff deliberately materializes all 180 QA21 rows as `NOT_EXECUTED`. Foundation self-checks use separate `C12-FND-*` IDs so they cannot be confused with release evidence.

## Layout

- `qa/` - frozen QA21 registry, release gates, expected-behavior ownership, visual-acceptance registries.
- `fixtures/` - deterministic 14-site collision data and principal templates.
- `contract/` - source/OpenAPI/registry/dependency guards.
- `isolation/` - DB/RLS and tenant-isolation runtime harness entry points.
- `e2e/` - browser/end-to-end structure and two-site proof plan.
- `accessibility/` - WCAG plus DOC-25/26/27 visual-acceptance plan.
- `performance/` - DOC-20 LT20 scenario registry and k6 handoff contract.
- `dr/` - DOC-20/24 backup, PITR and DR execution plan.
- `evidence/` - candidate identity, manifests, results, defect register and coverage summaries.

No production behavior is defined here. Tests must fail or block rather than change the product to make an assertion pass.
