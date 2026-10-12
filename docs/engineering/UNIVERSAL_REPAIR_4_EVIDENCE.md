# Universal Repair 4 — code evidence and parity initialization

This is a Repair 4 code report, not the final WU-07 evidence ledger or deployment acceptance.

## Starting state and preservation

Branch: `universal-platform-implementation`. HEAD: `0b6eb969d304b661c8f6139cecf33755f2e6e21c`.
Starting tree: 82 modified tracked files and 9 untracked files. Repairs 1–3 remained in place.
No reset, stash, clean, revert, commit, push, merge, deployment, browser, DNS or live database operation was performed.
RC13 YAML/provenance are unchanged from their starting bytes. All 1,064 tracked legacy app files and all 22 tracked migration-directory files match HEAD byte-for-byte (including DB-MIG-001–019).
The Public build regenerated `next-env.d.ts` to the committed production-types import; its prior dev-types import was a generated development artifact, not a repair implementation.

## Editor triage

Before edits, the contextual-transform test passed (1 selected, 29 skipped), and the full Admin suite passed (63 Vitest tests plus 20 Node tests). No editor source/test changes were made.
A concurrent validation run later failed an editor link test and timed out a WU-05 temporary-URL test; a serial full rerun passed all 63 Vitest tests and 20 Node tests. The reported “Heading converted” failure did not reproduce. Timing/environment sensitivity is plausible; no specific cause or regression was proven. Do not treat the successful rerun as a fix to the editor.

## Existing implementation and repaired gaps

The shared catalogue already contained fourteen locked parity entries, complete style/custom defaults, approved palette/type tokens and width/radius bands. The Universal route tree, fixed shell, public PageData adapter and Host-based registry were already present. No legacy implementation is imported by the Universal renderer.

Three gaps were repaired:

1. Parity starting configs inherited generic tag/author/search collection profiles and related/collection article-card profiles. They now explicitly reuse each parity entry's collection and article-card selections across those surfaces.
2. Spacious parity designs inherited standard section spacing. Spacing now follows the locked density for the complete starting config.
3. The frontend interpreted `source: SAFE_DEFAULT` with the response's compatibility style descriptor as a selected style. Both shell selection and CSS token projection now resolve that source to the platform SAFE_DEFAULT. Tenant identity/content remain the current response's data.

A fourth gap was operational: existing seed settings have no initial parity presentation JSON. A review-only initialization generator now emits complete configs and guarded SQL from the shared catalogue. Runtime reads deliberately do not silently infer a parity config from `site_key`.

## Persistence / initialization

Commands (emit only; they do not connect to any database):

```sh
node tooling/scripts/plan-legacy-parity.mjs --json
node tooling/scripts/plan-legacy-parity.mjs --sql
```

The SQL requires existing sites/settings and the RLS-bound `db_site_runtime` role. It uses one transaction, authoritative site-key-to-ID lookup, transaction-local tenant context verification, strict settings lookup and row locking. Each update is scoped to that ID and a NULL presentation config with schema version 1. Every non-NULL config is preserved, including owner customization or invalid configs requiring separate review. Missing prerequisites abort the transaction. Only presentation fields and the settings update timestamp change. No domain, identity, content, navigation, static page or infrastructure rows are created or altered.

Plan completeness is validated by the real RC13 presentation policy. SQL safety guards are source-tested; PostgreSQL execution, rollback, grants and RLS behavior of the plan are NOT VERIFIED here. The emitted plan has not been applied. Do not rerun `initial-sites.sql` as a substitute: that seed has unrelated identity/domain upserts.

## Fourteen-site evidence matrix

A = catalogue/config defined and validated. B = initialization generation and guard checks passed; actual persisted state unverified. C = synthetic tenant-owned rows through real registry/context/transaction/PageData code and shared renderer. D = actual registered tenant runtime. E = browser visual parity.

