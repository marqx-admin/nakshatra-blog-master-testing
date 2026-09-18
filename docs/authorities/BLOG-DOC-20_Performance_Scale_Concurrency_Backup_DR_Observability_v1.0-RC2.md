# DOC-20 Controlled Source Synchronization - v1.0-RC2

**Prior revision:** v1.0-RC1
**Date:** 11 September 2026
**Semantic change:** NONE

**Selected semantic Wave-2 authorities:** DOC-07 RC2 | DOC-08 RC2 | DOC-15 RC8 | DOC-16 RC5
**Canonical OpenAPI:** `contracts/http/BLOG-DOC-15_openapi_v1.0-RC8.yaml`
**OpenAPI SHA-256:** `bf577a463b4c5d8fdceddc2087f53216426ef88d67d8e1a0d22ccf819751cd00`
**RC8 estate:** 113 operations | 86 paths | 221 schemas/helpers | 1,311 resolved internal refs | 0 unresolved refs
**Operation classes:** 12 AUTH | 2 PUBLIC/PREVIEW | 63 SITE | 36 GLOBAL

## Document-specific synchronization
- Operational/performance references now consume DOC-15 v1.0-RC8 and DOC-16 v1.0-RC5.
- Where the inherited body asserts the HTTP estate/count gate, substitute the accepted RC8 estate: 113 operations | 86 paths | 221 schemas/helpers | 1,311 resolved internal refs | 0 unresolved refs; 12 AUTH | 2 PUBLIC/PREVIEW | 63 SITE | 36 GLOBAL.
- No latency, availability, rate-limit, capacity, backup, RPO/RTO, DR or observability target is changed. Health probes remain outside the canonical /api/v1 product operation estate.

## Supersession rule
Any inherited non-owning reference to DOC-15 RC7/RC6, 112 operations, 85 paths, 217 schemas/helpers, 1,297 refs, 11 AUTH operations, DOC-16 RC4, or `BLOG-DOC-15_openapi_v1.0-RC7.yaml` is **HISTORICAL / SUPERSEDED** in this revision. All other inherited owned semantics remain unchanged.
