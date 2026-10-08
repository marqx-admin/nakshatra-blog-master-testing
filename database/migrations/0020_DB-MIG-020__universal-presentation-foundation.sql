-- WU-01: site-owned presentation and fixed information-page persistence.
BEGIN;

ALTER TABLE site_settings
  ADD COLUMN presentation_schema_version integer NOT NULL DEFAULT 1;
ALTER TABLE site_settings
  ADD COLUMN presentation_config jsonb NULL;
ALTER TABLE site_settings
  ADD COLUMN static_pages jsonb NULL;

ALTER TABLE site_settings
  ADD CONSTRAINT ck_site_settings__presentation_schema_version
    CHECK (presentation_schema_version >= 1),
  ADD CONSTRAINT ck_site_settings__presentation_config
    CHECK (presentation_config IS NULL OR jsonb_typeof(presentation_config) = 'object'),
  ADD CONSTRAINT ck_site_settings__static_pages
    CHECK (
      static_pages IS NULL OR (
        jsonb_typeof(static_pages) = 'object'
        AND static_pages ?& ARRAY['ABOUT','CONTACT','PRIVACY','TERMS','DISCLAIMER']
        AND static_pages - 'ABOUT' - 'CONTACT' - 'PRIVACY' - 'TERMS' - 'DISCLAIMER' = '{}'::jsonb
      )
    );

-- Reconcile the protected launch roles without changing unrelated capabilities.
CREATE OR REPLACE FUNCTION app.ensure_system_access_levels()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
DECLARE
  owner_id uuid;
  editor_role_id uuid;
  manager_role_id uuid;
BEGIN
  SELECT admin_id INTO owner_id
  FROM public.admin_accounts
  WHERE is_super_admin = true AND status = 'ACTIVE';
  IF owner_id IS NULL THEN
    RAISE EXCEPTION 'system access levels require the designated active Super Admin';
  END IF;

  INSERT INTO public.roles(scope,name,description,created_by_admin_id)
  VALUES ('SITE','Content Editor','System-managed website access level',owner_id)
  ON CONFLICT (scope,name_normalized) DO UPDATE
    SET description=EXCLUDED.description,status='ACTIVE',retired_at=NULL,updated_at=now()
  RETURNING role_id INTO editor_role_id;

  INSERT INTO public.roles(scope,name,description,created_by_admin_id)
  VALUES ('SITE','Full Website Manager','System-managed website access level',owner_id)
  ON CONFLICT (scope,name_normalized) DO UPDATE
    SET description=EXCLUDED.description,status='ACTIVE',retired_at=NULL,updated_at=now()
  RETURNING role_id INTO manager_role_id;

  DELETE FROM public.role_permissions WHERE role_id IN (editor_role_id,manager_role_id);

  INSERT INTO public.role_permissions(role_id,permission_key,scope)
  SELECT editor_role_id, permission_key, 'SITE'
  FROM public.permissions
  WHERE permission_key = ANY (ARRAY[
    'dashboard.view','posts.view','posts.create','posts.edit','posts.duplicate',
    'posts.revisions.view','posts.preview','posts.revisions.restore','posts.publish',
    'posts.schedule','posts.archive','posts.restore','posts.trash','media.view',
    'media.upload','media.edit','authors.view','categories.view','seo.view','seo.edit',
    'calendar.view','search.view','tags.view'
  ]);

  INSERT INTO public.role_permissions(role_id,permission_key,scope)
  SELECT manager_role_id, permission_key, 'SITE'
  FROM public.permissions
  WHERE permission_key = ANY (ARRAY[
    'dashboard.view','posts.view','posts.create','posts.edit','posts.duplicate',
    'posts.revisions.view','posts.preview','posts.revisions.restore','posts.publish',
    'posts.schedule','posts.archive','posts.restore','posts.trash','posts.delete',
    'media.view','media.upload','media.edit','media.replace','media.delete',
    'authors.view','authors.create','authors.edit','authors.retire','categories.view',
    'categories.create','categories.edit','categories.delete','seo.view','seo.edit',
    'calendar.view','search.view','search.reindex','navigation.view','navigation.manage',
    'redirects.view','redirects.create','redirects.edit','redirects.delete',
    'site_settings.view','site_settings.edit',
    'tags.view','tags.create','tags.edit','tags.delete'
  ]);
END
$$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM admin_accounts WHERE is_super_admin = true AND status = 'ACTIVE'
  ) THEN
    PERFORM app.ensure_system_access_levels();
  END IF;
END
$$;

COMMIT;
