# Database ownership boundary

Folders are reserved only. CHAT02 owns DOC-08 raw SQL migrations, seeds, RLS and verification. CHAT01 created no schema/DDL.

## Wave-2 reconciliation migration

`0017_DB-MIG-017__wave2-contract-reconciliation.sql` implements DOC-08 v1.0-RC2 without changing table counts: it adds per-tab `editor_instance_id` to `post_autosaves` and optional same-site `homepage_lead_post_id` to the existing `site_settings` singleton. All existing RLS/FORCE-RLS policies and 33-table ownership remain unchanged.
