\set ON_ERROR_STOP on

-- CHAT02 clean-database execution harness. DOC-24 deployment tooling may wrap the
-- same immutable migrations with provider-specific locking/evidence, but may not
-- change their order or contents.
SELECT pg_advisory_lock(hashtextextended('NAKSHATRA:BLOG:DB-MIG:v1', 0));

DO $$
DECLARE n integer;
BEGIN
  SELECT count(*) INTO n FROM pg_tables WHERE schemaname = 'public';
  IF n <> 0 THEN
    RAISE EXCEPTION 'clean migration verification requires zero public tables; found %', n;
  END IF;
END
$$;

\ir ../migrations/0001_DB-MIG-001__bootstrap-database.sql

-- DB-MIG-001 creates the deployment-only migration role and grants this bootstrap
-- identity permission to SET ROLE. DB-MIG-002..017 execute as the migration owner,
-- which is also the only migration path permitted to bypass FORCE RLS for seeds.
SET ROLE db_migrator;

SELECT set_config('app.bootstrap_timezone_site_01', :'SITE_01_TIMEZONE', false);
SELECT set_config('app.bootstrap_timezone_site_02', :'SITE_02_TIMEZONE', false);
SELECT set_config('app.bootstrap_timezone_site_03', :'SITE_03_TIMEZONE', false);
SELECT set_config('app.bootstrap_timezone_site_04', :'SITE_04_TIMEZONE', false);
SELECT set_config('app.bootstrap_timezone_site_05', :'SITE_05_TIMEZONE', false);
SELECT set_config('app.bootstrap_timezone_site_06', :'SITE_06_TIMEZONE', false);
SELECT set_config('app.bootstrap_timezone_site_07', :'SITE_07_TIMEZONE', false);
SELECT set_config('app.bootstrap_timezone_site_08', :'SITE_08_TIMEZONE', false);
SELECT set_config('app.bootstrap_timezone_site_09', :'SITE_09_TIMEZONE', false);
SELECT set_config('app.bootstrap_timezone_site_10', :'SITE_10_TIMEZONE', false);
SELECT set_config('app.bootstrap_timezone_site_11', :'SITE_11_TIMEZONE', false);
SELECT set_config('app.bootstrap_timezone_site_12', :'SITE_12_TIMEZONE', false);
SELECT set_config('app.bootstrap_timezone_site_13', :'SITE_13_TIMEZONE', false);
SELECT set_config('app.bootstrap_timezone_site_14', :'SITE_14_TIMEZONE', false);

\ir ../migrations/0002_DB-MIG-002__tenancy-registry.sql
\ir ../migrations/0003_DB-MIG-003__admin-identity-authorization.sql
\ir ../migrations/0004_DB-MIG-004__taxonomy-media-author.sql
\ir ../migrations/0005_DB-MIG-005__post-core.sql
\ir ../migrations/0006_DB-MIG-006__post-relationships.sql
\ir ../migrations/0007_DB-MIG-007__post-history.sql
\ir ../migrations/0008_DB-MIG-008__media-usage.sql
\ir ../migrations/0009_DB-MIG-009__navigation-homepage.sql
\ir ../migrations/0010_DB-MIG-010__settings-redirects.sql
\ir ../migrations/0011_DB-MIG-011__audit-deletion-request.sql
\ir ../migrations/0012_DB-MIG-012__immutability-and-role-integrity.sql
\ir ../migrations/0013_DB-MIG-013__rls-policies.sql
\ir ../migrations/0014_DB-MIG-014__runtime-grants.sql
\ir ../migrations/0015_DB-MIG-015__required-system-seed.sql
\ir ../migrations/0016_DB-MIG-016__validation-gate.sql
\ir ../migrations/0017_DB-MIG-017__wave2-contract-reconciliation.sql
\ir ../migrations/0018_DB-MIG-018__site-identity-settings-write.sql
\ir ../migrations/0019_DB-MIG-019__launch-access-boundaries.sql
\ir ../migrations/0020_DB-MIG-020__universal-presentation-foundation.sql

RESET ROLE;
SELECT pg_advisory_unlock(hashtextextended('NAKSHATRA:BLOG:DB-MIG:v1', 0));
