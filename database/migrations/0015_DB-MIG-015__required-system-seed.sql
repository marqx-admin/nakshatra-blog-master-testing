-- BLOG-DOC-08 v1.0-RC1 / DB-MIG-015 required_system_seed
-- BLOG-DOC-08 Appendix B / DOC-02 Sections 9-10. Idempotent production-safe fixed registry.
BEGIN;

INSERT INTO permissions(permission_key, scope, module_key, risk, label, description, seed_version) VALUES
  ('dashboard.view', 'SITE', 'Dashboard', 'STANDARD', 'Dashboard View', 'View selected-site dashboard and approved site metrics.', 1),
  ('posts.view', 'SITE', 'Posts', 'STANDARD', 'Posts View', 'List/read posts and editorial metadata within the active site.', 1),
  ('posts.create', 'SITE', 'Posts', 'STANDARD', 'Posts Create', 'Create a new post draft in the active site.', 1),
  ('posts.edit', 'SITE', 'Posts', 'STANDARD', 'Posts Edit', 'Edit editable fields on an existing site-owned post.', 1),
  ('posts.duplicate', 'SITE', 'Posts', 'STANDARD', 'Posts Duplicate', 'Create a new draft from an existing post in the same site.', 1),
  ('posts.revisions.view', 'SITE', 'Posts', 'STANDARD', 'Posts Revisions View', 'View revision history for site-owned posts.', 1),
  ('posts.preview', 'SITE', 'Posts', 'SENSITIVE', 'Posts Preview', 'Open controlled preview for non-public post states.', 1),
  ('posts.revisions.restore', 'SITE', 'Posts', 'SENSITIVE', 'Posts Revisions Restore', 'Restore a prior revision as a new current state under revision rules.', 1),
  ('posts.publish', 'SITE', 'Posts', 'SENSITIVE', 'Posts Publish', 'Publish an eligible post.', 1),
  ('posts.schedule', 'SITE', 'Posts', 'SENSITIVE', 'Posts Schedule', 'Create/change/remove an approved publication schedule.', 1),
  ('posts.archive', 'SITE', 'Posts', 'SENSITIVE', 'Posts Archive', 'Archive eligible published/content records.', 1),
  ('posts.restore', 'SITE', 'Posts', 'SENSITIVE', 'Posts Restore', 'Restore an eligible trashed post.', 1),
  ('posts.trash', 'SITE', 'Posts', 'DESTRUCTIVE', 'Posts Trash', 'Move an eligible post to Trash.', 1),
  ('posts.delete', 'SITE', 'Posts', 'DESTRUCTIVE', 'Posts Delete', 'Permanently delete an eligible trashed post when later content/security rules permit.', 1),
  ('categories.view', 'SITE', 'Categories', 'STANDARD', 'Categories View', 'List/read categories in the active site.', 1),
  ('categories.create', 'SITE', 'Categories', 'STANDARD', 'Categories Create', 'Create a category in the active site.', 1),
  ('categories.edit', 'SITE', 'Categories', 'STANDARD', 'Categories Edit', 'Edit a site-owned category.', 1),
  ('categories.delete', 'SITE', 'Categories', 'DESTRUCTIVE', 'Categories Delete', 'Delete/retire a category when relationship rules allow.', 1),
  ('tags.view', 'SITE', 'Tags', 'STANDARD', 'Tags View', 'List/read tags in the active site.', 1),
  ('tags.create', 'SITE', 'Tags', 'STANDARD', 'Tags Create', 'Create a tag in the active site.', 1),
  ('tags.edit', 'SITE', 'Tags', 'STANDARD', 'Tags Edit', 'Edit a site-owned tag.', 1),
  ('tags.delete', 'SITE', 'Tags', 'DESTRUCTIVE', 'Tags Delete', 'Delete/retire a tag when relationship rules allow.', 1),
  ('authors.view', 'SITE', 'Authors', 'STANDARD', 'Authors View', 'List/read author records/site profiles available to the active site.', 1),
  ('authors.create', 'SITE', 'Authors', 'STANDARD', 'Authors Create', 'Create an author/site-profile association according to content rules.', 1),
  ('authors.edit', 'SITE', 'Authors', 'STANDARD', 'Authors Edit', 'Edit allowed author/site-profile fields.', 1),
  ('authors.retire', 'SITE', 'Authors', 'SENSITIVE', 'Authors Retire', 'Retire an author from new use without breaking historical attribution.', 1),
  ('media.view', 'SITE', 'Media', 'STANDARD', 'Media View', 'List/read site-owned media metadata and usage.', 1),
  ('media.upload', 'SITE', 'Media', 'STANDARD', 'Media Upload', 'Upload a new media object into the active site namespace.', 1),
  ('media.edit', 'SITE', 'Media', 'STANDARD', 'Media Edit', 'Edit media metadata such as alt/caption/credit where allowed.', 1),
  ('media.replace', 'SITE', 'Media', 'SENSITIVE', 'Media Replace', 'Replace media binary/variants under media safety rules.', 1),
  ('media.delete', 'SITE', 'Media', 'DESTRUCTIVE', 'Media Delete', 'Delete eligible site-owned media when usage rules allow.', 1),
  ('navigation.view', 'SITE', 'Navigation', 'STANDARD', 'Navigation View', 'View menus/navigation configuration for the active site.', 1),
  ('navigation.manage', 'SITE', 'Navigation', 'SENSITIVE', 'Navigation Manage', 'Create/edit/reorder/remove approved navigation entries.', 1),
  ('seo.view', 'SITE', 'SEO', 'STANDARD', 'Seo View', 'View site/post SEO metadata and SEO configuration.', 1),
  ('seo.edit', 'SITE', 'SEO', 'SENSITIVE', 'Seo Edit', 'Edit allowed site/post SEO metadata and settings.', 1),
  ('redirects.view', 'SITE', 'Redirects', 'STANDARD', 'Redirects View', 'View site-owned redirect rules.', 1),
  ('redirects.create', 'SITE', 'Redirects', 'SENSITIVE', 'Redirects Create', 'Create a redirect in the active site.', 1),
  ('redirects.edit', 'SITE', 'Redirects', 'SENSITIVE', 'Redirects Edit', 'Edit a site-owned redirect.', 1),
  ('redirects.delete', 'SITE', 'Redirects', 'DESTRUCTIVE', 'Redirects Delete', 'Remove an eligible site-owned redirect.', 1),
  ('search.view', 'SITE', 'Search', 'STANDARD', 'Search View', 'View site search configuration/status and permitted diagnostics.', 1),
  ('search.reindex', 'SITE', 'Search', 'SENSITIVE', 'Search Reindex', 'Request a site-scoped reindex operation.', 1),
  ('calendar.view', 'SITE', 'Editorial Calendar', 'STANDARD', 'Calendar View', 'View the active site editorial calendar.', 1),
  ('site_settings.view', 'SITE', 'Site Settings', 'STANDARD', 'Site Settings View', 'View editable site-level settings.', 1),
  ('site_settings.edit', 'SITE', 'Site Settings', 'SENSITIVE', 'Site Settings Edit', 'Edit approved site-level settings; never arbitrary frontend code/tokens.', 1),
  ('network_dashboard.view', 'GLOBAL', 'Network', 'STANDARD', 'Network Dashboard View', 'View approved all-sites operational summary.', 1),
  ('sites.view', 'GLOBAL', 'Sites', 'STANDARD', 'Sites View', 'View website/domain registry and lifecycle states.', 1),
  ('sites.create', 'GLOBAL', 'Sites', 'SENSITIVE', 'Sites Create', 'Create a new site registry entry under platform rules.', 1),
  ('sites.edit', 'GLOBAL', 'Sites', 'SENSITIVE', 'Sites Edit', 'Edit approved site metadata that does not bypass domain/lifecycle controls.', 1),
  ('sites.enable', 'GLOBAL', 'Sites', 'SENSITIVE', 'Sites Enable', 'Enable an eligible disabled site.', 1),
  ('sites.disable', 'GLOBAL', 'Sites', 'DESTRUCTIVE', 'Sites Disable', 'Disable an active site under lifecycle rules.', 1),
  ('sites.archive', 'GLOBAL', 'Sites', 'DESTRUCTIVE', 'Sites Archive', 'Archive an eligible site.', 1),
  ('sites.deletion_request', 'GLOBAL', 'Sites', 'DESTRUCTIVE', 'Sites Deletion Request', 'Create/advance a controlled site-deletion request; not direct hard delete.', 1),
  ('sites.manage_domains', 'GLOBAL', 'Sites', 'DESTRUCTIVE', 'Sites Manage Domains', 'Add/change/remove approved domain mappings and aliases.', 1),
  ('admin_users.view', 'GLOBAL', 'Admin Users', 'STANDARD', 'Admin Users View', 'View Admin account identities and authority summaries.', 1),
  ('admin_users.invite', 'GLOBAL', 'Admin Users', 'SENSITIVE', 'Admin Users Invite', 'Invite/create a new non-Super-Admin account.', 1),
  ('admin_users.edit', 'GLOBAL', 'Admin Users', 'SENSITIVE', 'Admin Users Edit', 'Edit allowed account identity/profile fields, excluding unauthorized privilege changes.', 1),
  ('admin_users.enable', 'GLOBAL', 'Admin Users', 'SENSITIVE', 'Admin Users Enable', 'Re-enable an eligible disabled account.', 1),
  ('admin_users.disable', 'GLOBAL', 'Admin Users', 'DESTRUCTIVE', 'Admin Users Disable', 'Disable an eligible Admin account.', 1),
  ('admin_users.manage_site_assignments', 'GLOBAL', 'Admin Users', 'DESTRUCTIVE', 'Admin Users Manage Site Assignments', 'Add/remove explicit account-site assignments, subject to privilege ceiling.', 1),
  ('roles.view', 'GLOBAL', 'Roles', 'STANDARD', 'Roles View', 'View role definitions, scopes and permission composition.', 1),
  ('roles.create', 'GLOBAL', 'Roles', 'SENSITIVE', 'Roles Create', 'Create a role within actor privilege ceiling.', 1),
  ('roles.edit', 'GLOBAL', 'Roles', 'DESTRUCTIVE', 'Roles Edit', 'Edit role metadata/permissions within actor privilege ceiling.', 1),
  ('roles.retire', 'GLOBAL', 'Roles', 'DESTRUCTIVE', 'Roles Retire', 'Retire an eligible role after assignment resolution.', 1),
  ('roles.assign', 'GLOBAL', 'Roles', 'DESTRUCTIVE', 'Roles Assign', 'Assign/unassign GLOBAL or SITE roles subject to scope and privilege-ceiling rules.', 1),
  ('audit.view', 'GLOBAL', 'Audit', 'SENSITIVE', 'Audit View', 'View authorized immutable audit history.', 1),
  ('audit.export', 'GLOBAL', 'Audit', 'SENSITIVE', 'Audit Export', 'Export approved audit records under privacy/security rules.', 1),
  ('platform_settings.view', 'GLOBAL', 'Platform Settings', 'SENSITIVE', 'Platform Settings View', 'View approved global platform settings.', 1),
  ('platform_settings.edit', 'GLOBAL', 'Platform Settings', 'DESTRUCTIVE', 'Platform Settings Edit', 'Edit approved global platform settings.', 1),
  ('permissions.view', 'GLOBAL', 'Permissions', 'STANDARD', 'Permissions View', 'View fixed permission registry and help metadata.', 1)
