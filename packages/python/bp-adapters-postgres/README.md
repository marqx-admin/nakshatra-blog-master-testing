# bp-adapters-postgres

CHAT02 PostgreSQL persistence adapter for the DOC-23 RC2 Python ports/adapters boundary. It uses SQLAlchemy 2.0 for query/unit-of-work mechanics and Psycopg 3 as the driver. It intentionally contains **no schema creation, schema synchronization, HTTP behavior, authentication policy, lifecycle policy or AI/LLM dependency**. Raw SQL in `database/migrations/` remains the only schema authority.

## Runtime boundaries

- `create_site_engine(...)`: interactive SITE pool, expected to authenticate as `db_site_runtime`, maximum 20 configured connections per API process, 3-second pool checkout timeout.
- `create_worker_site_engine(...)`: worker SITE pool, maximum 10 configured connections per worker process, 10-second checkout timeout.
- `create_platform_engine(...)`: explicit GLOBAL pool, expected to authenticate as `db_platform_runtime`, no SITE-table grants.
- `validate_api_replica_pool_budget(...)`: validates the combined SITE + platform pool maxima for one API replica are <=20; `validate_aggregate_connection_budget(...)` preserves the separate <=70% database-wide application budget.
- `site_transaction(...)`: begins a transaction, applies transaction-local `app.site_id` on that same physical connection, verifies the observed UUID, and yields the connection. Commit/rollback clears the local context by PostgreSQL semantics.
- `platform_transaction(...)`: explicit GLOBAL transaction and no inherited SITE context. Authorization remains outside this adapter.
- repository helpers provide persistence-only same-site reads, Post expected-version compare-and-swap updates, and append-only SITE/GLOBAL audit inserts. SITE audit inserts bind `site_id` from `app.current_site_id()` so a high-risk mutation can persist its already-authorized audit event in the same transaction. Callers still own authorization, lifecycle/state validation, article validation, revision semantics, event-code selection and privacy-safe audit detail validation.

Site repository code must not lazy-load or issue SITE SQL after its `site_transaction` has exited. A client-supplied site key/UUID must never be passed here as "trusted" merely because it was supplied by a request.

## Integration note for CHAT00

CHAT01 intentionally left the Python workspace packages virtual and owns the root `uv.lock`. This package now declares `SQLAlchemy>=2.0,<2.1` and `psycopg>=3.3,<3.4`; CHAT00/CHAT01 integration must refresh the authoritative root Python lock/workspace wiring rather than CHAT02 silently modifying root-owned lock/config files.
