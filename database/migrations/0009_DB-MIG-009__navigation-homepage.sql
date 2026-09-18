-- BLOG-DOC-08 v1.0-RC1 / DB-MIG-009 navigation_homepage
BEGIN;

CREATE TABLE navigation_menus (
  menu_id uuid NOT NULL DEFAULT gen_random_uuid(),
  site_id uuid NOT NULL,
  menu_key text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT pk_navigation_menus PRIMARY KEY (menu_id),
  CONSTRAINT uq_navigation_menus__site_id UNIQUE (site_id, menu_id),
  CONSTRAINT fk_navigation_menus__site FOREIGN KEY (site_id) REFERENCES sites(site_id),
  CONSTRAINT uq_navigation_menus__site_key UNIQUE (site_id, menu_key),
  CONSTRAINT ck_navigation_menus__key CHECK (menu_key IN ('HEADER','FOOTER'))
);

CREATE TABLE navigation_items (
  item_id uuid NOT NULL DEFAULT gen_random_uuid(),
  site_id uuid NOT NULL,
  menu_id uuid NOT NULL,
  parent_item_id uuid NULL,
  label text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  is_enabled boolean NOT NULL DEFAULT true,
  destination_kind text NOT NULL,
  target_post_id uuid NULL,
  target_category_id uuid NULL,
  target_tag_id uuid NULL,
  target_author_profile_id uuid NULL,
  static_page_key text NULL,
  external_url text NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT pk_navigation_items PRIMARY KEY (item_id),
  CONSTRAINT uq_navigation_items__site_id UNIQUE (site_id, item_id),
  CONSTRAINT uq_navigation_items__site_menu_item UNIQUE (site_id, menu_id, item_id),
  CONSTRAINT fk_navigation_items__menu FOREIGN KEY (site_id, menu_id) REFERENCES navigation_menus(site_id, menu_id),
  CONSTRAINT fk_navigation_items__parent FOREIGN KEY (site_id, menu_id, parent_item_id) REFERENCES navigation_items(site_id, menu_id, item_id),
  CONSTRAINT fk_navigation_items__post FOREIGN KEY (site_id, target_post_id) REFERENCES posts(site_id, post_id),
  CONSTRAINT fk_navigation_items__category FOREIGN KEY (site_id, target_category_id) REFERENCES categories(site_id, category_id),
  CONSTRAINT fk_navigation_items__tag FOREIGN KEY (site_id, target_tag_id) REFERENCES tags(site_id, tag_id),
  CONSTRAINT fk_navigation_items__author FOREIGN KEY (site_id, target_author_profile_id) REFERENCES author_site_profiles(site_id, author_profile_id),
  CONSTRAINT ck_navigation_items__sort_order CHECK (sort_order >= 0),
  CONSTRAINT ck_navigation_items__destination_kind CHECK (destination_kind IN ('HOME','POST','CATEGORY','TAG','AUTHOR','SEARCH','STATIC','EXTERNAL')),
  CONSTRAINT ck_navigation_items__static_page_key CHECK (static_page_key IS NULL OR static_page_key IN ('ABOUT','CONTACT','PRIVACY','TERMS','DISCLAIMER')),
  CONSTRAINT ck_navigation_items__destination_shape CHECK (
    (destination_kind IN ('HOME','SEARCH') AND target_post_id IS NULL AND target_category_id IS NULL AND target_tag_id IS NULL AND target_author_profile_id IS NULL AND static_page_key IS NULL AND external_url IS NULL) OR
    (destination_kind='POST' AND target_post_id IS NOT NULL AND target_category_id IS NULL AND target_tag_id IS NULL AND target_author_profile_id IS NULL AND static_page_key IS NULL AND external_url IS NULL) OR
    (destination_kind='CATEGORY' AND target_post_id IS NULL AND target_category_id IS NOT NULL AND target_tag_id IS NULL AND target_author_profile_id IS NULL AND static_page_key IS NULL AND external_url IS NULL) OR
    (destination_kind='TAG' AND target_post_id IS NULL AND target_category_id IS NULL AND target_tag_id IS NOT NULL AND target_author_profile_id IS NULL AND static_page_key IS NULL AND external_url IS NULL) OR
    (destination_kind='AUTHOR' AND target_post_id IS NULL AND target_category_id IS NULL AND target_tag_id IS NULL AND target_author_profile_id IS NOT NULL AND static_page_key IS NULL AND external_url IS NULL) OR
    (destination_kind='STATIC' AND target_post_id IS NULL AND target_category_id IS NULL AND target_tag_id IS NULL AND target_author_profile_id IS NULL AND static_page_key IS NOT NULL AND external_url IS NULL) OR
    (destination_kind='EXTERNAL' AND target_post_id IS NULL AND target_category_id IS NULL AND target_tag_id IS NULL AND target_author_profile_id IS NULL AND static_page_key IS NULL AND external_url IS NOT NULL)
  )
);
CREATE INDEX ix_navigation_items__site_menu_parent_order ON navigation_items(site_id, menu_id, parent_item_id, sort_order);
CREATE INDEX ix_navigation_items__site_enabled ON navigation_items(site_id, is_enabled);