| Site | Name | Palette / type | Home | Article / card | Collection | Density | Locked width → runtime | Radius band → runtime | A | B | C | D | E |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| SITE-01 | WhatsYourRashi | PAL-01 / TYPE-01 | HOME-01 | ART-01 / CARD-01 | COL-01 | SPACIOUS | 1200 → 1200px | RADIUS-SOFT → 18px | PASS | PASS (plan checks); persistence NOT VERIFIED | PASS | NOT VERIFIED | NOT EXECUTED |
| SITE-02 | ApkiRashi | PAL-02 / TYPE-02 | HOME-01 | ART-01 / CARD-01 | COL-02 | STANDARD | 1200 → 1200px | RADIUS-MEDIUM → 12px | PASS | PASS (plan checks); persistence NOT VERIFIED | PASS | NOT VERIFIED | NOT EXECUTED |
| SITE-03 | DailyRashi360 | PAL-03 / TYPE-03 | HOME-03 | ART-14 / CARD-01 | COL-01 | STANDARD | 1200 → 1200px | RADIUS-SOFT → 18px | PASS | PASS (plan checks); persistence NOT VERIFIED | PASS | NOT VERIFIED | NOT EXECUTED |
| SITE-04 | ZodiacDaily | PAL-04 / TYPE-04 | HOME-02 | ART-04 / CARD-01 | COL-02 | SPACIOUS | 1200 → 1200px | RADIUS-ROUND → 24px | PASS | PASS (plan checks); persistence NOT VERIFIED | PASS | NOT VERIFIED | NOT EXECUTED |
| SITE-05 | DailyHoroscope360 | PAL-05 / TYPE-05 | HOME-14 | ART-01 / CARD-01 | COL-02 | STANDARD | 1240 → 1200px | RADIUS-SOFT → 18px | PASS | PASS (plan checks); persistence NOT VERIFIED | PASS | NOT VERIFIED | NOT EXECUTED |
| SITE-06 | MyHoroscope360 | PAL-06 / TYPE-06 | HOME-04 | ART-03 / CARD-29 | COL-04 | STANDARD | 1120 → 1120px | RADIUS-SOFT → 18px | PASS | PASS (plan checks); persistence NOT VERIFIED | PASS | NOT VERIFIED | NOT EXECUTED |
| SITE-07 | AstroToday360 | PAL-07 / TYPE-07 | HOME-01 | ART-01 / CARD-01 | COL-01 | STANDARD | 1280 → 1280px | RADIUS-MEDIUM → 12px | PASS | PASS (plan checks); persistence NOT VERIFIED | PASS | NOT VERIFIED | NOT EXECUTED |
| SITE-08 | ApkiKundli | PAL-08 / TYPE-08 | HOME-01 | ART-01 / CARD-01 | COL-02 | STANDARD | 1240 → 1200px | RADIUS-SUBTLE → 8px | PASS | PASS (plan checks); persistence NOT VERIFIED | PASS | NOT VERIFIED | NOT EXECUTED |
| SITE-09 | MatchYourKundli | PAL-09 / TYPE-09 | HOME-01 | ART-01 / CARD-01 | COL-02 | SPACIOUS | 1200 → 1200px | RADIUS-SOFT → 18px | PASS | PASS (plan checks); persistence NOT VERIFIED | PASS | NOT VERIFIED | NOT EXECUTED |
| SITE-10 | ApkaNakshatra | PAL-10 / TYPE-10 | HOME-01 | ART-01 / CARD-01 | COL-01 | SPACIOUS | 1200 → 1200px | RADIUS-MEDIUM → 12px | PASS | PASS (plan checks); persistence NOT VERIFIED | PASS | NOT VERIFIED | NOT EXECUTED |
| SITE-11 | JaniyePanchang | PAL-11 / TYPE-11 | HOME-01 | ART-01 / CARD-01 | COL-01 | STANDARD | 1160 → 1120px | RADIUS-SUBTLE → 8px | PASS | PASS (plan checks); persistence NOT VERIFIED | PASS | NOT VERIFIED | NOT EXECUTED |
| SITE-12 | RashiRemedies | PAL-12 / TYPE-12 | HOME-01 | ART-01 / CARD-01 | COL-01 | SPACIOUS | 1120 → 1120px | RADIUS-SOFT → 18px | PASS | PASS (plan checks); persistence NOT VERIFIED | PASS | NOT VERIFIED | NOT EXECUTED |
| SITE-13 | ApkaPandit | PAL-13 / TYPE-13 | HOME-01 | ART-01 / CARD-01 | COL-01 | SPACIOUS | 1160 → 1120px | RADIUS-MEDIUM → 12px | PASS | PASS (plan checks); persistence NOT VERIFIED | PASS | NOT VERIFIED | NOT EXECUTED |
| SITE-14 | VastuShastra360 | PAL-14 / TYPE-14 | HOME-01 | ART-01 / CARD-01 | COL-01 | STANDARD | 1280 → 1280px | RADIUS-SQUARE → 4px | PASS | PASS (plan checks); persistence NOT VERIFIED | PASS | NOT VERIFIED | NOT EXECUTED |

