-- BLOG-DOC-08 Appendix D. Requires explicit per-site IANA timezone GUC inputs.
-- Set app.bootstrap_timezone_site_01 through app.bootstrap_timezone_site_14 explicitly before execution.
BEGIN;

DO $$
DECLARE n integer; key text; tz text; guc text;
BEGIN
  FOR n IN 1..14 LOOP
    key := format('SITE-%s', lpad(n::text,2,'0'));
    guc := format('app.bootstrap_timezone_site_%s', lpad(n::text,2,'0'));
    tz := current_setting(guc, true);
    IF tz IS NULL OR btrim(tz) = '' THEN
      RAISE EXCEPTION 'missing required timezone bootstrap input for % (%)', key, guc;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_timezone_names WHERE name = tz) THEN
      RAISE EXCEPTION 'invalid IANA timezone bootstrap input for %: %', key, tz;
    END IF;
  END LOOP;
END $$;

INSERT INTO sites(site_id, site_key, display_name, status, timezone_id) VALUES
  ('10000000-0000-4000-8000-000000000001'::uuid, 'SITE-01', 'WhatsYourRashi', 'ACTIVE', current_setting('app.bootstrap_timezone_site_01', true)),
  ('10000000-0000-4000-8000-000000000002'::uuid, 'SITE-02', 'ApkiRashi', 'ACTIVE', current_setting('app.bootstrap_timezone_site_02', true)),
  ('10000000-0000-4000-8000-000000000003'::uuid, 'SITE-03', 'DailyRashi360', 'ACTIVE', current_setting('app.bootstrap_timezone_site_03', true)),
  ('10000000-0000-4000-8000-000000000004'::uuid, 'SITE-04', 'ZodiacDaily', 'ACTIVE', current_setting('app.bootstrap_timezone_site_04', true)),
  ('10000000-0000-4000-8000-000000000005'::uuid, 'SITE-05', 'DailyHoroscope360', 'ACTIVE', current_setting('app.bootstrap_timezone_site_05', true)),
  ('10000000-0000-4000-8000-000000000006'::uuid, 'SITE-06', 'MyHoroscope360', 'ACTIVE', current_setting('app.bootstrap_timezone_site_06', true)),
  ('10000000-0000-4000-8000-000000000007'::uuid, 'SITE-07', 'AstroToday360', 'ACTIVE', current_setting('app.bootstrap_timezone_site_07', true)),
  ('10000000-0000-4000-8000-000000000008'::uuid, 'SITE-08', 'ApkiKundli', 'ACTIVE', current_setting('app.bootstrap_timezone_site_08', true)),
  ('10000000-0000-4000-8000-000000000009'::uuid, 'SITE-09', 'MatchYourKundli', 'ACTIVE', current_setting('app.bootstrap_timezone_site_09', true)),
  ('10000000-0000-4000-8000-000000000010'::uuid, 'SITE-10', 'ApkaNakshatra', 'ACTIVE', current_setting('app.bootstrap_timezone_site_10', true)),
  ('10000000-0000-4000-8000-000000000011'::uuid, 'SITE-11', 'JaniyePanchang', 'ACTIVE', current_setting('app.bootstrap_timezone_site_11', true)),
  ('10000000-0000-4000-8000-000000000012'::uuid, 'SITE-12', 'RashiRemedies', 'ACTIVE', current_setting('app.bootstrap_timezone_site_12', true)),
  ('10000000-0000-4000-8000-000000000013'::uuid, 'SITE-13', 'ApkaPandit', 'ACTIVE', current_setting('app.bootstrap_timezone_site_13', true)),
  ('10000000-0000-4000-8000-000000000014'::uuid, 'SITE-14', 'VastuShastra360', 'ACTIVE', current_setting('app.bootstrap_timezone_site_14', true))
ON CONFLICT (site_key) DO UPDATE SET
  display_name=EXCLUDED.display_name, status=EXCLUDED.status, timezone_id=EXCLUDED.timezone_id, updated_at=now();

INSERT INTO domains(site_id, hostname, is_canonical, is_active) VALUES
  ('10000000-0000-4000-8000-000000000001'::uuid, 'WhatsYourRashi.in', true, true),
  ('10000000-0000-4000-8000-000000000002'::uuid, 'ApkiRashi.com', true, true),
  ('10000000-0000-4000-8000-000000000003'::uuid, 'DailyRashi360.com', true, true),
  ('10000000-0000-4000-8000-000000000004'::uuid, 'ZodiacDaily.in', true, true),
  ('10000000-0000-4000-8000-000000000005'::uuid, 'DailyHoroscope360.com', true, true),
  ('10000000-0000-4000-8000-000000000006'::uuid, 'MyHoroscope360.com', true, true),
  ('10000000-0000-4000-8000-000000000007'::uuid, 'AstroToday360.com', true, true),
  ('10000000-0000-4000-8000-000000000008'::uuid, 'ApkiKundli.com', true, true),
  ('10000000-0000-4000-8000-000000000009'::uuid, 'MatchYourKundli.com', true, true),
  ('10000000-0000-4000-8000-000000000010'::uuid, 'ApkaNakshatra.com', true, true),
  ('10000000-0000-4000-8000-000000000011'::uuid, 'JaniyePanchang.com', true, true),
  ('10000000-0000-4000-8000-000000000012'::uuid, 'RashiRemedies.com', true, true),
  ('10000000-0000-4000-8000-000000000013'::uuid, 'ApkaPandit.in', true, true),
  ('10000000-0000-4000-8000-000000000014'::uuid, 'VastuShastra360.in', true, true)
ON CONFLICT (hostname_normalized) DO UPDATE SET site_id=EXCLUDED.site_id, hostname=EXCLUDED.hostname, is_canonical=true, is_active=true, updated_at=now();

INSERT INTO site_settings(site_id) SELECT site_id FROM sites WHERE site_key ~ '^SITE-(0[1-9]|1[0-4])$' ON CONFLICT (site_id) DO NOTHING;

INSERT INTO navigation_menus(site_id, menu_key) SELECT site_id, k FROM sites CROSS JOIN (VALUES ('HEADER'),('FOOTER')) AS x(k) WHERE site_key ~ '^SITE-(0[1-9]|1[0-4])$' ON CONFLICT (site_id, menu_key) DO NOTHING;

COMMIT;
