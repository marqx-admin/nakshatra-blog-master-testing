# DOC-15 RC10 executable contract generation

## Canonical source

`contracts/http/BLOG-DOC-15_openapi_v1.0-RC10.yaml`

Canonical SHA-256:

`001363acaf1f40d65edde67fb06f36990269e89ed1c699f221c4d545a6ea2e65`

RC10 is the WU-01 executable companion revision derived from the selected DOC-15 RC8 authority. The RC8 executable YAML remains unchanged and historical; the selected DOC-15 RC8 authority remains authoritative for its owned transport semantics.

## Required checks

`node tooling/scripts/check-openapi-source.mjs` verifies:

- OpenAPI 3.1.0 and API version 1.0-RC10;
- the canonical RC10 SHA-256;
- 113 operations / 86 paths / 245 schemas-helpers;
- 1,357 resolved internal `$ref` occurrences with zero unresolved references;
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
