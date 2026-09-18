-- BLOG-DOC-08 v1.0-RC1 / DB-MIG-011 audit_deletion_request
BEGIN;

CREATE TABLE audit_events (
  audit_id uuid NOT NULL DEFAULT gen_random_uuid(),
  occurred_at timestamptz NOT NULL DEFAULT now(),
  scope text NOT NULL,
  site_id uuid NULL,
  actor_type text NOT NULL,
  actor_admin_id uuid NULL,
  event_code text NOT NULL,
  module_key text NULL,
  action_key text NULL,
  target_type text NULL,
  target_id uuid NULL,
  request_id text NULL,
  outcome text NOT NULL,
  details jsonb NOT NULL DEFAULT '{}'::jsonb,
  CONSTRAINT pk_audit_events PRIMARY KEY (audit_id),
  CONSTRAINT fk_audit_events__site FOREIGN KEY (site_id) REFERENCES sites(site_id),
  CONSTRAINT fk_audit_events__actor FOREIGN KEY (actor_admin_id) REFERENCES admin_accounts(admin_id),
  CONSTRAINT ck_audit_events__scope CHECK (scope IN ('SITE','GLOBAL')),
  CONSTRAINT ck_audit_events__site_scope CHECK ((scope='SITE' AND site_id IS NOT NULL) OR scope='GLOBAL'),
  CONSTRAINT ck_audit_events__actor CHECK (
    (actor_type='ADMIN' AND actor_admin_id IS NOT NULL) OR
    (actor_type='SYSTEM' AND actor_admin_id IS NULL)
  ),
  CONSTRAINT ck_audit_events__outcome CHECK (outcome IN ('SUCCESS','DENIED','FAILED')),
  CONSTRAINT ck_audit_events__details CHECK (jsonb_typeof(details)='object')
);
CREATE INDEX ix_audit_events__occurred_at ON audit_events(occurred_at DESC);
CREATE INDEX ix_audit_events__site_time ON audit_events(site_id, occurred_at DESC);
CREATE INDEX ix_audit_events__actor_time ON audit_events(actor_admin_id, occurred_at DESC);
CREATE INDEX ix_audit_events__target ON audit_events(target_type, target_id);
CREATE INDEX ix_audit_events__event_code_time ON audit_events(event_code, occurred_at DESC);

CREATE TABLE site_deletion_requests (
  request_id uuid NOT NULL DEFAULT gen_random_uuid(),
  site_id uuid NOT NULL,
  requested_by_admin_id uuid NOT NULL,
  reason text NOT NULL,
  requested_at timestamptz NOT NULL DEFAULT now(),
  closed_at timestamptz NULL,
  closed_by_admin_id uuid NULL,
  resolution_note text NULL,
  CONSTRAINT pk_site_deletion_requests PRIMARY KEY (request_id),
  CONSTRAINT fk_site_deletion_requests__site FOREIGN KEY (site_id) REFERENCES sites(site_id) ON DELETE RESTRICT,
  CONSTRAINT fk_site_deletion_requests__requested_by FOREIGN KEY (requested_by_admin_id) REFERENCES admin_accounts(admin_id),
  CONSTRAINT fk_site_deletion_requests__closed_by FOREIGN KEY (closed_by_admin_id) REFERENCES admin_accounts(admin_id),
  CONSTRAINT ck_site_deletion_requests__reason CHECK (btrim(reason)<>''),
  CONSTRAINT ck_site_deletion_requests__closed_pair CHECK ((closed_at IS NULL AND closed_by_admin_id IS NULL) OR (closed_at IS NOT NULL AND closed_by_admin_id IS NOT NULL))
);
CREATE INDEX ix_site_deletion_requests__site_time ON site_deletion_requests(site_id, requested_at DESC);
CREATE INDEX ix_site_deletion_requests__open ON site_deletion_requests(site_id) WHERE closed_at IS NULL;

COMMIT;
