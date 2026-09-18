# APP-01 / SITE-01 - CHAT07 public frontend

Canonical domain: `WhatsYourRashi.in`
Package: `@bp/site-01-whats-your-rashi`

This is an independent Next.js Pages Router SSR application implementing the CHAT07 public proof-pair scope. `src/pages/` contains thin route/status adapters only. All visual presentation, shell, page composition, ArticleBody rendering, styles, fixtures and local tests are owned under `src/site/`.

Production SSR calls only the generated `@bp/api-client-public` RC8 client (`API15-PUB-001` and `API15-PUB-002`) and forwards the effective request Host to the centralized API. The package/site manifest is diagnostic and is never used to select tenant authority.

For deterministic test evidence when live dependencies are unavailable, the SSR adapter permits contract-shaped local fixtures only when **both** `NODE_ENV=test` and `BP_PUBLIC_FIXTURE_MODE=1`. Production ignores this evidence mode and always uses the generated RC8 public client. Fixture results remain explicitly non-live evidence.