ON CONFLICT (permission_key) DO UPDATE SET
  scope=EXCLUDED.scope, module_key=EXCLUDED.module_key, risk=EXCLUDED.risk,
  label=EXCLUDED.label, description=EXCLUDED.description, seed_version=EXCLUDED.seed_version;

INSERT INTO permission_prerequisites(permission_key, required_permission_key) VALUES
  ('admin_users.disable', 'admin_users.view'),
  ('admin_users.edit', 'admin_users.view'),
  ('admin_users.enable', 'admin_users.view'),
  ('admin_users.invite', 'admin_users.view'),
  ('admin_users.manage_site_assignments', 'admin_users.view'),
  ('audit.export', 'audit.view'),
  ('authors.create', 'authors.view'),
  ('authors.edit', 'authors.view'),
  ('authors.retire', 'authors.view'),
  ('categories.create', 'categories.view'),
  ('categories.delete', 'categories.view'),
  ('categories.edit', 'categories.view'),
  ('media.delete', 'media.view'),
  ('media.edit', 'media.view'),
  ('media.replace', 'media.view'),
  ('media.upload', 'media.view'),
  ('navigation.manage', 'navigation.view'),
  ('platform_settings.edit', 'platform_settings.view'),
  ('posts.archive', 'posts.edit'),
  ('posts.archive', 'posts.view'),
  ('posts.create', 'posts.view'),
  ('posts.delete', 'posts.view'),
  ('posts.duplicate', 'posts.create'),
  ('posts.duplicate', 'posts.view'),
  ('posts.edit', 'posts.view'),
  ('posts.publish', 'posts.edit'),
  ('posts.publish', 'posts.view'),
  ('posts.restore', 'posts.edit'),
  ('posts.restore', 'posts.view'),
  ('posts.revisions.restore', 'posts.edit'),
  ('posts.revisions.restore', 'posts.revisions.view'),
  ('posts.revisions.restore', 'posts.view'),
  ('posts.revisions.view', 'posts.view'),
  ('posts.schedule', 'posts.edit'),
  ('posts.schedule', 'posts.view'),
  ('posts.trash', 'posts.edit'),
  ('posts.trash', 'posts.view'),
  ('redirects.create', 'redirects.view'),
  ('redirects.delete', 'redirects.view'),
  ('redirects.edit', 'redirects.view'),
  ('roles.assign', 'roles.view'),
  ('roles.create', 'roles.view'),
  ('roles.edit', 'roles.view'),
  ('roles.retire', 'roles.view'),
  ('search.reindex', 'search.view'),
  ('seo.edit', 'seo.view'),
  ('site_settings.edit', 'site_settings.view'),
  ('sites.archive', 'sites.view'),
  ('sites.create', 'sites.view'),
  ('sites.deletion_request', 'sites.view'),
  ('sites.disable', 'sites.view'),
  ('sites.edit', 'sites.view'),
  ('sites.enable', 'sites.view'),
  ('sites.manage_domains', 'sites.view'),
  ('tags.create', 'tags.view'),
  ('tags.delete', 'tags.view'),
  ('tags.edit', 'tags.view')
