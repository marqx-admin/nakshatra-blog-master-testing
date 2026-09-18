-- BLOG-DOC-08 v1.0-RC1 / DB-MIG-003 admin_identity_authorization
BEGIN;

CREATE TABLE admin_accounts (
  admin_id uuid NOT NULL DEFAULT gen_random_uuid(),
  email text NOT NULL,
  email_normalized text GENERATED ALWAYS AS (lower(btrim(email))) STORED NOT NULL,
  display_name text NOT NULL,
  status text NOT NULL DEFAULT 'INVITED',
  is_super_admin boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  disabled_at timestamptz NULL,
  CONSTRAINT pk_admin_accounts PRIMARY KEY (admin_id),
  CONSTRAINT uq_admin_accounts__email_normalized UNIQUE (email_normalized),
  CONSTRAINT ck_admin_accounts__status CHECK (status IN ('INVITED','ACTIVE','DISABLED')),
  CONSTRAINT ck_admin_accounts__disabled_at CHECK (
    (status = 'DISABLED' AND disabled_at IS NOT NULL) OR
    (status <> 'DISABLED' AND disabled_at IS NULL)
  )
);
CREATE UNIQUE INDEX uq_admin_accounts__single_super_admin ON admin_accounts(is_super_admin) WHERE is_super_admin;
CREATE INDEX ix_admin_accounts__status ON admin_accounts(status);

CREATE TABLE permissions (
  permission_key text NOT NULL,
  scope text NOT NULL,
  module_key text NOT NULL,
  risk text NOT NULL,
  label text NOT NULL,
  description text NOT NULL,
  seed_version integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT pk_permissions PRIMARY KEY (permission_key),
  CONSTRAINT uq_permissions__key_scope UNIQUE (permission_key, scope),
  CONSTRAINT ck_permissions__scope CHECK (scope IN ('SITE','GLOBAL')),
  CONSTRAINT ck_permissions__risk CHECK (risk IN ('STANDARD','SENSITIVE','DESTRUCTIVE'))
);
CREATE INDEX ix_permissions__scope_module ON permissions(scope, module_key);

CREATE TABLE permission_prerequisites (
  permission_key text NOT NULL,
  required_permission_key text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT pk_permission_prerequisites PRIMARY KEY (permission_key, required_permission_key),
  CONSTRAINT fk_permission_prerequisites__permission FOREIGN KEY (permission_key) REFERENCES permissions(permission_key) ON DELETE RESTRICT,
  CONSTRAINT fk_permission_prerequisites__required FOREIGN KEY (required_permission_key) REFERENCES permissions(permission_key) ON DELETE RESTRICT,
  CONSTRAINT ck_permission_prerequisites__not_self CHECK (permission_key <> required_permission_key)
);
CREATE INDEX ix_permission_prerequisites__required ON permission_prerequisites(required_permission_key);

CREATE TABLE roles (
  role_id uuid NOT NULL DEFAULT gen_random_uuid(),
  scope text NOT NULL,
  name text NOT NULL,
  name_normalized text GENERATED ALWAYS AS (lower(btrim(name))) STORED NOT NULL,
  description text NULL,
  status text NOT NULL DEFAULT 'ACTIVE',
  created_by_admin_id uuid NOT NULL,
  updated_by_admin_id uuid NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  retired_at timestamptz NULL,
  CONSTRAINT pk_roles PRIMARY KEY (role_id),
  CONSTRAINT uq_roles__role_scope UNIQUE (role_id, scope),
  CONSTRAINT uq_roles__scope_name UNIQUE (scope, name_normalized),
  CONSTRAINT fk_roles__created_by FOREIGN KEY (created_by_admin_id) REFERENCES admin_accounts(admin_id),
  CONSTRAINT fk_roles__updated_by FOREIGN KEY (updated_by_admin_id) REFERENCES admin_accounts(admin_id),
  CONSTRAINT ck_roles__scope CHECK (scope IN ('SITE','GLOBAL')),
  CONSTRAINT ck_roles__status CHECK (status IN ('ACTIVE','RETIRED')),
  CONSTRAINT ck_roles__retired_at CHECK (
    (status = 'RETIRED' AND retired_at IS NOT NULL) OR
    (status <> 'RETIRED' AND retired_at IS NULL)
  )
);
CREATE INDEX ix_roles__scope_status ON roles(scope, status);

