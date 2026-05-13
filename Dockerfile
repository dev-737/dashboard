# syntax=docker/dockerfile:1.7

# ============================================
# Stage 1: Dependencies
# ============================================
FROM oven/bun:1-slim AS deps
WORKDIR /app

# Copy only dependency-related files first
COPY package.json bun.lock* ./
COPY prisma ./prisma
COPY prisma.config.ts ./


RUN --mount=type=cache,target=/root/.bun/install/cache \
    --mount=type=secret,id=DATABASE_URL \
    export DATABASE_URL="$(cat /run/secrets/DATABASE_URL)" && \
    bun install --frozen-lockfile

# ============================================
# Stage 2: Builder
# ============================================
FROM oven/bun:1-slim AS builder
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Reuse installed deps
COPY --from=deps /app/node_modules ./node_modules

# Copy only needed source files
COPY . .

# Prisma generate only if schema changed

RUN --mount=type=secret,id=DATABASE_URL \
    bunx prisma generate

# Cache Next build artifacts
RUN --mount=type=cache,target=/app/.next/cache \
    bun run build

# ============================================
# Stage 3: Runtime
# ============================================
FROM oven/bun:1-slim AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Standalone output only
COPY --from=builder --chown=bun:bun /app/.next/standalone ./
COPY --from=builder --chown=bun:bun /app/.next/static ./.next/static
COPY --from=builder --chown=bun:bun /app/public ./public

USER bun

EXPOSE 3000

CMD ["bun", "server.js"]
