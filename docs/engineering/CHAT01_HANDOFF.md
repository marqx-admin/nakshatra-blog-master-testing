> **SOURCE-SYNC NOTICE (11 Sep 2026):** This is a historical CHAT01 handoff. Any RC7/RC4 or old count references are superseded by `docs/source-baseline.json` and DOC-00 v1.0-RC2. Current HTTP authority is DOC-15 RC8 / `BLOG-DOC-15_openapi_v1.0-RC8.yaml` (113 ops, 86 paths, 221 schemas/helpers, 1,311 refs; 12 AUTH / 2 PUBLIC-PREVIEW / 63 SITE / 36 GLOBAL); current discovery authority is DOC-16 RC5.

# CHAT01 Handoff

> **Wave-2 supersession note:** this file preserves CHAT01 lineage. The active integrated HTTP baseline is now DOC-15 RC8 at `contracts/http/BLOG-DOC-15_openapi_v1.0-RC8.yaml`, SHA-256 `bf577a463b4c5d8fdceddc2087f53216426ef88d67d8e1a0d22ccf819751cd00`. to CHAT00

## 1. CHAT01 summary

CHAT01 is now complete for repository foundation, shared technical contracts and engineering tooling. The earlier OpenAPI source blocker is resolved by the project-owner-approved controlled reconstructed RC7 replacement.

Implemented within CHAT01 scope:

- mixed-language Hybrid Monorepo root policy and two-lock strategy;
- exact 14 public-site ownership containers plus one Admin, one API and one Worker container;
- six approved TypeScript technical package roots and fifteen Python package distributions;
- canonical DOC-15 RC8 contract custody and provenance;
- executable RC7 count/reference/scope/status verification;
- deterministic generated TypeScript contract types and operation metadata;
- generated typed public and Admin API clients with exact operation-family exposure;
- deterministic generated-artifact drift checking;
- dependency-cruiser/Import-Linter policy configuration plus executable fallback boundary scanners;
- negative dependency fixtures and clean-state recovery tests;
- neutral future-site scaffold generator that creates no DB/content/permission/deployment state;
- root regression guard registry, execution evidence, manifest and checksums.

No CHAT02-12 database schema/RLS/seeds, API business/domain behavior, security mechanics, Worker jobs, public/Admin visual implementation, Docker/Kubernetes/CI deployment implementation or release certification is introduced.

## 2. Source baseline

The selected source register follows DOC-00 and current project-owner controls. Full machine-readable detail is in `docs/source-baseline.json`.

| Authority | Selected revision |
| --- | --- |
| DOC-00 | v1.0-RC1 |
| DOC-01 | v1.0-RC1 |
| DOC-02 | v1.0-RC1 |
| DOC-03 | v1.0-RC2 project-selected capability baseline |
| DOC-04..14 | v1.0-RC1 |
| DOC-15 | v1.0-RC8 + owner-approved canonical executable YAML |
| DOC-16 | v1.0-RC5 |
| DOC-17 | v1.0-RC2 |
| DOC-18 | v1.0-RC2 |
| DOC-19 | v1.0-RC2 |
| DOC-20..22 | v1.0-RC1 |
| DOC-23 | v1.0-RC2 |
| DOC-24 | v1.0-RC3 |
| DOC-25 | v1.0-RC2 |
| DOC-26 | v1.0-RC1 |
| DOC-27 | v1.0-RC1 |

Upload-copy suffixes are not semantic revisions.

## 3. OpenAPI resolution and provenance

Canonical repository source:

`contracts/http/BLOG-DOC-15_openapi_v1.0-RC8.yaml`

Active owner-approved replacement SHA-256:

`b338acb443500f06ed2141db66b416f7f0378d26fc96a57b93bfef50d19eff15`

Historical unavailable-original SHA-256:

`3376444e141fd16bbf0a440f2828de0e97d04b5f60a49e106b2d07013f8397b2`

The historical digest is retained only as `SUPERSEDED_PROVENANCE_ONLY`; it is not used to reject the approved replacement. `contracts/http/BLOG-DOC-15_openapi_v1.0-RC7.provenance.json` records the custody decision. The canonical replacement bytes are copied unchanged.

Verified executable-contract invariants:

| Assertion | Verified value |
| --- | ---: |
| HTTP operations | 112 |
| Unique paths | 85 |
| Schemas/helpers | 217 |
| Resolved internal `$ref` occurrences | 1,297 |
| Unresolved internal refs | 0 |
| AUTH operations | 11 |
| PUBLIC/PREVIEW operations | 2 |
| SITE operations | 63 |
| GLOBAL operations | 36 |
| 200 success | 85 |
| 201 success | 15 |
| 202 success | 3 |
| 204 success | 9 |

The verifier also confirms operation ID uniqueness, one 2xx success per operation, `x-success-status` parity, and operation-family-to-`x-site-context` mapping.

## 4. Generated contract and clients

Generated contract package:

- `packages/ts/api-contract/generated/openapi.ts` — TypeScript components, paths, operations and request/response maps;
- `packages/ts/api-contract/generated/operation-registry.ts` — exact method/path/scope/auth/permission/rate/idempotency/concurrency/request metadata;
- `packages/ts/api-contract/generated/contract-manifest.json` — source digest and operation exposure manifest.

Generated client boundaries:

- `@bp/api-client-public`: exactly `API15-PUB-001` and `API15-PUB-002`;
- `@bp/api-client-admin`: all and only 12 AUTH + 63 SITE + 36 GLOBAL operations = 111 operations.

