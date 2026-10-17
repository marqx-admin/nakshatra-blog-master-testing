# W4 — Website creation, private preview and readiness

W4 coding and relevant automated verification are complete. The owner initially
requested coding only, then explicitly requested continued fixes and testing.
Automated tests, source checks, typechecks and isolated builds below were run
under that later instruction. Browser, live-service/database, migration and
production acceptance remain NOT EXECUTED. W5 has not been started.

Authority: current local working tree and the approved NAKSHATRA V4 Master
Architecture PDF, F1/F2 and W4. Historical BLOG-DOC filenames remain the existing
executable contract filenames; older PDFs were not used as design authority.

## Creation and provisioning

- The existing five-step Create Website wizard keeps identity, appearance,
  optional content/refinements, representative preview and explicit review.
  Standard is its initial selection; all five presets and Custom are available.
  Custom can start from Standard or any preset through W3's shared definitions.
  All saved W3 appearance axes and recipe/base versions are submitted intact.
- The technical site-key input is removed. The backend allocates SITE-NN from
  the existing registry under a transaction-level SHARE ROW EXCLUSIVE table lock.
  That lock serializes allocation with other site inserts. The existing database
  UUID default supplies site_id; an optional read-only UUID is now returned.
  Legacy API callers may still supply an explicit validated site key.
- Website name requires resolved plain text; timezone is validated using ZoneInfo.
  Optional Home H1/intro use the W2 storage limits (200/12000 characters), reject
  markup and unresolved starter markers, and preserve Hindi/English prose.
- One stable per-wizard Idempotency-Key survives transport failures and edits.
  The existing append-only SITE.CREATED audit record stores its hashed key,
  request fingerprint and confirmed response inside the same transaction.
  Identical retries replay; different values conflict after a confirmed creation.
  No separate idempotency table/cache or broad permission is introduced.
- The existing transaction creates identity, settings, five editable information
  pages, menus, Home baseline, temporary domain and audit outcome. It remains
  DISABLED by default. W2 disabled draft/legal safeguards and the new-site-only
  Home/Blog/Search menu defaults remain in force. No existing tenant is backfilled.
- Optional initial Home text uses the new five-argument provisioning overload in
  DB-MIG-023. It delegates to the unchanged four-argument insert-only bridge,
  whose Super Admin/DISABLED/no-existing-baseline checks remain authoritative,
  then updates only that newly inserted site's Home fields under the same RLS
  context and transaction. The platform role receives EXECUTE only, not direct
  UPDATE permission on site_settings. No site table, database, column, constraint,
  RLS policy or shared storage model is added.

## Website Workspace and preview

- Dashboard and Appearance reuse one WebsiteSetupPanel with permission-filtered
  links to existing Settings/branding/logo/favicon, Home controls (in Navigation),
  Header/Footer, posts, categories, authors, media, SEO and information editors.
  Super Admin identity/domain editing links to the existing Global Site detail.
  No CMS modules or existing Create/Publish/Settings capabilities were removed.
- Before creation, the existing clearly labelled representative preview uses the
  selected W3 configuration and synthetic illustrations; it saves no posts.
- API15-S-098 issues a 60-second, single-use website handoff only after Admin
  session, trusted SITE context, CSRF and Settings/Articles/Navigation/Media view
  permissions pass. Production and self-hosted compositions wire the same service.
- /_preview/site exchanges on the real registered tenant Host and removes the
  handoff from the browser URL. A distinct Secure/HttpOnly/host-only/SameSite=Strict
  cookie enables normal Home/Blog/Article/Search/static/archive navigation through
  API15-PUB-003 and the existing public projection and Universal renderer.
- A website grant is separate from post preview grants. It binds site/Host and
  parent Admin session, expires within 15 minutes or the parent session expiry,
  and revalidates active account, current site permissions and parent revocation
  on every page read. Unknown/wrong Hosts still fail trusted Host resolution.
- The ordinary public API remains ACTIVE-only even when a website preview cookie
  is present. An invalid private grant never falls back to ordinary public data.
  Private website preview now renders the selected site's saved About, Contact
  and legal-page drafts, including disabled/incomplete section outlines and
  unresolved starter placeholders. It remains no-store/noindex and rejects
  markup; the public projection still requires explicitly enabled, complete
  placeholder-free page content. Unpublished posts continue to use the existing
  separately authorized working-copy post preview.
- Private API/SSR responses use no-store, no-referrer and noindex/nofollow; canonical
  and structured-data output are suppressed for private page data. The public
  renderer adds a private notice and Exit preview control. Exit clears only the
  website cookie. Same-site normalized/manual redirects stay on the observed Host;
  cross-host redirects are rejected in private mode.