ON CONFLICT (permission_key, required_permission_key) DO NOTHING;

COMMIT;
-- BLOG-DOC-08 Appendix D. Requires explicit per-site IANA timezone GUC inputs.
-- Set app.bootstrap_timezone_site_01 through app.bootstrap_timezone_site_14 explicitly before execution.
BEGIN;

DO $$
DECLARE n integer; key text; tz text; guc text;
BEGIN
  FOR n IN 1..14 LOOP
    key := format('SITE-%s', lpad(n::text,2,'0'));
    guc := format('app.bootstrap_timezone_site_%s', lpad(n::text,2,'0'));
    tz := current_setting(guc, true);
    IF tz IS NULL OR btrim(tz) = '' THEN
      RAISE EXCEPTION 'missing required timezone bootstrap input for % (%)', key, guc;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_timezone_names WHERE name = tz) THEN
      RAISE EXCEPTION 'invalid IANA timezone bootstrap input for %: %', key, tz;
    END IF;
  END LOOP;
END $$;

INSERT INTO sites(site_id, site_key, display_name, status, timezone_id) VALUES
  ('10000000-0000-4000-8000-000000000001'::uuid, 'SITE-01', 'WhatsYourRashi', 'ACTIVE', current_setting('app.bootstrap_timezone_site_01', true)),
  ('10000000-0000-4000-8000-000000000002'::uuid, 'SITE-02', 'ApkiRashi', 'ACTIVE', current_setting('app.bootstrap_timezone_site_02', true)),
  ('10000000-0000-4000-8000-000000000003'::uuid, 'SITE-03', 'DailyRashi360', 'ACTIVE', current_setting('app.bootstrap_timezone_site_03', true)),
  ('10000000-0000-4000-8000-000000000004'::uuid, 'SITE-04', 'ZodiacDaily', 'ACTIVE', current_setting('app.bootstrap_timezone_site_04', true)),
  ('10000000-0000-4000-8000-000000000005'::uuid, 'SITE-05', 'DailyHoroscope360', 'ACTIVE', current_setting('app.bootstrap_timezone_site_05', true)),
  ('10000000-0000-4000-8000-000000000006'::uuid, 'SITE-06', 'MyHoroscope360', 'ACTIVE', current_setting('app.bootstrap_timezone_site_06', true)),
  ('10000000-0000-4000-8000-000000000007'::uuid, 'SITE-07', 'AstroToday360', 'ACTIVE', current_setting('app.bootstrap_timezone_site_07', true)),
  ('10000000-0000-4000-8000-000000000008'::uuid, 'SITE-08', 'ApkiKundli', 'ACTIVE', current_setting('app.bootstrap_timezone_site_08', true)),
  ('10000000-0000-4000-8000-000000000009'::uuid, 'SITE-09', 'MatchYourKundli', 'ACTIVE', current_setting('app.bootstrap_timezone_site_09', true)),
  ('10000000-0000-4000-8000-000000000010'::uuid, 'SITE-10', 'ApkaNakshatra', 'ACTIVE', current_setting('app.bootstrap_timezone_site_10', true)),
  ('10000000-0000-4000-8000-000000000011'::uuid, 'SITE-11', 'JaniyePanchang', 'ACTIVE', current_setting('app.bootstrap_timezone_site_11', true)),
  ('10000000-0000-4000-8000-000000000012'::uuid, 'SITE-12', 'RashiRemedies', 'ACTIVE', current_setting('app.bootstrap_timezone_site_12', true)),
  ('10000000-0000-4000-8000-000000000013'::uuid, 'SITE-13', 'ApkaPandit', 'ACTIVE', current_setting('app.bootstrap_timezone_site_13', true)),
  ('10000000-0000-4000-8000-000000000014'::uuid, 'SITE-14', 'VastuShastra360', 'ACTIVE', current_setting('app.bootstrap_timezone_site_14', true))
