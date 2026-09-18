-- BLOG-DOC-08 v1.0-RC1 / DB-MIG-006 post_relationships
BEGIN;

CREATE TABLE post_categories (
  site_id uuid NOT NULL,
  post_id uuid NOT NULL,
  category_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT pk_post_categories PRIMARY KEY (site_id, post_id, category_id),
  CONSTRAINT fk_post_categories__post FOREIGN KEY (site_id, post_id) REFERENCES posts(site_id, post_id) ON DELETE CASCADE,
  CONSTRAINT fk_post_categories__category FOREIGN KEY (site_id, category_id) REFERENCES categories(site_id, category_id) ON DELETE RESTRICT
);
CREATE INDEX ix_post_categories__site_category ON post_categories(site_id, category_id);

CREATE TABLE post_tags (
  site_id uuid NOT NULL,
  post_id uuid NOT NULL,
  tag_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT pk_post_tags PRIMARY KEY (site_id, post_id, tag_id),
  CONSTRAINT fk_post_tags__post FOREIGN KEY (site_id, post_id) REFERENCES posts(site_id, post_id) ON DELETE CASCADE,
  CONSTRAINT fk_post_tags__tag FOREIGN KEY (site_id, tag_id) REFERENCES tags(site_id, tag_id) ON DELETE RESTRICT
);
CREATE INDEX ix_post_tags__site_tag ON post_tags(site_id, tag_id);

CREATE TABLE post_related_posts (
  site_id uuid NOT NULL,
  post_id uuid NOT NULL,
  related_post_id uuid NOT NULL,
  position integer NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT pk_post_related_posts PRIMARY KEY (site_id, post_id, related_post_id),
  CONSTRAINT uq_post_related_posts__site_post_position UNIQUE (site_id, post_id, position),
  CONSTRAINT fk_post_related_posts__source FOREIGN KEY (site_id, post_id) REFERENCES posts(site_id, post_id) ON DELETE CASCADE,
  CONSTRAINT fk_post_related_posts__target FOREIGN KEY (site_id, related_post_id) REFERENCES posts(site_id, post_id) ON DELETE RESTRICT,
  CONSTRAINT ck_post_related_posts__not_self CHECK (post_id <> related_post_id),
  CONSTRAINT ck_post_related_posts__position CHECK (position >= 0)
);
CREATE INDEX ix_post_related_posts__site_related ON post_related_posts(site_id, related_post_id);

COMMIT;
