# APP-13 / SITE-13 - CHAT10 public frontend

Canonical domain: `ApkaPandit.in`
Package: `@bp/site-13-apka-pandit`

Independent Next.js Pages Router SSR application implementing all 14 public Page IDs and RC8 `PageData` transport through the generated `@bp/api-client-public` client. Site-local presentation is owned entirely under `src/site/`; no public visual component, CSS, theme or runtime is imported from another site.

Production SSR uses `API15-PUB-001` for ordinary public routes and `API15-PUB-002` for private Preview, forwarding the effective Host to the shared API for trusted Host -> SiteContext resolution. Direct PostgreSQL, Redis, OpenSearch and object-storage access is prohibited.

Local fixtures are evidence-only and are enabled only when `NODE_ENV=test` and `BP_PUBLIC_FIXTURE_MODE=1`.