ON CONFLICT (site_key) DO UPDATE SET
  display_name=EXCLUDED.display_name, status=EXCLUDED.status, timezone_id=EXCLUDED.timezone_id, updated_at=now();

INSERT INTO domains(site_id, hostname, is_canonical, is_active) VALUES
  ('10000000-0000-4000-8000-000000000001'::uuid, 'WhatsYourRashi.in', true, true),
  ('10000000-0000-4000-8000-000000000002'::uuid, 'ApkiRashi.com', true, true),
  ('10000000-0000-4000-8000-000000000003'::uuid, 'DailyRashi360.com', true, true),
  ('10000000-0000-4000-8000-000000000004'::uuid, 'ZodiacDaily.in', true, true),
  ('10000000-0000-4000-8000-000000000005'::uuid, 'DailyHoroscope360.com', true, true),
  ('10000000-0000-4000-8000-000000000006'::uuid, 'MyHoroscope360.com', true, true),
  ('10000000-0000-4000-8000-000000000007'::uuid, 'AstroToday360.com', true, true),
  ('10000000-0000-4000-8000-000000000008'::uuid, 'ApkiKundli.com', true, true),
  ('10000000-0000-4000-8000-000000000009'::uuid, 'MatchYourKundli.com', true, true),
  ('10000000-0000-4000-8000-000000000010'::uuid, 'ApkaNakshatra.com', true, true),
  ('10000000-0000-4000-8000-000000000011'::uuid, 'JaniyePanchang.com', true, true),
  ('10000000-0000-4000-8000-000000000012'::uuid, 'RashiRemedies.com', true, true),
  ('10000000-0000-4000-8000-000000000013'::uuid, 'ApkaPandit.in', true, true),
  ('10000000-0000-4000-8000-000000000014'::uuid, 'VastuShastra360.in', true, true)
ON CONFLICT (hostname_normalized) DO UPDATE SET site_id=EXCLUDED.site_id, hostname=EXCLUDED.hostname, is_canonical=true, is_active=true, updated_at=now();

INSERT INTO site_settings(site_id) SELECT site_id FROM sites WHERE site_key ~ '^SITE-(0[1-9]|1[0-4])$' ON CONFLICT (site_id) DO NOTHING;

INSERT INTO navigation_menus(site_id, menu_key) SELECT site_id, k FROM sites CROSS JOIN (VALUES ('HEADER'),('FOOTER')) AS x(k) WHERE site_key ~ '^SITE-(0[1-9]|1[0-4])$' ON CONFLICT (site_id, menu_key) DO NOTHING;

COMMIT;
