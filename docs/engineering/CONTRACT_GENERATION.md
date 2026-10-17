# RC13 executable contract generation

## Canonical source

`contracts/http/BLOG-DOC-15_openapi_v1.0-RC13.yaml`

Canonical SHA-256:

`40e642fab61bae9f5fd60afac2ad76912cb6f1a5c1fe4e251dc7f0485f278461`

RC13 adds one reusable temporary URL schema and an optional Create Website response URL, while retaining the optional read-only SITE context URL. RC12 and earlier executable artifacts remain unchanged as historical revisions. The current Universal implementation rules, work unit, and final Blueprint control target behavior.

## Required checks

`node tooling/scripts/check-openapi-source.mjs` verifies:

- OpenAPI 3.1.0 and API version 1.0-RC13;
- the canonical RC13 SHA-256;
- 116 operations / 89 paths / 252 schemas-helpers;
- 1,400 resolved internal `$ref` occurrences with zero unresolved references;
- 12 AUTH / 3 PUBLIC-PREVIEW / 65 SITE / 36 GLOBAL operations;
- success distribution 200x88 / 201x16 / 202x3 / 204x9;
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

UF-06 owner-authorized amendment: adds PUB-BLOG-01 and BlogPageData to the existing public-page operation. No operation or database schema is added. Generated client operation lists are unchanged; source provenance stamps are refreshed. Tests and contract verification are deferred.

W4 generated-source authoring used `.venv/bin/python
tooling/generators/generate_openapi_artifacts.py --write`. The owner subsequently authorized automated verification. Drift checks, relevant
tests, typechecks and isolated builds passed; exact results are recorded in
apps/public-universal/W4_IMPLEMENTATION.md. Runtime gates remain separate.
