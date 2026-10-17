# W3 — Complete appearance system

W3 coding and focused automated verification are complete against V4 sections
E0–E6 and F0. Runtime/browser acceptance remains NOT EXECUTED.

## Persistence and compatibility

- `STANDARD` is a first-class selectable/persistable `style_id`. It is the W1
  Sage Editorial recipe, separate from SAFE_DEFAULT and STYLE_03.
- Existing `site_settings.presentation_config` JSONB remains the storage.
  `schema_version: 1` remains compatible with existing database constraints;
  optional `recipe_version: 2` explicitly selects the completed recipes.
  Omitted/1 retains the exact legacy preset/Custom resolver. STANDARD and
  Custom-from-STANDARD require recipe version 2. No existing tenant is updated.
- Custom accepts STANDARD or any of STYLE_01–05 as `base_style_id`, retains that
  base and all approved axis overrides through save/reload. Invalid versions,
  IDs, arbitrary CSS/HTML/JS fields and inadequate Custom contrast are rejected
  or safely fall back on the public projection.
- Global article-card selection updates Home, collections and related roles;
  separate validated collection/related overrides remain available. The global
  image choice now persists in `cards.image_profile_id`. Typography, palette,
  density, spacing, width, radius, border, elevation, button, hero and article
  settings resolve from the same request-local catalogue across page families.
- Version-2 semantic colors check text/muted/heading/primary/focus against the
  actual surface, alternate surface and background roles. Secondary color is a
  decorative section accent. No raw user CSS is emitted.
- Admin Appearance offers Standard, all five presets, Custom and six Custom
  bases, plus Restore saved appearance. Save/reload uses existing permissions,
  setting endpoints and same-site reference checks. Appearance changes retain
  branding and hero media/CTA references; content and SEO are not replaced.
- The shared Create Website chooser keeps its existing behavior by default.
  Only the existing Appearance workspace opts into W3 selection. W4 wizard,
  provisioning and full authenticated public preview are not implemented here.

## Complete recipe matrix

All identifiers below use their existing catalogue prefixes. The collection
profile applies explicitly to Category, Tag, Author and Search, and the main
card family explicitly applies to both Home and collections. Blog uses that
same collection/card selection. Related uses its separately curated family.

| Appearance | Palette | Type English / Hindi | Home | Hero | Main/collection card | Related | Category | Author | Article | Collection | Image |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| STANDARD | PAL-03 | TYPE-03 / TYPE-11 | HOME-03 | HERO-22 | CARD-03 | CARD-03 | CAT-02 | AUTH-04 | ART-14 | COL-01 | IMG-03 |
| STYLE_01 Modern Magazine | PAL-04 | TYPE-09 / TYPE-11 | HOME-02 | HERO-10 | CARD-28 | CARD-07 | CAT-06 | AUTH-01 | ART-04 | COL-07 | IMG-03 |
| STYLE_02 Classic Editorial | PAL-02 | TYPE-02 / TYPE-21 | HOME-01 | HERO-22 | CARD-03 | CARD-27 | CAT-05 | AUTH-04 | ART-01 | COL-06 | IMG-01 |
| STYLE_03 Minimal Clean | PAL-28 | TYPE-28 / TYPE-22 | HOME-15 | HERO-14 | CARD-15 | CARD-15 | CAT-01 | AUTH-05 | ART-16 | COL-04 | IMG-01 |
| STYLE_04 Bold News | PAL-07 | TYPE-07 / TYPE-12 | HOME-05 | HERO-21 | CARD-28 | CARD-07 | CAT-05 | AUTH-03 | ART-12 | COL-01 | IMG-03 |
| STYLE_05 Warm / Spiritual | PAL-30 | TYPE-12 / TYPE-12 | HOME-14 | HERO-23 | CARD-03 | CARD-03 | CAT-06 | AUTH-04 | ART-15 | COL-02 | IMG-09 |

Standard preserves W1's natural article image IMG-01, 1200px main container and
740px reading measure; its global/hero image is IMG-03. Other presets use their
principal image profile for global/hero/article contexts. Reading measures are
760 / 720 / 680 / 720 / 740px for STYLE_01–05; legal measures are
720 / 720 / 720 / 720 / 740px. Principal widths/densities/radii remain the
established preset values. Custom can override only supported catalogue tokens.

