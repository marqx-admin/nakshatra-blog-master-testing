# Running on Replit

The default Replit preview runs the Central Admin frontend, the monorepo's main operational UI.

## Run

1. Install the locked JavaScript dependencies with `pnpm install --frozen-lockfile`.
2. Install the locked Python workspace with `uv sync --frozen --all-packages`.
3. Start the development API on port 8000 and the admin frontend on port 5000. The configured `Start application` workflow does both.

The Vite development server listens on `0.0.0.0:5000`, allows Replit's proxied preview host, and proxies `/api` requests to the local FastAPI process.

## Scope

This workflow uses the API's built-in development composition. It supports the unauthenticated access flow without external services. Authenticated and data-backed operations require the production-style PostgreSQL/Redis/search/media services and credentials to be configured separately. The 14 Next.js public sites and Celery worker are not started by default.