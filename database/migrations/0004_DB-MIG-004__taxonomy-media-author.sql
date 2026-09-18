-- BLOG-DOC-08 v1.0-RC1 / DB-MIG-004 taxonomy_media_author
BEGIN;

CREATE TABLE categories (
  category_id uuid NOT NULL DEFAULT gen_random_uuid(),
  site_id uuid NOT NULL,
  parent_category_id uuid NULL,
  name text NOT NULL,
  name_normalized text GENERATED ALWAYS AS (lower(btrim(name))) STORED NOT NULL,
  slug text NOT NULL,
  description text NULL,
  seo_title text NULL,
  meta_description text NULL,
  canonical_override text NULL,
  index_policy text NOT NULL DEFAULT 'INHERIT',
  status text NOT NULL DEFAULT 'ACTIVE',
  retired_at timestamptz NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT pk_categories PRIMARY KEY (category_id),
  CONSTRAINT uq_categories__site_id UNIQUE (site_id, category_id),
  CONSTRAINT fk_categories__site FOREIGN KEY (site_id) REFERENCES sites(site_id),
  CONSTRAINT fk_categories__parent FOREIGN KEY (site_id, parent_category_id) REFERENCES categories(site_id, category_id),
  CONSTRAINT uq_categories__site_name UNIQUE (site_id, name_normalized),
  CONSTRAINT uq_categories__site_slug UNIQUE (site_id, slug),
  CONSTRAINT ck_categories__parent_not_self CHECK (parent_category_id IS NULL OR parent_category_id <> category_id),
  CONSTRAINT ck_categories__status CHECK (status IN ('ACTIVE','RETIRED')),
  CONSTRAINT ck_categories__retired_at CHECK ((status='RETIRED' AND retired_at IS NOT NULL) OR (status='ACTIVE' AND retired_at IS NULL)),
  CONSTRAINT ck_categories__index_policy CHECK (index_policy IN ('INHERIT','INDEX','NOINDEX'))
);
CREATE INDEX ix_categories__site_parent ON categories(site_id, parent_category_id);
CREATE INDEX ix_categories__site_status ON categories(site_id, status);

CREATE TABLE tags (
  tag_id uuid NOT NULL DEFAULT gen_random_uuid(),
  site_id uuid NOT NULL,
  name text NOT NULL,
  name_normalized text GENERATED ALWAYS AS (lower(btrim(name))) STORED NOT NULL,
  slug text NOT NULL,
  description text NULL,
  status text NOT NULL DEFAULT 'ACTIVE',
  merged_into_tag_id uuid NULL,
  retired_at timestamptz NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT pk_tags PRIMARY KEY (tag_id),
  CONSTRAINT uq_tags__site_id UNIQUE (site_id, tag_id),
  CONSTRAINT fk_tags__site FOREIGN KEY (site_id) REFERENCES sites(site_id),
  CONSTRAINT fk_tags__merged_into FOREIGN KEY (site_id, merged_into_tag_id) REFERENCES tags(site_id, tag_id),
  CONSTRAINT uq_tags__site_name UNIQUE (site_id, name_normalized),
  CONSTRAINT uq_tags__site_slug UNIQUE (site_id, slug),
  CONSTRAINT ck_tags__merged_not_self CHECK (merged_into_tag_id IS NULL OR merged_into_tag_id <> tag_id),
  CONSTRAINT ck_tags__status CHECK (status IN ('ACTIVE','RETIRED')),
  CONSTRAINT ck_tags__merged_requires_retired CHECK (merged_into_tag_id IS NULL OR status='RETIRED')
);
CREATE INDEX ix_tags__site_status ON tags(site_id, status);

