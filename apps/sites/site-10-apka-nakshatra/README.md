# APP-10 / SITE-10 - CHAT09 public frontend

Canonical domain: `ApkaNakshatra.com`
Package: `@bp/site-10-apka-nakshatra`

This is an independent Next.js Pages Router SSR application implementing the complete 14-Page-ID public frontend contract for SITE-10. `src/pages/` contains thin route/status adapters. All Header, Footer, navigation, page composition, semantic components, ArticleBody renderers, styles, fixtures and local tests are physically site-local under `src/site/`. No presentation import from any other site is permitted.

Production SSR calls only the generated `@bp/api-client-public` DOC-15 RC8 client (`API15-PUB-001` and `API15-PUB-002`) and forwards the effective request Host to the centralized API. The package/site manifest is diagnostic and never selects tenant authority.

Visual direction: **Premium celestial scholarship / navy-and-gold folio masthead; fine keylines; expansive star geometry**, using the site-local DOC-26 RC2 / DOC-27 RC2 palette, typography, geometry and responsive rules.

For deterministic source evidence when live dependencies are unavailable, the SSR adapter permits contract-shaped local fixtures only when **both** `NODE_ENV=test` and `BP_PUBLIC_FIXTURE_MODE=1`. Production ignores evidence mode and always uses the RC8 public client.
