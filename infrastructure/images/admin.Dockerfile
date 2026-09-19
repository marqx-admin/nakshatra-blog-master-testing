# syntax=docker/dockerfile:1.7
FROM node:24-bookworm-slim AS build
WORKDIR /workspace
RUN corepack enable
RUN corepack prepare pnpm@10.34.5 --activate
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json tsconfig.base.json ./
COPY packages/ts ./packages/ts
COPY apps/admin ./apps/admin
RUN pnpm install --frozen-lockfile
RUN pnpm --filter @bp/admin build

FROM nginxinc/nginx-unprivileged:1.29-alpine AS runtime
COPY infrastructure/images/admin-nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build --chown=10001:10001 /workspace/apps/admin/dist /usr/share/nginx/html
USER 10001:10001
EXPOSE 8080