CREATE TABLE role_permissions (
  role_id uuid NOT NULL,
  permission_key text NOT NULL,
  scope text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT pk_role_permissions PRIMARY KEY (role_id, permission_key),
  CONSTRAINT fk_role_permissions__role_scope FOREIGN KEY (role_id, scope) REFERENCES roles(role_id, scope),
  CONSTRAINT fk_role_permissions__permission_scope FOREIGN KEY (permission_key, scope) REFERENCES permissions(permission_key, scope),
  CONSTRAINT ck_role_permissions__scope CHECK (scope IN ('SITE','GLOBAL'))
);
CREATE INDEX ix_role_permissions__permission_key ON role_permissions(permission_key);

CREATE TABLE account_site_assignments (
  admin_id uuid NOT NULL,
  site_id uuid NOT NULL,
  assigned_by_admin_id uuid NOT NULL,
  assigned_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT pk_account_site_assignments PRIMARY KEY (admin_id, site_id),
  CONSTRAINT fk_account_site_assignments__admin FOREIGN KEY (admin_id) REFERENCES admin_accounts(admin_id) ON DELETE RESTRICT,
  CONSTRAINT fk_account_site_assignments__site FOREIGN KEY (site_id) REFERENCES sites(site_id) ON DELETE RESTRICT,
  CONSTRAINT fk_account_site_assignments__assigned_by FOREIGN KEY (assigned_by_admin_id) REFERENCES admin_accounts(admin_id) ON DELETE RESTRICT
);
CREATE INDEX ix_account_site_assignments__site_id ON account_site_assignments(site_id);

CREATE TABLE account_site_role_assignments (
  assignment_id uuid NOT NULL DEFAULT gen_random_uuid(),
  admin_id uuid NOT NULL,
  site_id uuid NOT NULL,
  role_id uuid NOT NULL,
  scope text NOT NULL DEFAULT 'SITE',
  assigned_by_admin_id uuid NOT NULL,
  assigned_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT pk_account_site_role_assignments PRIMARY KEY (assignment_id),
  CONSTRAINT uq_account_site_role_assignments__admin_site_role UNIQUE (admin_id, site_id, role_id),
  CONSTRAINT fk_account_site_role_assignments__membership FOREIGN KEY (admin_id, site_id) REFERENCES account_site_assignments(admin_id, site_id) ON DELETE CASCADE,
  CONSTRAINT fk_account_site_role_assignments__role_scope FOREIGN KEY (role_id, scope) REFERENCES roles(role_id, scope),
  CONSTRAINT ck_account_site_role_assignments__scope CHECK (scope = 'SITE')
);
CREATE INDEX ix_account_site_role_assignments__admin_site ON account_site_role_assignments(admin_id, site_id);
CREATE INDEX ix_account_site_role_assignments__role ON account_site_role_assignments(role_id);

CREATE TABLE account_global_role_assignments (
  assignment_id uuid NOT NULL DEFAULT gen_random_uuid(),
  admin_id uuid NOT NULL,
  role_id uuid NOT NULL,
  scope text NOT NULL DEFAULT 'GLOBAL',
  assigned_by_admin_id uuid NOT NULL,
  assigned_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT pk_account_global_role_assignments PRIMARY KEY (assignment_id),
  CONSTRAINT uq_account_global_role_assignments__admin_role UNIQUE (admin_id, role_id),
  CONSTRAINT fk_account_global_role_assignments__admin FOREIGN KEY (admin_id) REFERENCES admin_accounts(admin_id),
  CONSTRAINT fk_account_global_role_assignments__role_scope FOREIGN KEY (role_id, scope) REFERENCES roles(role_id, scope),
  CONSTRAINT ck_account_global_role_assignments__scope CHECK (scope = 'GLOBAL')
);
CREATE INDEX ix_account_global_role_assignments__admin ON account_global_role_assignments(admin_id);
CREATE INDEX ix_account_global_role_assignments__role ON account_global_role_assignments(role_id);

COMMIT;
