# DOC-19 Controlled Source Synchronization - v1.0-RC3

**Prior revision:** v1.0-RC2
**Date:** 11 September 2026
**Semantic change:** NONE

**Selected semantic Wave-2 authorities:** DOC-07 RC2 | DOC-08 RC2 | DOC-15 RC8 | DOC-16 RC5
**Canonical OpenAPI:** `contracts/http/BLOG-DOC-15_openapi_v1.0-RC8.yaml`
**OpenAPI SHA-256:** `bf577a463b4c5d8fdceddc2087f53216426ef88d67d8e1a0d22ccf819751cd00`
**RC8 estate:** 113 operations | 86 paths | 221 schemas/helpers | 1,311 resolved internal refs | 0 unresolved refs
**Operation classes:** 12 AUTH | 2 PUBLIC/PREVIEW | 63 SITE | 36 GLOBAL

## Document-specific synchronization
- Security transport references now consume DOC-15 v1.0-RC8. The canonical AUTH family is API15-AUTH-001..012 (12 AUTH operations).
- API15-AUTH-012 GET /api/v1/auth/selectable-sites is an authenticated current-session projection. DOC-19 continues to own credential/session/MFA/security mechanics; DOC-02 and DOC-04 continue to own authorization, assignments and trusted SiteContext. The selector response grants no authority.
- Discovery cross-reference is DOC-16 v1.0-RC5. All inherited assertions that say exactly 11 AUTH operations or DOC-15 RC7 are historical/superseded cross-references only.

## Supersession rule
Any inherited non-owning reference to DOC-15 RC7/RC6, 112 operations, 85 paths, 217 schemas/helpers, 1,297 refs, 11 AUTH operations, DOC-16 RC4, or `BLOG-DOC-15_openapi_v1.0-RC7.yaml` is **HISTORICAL / SUPERSEDED** in this revision. All other inherited owned semantics remain unchanged.
