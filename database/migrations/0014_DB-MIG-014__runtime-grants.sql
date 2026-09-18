-- BLOG-DOC-08 v1.0-RC1 / DB-MIG-014 runtime_grants
BEGIN;

REVOKE ALL ON ALL TABLES IN SCHEMA public FROM PUBLIC;
REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM PUBLIC;
REVOKE ALL ON ALL FUNCTIONS IN SCHEMA app FROM PUBLIC;
REVOKE CREATE ON SCHEMA public FROM PUBLIC;
GRANT USAGE ON SCHEMA public TO db_site_runtime, db_platform_runtime;

-- SITE runtime: tenant-protected persistence plus minimal global registry reads.
GRANT SELECT ON sites, domains TO db_site_runtime;
GRANT SELECT ON permissions, permission_prerequisites TO db_site_runtime;
-- SITE mutations may append their audit event in the same PostgreSQL transaction;
-- audit_events remains GLOBAL and append-only, so no UPDATE/DELETE/SELECT is granted here.
GRANT INSERT ON audit_events TO db_site_runtime;
-- Soft-retained/tombstoned site records are intentionally not DELETE-granted.
GRANT SELECT, INSERT, UPDATE ON categories, tags, media, author_site_profiles TO db_site_runtime;
-- Permanent Post delete and derived/relationship cleanup remain legitimate runtime effects.
GRANT SELECT, INSERT, UPDATE, DELETE ON posts, media_variants,
  post_categories, post_tags, post_related_posts, post_autosaves, media_usages, navigation_items,
  homepage_section_posts, homepage_section_categories, redirects TO db_site_runtime;
GRANT SELECT, INSERT ON post_revisions TO db_site_runtime;
GRANT SELECT, INSERT, UPDATE ON post_url_history TO db_site_runtime;
GRANT SELECT, INSERT, UPDATE ON navigation_menus TO db_site_runtime;
GRANT SELECT, UPDATE ON homepage_sections TO db_site_runtime;
GRANT SELECT, INSERT, UPDATE ON site_settings TO db_site_runtime;
GRANT USAGE ON SCHEMA app TO db_site_runtime;
GRANT EXECUTE ON FUNCTION app.current_site_id() TO db_site_runtime;

-- Platform runtime: explicit GLOBAL operations only; no site-owned table DML.
GRANT SELECT, INSERT, UPDATE ON sites TO db_platform_runtime;
GRANT SELECT, INSERT, UPDATE, DELETE ON domains TO db_platform_runtime;
GRANT SELECT, INSERT, UPDATE ON admin_accounts TO db_platform_runtime;
GRANT SELECT ON permissions, permission_prerequisites TO db_platform_runtime;
GRANT SELECT, INSERT, UPDATE ON roles TO db_platform_runtime;
GRANT SELECT, INSERT, UPDATE, DELETE ON role_permissions, account_site_assignments,
  account_site_role_assignments, account_global_role_assignments TO db_platform_runtime;
GRANT SELECT, UPDATE ON platform_settings TO db_platform_runtime;
GRANT SELECT, INSERT ON audit_events TO db_platform_runtime;
GRANT SELECT, INSERT, UPDATE ON site_deletion_requests TO db_platform_runtime;
GRANT USAGE ON SCHEMA app TO db_platform_runtime;

-- No runtime role may assume the narrowly privileged global-read owner or migrator.
-- DB-MIG-014 runs as db_migrator, which intentionally has no role-administration
-- authority. Fail closed if bootstrap/cluster state contains a forbidden membership
-- instead of attempting a REVOKE that db_migrator is not authorized to perform.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_auth_members AS m
    JOIN pg_roles AS granted_role ON granted_role.oid = m.roleid
    JOIN pg_roles AS member_role ON member_role.oid = m.member
    WHERE granted_role.rolname IN ('db_global_read_owner', 'db_migrator')
      AND member_role.rolname IN ('db_site_runtime', 'db_platform_runtime')
  ) THEN
    RAISE EXCEPTION 'DB-MIG-014 forbidden privileged role membership for runtime role';
  END IF;
END
$$;

COMMIT;
