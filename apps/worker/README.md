# Worker

Single Python/Celery Worker codebase for the frozen DOC-18 background contract.

## Runtime profiles

The same immutable Worker image supports seven deployment profiles:

- `publish` -> `q18.publish`
- `media` -> `q18.media`
- `search` -> `q18.search`
- `sitemap` -> `q18.sitemap`
- `cache` -> `q18.cache`
- `maintenance` -> `q18.maintenance`
- `scheduler` -> delayed-publish promotion plus global Site Registry reconciliation; it does not consume a source queue.

Staging/production selects the production composition automatically from `BP_ENV=staging|production` with `BP_RUNTIME_COMPOSITION` unset. The development/test-only `BP_RUNTIME_COMPOSITION=two-site-e2e` composition remains explicit and is rejected outside development/test.

The scheduler profile requires the explicit platform-runtime PostgreSQL credential file in addition to the shared control/broker Redis configuration. Queue-worker profiles use the site-runtime PostgreSQL credential. Production sitemap artifacts are stored in object storage with immutable generations and atomic active-pointer activation; the local filesystem sitemap adapter remains development/test-only. Media cache/revocation jobs use the existing delivery policy with an AWS CloudFront purge client resolved from the configured media CDN origin.

This profile split changes no DOC-18 queue, job, retry, dedupe, lease, replay, scheduling, SiteContext, or authoritative-state semantics.
