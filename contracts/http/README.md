# Canonical HTTP contract custody

Current executable contract: **RC13**, including the owner-authorized UF-06 published-article archive amendment.

Canonical source: `contracts/http/BLOG-DOC-15_openapi_v1.0-RC13.yaml`
SHA-256: `40e642fab61bae9f5fd60afac2ad76912cb6f1a5c1fe4e251dc7f0485f278461`

RC13 defines one `TemporarySiteUrl` schema, uses it for the existing optional read-only `AdminSiteContext.temporary_site_url`, and adds optional `CreateWebsiteResponse.temporary_site_url`. HTTP is valid only for `localhost` or its subdomains; deployed temporary URLs use HTTPS. RC12 and its provenance remain byte-unchanged. Operations, permissions, presentation, and Site Settings transport remain unchanged. UF-06 adds PUB-BLOG-01 and BlogPageData to the existing public-page endpoint; it introduces no database or endpoint changes. FastAPI-generated OpenAPI is diagnostic only.

W4 adds optional server-allocated `CreateWebsiteInput.site_key`, optional approved
Home text, a read-only site UUID, API15-S-098 website-preview handoff, API15-S-099
computed setup readiness and API15-PUB-003 authenticated whole-site projection.
No permission, table or column is added. DB-MIG-023 adds only an insert-time Home-content function overload and remains unapplied. Generated artifacts were
authored with the existing generator. The owner subsequently authorized automated verification: relevant tests,
typechecks, generated drift checks and isolated builds passed after targeted fixes.
Runtime/browser/database acceptance remains unverified. See
apps/public-universal/W4_IMPLEMENTATION.md for exact commands and results.
