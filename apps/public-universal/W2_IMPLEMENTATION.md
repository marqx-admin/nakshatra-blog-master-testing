# W2 — Website content and page management

Implemented against the approved V4 PDF PAGE 01–10, D0/D1 and G1/G2 W2 scope.
No W3 appearance selection, Custom/preset redesign or W4 wizard redesign.

## Content storage and public ownership

- Home H1 and introduction use new nullable `site_settings.homepage_h1` and
  `homepage_intro_text`, exposed as optional `h1` / `intro_text` on existing
  API15-S-072/073 Homepage Controls. Omitted fields preserve stored text;
  empty heading restores the existing display-name fallback and empty intro
  clears it. The public Home uses its existing `PageIntro` shape. Latest-post
  filtering/ordering and existing section storage are unchanged.
- Home editing retains navigation.view/manage authority. Lead selection remains
  same-site/PUBLISHED with posts.view checks. Explicit null clears the lead;
  empty selection arrays can now clear selections. Home drafts survive query
  refetch while being edited; failed or stale-site save responses cannot overwrite
  another workspace's Home text.
- About, Contact, Privacy, Terms and Disclaimer remain in the existing
  `site_settings.static_pages` JSONB object. API15-S-097 now accepts one or more
  complete individual pages and atomically merges only those keys. The UI sends
  changed pages or a single selected page, preserving sibling data, authored
  section order, enabled flags and content_version. No general Pages CMS,
  arbitrary HTML, CSS or JavaScript is introduced.
- Information editing retains site_settings.view/edit checks. Save/restore is
  page-specific. The saved-page baseline updates after successful writes; query
  refetch does not replace unsaved sibling content, and stale-site responses are
  ignored. Legacy missing page keys receive editor-only disabled defaults.
- Public eligibility requires an explicitly enabled page, complete plain-text
  sections and resolved approved-template placeholders. Known unresolved starter
  markers fail closed, including legacy stored drafts. Title/intro/body text is
  projected without translation; existing backend SEO and Host resolution remain.

## Starter templates and navigation

- V4 D0/D1 starter resources live only in the Admin content module. English Home,
  About, Contact and legal outlines use the approved draft structure. Approved
  Hindi examples are provided for Home/About/Contact; legal outlines are not
  automatically translated into purported policies.
- New-site `startingPages()` supplies disabled information-page drafts via the
  existing creation contract. Nothing enables them automatically. Existing stored
  pages are restored instead of replaced. A starter action is offered for empty
  editor drafts; there is no automatic backfill of SITE-01 through SITE-14.
- Home's unresolved template remains browser-local editor state; it cannot be
  saved to the public Home projection. Information-page placeholders can persist
  only while disabled. Legal outlines remain incomplete until an authorized owner
  supplies real text and explicitly enables them. There are no generated posts,
  authors, dates, category counts, contact details or legal promises.
- Controlled English/Hindi resources cover the new Home heading/introduction and
  page title/introduction/save/restore/template actions. Existing owner-authored
  prose is never automatically translated.
- BLOG is a typed target with no raw URL or foreign ID. Public resolution maps it
  to the existing deployed `/blog` contract. For future provisioned sites only,
  the insert-only baseline function seeds Home/All Articles/Search in both menus
  in that order, using Hindi labels for Hindi sites. Existing authored menus are
  not modified or reordered. Information links are not auto-seeded; their existing
  same-site public projection excludes unknown, disabled or incomplete pages.
- The Footer omits fallback shortcuts already supplied by authored root entries,
  avoiding duplicate default navigation groups. Authored order remains intact.

## Contract and migration effects

- Active RC13: **113 operations, 86 paths, 251 schemas, 1,378 internal references,
  zero unresolved**. No new endpoint or public PageData variant was added.
- `HomepageInput` gains optional H1/intro text and a clearable lead. New
  `StaticPagesPatch` supports backward-compatible full bundles and partial maps.
  `AdminNavDestination` gains BLOG. Persisted presentation/style contracts remain
  unchanged. Authoritative SHA-256:
  `09794ad4cf574f2d6ac6c14be9bde1de7b2f65321eb664c0046f76c21d78f75d`.
