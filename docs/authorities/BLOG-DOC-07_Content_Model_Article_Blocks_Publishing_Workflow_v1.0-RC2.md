# BLOG-DOC-07 v1.0-RC2 - Wave-2 Reconciliation

**Status:** OWNER-AUTHORIZED WAVE-2 RECONCILIATION
**Date:** 11 September 2026
**Supersedes:** v1.0-RC1 only where explicitly stated below.

## Normative decisions

### CB-W2-01 Autosave editor instance identity

Autosave identity is Site + Post + Admin account + editor_instance_id. editor_instance_id is a non-empty opaque per-editor-tab identifier, 1-128 characters. Autosave save/latest/recovery operations are scoped to that identity. Two tabs for the same Admin and Post never overwrite one another. A base_post_version mismatch remains a stale-write conflict.

### CB-W2-02 structured_data_inputs

The canonical semantic representation is a JSON object keyed by generated structured-data object type. Each type value is a non-empty object whose fields are JSON scalar values or arrays of JSON scalars. Raw JSON-LD directive keys beginning with @ and arbitrary nested objects remain prohibited. No array-form semantic model remains authoritative.

### CB-W2-03 typed STATIC internal links

INTERNAL destinations continue to distinguish ARTICLE/CATEGORY/TAG/AUTHOR entity targets from STATIC page targets. STATIC targets use static_page_key from the existing frozen static-page registry: ABOUT, CONTACT, PRIVACY, TERMS, DISCLAIMER. STATIC internal links do not use a UUID target_id and do not degrade to arbitrary URL storage.

### CB-W2-06 EMBED provider registry

EMBED blocks remain the existing approved block type. provider_key must resolve through a deployment/configuration-owned approved-provider registry. A provider entry declares source_kind URL or ID; URL providers declare exact allowed HTTPS hosts and ID providers declare an identifier validation pattern. An empty registry is valid and fail-closed. No provider brand is approved by this reconciliation.

## Invariant / count effect

No new ArticleBody type, Post state, public Page ID, permission, service, or product capability is created. Exactly 12 ArticleBody block types and 5 persisted Post states remain authoritative.

## Incorporation rule

Supersedes only the affected clauses in Sections 8-12, 21, 24, 27 and Appendix B of RC1. All unaffected RC1 content remains incorporated unchanged.
