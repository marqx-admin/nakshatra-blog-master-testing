# W1 — Sage Editorial Standard Website

Implemented against the approved V4 PDF, sections C0–C2, PAGE 01–10,
E6, F0/F3 and G1. W2–W5 were not implemented.

## Scope and activation

`STANDARD_RECIPE` is a complete code-owned selection: PAL-03, TYPE-03
(TYPE-11 for Hindi-first locales), HOME-03, HERO-22, CARD-03, CAT-02,
AUTH-04, ART-14. All archives use COL-01/CARD-03; related cards use
CARD-03 in the existing related grid. Preview/card media uses IMG-03
(16:9), while full article media uses IMG-01 (natural ratio).

Standard has WIDTH-WIDE (1200px), DENSITY-STANDARD, RADIUS-MEDIUM
(12px), a 740px reading body, 32/24/16px page gutters, 3/2/1 collection
columns at >=1024/768–1023/<=767px, and the specified heading/body sizes.
Primary buttons, white reading/card surfaces and cream page background
use Sage semantic roles. Focus, reduced motion, captions and missing-media
fallbacks remain shared. Card titles remain complete rather than being
unsafely truncated.

`StandardWebsiteReference` opts into that appearance around the existing
`PublicRoutePage`. It accepts existing render props; it does not fetch,
register a route, bypass Host resolution, create a tenant or write content.
Shared shell components select the recipe only inside this explicit context.
All five stored styles, CUSTOM inheritance and SAFE_DEFAULT retain their
existing meaning. No existing tenant is restyled.

The same Standard shell and scoped styles cover Home, Blog, Article,
Search, five information pages, Category, Tag, Author, site-scoped 404/410,
and private preview. Unknown-host/service failures remain unbranded.
An empty Standard reference menu offers only the supported Home/Blog
destinations plus the existing Search action; authored menus retain order.
The Standard disclosure adds Close, labelled navigation and reversible body
scroll locking while retaining existing Escape/blur/route focus handling.

No article, author, contact, organization or legal content was created or
published. Existing API-provided headings, prose, ordering, destinations,
SEO and eligibility remain unchanged.

## Confirmed contract correction

The authoritative `load_openapi` loader reads **250** RC13 schemas;
`x-doc15-authority.schema_helper_count` also declares **250**. The only
contract-test edit changes the stale literal assertion from 249 to 250 in
`tests/contract/test_chat03_openapi.py`. No test was removed or relaxed.
RC13 SHA-256 remains
`ff4993ef815be07aec759f233f672aa70f977da4c5d258c007821e752ea8c350`.
OpenAPI and generated artifacts are byte-unchanged from the W1 starting
snapshot; the prior UF-08 drift pass is preserved, not reported as rerun.

## Executed verification

| Command | Final result |
| --- | --- |
| `corepack pnpm --filter @bp/public-universal test` | PASS — 91 tests (83 previous + 8 W1) |
| `corepack pnpm --filter @bp/presentation-catalogue test` | PASS — 14 tests (11 previous + 3 W1) |
| `uv run --frozen --all-packages python -m pytest -q tests/contract/test_chat03_openapi.py` | PASS — 2 tests; existing RefResolver deprecation warnings |
| `corepack pnpm --filter @bp/public-universal typecheck` | PASS |
| `corepack pnpm --filter @bp/presentation-catalogue typecheck` | PASS |
| `corepack pnpm --filter @bp/public-universal build` | PASS — executed only in `/tmp/nakshatra-w1/build` |
| `git diff --check` | PASS |

Initial regression runs exposed a new test bundling problem with Next Head,
a source-binding expectation and whitespace in a heading assertion. The
test uses the existing suite's Head adapter, ordinary shell rendering keeps
its original presentation helper, and heading text is whitespace-normalized.
Affected checks and the final frontend suite passed after these corrections.