CREATE TABLE media (
  media_id uuid NOT NULL DEFAULT gen_random_uuid(),
  site_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'ACTIVE',
  original_filename text NOT NULL,
  mime_type text NOT NULL,
  byte_size bigint NOT NULL,
  width_px integer NULL,
  height_px integer NULL,
  checksum_sha256 char(64) NOT NULL,
  object_key text NOT NULL,
  alt_text text NULL,
  title text NULL,
  caption text NULL,
  credit_text text NULL,
  source_url text NULL,
  created_by_admin_id uuid NOT NULL,
  updated_by_admin_id uuid NULL,
  deleted_by_admin_id uuid NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz NULL,
  CONSTRAINT pk_media PRIMARY KEY (media_id),
  CONSTRAINT uq_media__site_id UNIQUE (site_id, media_id),
  CONSTRAINT fk_media__site FOREIGN KEY (site_id) REFERENCES sites(site_id),
  CONSTRAINT uq_media__site_object_key UNIQUE (site_id, object_key),
  CONSTRAINT fk_media__created_by FOREIGN KEY (created_by_admin_id) REFERENCES admin_accounts(admin_id),
  CONSTRAINT fk_media__updated_by FOREIGN KEY (updated_by_admin_id) REFERENCES admin_accounts(admin_id),
  CONSTRAINT fk_media__deleted_by FOREIGN KEY (deleted_by_admin_id) REFERENCES admin_accounts(admin_id),
  CONSTRAINT ck_media__status CHECK (status IN ('ACTIVE','DELETED')),
  CONSTRAINT ck_media__byte_size CHECK (byte_size > 0),
  CONSTRAINT ck_media__dimensions CHECK ((width_px IS NULL OR width_px > 0) AND (height_px IS NULL OR height_px > 0)),
  CONSTRAINT ck_media__deleted_metadata CHECK (status <> 'DELETED' OR (deleted_at IS NOT NULL AND deleted_by_admin_id IS NOT NULL))
);
CREATE INDEX ix_media__site_status_created ON media(site_id, status, created_at DESC);
CREATE INDEX ix_media__site_checksum ON media(site_id, checksum_sha256);

CREATE TABLE media_variants (
  variant_id uuid NOT NULL DEFAULT gen_random_uuid(),
  site_id uuid NOT NULL,
  media_id uuid NOT NULL,
  variant_key text NOT NULL,
  mime_type text NOT NULL,
  byte_size bigint NOT NULL,
  width_px integer NULL,
  height_px integer NULL,
  object_key text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT pk_media_variants PRIMARY KEY (variant_id),
  CONSTRAINT uq_media_variants__site_id UNIQUE (site_id, variant_id),
  CONSTRAINT fk_media_variants__media FOREIGN KEY (site_id, media_id) REFERENCES media(site_id, media_id),
  CONSTRAINT uq_media_variants__media_key UNIQUE (site_id, media_id, variant_key),
  CONSTRAINT uq_media_variants__site_object_key UNIQUE (site_id, object_key),
  CONSTRAINT ck_media_variants__byte_size CHECK (byte_size > 0)
);

CREATE TABLE author_site_profiles (
  author_profile_id uuid NOT NULL DEFAULT gen_random_uuid(),
  site_id uuid NOT NULL,
  display_name text NOT NULL,
  slug text NOT NULL,
  photo_media_id uuid NULL,
  bio text NULL,
  designation text NULL,
  expertise text[] NOT NULL DEFAULT '{}',
  social_profiles jsonb NOT NULL DEFAULT '{}'::jsonb,
  seo_title text NULL,
  meta_description text NULL,
  canonical_override text NULL,
  index_policy text NOT NULL DEFAULT 'INHERIT',
  status text NOT NULL DEFAULT 'ACTIVE',
  retired_at timestamptz NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT pk_author_site_profiles PRIMARY KEY (author_profile_id),
  CONSTRAINT uq_author_site_profiles__site_id UNIQUE (site_id, author_profile_id),
  CONSTRAINT fk_author_site_profiles__site FOREIGN KEY (site_id) REFERENCES sites(site_id),
  CONSTRAINT fk_author_site_profiles__photo FOREIGN KEY (site_id, photo_media_id) REFERENCES media(site_id, media_id),
  CONSTRAINT uq_author_profiles__site_slug UNIQUE (site_id, slug),
  CONSTRAINT ck_author_site_profiles__social_profiles_object CHECK (jsonb_typeof(social_profiles) = 'object'),
  CONSTRAINT ck_author_site_profiles__status CHECK (status IN ('ACTIVE','RETIRED')),
  CONSTRAINT ck_author_site_profiles__index_policy CHECK (index_policy IN ('INHERIT','INDEX','NOINDEX'))
);
CREATE INDEX ix_author_profiles__site_status ON author_site_profiles(site_id, status);
CREATE INDEX ix_author_profiles__site_name ON author_site_profiles(site_id, display_name);

COMMIT;
