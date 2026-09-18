FROM postgres:17-bookworm
RUN apt-get update && apt-get install -y --no-install-recommends openssl \
    && rm -rf /var/lib/apt/lists/*
COPY infrastructure/coolify/postgres-entrypoint.sh /usr/local/bin/bp-postgres-entrypoint
ENTRYPOINT ["bp-postgres-entrypoint"]
CMD ["postgres"]