For **each row**, C includes its own name/logo/media, palette and typography tokens, Home recipe, article and card profiles, collection layouts, content and navigation, canonical SEO, five fixed pages, known-site 404/410 and the common fixed shell. The 13-route matrix totals 182 backend projections and 182 component renders. Responsive/a11y code checks are shared for each row, not browser measurements. Each row's remaining issue is actual settings/domain/content inventory, authorized runtime integration and browser acceptance; overall status is **PASS for fixture/code evidence; NOT VERIFIED for tenant runtime; NOT EXECUTED for browser acceptance**.

### Width / radius fidelity limits

Original width values remain recorded in the catalogue. Existing approved RC13 width bands normalize 1160 to 1120 and 1240 to 1200; other listed widths are exact. Existing radius bands are 4/8/12/18/24px, so original 6/10/14/16/20px targets resolve to their approved bands. Those mappings were preserved, not newly approved by this repair. The report does not claim exact pixel parity where contract tokens cannot express it. No arbitrary IDs or RC14 were introduced.

## Trusted request flow and isolation

Incoming Host → SSR `X-BP-Public-Host` (no-store) → real registry lookup of registered active domain → TrustedContextService lifecycle gate → site-local transaction context → PostgresPublicPageAdapter → stored presentation/common shell/content projection → PublicRoutePage selected by page type.

Synthetic SQL results drive the real production registry/transaction/PageData classes; the fixture asserts site-scoped query parameters. Exported PageData then drives the real Universal components. SSR tests separately mock only HTTP transport and interleave SITE-01/04/11/06/14 Hosts. This proves code wiring and request-local behavior, not a live PostgreSQL RLS policy. Owner edits are respected, invalid configs safely fall back, unknown Hosts and DISABLED sites fail closed. No mutable tenant-global design state or tenant renderer switch was added.

## Surface findings

- **Branding:** approved response logo/name/media, palette/type and Devanagari-capable stacks. Actual production assets/fonts and rendering remain unverified.
- **Home:** intro/lead, selected posts, selected categories and latest use the existing recipe engine. SITE-03 HOME-03, SITE-04 HOME-02, SITE-05 HOME-14 and SITE-06 HOME-04 are explicitly checked, with no synthetic public filler.
- **Article/cards/collections:** SITE-03 ART-14, SITE-04 ART-04 and SITE-06 ART-03/CARD-29 are preserved. Related and all collection surfaces now follow their parity choices. Exact 12 ArticleBody block rendering remains covered.
- **Shell:** one fixed Header/Footer, ordered navigation, Search, keyboard/mobile behavior, minimal branded Footer, known-site 404/410 shell. No tenant structural selector.
- **Information pages:** exactly About, Contact, Privacy, Terms, Disclaimer. Synthetic enabled structured fixtures render; disabled page returns known-site 404. Actual legal content readiness NOT VERIFIED; no legal copy was written to any tenant.
- **Content/navigation:** own fixture posts, author/taxonomy/media and own enabled navigation; no Admin preview samples in public output. Existing APIs/menu architecture retained.
- **SEO/Preview:** canonical/meta derive from trusted PageData; search noindex, Preview authorization/cookie/Host flow and temporary-host crawler protections remain covered by existing tests. No live cookie/proxy/crawler acceptance claimed.
- **Responsive/accessibility:** existing <768 mobile, 768–1199 tablet, >=1200 desktop rules, mobile menu focus/Escape, visible focus, grids/footer stacking, article media and table overflow checks pass. Actual touch, font delivery, viewport overflow and browser accessibility remain unaccepted.
- **Future tenants:** SITE-15/SITE-100 remain data-driven; no parity entry is guessed for them. Existing provisioning, CUSTOM baseline and SITE-N tests pass without new apps/services/environment families.

