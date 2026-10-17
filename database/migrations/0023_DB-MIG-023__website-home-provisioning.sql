-- W4: optional initial Home content inside the existing atomic provisioner.
-- No new storage, tenant backfill or broader platform table privileges.
BEGIN;

CREATE FUNCTION app.insert_website_site_baseline(
  target_site_id uuid, actor uuid, presentation jsonb, pages jsonb, home jsonb
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
DECLARE baseline jsonb;
BEGIN
  IF jsonb_typeof(home) IS DISTINCT FROM 'object'
     OR home - 'h1' - 'intro_text' IS DISTINCT FROM '{}'::jsonb
     OR (home ? 'h1' AND jsonb_typeof(home->'h1') IS DISTINCT FROM 'string')
     OR (home ? 'intro_text' AND jsonb_typeof(home->'intro_text') IS DISTINCT FROM 'string')
     OR COALESCE(length(home->>'h1'),0)>200
     OR COALESCE(length(home->>'intro_text'),0)>12000
     OR (COALESCE(home->>'h1','') || COALESCE(home->>'intro_text','')) ~ '[<>]'
     OR (COALESCE(home->>'h1','') || COALESCE(home->>'intro_text','')) ~* '\[(Website Name|Primary Topic|Approved Topic|Topic|approved [^]]+|Owner[^]]*|email[^]]*)\]'
  THEN
    RAISE EXCEPTION 'initial homepage requires resolved plain text' USING ERRCODE='22023';
  END IF;
  -- The unchanged four-argument bridge enforces active Super Admin, DISABLED
  -- target, no existing baseline, and transaction-local FORCE-RLS context.
  baseline := app.insert_website_site_baseline(target_site_id,actor,presentation,pages);
  PERFORM set_config('app.site_id',target_site_id::text,true);
  UPDATE public.site_settings SET
    homepage_h1=NULLIF(home->>'h1',''),
    homepage_intro_text=NULLIF(home->>'intro_text','')
  WHERE site_id=target_site_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'new website settings missing' USING ERRCODE='23503';
  END IF;
  RETURN baseline;
END
$$;

REVOKE ALL ON FUNCTION app.insert_website_site_baseline(uuid,uuid,jsonb,jsonb,jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION app.insert_website_site_baseline(uuid,uuid,jsonb,jsonb,jsonb) TO db_platform_runtime;

COMMIT;
