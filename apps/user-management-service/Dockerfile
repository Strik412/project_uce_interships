# Build Stage
FROM node:22-alpine AS builder

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm@9.0.0

# Copy root workspace files
COPY package.json pnpm-workspace.yaml ./
COPY tsconfig.base.json ./

# Copy service and shared library
COPY apps/user-management-service ./apps/user-management-service
COPY libs/shared ./libs/shared

# Install all dependencies
RUN pnpm install

# Build application using Nx
RUN pnpm exec nx build user-management-service --skip-nx-cache


# Runtime Stage
FROM node:22-alpine

WORKDIR /app

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init curl

# Create non-root user
RUN addgroup -g 1001 app && \
    adduser -D -u 1001 -G app app

# Copy only necessary files from builder
COPY --from=builder --chown=app:app /app/dist/apps/user-management-service ./dist
COPY --from=builder --chown=app:app /app/node_modules ./node_modules

# Switch to non-root user
USER app

# Expose port
EXPOSE 3002

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:3002/api/v1/health || exit 1

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/main.js"]
