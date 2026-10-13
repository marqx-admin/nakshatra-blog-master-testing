# Selective local startup

Dependencies only:
`docker compose -f infrastructure/local/compose.yaml --profile core up -d`

Add optional dependency families with `--profile search`, `--profile media`, `--profile security`, or `--profile observability`.

After the dependency profiles are healthy, run the provider bootstrap once (or repeatedly) before starting the real API:
`uv run --package bp-api python infrastructure/scripts/bootstrap_local.py`

The command creates local-only runtime credential files under `~/.nakshatra-blog-local/`, provisions the passwords of `db_site_runtime` and `db_platform_runtime`, ensures the local security-state table and media bucket exist, and provisions the local Admin account. It does not run migrations or start application services.

After migration and bootstrap, use one provider-backed API, one Central Admin and one Universal Frontend. The current local topology is API `localhost:8001`, Admin `localhost:5173`, Universal `localhost:3015`. If these listeners already exist, reuse them. To start an otherwise stopped stack with that API port, use `BP_HTTP_PORT=8001 corepack pnpm dev:full`. The checked-in launcher reads the ignored `infrastructure/local/.env.local`, uses `BP_HTTP_PORT` (the checked-in local example uses 8080; overriding to 8001 leaves 8000 for DynamoDB), proxies the Admin on port 5173 to it, and serves registered Hosts on port 3015. A new site's temporary host uses the configured `preview.localhost` suffix; the API constructs its `http://...:3015/` URL from the persisted hostname and platform scheme/port settings. The Admin uses that exact URL. The local suffix needs no `/etc/hosts` edit and is permitted only in development and test environments.

Containerized one-site smoke (when application implementation is available): set `SITE_PACKAGE`, `SITE_DIR`, `SITE_SERVICE_NAME`, and `BP_SITE_APP_KEY`, then add `--profile app-site`. This starts one generic site service only; the other thirteen public apps remain stopped. The site key is diagnostic metadata, never tenant authority.

## Existing websites and temporary Host registration

All existing and future sites use the same Universal listener on 3015. Admin no longer uses a `3001–3014` preview map. Those ports and `dev:sites` are only for an explicitly requested legacy parity/rollback investigation, not normal website navigation.

For older local sites that have only canonical production-domain rows, inspect missing local aliases:

```sh
uv run --frozen --all-packages --env-file infrastructure/local/.env.local python infrastructure/scripts/register_local_temporary_domains.py
```

After reviewing the dry run, add only missing aliases by passing `--apply`. The tool requires development/test and a loopback PostgreSQL connection, uses `BP_TEMP_DOMAIN_SUFFIX` (default `preview.localhost`), leaves canonical domains/site content/lifecycles unchanged, and refuses conflicting or deliberately inactive aliases. The existing `BP_POSTGRES_PLATFORM_CREDENTIAL_FILE` may contain a JSON username/password object, `username:password`, or a plain password (default username `db_platform_runtime`). Inserts occur in one transaction. It never edits DNS or a hosts file.

A registered SITE-01 uses `http://site-01.preview.localhost:3015/`; the same rule applies through SITE-14 and arbitrary SITE-N. Newly provisioned websites already receive their own persistent temporary domain from API15-G-011; no alias repair or new process is needed for them. Keep `BP_TEMP_SITE_SCHEME=http` and `BP_TEMP_SITE_PORT=3015` for this local suffix. The server constructs navigation URLs from persisted domain state. Production/staging URL configuration remains separate and unchanged.

New websites stay DISABLED. Normal public requests fail closed. Authorized post preview remains available through a same-site, single-use handoff and host-bound preview session; knowing a temporary URL alone grants no access. Only existing authorized lifecycle activation permits ordinary public testing, with temporary Hosts remaining noindex.

For a separately managed API on 8001, start the Universal process only if 3015 is free: `BP_HTTP_PORT=8001 corepack pnpm dev:public-universal`. An explicit `BP_API_INTERNAL_ORIGIN` takes precedence. Do not launch both this command and `dev:full` for the same listener.