CREATE TABLE homepage_sections (
  section_id uuid NOT NULL DEFAULT gen_random_uuid(),
  site_id uuid NOT NULL,
  section_key text NOT NULL,
  section_kind text NOT NULL,
  contract_version text NOT NULL,
  position_key text NOT NULL,
  is_enabled boolean NOT NULL DEFAULT true,
  display_label text NULL,
  max_items smallint NULL,
  allow_visibility_edit boolean NOT NULL DEFAULT false,
  allow_label_edit boolean NOT NULL DEFAULT false,
  allow_post_selection boolean NOT NULL DEFAULT false,
  allow_category_selection boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT pk_homepage_sections PRIMARY KEY (section_id),
  CONSTRAINT uq_homepage_sections__site_id UNIQUE (site_id, section_id),
  CONSTRAINT fk_homepage_sections__site FOREIGN KEY (site_id) REFERENCES sites(site_id),
  CONSTRAINT uq_homepage_sections__site_key UNIQUE (site_id, section_key),
  CONSTRAINT ck_homepage_sections__kind CHECK (section_kind IN ('POST_SELECTION','CATEGORY_SELECTION','TOGGLE_ONLY')),
  CONSTRAINT ck_homepage_sections__max_items CHECK (max_items IS NULL OR max_items > 0)
);
CREATE INDEX ix_homepage_sections__site_enabled ON homepage_sections(site_id, is_enabled);

CREATE TABLE homepage_section_posts (
  site_id uuid NOT NULL,
  section_id uuid NOT NULL,
  post_id uuid NOT NULL,
  position integer NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT pk_homepage_section_posts PRIMARY KEY (site_id, section_id, post_id),
  CONSTRAINT uq_homepage_section_posts__position UNIQUE (site_id, section_id, position),
  CONSTRAINT fk_homepage_section_posts__section FOREIGN KEY (site_id, section_id) REFERENCES homepage_sections(site_id, section_id) ON DELETE CASCADE,
  CONSTRAINT fk_homepage_section_posts__post FOREIGN KEY (site_id, post_id) REFERENCES posts(site_id, post_id),
  CONSTRAINT ck_homepage_section_posts__position CHECK (position >= 0)
);
CREATE INDEX ix_homepage_section_posts__site_post ON homepage_section_posts(site_id, post_id);

CREATE TABLE homepage_section_categories (
  site_id uuid NOT NULL,
  section_id uuid NOT NULL,
  category_id uuid NOT NULL,
  position integer NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT pk_homepage_section_categories PRIMARY KEY (site_id, section_id, category_id),
  CONSTRAINT uq_homepage_section_categories__position UNIQUE (site_id, section_id, position),
  CONSTRAINT fk_homepage_section_categories__section FOREIGN KEY (site_id, section_id) REFERENCES homepage_sections(site_id, section_id) ON DELETE CASCADE,
  CONSTRAINT fk_homepage_section_categories__category FOREIGN KEY (site_id, category_id) REFERENCES categories(site_id, category_id),
  CONSTRAINT ck_homepage_section_categories__position CHECK (position >= 0)
);
CREATE INDEX ix_homepage_section_categories__site_category ON homepage_section_categories(site_id, category_id);

COMMIT;
