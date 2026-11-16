# Stage 1: Dependency builder
FROM node:20-alpine AS builder

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm ci --only=production

# Stage 2: Hardened, lightweight runtime
FROM node:20-alpine

# Set non-sensitive environment variables
ENV NODE_ENV=production \
    PORT=5000

WORKDIR /usr/src/app

# Security: Create and use non-root application user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Copy node_modules from builder and application source
COPY --chown=appuser:appgroup --from=builder /usr/src/app/node_modules ./node_modules
COPY --chown=appuser:appgroup . .

# Run as non-root user
USER appuser

EXPOSE 5000

# Docker healthcheck
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:5000/health || exit 1

CMD ["node", "src/server.js"]

