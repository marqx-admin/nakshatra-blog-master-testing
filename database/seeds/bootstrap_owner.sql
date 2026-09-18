-- BLOG-DOC-08 BOOTSTRAP_OWNER seed. Controlled one-time execution only.
-- Required deployment inputs (never committed secrets):
--   SET app.bootstrap_owner_email = 'owner@example.invalid';
--   SET app.bootstrap_owner_display_name = '...';
BEGIN;
DO $$
DECLARE e text := NULLIF(current_setting('app.bootstrap_owner_email', true),'');
DECLARE n text := NULLIF(current_setting('app.bootstrap_owner_display_name', true),'');
BEGIN
  IF e IS NULL OR n IS NULL THEN RAISE EXCEPTION 'BOOTSTRAP_OWNER requires deployment-supplied email and display name'; END IF;
  IF e <> lower(btrim(e)) THEN RAISE EXCEPTION 'BOOTSTRAP_OWNER email input must already be normalized'; END IF;
  IF btrim(n) = '' THEN RAISE EXCEPTION 'BOOTSTRAP_OWNER display name must be nonblank'; END IF;
  IF EXISTS (SELECT 1 FROM admin_accounts WHERE is_super_admin) THEN RAISE EXCEPTION 'BOOTSTRAP_OWNER refused: designated Super Admin already exists'; END IF;
  INSERT INTO admin_accounts(email, display_name, status, is_super_admin)
  VALUES (e, n, 'ACTIVE', true);
END $$;
COMMIT;
