# SITE-04 - ZodiacDaily.in

CHAT08-owned isolated Next.js public frontend.

- Canonical domain: `ZodiacDaily.in`
- Trusted tenant authority: effective Host -> shared RC8 public API -> SiteContext
- HTTP client: `@bp/api-client-public` only (`API15-PUB-001`, `API15-PUB-002`)
- Page estate: all 14 DOC-05 public Page IDs / 14 route families
- Semantic UI: all 50 DOC-12 component contracts and all 12 ArticleBody renderers implemented locally
- Visual authority: DOC-26 RC2 + DOC-27 RC2 for SITE-04
- Presentation is site-local. No visual imports from any other public site.

The local fixture resolver is test-only (`NODE_ENV=test` + `BP_PUBLIC_FIXTURE_MODE=1`) and cannot be selected in production.
