-- BLOG-DOC-08 v1.0-RC1 / DB-MIG-005 post_core
BEGIN;

CREATE TABLE posts (
  post_id uuid NOT NULL DEFAULT gen_random_uuid(),
  site_id uuid NOT NULL,
  content_schema_version smallint NOT NULL DEFAULT 1,
  status text NOT NULL DEFAULT 'DRAFT',
  version bigint NOT NULL DEFAULT 1,
  title text NOT NULL DEFAULT '',
  excerpt text NULL,
  body jsonb NOT NULL DEFAULT '{"blocks":[]}'::jsonb,
  author_site_profile_id uuid NULL,
  featured_media_id uuid NULL,
  slug text NULL,
  seo_title text NULL,
  meta_description text NULL,
  canonical_override text NULL,
  index_policy text NOT NULL DEFAULT 'INHERIT',
  link_robots_policy text NOT NULL DEFAULT 'INHERIT',
  og_title text NULL,
  og_description text NULL,
  og_image_media_id uuid NULL,
  structured_data_inputs jsonb NOT NULL DEFAULT '{}'::jsonb,
  breadcrumb_label text NULL,
  scheduled_for_utc timestamptz NULL,
  schedule_local_input timestamp without time zone NULL,
  schedule_timezone_id text NULL,
  first_published_at timestamptz NULL,
  published_at timestamptz NULL,
  archived_at timestamptz NULL,
  trashed_at timestamptz NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by_admin_id uuid NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by_admin_id uuid NULL,
  CONSTRAINT pk_posts PRIMARY KEY (post_id),
  CONSTRAINT uq_posts__site_id UNIQUE (site_id, post_id),
  CONSTRAINT fk_posts__site FOREIGN KEY (site_id) REFERENCES sites(site_id),
  CONSTRAINT fk_posts__author FOREIGN KEY (site_id, author_site_profile_id) REFERENCES author_site_profiles(site_id, author_profile_id),
  CONSTRAINT fk_posts__featured_media FOREIGN KEY (site_id, featured_media_id) REFERENCES media(site_id, media_id),
  CONSTRAINT fk_posts__og_image_media FOREIGN KEY (site_id, og_image_media_id) REFERENCES media(site_id, media_id),
  CONSTRAINT fk_posts__created_by FOREIGN KEY (created_by_admin_id) REFERENCES admin_accounts(admin_id),
  CONSTRAINT fk_posts__updated_by FOREIGN KEY (updated_by_admin_id) REFERENCES admin_accounts(admin_id),
  CONSTRAINT ck_posts__status CHECK (status IN ('DRAFT','SCHEDULED','PUBLISHED','ARCHIVED','TRASH')),
  CONSTRAINT ck_posts__version CHECK (version > 0),
  CONSTRAINT ck_posts__content_schema_version CHECK (content_schema_version > 0),
  CONSTRAINT ck_posts__body CHECK (jsonb_typeof(body)='object' AND jsonb_typeof(body->'blocks')='array'),
  CONSTRAINT ck_posts__structured_data_inputs CHECK (jsonb_typeof(structured_data_inputs)='object'),
  CONSTRAINT ck_posts__schedule_fields CHECK (
    (status='SCHEDULED' AND scheduled_for_utc IS NOT NULL AND schedule_local_input IS NOT NULL AND schedule_timezone_id IS NOT NULL)
    OR
    (status<>'SCHEDULED' AND scheduled_for_utc IS NULL AND schedule_local_input IS NULL AND schedule_timezone_id IS NULL)
  ),
  CONSTRAINT ck_posts__archived_at CHECK ((status='ARCHIVED' AND archived_at IS NOT NULL) OR (status<>'ARCHIVED' AND archived_at IS NULL)),
  CONSTRAINT ck_posts__trashed_at CHECK ((status='TRASH' AND trashed_at IS NOT NULL) OR (status<>'TRASH' AND trashed_at IS NULL)),
  CONSTRAINT ck_posts__index_policy CHECK (index_policy IN ('INHERIT','INDEX','NOINDEX')),
  CONSTRAINT ck_posts__link_robots_policy CHECK (link_robots_policy IN ('INHERIT','FOLLOW','NOFOLLOW'))
);
CREATE UNIQUE INDEX uq_posts__site_slug ON posts(site_id, slug) WHERE slug IS NOT NULL;
CREATE INDEX ix_posts__site_status_published ON posts(site_id, status, published_at DESC);
CREATE INDEX ix_posts__site_status_scheduled ON posts(site_id, status, scheduled_for_utc);
CREATE INDEX ix_posts__site_author ON posts(site_id, author_site_profile_id);
CREATE INDEX ix_posts__site_updated ON posts(site_id, updated_at DESC);
CREATE INDEX ix_posts__site_created ON posts(site_id, created_at DESC);

COMMIT;
