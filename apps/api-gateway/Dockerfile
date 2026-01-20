# Build Stage
FROM node:22-alpine AS builder

WORKDIR /app

RUN npm install -g pnpm@9.0.0

COPY package.json pnpm-workspace.yaml tsconfig.base.json ./
COPY apps/api-gateway ./apps/api-gateway
COPY libs/shared ./libs/shared

RUN pnpm install
RUN pnpm exec nx build api-gateway --skip-nx-cache


# Runtime Stage
FROM node:22-alpine

WORKDIR /app

RUN apk add --no-cache dumb-init curl

RUN addgroup -g 1001 app && \
    adduser -D -u 1001 -G app app

COPY --from=builder --chown=app:app /app/dist/apps/api-gateway ./dist
COPY --from=builder --chown=app:app /app/node_modules ./node_modules
COPY --from=builder --chown=app:app /app/package.json ./package.json

USER app

EXPOSE 4000

HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:4000/api/v1/health || exit 1

ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/main.js"]
