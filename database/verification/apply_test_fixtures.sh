#!/usr/bin/env bash
set -euo pipefail
: "${POSTGRES_DSN:?POSTGRES_DSN is required}"
command -v psql >/dev/null 2>&1 || { echo "NOT_EXECUTED: psql is not installed" >&2; exit 2; }
root="$(cd "$(dirname "$0")/../.." && pwd)"
psql "$POSTGRES_DSN" -v ON_ERROR_STOP=1 <<SQL
SET ROLE db_migrator;
SELECT set_config('app.environment', 'test', false);
\ir $root/database/seeds/isolation-fixtures.sql
RESET ROLE;
SQL
