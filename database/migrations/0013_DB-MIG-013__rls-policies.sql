-- BLOG-DOC-08 v1.0-RC1 / DB-MIG-013 rls_policies
BEGIN;

DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'categories','tags','media','media_variants','author_site_profiles','posts',
    'post_categories','post_tags','post_related_posts','post_revisions','post_autosaves',
    'post_url_history','media_usages','navigation_menus','navigation_items','homepage_sections',
    'homepage_section_posts','homepage_section_categories','site_settings','redirects'
  ] LOOP
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format('ALTER TABLE %I FORCE ROW LEVEL SECURITY', t);
    EXECUTE format(
      'CREATE POLICY %I ON %I FOR ALL USING (site_id = app.current_site_id()) WITH CHECK (site_id = app.current_site_id())',
      'rls_' || t || '__site', t
    );
  END LOOP;
END
$$;

COMMIT;
