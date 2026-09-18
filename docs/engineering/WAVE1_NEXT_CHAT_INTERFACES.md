# Wave-1 Inputs for CHAT04, CHAT05 and CHAT06

> **Historical lineage note:** these were the Wave-1 specialist entry interfaces. The current downstream baseline is the final Wave-2 master and DOC-15 RC8.

All three next implementation chats must start from `NAKSHATRA_MASTER_WAVE1_HANDOFF.zip`, not from the standalone CHAT01 or specialist archives.

## CHAT04 — Editorial & SITE Management Backend

Starting interfaces:

- canonical HTTP source: `contracts/http/BLOG-DOC-15_openapi_v1.0-RC8.yaml`;
- generated TS contract/client artifacts remain CHAT01 technical contracts;
- CHAT03 trusted context/security boundary: `bp_domain.context`, `bp_application.context::TrustedContextService`, `bp_application.authorization::AuthorizationService`;
- CHAT03 stable transaction/repository ports: `bp_ports.core`;
- CHAT02 concrete database implementation: `database/` plus `bp_adapters.postgres`;
- Wave-1 transaction bridge: `PostgresSiteTransactionPort` / `PostgresGlobalTransactionPort`;
- CHAT03 already owns/registers `API15-S-001`; CHAT04 must not duplicate it;
- SITE repository/use-case operations must accept explicit trusted `SiteContext` and must not introduce tenant-blind lookups.

CHAT04 may add its assigned editorial/SITE application modules and RC8 SITE transport only. It must not change DOC-08 schema/RLS or RC8 paths/schemas/statuses.

## CHAT05 — Worker, Redis, SEO/Search, Media & Derived Systems

Starting interfaces:

- `bp_domain.effects::SiteEffectEnvelope`;
- `bp_ports.core::DownstreamEffectsPort`;
- trusted `SiteContext` / `GlobalContext` types and security boundaries from CHAT03;
- DOC-08 PostgreSQL truth and CHAT02 adapter;
- CHAT11 infrastructure placeholders/configuration under `infrastructure/`;
- worker application container at `apps/worker/`;
- DOC-18/16/17 remain semantic authorities for jobs, Redis/cache, search/sitemap and media behavior.

CHAT05 owns mapping semantic downstream effects to Celery/Redis/OpenSearch/media/SEO machinery. PostgreSQL remains canonical; derived systems must remain site-keyed and rebuildable. Do not turn Redis/security-state internals into authorization authority.

## CHAT06 — Central Admin Frontend

Starting interfaces:

- Admin app container: `apps/admin/`;
- canonical generated Admin client: `packages/ts/api-client-admin/` backed only by RC8;
- shared public/API technical contracts remain site-neutral and non-visual;
- DOC-06/DOC-10 define the 36 Admin pages/flows;
- DOC-25 defines Admin visual/component authority;
- CHAT03 auth/session/SITE/GLOBAL transport is already present.

CHAT06 must consume the generated Admin HTTP client and must not import backend Python, database code, site presentation code, or infer authorization from the Active Website selector. The selector changes working context only; server-side SiteContext and authorization remain authoritative.
