# ============================================
# Stage 1: Dependencies Installation Stage
# ============================================
FROM oven/bun:1 AS dependencies
WORKDIR /app

# COPY package files AND the Prisma directory first
COPY package.json bun.lock* ./
COPY prisma ./prisma

# Install dependencies
# (If you have a 'postinstall': 'prisma generate' script in your package.json,
# it will successfully run now because the schema is present)
RUN --mount=type=cache,target=/root/.bun/install/cache \
    bun install --frozen-lockfile

# ============================================
# Stage 2: Build Next.js application
# ============================================
FROM oven/bun:1 AS builder
WORKDIR /app

# Copy project dependencies from dependencies stage
COPY --from=dependencies /app/node_modules ./node_modules

COPY . .

RUN bunx prisma generate

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Build Next.js application
RUN bun run build

# ============================================
# Stage 3: Run Next.js application
# ============================================
FROM oven/bun:1 AS runner
WORKDIR /app

# Set production environment variables
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

COPY --from=builder --chown=bun:bun /app/public ./public
COPY --from=builder --chown=bun:bun /app/.next/standalone ./
COPY --from=builder --chown=bun:bun /app/.next/static ./.next/static

# Switch to non-root user for security best practices
USER bun

EXPOSE 3000

CMD ["bun", "server.js"]
