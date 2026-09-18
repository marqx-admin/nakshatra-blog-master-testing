# syntax=docker/dockerfile:1.7
FROM node:24-bookworm-slim AS build
ARG SITE_PACKAGE
ARG SITE_DIR
WORKDIR /workspace
RUN corepack enable
RUN corepack prepare pnpm@10.34.5 --activate
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY packages/ts ./packages/ts
COPY apps/sites ./apps/sites
RUN pnpm install --frozen-lockfile
RUN test -n "$SITE_PACKAGE" && test -n "$SITE_DIR"
RUN pnpm --filter "$SITE_PACKAGE" build

FROM node:24-bookworm-slim AS runtime
ARG SITE_DIR
ENV NODE_ENV=production
RUN groupadd -g 10001 bp && useradd -r -u 10001 -g bp bp
WORKDIR /app
COPY --from=build --chown=10001:10001 /workspace/${SITE_DIR}/.next/standalone ./
COPY --from=build --chown=10001:10001 /workspace/${SITE_DIR}/.next/static ./${SITE_DIR}/.next/static
COPY --from=build --chown=10001:10001 /workspace/${SITE_DIR}/public ./${SITE_DIR}/public
WORKDIR /app/${SITE_DIR}
ENV HOSTNAME=0.0.0.0 PORT=3000
USER 10001:10001
EXPOSE 3000
CMD ["node", "server.js"]
