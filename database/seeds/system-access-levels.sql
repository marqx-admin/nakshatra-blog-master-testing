-- System-managed website access levels.
-- Run after BOOTSTRAP_OWNER so created_by_admin_id has an authoritative actor.
BEGIN;

DO $$
DECLARE
  owner_id uuid;
  editor_role_id uuid;
  manager_role_id uuid;
BEGIN
  SELECT admin_id INTO owner_id
  FROM admin_accounts
  WHERE is_super_admin = true AND status = 'ACTIVE';
  IF owner_id IS NULL THEN
    RAISE EXCEPTION 'system access levels require the designated active Super Admin';
  END IF;

  INSERT INTO roles(scope,name,description,created_by_admin_id)
  VALUES ('SITE','Content Editor','System-managed website access level',owner_id)
  ON CONFLICT (scope,name_normalized) DO UPDATE
    SET status='ACTIVE',retired_at=NULL,updated_at=now()
  RETURNING role_id INTO editor_role_id;

  INSERT INTO roles(scope,name,description,created_by_admin_id)
  VALUES ('SITE','Full Website Manager','System-managed website access level',owner_id)
  ON CONFLICT (scope,name_normalized) DO UPDATE
    SET status='ACTIVE',retired_at=NULL,updated_at=now()
  RETURNING role_id INTO manager_role_id;

  DELETE FROM role_permissions WHERE role_id IN (editor_role_id,manager_role_id);

  INSERT INTO role_permissions(role_id,permission_key,scope)
  SELECT editor_role_id, permission_key, 'SITE'
  FROM permissions
  WHERE permission_key = ANY (ARRAY[
    'dashboard.view','posts.view','posts.create','posts.edit','posts.duplicate',
    'posts.revisions.view','posts.preview','posts.revisions.restore','posts.publish',
    'posts.schedule','posts.archive','posts.restore','posts.trash','media.view',
    'media.upload','media.edit','media.replace','media.delete','authors.view',
    'categories.view','seo.view','seo.edit','calendar.view','search.view'
  ]);

  INSERT INTO role_permissions(role_id,permission_key,scope)
  SELECT manager_role_id, permission_key, 'SITE'
  FROM permissions
  WHERE permission_key = ANY (ARRAY[
    'dashboard.view','posts.view','posts.create','posts.edit','posts.duplicate',
    'posts.revisions.view','posts.preview','posts.revisions.restore','posts.publish',
    'posts.schedule','posts.archive','posts.restore','posts.trash','posts.delete',
    'media.view','media.upload','media.edit','media.replace','media.delete',
    'authors.view','authors.create','authors.edit','authors.retire','categories.view',
    'categories.create','categories.edit','categories.delete','seo.view','seo.edit',
    'calendar.view','search.view','search.reindex','navigation.view','navigation.manage',
    'redirects.view','redirects.create','redirects.edit','redirects.delete',
    'site_settings.view','site_settings.edit'
  ]);
END $$;

COMMIT;
