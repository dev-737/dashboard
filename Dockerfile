# ============================================
# Stage 1: Dependencies Installation Stage
# ============================================
FROM oven/bun:1 AS dependencies
WORKDIR /app

# Copy package files and schema so any postinstall scripts don't fail
COPY package.json bun.lock* ./
COPY prisma ./prisma
COPY prisma.config.ts ./

RUN --mount=type=cache,target=/root/.bun/install/cache \
    bun install --frozen-lockfile

# ============================================
# Stage 2: Build Next.js application
# ============================================
FROM oven/bun:1 AS builder
WORKDIR /app

COPY --from=dependencies /app/node_modules ./node_modules
COPY . .

RUN bunx prisma generate

ENV NODE_ENV=production

# Build Next.js application (Tracer will now see the generated files in src/)
RUN bun run build

# ============================================
# Stage 3: Run Next.js application
# ============================================
FROM oven/bun:1 AS runner
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