## Validation

- Catalogue typecheck and tests: PASS, 11 tests.
- Public Universal typecheck, tests and build: PASS, 48 tests; shared dynamic routes built.
- Full Python: PASS, 246 tests, 18 warnings (including deprecated jsonschema RefResolver); no live PostgreSQL acceptance harness executed.
- Admin typecheck: PASS. Full Admin baseline and serial final rerun: PASS, 63 Vitest + 20 Node tests. Concurrent run: FAIL, two timing-sensitive tests as recorded above.
- JS/Python boundaries, foundation, OpenAPI source, generated drift: PASS.
- Node OpenAPI contract tests: PASS, 4 tests.
- Database static verification: PASS, zero failed checks. Migration integrity: byte comparison PASS for every tracked migration-directory file.
- RC13 preservation: PASS against start-of-task hashes; RC12 remains unchanged by this repair.
- `git diff --check`: PASS (final check recorded alongside status).
- Browser/live database/deployment: NOT EXECUTED, excluded by task scope.

## Remaining acceptance and Repair 5

No contract/schema blocker was found. The initialization plan needs separately authorized application and real database verification before claiming B persisted or D runtime. Existing customized configs require owner review rather than overwrite. Width/radius band normalization must be visible in later parity acceptance.

For every one of the fourteen real tenants: inventory stored config/identity/logo/content/navigation/fixed-page readiness/domains; verify authoritative Host routing, isolated concurrent requests, registered canonical redirects, media ownership, known 404/410 and unknown-host neutrality; test desktop/tablet/mobile layouts, keyboard/focus/touch/overflow/Devanagari, Home/article/collections, SEO/crawlers and authorized Preview. Preserve legacy apps for rollback until those gates pass. None was run here.

Repair 5 must consolidate all Repairs 1–4 regression evidence, account for intermittent Admin test behavior, resolve actual data/init acceptance and explicitly retain runtime/browser gaps in the final WU-07 ledger. This file does not finalize that ledger.

## Exact Repair 4 file changes

Modified implementation/tests:

- `packages/ts/presentation-catalogue/src/registry.ts`
- `packages/ts/presentation-catalogue/tests/registry.test.mjs`
- `apps/public-universal/src/site/lib/presentation.ts`
- `apps/public-universal/src/site/shell/navigation/site-shell.tsx`

Added:

- `tooling/scripts/plan-legacy-parity.mjs`
- `tests/fixtures/universal_parity.py`
- `tests/application/test_repair4_parity.py`
- `apps/public-universal/src/site/tests/parity-integration.test.mjs`
- `docs/engineering/UNIVERSAL_REPAIR_4_EVIDENCE.md`

Removed: none. Build artifact: `apps/public-universal/next-env.d.ts` regenerated to HEAD and is now clean. All other prior dirty files are unchanged from start. The two previously dirty catalogue files were extended; their existing repair code was retained.

## Starting Git status

