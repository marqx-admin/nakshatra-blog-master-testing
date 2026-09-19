# syntax=docker/dockerfile:1.7
FROM python:3.13-slim-bookworm AS build
COPY --from=ghcr.io/astral-sh/uv:0.12.11 /uv /usr/local/bin/uv
RUN apt-get update && apt-get install -y --no-install-recommends libvips42 \
    && rm -rf /var/lib/apt/lists/*
WORKDIR /workspace
COPY pyproject.toml uv.lock ./
COPY apps/api ./apps/api
COPY contracts/http ./contracts/http
COPY config/content ./config/content
COPY packages/python ./packages/python
# Production images must contain installed wheels, not editable workspace links.
# The import smoke gate intentionally makes the image build fail until CHAT01's
# package-installability remediation is integrated.
RUN uv sync --frozen --no-dev --no-editable --package bp-api \
    && uv pip check \
    && .venv/bin/python -c "import importlib; [importlib.import_module(name) for name in ('bp_api','bp_application','bp_domain','bp_ports','bp_adapters.mail','bp_adapters.media','bp_adapters.object_storage','bp_adapters.postgres','bp_adapters.queue','bp_adapters.redis','bp_adapters.search','bp_adapters.secrets','bp_adapters.security_store')]"

FROM python:3.13-slim-bookworm AS runtime
RUN apt-get update && apt-get install -y --no-install-recommends ca-certificates libvips42 libpq5 \
    && rm -rf /var/lib/apt/lists/* \
    && groupadd -g 10001 bp && useradd -r -u 10001 -g bp bp \
    && install -d -o 10001 -g 10001 -m 0700 /run/secrets/bp
WORKDIR /workspace
COPY --from=build /workspace/.venv /workspace/.venv
# Runtime data authorities stay explicit; application/package source trees are
# deliberately not copied because the virtualenv is a non-editable install.
COPY --from=build --chown=10001:10001 /workspace/contracts/http /workspace/contracts/http
COPY --from=build --chown=10001:10001 /workspace/config/content /workspace/config/content
COPY --chown=10001:10001 infrastructure/scripts/runtime_secrets.py /workspace/bin/runtime_secrets.py
COPY --chown=10001:10001 infrastructure/scripts/bootstrap_security_state.py /workspace/bin/bootstrap_security_state.py
COPY --chown=10001:10001 infrastructure/scripts/bootstrap_super_admin.py /workspace/bin/bootstrap_super_admin.py
COPY --chown=10001:10001 infrastructure/scripts/api_start.py /workspace/bin/api_start.py
ENV PATH=/workspace/.venv/bin:$PATH PYTHONUNBUFFERED=1 PYTHONDONTWRITEBYTECODE=1
USER 10001:10001
EXPOSE 8080
ENTRYPOINT ["python", "/workspace/bin/runtime_secrets.py", "--"]
CMD ["python", "/workspace/bin/api_start.py"]
