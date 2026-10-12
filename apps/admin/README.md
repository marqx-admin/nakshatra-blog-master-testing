# Central Admin application

One React/Vite Central Admin implementation with 20 modules and 37 operational pages (21 SITE, 16 GLOBAL), plus authentication/access/security surfaces. The Universal Appearance page extends the existing SITE workspace.

## Wave-2 contract reconciliation

The Admin consumes the generated RC13 Admin client. The assigned-site selector is backed by `API15-AUTH-012 GET /api/v1/auth/selectable-sites`. The selector is working context only; `API15-S-001` and every later SITE operation still perform server-side SiteContext resolution and authorization.

The Post editor uses tab-scoped `editor_instance_id` for autosave, typed `static_page_key` for frozen STATIC destinations, structured JSON Site Settings values, and the RC13 typed contracts. No public-site visual runtime is imported into this application.
