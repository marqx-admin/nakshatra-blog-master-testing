#!/bin/bash
set -euo pipefail

tls_dir=/var/lib/postgresql/tls
mkdir -p "$tls_dir"
if [ ! -s "$tls_dir/server.key" ] || [ ! -s "$tls_dir/server.crt" ]; then
  openssl req -new -x509 -days 3650 -nodes -text \
    -subj "/CN=postgres" \
    -keyout "$tls_dir/server.key" -out "$tls_dir/server.crt"
  chown postgres:postgres "$tls_dir/server.key" "$tls_dir/server.crt"
  chmod 600 "$tls_dir/server.key"
fi

exec docker-entrypoint.sh "$@" \
  -c ssl=on \
  -c ssl_cert_file="$tls_dir/server.crt" \
  -c ssl_key_file="$tls_dir/server.key"
