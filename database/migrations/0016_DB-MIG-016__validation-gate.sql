-- BLOG-DOC-08 v1.0-RC1 / DB-MIG-016 validation_gate
-- Release-blocking deterministic database construction assertions.
BEGIN;

DO $$
DECLARE
  canonical_tables text[] := ARRAY[
    'sites','domains','admin_accounts','permissions','permission_prerequisites','roles','role_permissions',
    'account_site_assignments','account_site_role_assignments','account_global_role_assignments',
    'categories','tags','media','media_variants','author_site_profiles','posts','post_categories','post_tags',
    'post_related_posts','post_revisions','post_autosaves','post_url_history','media_usages','navigation_menus',
    'navigation_items','homepage_sections','homepage_section_posts','homepage_section_categories','site_settings',
    'redirects','platform_settings','audit_events','site_deletion_requests'
  ];
  site_tables text[] := ARRAY[
    'categories','tags','media','media_variants','author_site_profiles','posts','post_categories','post_tags',
    'post_related_posts','post_revisions','post_autosaves','post_url_history','media_usages','navigation_menus',
    'navigation_items','homepage_sections','homepage_section_posts','homepage_section_categories','site_settings','redirects'
  ];
  actual_tables text[];
  t text;
  n integer;
BEGIN
  SELECT array_agg(tablename::text ORDER BY tablename::text COLLATE "C") INTO actual_tables
  FROM pg_tables WHERE schemaname='public';
  IF actual_tables IS DISTINCT FROM (SELECT array_agg(x ORDER BY x COLLATE "C") FROM unnest(canonical_tables) x) THEN
    RAISE EXCEPTION 'DB-MIG-016 table registry mismatch: expected exactly 33 canonical tables';
  END IF;

  SELECT count(*) INTO n FROM pg_tables WHERE schemaname='public';
  IF n <> 33 THEN RAISE EXCEPTION 'DB-MIG-016 expected 33 tables, got %', n; END IF;

  FOREACH t IN ARRAY site_tables LOOP
    IF NOT EXISTS (
      SELECT 1 FROM pg_class c JOIN pg_namespace nsp ON nsp.oid=c.relnamespace
      WHERE nsp.nspname='public' AND c.relname=t AND c.relkind='r' AND c.relrowsecurity AND c.relforcerowsecurity
    ) THEN RAISE EXCEPTION 'DB-MIG-016 missing ENABLE/FORCE RLS for %', t; END IF;
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies p
      WHERE p.schemaname='public' AND p.tablename=t AND p.cmd='ALL'
        AND p.qual ILIKE '%app.current_site_id()%'
        AND p.with_check ILIKE '%app.current_site_id()%'
    ) THEN RAISE EXCEPTION 'DB-MIG-016 missing fail-closed ALL policy for %', t; END IF;
  END LOOP;

  SELECT count(*) INTO n FROM permissions;
  IF n <> 69 THEN RAISE EXCEPTION 'DB-MIG-016 expected 69 permission seeds, got %', n; END IF;
  SELECT count(*) INTO n FROM permissions WHERE scope='SITE';
  IF n <> 44 THEN RAISE EXCEPTION 'DB-MIG-016 expected 44 SITE permissions, got %', n; END IF;
  SELECT count(*) INTO n FROM permissions WHERE scope='GLOBAL';
  IF n <> 25 THEN RAISE EXCEPTION 'DB-MIG-016 expected 25 GLOBAL permissions, got %', n; END IF;
  SELECT count(*) INTO n FROM permission_prerequisites;
  IF n <> 57 THEN RAISE EXCEPTION 'DB-MIG-016 expected 57 permission prerequisites, got %', n; END IF;
  IF EXISTS (SELECT 1 FROM permissions WHERE permission_key LIKE '%*%' OR permission_key IN ('tags.merge','authors.reassign','roles.duplicate')) THEN
    RAISE EXCEPTION 'DB-MIG-016 forbidden permission seed detected';
  END IF;

  SELECT count(*) INTO n FROM sites WHERE site_key ~ '^SITE-(0[1-9]|1[0-4])$';
  IF n <> 14 THEN RAISE EXCEPTION 'DB-MIG-016 expected SITE-01..SITE-14, got % matching rows', n; END IF;
  IF EXISTS (
    SELECT 1 FROM (VALUES
      ('SITE-01','10000000-0000-4000-8000-000000000001'::uuid,'WhatsYourRashi.in'),
      ('SITE-02','10000000-0000-4000-8000-000000000002'::uuid,'ApkiRashi.com'),
      ('SITE-03','10000000-0000-4000-8000-000000000003'::uuid,'DailyRashi360.com'),
      ('SITE-04','10000000-0000-4000-8000-000000000004'::uuid,'ZodiacDaily.in'),
      ('SITE-05','10000000-0000-4000-8000-000000000005'::uuid,'DailyHoroscope360.com'),
      ('SITE-06','10000000-0000-4000-8000-000000000006'::uuid,'MyHoroscope360.com'),
      ('SITE-07','10000000-0000-4000-8000-000000000007'::uuid,'AstroToday360.com'),
      ('SITE-08','10000000-0000-4000-8000-000000000008'::uuid,'ApkiKundli.com'),
      ('SITE-09','10000000-0000-4000-8000-000000000009'::uuid,'MatchYourKundli.com'),
      ('SITE-10','10000000-0000-4000-8000-000000000010'::uuid,'ApkaNakshatra.com'),
      ('SITE-11','10000000-0000-4000-8000-000000000011'::uuid,'JaniyePanchang.com'),
      ('SITE-12','10000000-0000-4000-8000-000000000012'::uuid,'RashiRemedies.com'),
      ('SITE-13','10000000-0000-4000-8000-000000000013'::uuid,'ApkaPandit.in'),
      ('SITE-14','10000000-0000-4000-8000-000000000014'::uuid,'VastuShastra360.in')
    ) v(site_key, site_id, hostname)
    LEFT JOIN sites s ON s.site_key=v.site_key AND s.site_id=v.site_id
    LEFT JOIN domains d ON d.site_id=v.site_id AND d.hostname_normalized=lower(v.hostname) AND d.is_canonical AND d.is_active
    WHERE s.site_id IS NULL OR d.domain_id IS NULL
  ) THEN RAISE EXCEPTION 'DB-MIG-016 canonical 14-site/domain registry mismatch'; END IF;

  IF EXISTS (
    SELECT 1 FROM sites s
    WHERE s.site_key ~ '^SITE-(0[1-9]|1[0-4])$'
      AND (btrim(s.timezone_id)='' OR NOT EXISTS (SELECT 1 FROM pg_timezone_names z WHERE z.name=s.timezone_id))
  ) THEN RAISE EXCEPTION 'DB-MIG-016 invalid or blank initial site timezone'; END IF;

  SELECT count(*) INTO n FROM site_settings ss JOIN sites s USING(site_id) WHERE s.site_key ~ '^SITE-(0[1-9]|1[0-4])$';
  IF n <> 14 THEN RAISE EXCEPTION 'DB-MIG-016 expected 14 initial site_settings rows, got %', n; END IF;
  SELECT count(*) INTO n FROM navigation_menus nm JOIN sites s USING(site_id) WHERE s.site_key ~ '^SITE-(0[1-9]|1[0-4])$';
  IF n <> 28 THEN RAISE EXCEPTION 'DB-MIG-016 expected 28 initial navigation menus, got %', n; END IF;
  IF EXISTS (
    SELECT s.site_id FROM sites s LEFT JOIN navigation_menus m ON m.site_id=s.site_id
    WHERE s.site_key ~ '^SITE-(0[1-9]|1[0-4])$'
    GROUP BY s.site_id HAVING count(*) FILTER (WHERE m.menu_key='HEADER')<>1 OR count(*) FILTER (WHERE m.menu_key='FOOTER')<>1
  ) THEN RAISE EXCEPTION 'DB-MIG-016 HEADER/FOOTER menu seed mismatch'; END IF;

  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname IN ('db_site_runtime','db_platform_runtime') AND (rolbypassrls OR rolsuper OR rolcreaterole OR rolcreatedb)) THEN
    RAISE EXCEPTION 'DB-MIG-016 normal runtime role has forbidden elevated attribute';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname='db_global_read_owner' AND NOT rolcanlogin) THEN
    RAISE EXCEPTION 'DB-MIG-016 db_global_read_owner must be NOLOGIN';
  END IF;
END
$$;

COMMIT;