Version-2 CSS scopes the coordinated mastheads/footers, surfaces, reading
widths, cards, focus, controls, tablet/mobile grids and gutters to explicit
recipe-version attributes. Standard-derived Custom overrides take precedence
for spacing, radius, border, elevation and button treatments. A magazine lead
can use actual authored selected stories as supports without altering latest
ordering or manufacturing a lead. No placeholders or published records are
created. Legacy pages do not opt into these rules automatically.

## Automated verification

| Exact command | Final result |
| --- | --- |
| `corepack pnpm --filter @bp/presentation-catalogue test` | PASS: 21 cases |
| `corepack pnpm --filter @bp/public-universal test` | PASS: 102 cases |
| `node --test src/site/tests/appearance-v2.test.mjs` (cwd apps/public-universal) | PASS: 10 affected cases after final CSS corrections |
| `corepack pnpm --filter @bp/admin exec vitest run src/tests/w3-appearance.test.tsx` | PASS: 4 cases |
| `corepack pnpm --filter @bp/admin exec vitest run src/tests/wu05.test.tsx src/tests/w2-content.test.tsx src/tests/w2-homepage.test.tsx --testTimeout=15000` | PASS: 45 existing cases |
| `uv run --frozen --all-packages python -m pytest -q tests/application/test_w3_appearance.py tests/application/test_w2_website_content.py tests/application/test_wu02_foundation.py tests/contract/test_chat03_openapi.py tests/contract/test_wave2_contract_resolution.py tests/contract/test_wave2_full_assembly.py` | PASS: 82 cases |
| `corepack pnpm --filter @bp/presentation-catalogue typecheck` | PASS |
| `corepack pnpm --filter @bp/public-universal typecheck` | PASS |
| `corepack pnpm --filter @bp/admin typecheck` | PASS |
| `node --test tests/contract/openapi-contract.test.mjs tests/dependency/foundation.test.mjs` | PASS: 12 cases |
| `uv run --frozen --all-packages python tooling/generators/generate_openapi_artifacts.py --write` | PASS: deterministic generator, nine artifacts |
| `node tooling/scripts/check-generated-drift.mjs` | PASS: zero drift across nine artifacts |
| `corepack pnpm --filter @bp/public-universal build` (cwd /tmp/nakshatra-w3/build) | PASS: isolated current-source build |
| `corepack pnpm --filter @bp/admin build` (cwd /tmp/nakshatra-w3/build) | PASS: isolated build; final runtime source matches |
| `git diff --check` | PASS |

Regressions cover exact six-recipe/Hindi mappings and all Custom bases; actual
Admin selection/save/restore/reload; per-render tenant separation; legacy
14-site parity; invalid configurations and contrast; W2 content preservation;
all page families including private preview/system routes; and synthetic
0/1/12-row Home/Blog/Category/Tag/Author inputs. They do not claim browser layout
acceptance or real database isolation.

Checks found and corrected a minimal Standard descriptor incorrectly inheriting
its global image as the article image, an exactOptionalPropertyTypes options
error, fixed lead-support card inheritance, and Standard-derived Custom CSS
precedence. A heavy Admin save/reload test timed out at 15 seconds; narrowing
its DOM queries to the chooser retained the assertions and passed in under two
seconds without increasing its timeout. All final affected checks pass.
Existing Python dependency deprecations and the Admin Vite >500kB chunk warning
remain non-failing warnings.

## Contract, preservation and deferred gates

Active RC13 SHA-256:
`e18e9b28994368ce925212c7ba71b1681ecf866300d8c8f3b231b65c2dcfe864`.
Counts remain 113 operations, 86 paths, 251 schemas and 1378 resolved internal
references, zero unresolved. No new endpoint or public PageData variant.
The source contract, provenance, generated clients and current SHA pins move
together. Generated files were produced by the generator, not hand-edited.

