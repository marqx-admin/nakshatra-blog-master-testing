# DOC-22 Controlled Source Synchronization - v1.0-RC2

**Prior revision:** v1.0-RC1
**Date:** 11 September 2026
**Semantic change:** NONE

**Selected semantic Wave-2 authorities:** DOC-07 RC2 | DOC-08 RC2 | DOC-15 RC8 | DOC-16 RC5
**Canonical OpenAPI:** `contracts/http/BLOG-DOC-15_openapi_v1.0-RC8.yaml`
**OpenAPI SHA-256:** `bf577a463b4c5d8fdceddc2087f53216426ef88d67d8e1a0d22ccf819751cd00`
**RC8 estate:** 113 operations | 86 paths | 221 schemas/helpers | 1,311 resolved internal refs | 0 unresolved refs
**Operation classes:** 12 AUTH | 2 PUBLIC/PREVIEW | 63 SITE | 36 GLOBAL

## Document-specific synchronization
- Traceability baseline now consumes DOC-15 v1.0-RC8 and DOC-16 v1.0-RC5. Existing 50 execution-home chains, 161 capabilities and 180 QA21 IDs remain unchanged.
- HTTP trace/count gate is synchronized to 113 operations | 86 paths | 221 schemas/helpers | 1,311 resolved internal refs | 0 unresolved refs; 12 AUTH | 2 PUBLIC/PREVIEW | 63 SITE | 36 GLOBAL. FZ22-04 now checks the DOC-15 RC8 version/count lock.
- Selectable-sites trace edge: DOC-02 assignment/authorization + DOC-04 trusted context -> DOC-15 RC8 API15-AUTH-012 -> DOC-06/DOC-10 Active Website selector execution -> DOC-25 selector presentation -> existing QA21 ADM/PERM/SEC/REG families. The projection does not create a capability, permission, Page ID or new execution home.

## Supersession rule
Any inherited non-owning reference to DOC-15 RC7/RC6, 112 operations, 85 paths, 217 schemas/helpers, 1,297 refs, 11 AUTH operations, DOC-16 RC4, or `BLOG-DOC-15_openapi_v1.0-RC7.yaml` is **HISTORICAL / SUPERSEDED** in this revision. All other inherited owned semantics remain unchanged.
