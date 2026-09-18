\set ON_ERROR_STOP on
-- Requires database/seeds/isolation-fixtures.sql already applied in test/CI.
-- Executes only rollback-scoped probes plus read-only GLOBAL boundary probes.

RESET ROLE;
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM posts WHERE post_id='34000000-0000-4000-8000-000000000001'::uuid)
     OR NOT EXISTS (SELECT 1 FROM posts WHERE post_id='34000000-0000-4000-8000-000000000002'::uuid) THEN
    RAISE EXCEPTION 'verify-behavior requires DOC-08 isolation fixtures';
  END IF;
END
$$;

SET ROLE db_site_runtime;

-- Missing SiteContext fails closed.
BEGIN;
DO $$
DECLARE n integer;
BEGIN
  IF app.current_site_id() IS NOT NULL THEN RAISE EXCEPTION 'unexpected tenant context before test'; END IF;
  SELECT count(*) INTO n FROM posts;
  IF n<>0 THEN RAISE EXCEPTION 'missing SiteContext exposed % post rows',n; END IF;
END
$$;
ROLLBACK;

-- Same-site visibility and write are allowed; foreign tenant rows remain unavailable.
BEGIN;
SELECT set_config('app.site_id','10000000-0000-4000-8000-000000000001',true);
DO $$
DECLARE n integer;
BEGIN
  SELECT count(*) INTO n FROM posts WHERE post_id='34000000-0000-4000-8000-000000000001'::uuid;
  IF n<>1 THEN RAISE EXCEPTION 'SITE-01 cannot read own fixture post'; END IF;
  SELECT count(*) INTO n FROM posts WHERE post_id='34000000-0000-4000-8000-000000000002'::uuid;
  IF n<>0 THEN RAISE EXCEPTION 'SITE-01 can read SITE-02 post'; END IF;

  INSERT INTO categories(site_id,category_id,name,slug)
  VALUES ('10000000-0000-4000-8000-000000000001','39000000-0000-4000-8000-000000000001','RLS Positive Probe','rls-positive-probe');
  UPDATE categories SET description='same-site write probe'
  WHERE category_id='39000000-0000-4000-8000-000000000001'::uuid;
END
$$;
ROLLBACK;

-- Cross-site write must be denied by RLS WITH CHECK.
BEGIN;
SELECT set_config('app.site_id','10000000-0000-4000-8000-000000000001',true);
DO $$
BEGIN
  BEGIN
    INSERT INTO categories(site_id,category_id,name,slug)
    VALUES ('10000000-0000-4000-8000-000000000002','39000000-0000-4000-8000-000000000002','Cross Site Probe','cross-site-probe');
    RAISE EXCEPTION 'cross-site write unexpectedly succeeded';
  EXCEPTION WHEN insufficient_privilege THEN
    NULL;
  END;
END
$$;
ROLLBACK;

-- Same-site composite foreign keys reject foreign target IDs even if UUIDs are valid.
BEGIN;
SELECT set_config('app.site_id','10000000-0000-4000-8000-000000000001',true);
DO $$
BEGIN
  BEGIN
    INSERT INTO post_categories(site_id,post_id,category_id)
    VALUES (
      '10000000-0000-4000-8000-000000000001',
      '34000000-0000-4000-8000-000000000001',
      '30000000-0000-4000-8000-000000000002'
    );
    RAISE EXCEPTION 'cross-site relationship unexpectedly succeeded';
  EXCEPTION WHEN foreign_key_violation THEN
    NULL;
  END;
END
$$;
ROLLBACK;

-- Valid but unknown context is an empty tenant, never global scope.
BEGIN;
SELECT set_config('app.site_id','ffffffff-ffff-4fff-8fff-ffffffffffff',true);
DO $$
DECLARE n integer;
BEGIN
  SELECT count(*) INTO n FROM posts;
  IF n<>0 THEN RAISE EXCEPTION 'unknown SiteContext exposed % rows',n; END IF;
END
$$;
ROLLBACK;

-- Malformed context cannot be interpreted as global; UUID cast fails closed.
BEGIN;
SELECT set_config('app.site_id','not-a-uuid',true);
DO $$
BEGIN
  BEGIN
    PERFORM app.current_site_id();
    RAISE EXCEPTION 'malformed SiteContext unexpectedly parsed';
  EXCEPTION WHEN invalid_text_representation THEN
    NULL;
  END;
END
$$;
ROLLBACK;

-- Transaction-local context is gone before the next transaction on the same session.
BEGIN;
SELECT set_config('app.site_id','10000000-0000-4000-8000-000000000001',true);
SELECT 1 FROM posts LIMIT 1;
COMMIT;
BEGIN;
DO $$
DECLARE n integer;
BEGIN
  IF app.current_site_id() IS NOT NULL THEN RAISE EXCEPTION 'SiteContext leaked across transactions'; END IF;
  SELECT count(*) INTO n FROM posts;
  IF n<>0 THEN RAISE EXCEPTION 'post rows visible after SiteContext cleanup'; END IF;
END
$$;
ROLLBACK;

RESET ROLE;
SET ROLE db_platform_runtime;

-- Explicit GLOBAL path can use its global registry grants.
DO $$
DECLARE n integer;
BEGIN
  SELECT count(*) INTO n FROM sites WHERE site_key ~ '^SITE-(0[1-9]|1[0-4])$';
  IF n<>14 THEN RAISE EXCEPTION 'platform runtime cannot read global site registry'; END IF;

  BEGIN
    PERFORM count(*) FROM posts;
    RAISE EXCEPTION 'platform runtime unexpectedly has direct SITE-table read';
  EXCEPTION WHEN insufficient_privilege THEN
    NULL;
  END;
END
$$;

RESET ROLE;
\echo PASS: verify-behavior.sql
