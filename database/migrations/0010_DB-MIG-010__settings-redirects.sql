-- BLOG-DOC-08 v1.0-RC1 / DB-MIG-010 settings_redirects
BEGIN;

CREATE TABLE site_settings (
  site_id uuid NOT NULL,
  logo_media_id uuid NULL,
  favicon_media_id uuid NULL,
  default_social_image_media_id uuid NULL,
  contact_info jsonb NOT NULL DEFAULT '{}'::jsonb,
  social_profiles jsonb NOT NULL DEFAULT '{}'::jsonb,
  copyright_text text NULL,
  seo_defaults jsonb NOT NULL DEFAULT '{}'::jsonb,
  analytics_verification jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by_admin_id uuid NULL,
  CONSTRAINT pk_site_settings PRIMARY KEY (site_id),
  CONSTRAINT fk_site_settings__site FOREIGN KEY (site_id) REFERENCES sites(site_id) ON DELETE CASCADE,
  CONSTRAINT fk_site_settings__logo FOREIGN KEY (site_id, logo_media_id) REFERENCES media(site_id, media_id),
  CONSTRAINT fk_site_settings__favicon FOREIGN KEY (site_id, favicon_media_id) REFERENCES media(site_id, media_id),
  CONSTRAINT fk_site_settings__default_social FOREIGN KEY (site_id, default_social_image_media_id) REFERENCES media(site_id, media_id),
  CONSTRAINT fk_site_settings__updated_by FOREIGN KEY (updated_by_admin_id) REFERENCES admin_accounts(admin_id),
  CONSTRAINT ck_site_settings__contact_info CHECK (jsonb_typeof(contact_info)='object'),
  CONSTRAINT ck_site_settings__social_profiles CHECK (jsonb_typeof(social_profiles)='object'),
  CONSTRAINT ck_site_settings__seo_defaults CHECK (jsonb_typeof(seo_defaults)='object'),
  CONSTRAINT ck_site_settings__analytics_verification CHECK (jsonb_typeof(analytics_verification)='object')
);
CREATE INDEX ix_site_settings__updated_at ON site_settings(updated_at DESC);

CREATE TABLE platform_settings (
  setting_key text NOT NULL,
  value_jsonb jsonb NOT NULL,
  value_type text NOT NULL,
  is_editable boolean NOT NULL DEFAULT true,
  description text NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by_admin_id uuid NULL,
  CONSTRAINT pk_platform_settings PRIMARY KEY (setting_key),
  CONSTRAINT fk_platform_settings__updated_by FOREIGN KEY (updated_by_admin_id) REFERENCES admin_accounts(admin_id),
  CONSTRAINT ck_platform_settings__value_type CHECK (value_type IN ('STRING','NUMBER','BOOLEAN','OBJECT','ARRAY')),
  CONSTRAINT ck_platform_settings__json_type CHECK (
    (value_type='STRING' AND jsonb_typeof(value_jsonb)='string') OR
    (value_type='NUMBER' AND jsonb_typeof(value_jsonb)='number') OR
    (value_type='BOOLEAN' AND jsonb_typeof(value_jsonb)='boolean') OR
    (value_type='OBJECT' AND jsonb_typeof(value_jsonb)='object') OR
    (value_type='ARRAY' AND jsonb_typeof(value_jsonb)='array')
  )
);
CREATE INDEX ix_platform_settings__editable ON platform_settings(is_editable);

CREATE TABLE redirects (
  redirect_id uuid NOT NULL DEFAULT gen_random_uuid(),
  site_id uuid NOT NULL,
  source_path text NOT NULL,
  destination_kind text NOT NULL,
  destination_value text NOT NULL,
  status_code smallint NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_by_admin_id uuid NOT NULL,
  updated_by_admin_id uuid NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT pk_redirects PRIMARY KEY (redirect_id),
  CONSTRAINT uq_redirects__site_id UNIQUE (site_id, redirect_id),
  CONSTRAINT fk_redirects__site FOREIGN KEY (site_id) REFERENCES sites(site_id),
  CONSTRAINT uq_redirects__site_source UNIQUE (site_id, source_path),
  CONSTRAINT fk_redirects__created_by FOREIGN KEY (created_by_admin_id) REFERENCES admin_accounts(admin_id),
  CONSTRAINT fk_redirects__updated_by FOREIGN KEY (updated_by_admin_id) REFERENCES admin_accounts(admin_id),
  CONSTRAINT ck_redirects__destination_kind CHECK (destination_kind IN ('INTERNAL_PATH','EXTERNAL_URL')),
  CONSTRAINT ck_redirects__status_code CHECK (status_code BETWEEN 300 AND 399),
  CONSTRAINT ck_redirects__source_path CHECK (left(source_path,1)='/')
);
CREATE INDEX ix_redirects__site_active ON redirects(site_id, is_active);

COMMIT;
