# RC13 executable contract generation

## Canonical source

`contracts/http/BLOG-DOC-15_openapi_v1.0-RC13.yaml`

Canonical SHA-256:

`5c3d1246a313facce9b798331cbed5ec2293b3a8d8d0d1adb57373d6d7574eef`

RC13 adds one reusable temporary URL schema and an optional Create Website response URL, while retaining the optional read-only SITE context URL. RC12 and earlier executable artifacts remain unchanged as historical revisions. The current Universal implementation rules, work unit, and final Blueprint control target behavior.

## Required checks

`node tooling/scripts/check-openapi-source.mjs` verifies:

- OpenAPI 3.1.0 and API version 1.0-RC13;
- the canonical RC13 SHA-256;
- 113 operations / 86 paths / 249 schemas-helpers;
- 1,362 resolved internal `$ref` occurrences with zero unresolved references;
- 12 AUTH / 2 PUBLIC-PREVIEW / 63 SITE / 36 GLOBAL operations;
- success distribution 200x86 / 201x15 / 202x3 / 204x9;
- exact operation-prefix to `x-site-context` classification.

## Generated artifacts

`node tooling/generators/generate-api-contract.mjs` writes deterministic, DO-NOT-EDIT artifacts derived only from the canonical YAML:

- `packages/ts/api-contract/generated/openapi.ts`
- `packages/ts/api-contract/generated/operation-registry.ts`
- `packages/ts/api-contract/generated/contract-manifest.json`
- public client generated source exposing only API15-PUB-001/002;
- Admin client generated source exposing only API15-AUTH-*, API15-S-* and API15-G-*.

`node tooling/scripts/check-generated-drift.mjs` regenerates the same artifact set and requires byte-for-byte equality with committed generated outputs.

FastAPI-generated OpenAPI is diagnostic only and never canonical.
