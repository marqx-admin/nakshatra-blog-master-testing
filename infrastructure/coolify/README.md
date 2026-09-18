# Coolify deployment runbook

This is the active production target for a Hostinger VPS running Coolify. It deploys the API, Central Admin, 14 independent public sites, seven worker profiles, PostgreSQL with internal TLS, two isolated Redis planes, OpenSearch, private MinIO object storage, and a ScyllaDB Alternator security-state store. No AWS cloud service is required. `boto3` remains only as the protocol client for the self-hosted S3- and Dynamo-compatible services.

## 1. VPS prerequisites

- A Coolify-managed server with enough capacity for 14 Next.js processes, OpenSearch, ScyllaDB, PostgreSQL, and the workers. The checked-in limits are tuned for a low-traffic 8 GB host; use at least 4 vCPU, 8 GB RAM, 4 GB swap, and 150 GB SSD. Scale to 16 GB or more before sustained traffic, large imports, reindexing, or concurrent media processing.
- TCP 80 and 443 open to the VPS. Do not expose PostgreSQL, Redis, MinIO, OpenSearch, or ScyllaDB ports.
- A Git repository containing this directory.

## 2. Create the Coolify resource

1. In Coolify, create a **Docker Compose** application from the Git repository and select `infrastructure/coolify/compose.yaml`.
2. Copy every key from `.env.example` into Coolify's environment-variable screen. Replace all `BP_*` placeholders. Let Coolify generate and persist the empty `SERVICE_*` values, then verify none are blank before deployment.
3. Deploy once. The one-shot `migrate`, `roles`, `minio-init`, and `security-init` services must complete successfully. The migration ledger persists in `migration-ledger` and is reused on later releases.
4. Keep the internal services private. Configure only these public service domains:

The 8 GB profile runs one solo Celery process for each queue, caps the 14 Next.js processes at 160 MiB each, and constrains PostgreSQL, Redis, OpenSearch, MinIO, and ScyllaDB caches. Long-running containers have a combined 7 GiB memory ceiling, leaving about 1 GiB for the OS, Docker, Coolify, and transient bootstrap work. `COMPOSE_PARALLEL_LIMIT=1` also prevents concurrent image builds from exhausting RAM. These settings favor availability over throughput; monitor container OOM/restart counts and move to a larger host before raising worker concurrency.

| Coolify service | Public URL | Internal port |
|---|---|---:|
| `admin` | value of `BP_ADMIN_ORIGIN` | 8080 |
| `api` | value of `BP_MEDIA_ORIGIN` | 8080 |
| `site-01` | `https://WhatsYourRashi.in` | 3000 |
| `site-02` | `https://ApkiRashi.com` | 3000 |
| `site-03` | `https://DailyRashi360.com` | 3000 |
| `site-04` | `https://ZodiacDaily.in` | 3000 |
| `site-05` | `https://DailyHoroscope360.com` | 3000 |
| `site-06` | `https://MyHoroscope360.com` | 3000 |
| `site-07` | `https://AstroToday360.com` | 3000 |
| `site-08` | `https://ApkiKundli.com` | 3000 |
| `site-09` | `https://MatchYourKundli.com` | 3000 |
| `site-10` | `https://ApkaNakshatra.com` | 3000 |
| `site-11` | `https://JaniyePanchang.com` | 3000 |
| `site-12` | `https://RashiRemedies.com` | 3000 |
| `site-13` | `https://ApkaPandit.in` | 3000 |
| `site-14` | `https://VastuShastra360.in` | 3000 |

Coolify domain values must include the internal port suffix when entered, for example `https://admin.example.com:8080` and `https://WhatsYourRashi.in:3000`.

## 3. DNS and release checks

After all services are healthy, add an A record for every public hostname pointing to the Hostinger VPS IPv4 address. Coolify will issue TLS certificates after DNS resolves.

Verify:

```bash
curl -fsS https://media.example.com/health/live
curl -fsS https://media.example.com/health/ready
curl -fsS https://admin.example.com/health/ready
curl -I https://WhatsYourRashi.in/
```

The API readiness response must report all provider components as `ok`. Do not make the MinIO console public. MinIO buckets are created private and media is served only through the site-aware `/m/{site_key}/{media_id}/{variant}.{ext}` gateway.

## 4. Local VS Code validation

Install Docker Desktop or Docker Engine, copy `.env.example` to an ignored local environment file, fill its values, and run from the repository root:

```bash
docker compose --parallel 1 --env-file infrastructure/coolify/.env.local -f infrastructure/coolify/compose.yaml build
docker compose --parallel 1 --env-file infrastructure/coolify/.env.local -f infrastructure/coolify/compose.yaml up
```

On an 8 GB workstation, give the Docker VM about 6 GB and enable swap. Build and start the stack serially; both the explicit `--parallel 1` flag and configured `COMPOSE_PARALLEL_LIMIT=1` protect constrained hosts. Avoid running the Vite development server at the same time as the complete stack.

Use VS Code's Docker extension to inspect the one-shot bootstrap logs and service health. For routine source checks:

```bash
corepack pnpm@10.34.5 install --frozen-lockfile
uv sync --frozen --all-packages
corepack pnpm@10.34.5 -r typecheck
uv run --frozen pytest -q
```

## Backup minimum

Back up `postgres-data`, `migration-ledger`, `minio-data`, and `security-state-data` off-server. Redis and OpenSearch are rebuildable planes but snapshots reduce recovery time. Test a restore before launch.
