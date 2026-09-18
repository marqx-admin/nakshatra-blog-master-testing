\set ON_ERROR_STOP on
-- DOC-08 required production seed verification. Read-only.
DO $$
DECLARE n integer;
BEGIN
  SELECT count(*) INTO n FROM permissions;
  IF n<>69 THEN RAISE EXCEPTION 'verify-seeds: expected 69 permissions, found %',n; END IF;
  SELECT count(*) INTO n FROM permissions WHERE scope='SITE';
  IF n<>44 THEN RAISE EXCEPTION 'verify-seeds: expected 44 SITE permissions, found %',n; END IF;
  SELECT count(*) INTO n FROM permissions WHERE scope='GLOBAL';
  IF n<>25 THEN RAISE EXCEPTION 'verify-seeds: expected 25 GLOBAL permissions, found %',n; END IF;
  SELECT count(*) INTO n FROM permission_prerequisites;
  IF n<>57 THEN RAISE EXCEPTION 'verify-seeds: expected 57 prerequisite pairs, found %',n; END IF;

  IF EXISTS (
    SELECT 1 FROM permission_prerequisites pp
    LEFT JOIN permissions p1 ON p1.permission_key=pp.permission_key
    LEFT JOIN permissions p2 ON p2.permission_key=pp.required_permission_key
    WHERE p1.permission_key IS NULL OR p2.permission_key IS NULL OR pp.permission_key=pp.required_permission_key
  ) THEN RAISE EXCEPTION 'verify-seeds: invalid prerequisite registry row'; END IF;

  IF EXISTS (SELECT 1 FROM permissions WHERE permission_key LIKE '%*%' OR permission_key IN ('tags.merge','authors.reassign','roles.duplicate')) THEN
    RAISE EXCEPTION 'verify-seeds: forbidden permission key present';
  END IF;

  IF EXISTS (
    SELECT 1 FROM (VALUES
      ('SITE-01','10000000-0000-4000-8000-000000000001'::uuid,'WhatsYourRashi','WhatsYourRashi.in'),
      ('SITE-02','10000000-0000-4000-8000-000000000002'::uuid,'ApkiRashi','ApkiRashi.com'),
      ('SITE-03','10000000-0000-4000-8000-000000000003'::uuid,'DailyRashi360','DailyRashi360.com'),
      ('SITE-04','10000000-0000-4000-8000-000000000004'::uuid,'ZodiacDaily','ZodiacDaily.in'),
      ('SITE-05','10000000-0000-4000-8000-000000000005'::uuid,'DailyHoroscope360','DailyHoroscope360.com'),
      ('SITE-06','10000000-0000-4000-8000-000000000006'::uuid,'MyHoroscope360','MyHoroscope360.com'),
      ('SITE-07','10000000-0000-4000-8000-000000000007'::uuid,'AstroToday360','AstroToday360.com'),
      ('SITE-08','10000000-0000-4000-8000-000000000008'::uuid,'ApkiKundli','ApkiKundli.com'),
      ('SITE-09','10000000-0000-4000-8000-000000000009'::uuid,'MatchYourKundli','MatchYourKundli.com'),
      ('SITE-10','10000000-0000-4000-8000-000000000010'::uuid,'ApkaNakshatra','ApkaNakshatra.com'),
      ('SITE-11','10000000-0000-4000-8000-000000000011'::uuid,'JaniyePanchang','JaniyePanchang.com'),
      ('SITE-12','10000000-0000-4000-8000-000000000012'::uuid,'RashiRemedies','RashiRemedies.com'),
      ('SITE-13','10000000-0000-4000-8000-000000000013'::uuid,'ApkaPandit','ApkaPandit.in'),
      ('SITE-14','10000000-0000-4000-8000-000000000014'::uuid,'VastuShastra360','VastuShastra360.in')
    ) v(site_key,site_id,display_name,hostname)
    LEFT JOIN sites s ON s.site_key=v.site_key AND s.site_id=v.site_id AND s.display_name=v.display_name AND s.status='ACTIVE'
    LEFT JOIN domains d ON d.site_id=v.site_id AND d.hostname_normalized=lower(v.hostname) AND d.is_canonical AND d.is_active
    WHERE s.site_id IS NULL OR d.domain_id IS NULL
  ) THEN RAISE EXCEPTION 'verify-seeds: initial SITE-01..SITE-14 registry mismatch'; END IF;

  SELECT count(*) INTO n FROM sites WHERE site_key ~ '^SITE-(0[1-9]|1[0-4])$';
  IF n<>14 THEN RAISE EXCEPTION 'verify-seeds: expected 14 initial site keys, found %',n; END IF;
  IF EXISTS (
    SELECT 1 FROM sites s WHERE s.site_key ~ '^SITE-(0[1-9]|1[0-4])$'
      AND (btrim(s.timezone_id)='' OR NOT EXISTS (SELECT 1 FROM pg_timezone_names z WHERE z.name=s.timezone_id))
  ) THEN RAISE EXCEPTION 'verify-seeds: blank/invalid IANA timezone in initial site registry'; END IF;

  SELECT count(*) INTO n FROM site_settings ss JOIN sites s USING(site_id) WHERE s.site_key ~ '^SITE-(0[1-9]|1[0-4])$';
  IF n<>14 THEN RAISE EXCEPTION 'verify-seeds: expected 14 site_settings rows, found %',n; END IF;
  SELECT count(*) INTO n FROM navigation_menus nm JOIN sites s USING(site_id) WHERE s.site_key ~ '^SITE-(0[1-9]|1[0-4])$';
  IF n<>28 THEN RAISE EXCEPTION 'verify-seeds: expected 28 initial HEADER/FOOTER menus, found %',n; END IF;
  IF EXISTS (
    SELECT s.site_id FROM sites s LEFT JOIN navigation_menus m ON m.site_id=s.site_id
    WHERE s.site_key ~ '^SITE-(0[1-9]|1[0-4])$'
    GROUP BY s.site_id HAVING count(*) FILTER (WHERE m.menu_key='HEADER')<>1 OR count(*) FILTER (WHERE m.menu_key='FOOTER')<>1
  ) THEN RAISE EXCEPTION 'verify-seeds: each initial site must have exactly one HEADER and one FOOTER'; END IF;

  -- DOC-08 explicitly freezes no initial platform_settings business keys.
  IF EXISTS (SELECT 1 FROM platform_settings) THEN
    RAISE EXCEPTION 'verify-seeds: platform_settings baseline must not invent business keys';
  END IF;
END
$$;
\echo PASS: verify-seeds.sql
