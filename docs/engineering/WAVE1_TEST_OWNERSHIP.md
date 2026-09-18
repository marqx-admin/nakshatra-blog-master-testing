# Wave-1 Test Ownership Reconciliation

Candidate: `WAVE1-INTEGRATED-4f08467ef901`

After Wave-1 integration, `tests/` is one shared repository tree. CHAT12 is the continuing owner of the test/evidence architecture under `tests/*`.

CHAT03's valid specialist tests are intentionally preserved in that tree:

- `tests/contract/test_chat03_interfaces.py`
- `tests/contract/test_chat03_openapi.py`
- `tests/contract/test_chat03_runtime.py`
- `tests/application/test_chat03_application_services.py`
- `tests/isolation/test_chat03_context.py`
- `tests/e2e/test_chat03_auth.py`
- `tests/security/test_chat03_security_deep.py`
- `tests/adapters/test_chat03_security_adapters.py`

Integration also adds `tests/integration/test_wave1_transaction_ports.py` and `tests/contract/wave1-integration-guard.py`.

Ownership rule going forward:

1. CHAT12 controls organization, evidence semantics, QA21 mapping and continuing changes under `tests/*`.
2. CHAT03 remains responsible for fixing CHAT03 implementation defects exposed by those tests.
3. A future CHAT03 handoff must not replace or delete the shared `tests/` tree; test changes require coordination through the integrated repository.
4. Source/static/foundation PASS does not mark QA21 rows PASS. QA21 remains candidate/environment/evidence specific.

The original CHAT01-only foundation assertion that database/infrastructure specialist roots contain no substantive files is retained as historical CHAT01 evidence but is not an applicable Wave-1 acceptance predicate after intentional CHAT02/CHAT11 population. `tests/run-foundation.sh` therefore uses the Wave-1 integration guard for `C12-FND-009` on this candidate.
