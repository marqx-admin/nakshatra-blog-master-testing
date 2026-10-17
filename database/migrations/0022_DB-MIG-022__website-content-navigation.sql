-- W2 additive content fields and typed archive links. No data backfill.
BEGIN;
ALTER TABLE site_settings
  ADD COLUMN homepage_h1 text NULL CONSTRAINT ck_site_settings__homepage_h1 CHECK (length(homepage_h1)<=200 AND homepage_h1 !~ '[<>]');
ALTER TABLE site_settings ADD COLUMN homepage_intro_text text NULL CONSTRAINT ck_site_settings__homepage_intro_text CHECK (length(homepage_intro_text)<=12000 AND homepage_intro_text !~ '[<>]');
ALTER TABLE navigation_items DROP CONSTRAINT ck_navigation_items__destination_kind;
ALTER TABLE navigation_items ADD CONSTRAINT ck_navigation_items__destination_kind
  CHECK (destination_kind IN ('HOME','BLOG','POST','CATEGORY','TAG','AUTHOR','SEARCH','STATIC','EXTERNAL'));
ALTER TABLE navigation_items DROP CONSTRAINT ck_navigation_items__destination_shape;
ALTER TABLE navigation_items ADD CONSTRAINT ck_navigation_items__destination_shape CHECK (
    (destination_kind IN ('HOME','BLOG','SEARCH') AND target_post_id IS NULL AND target_category_id IS NULL AND target_tag_id IS NULL AND target_author_profile_id IS NULL AND static_page_key IS NULL AND external_url IS NULL) OR
    (destination_kind='POST' AND target_post_id IS NOT NULL AND target_category_id IS NULL AND target_tag_id IS NULL AND target_author_profile_id IS NULL AND static_page_key IS NULL AND external_url IS NULL) OR
    (destination_kind='CATEGORY' AND target_post_id IS NULL AND target_category_id IS NOT NULL AND target_tag_id IS NULL AND target_author_profile_id IS NULL AND static_page_key IS NULL AND external_url IS NULL) OR
    (destination_kind='TAG' AND target_post_id IS NULL AND target_category_id IS NULL AND target_tag_id IS NOT NULL AND target_author_profile_id IS NULL AND static_page_key IS NULL AND external_url IS NULL) OR
    (destination_kind='AUTHOR' AND target_post_id IS NULL AND target_category_id IS NULL AND target_tag_id IS NULL AND target_author_profile_id IS NOT NULL AND static_page_key IS NULL AND external_url IS NULL) OR
    (destination_kind='STATIC' AND target_post_id IS NULL AND target_category_id IS NULL AND target_tag_id IS NULL AND target_author_profile_id IS NULL AND static_page_key IS NOT NULL AND external_url IS NULL) OR
    (destination_kind='EXTERNAL' AND target_post_id IS NULL AND target_category_id IS NULL AND target_tag_id IS NULL AND target_author_profile_id IS NULL AND static_page_key IS NULL AND external_url IS NOT NULL)
  );

