# Coolify release report

## Delivered runtime

- Hostinger VPS / Coolify Docker Compose deployment at `infrastructure/coolify/compose.yaml`.
- 14 independent public Next.js services, Central Admin, FastAPI API, seven Worker profiles.
- Private PostgreSQL 17 with internal TLS, two independent persistent Redis planes, OpenSearch, MinIO private object storage, and ScyllaDB Alternator shared security state.
- No AWS cloud dependency in the active self-hosted runtime. The Python AWS SDK is used only as the S3/Dynamo protocol client for MinIO and ScyllaDB.
- Durable, fail-closed database migration ledger and post-migration runtime-role credential provisioning.
- Coolify environment-to-file secret materialization for database and SMTP credentials.
- Same-origin Central Admin `/api/*` reverse proxy.
- Site-aware private-origin media delivery gateway with active-site, active-media, public-usage, native-variant, MIME/extension, and object-namespace enforcement.

## Defects corrected

- Corrected the Next.js standalone container working directory.
- Pinned pnpm 10 for local and container builds and repaired shared TypeScript compiler ownership.
- Added missing Python test/tool dependencies and stable repository test-package resolution.
- Serialized the deliberate dependency-boundary test to prevent its temporary negative fixture racing a clean scan.
- Added `libvips42` to API and Worker build/runtime images.
- Added `.dockerignore` to prevent local build outputs, dependencies, secrets, caches, and evidence from entering the Coolify build context.
- Added a Coolify/VS Code runbook, service/domain map, DNS sequence, health checks, and backup minimum.

## Verification completed

- 90 existing Python tests passed; 2 new media-gateway tests passed.
- 12 foundation/contract tests passed.
- Central Admin, all six shared TypeScript packages, and all 14 public sites passed TypeScript checks.
- Central Admin and all 14 public sites completed production builds.
- Canonical RC8 OpenAPI verification and generated-artifact drift checks passed: 113 operations, 86 paths, 221 schemas/helpers, 1,311 resolved references.
- Coolify Compose static validation passed: 33 services, exactly 14 site mappings, no host-published private ports, required durable volumes, and self-hosted runtime selection.
- New Python deployment/media files pass targeted Ruff checks and bytecode compilation; the PostgreSQL entrypoint passes shell syntax checking.

## Environment limitations

- A Docker daemon is not present in the source-review environment, so image builds and the live 33-service Compose boot must be run on a Docker-capable VS Code machine or the Coolify VPS.
- The requested supervised Sites browser preview could not resolve the monorepo package manager inside its isolated preview filesystem. The root preview entrypoint was corrected to invoke pnpm through Corepack, but the Sites workflow's bounded retry allowance was exhausted before a browser session became available.
- Repository-wide strict Mypy and Ruff enforcement expose substantial inherited annotation/formatting debt in older backend modules. Runtime and contract tests pass; this debt should be handled as a separate mechanical hardening release rather than bulk-rewriting accepted business logic during deployment remediation.
