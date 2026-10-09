# syntax=docker/dockerfile:1.7
# One generic public image for all registered Hosts. Tenant identity is resolved by the API.
FROM node:24-bookworm-slim AS build
ENV NODE_OPTIONS=--max-old-space-size=512
WORKDIR /workspace
RUN corepack enable
RUN corepack prepare pnpm@10.34.5 --activate
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json tsconfig.base.json ./
COPY packages/ts ./packages/ts
COPY apps/public-universal ./apps/public-universal
RUN pnpm install --frozen-lockfile
RUN pnpm --filter @bp/public-universal build

FROM node:24-bookworm-slim AS runtime
ENV NODE_ENV=production
ENV NODE_OPTIONS=--max-old-space-size=96
RUN groupadd -g 10001 bp && useradd -r -u 10001 -g bp bp
WORKDIR /app
COPY --from=build --chown=10001:10001 /workspace/apps/public-universal/.next/standalone ./
COPY --from=build --chown=10001:10001 /workspace/apps/public-universal/.next/static ./apps/public-universal/.next/static
WORKDIR /app/apps/public-universal
ENV HOSTNAME=0.0.0.0 PORT=3000
USER 10001:10001
EXPOSE 3000
CMD ["node", "server.js"]