CREATE OR REPLACE FUNCTION app.insert_website_site_baseline(
  target_site_id uuid, actor uuid, presentation jsonb, pages jsonb
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
DECLARE
  settings_ok boolean;
  navigation_ok boolean;
  homepage_ok boolean;
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.admin_accounts
    WHERE admin_id=actor AND is_super_admin=true AND status='ACTIVE'
  ) OR NOT EXISTS (
    SELECT 1 FROM public.sites
    WHERE site_id=target_site_id AND status='DISABLED'
  ) THEN
    RAISE EXCEPTION 'active Super Admin and DISABLED site required' USING ERRCODE='42501';
  END IF;
  IF jsonb_typeof(presentation) IS DISTINCT FROM 'object'
     OR presentation ->> 'schema_version' IS DISTINCT FROM '1'
     OR jsonb_typeof(pages) IS DISTINCT FROM 'object'
     OR NOT pages ?& ARRAY['ABOUT','CONTACT','PRIVACY','TERMS','DISCLAIMER']
     OR pages - 'ABOUT' - 'CONTACT' - 'PRIVACY' - 'TERMS' - 'DISCLAIMER' IS DISTINCT FROM '{}'::jsonb
  THEN
    RAISE EXCEPTION 'invalid website baseline' USING ERRCODE='22023';
  END IF;

  -- This bridge is insert-only. A repeat call, or a call against an existing
  -- partially configured tenant, must fail rather than change its baseline.
  IF EXISTS (SELECT 1 FROM public.site_settings WHERE site_id=target_site_id)
     OR EXISTS (SELECT 1 FROM public.navigation_menus WHERE site_id=target_site_id)
     OR EXISTS (SELECT 1 FROM public.homepage_sections WHERE site_id=target_site_id)
  THEN
    RAISE EXCEPTION 'website baseline already exists' USING ERRCODE='23505';
  END IF;

  PERFORM set_config('app.site_id', target_site_id::text, true);
  INSERT INTO public.site_settings(
    site_id,presentation_schema_version,presentation_config,static_pages,updated_by_admin_id
  ) VALUES (target_site_id,1,presentation,pages,actor);
  INSERT INTO public.navigation_menus(site_id,menu_key)
  VALUES (target_site_id,'HEADER'),(target_site_id,'FOOTER');

  -- This insert-only provisioning function cannot act on an existing baseline.
  -- Only always-supported internal destinations; information pages remain opt-in.
  INSERT INTO public.navigation_items(site_id,menu_id,label,sort_order,destination_kind)
  SELECT target_site_id,m.menu_id,
    CASE WHEN COALESCE(s.locale_code,s.default_language_code,'en') ~* '^hi(-|$)'
      THEN v.hindi ELSE v.english END,v.position,v.kind
  FROM public.navigation_menus m JOIN public.sites s ON s.site_id=m.site_id
  CROSS JOIN (VALUES ('HOME','Home','मुखपृष्ठ',0),('BLOG','All Articles','सभी लेख',1),('SEARCH','Search','खोजें',2))
    AS v(kind,english,hindi,position)
  WHERE m.site_id=target_site_id AND m.menu_key IN ('HEADER','FOOTER');

  -- Owner-defined Universal Home V1 registry. Intro, lead, and latest are
  -- projected by the Home model; they are not registry rows.
  INSERT INTO public.homepage_sections(
    site_id,section_key,section_kind,contract_version,position_key,is_enabled,
    display_label,max_items,allow_visibility_edit,allow_label_edit,
    allow_post_selection,allow_category_selection
  ) VALUES
    (target_site_id,'featured-posts','POST_SELECTION','UNIVERSAL-HOME-V1',
     'FEATURED_POSTS',false,NULL,NULL,true,true,true,false),
    (target_site_id,'featured-categories','CATEGORY_SELECTION','UNIVERSAL-HOME-V1',
     'FEATURED_CATEGORIES',false,NULL,NULL,true,true,false,true);

  SELECT EXISTS(
    SELECT 1 FROM public.site_settings WHERE site_id=target_site_id
      AND presentation_schema_version=1 AND presentation_config=presentation
      AND static_pages=pages
  ) INTO settings_ok;
  SELECT COUNT(DISTINCT menu_key)=2 INTO navigation_ok
  FROM public.navigation_menus
  WHERE site_id=target_site_id AND menu_key IN ('HEADER','FOOTER');
  SELECT COUNT(*)=2 AND COUNT(*) FILTER (WHERE
    (section_key='featured-posts' AND section_kind='POST_SELECTION'
     AND contract_version='UNIVERSAL-HOME-V1' AND position_key='FEATURED_POSTS'
     AND allow_visibility_edit AND allow_label_edit AND allow_post_selection
     AND NOT allow_category_selection)
    OR
    (section_key='featured-categories' AND section_kind='CATEGORY_SELECTION'
     AND contract_version='UNIVERSAL-HOME-V1' AND position_key='FEATURED_CATEGORIES'
     AND allow_visibility_edit AND allow_label_edit AND NOT allow_post_selection
     AND allow_category_selection)
  )=2 INTO homepage_ok
  FROM public.homepage_sections WHERE site_id=target_site_id;
  RETURN jsonb_build_object(
    'settings_ready',settings_ok,
    'navigation_ready',navigation_ok,
    'homepage_ready',homepage_ok
  );
END
$$;

REVOKE ALL ON FUNCTION app.insert_website_site_baseline(uuid,uuid,jsonb,jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION app.insert_website_site_baseline(uuid,uuid,jsonb,jsonb) TO db_platform_runtime;

COMMIT;
