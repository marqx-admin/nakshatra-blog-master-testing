# CHAT03 Interface Handoff

Status: stable CHAT03 interface checkpoint, 11 Sep 2026.

> **Wave-2 reconciliation note:** the current integrated master extends this historical checkpoint with `API15-AUTH-012` and `API15-S-002`; current CHAT03/shared-foundation registration is 52 operations and canonical transport authority is DOC-15 RC8.

This file freezes the shared backend interfaces that CHAT04, CHAT05 and CHAT06 may build against. It does not transfer ownership of the files below and it does not redefine DOC-02, DOC-04, DOC-08, DOC-13, DOC-15 or DOC-19.

## Canonical HTTP boundary

- Canonical contract: `contracts/http/BLOG-DOC-15_openapi_v1.0-RC8.yaml`.
- FastAPI generated OpenAPI is disabled and is never canonical.
- CHAT03 currently registers the 52 CHAT03-owned/shared-foundation operations: 2 `API15-PUB-*`, 12 `API15-AUTH-*`, 36 `API15-G-*`, `API15-S-001`, and `API15-S-002`.
- Route functions parse HTTP input, call application services/ports, map results, and apply contract headers/status. Business logic belongs outside route functions.
- Wire JSON remains lower_snake_case and must match the canonical YAML. Public PageData remains DOC-13 authority.

## Composition boundary

Entry point: `apps/api/src/bp_api/app.py`.

Composition data class: `apps/api/src/bp_api/composition/services.py::Services`.

Later chats receive dependencies through `request.app.state.services`; they must not instantiate persistence, queue, Redis, search, media, security-store, secrets or mail providers inside route modules.

Stable service members at this checkpoint:

- `contexts: TrustedContextService`
- `authorization: AuthorizationService`
- `sessions: SessionAuthority`
- `auth: AuthService`
- `public_pages: PublicPagePort`
- `global_operations: GlobalOperationsPort`
- `audit: AuditPort`
- `preview_authority: PreviewAuthorityPort | None`
- `site_context_payload: AdminSiteContextPayloadPort | None`

CHAT04 may extend composition with its own SITE application services through a dedicated composition module or additional typed fields coordinated with CHAT00. Do not mutate the shared context/security semantics.

## Trusted SiteContext interface

Module: `bp_domain.context`.

Use these exact context classes/types:

- `SiteContext` for one trusted site only.
- `GlobalContext` for explicit privileged GLOBAL execution only.
- `RequestContext` for request correlation and exactly one optional scope class.
- `ContextKind`: `CTX-PUBLIC-SITE`, `CTX-ADMIN-SITE`, `CTX-WORKER-SITE`, `CTX-GLOBAL`, `CTX-PREVIEW-SITE`.
- `ContextSource`: `PUBLIC_HOST`, `ADMIN_SELECTION`, `WORKER_PAYLOAD`, `GLOBAL_AUTHORITY`, `PREVIEW`.

`SiteContext` cannot represent GLOBAL or null scope. It carries resolved `site_id`, `site_key`, `site_status`, `canonical_domain`, source, request correlation, and optional configured timezone/locale/version data. Public/Preview contexts additionally carry the normalized `request_host`.

Construct contexts only through trusted server-side resolution. Current resolver: `bp_application.context::TrustedContextService`.

- Public: `await contexts.public(effective_host, request_id=...)`.
- Preview site binding: `await contexts.preview(effective_host, request_id=...)`, followed by resource-bound `PreviewAuthorityPort` validation.
- Admin SITE: `await contexts.admin_site(site_key, principal=..., request_id=...)`.
- GLOBAL: `contexts.global_context(principal=..., request_id=...)`.

Never construct a `SiteContext` from a request body/query `site_id`. Never use missing site context as all-sites authority. Super Admin still enters explicit `SiteContext` for site-owned data.

## Authorization interface

Module: `bp_application.authorization::AuthorizationService`.

