# DOC-15 RC8 contract generation

## Canonical source

`contracts/http/BLOG-DOC-15_openapi_v1.0-RC8.yaml`

Canonical SHA-256:

`bf577a463b4c5d8fdceddc2087f53216426ef88d67d8e1a0d22ccf819751cd00`

RC8 is the project-owner-authorized minimum Wave-2 reconciliation revision and supersedes the accepted RC7 executable companion only for the recorded reconciliation decisions. The superseded RC7 artifact remains historical provenance under `evidence/historical/superseded/contracts/`.

## Required checks

`node tooling/scripts/check-openapi-source.mjs` verifies:

- OpenAPI 3.1.0 and API version 1.0-RC8;
- the canonical RC8 SHA-256;
- 113 operations / 86 paths / 221 schemas-helpers;
- 1,311 resolved internal `$ref` occurrences with zero unresolved references;
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
