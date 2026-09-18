# Wave-1 CHAT02 ↔ CHAT03 Reconciliation

Candidate: `WAVE1-INTEGRATED-4f08467ef901`

## Integrated seam

CHAT02's PostgreSQL implementation and CHAT03's stable transaction interfaces now coexist in the same repository.

CHAT03 stable ports remain authoritative at `packages/python/bp-ports/src/bp_ports/core.py`:

- `SiteTransactionPort.transaction(context: SiteContext)`
- `GlobalTransactionPort.transaction(context: GlobalContext)`

The existing CHAT02 primitives are exposed through a narrow adapter bridge in:

`packages/python/bp-adapters-postgres/src/bp_adapters/postgres/ports.py`

with:

- `PostgresSiteTransactionPort`
- `PostgresGlobalTransactionPort`

The bridge is implementation wiring only. It does not change DOC-08 SQL/RLS, DOC-15 HTTP contracts, or CHAT03 SiteContext semantics. It fails closed for an invalid/missing SITE or GLOBAL context and delegates transaction mechanics to CHAT02's existing adapter.

`tests/integration/test_wave1_transaction_ports.py` executes the interface bridge without pretending to prove live PostgreSQL/RLS behavior.

## Namespace reconciliation

CHAT03 transport delivered provider implementations under top-level import names that duplicated the DOC-23 canonical adapter namespace. During integration they were normalized to the already-established package namespace:

- `bp_adapters.security_store`
- `bp_adapters.secrets`
- `bp_adapters.mail`

The old duplicate top-level import trees were removed and CHAT03 imports/tests updated. Package roots did not change and no second adapter packages were created. This is a repository/import-path reconciliation under DOC-23, not a product/security contract change.

## Remaining CHAT03 database follow-up

Transaction wiring is complete, but production composition of all CHAT03 persistence-facing ports is intentionally **not** invented by the integrator. CHAT03 must follow up after PostgreSQL runtime/tooling is available to bind its stable interfaces to verified DOC-08 persistence, including at minimum the production `SiteRegistryPort`, authoritative `IdentityAuthorizationPort`, and durable append-only `AuditPort` path where the current composition still uses non-PostgreSQL/test seams.

That follow-up must:

1. reuse the existing DOC-08 schema and CHAT02 adapter primitives;
2. preserve CHAT03's stable context/security interfaces;
3. preserve the RC7 HTTP contract unchanged;
4. execute live PostgreSQL/RLS integration tests against a clean migrated database;
5. demonstrate pooled-connection SiteContext reset/fail-closed behavior and wrong-site non-disclosure with real RLS.

Until that runtime evidence exists, `DATABASE_VERIFIED` and PostgreSQL/RLS-backed CHAT03 integration remain NOT_EXECUTED/BLOCKED_BY_RUNTIME.