- `fresh_principal(admin_id)` reloads current account authority.
- `require_site(principal, site_key, required_permissions)` checks current SITE authority. A non-Super Admin must have active site membership represented by the current site permission map and the required exact permission set. Super Admin does not require ordinary role grants but still requires an explicit trusted SiteContext.
- `require_global(principal, required_permissions)` checks explicit GLOBAL permission authority. Super Admin is owner-level authority; non-Super Admin requires current GLOBAL permission state.

Authorization is repeated server-side. UI visibility, selector state, session validity, object ID validity and Preview authority are not permission grants.

Wrong-site target resolution must use a scoped repository lookup and return the same non-disclosing not-found behavior as an unknown target.

## Session/security interface

Domain types: `bp_domain.security`.

Application services: `bp_application.security`.

Stable types used across backend work:

- `AdminPrincipal`
- `SessionRecord`
- `TokenRecord`
- `MfaRecord`
- `StepUpRecord`
- `AccountState`
- `StepUpLevel`

Stable ports:

- `IdentityAuthorizationPort`
- `SecurityStateStorePort`
- `SecretProviderPort`
- `MailPort`
- `SecurityThrottlePort`
- `PreviewAuthorityPort`

The security-state store is separate from DOC-08 canonical business persistence. Redis used by CHAT05 is not the security-state authority.

## Common error model

Module: `bp_domain.errors`.

Use `SecurityFault` subclasses instead of framework-specific HTTP exceptions in application/domain code:

- `BadRequest` -> `BAD_REQUEST` / 400
- `Unauthenticated` -> `UNAUTHENTICATED` / 401
- `Denied` -> `DENIED` / 403
- `NotFound` -> `NOT_FOUND` / 404
- `Conflict` -> `CONFLICT` / 409
- `VersionConflict` -> `VERSION_CONFLICT` / 409
- `StateConflict` -> `STATE_CONFLICT` / 409
- `IdempotencyKeyReuse` -> `IDEMPOTENCY_KEY_REUSE` / 409
- `ValidationFault` -> `VALIDATION_FAILED` / 422
- `RateLimited` -> `RATE_LIMITED` / 429
- `Unavailable` -> `SERVICE_UNAVAILABLE` / 503

`ErrorDetail` is the transport-neutral field-detail value object. `bp_api.http.errors` owns conversion to canonical `ApiError` wire shape.

## Persistence and transaction expectations for CHAT02/CHAT04

Port home: `bp_ports.core`.

- `SiteRegistryPort` resolves a host/site key/site ID without granting authority.
- `IdentityAuthorizationPort` supplies authoritative identity and current authorization data.
- `SiteTransactionPort.transaction(context: SiteContext)` is the CHAT02 integration seam for the DOC-23 transaction contract: begin transaction, set transaction-local `app.site_id`, execute scoped SQL, commit/rollback. The port must never infer GLOBAL from missing context.
- `GlobalTransactionPort.transaction(context: GlobalContext)` is a separately typed privileged path.

CHAT03 does not implement DOC-08 schema or SQL. CHAT04 repositories/use cases must accept a trusted SiteContext explicitly for ordinary site-owned data. Do not introduce tenant-blind helpers such as `get_post(post_id)` on ordinary request paths.

## Audit-effect interface

Use `bp_ports.core::AuditPort.append(...)`.

The interface accepts event code, actor Admin ID, optional site ID and privacy-safe details. Never include passwords, raw tokens, MFA secrets, secret values or private content in audit details. Durable append-only database behavior remains the DOC-08/CHAT02 adapter responsibility.

## Downstream-effect boundary for CHAT04/CHAT05

Neutral envelope: `bp_domain.effects::SiteEffectEnvelope`.

Port: `bp_ports.core::DownstreamEffectsPort.emit(effect)`.

