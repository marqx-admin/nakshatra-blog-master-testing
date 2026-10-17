# Current implementation blockers and deferred evidence

## Wave-2 contract blockers

**Current unresolved Wave-2 contract blockers: 0.**

The seven CHAT00 reconciliation blockers `CB-W2-01` through `CB-W2-07` are resolved by the project-owner-authorized minimum revisions:

- BLOG-DOC-07 v1.0-RC2
- BLOG-DOC-08 v1.0-RC2
- BLOG-DOC-15 v1.0-RC8
- BLOG-DOC-16 v1.0-RC5
- canonical Universal executable OpenAPI `contracts/http/BLOG-DOC-15_openapi_v1.0-RC13.yaml`
- forward-only `DB-MIG-017`

The active RC13 OpenAPI SHA-256 is `40e642fab61bae9f5fd60afac2ad76912cb6f1a5c1fe4e251dc7f0485f278461`; RC12 and earlier executable files remain historical and unchanged. See the current contract provenance record for lineage.

## Execution-environment evidence limitations

These are **not contract blockers** and do not alter the source-complete Wave-2 result:

- live PostgreSQL/Redis/OpenSearch/object-storage/CDN/browser/cloud integration is `NOT_EXECUTED` in this runner where the required services are unavailable;
- dependency materialization/lock refresh for `pyvips>=3,<4` is `NOT_EXECUTED` because the external package registry/cache is unavailable. The package manifest is correct and the existing lockfile was not fabricated;
- full dependency-materialized Admin build/browser/Vitest evidence remains `NOT_EXECUTED` where the controlled Node 24/pnpm dependency environment is unavailable.

Static contract, generated-drift, database, application, security/isolation, Admin structure and Wave-2 reconciliation tests are recorded under `evidence/chat00-wave2-final/`.

W4 coding amendment: automatic website keys, private whole-site preview and setup
readiness are implemented. Owner-authorized focused automated checks passed;
exact results are in apps/public-universal/W4_IMPLEMENTATION.md. Runtime testing
remains deferred. DB-MIG-022 and DB-MIG-023 remain unapplied. Domain/TLS, security, platform
health and launch approval are NOT_VERIFIED; setup readiness never activates a site.