All 99 starting dirty paths, including the original 70 and W1/W2 additions,
remain present; authorized extensions preserve the earlier implementations.
next-env.d.ts, all three original JSON reports, W1/W2 reports and DB-MIG-022
are byte-identical to their W3-start hashes. W1's recipe values are unchanged.
Nothing is staged. No schema/migration changes were necessary for W3, and
DB-MIG-022 remains NOT EXECUTED.

No browser, Chrome, Playwright, screenshots, live server, production database,
PostgreSQL operation, migration execution, domain/DNS operation, commit, push,
reset, stash, clean or deployment was performed. No tenant content, navigation,
SEO, domain ownership or appearance data was written.

W4 dependencies: authenticated whole-site preview, Create Website wizard
integration, site-key allocation, onboarding/readiness and reference-tenant
creation remain outside W3. Browser checks for actual font loading, responsive
geometry, keyboard interaction and visual contrast across the six appearances
are NOT EXECUTED. Live migration/FORCE-RLS and acceptance across all 14 real
sites remain separate gates. No automated result is presented as those gates.

## Exact W3 file inventory

This is the W3 delta against the preserved starting working tree, not the
combined UF/W1/W2 Git diff. Existing files already untracked at W3 start are
listed as modified when extended.

Modified (39):

- `README.md`
- `apps/admin/src/modules/appearance/AppearanceControls.tsx`
- `apps/admin/src/modules/appearance/RepresentativeWebsitePreview.tsx`
- `apps/admin/src/modules/appearance/VisualAppearanceControls.tsx`
- `apps/admin/src/modules/appearance/appearance-model.ts`
- `apps/admin/src/modules/site/AppearancePage.tsx`
- `apps/api/src/bp_api/composition/presentation.py`
- `apps/public-universal/src/site/components/semantic-components.tsx`
- `apps/public-universal/src/site/lib/design-context.tsx`
- `apps/public-universal/src/site/lib/presentation.ts`
- `apps/public-universal/src/site/lib/response-validation.ts`
- `apps/public-universal/src/site/pages/home/home-composition.tsx`
- `apps/public-universal/src/site/shell/header/site-header.tsx`
- `apps/public-universal/src/site/shell/navigation/mobile-navigation.tsx`
- `apps/public-universal/src/site/shell/navigation/site-shell.tsx`
- `apps/public-universal/src/site/styles/profiles.css`
- `apps/public-universal/src/site/tests/standard-website.test.mjs`
- `contracts/http/BLOG-DOC-15_openapi_v1.0-RC13.provenance.json`
- `contracts/http/BLOG-DOC-15_openapi_v1.0-RC13.yaml`
- `contracts/http/README.md`
- `docs/engineering/CONTRACT_GENERATION.md`
- `docs/engineering/KNOWN_BLOCKERS.md`
- `docs/source-baseline.json`
- `packages/python/bp-adapters-postgres/src/bp_adapters/postgres/runtime.py`
- `packages/ts/api-client-admin/src/generated.ts`
- `packages/ts/api-client-public/src/generated.ts`
- `packages/ts/api-contract/generated/contract-manifest.json`
- `packages/ts/api-contract/generated/openapi.ts`
- `packages/ts/api-contract/generated/operation-registry.ts`
- `packages/ts/presentation-catalogue/src/index.ts`
- `packages/ts/presentation-catalogue/src/registry.ts`
- `packages/ts/presentation-catalogue/src/standard.ts`
- `tests/contract/openapi-contract.test.mjs`
- `tests/contract/source-baseline-guard.py`
- `tests/contract/test_wave2_contract_resolution.py`
- `tests/contract/test_wave2_full_assembly.py`
- `tests/contract/wave1-integration-guard.py`
- `tests/dependency/foundation.test.mjs`
- `tooling/configs/openapi-baseline.json`

Added (6):

- `apps/admin/src/tests/w3-appearance.test.tsx`
- `apps/public-universal/W3_IMPLEMENTATION.md`
- `apps/public-universal/src/site/tests/appearance-v2.test.mjs`
- `packages/ts/presentation-catalogue/src/appearance-recipes.ts`
- `packages/ts/presentation-catalogue/tests/appearance-v2.test.mjs`
- `tests/application/test_w3_appearance.py`
