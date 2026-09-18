# Central Admin application

CHAT06-owned React/Vite Central Admin implementation for the exact DOC-06 estate: 19 modules and 36 operational pages (20 SITE, 16 GLOBAL), plus non-module authentication/access/security surfaces. DOC-25 RC2 remains the visual authority.

## Wave-2 contract reconciliation

The Admin consumes the generated DOC-15 RC8 Admin client. The existing Active Website selector is backed by `API15-AUTH-012 GET /api/v1/auth/selectable-sites`, which returns only ACTIVE Sites the authenticated Admin may legitimately attempt to enter. The selector is working context only; `API15-S-001` and every later SITE operation still perform server-side SiteContext resolution and authorization.

The Post editor uses tab-scoped `editor_instance_id` for autosave, typed `static_page_key` for frozen STATIC destinations, structured JSON Site Settings values, and the RC8 typed contracts. No public-site visual runtime is imported into this application.
