# BLOG-DOC-08 v1.0-RC2 - Wave-2 Reconciliation

**Status:** OWNER-AUTHORIZED WAVE-2 RECONCILIATION
**Date:** 11 September 2026
**Supersedes:** v1.0-RC1 only where explicitly stated below.

## Normative decisions

### CB-W2-01 post_autosaves

DB-TBL-021 post_autosaves adds editor_instance_id text NOT NULL. The per-editor uniqueness rule becomes UNIQUE(site_id, post_id, editor_admin_id, editor_instance_id). A length CHECK enforces 1-128 characters. Existing rows are forward-migrated with deterministic legacy identifiers. RLS and site ownership are unchanged.

### CB-W2-02 structured_data_inputs

posts.structured_data_inputs remains JSONB with an object-type invariant. RC2 explicitly aligns its semantic mapping to DOC-07 RC2: object keyed by generated object type, with validated scalar/scalar-array leaf values. No JSONB column or table change is required for this blocker.

### CB-W2-04 Homepage lead Post

DB-TBL-029 site_settings adds nullable homepage_lead_post_id UUID. The field uses a composite FOREIGN KEY (site_id, homepage_lead_post_id) -> posts(site_id, post_id), preserving same-site ownership. Application eligibility requires the selected lead Post to be currently PUBLISHED before assignment. Permanent Post deletion clears any matching Homepage lead reference before deleting the Post.

### CB-W2-05 structured Site Settings

Existing JSONB fields contact_info, social_profiles, seo_defaults and analytics_verification remain JSONB objects and are transported as JSON-compatible objects rather than JSON-encoded strings. No new settings table is created.

## Invariant / count effect

Physical estate remains 33 tables = 20 SITE-owned FORCE-RLS tables + 13 GLOBAL/system tables. Permission seed count remains 69. The forward-only reconciliation migration is DB-MIG-017; historical migrations are not rewritten.

## Incorporation rule

Supersedes only affected persistence clauses in Sections 9, 11, 12, 17, 19, 22 and the relevant appendices of RC1. All unaffected RC1 DDL/RLS/seed semantics remain incorporated unchanged.