```text
 M README.md
 M apps/admin/README.md
 M apps/admin/package.json
 M apps/admin/src/modules/appearance/AppearanceControls.tsx
 M apps/admin/src/modules/appearance/appearance-model.ts
 M apps/admin/src/modules/global/CreateWebsitePage.tsx
 M apps/admin/src/modules/site/AppearancePage.tsx
 M apps/admin/src/styles/admin.css
 M apps/admin/src/tests/wu05.test.tsx
 M apps/api/README.md
 M apps/api/src/bp_api/app.py
 M apps/api/src/bp_api/composition/global_postgres.py
 M apps/api/src/bp_api/composition/presentation.py
 M apps/api/src/bp_api/composition/production.py
 M apps/api/src/bp_api/composition/self_hosted.py
 M apps/api/src/bp_api/composition/two_site_e2e.py
 M apps/api/src/bp_api/config/settings.py
 M apps/api/src/bp_api/http/contract.py
 M apps/api/src/bp_api/http/site/routes.py
 M apps/public-universal/next-env.d.ts
 M apps/public-universal/next.config.ts
 M apps/public-universal/src/site/lib/response-validation.ts
 M apps/public-universal/src/site/pages/home/home-page.tsx
 M apps/public-universal/src/site/shell/header/site-header.tsx
 M apps/public-universal/src/site/shell/navigation/navigation-tree.tsx
 M apps/public-universal/src/site/styles/globals.css
 M apps/public-universal/src/site/tests/design-engines.test.mjs
 M apps/public-universal/src/site/tests/shell.test.mjs
 M apps/public-universal/src/site/tests/universal-foundation.test.mjs
 M contracts/http/README.md
 M docs/engineering/CONTRACT_GENERATION.md
 M docs/engineering/KNOWN_BLOCKERS.md
 M docs/source-baseline.json
 M infrastructure/config/development.env.example
 M infrastructure/config/test.env.example
 M infrastructure/coolify/compose.yaml
 M infrastructure/local/README.md
 M infrastructure/scripts/release_manifest.py
 M packages/python/bp-adapters-postgres/src/bp_adapters/postgres/runtime.py
 M packages/ts/api-client-admin/README.md
 M packages/ts/api-client-admin/package.json
 M packages/ts/api-client-admin/src/generated.ts
 M packages/ts/api-client-public/README.md
 M packages/ts/api-client-public/package.json
 M packages/ts/api-client-public/src/generated.ts
 M packages/ts/api-contract/README.md
 M packages/ts/api-contract/generated/README.md
 M packages/ts/api-contract/generated/contract-manifest.json
 M packages/ts/api-contract/generated/openapi.ts
 M packages/ts/api-contract/generated/operation-registry.ts
 M packages/ts/api-contract/package.json
 M packages/ts/presentation-catalogue/src/registry.ts
 M packages/ts/presentation-catalogue/tests/registry.test.mjs
 M tests/application/test_wu02_foundation.py
 M tests/application/test_wu05_temporary_site_context.py
 M tests/contract/openapi-contract.test.mjs
 M tests/contract/source-baseline-guard.py
 M tests/contract/test_chat03_openapi.py
 M tests/contract/test_chat03_production_composition.py
 M tests/contract/test_chat03_runtime.py
 M tests/contract/test_wave2_contract_resolution.py
 M tests/contract/test_wave2_full_assembly.py
 M tests/contract/test_wave2_provisional_integration.py
 M tests/contract/test_wu01_contract.py
 M tests/contract/wave1-integration-guard.py
 M tests/dependency/foundation.test.mjs
 M tests/e2e/test_chat03_auth.py
 M tests/evidence/universal-implementation-coverage.json
 M tests/run-foundation.sh
 M tooling/configs/openapi-baseline.json
 M tooling/configs/regression-guards.json
 M tooling/dependency-rules/policy.json
 M tooling/generators/generate-api-contract.mjs
 M tooling/generators/generate_openapi_artifacts.py
 M tooling/scripts/check-foundation.mjs
 M tooling/scripts/check-generated-drift.mjs
 M tooling/scripts/check-openapi-source.mjs
 M tooling/scripts/dev-public-universal.mjs
 M tooling/scripts/dev.mjs
 M tooling/scripts/run-chat01-evidence.sh
 M tooling/scripts/run-local-api.py
 M tooling/scripts/verify-openapi-contract.py
?? apps/admin/src/modules/appearance/RepresentativeWebsitePreview.tsx
?? apps/admin/src/modules/appearance/VisualAppearanceControls.tsx
?? apps/public-universal/AGENTS.md
?? apps/public-universal/CLAUDE.md
?? apps/public-universal/src/site/pages/home/home-composition.tsx
?? apps/public-universal/src/site/tests/home-composition.test.mjs
?? contracts/http/BLOG-DOC-15_openapi_v1.0-RC13.provenance.json
?? contracts/http/BLOG-DOC-15_openapi_v1.0-RC13.yaml
?? packages/python/bp-domain/src/bp_domain/temporary_site_url.py
```

