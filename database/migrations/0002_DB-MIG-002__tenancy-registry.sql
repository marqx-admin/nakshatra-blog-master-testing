-- BLOG-DOC-08 v1.0-RC1 / DB-MIG-002 tenancy_registry
BEGIN;

CREATE TABLE sites (
  site_id uuid NOT NULL DEFAULT gen_random_uuid(),
  site_key text NOT NULL,
  display_name text NOT NULL,
  status text NOT NULL DEFAULT 'DISABLED',
  timezone_id text NOT NULL,
  locale_code text NULL,
  default_language_code text NULL,
  disabled_at timestamptz NULL,
  archived_at timestamptz NULL,
  deletion_requested_at timestamptz NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT pk_sites PRIMARY KEY (site_id),
  CONSTRAINT uq_sites__site_key UNIQUE (site_key),
  CONSTRAINT ck_sites__site_key_format CHECK (site_key ~ '^SITE-[0-9]{2,}$'),
  CONSTRAINT ck_sites__status CHECK (status IN ('ACTIVE','DISABLED','ARCHIVED','DELETION_REQUESTED')),
  CONSTRAINT ck_sites__locale_nonblank CHECK (locale_code IS NULL OR btrim(locale_code) <> ''),
  CONSTRAINT ck_sites__language_nonblank CHECK (default_language_code IS NULL OR btrim(default_language_code) <> '')
);
CREATE INDEX ix_sites__status ON sites(status);

CREATE TABLE domains (
  domain_id uuid NOT NULL DEFAULT gen_random_uuid(),
  site_id uuid NOT NULL,
  hostname text NOT NULL,
  hostname_normalized text GENERATED ALWAYS AS (lower(btrim(hostname))) STORED NOT NULL,
  is_canonical boolean NOT NULL DEFAULT false,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT pk_domains PRIMARY KEY (domain_id),
  CONSTRAINT fk_domains__site FOREIGN KEY (site_id) REFERENCES sites(site_id) ON DELETE CASCADE,
  CONSTRAINT uq_domains__hostname_normalized UNIQUE (hostname_normalized),
  CONSTRAINT ck_domains__hostname_shape CHECK (
    btrim(hostname) <> ''
    AND hostname !~ '://'
    AND hostname !~ '[/\\[:space:]]'
  )
);
CREATE UNIQUE INDEX uq_domains__one_active_canonical_per_site
  ON domains(site_id) WHERE is_canonical AND is_active;
CREATE INDEX ix_domains__site_id_active ON domains(site_id, is_active);

COMMIT;
