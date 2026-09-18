# bp-adapters-redis

CHAT05 Redis control/cache adapter. Implements the DOC-18 site-scoped key grammar, dedupe, leases, public cache epoch/dependency invalidation, search-status coordination, and sitemap dirty/build coordination. It targets the control/cache Redis plane only; broker data belongs to `bp-adapters-queue`.
