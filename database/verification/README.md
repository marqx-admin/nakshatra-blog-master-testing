# CHAT02 database verification

These artifacts verify the DOC-08 raw SQL implementation without creating a second schema authority.

`verify_static.py` performs source-level drift checks without PostgreSQL. It verifies the exact 16 migration inventory/order, exact 33-table and 20/13 scope inventory, all 324 DOC-08 column names/types/nullability, constraint-family counts, 70 required baseline index/uniqueness objects, same-site FK patterns, the 20-table RLS/immutability inventories, runtime-role/grant restrictions, 69 permissions, 57 prerequisite pairs, 14 stable sites/domains, fixture guards, migration execution ordering and adapter boundaries.

`apply_from_empty.sh` and `apply-chain.sql` are the clean-database execution harness. The caller supplies `POSTGRES_DSN` plus `SITE_01_TIMEZONE` through `SITE_14_TIMEZONE`; no timezone is invented. DB-MIG-001 runs under the bootstrap identity, then DB-MIG-002..016 run as `db_migrator` in the same psql session under one advisory migration lock.

`verify-schema.sql`, `verify-rls.sql` and `verify-seeds.sql` are read-only live catalog/data assertions. `apply_test_fixtures.sh` applies the guarded DOC-08 isolation fixture. `verify-behavior.sql` executes rollback-scoped RLS/cross-site/global-boundary probes. `verify_runtime.py` adds live catalog, RLS, fixture, role and two-connection expected-version concurrency verification through Psycopg.

Typical test-database flow:

```sh
export POSTGRES_DSN='postgresql://<verification-bootstrap-identity>@<test-db>/<db>'
# Export all SITE_01_TIMEZONE ... SITE_14_TIMEZONE deployment/test inputs.
database/verification/apply_from_empty.sh
database/verification/apply_test_fixtures.sh
psql "$POSTGRES_DSN" -v ON_ERROR_STOP=1 -f database/verification/verify-schema.sql
psql "$POSTGRES_DSN" -v ON_ERROR_STOP=1 -f database/verification/verify-rls.sql
psql "$POSTGRES_DSN" -v ON_ERROR_STOP=1 -f database/verification/verify-seeds.sql
psql "$POSTGRES_DSN" -v ON_ERROR_STOP=1 -f database/verification/verify-behavior.sql
python database/verification/verify_runtime.py
```

A source/static PASS is not PostgreSQL runtime evidence. If `psql`, PostgreSQL 17, Psycopg, credentials, or a disposable database are unavailable, the corresponding live result is `NOT_EXECUTED`, not PASS.
