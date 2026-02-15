# Copilot Instructions for InterChatDashboard

## Project shape (read this first)
- Stack: Next.js App Router + React 19 + TypeScript + tRPC + TanStack Query + Prisma (PostgreSQL) + Better Auth.
- Main boundaries:
  - UI/routes in `src/app/**` (server components by default).
  - Shared UI in `src/components/**`.
  - API contracts in `src/server/routers/**` and `src/server/trpc.ts`.
  - DB access in `src/lib/prisma.ts` and Prisma schema in `prisma/schema.prisma`.
- Session/auth is Better Auth (`src/lib/auth.ts`), not NextAuth. Keep Discord user ID as app user ID (see `databaseHooks.user.create`).

## Data flow conventions
- Prefer tRPC for client-driven data/mutations:
  - Router aggregation: `src/server/routers/index.ts`.
  - App route handler: `src/app/api/trpc/[trpc]/route.ts`.
  - Client provider/context: `src/components/providers/TrpcProvider.tsx` + `src/utils/trpc.ts`.
- Use server actions for server-only integrations and privileged calls (example: Discord guild fetch/token refresh in `src/actions/server-actions.ts`).
- For server-rendered pages with cacheable DB reads, use Next cache directives (`'use cache'`, `cacheLife`, `cacheTag`) like `src/lib/permissions.ts` and `src/lib/hub-queries.ts`.

## Caching and performance patterns
- `next.config.mjs` defines named cache profiles (`user-data`, `hub-data`, etc.) and `cacheComponents: true`; reuse these names when adding cached fetches.
- Redis-backed app cache and rate-limit fallback patterns are centralized:
  - Cache wrapper: `src/lib/performance-cache.ts`
  - Redis manager + failover: `src/lib/redis-config.ts`
  - Rate limiting helpers/tiers: `src/lib/rate-limit.ts`
- Follow existing fallback behavior: Redis failure should degrade gracefully (memory fallback or uncached path), not hard-fail user requests.

## DB + schema rules
- Prisma client is generated into `src/lib/generated/prisma/client` (see `prisma/schema.prisma` generator output).
- Import DB via `db` from `src/lib/prisma.ts` (don’t instantiate a new Prisma client elsewhere).
- Maintain indexed query patterns already modeled in schema (many tables have targeted indexes for timeline/ranking queries).

## Dev workflow (use these commands)
- Package manager is Bun (`packageManager` in `package.json`):
  - `bun dev`, `bun run build`, `bun run start`
  - `bun run lint` (Biome check), `bun run format`, `bun run typecheck`
- Prisma lifecycle:
  - `bunx prisma generate` (also runs on `postinstall`)
  - `bunx prisma migrate dev` / `bunx prisma migrate deploy`
- If making API or type-heavy changes, run at least `bun run typecheck` and `bun run lint` before finishing.

## Style and implementation expectations
- Use `@/*` imports (configured in `tsconfig.json`) instead of deep relative paths.
- Keep formatting/lint aligned with Biome (`biome.jsonc`): single quotes, 2-space indentation, sorted utility classes via `cn`/`cva` patterns.
- Keep route-level auth checks explicit in server components/pages (example: redirect to `/login` in `src/app/dashboard/page.tsx`).
- Prefer extending existing providers/hooks/components before introducing parallel patterns.

## Environment assumptions (common touchpoints)
- Frequently used env vars include: `DATABASE_URL`, `REDIS_URL`, `NEXT_PUBLIC_DISCORD_CLIENT_ID`, `DISCORD_CLIENT_SECRET`, `DISCORD_BOT_TOKEN`, `TOPGG_WEBHOOK_SECRET`, `UPLOADTHING_TOKEN`, `NEXT_PUBLIC_BASE_URL`.
- Instrumentation and Sentry are already wired (`src/instrumentation.ts`, `sentry.*.config.ts`, `next.config.mjs` with `withSentryConfig`); preserve this wiring when changing runtime/bootstrap code.

## Notes for AI agents
- `README.md` contains useful context but parts are outdated (e.g., auth/testing claims). Prefer source-of-truth from current `package.json`, `src/lib/auth.ts`, and `src/server/**`.
- Make minimal, surgical changes in this established codebase; avoid broad refactors unless explicitly requested.
