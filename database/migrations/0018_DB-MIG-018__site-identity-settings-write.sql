-- BLOG-DOC-08 v1.0-RC2 / DB-MIG-018 site identity settings write
BEGIN;

-- Site Settings may edit only the current SiteContext's public identity fields.
-- Keep direct UPDATE on the GLOBAL sites registry unavailable to db_site_runtime;
-- this definer function is the narrow, tenant-bound write boundary.
CREATE OR REPLACE FUNCTION app.update_current_site_identity(payload jsonb) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public, app
AS $$
DECLARE
  target_site_id uuid := app.current_site_id();
BEGIN
  IF target_site_id IS NULL THEN
    RAISE EXCEPTION 'site context is required' USING ERRCODE = '22023';
  END IF;
  IF payload ? 'display_name' AND NULLIF(btrim(payload ->> 'display_name'), '') IS NULL THEN
    RAISE EXCEPTION 'display_name must not be blank' USING ERRCODE = '22023';
  END IF;
  IF payload ? 'timezone_id' AND NULLIF(btrim(payload ->> 'timezone_id'), '') IS NULL THEN
    RAISE EXCEPTION 'timezone_id must not be blank' USING ERRCODE = '22023';
  END IF;

  UPDATE public.sites
  SET display_name = CASE WHEN payload ? 'display_name' THEN btrim(payload ->> 'display_name') ELSE display_name END,
      locale_code = CASE WHEN payload ? 'locale_code' THEN NULLIF(btrim(payload ->> 'locale_code'), '') ELSE locale_code END,
      default_language_code = CASE WHEN payload ? 'default_language_code' THEN NULLIF(btrim(payload ->> 'default_language_code'), '') ELSE default_language_code END,
      timezone_id = CASE WHEN payload ? 'timezone_id' THEN btrim(payload ->> 'timezone_id') ELSE timezone_id END,
      updated_at = now()
  WHERE site_id = target_site_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'site context does not resolve to a site' USING ERRCODE = 'P0002';
  END IF;
END
$$;

REVOKE ALL ON FUNCTION app.update_current_site_identity(jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION app.update_current_site_identity(jsonb) TO db_site_runtime;

COMMIT;