- Same-site media URLs receive the existing session-bound Admin media grants;
  no public media/lifecycle rule is weakened. SSR forwards only the website-preview
  cookie to its private page endpoint, not the Admin session cookie.

## Readiness and remaining operational dependencies

API15-S-099 computes setup readiness from the selected site's stored settings,
actual presentation/reference validity, Home text/baseline, eligible menus, five
complete explicitly enabled information pages, optional media references, SEO and
registered temporary domain. Provisioned, Content Ready and Launch Ready are
response assessments, not database lifecycle states. Zero published posts is valid.
Legal enablement remains the existing owner-review action, not generated approval.

Permanent domain ownership/DNS/TLS and security/platform/launch evidence have no
trusted approval projection in the existing contracts used here. They therefore
remain NOT_VERIFIED and launch_ready stays false. Integrating verified operational
evidence is a later owner-controlled gate; W4 does not infer it from a domain row,
source checks or a running process. Activation remains a separate existing command.

DB-MIG-022 is still unapplied. New DB-MIG-023 is authored only and must follow 022;
it is required for optional Home text in the atomic creation request. The SQL apply
chain/source inventories were extended, but no migration script was executed.
A registered reference tenant was not created because database operations remain
prohibited. Runtime creation/concurrency, real FORCE-RLS, media delivery, secure
cookies/temporary-host HTTPS behavior, browser navigation and all-14-site acceptance
remain mandatory unexecuted gates. No production readiness is claimed.

## Contract and generated artifacts

- Backward-compatible CreateWebsiteInput: optional site_key and optional Home text.
- SiteAdminResource: optional read-only site_id; existing consumers can ignore it.
- API15-S-098 POST website-preview, API15-S-099 GET website-readiness,
  API15-PUB-003 GET private whole-site projection; one computed readiness schema.
- Current source: 116 operations / 89 paths / 252 schemas / 1400 internal references.
  Split: 12 AUTH / 3 PUBLIC-PREVIEW / 65 SITE / 36 GLOBAL. Zero unresolved references.
- SHA-256: 40e642fab61bae9f5fd60afac2ad76912cb6f1a5c1fe4e251dc7f0485f278461.
- Generated via `.venv/bin/python tooling/generators/generate_openapi_artifacts.py --write`.
  Nine artifacts were produced through the existing generator, not hand-edited.
  Current provenance, pins, count guards and generated clients move together.

## Automated verification actually executed

| Command | Result |
| --- | --- |
| `corepack pnpm --filter @bp/public-universal test` | PASS: 105 cases |
| `corepack pnpm --filter @bp/presentation-catalogue test` | PASS: 21 cases |
| `corepack pnpm --filter @bp/admin exec vitest run src/tests/w4-website-setup.test.tsx src/tests/w3-appearance.test.tsx src/tests/w2-homepage.test.tsx src/tests/w2-content.test.tsx src/tests/wu05.test.tsx --testTimeout=20000` | PASS: 53 cases |
| `corepack pnpm --filter @bp/admin exec vitest run src/tests/editor.test.tsx src/tests/accessibility.test.tsx --testTimeout=20000` | PASS: 33 cases; all seven Admin Vitest files covered across these runs |
| `corepack pnpm --filter @bp/admin test:static` | PASS: 20 cases |
| `corepack pnpm --filter @bp/admin typecheck` | PASS after adding new test parameter annotations |
| `corepack pnpm --filter @bp/public-universal typecheck` | PASS |
| `corepack pnpm --filter @bp/presentation-catalogue typecheck` | PASS |
| `node --test tests/contract/openapi-contract.test.mjs tests/dependency/foundation.test.mjs` | PASS: 12 cases |
| `node tooling/scripts/check-generated-drift.mjs` | PASS: nine artifacts, zero drift |
| `uv run --frozen --all-packages python database/verification/verify_static.py` | PASS: 298 source-only checks; no DB connection |
| `corepack pnpm --filter @bp/public-universal build` (cwd /tmp/nakshatra-w4/build) | PASS: isolated production build, includes /_preview/site |
| `corepack pnpm --filter @bp/admin build` (cwd /tmp/nakshatra-w4/build) | PASS: isolated production build |
| `git diff --check` | PASS |

Backend commands and affected reruns (102 unique cases passed across these runs,
not a full monorepo backend suite):