The isolated build clones the prior safe build environment and overlays current
source. Runtime `.ts/.tsx/.css/.json` inputs under the frontend and TS packages,
plus root/app dependency and build configuration, were compared with the
working tree after the build: **zero differences**. No server was started.

New coverage renders all primary/supporting/system/preview page families,
0/1/3/12 cards, supplied selection order, Hindi typography, Blog/Search card
consistency, request-local recipe selection, unchanged stored styles,
neutral failures, CSS syntax/scope and mobile menu scroll/focus cleanup.
These are synthetic/in-process tests, not browser acceptance.

## Deferred dependencies and acceptance gaps

- **W2 / PAGE 01, D0–D1, G2 DEP-01:** site-owned editable Home headline/intro
  persistence and authoritative public projection. W1 displays existing data;
  the approved draft starter copy is not embedded in React.
- **W2 / C2, PAGE 05–09, F2, DEP-03/04:** safe provisioned menu items,
  owner-edited fixed-page drafts, real contact details and explicit legal
  approval/enablement. Current public eligibility remains authoritative.
- **W3 / F0, G2 DEP-02/07:** explicit persisted STANDARD selection and
  Custom inheritance from Standard require coordinated schema/Admin/client
  evolution. Standard is not added to the closed wire `style_id` enum.
- **F3 reference runtime:** a registered nonproduction reference tenant and
  authorized presentation binding remain pending; the reference component
  is not a new public route or a parallel mock website. W1 does not create
  site records or expose synthetic fixtures through live routing.
- **D1 / later content/style integration:** controlled translated UI labels
  and tenant-timezone date presentation need a coordinated locale policy.
  W1 supplies the approved font pair and preserves existing content/date
  behavior; it does not invent translated editorial copy.
- **H0 QA-04/05/06/07/13 visual/runtime gates: NOT EXECUTED.** Browser
  viewport, keyboard, image failure, actual contrast and Hindi shaping
  acceptance require separately authorized visual review. Automated checks
  do not certify live layout at any viewport.
- **H0 QA-10/12: NOT EXECUTED.** Live PostgreSQL FORCE-RLS and all 14 real
  tenant-host acceptance remain separate mandatory gates.

## Exact W1 files

Modified:

1. `tests/contract/test_chat03_openapi.py`
2. `packages/ts/presentation-catalogue/src/index.ts`
3. `apps/public-universal/src/site/lib/design-context.tsx`
4. `apps/public-universal/src/site/lib/presentation.ts`
5. `apps/public-universal/src/site/shell/header/site-header.tsx`
6. `apps/public-universal/src/site/shell/navigation/mobile-navigation.tsx`
7. `apps/public-universal/src/site/shell/navigation/site-shell.tsx`
8. `apps/public-universal/src/site/styles/profiles.css`

Added:

1. `packages/ts/presentation-catalogue/src/standard.ts`
2. `packages/ts/presentation-catalogue/tests/standard.test.mjs`
3. `apps/public-universal/src/site/reference/standard-website-reference.tsx`
4. `apps/public-universal/src/site/tests/fixtures/w1-standard.mjs`
5. `apps/public-universal/src/site/tests/standard-website.test.mjs`
6. `apps/public-universal/W1_IMPLEMENTATION.md`

## Preservation and boundaries

All original 70 uncommitted files remain present. Sixty-five are byte-identical;
five original frontend files were intentionally extended: presentation helper,
Header, MobileNavigation, SiteShell and profile CSS. The other W1 modifications
were clean tracked files at the start. All three original JSON reports remain
byte-identical. `next-env.d.ts` remains byte-identical with SHA-256
`cbdef449b845ff63f4d7c6f737a799aa540abf6f005b42155084686d5430fe17`.

No Admin features, backend runtime, database/schema, OpenAPI, generated client,
worker, infrastructure or legacy-site sources were changed during W1. No reset,
clean, stash, rebase, merge, cherry-pick, commit, push, deploy, DNS change,
live browser, server startup, PostgreSQL or production operation was performed.