## Final Git status

```text
 M README.md
 M apps/admin/README.md
 M apps/admin/package.json
 M apps/admin/src/modules/appearance/AppearanceControls.tsx
 M apps/admin/src/modules/appearance/appearance-model.ts
 M apps/admin/src/modules/global/CreateWebsitePage.tsx
 M apps/admin/src/modules/site/AppearancePage.tsx
 M apps/admin/src/styles/admin.css
 M apps/admin/src/tests/wu05.test.tsx
 M apps/api/README.md
 M apps/api/src/bp_api/app.py
 M apps/api/src/bp_api/composition/global_postgres.py
 M apps/api/src/bp_api/composition/presentation.py
 M apps/api/src/bp_api/composition/production.py
 M apps/api/src/bp_api/composition/self_hosted.py
 M apps/api/src/bp_api/composition/two_site_e2e.py
 M apps/api/src/bp_api/config/settings.py
 M apps/api/src/bp_api/http/contract.py
 M apps/api/src/bp_api/http/site/routes.py
 M apps/public-universal/next.config.ts
 M apps/public-universal/src/site/lib/presentation.ts
 M apps/public-universal/src/site/lib/response-validation.ts
 M apps/public-universal/src/site/pages/home/home-page.tsx
 M apps/public-universal/src/site/shell/header/site-header.tsx
 M apps/public-universal/src/site/shell/navigation/navigation-tree.tsx
 M apps/public-universal/src/site/shell/navigation/site-shell.tsx
 M apps/public-universal/src/site/styles/globals.css
 M apps/public-universal/src/site/tests/design-engines.test.mjs
 M apps/public-universal/src/site/tests/shell.test.mjs
 M apps/public-universal/src/site/tests/universal-foundation.test.mjs
 M contracts/http/README.md
 M docs/engineering/CONTRACT_GENERATION.md
 M docs/engineering/KNOWN_BLOCKERS.md
 M docs/source-baseline.json
 M infrastructure/config/development.env.example
 M infrastructure/config/test.env.example
 M infrastructure/coolify/compose.yaml
 M infrastructure/local/README.md
 M infrastructure/scripts/release_manifest.py
 M packages/python/bp-adapters-postgres/src/bp_adapters/postgres/runtime.py
 M packages/ts/api-client-admin/README.md
 M packages/ts/api-client-admin/package.json
 M packages/ts/api-client-admin/src/generated.ts
 M packages/ts/api-client-public/README.md
 M packages/ts/api-client-public/package.json
 M packages/ts/api-client-public/src/generated.ts
 M packages/ts/api-contract/README.md
 M packages/ts/api-contract/generated/README.md
 M packages/ts/api-contract/generated/contract-manifest.json
 M packages/ts/api-contract/generated/openapi.ts
 M packages/ts/api-contract/generated/operation-registry.ts
 M packages/ts/api-contract/package.json
 M packages/ts/presentation-catalogue/src/registry.ts
 M packages/ts/presentation-catalogue/tests/registry.test.mjs
 M tests/application/test_wu02_foundation.py
 M tests/application/test_wu05_temporary_site_context.py
 M tests/contract/openapi-contract.test.mjs
 M tests/contract/source-baseline-guard.py
 M tests/contract/test_chat03_openapi.py
 M tests/contract/test_chat03_production_composition.py
 M tests/contract/test_chat03_runtime.py
 M tests/contract/test_wave2_contract_resolution.py
 M tests/contract/test_wave2_full_assembly.py
 M tests/contract/test_wave2_provisional_integration.py
 M tests/contract/test_wu01_contract.py
 M tests/contract/wave1-integration-guard.py
 M tests/dependency/foundation.test.mjs
 M tests/e2e/test_chat03_auth.py
 M tests/evidence/universal-implementation-coverage.json
 M tests/run-foundation.sh
 M tooling/configs/openapi-baseline.json
 M tooling/configs/regression-guards.json
 M tooling/dependency-rules/policy.json
 M tooling/generators/generate-api-contract.mjs
 M tooling/generators/generate_openapi_artifacts.py
 M tooling/scripts/check-foundation.mjs
 M tooling/scripts/check-generated-drift.mjs
 M tooling/scripts/check-openapi-source.mjs
 M tooling/scripts/dev-public-universal.mjs
 M tooling/scripts/dev.mjs
 M tooling/scripts/run-chat01-evidence.sh
 M tooling/scripts/run-local-api.py
 M tooling/scripts/verify-openapi-contract.py
?? apps/admin/src/modules/appearance/RepresentativeWebsitePreview.tsx
?? apps/admin/src/modules/appearance/VisualAppearanceControls.tsx
?? apps/public-universal/AGENTS.md
?? apps/public-universal/CLAUDE.md
?? apps/public-universal/src/site/pages/home/home-composition.tsx
?? apps/public-universal/src/site/tests/home-composition.test.mjs
?? apps/public-universal/src/site/tests/parity-integration.test.mjs
?? contracts/http/BLOG-DOC-15_openapi_v1.0-RC13.provenance.json
?? contracts/http/BLOG-DOC-15_openapi_v1.0-RC13.yaml
?? docs/engineering/UNIVERSAL_REPAIR_4_EVIDENCE.md
?? packages/python/bp-domain/src/bp_domain/temporary_site_url.py
?? tests/application/test_repair4_parity.py
?? tests/fixtures/universal_parity.py
?? tooling/scripts/plan-legacy-parity.mjs
```

