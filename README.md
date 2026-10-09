# NAKSHATRA BLOGGING WEBSITE SYSTEM — Coolify Production Release

This repository is the final CHAT00 Wave-2 integrated monorepo and the authoritative implementation starting point for CHAT07 onward. It contains the accepted Wave-1 foundation/database/API/security/infrastructure/QA work plus integrated CHAT04 editorial/SITE backend, CHAT05 Worker/Redis/Search/SEO/Media derived systems, and CHAT06 Central Admin.

## Current contract baseline

Project-owner-authorized minimum Wave-2 reconciliation revisions:

- BLOG-DOC-07 v1.0-RC2
- BLOG-DOC-08 v1.0-RC2
- BLOG-DOC-15 v1.0-RC8
- BLOG-DOC-16 v1.0-RC5

Canonical Universal executable HTTP source: `contracts/http/BLOG-DOC-15_openapi_v1.0-RC12.yaml`

SHA-256: `f5bbedf280cd87705ae98d88dcca5fac1cda604797e5a274e9ca94c27ee5d0cd`

Final HTTP registry: 113 operations / 86 paths / 248 schemas-helpers / 1,360 resolved internal references, with 12 AUTH / 2 PUBLIC-PREVIEW / 63 SITE / 36 GLOBAL operations. FastAPI-generated OpenAPI is not canonical.

## Architecture and frozen-count guards

- 14 independent public Next.js application folders
- 1 React/Vite Central Admin
- 1 Python/FastAPI API
- 1 Python Worker
- 33 PostgreSQL tables = 20 SITE-owned FORCE-RLS + 13 GLOBAL/system
- 69 fixed permission seeds
- 12 ArticleBody block types
- 5 persisted Post states
- Worker: 6 queues / 11 jobs / 7 retry profiles
- Admin: 19 modules / 36 operational pages = 20 SITE + 16 GLOBAL
- no OpenAI/LLM/AI provider runtime dependency

## Wave-2 reconciliation

All seven Wave-2 contract blockers are resolved. `DB-MIG-017` is forward-only and adds only the minimum persistence required for editor-instance autosaves and Homepage lead selection; no table count, permission count, ArticleBody type count or Post-state count changed.

See:

- `MASTER_WAVE2_HANDOFF.md`
- `MASTER_WAVE2_CONTRACT_RESOLUTION.md`
- `MASTER_WAVE2_TRACEABILITY.md`
- `MASTER_WAVE2_TEST_RESULTS.md`

Superseded Wave-1/Wave-2 specialist and provisional status records are retained under `evidence/historical/superseded/` and are not current implementation authority.

## Source-set synchronization

CHAT00 source synchronization is complete. The semantic Wave-2 contract remains DOC-07 RC2 / DOC-08 RC2 / DOC-15 RC8 / DOC-16 RC5. Cross-reference-only revisions are indexed in `docs/source-baseline.json` and packaged under `docs/authorities/`. They change no implementation behavior. Any inherited non-owning RC7/RC4/old-count reference is historical/superseded by DOC-00 RC2.

## Production deployment

The active self-hosted deployment is `infrastructure/coolify/compose.yaml`. It is designed for a Hostinger VPS managed by Coolify and includes every runtime service, all 14 public applications, persistent migration evidence, private self-hosted S3-compatible storage, and a private self-hosted security-state store. Start with `infrastructure/coolify/README.md`.

The `BP_RUNTIME_COMPOSITION=two-site-e2e` path remains an explicit development/test fixture. Staging and production use only `BP_RUNTIME_COMPOSITION=self-hosted` in the Coolify composition.

## Local development

Install dependencies and start the lightweight development API plus Central Admin together:

```bash
corepack pnpm@10.34.5 install --frozen-lockfile
corepack pnpm dev
```

Open `http://localhost:5173/`. The launcher waits for the API on port 8000 before starting Vite, preventing the Admin landing page from failing when its initial authorization request is proxied. This lightweight API intentionally has no persisted Admin account; use the provider-backed local or Coolify composition when testing authenticated operations.
