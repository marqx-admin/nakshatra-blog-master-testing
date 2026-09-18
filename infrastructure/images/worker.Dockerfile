# syntax=docker/dockerfile:1.7
FROM python:3.13-slim-bookworm AS build
COPY --from=ghcr.io/astral-sh/uv:0.12.11 /uv /usr/local/bin/uv
RUN apt-get update && apt-get install -y --no-install-recommends libvips42 \
    && rm -rf /var/lib/apt/lists/*
WORKDIR /workspace
COPY pyproject.toml uv.lock ./
COPY apps/worker ./apps/worker
COPY packages/python ./packages/python
# One production Worker image serves every BP_WORKER_PROFILE. Install the
# workspace non-editably so runtime never relies on repository src paths.
RUN uv sync --frozen --no-dev --no-editable --package bp-worker \
    && uv pip check \
    && .venv/bin/python -c "import importlib; [importlib.import_module(name) for name in ('bp_worker','bp_background_contracts','bp_domain','bp_ports','bp_adapters.postgres','bp_adapters.queue','bp_adapters.redis','bp_adapters.search','bp_adapters.object_storage','bp_adapters.media')]"

FROM python:3.13-slim-bookworm AS runtime
RUN apt-get update && apt-get install -y --no-install-recommends ca-certificates libvips42 \
    && rm -rf /var/lib/apt/lists/* \
    && groupadd -g 10001 bp && useradd -r -u 10001 -g bp bp \
    && install -d -o 10001 -g 10001 -m 0700 /run/secrets/bp
WORKDIR /workspace
COPY --from=build /workspace/.venv /workspace/.venv
COPY --chown=10001:10001 infrastructure/scripts/runtime_secrets.py /workspace/bin/runtime_secrets.py
ENV PATH=/workspace/.venv/bin:$PATH PYTHONUNBUFFERED=1 PYTHONDONTWRITEBYTECODE=1
USER 10001:10001
ENTRYPOINT ["python", "/workspace/bin/runtime_secrets.py", "--"]
CMD ["python", "-m", "bp_worker"]
