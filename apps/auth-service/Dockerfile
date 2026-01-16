# =========================
# Build stage
# =========================
FROM node:22-alpine AS builder

WORKDIR /app

# Instalar pnpm
RUN npm install -g pnpm@9

# Copiar archivos base del monorepo
COPY package.json pnpm-workspace.yaml tsconfig.base.json ./

# 🔽 CAMBIAR SOLO ESTE NOMBRE
ARG SERVICE_NAME=auth-service

# Copiar el servicio y libs compartidas
COPY apps/${SERVICE_NAME} ./apps/${SERVICE_NAME}
COPY libs/shared ./libs/shared

# Instalar dependencias
RUN pnpm install

# Build solo del servicio
RUN pnpm exec nx build ${SERVICE_NAME} --skip-nx-cache


# =========================
# Runtime stage
# =========================
FROM node:22-alpine

WORKDIR /app

# Dependencias mínimas de runtime
RUN apk add --no-cache dumb-init curl

# Usuario no root
RUN addgroup -g 1001 app && \
    adduser -D -u 1001 -G app app

# 🔽 CAMBIAR SOLO ESTE NOMBRE
ARG SERVICE_NAME=auth-service

# Copiar build
COPY --from=builder --chown=app:app /app/dist/apps/${SERVICE_NAME} ./dist
COPY --from=builder --chown=app:app /app/node_modules ./node_modules
COPY --from=builder --chown=app:app /app/package.json ./package.json

USER app

# 🔽 CAMBIAR SOLO EL PUERTO
EXPOSE 3001

# 🔽 AJUSTA EL PUERTO SI CAMBIA
HEALTHCHECK --interval=30s --timeout=3s --retries=3 \
  CMD curl -f http://localhost:3001/api/v1/health || exit 1
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/main.js"]
