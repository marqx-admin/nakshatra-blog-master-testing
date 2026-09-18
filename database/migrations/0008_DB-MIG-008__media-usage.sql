-- BLOG-DOC-08 v1.0-RC1 / DB-MIG-008 media_usage
BEGIN;

CREATE TABLE media_usages (
  usage_id uuid NOT NULL DEFAULT gen_random_uuid(),
  site_id uuid NOT NULL,
  media_id uuid NOT NULL,
  usage_kind text NOT NULL,
  post_id uuid NULL,
  author_profile_id uuid NULL,
  setting_slot text NULL,
  block_id text NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT pk_media_usages PRIMARY KEY (usage_id),
  CONSTRAINT uq_media_usages__site_id UNIQUE (site_id, usage_id),
  CONSTRAINT fk_media_usages__media FOREIGN KEY (site_id, media_id) REFERENCES media(site_id, media_id),
  CONSTRAINT fk_media_usages__post FOREIGN KEY (site_id, post_id) REFERENCES posts(site_id, post_id) ON DELETE CASCADE,
  CONSTRAINT fk_media_usages__author FOREIGN KEY (site_id, author_profile_id) REFERENCES author_site_profiles(site_id, author_profile_id),
  CONSTRAINT ck_media_usages__kind CHECK (usage_kind IN ('POST_FEATURED','POST_BODY','POST_OG','AUTHOR_PHOTO','SITE_LOGO','SITE_FAVICON','SITE_DEFAULT_SOCIAL')),
  CONSTRAINT ck_media_usages__target_shape CHECK (
    (usage_kind='POST_FEATURED' AND post_id IS NOT NULL AND author_profile_id IS NULL AND setting_slot IS NULL AND block_id IS NULL) OR
    (usage_kind='POST_BODY' AND post_id IS NOT NULL AND author_profile_id IS NULL AND setting_slot IS NULL AND block_id IS NOT NULL) OR
    (usage_kind='POST_OG' AND post_id IS NOT NULL AND author_profile_id IS NULL AND setting_slot IS NULL AND block_id IS NULL) OR
    (usage_kind='AUTHOR_PHOTO' AND post_id IS NULL AND author_profile_id IS NOT NULL AND setting_slot IS NULL AND block_id IS NULL) OR
    (usage_kind IN ('SITE_LOGO','SITE_FAVICON','SITE_DEFAULT_SOCIAL') AND post_id IS NULL AND author_profile_id IS NULL AND setting_slot IS NOT NULL AND btrim(setting_slot)<>'' AND block_id IS NULL)
  )
);
CREATE INDEX ix_media_usages__site_media ON media_usages(site_id, media_id);
CREATE INDEX ix_media_usages__site_post ON media_usages(site_id, post_id);
CREATE INDEX ix_media_usages__site_author ON media_usages(site_id, author_profile_id);

COMMIT;
