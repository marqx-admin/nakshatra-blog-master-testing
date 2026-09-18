# Isolation / PostgreSQL RLS harness

Release behavior is defined by DOC-21 ISO/DB suites, with expected results owned primarily by DOC-04 and DOC-08. The deterministic source fixture is `tests/fixtures/tenant-collision-v1.json` and deliberately produces all 182 directed tenant pairs.

Runtime execution must use real PostgreSQL with all 20 SITE-owned tables under `FORCE ROW LEVEL SECURITY`, a normal runtime role with no BYPASSRLS, and explicit transaction-local SiteContext. Missing scope, stale pooled scope, cross-site foreign keys, same-slug collisions and wrong-site IDs must be exercised rather than mocked.

The integrated Wave-1 candidate now contains the CHAT02 database implementation, but this execution environment still has no configured `psql`/PostgreSQL runtime. QA21-ISO-* and QA21-DB-* therefore remain `NOT_EXECUTED`; do not substitute SQLite/in-memory repositories for release evidence.
