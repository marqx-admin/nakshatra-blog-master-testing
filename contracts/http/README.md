# Canonical HTTP contract custody

Current executable contract: **RC13**, the narrow server-authored temporary-site URL correction.

Canonical source: `contracts/http/BLOG-DOC-15_openapi_v1.0-RC13.yaml`
SHA-256: `5c3d1246a313facce9b798331cbed5ec2293b3a8d8d0d1adb57373d6d7574eef`

RC13 defines one `TemporarySiteUrl` schema, uses it for the existing optional read-only `AdminSiteContext.temporary_site_url`, and adds optional `CreateWebsiteResponse.temporary_site_url`. HTTP is valid only for `localhost` or its subdomains; deployed temporary URLs use HTTPS. RC12 and its provenance remain byte-unchanged. Operations, permissions, presentation, Site Settings transport, and public PageData remain unchanged. FastAPI-generated OpenAPI is diagnostic only.
