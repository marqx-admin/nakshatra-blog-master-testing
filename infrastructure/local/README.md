# Selective local startup

Dependencies only:
`docker compose -f infrastructure/local/compose.yaml --profile core up -d`

Add optional dependency families with `--profile search`, `--profile media`, `--profile security`, or `--profile observability`.

After the dependency profiles are healthy, run the provider bootstrap once (or repeatedly) before starting the real API:
`uv run --package bp-api python infrastructure/scripts/bootstrap_local.py`

The command creates local-only runtime credential files under `~/.nakshatra-blog-local/`, provisions only the passwords of `db_site_runtime` and `db_platform_runtime`, and ensures the local DynamoDB-compatible security-state table exists. It does not run migrations or start application services.

After migration and bootstrap, start the provider-backed API, Central Admin, and shared public website app with `corepack pnpm dev:full`. The checked-in launcher reads the ignored `infrastructure/local/.env.local`, runs the API on port 8080 (leaving port 8000 for DynamoDB), proxies the Admin on port 5173 to it, and serves registered Hosts on port 3015. A new site's temporary host uses the configured `preview.localhost` suffix; the API constructs its `http://...:3015/` URL from the persisted hostname and platform scheme/port settings. The Admin uses that exact URL. The local suffix needs no `/etc/hosts` edit and is permitted only in development and test environments.

Containerized one-site smoke (when application implementation is available): set `SITE_PACKAGE`, `SITE_DIR`, `SITE_SERVICE_NAME`, and `BP_SITE_APP_KEY`, then add `--profile app-site`. This starts one generic site service only; the other thirteen public apps remain stopped. The site key is diagnostic metadata, never tenant authority.
