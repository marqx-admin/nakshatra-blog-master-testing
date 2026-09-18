-- BLOG-DOC-08 v1.0-RC2 / DB-MIG-017 Wave-2 contract reconciliation
-- Forward-only additive migration. No historical migration is rewritten.
BEGIN;

-- CB-W2-01: preserve same-user multi-tab autosaves as independent private rows.
ALTER TABLE post_autosaves ADD COLUMN editor_instance_id text;
UPDATE post_autosaves
SET editor_instance_id = 'legacy:' || autosave_id::text
WHERE editor_instance_id IS NULL;
ALTER TABLE post_autosaves ALTER COLUMN editor_instance_id SET NOT NULL;
ALTER TABLE post_autosaves DROP CONSTRAINT uq_post_autosaves__post_editor;
ALTER TABLE post_autosaves
  ADD CONSTRAINT uq_post_autosaves__post_editor_instance
  UNIQUE (site_id, post_id, editor_admin_id, editor_instance_id);
ALTER TABLE post_autosaves
  ADD CONSTRAINT ck_post_autosaves__editor_instance
  CHECK (char_length(editor_instance_id) BETWEEN 1 AND 128);
CREATE INDEX ix_post_autosaves__site_post_editor_instance_saved
  ON post_autosaves(site_id, post_id, editor_admin_id, editor_instance_id, saved_at DESC);

-- CB-W2-04: persist the already-defined optional Homepage lead selection without
-- creating a Pages table or a new homepage structure. Same-site ownership is
-- enforced by the existing posts(site_id,post_id) alternate key.
ALTER TABLE site_settings ADD COLUMN homepage_lead_post_id uuid NULL;
ALTER TABLE site_settings
  ADD CONSTRAINT fk_site_settings__homepage_lead
  FOREIGN KEY (site_id, homepage_lead_post_id)
  REFERENCES posts(site_id, post_id);
CREATE INDEX ix_site_settings__homepage_lead
  ON site_settings(site_id, homepage_lead_post_id)
  WHERE homepage_lead_post_id IS NOT NULL;

COMMIT;
