# syntax=docker/dockerfile:1

# ============================================
# Job na Gringa - Astro SSR with Bun
# Multi-stage build for optimized production
# ============================================

# Base image with latest Bun
FROM oven/bun:alpine AS base

# Set working directory
WORKDIR /app

# Install necessary system dependencies for Sharp (image optimization)
RUN apk add --no-cache \
    libc6-compat \
    vips-dev \
    build-base \
    python3

# ============================================
# Dependencies stage - install all deps
# ============================================
FROM base AS deps

# Copy package files
COPY package.json bun.lock* ./

# Install all dependencies (including devDependencies for build)
RUN bun install --frozen-lockfile

# ============================================
# Builder stage - build the application
# ============================================
FROM base AS builder

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy source code
COPY . .

# Set production environment for build optimizations
ENV NODE_ENV=production

# Build the Astro application
# Bun is compatible with Node.js, so NODE_OPTIONS works
RUN bun run build

# ============================================
# Production stage - minimal runtime image
# ============================================
FROM oven/bun:alpine AS runner

WORKDIR /app

# Install runtime dependencies for Sharp
RUN apk add --no-cache \
    libc6-compat \
    vips

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 astro

# Copy built application
COPY --from=builder --chown=astro:nodejs /app/dist ./dist

# Copy node_modules (needed for Astro SSR runtime)
COPY --from=builder --chown=astro:nodejs /app/node_modules ./node_modules

# Copy package.json (for reference)
COPY --from=builder --chown=astro:nodejs /app/package.json ./package.json

# Set environment variables
ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=4321

# Switch to non-root user
USER astro

# Expose the port
EXPOSE 4321

# Start the Astro SSR server
# The standalone Node adapter creates entry.mjs in dist/server/
CMD ["bun", "run", "./dist/server/entry.mjs"]
