-- BLOG-DOC-08 DEVELOPMENT fixture. NEVER production.
BEGIN;
DO $$
BEGIN
  IF COALESCE(current_setting('app.environment', true),'') NOT IN ('development','dev') THEN
    RAISE EXCEPTION 'development fixture requires app.environment=development|dev';
  END IF;
END $$;
INSERT INTO admin_accounts(admin_id,email,display_name,status,is_super_admin)
VALUES ('20000000-0000-4000-8000-000000000010','developer-fixture@example.invalid','Development Fixture','ACTIVE',false)
ON CONFLICT (admin_id) DO NOTHING;
COMMIT;
