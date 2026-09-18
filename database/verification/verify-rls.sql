\set ON_ERROR_STOP on
-- DOC-04 + DOC-08 database-isolation catalog verification. Read-only.
DO $$
DECLARE
  site_tables text[] := ARRAY[
    'categories','tags','media','media_variants','author_site_profiles','posts','post_categories','post_tags',
    'post_related_posts','post_revisions','post_autosaves','post_url_history','media_usages','navigation_menus',
    'navigation_items','homepage_sections','homepage_section_posts','homepage_section_categories','site_settings','redirects'
  ];
  global_tables text[] := ARRAY[
    'sites','domains','admin_accounts','permissions','permission_prerequisites','roles','role_permissions',
    'account_site_assignments','account_site_role_assignments','account_global_role_assignments',
    'platform_settings','audit_events','site_deletion_requests'
  ];
  t text;
  n integer;
BEGIN
  FOREACH t IN ARRAY site_tables LOOP
    IF NOT EXISTS (
      SELECT 1 FROM pg_class c JOIN pg_namespace ns ON ns.oid=c.relnamespace
      WHERE ns.nspname='public' AND c.relname=t AND c.relkind='r'
        AND c.relrowsecurity AND c.relforcerowsecurity
    ) THEN RAISE EXCEPTION 'verify-rls: % is not ENABLE+FORCE RLS',t; END IF;

    SELECT count(*) INTO n FROM pg_policies p WHERE p.schemaname='public' AND p.tablename=t;
    IF n<>1 THEN RAISE EXCEPTION 'verify-rls: % expected exactly one policy, found %',t,n; END IF;

    IF NOT EXISTS (
      SELECT 1 FROM pg_policies p
      WHERE p.schemaname='public' AND p.tablename=t AND p.cmd='ALL'
        AND p.permissive='PERMISSIVE'
        AND p.qual ILIKE '%site_id%app.current_site_id()%'
        AND p.with_check ILIKE '%site_id%app.current_site_id()%'
    ) THEN RAISE EXCEPTION 'verify-rls: % policy is not the fail-closed site equality policy',t; END IF;
  END LOOP;

  SELECT count(*) INTO n FROM pg_policies WHERE schemaname='public' AND tablename=ANY(site_tables);
  IF n<>20 THEN RAISE EXCEPTION 'verify-rls: expected 20 SITE policies, found %',n; END IF;

  FOREACH t IN ARRAY global_tables LOOP
    IF EXISTS (
      SELECT 1 FROM pg_class c JOIN pg_namespace ns ON ns.oid=c.relnamespace
      WHERE ns.nspname='public' AND c.relname=t AND (c.relrowsecurity OR c.relforcerowsecurity)
    ) THEN RAISE EXCEPTION 'verify-rls: GLOBAL/system table % unexpectedly has SITE RLS',t; END IF;
  END LOOP;

  IF app.current_site_id() IS NOT NULL THEN
    RAISE EXCEPTION 'verify-rls: verifier session unexpectedly starts with tenant context';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname='db_migrator' AND rolcanlogin AND rolbypassrls AND NOT rolsuper AND NOT rolcreatedb AND NOT rolcreaterole) THEN
    RAISE EXCEPTION 'verify-rls: db_migrator attributes mismatch';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname='db_site_runtime' AND rolcanlogin AND NOT rolbypassrls AND NOT rolsuper AND NOT rolcreatedb AND NOT rolcreaterole) THEN
    RAISE EXCEPTION 'verify-rls: db_site_runtime attributes mismatch';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname='db_platform_runtime' AND rolcanlogin AND NOT rolbypassrls AND NOT rolsuper AND NOT rolcreatedb AND NOT rolcreaterole) THEN
    RAISE EXCEPTION 'verify-rls: db_platform_runtime attributes mismatch';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname='db_global_read_owner' AND NOT rolcanlogin AND rolbypassrls AND NOT rolsuper AND NOT rolcreatedb AND NOT rolcreaterole) THEN
    RAISE EXCEPTION 'verify-rls: db_global_read_owner attributes mismatch';
  END IF;

  -- Runtime roles must not be able to assume privileged migration/global-read owner roles.
  IF EXISTS (
    SELECT 1 FROM pg_auth_members m JOIN pg_roles role_r ON role_r.oid=m.roleid JOIN pg_roles member_r ON member_r.oid=m.member
    WHERE role_r.rolname IN ('db_migrator','db_global_read_owner') AND member_r.rolname IN ('db_site_runtime','db_platform_runtime')
  ) THEN RAISE EXCEPTION 'verify-rls: runtime role has privileged role membership'; END IF;

  IF has_schema_privilege('db_site_runtime','public','CREATE') OR has_schema_privilege('db_platform_runtime','public','CREATE') THEN
    RAISE EXCEPTION 'verify-rls: runtime role has CREATE on public schema';
  END IF;
  IF NOT has_schema_privilege('db_site_runtime','public','USAGE') OR NOT has_schema_privilege('db_platform_runtime','public','USAGE') THEN
    RAISE EXCEPTION 'verify-rls: runtime role lacks explicit USAGE on public schema';
  END IF;

  -- Explicit GLOBAL credential must not gain site-owned table privileges.
  FOREACH t IN ARRAY site_tables LOOP
    IF has_table_privilege('db_platform_runtime','public.'||t,'SELECT')
       OR has_table_privilege('db_platform_runtime','public.'||t,'INSERT')
       OR has_table_privilege('db_platform_runtime','public.'||t,'UPDATE')
       OR has_table_privilege('db_platform_runtime','public.'||t,'DELETE')
       OR has_table_privilege('db_platform_runtime','public.'||t,'TRUNCATE') THEN
      RAISE EXCEPTION 'verify-rls: db_platform_runtime has site-table privilege on %',t;
    END IF;
  END LOOP;

  -- Registry/immutability restrictions explicitly locked by DOC-08.
  IF has_table_privilege('db_site_runtime','permissions','INSERT') OR has_table_privilege('db_site_runtime','permissions','UPDATE') OR has_table_privilege('db_site_runtime','permissions','DELETE') THEN
    RAISE EXCEPTION 'verify-rls: permission registry is mutable by site runtime';
  END IF;
  IF has_table_privilege('db_platform_runtime','permissions','INSERT') OR has_table_privilege('db_platform_runtime','permissions','UPDATE') OR has_table_privilege('db_platform_runtime','permissions','DELETE') THEN
    RAISE EXCEPTION 'verify-rls: permission registry is mutable by platform runtime';
  END IF;
  IF has_table_privilege('db_site_runtime','post_revisions','UPDATE') OR has_table_privilege('db_site_runtime','post_revisions','DELETE') THEN
    RAISE EXCEPTION 'verify-rls: immutable revisions have mutable runtime grant';
  END IF;
  IF has_table_privilege('db_platform_runtime','audit_events','UPDATE') OR has_table_privilege('db_platform_runtime','audit_events','DELETE')
     OR has_table_privilege('db_site_runtime','audit_events','UPDATE') OR has_table_privilege('db_site_runtime','audit_events','DELETE') THEN
    RAISE EXCEPTION 'verify-rls: audit_events append-only grant violated';
  END IF;
  IF NOT has_table_privilege('db_site_runtime','audit_events','INSERT') THEN
    RAISE EXCEPTION 'verify-rls: site runtime cannot append same-transaction SITE audit events';
  END IF;
  IF has_table_privilege('db_site_runtime','homepage_sections','INSERT') OR has_table_privilege('db_site_runtime','homepage_sections','DELETE') THEN
    RAISE EXCEPTION 'verify-rls: homepage_sections provisioning boundary violated';
  END IF;
  IF has_table_privilege('db_platform_runtime','platform_settings','INSERT') OR has_table_privilege('db_platform_runtime','platform_settings','DELETE') THEN
    RAISE EXCEPTION 'verify-rls: platform_settings key-registry boundary violated';
  END IF;
END
$$;
\echo PASS: verify-rls.sql
