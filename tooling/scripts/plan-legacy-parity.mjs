#!/usr/bin/env node
// Plan only: this command never opens a database connection.
import { pathToFileURL } from "node:url";
import { LEGACY_PARITY, parityStartingConfig } from "../../packages/ts/presentation-catalogue/src/index.ts";

export function legacyParityPlan() {
  return LEGACY_PARITY.map(({ siteKey, name }) => ({ site_key: siteKey, name, presentation: parityStartingConfig(siteKey) }));
}

const literal = value => `'${String(value).replaceAll("'", "''")}'`;
export function legacyParitySql() {
  return [
    "-- Generated from the shared catalogue. Review before explicitly applying to an authorized database.",
    "-- Requires DB-MIG-020 and existing sites/settings. Existing non-NULL configs are always preserved.",
    "\\set ON_ERROR_STOP on", "BEGIN;",
    "DO $$ BEGIN IF current_user <> 'db_site_runtime' THEN RAISE EXCEPTION 'use the RLS-bound db_site_runtime role'; END IF; END $$;",
    ...legacyParityPlan().map(({ site_key, presentation }) => `DO $parity$
DECLARE target uuid; current_config jsonb; version integer;
BEGIN
  SELECT site_id INTO STRICT target FROM sites WHERE site_key=${literal(site_key)};
  PERFORM set_config('app.site_id', target::text, true);
  IF app.current_site_id() IS DISTINCT FROM target THEN RAISE EXCEPTION 'tenant context mismatch'; END IF;
  SELECT presentation_config, presentation_schema_version INTO STRICT current_config, version
    FROM site_settings WHERE site_id=target FOR UPDATE;
  IF current_config IS NOT NULL THEN
    RAISE NOTICE '${site_key}: existing presentation preserved';
  ELSE
    IF version <> 1 THEN RAISE EXCEPTION '${site_key}: unsupported schema version'; END IF;
    UPDATE site_settings SET presentation_config=${literal(JSON.stringify(presentation))}::jsonb,
      presentation_schema_version=1, updated_at=now()
      WHERE site_id=target AND presentation_config IS NULL AND presentation_schema_version=1;
    IF NOT FOUND THEN RAISE EXCEPTION '${site_key}: initialization did not update its settings'; END IF;
  END IF;
END $parity$;`),
    "COMMIT;", "",
  ].join("\n");
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const mode = process.argv[2] ?? "--json";
  if (mode !== "--json" && mode !== "--sql") throw new Error("Usage: node tooling/scripts/plan-legacy-parity.mjs [--json|--sql]");
  process.stdout.write(mode === "--sql" ? legacyParitySql() : `${JSON.stringify(legacyParityPlan(), null, 2)}\n`);
}
