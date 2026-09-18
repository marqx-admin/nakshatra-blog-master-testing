-- BLOG-DOC-08 v1.0-RC1 / DB-MIG-007 post_history
BEGIN;

CREATE TABLE post_revisions (
  revision_id uuid NOT NULL DEFAULT gen_random_uuid(),
  site_id uuid NOT NULL,
  post_id uuid NOT NULL,
  revision_number bigint NOT NULL,
  source_action text NOT NULL,
  actor_type text NOT NULL,
  actor_admin_id uuid NULL,
  resulting_post_version bigint NOT NULL,
  snapshot jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT pk_post_revisions PRIMARY KEY (revision_id),
  CONSTRAINT uq_post_revisions__site_id UNIQUE (site_id, revision_id),
  CONSTRAINT uq_post_revisions__site_post_number UNIQUE (site_id, post_id, revision_number),
  CONSTRAINT uq_post_revisions__site_post_version UNIQUE (site_id, post_id, resulting_post_version),
  CONSTRAINT fk_post_revisions__post FOREIGN KEY (site_id, post_id) REFERENCES posts(site_id, post_id) ON DELETE CASCADE,
  CONSTRAINT fk_post_revisions__actor FOREIGN KEY (actor_admin_id) REFERENCES admin_accounts(admin_id),
  CONSTRAINT ck_post_revisions__revision_number CHECK (revision_number > 0),
  CONSTRAINT ck_post_revisions__resulting_post_version CHECK (resulting_post_version > 0),
  CONSTRAINT ck_post_revisions__actor CHECK (
    (actor_type='ADMIN' AND actor_admin_id IS NOT NULL) OR
    (actor_type='SYSTEM' AND actor_admin_id IS NULL)
  ),
  CONSTRAINT ck_post_revisions__snapshot CHECK (jsonb_typeof(snapshot)='object')
);
CREATE INDEX ix_post_revisions__site_post_created ON post_revisions(site_id, post_id, created_at DESC);
CREATE INDEX ix_post_revisions__site_post_revision ON post_revisions(site_id, post_id, revision_number DESC);

CREATE TABLE post_autosaves (
  autosave_id uuid NOT NULL DEFAULT gen_random_uuid(),
  site_id uuid NOT NULL,
  post_id uuid NOT NULL,
  editor_admin_id uuid NOT NULL,
  base_post_version bigint NOT NULL,
  content_schema_version smallint NOT NULL,
  working_copy jsonb NOT NULL,
  saved_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT pk_post_autosaves PRIMARY KEY (autosave_id),
  CONSTRAINT uq_post_autosaves__post_editor UNIQUE (site_id, post_id, editor_admin_id),
  CONSTRAINT fk_post_autosaves__post FOREIGN KEY (site_id, post_id) REFERENCES posts(site_id, post_id) ON DELETE CASCADE,
  CONSTRAINT fk_post_autosaves__editor FOREIGN KEY (editor_admin_id) REFERENCES admin_accounts(admin_id),
  CONSTRAINT ck_post_autosaves__base_version CHECK (base_post_version > 0),
  CONSTRAINT ck_post_autosaves__working_copy CHECK (jsonb_typeof(working_copy)='object')
);
CREATE INDEX ix_post_autosaves__editor_saved ON post_autosaves(editor_admin_id, saved_at DESC);

CREATE TABLE post_url_history (
  url_history_id uuid NOT NULL DEFAULT gen_random_uuid(),
  site_id uuid NOT NULL,
  post_id uuid NOT NULL,
  slug text NOT NULL,
  became_public_at timestamptz NOT NULL,
  ceased_public_at timestamptz NULL,
  created_by_admin_id uuid NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT pk_post_url_history PRIMARY KEY (url_history_id),
  CONSTRAINT uq_post_url_history__site_id UNIQUE (site_id, url_history_id),
  CONSTRAINT fk_post_url_history__site FOREIGN KEY (site_id) REFERENCES sites(site_id),
  CONSTRAINT fk_post_url_history__created_by FOREIGN KEY (created_by_admin_id) REFERENCES admin_accounts(admin_id),
  CONSTRAINT ck_post_url_history__episode_order CHECK (ceased_public_at IS NULL OR ceased_public_at >= became_public_at)
);
CREATE INDEX ix_post_url_history__site_post ON post_url_history(site_id, post_id);
CREATE INDEX ix_post_url_history__site_slug ON post_url_history(site_id, slug);
CREATE INDEX ix_post_url_history__site_open_episode ON post_url_history(site_id, post_id) WHERE ceased_public_at IS NULL;

COMMIT;