- The existing deterministic generator produced the artifacts; none was hand-edited.
  Provenance/pins/count guards were updated together, including the earlier W1
  schema assertion, now correctly 251 after this separately authorized amendment.
- New **DB-MIG-022** adds only the two nullable Home text columns and their named
  constraints, extends typed navigation constraints for BLOG, and replaces the
  existing insert-only baseline function to seed six internal navigation items
  for future creations. It retains Super Admin/DISABLED-site checks, the existing
  baseline-exists rejection, transaction-local site context, grants and RLS.
- Historical migrations are unchanged. No existing tenant content/menu backfill,
  new tables, schemas or per-site databases. Migration chain and derived source
  verification inventories reflect 331 columns and 83 named CHECK constraints.
- **Migration execution: NOT EXECUTED.** DB-MIG-022 must be applied through a
  separately authorized nonproduction migration gate before using new Home fields
  or provisioning BLOG items. Existing live DB compatibility is not claimed.

## Automated verification actually executed

| Command | Final evidence |
| --- | --- |
| `uv run --frozen --all-packages python -m pytest -q tests/application/test_w2_website_content.py tests/application/test_wu02_foundation.py tests/application/test_uf06_blog_archive.py tests/contract/test_chat03_openapi.py tests/contract/test_wave2_contract_resolution.py tests/contract/test_wave2_full_assembly.py` | PASS: 73 cases |
| `corepack pnpm --filter @bp/admin exec vitest run src/tests/w2-homepage.test.tsx src/tests/w2-content.test.tsx` | PASS: 11 W2 cases |
| `corepack pnpm --filter @bp/admin exec vitest run src/tests/wu05.test.tsx` | Initial 25 passed, 8 failed; see affected reruns below |
| `corepack pnpm --filter @bp/admin exec vitest run src/tests/wu05.test.tsx -t 'provisions one complete|assigned disabled site can save|fixed information page edits'` | Six corrected provisioning cases passed; two save cases exceeded 5-second default |
| `corepack pnpm --filter @bp/admin exec vitest run src/tests/wu05.test.tsx -t 'assigned disabled site can save|fixed information page edits' --testTimeout=15000` | PASS: 2 affected cases, unchanged behavioral assertions |
| `corepack pnpm --filter @bp/admin exec vitest run src/tests/wu05.test.tsx -t 'W2 page-level'` | PASS: 1 added integration case; saving Contact preserves an unsaved About draft through refetch |
| `corepack pnpm --filter @bp/public-universal test` | PASS: 91 before the targeted Footer deduplication |
| `node --test src/site/tests/shell.test.mjs` (cwd apps/public-universal) | PASS: 8 affected Footer/shell cases, including 1 new case; 92 unique frontend cases across runs |
| `corepack pnpm --filter @bp/admin typecheck` | PASS |
| `corepack pnpm --filter @bp/public-universal typecheck` | PASS |
| `node --test tests/contract/openapi-contract.test.mjs tests/dependency/foundation.test.mjs` | Initial 11 passed / 1 stale schema-count regex failed |
| `node --test --test-name-pattern='RC13 registry/count' tests/contract/openapi-contract.test.mjs` | PASS: affected assertion after exact 250→251 correction; 12 unique contract/dependency cases across runs |
| `node tooling/scripts/check-generated-drift.mjs` | PASS: nine generated artifacts, zero drift |
| `uv run --frozen --all-packages python database/verification/verify_static.py` | PASS: 293 source checks after updating additive migration/column/constraint inventories; no database connection |
| `corepack pnpm --filter @bp/public-universal build` | PASS in isolated `/tmp/nakshatra-w2/build` |
| `corepack pnpm --filter @bp/admin build` | PASS in isolated `/tmp/nakshatra-w2/build`; final current source snapshot |
| `git diff --check` | PASS |

Admin evidence totals 45 unique cases across the above focused runs, not a full
Admin suite. Six old provisioning assertions were updated from blank pages to
explicitly disabled/incomplete draft templates. The old contact-input test now
clears the starter text before typing replacement content. Two heavy-gallery
integration cases needed 15 seconds rather than 5 seconds; no assertions were
removed. New Home tests explicitly clean up DOM state between cases. The isolated
Admin snapshot was refreshed from the original workspace before its final build.

