#!/usr/bin/env bash
set -euo pipefail

: "${POSTGRES_DSN:?POSTGRES_DSN is required}"
command -v psql >/dev/null 2>&1 || { echo "NOT_EXECUTED: psql is not installed" >&2; exit 2; }

args=(-v ON_ERROR_STOP=1)
for i in $(seq -w 1 14); do
  name="SITE_${i}_TIMEZONE"
  value="${!name:-}"
  if [[ -z "$value" ]]; then
    echo "NOT_EXECUTED: $name must be an explicit valid IANA timezone deployment input" >&2
    exit 2
  fi
  args+=( -v "${name}=${value}" )
done

root="$(cd "$(dirname "$0")/../.." && pwd)"
psql "$POSTGRES_DSN" "${args[@]}" -f "$root/database/verification/apply-chain.sql"