## Final tracked diff stat (all repairs)

```text
 README.md                                          |   4 +-
 apps/admin/README.md                               |   4 +-
 apps/admin/package.json                            |   2 +-
 .../src/modules/appearance/AppearanceControls.tsx  | 102 ++------
 .../src/modules/appearance/appearance-model.ts     |  13 +
 .../admin/src/modules/global/CreateWebsitePage.tsx |  19 +-
 apps/admin/src/modules/site/AppearancePage.tsx     |   9 +-
 apps/admin/src/styles/admin.css                    |  71 ++++++
 apps/admin/src/tests/wu05.test.tsx                 | 162 ++++++++++--
 apps/api/README.md                                 |   2 +-
 apps/api/src/bp_api/app.py                         |   4 +-
 apps/api/src/bp_api/composition/global_postgres.py |  26 +-
 apps/api/src/bp_api/composition/presentation.py    |  29 +++
 apps/api/src/bp_api/composition/production.py      |   4 +-
 apps/api/src/bp_api/composition/self_hosted.py     |   4 +-
 apps/api/src/bp_api/composition/two_site_e2e.py    |   4 +-
 apps/api/src/bp_api/config/settings.py             |  16 +-
 apps/api/src/bp_api/http/contract.py               |  18 +-
 apps/api/src/bp_api/http/site/routes.py            |   8 +-
 apps/public-universal/next.config.ts               |   1 +
 apps/public-universal/src/site/lib/presentation.ts |   7 +-
 .../src/site/lib/response-validation.ts            |   2 +
 .../src/site/pages/home/home-page.tsx              |  23 +-
 .../src/site/shell/header/site-header.tsx          |   3 +-
 .../src/site/shell/navigation/navigation-tree.tsx  |  13 +-
 .../src/site/shell/navigation/site-shell.tsx       |   5 +-
 apps/public-universal/src/site/styles/globals.css  |  39 ++-
 .../src/site/tests/design-engines.test.mjs         |   6 +-
 .../public-universal/src/site/tests/shell.test.mjs |  31 ++-
 .../src/site/tests/universal-foundation.test.mjs   |   9 +-
 contracts/http/README.md                           |   8 +-
 docs/engineering/CONTRACT_GENERATION.md            |  16 +-
 docs/engineering/KNOWN_BLOCKERS.md                 |   4 +-
 docs/source-baseline.json                          |  17 +-
 infrastructure/config/development.env.example      |   4 +-
 infrastructure/config/test.env.example             |   4 +-
 infrastructure/coolify/compose.yaml                |   2 +-
 infrastructure/local/README.md                     |   2 +-
 infrastructure/scripts/release_manifest.py         |   2 +-
 .../src/bp_adapters/postgres/runtime.py            |  23 +-
 packages/ts/api-client-admin/README.md             |   2 +-
 packages/ts/api-client-admin/package.json          |   2 +-
 packages/ts/api-client-admin/src/generated.ts      |   4 +-
 packages/ts/api-client-public/README.md            |   2 +-
 packages/ts/api-client-public/package.json         |   2 +-
 packages/ts/api-client-public/src/generated.ts     |   4 +-
 packages/ts/api-contract/README.md                 |   2 +-
 packages/ts/api-contract/generated/README.md       |   2 +-
 .../api-contract/generated/contract-manifest.json  |   8 +-
 packages/ts/api-contract/generated/openapi.ts      |   8 +-
 .../api-contract/generated/operation-registry.ts   |   4 +-
 packages/ts/api-contract/package.json              |   2 +-
 packages/ts/presentation-catalogue/src/registry.ts |  16 +-
 .../presentation-catalogue/tests/registry.test.mjs |  55 ++++-
 tests/application/test_wu02_foundation.py          | 273 +++++++++++++++++++--
 .../test_wu05_temporary_site_context.py            |  16 +-
 tests/contract/openapi-contract.test.mjs           |  21 +-
 tests/contract/source-baseline-guard.py            |  13 +-
 tests/contract/test_chat03_openapi.py              |   4 +-
 .../contract/test_chat03_production_composition.py |   8 +-
 tests/contract/test_chat03_runtime.py              |   4 +-
 tests/contract/test_wave2_contract_resolution.py   |  12 +-
 tests/contract/test_wave2_full_assembly.py         |   8 +-
 .../contract/test_wave2_provisional_integration.py |   2 +-
 tests/contract/test_wu01_contract.py               |  55 ++++-
 tests/contract/wave1-integration-guard.py          |   8 +-
 tests/dependency/foundation.test.mjs               |   8 +-
 tests/e2e/test_chat03_auth.py                      |   2 +-
 .../universal-implementation-coverage.json         |  20 +-
 tests/run-foundation.sh                            |   6 +-
 tooling/configs/openapi-baseline.json              |  17 +-
 tooling/configs/regression-guards.json             |  22 +-
 tooling/dependency-rules/policy.json               |   2 +-
 tooling/generators/generate-api-contract.mjs       |   2 +-
 tooling/generators/generate_openapi_artifacts.py   |  16 +-
 tooling/scripts/check-foundation.mjs               |   6 +-
 tooling/scripts/check-generated-drift.mjs          |   2 +-
 tooling/scripts/check-openapi-source.mjs           |   6 +-
 tooling/scripts/dev-public-universal.mjs           |   3 +-
 tooling/scripts/dev.mjs                            |   9 +
 tooling/scripts/run-chat01-evidence.sh             |   2 +-
 tooling/scripts/run-local-api.py                   |   2 +-
 tooling/scripts/verify-openapi-contract.py         |   8 +-
 83 files changed, 1018 insertions(+), 374 deletions(-)
```