Warnings: existing RefResolver/TestClient/httpx/AnyIO deprecations, and the Admin
Vite chunk-size warning (>500 kB); these did not fail the final affected checks.

## Preservation and deferred gates

All 79 starting uncommitted paths (the original 70 plus W1's additional dirty
paths) remain present. All three earlier JSON reports, next-env.d.ts, the W1
report and W1 recipe sources remain byte-identical. Existing modifications were
extended only where required for W2; nothing was discarded or staged. Current
Admin/frontend/TS-package runtime and test TS/CSS inputs match the isolated build
snapshot byte-for-byte.

No browser, Chrome, Playwright, live server, live PostgreSQL, schema execution,
production operation, DNS change, commit, push, reset, stash, clean or deployment.
Browser acceptance, live migration/FORCE-RLS, actual API/service/cache propagation
and all fourteen real tenant hosts are **NOT EXECUTED**.

W3 remains responsible for explicit STANDARD selection, full preset refinement and
Custom inheritance. W4 remains responsible for automatic site keys, wizard/full
site preview/readiness integration and a registered reference tenant. W2 does not
activate Standard, create sites, approve legal policies or connect runtime services.

## Exact W2 file inventory (relative to repository root)

Modified (38):

- `README.md`
- `apps/admin/src/modules/appearance/AppearanceControls.tsx`
- `apps/admin/src/modules/appearance/appearance-model.ts`
- `apps/admin/src/modules/site/AppearancePage.tsx`
- `apps/admin/src/modules/site/SitePages.tsx`
- `apps/admin/src/tests/wu05.test.tsx`
- `apps/api/src/bp_api/composition/presentation.py`
- `apps/api/src/bp_api/http/contract.py`
- `apps/public-universal/src/site/shell/footer/site-footer.tsx`
- `apps/public-universal/src/site/tests/shell.test.mjs`
- `contracts/http/BLOG-DOC-15_openapi_v1.0-RC13.provenance.json`
- `contracts/http/BLOG-DOC-15_openapi_v1.0-RC13.yaml`
- `contracts/http/README.md`
- `database/verification/apply-chain.sql`
- `database/verification/doc08-contract.json`
- `database/verification/verify-schema.sql`
- `database/verification/verify_static.py`
- `docs/engineering/CONTRACT_GENERATION.md`
- `docs/engineering/KNOWN_BLOCKERS.md`
- `docs/source-baseline.json`
- `packages/python/bp-adapters-postgres/src/bp_adapters/postgres/editorial.py`
- `packages/python/bp-adapters-postgres/src/bp_adapters/postgres/runtime.py`
- `packages/python/bp-application/src/bp_application/editorial.py`
- `packages/python/bp-domain/src/bp_domain/editorial.py`
- `packages/ts/api-client-admin/src/generated.ts`
- `packages/ts/api-client-public/src/generated.ts`
- `packages/ts/api-contract/generated/contract-manifest.json`
- `packages/ts/api-contract/generated/openapi.ts`
- `packages/ts/api-contract/generated/operation-registry.ts`
- `tests/contract/openapi-contract.test.mjs`
- `tests/contract/source-baseline-guard.py`
- `tests/contract/test_chat03_openapi.py`
- `tests/contract/test_wave2_contract_resolution.py`
- `tests/contract/test_wave2_full_assembly.py`
- `tests/contract/wave1-integration-guard.py`
- `tests/dependency/foundation.test.mjs`
- `tooling/configs/openapi-baseline.json`
- `tooling/configs/regression-guards.json`

Added (7):

- `apps/admin/src/modules/appearance/website-content.ts`
- `apps/admin/src/tests/w2-content.test.tsx`
- `apps/admin/src/tests/w2-homepage.test.tsx`
- `database/migrations/0022_DB-MIG-022__website-content-navigation.sql`
- `packages/python/bp-domain/src/bp_domain/website_content.py`
- `tests/application/test_w2_website_content.py`
- `apps/public-universal/W2_IMPLEMENTATION.md`