Wire keys retain canonical spelling/casing. Client context values are request data only; they do not grant authorization. FastAPI-generated `/openapi.json` remains diagnostic only.

Generation commands:

```sh
node tooling/scripts/check-openapi-source.mjs
node tooling/generators/generate-api-contract.mjs
node tooling/scripts/check-generated-drift.mjs
```

All generation reads the canonical YAML only. No PDF reconstruction, RC5/RC6 substitution, FastAPI source promotion or implementation-inferred schema is used.

DOC-23 RC2 prescribes `openapi-typescript` 7.x in the controlled JS ecosystem. The execution runner cannot resolve npm packages, so a repository-local deterministic YAML generator was used to materialize and drift-check the committed source-derived TS contract/client artifacts. It does not change the YAML authority. An online controlled toolchain can add `openapi-typescript` parity evidence later.

## 5. Repository and application topology

Root engineering homes include `package.json`, `pnpm-workspace.yaml`, `pnpm-lock.yaml`, `turbo.json`, TypeScript/ESLint/Prettier/dependency-cruiser policy, `pyproject.toml`, `uv.lock`, Ruff/mypy/Import-Linter policy, `contracts/`, `database/`, `infrastructure/`, `tests/`, `tooling/` and `docs/`.

The exact public application registry remains:

| APP | SITE | Domain | Folder |
| --- | --- | --- | --- |
| APP-01 | SITE-01 | WhatsYourRashi.in | `site-01-whats-your-rashi` |
| APP-02 | SITE-02 | ApkiRashi.com | `site-02-apki-rashi` |
| APP-03 | SITE-03 | DailyRashi360.com | `site-03-daily-rashi-360` |
| APP-04 | SITE-04 | ZodiacDaily.in | `site-04-zodiac-daily` |
| APP-05 | SITE-05 | DailyHoroscope360.com | `site-05-daily-horoscope-360` |
| APP-06 | SITE-06 | MyHoroscope360.com | `site-06-my-horoscope-360` |
| APP-07 | SITE-07 | AstroToday360.com | `site-07-astro-today-360` |
| APP-08 | SITE-08 | ApkiKundli.com | `site-08-apki-kundli` |
| APP-09 | SITE-09 | MatchYourKundli.com | `site-09-match-your-kundli` |
| APP-10 | SITE-10 | ApkaNakshatra.com | `site-10-apka-nakshatra` |
| APP-11 | SITE-11 | JaniyePanchang.com | `site-11-janiye-panchang` |
| APP-12 | SITE-12 | RashiRemedies.com | `site-12-rashi-remedies` |
| APP-13 | SITE-13 | ApkaPandit.in | `site-13-apka-pandit` |
| APP-14 | SITE-14 | VastuShastra360.in | `site-14-vastu-shastra-360` |

Also present: one `apps/admin`, one `apps/api`, one `apps/worker`. Package metadata never substitutes for trusted Host -> SiteContext.

## 6. Package and dependency boundaries

TypeScript technical packages: `api-contract`, `api-client-public`, `api-client-admin`, `public-contracts`, `shared-utils`, `tooling-config`.

Python package containers preserve the DOC-23 physical-folder-to-import-namespace distinction, including `bp-domain -> bp_domain`, `bp-application -> bp_application`, and PEP 420 adapter namespaces under `bp_adapters.*`.

Static policy guards no site-to-site imports, no Admin/site presentation coupling, no frontend/provider access, no shared public visual runtime, Python inward dependency direction, and API/Worker entrypoint separation. Generated code is included in scans.

## 7. Test and evidence result

`CHAT01_TEST_RESULTS.md` and `evidence/chat01/` contain the executable record. Passing evidence includes:

- canonical OpenAPI SHA/version/count/reference/scope/status verification;
- deterministic generation and zero generated drift;
- public/Admin client operation exposure boundaries;
- TypeScript compilation of generated contract and clients;
- exact 14-site foundation topology;
- Python offline lock/sync and 17 import namespaces;
- JS/TS and Python boundary scans, including deliberate negative fixtures;
- formatting and config syntax checks;
- neutral future-site scaffold behavior.

External package-manager/runtime binaries unavailable in this runner remain explicitly `NOT_EXECUTED`: controlled pnpm/Turborepo install/build, target Node-24 Next/Vite builds, ESLint, Prettier engine, dependency-cruiser engine, Ruff, mypy and Import Linter. This is evidence-state discipline, not an OpenAPI blocker.

## 8. Handoff to later chats

CHAT02 receives the repository/Python package foundation and empty `database/{migrations,seeds,rls,verification}` ownership homes. It must implement DOC-08 raw SQL/RLS/seeds; ORM metadata cannot become DDL authority.

CHAT03 now receives the canonical verified RC7 YAML plus generated contract/client artifacts and may implement FastAPI transport parity against them. It must not regenerate the canonical contract from FastAPI.

CHAT11 receives reserved infrastructure roots and the two-lock/affected-graph foundation; no production deployment implementation is pre-created by CHAT01.

CHAT12 receives contract/foundation tests, regression guards, negative fixtures, manifest and raw evidence. Runtime-route/FastAPI parity and later specialist QA remain future evidence, not CHAT01 claims.

## 9. CHAT01 checkpoint

OpenAPI source blocker: **RESOLVED**.

CHAT01 foundation + canonical contract + generated TS clients: **READY** subject to the explicit environment-specific `NOT_EXECUTED` toolchain items above.

C01 — FOUNDATION_CONTRACTS_READY
