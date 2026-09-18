# BLOG-DOC-16 v1.0-RC5 - Wave-2 Reconciliation

**Status:** OWNER-AUTHORIZED WAVE-2 RECONCILIATION
**Date:** 11 September 2026
**Supersedes:** v1.0-RC4 only where explicitly stated below.

## Normative decisions

### CB-W2-02 structured-data source model

The structured_data_inputs source is the canonical DOC-07 RC2 keyed object, not an array. Structured-data generation iterates deterministic object-type keys and validated field maps. Existing fallback, indexability, canonical, search, sitemap, redirect and schema.org output algorithms are otherwise unchanged.

### Security boundary

Raw JSON-LD directives remain prohibited as editorial input. The generator, not the editor, owns @context/@type/output construction. Unknown or invalid source keys fail validation before generated structured data is emitted.

## Invariant / count effect

No SEO/search/sitemap/redirect feature, indexability class, Page ID, ranking rule, worker job, or tenant boundary is added or removed. This revision solely eliminates the object-versus-array contradiction with DOC-07/DOC-08/DOC-15.

## Incorporation rule

Supersedes only the structured-data source representation clauses in Sections 5 and 14 and related examples/appendices of RC4. All other RC4 discovery semantics remain incorporated unchanged.