```sh
uv run --frozen --all-packages python -m pytest -q tests/application/test_w4_website_setup.py tests/application/test_wu02_foundation.py tests/application/test_w2_website_content.py tests/application/test_w3_appearance.py tests/contract/test_chat03_openapi.py tests/contract/test_wave2_contract_resolution.py tests/contract/test_wave2_full_assembly.py
# Initial: 82 passed, 4 failed due to the stale API startup estate-count guard.

uv run --frozen --all-packages python -m pytest -q tests/application/test_w4_website_setup.py -k http_disabled_site tests/application/test_wu02_foundation.py -k 'http_disabled_site or crawler_http' tests/contract/test_chat03_openapi.py tests/contract/test_wave2_full_assembly.py
# PASS: 2 affected HTTP/crawler cases; 52 deselected by the shared -k filter.

uv run --frozen --all-packages python -m pytest -q tests/contract/test_chat03_openapi.py::test_chat03_route_method_operation_and_success_status_parity tests/contract/test_wave2_full_assembly.py::test_wave2_api_registration_is_canonical_without_duplicate_routes tests/application/test_uf06_blog_archive.py tests/contract/test_preview_media_grants.py tests/e2e/test_chat03_auth.py
# PASS: 18 cases, including both remaining failed registration cases.
```

Defects corrected during verification: API startup still expected 113/86/251 and
51 core operations; it now checks exact 116/89/252 and 52 core identities without
weakening uniqueness/shape validation. New generic test callbacks needed explicit
TypeScript parameter types. Admin coverage guards now count the two new SITE
operations. Final affected checks pass. Python dependency deprecations and the
existing Admin Vite >500kB chunk warning remain non-failing warnings.

## Preservation

All 108 starting dirty paths, including the original 70 and W1–W3 additions,
remain present. Earlier implementation was extended only for W4. next-env.d.ts,
all three earlier JSON reports, W1/W2/W3 reports and DB-MIG-022 remain byte-identical
to their W4-start hashes. Production TS/CSS/JSON source matches the isolated build
snapshot. Nothing is staged. No original migration, legacy public app, tenant
record, post, navigation record, SEO setting or domain ownership was overwritten.
No browser, live server/container, live database/Redis/OpenSearch/MinIO operation,
migration application, DNS/Coolify operation, commit, push, reset, stash, clean or
deployment was performed. In-process API tests are not live service acceptance.

## Exact W4 file inventory

Relative to the preserved W4 starting working tree, not the combined UF/W1–W3 diff.

Modified (43):

- `README.md`
- `apps/admin/src/modules/global/CreateWebsitePage.tsx`
- `apps/admin/src/modules/site/AppearancePage.tsx`
- `apps/admin/src/modules/site/SitePages.tsx`
- `apps/admin/src/tests/contract-coverage.test.mjs`
- `apps/admin/src/tests/wu05.test.tsx`
- `apps/api/src/bp_api/composition/global_postgres.py`
- `apps/api/src/bp_api/composition/production.py`
- `apps/api/src/bp_api/composition/self_hosted.py`
- `apps/api/src/bp_api/composition/services.py`
- `apps/api/src/bp_api/http/admin_site/routes.py`
- `apps/api/src/bp_api/http/contract.py`
- `apps/api/src/bp_api/http/middleware.py`
- `apps/api/src/bp_api/http/public/routes.py`
- `apps/public-universal/src/site/lib/ssr.ts`
- `apps/public-universal/src/site/lib/types.ts`
- `apps/public-universal/src/site/pages/router/public-route-page.tsx`
- `apps/public-universal/src/site/styles/globals.css`
- `apps/public-universal/src/site/tests/ssr.test.mjs`
- `contracts/http/BLOG-DOC-15_openapi_v1.0-RC13.provenance.json`
- `contracts/http/BLOG-DOC-15_openapi_v1.0-RC13.yaml`
- `contracts/http/README.md`
- `database/verification/apply-chain.sql`
- `database/verification/doc08-contract.json`
- `database/verification/verify_static.py`
- `docs/engineering/CONTRACT_GENERATION.md`
- `docs/engineering/KNOWN_BLOCKERS.md`
- `docs/source-baseline.json`
- `packages/python/bp-application/src/bp_application/public_page.py`
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
- `tooling/generators/generate_openapi_artifacts.py`

Added (8):

- `apps/admin/src/modules/site/WebsiteSetupPanel.tsx`
- `apps/admin/src/tests/w4-website-setup.test.tsx`
- `apps/api/src/bp_api/composition/website_readiness.py`
- `apps/public-universal/W4_IMPLEMENTATION.md`
- `apps/public-universal/src/pages/_preview/site.tsx`
- `database/migrations/0023_DB-MIG-023__website-home-provisioning.sql`
- `packages/python/bp-application/src/bp_application/website_preview.py`
- `tests/application/test_w4_website_setup.py`
