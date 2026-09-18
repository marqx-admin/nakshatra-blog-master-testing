-- BLOG-DOC-08 ISOLATION_TEST deterministic collision fixture. NEVER production.
BEGIN;
DO $$
BEGIN
  IF COALESCE(current_setting('app.environment', true),'') NOT IN ('test','testing','ci') THEN
    RAISE EXCEPTION 'isolation fixture requires app.environment=test|testing|ci';
  END IF;
END $$;

INSERT INTO admin_accounts(admin_id,email,display_name,status,is_super_admin)
VALUES ('20000000-0000-4000-8000-000000000001','isolation-fixture@example.invalid','Isolation Fixture','ACTIVE',false)
ON CONFLICT (admin_id) DO NOTHING;

INSERT INTO categories(category_id,site_id,name,slug)
VALUES
 ('30000000-0000-4000-8000-000000000001','10000000-0000-4000-8000-000000000001','Technology','technology'),
 ('30000000-0000-4000-8000-000000000002','10000000-0000-4000-8000-000000000002','Technology','technology')
ON CONFLICT (category_id) DO NOTHING;

INSERT INTO tags(tag_id,site_id,name,slug)
VALUES
 ('31000000-0000-4000-8000-000000000001','10000000-0000-4000-8000-000000000001','AI','ai'),
 ('31000000-0000-4000-8000-000000000002','10000000-0000-4000-8000-000000000002','AI','ai')
ON CONFLICT (tag_id) DO NOTHING;

INSERT INTO media(media_id,site_id,status,original_filename,mime_type,byte_size,checksum_sha256,object_key,created_by_admin_id)
VALUES
 ('32000000-0000-4000-8000-000000000001','10000000-0000-4000-8000-000000000001','ACTIVE','hero.jpg','image/jpeg',1,repeat('0',64),'sites/SITE-01/test/hero.jpg','20000000-0000-4000-8000-000000000001'),
 ('32000000-0000-4000-8000-000000000002','10000000-0000-4000-8000-000000000002','ACTIVE','hero.jpg','image/jpeg',1,repeat('1',64),'sites/SITE-02/test/hero.jpg','20000000-0000-4000-8000-000000000001')
ON CONFLICT (media_id) DO NOTHING;

INSERT INTO author_site_profiles(author_profile_id,site_id,display_name,slug,status)
VALUES
 ('33000000-0000-4000-8000-000000000001','10000000-0000-4000-8000-000000000001','Test Author','test-author','ACTIVE'),
 ('33000000-0000-4000-8000-000000000002','10000000-0000-4000-8000-000000000002','Test Author','test-author','ACTIVE')
ON CONFLICT (author_profile_id) DO NOTHING;

INSERT INTO posts(post_id,site_id,title,slug,created_by_admin_id)
VALUES
 ('34000000-0000-4000-8000-000000000001','10000000-0000-4000-8000-000000000001','Isolation Fixture','future-of-ai','20000000-0000-4000-8000-000000000001'),
 ('34000000-0000-4000-8000-000000000002','10000000-0000-4000-8000-000000000002','Isolation Fixture','future-of-ai','20000000-0000-4000-8000-000000000001')
ON CONFLICT (post_id) DO NOTHING;
COMMIT;