The envelope always retains trusted `SiteContext`, entity identity, source version/generation where applicable and correlation ID. It deliberately contains no Celery/Redis/OpenSearch/media/SEO implementation decision. CHAT04 may emit authorized semantic effects after durable business truth changes; CHAT05 owns the queue/cache/search/media/SEO mapping and revalidation rules.

## Public PageData boundary

Port: `bp_ports.core::PublicPagePort`.

- `resolve_page(context: SiteContext, path, q, page, page_size)` returns `(status, DOC-13-compatible body, headers)`.
- `resolve_preview(context: SiteContext, post_id)` returns DOC-13 Preview PageData after Preview authority has been validated.

The port cannot return all-site data for client-side filtering and cannot add fields absent from DOC-13/OpenAPI.

## GLOBAL application boundary

Port: `bp_ports.core::GlobalOperationsPort.execute(...)` accepts `GlobalContext`, never `SiteContext | None`.

GLOBAL aggregation does not convert site-owned rows into global ownership. A GLOBAL operation that drills into detailed site data must establish and authorize the target SiteContext before site-owned data is returned.

## API route registration convention

- Fixed CHAT03 routes live under `apps/api/src/bp_api/http/{public,auth,admin_site}`.
- The 36 CHAT03 GLOBAL routes are registered from the canonical YAML by `bp_api.http.admin_global.routes::register` and never invented from PDF examples.
- Later SITE transports owned by CHAT04 must register only canonical `API15-S-*` operations assigned to CHAT04 and must not duplicate `API15-S-001`.
- Every route must preserve canonical method, path, operationId, success status, request schema, response/error status set and scope/security semantics.

## Schema/mapping convention

Transport validation/mapping belongs under `apps/api/src/bp_api/http/mappers/` and `bp_api.http.contract` helpers. Application/domain code must not depend on FastAPI/Pydantic wire objects. Generated/derived framework OpenAPI is diagnostic only and must not replace the RC8 YAML.

## Files later chats must not edit without CHAT00 coordination

CHAT03 owns these shared files/areas:

- `apps/api/src/bp_api/app.py`
- `apps/api/src/bp_api/config/`
- `apps/api/src/bp_api/composition/services.py`
- `apps/api/src/bp_api/http/contract.py`
- `apps/api/src/bp_api/http/errors.py`
- `apps/api/src/bp_api/http/middleware.py`
- `apps/api/src/bp_api/http/dependencies/security.py`
- `apps/api/src/bp_api/http/auth/`
- `apps/api/src/bp_api/http/public/`
- `apps/api/src/bp_api/http/admin_global/`
- `packages/python/bp-domain/src/bp_domain/{context.py,effects.py,errors.py,security.py}`
- `packages/python/bp-ports/src/bp_ports/core.py`
- `packages/python/bp-application/src/bp_application/{context.py,authorization.py,security.py}`
- `packages/python/bp-adapters-security-store/`
- `packages/python/bp-adapters-secrets/`
- `packages/python/bp-adapters-mail/`

CHAT04 owns its editorial SITE modules and must consume these interfaces. CHAT05 owns worker/Redis/OpenSearch/media/SEO implementation and must consume these interfaces. CHAT06 owns Admin frontend code and generated client consumption; it must not import backend Python or infer tenant authority in the browser.

## Checkpoint evidence

At the interface checkpoint, the targeted Python compile and interface/OpenAPI/SiteContext tests are recorded under `evidence/chat03/`. Import Linter is not installed in the runtime and is recorded as NOT_EXECUTED rather than PASS.

## Wave-1 integration note

The Wave-1 integrator has now bound the stable `SiteTransactionPort` and `GlobalTransactionPort` shapes to CHAT02's PostgreSQL transaction primitives through `bp_adapters.postgres.ports`. This does not close the live PostgreSQL/RLS evidence gate and does not implement the remaining production persistence adapters listed in `WAVE1_CHAT02_CHAT03_RECONCILIATION.md`.
