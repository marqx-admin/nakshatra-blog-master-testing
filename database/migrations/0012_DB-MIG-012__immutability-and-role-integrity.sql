-- BLOG-DOC-08 v1.0-RC1 / DB-MIG-012 immutability_and_role_integrity
BEGIN;

CREATE OR REPLACE FUNCTION app.enforce_role_integrity() RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.scope IS DISTINCT FROM OLD.scope THEN
    IF EXISTS (SELECT 1 FROM role_permissions rp WHERE rp.role_id = OLD.role_id)
       OR EXISTS (SELECT 1 FROM account_site_role_assignments a WHERE a.role_id = OLD.role_id)
       OR EXISTS (SELECT 1 FROM account_global_role_assignments a WHERE a.role_id = OLD.role_id) THEN
      RAISE EXCEPTION 'role scope is immutable after permission or assignment use' USING ERRCODE='23514';
    END IF;
  END IF;

  IF NEW.status = 'RETIRED' AND OLD.status IS DISTINCT FROM 'RETIRED' THEN
    IF EXISTS (SELECT 1 FROM account_site_role_assignments a WHERE a.role_id = OLD.role_id)
       OR EXISTS (SELECT 1 FROM account_global_role_assignments a WHERE a.role_id = OLD.role_id) THEN
      RAISE EXCEPTION 'role retirement blocked while assignments remain' USING ERRCODE='23514';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_roles__integrity
BEFORE UPDATE OF scope, status ON roles
FOR EACH ROW EXECUTE FUNCTION app.enforce_role_integrity();

DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'categories','tags','media','media_variants','author_site_profiles','posts',
    'post_categories','post_tags','post_related_posts','post_revisions','post_autosaves',
    'post_url_history','media_usages','navigation_menus','navigation_items','homepage_sections',
    'homepage_section_posts','homepage_section_categories','site_settings','redirects'
  ] LOOP
    EXECUTE format('CREATE TRIGGER %I BEFORE UPDATE OF site_id ON %I FOR EACH ROW EXECUTE FUNCTION app.reject_site_id_change()', 'trg_' || t || '__site_id_immutable', t);
  END LOOP;
END
$$;

REVOKE ALL ON FUNCTION app.enforce_role_integrity() FROM PUBLIC;

COMMIT;
