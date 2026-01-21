# CELLM Oracle - Production Dockerfile
# Multi-stage build for minimal image size

# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy source and build
COPY . .
RUN npm run build

# Stage 2: Production
FROM node:20-alpine

WORKDIR /app

# Copy built output
COPY --from=builder /app/.output .output

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nuxt -u 1001
USER nuxt

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/status || exit 1

# Environment defaults
ENV NODE_ENV=production
ENV NUXT_HOST=0.0.0.0
ENV NUXT_PORT=3000

# Start server
CMD ["node", ".output/server/index.mjs"]
