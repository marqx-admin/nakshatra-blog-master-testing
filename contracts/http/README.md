# Canonical HTTP contract custody

Current executable contract: **RC12**, an additive WU-05 SITE-context correction.

Canonical source: `contracts/http/BLOG-DOC-15_openapi_v1.0-RC12.yaml`
SHA-256: `f5bbedf280cd87705ae98d88dcca5fac1cda604797e5a274e9ca94c27ee5d0cd`

RC12 adds optional read-only `AdminSiteContext.temporary_site_url` for an authorized same-site Appearance reader. The URL comes from the active provisioning-created domain row, independently of the current canonical production domain. RC11 remains unchanged as a historical executable artifact. Its presentation contract, typed Site Settings transport, and public PageData remain unchanged. FastAPI-generated OpenAPI is diagnostic only.
