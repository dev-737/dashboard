# ============================================
# Stage 1: Dependencies Installation Stage
# ============================================
FROM oven/bun:1-slim AS dependencies
WORKDIR /app

COPY prisma ./prisma
COPY prisma.config.ts ./
COPY package.json bun.lock* ./

RUN --mount=type=cache,target=/root/.bun/install/cache \
    bun install --frozen-lockfile

# ============================================
# Stage 2: Build Next.js application
# ============================================
FROM oven/bun:1-slim AS builder
WORKDIR /app

COPY --from=dependencies /app/node_modules ./node_modules
COPY . .

ENV NODE_ENV=production

RUN bunx prisma generate

RUN --mount=type=cache,target=/app/.next/cache \
    bun run build

# ============================================
# Stage 3: Run Next.js application
# ============================================
FROM oven/bun:1-slim AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

COPY --from=builder --chown=bun:bun /app/public ./public
COPY --from=builder --chown=bun:bun /app/.next/standalone ./
COPY --from=builder --chown=bun:bun /app/.next/static ./.next/static

USER bun

EXPOSE 3000

CMD ["bun", "server.js"]
