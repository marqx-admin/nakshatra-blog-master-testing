# BLOG-DOC-15 v1.0-RC8 - Wave-2 Reconciliation

**Status:** OWNER-AUTHORIZED WAVE-2 RECONCILIATION
**Date:** 11 September 2026
**Supersedes:** v1.0-RC7 only where explicitly stated below.

## Normative decisions

### CB-W2-01 Autosave transport

AutosaveInput now requires editor_instance_id (opaque non-empty text, max 128). AutosaveResponse returns editor_instance_id. API15-S-015 requires the same editor_instance_id as query input. AUTOSAVE Preview handoff carries editor_instance_id so the chosen tab-specific autosave is deterministic.

### CB-W2-02 structured_data_inputs

Post create/update schemas transport the canonical DOC-07 RC2 object representation losslessly. The array-form representation is removed.

### CB-W2-03 STATIC transport

AdminLinkDestination, AdminNavDestination and InternalLinkCandidate use static_page_key for STATIC targets. Entity targets continue to use target_id. STATIC targets never require fake UUID rows and internal links never become arbitrary URL strings.

### CB-W2-05 Site Settings value

SettingEntry.value uses an explicit JSON-compatible SettingJsonValue. Structured Site Settings may carry objects whose child values are JSON scalars or scalar arrays. Undocumented stringification is not part of the contract.

### CB-W2-07 Active Website selector

Adds API15-AUTH-012 GET /api/v1/auth/selectable-sites. It requires an authenticated Admin session and returns only ACTIVE Sites the caller may legitimately attempt to enter (all ACTIVE Sites for the designated Super Admin; assigned ACTIVE Sites for ordinary Admins). It grants no authority; every later SITE request still resolves and authorizes CTX-ADMIN-SITE.

### API15-S-002 completion note

GET /api/v1/admin/sites/{site_key}/dashboard remains the existing canonical SITE operation; reconciliation requires the integrated backend to register and implement it exactly rather than modifying or removing the operation.

## Invariant / count effect

Canonical executable companion: contracts/http/BLOG-DOC-15_openapi_v1.0-RC8.yaml. SHA-256 bf577a463b4c5d8fdceddc2087f53216426ef88d67d8e1a0d22ccf819751cd00. Final contract: 113 operations / 86 unique paths / 221 schemas+helpers / 1,311 resolved internal $refs. Scope subtotals: AUTH 12, PUBLIC+PREVIEW 2, SITE 63, GLOBAL 36. No new permission, Page ID, Post state, service or database table is introduced.

## Incorporation rule

Supersedes only affected transport/schema clauses in Sections 5-7, 17, 20, 22, 27, 30 and the operation/schema appendices of RC7. All unaffected RC7 HTTP behavior remains incorporated unchanged.
