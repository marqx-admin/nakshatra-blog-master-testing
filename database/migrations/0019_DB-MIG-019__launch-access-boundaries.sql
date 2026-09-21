-- DB-MIG-019: protected launch access levels and Super-Admin-only GLOBAL authority.
BEGIN;

-- Existing legacy GLOBAL assignments must not continue to elevate an ordinary
-- account after the launch boundary becomes authoritative.
DELETE FROM account_global_role_assignments assignment
USING admin_accounts account
WHERE assignment.admin_id = account.admin_id
  AND account.is_super_admin = false;

CREATE OR REPLACE FUNCTION app.enforce_super_admin_global_assignment()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM public.admin_accounts
    WHERE admin_id = NEW.admin_id
      AND is_super_admin = true
      AND status = 'ACTIVE'
  ) THEN
    RAISE EXCEPTION 'GLOBAL authority is reserved for the designated active Super Admin';
  END IF;
  RETURN NEW;
END
$$;

REVOKE ALL ON FUNCTION app.enforce_super_admin_global_assignment() FROM PUBLIC;

DROP TRIGGER IF EXISTS trg_account_global_role_assignments__super_admin_only
  ON account_global_role_assignments;
CREATE TRIGGER trg_account_global_role_assignments__super_admin_only
BEFORE INSERT OR UPDATE OF admin_id, role_id
ON account_global_role_assignments
FOR EACH ROW EXECUTE FUNCTION app.enforce_super_admin_global_assignment();

CREATE OR REPLACE FUNCTION app.protect_system_access_levels()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    IF OLD.scope = 'SITE' AND OLD.name_normalized IN ('content editor', 'full website manager') THEN
      RAISE EXCEPTION 'system-managed access levels cannot be deleted';
    END IF;
    RETURN OLD;
  END IF;
  IF OLD.scope = 'SITE' AND OLD.name_normalized IN ('content editor', 'full website manager') THEN
    IF NEW.scope <> 'SITE'
       OR NEW.name_normalized <> OLD.name_normalized
       OR NEW.status <> 'ACTIVE'
       OR NEW.retired_at IS NOT NULL THEN
      RAISE EXCEPTION 'system-managed access levels cannot be renamed, rescoped, or retired';
    END IF;
  END IF;
  RETURN NEW;
END
$$;

REVOKE ALL ON FUNCTION app.protect_system_access_levels() FROM PUBLIC;

DROP TRIGGER IF EXISTS trg_roles__protect_system_access_levels ON roles;
CREATE TRIGGER trg_roles__protect_system_access_levels
BEFORE UPDATE OR DELETE ON roles
FOR EACH ROW EXECUTE FUNCTION app.protect_system_access_levels();

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
    'calendar.view','search.view'
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
    'site_settings.view','site_settings.edit'
  ]);
END
$$;

REVOKE ALL ON FUNCTION app.ensure_system_access_levels() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION app.ensure_system_access_levels() TO db_migrator;

-- Incremental environments already have the owner; fresh databases invoke the
-- same function from BOOTSTRAP_OWNER after that identity is created.
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
