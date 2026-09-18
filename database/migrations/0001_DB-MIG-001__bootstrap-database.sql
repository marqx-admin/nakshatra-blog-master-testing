-- BLOG-DOC-08 v1.0-RC1 / DB-MIG-001 bootstrap_database
BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE SCHEMA IF NOT EXISTS app;

CREATE OR REPLACE FUNCTION app.current_site_id() RETURNS uuid
LANGUAGE sql STABLE
AS $$
  SELECT NULLIF(current_setting('app.site_id', true), '')::uuid;
$$;

CREATE OR REPLACE FUNCTION app.reject_site_id_change() RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.site_id IS DISTINCT FROM OLD.site_id THEN
    RAISE EXCEPTION 'site_id is immutable' USING ERRCODE = '23514';
  END IF;
  RETURN NEW;
END;
$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'db_migrator') THEN
    CREATE ROLE db_migrator LOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE INHERIT BYPASSRLS;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'db_site_runtime') THEN
    CREATE ROLE db_site_runtime LOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE INHERIT NOBYPASSRLS;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'db_platform_runtime') THEN
    CREATE ROLE db_platform_runtime LOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE INHERIT NOBYPASSRLS;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'db_global_read_owner') THEN
    CREATE ROLE db_global_read_owner NOLOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE INHERIT BYPASSRLS;
  END IF;
END
$$;

-- Cluster roles may pre-exist because PostgreSQL roles are cluster-scoped. Reassert the
-- DOC-08 attributes deterministically without assigning credentials or secrets.
ALTER ROLE db_migrator LOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE INHERIT BYPASSRLS;
ALTER ROLE db_site_runtime LOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE INHERIT NOBYPASSRLS;
ALTER ROLE db_platform_runtime LOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE INHERIT NOBYPASSRLS;
ALTER ROLE db_global_read_owner NOLOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE INHERIT BYPASSRLS;

-- The bootstrap identity executes DB-MIG-001, then may SET ROLE to the
-- deployment-only migrator for DB-MIG-002..016. No password/secret is seeded.
GRANT db_migrator TO CURRENT_USER;
GRANT USAGE, CREATE ON SCHEMA public, app TO db_migrator;
GRANT EXECUTE ON FUNCTION app.current_site_id() TO db_migrator;
GRANT EXECUTE ON FUNCTION app.reject_site_id_change() TO db_migrator;

REVOKE ALL ON SCHEMA app FROM PUBLIC;
REVOKE ALL ON FUNCTION app.current_site_id() FROM PUBLIC;
REVOKE ALL ON FUNCTION app.reject_site_id_change() FROM PUBLIC;
GRANT USAGE ON SCHEMA app TO db_site_runtime, db_platform_runtime;
GRANT EXECUTE ON FUNCTION app.current_site_id() TO db_site_runtime;

COMMIT;
