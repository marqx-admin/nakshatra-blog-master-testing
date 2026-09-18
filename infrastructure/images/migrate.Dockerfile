# syntax=docker/dockerfile:1.7
FROM python:3.13-slim-bookworm
RUN apt-get update && apt-get install -y --no-install-recommends postgresql-client ca-certificates && rm -rf /var/lib/apt/lists/* \
 && groupadd -g 10001 bp && useradd -r -u 10001 -g bp bp \
 && install -d -o 10001 -g 10001 -m 0700 /run/secrets/bp /var/lib/bp-migrations
WORKDIR /workspace
COPY --chown=10001:10001 database /workspace/database
COPY --chown=10001:10001 infrastructure/scripts/migrate.py /workspace/infrastructure/scripts/migrate.py
COPY --chown=10001:10001 infrastructure/scripts/migrate_entrypoint.py /workspace/infrastructure/scripts/migrate_entrypoint.py
COPY --chown=10001:10001 infrastructure/scripts/provision_runtime_roles.py /workspace/infrastructure/scripts/provision_runtime_roles.py
COPY --chown=10001:10001 infrastructure/scripts/runtime_secrets.py /workspace/bin/runtime_secrets.py
USER 10001:10001
ENTRYPOINT ["python", "/workspace/bin/runtime_secrets.py", "--"]
CMD ["python", "/workspace/infrastructure/scripts/migrate_entrypoint.py"]
