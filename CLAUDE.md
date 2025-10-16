# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

InterChat Web Dashboard - A Next.js 15 web application providing hub management, analytics, and administrative tools for the InterChat Discord bot platform. Built with React 19, TypeScript, tRPC, and Prisma.

## Technology Stack

- **Framework**: Next.js 15 with App Router
- **Frontend**: React 19, TypeScript
- **Styling**: Tailwind CSS 4, Radix UI components
- **API**: tRPC for type-safe client-server communication
- **Database**: Prisma ORM with PostgreSQL
- **Authentication**: NextAuth.js v5 with Discord OAuth
- **State Management**: TanStack Query (via tRPC)
- **Linting/Formatting**: Biome (single quotes, 2-space indentation)
- **Monitoring**: Sentry for error tracking
- **File Uploads**: UploadThing

## Common Development Commands

### Development
```bash
npm run dev          # Start development server (localhost:3000)
npm run build        # Build for production
npm run start        # Start production server
```

### Code Quality
```bash
npm run typecheck    # TypeScript type checking
npm run lint         # Run Biome linter
npm run format       # Format code with Biome
```

### Analysis and Performance
```bash
npm run analyze      # Analyze bundle size (sets ANALYZE=true)
npm run perf:test    # Run performance tests
```

### Database Operations

**Prisma Commands** (run from projects/web/):
```bash
npx prisma generate              # Generate Prisma client (runs automatically on npm install)
npx prisma studio                # Open Prisma Studio (database GUI)
npx prisma migrate dev           # Create and apply migration
npx prisma migrate dev --name "migration_name"  # Create named migration
npx prisma migrate deploy        # Apply migrations in production
npx prisma migrate reset         # Reset database and apply all migrations
npx prisma db push               # Push schema changes without migration (dev only)
npx prisma db pull               # Pull schema from database
```

**Important**: Prisma client is auto-generated on `npm install` via the `postinstall` script.

## Project Structure

```
projects/web/
├── src/
│   ├── app/                  # Next.js App Router pages
│   │   ├── _components/      # Landing page components
│   │   ├── api/              # API routes (/api/*)
│   │   │   ├── auth/         # NextAuth routes
│   │   │   ├── trpc/         # tRPC endpoint
│   │   │   └── webhooks/     # Webhook handlers
│   │   ├── dashboard/        # Main dashboard pages
│   │   │   ├── admin/        # Admin panel pages
│   │   │   ├── hubs/         # Hub management pages
│   │   │   ├── connections/  # Connection management
│   │   │   └── settings/     # User settings
│   │   └── auth/             # Auth pages (signin, error)
│   ├── components/           # Reusable components
│   │   ├── ui/               # Base UI components (Radix UI)
│   │   ├── dashboard/        # Dashboard-specific components
│   │   ├── discover/         # Discovery page components
│   │   ├── hubs/             # Hub-related components
│   │   └── moderation/       # Moderation components
│   ├── server/               # Server-side code
│   │   ├── routers/          # tRPC routers (hub, user, moderation, etc.)
│   │   └── trpc.ts           # tRPC setup (publicProcedure, protectedProcedure)
│   ├── lib/                  # Utility libraries
│   │   ├── prisma.ts         # Prisma client singleton
│   │   ├── utils.ts          # Utility functions (cn, etc.)
│   │   ├── permissions.ts    # Permission checking
│   │   ├── rate-limit.ts     # Rate limiting utilities
│   │   └── redis-config.ts   # Redis configuration
│   ├── hooks/                # React hooks
│   ├── actions/              # Server actions
│   │   └── server-actions.ts # Form handling actions
│   ├── types/                # TypeScript type definitions
│   └── auth.ts               # NextAuth.js configuration
├── prisma/
│   └── schema.prisma         # Prisma database schema
├── public/                   # Static assets
├── next.config.mjs           # Next.js configuration
├── biome.jsonc               # Biome configuration
└── tsconfig.json             # TypeScript configuration
```

## Architecture Patterns

### tRPC API Structure

All API endpoints are defined as tRPC routers in `src/server/routers/`. The main router combines all sub-routers:

**Available Routers**:
- `hub`: Hub management (create, edit, delete, list)
- `user`: User operations (profile, settings)
- `server`: Discord server operations
- `moderation`: Moderation tools (bans, infractions)
- `connection`: Connection management
- `appeal`: Appeal system
- `announcement`: Announcements
- `discover`: Hub discovery
- `tags`: Tag management

**Creating a New Router**:
```typescript
// src/server/routers/example.ts
import { z } from 'zod';
import { router, publicProcedure, protectedProcedure } from '../trpc';
import { db } from '@/lib/prisma';

export const exampleRouter = router({
  // Public endpoint (no auth required)
  getPublic: publicProcedure
    .query(async () => {
      return { data: 'public' };
    }),

  // Protected endpoint (requires authentication)
  create: protectedProcedure
    .input(z.object({ name: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      return await db.example.create({
        data: { name: input.name, userId },
      });
    }),
});
```

**Adding Router to Main Router**:
```typescript
// src/server/routers/index.ts
import { exampleRouter } from './example';

export const appRouter = router({
  // ... existing routers
  example: exampleRouter,
});
```

### Client-Side tRPC Usage

```typescript
// In a Client Component
'use client';
import { api } from '@/lib/trpc';

export function ExampleComponent() {
  const { data, isLoading } = api.example.getPublic.useQuery();
  const createMutation = api.example.create.useMutation();

  const handleCreate = () => {
    createMutation.mutate({ name: 'test' });
  };

  if (isLoading) return <div>Loading...</div>;
  return <div>{data?.data}</div>;
}
```

### Server Components and Data Fetching

Use Server Components by default. Only use `'use client'` when needed (interactivity, hooks, browser APIs).

```typescript
// Server Component (default)
import { db } from '@/lib/prisma';

export default async function ExamplePage() {
  const data = await db.example.findMany();
  return <div>{/* render data */}</div>;
}
```

### Authentication

NextAuth.js v5 with Discord OAuth provider. Check authentication in:

**Server Components**:
```typescript
import { auth } from '@/auth';

export default async function ProtectedPage() {
  const session = await auth();
  if (!session) redirect('/api/auth/signin');
  // ...
}
```

**Client Components**:
```typescript
'use client';
import { useSession } from 'next-auth/react';

export function Component() {
  const { data: session, status } = useSession();
  if (status === 'loading') return <div>Loading...</div>;
  if (!session) return <div>Not authenticated</div>;
  // ...
}
```

**tRPC Procedures**:
- Use `protectedProcedure` for authenticated endpoints (automatically checks `ctx.session.user`)
- Use `publicProcedure` for public endpoints

### Database Access

**Prisma Client** singleton in `src/lib/prisma.ts`:
```typescript
import { db } from '@/lib/prisma';

// Query examples
const users = await db.user.findMany();
const user = await db.user.findUnique({ where: { id: '123' } });
const newUser = await db.user.create({ data: { name: 'John' } });
```

**Schema Changes Workflow**:
1. Modify `prisma/schema.prisma`
2. Run `npx prisma migrate dev --name "description"` to create migration
3. Prisma client is automatically regenerated
4. Commit both schema and migration files

### Component Patterns

**UI Components** in `src/components/ui/`:
- Built on Radix UI primitives
- Styled with Tailwind CSS
- Use `cn()` utility from `@/lib/utils` for conditional classes

```typescript
import { cn } from '@/lib/utils';

export function Button({ className, children, ...props }: ButtonProps) {
  return (
    <button className={cn('rounded-md px-4 py-2', className)} {...props}>
      {children}
    </button>
  );
}
```

**Feature Components** in domain folders:
- Keep related components together (e.g., `components/dashboard/`, `components/hubs/`)
- Use TypeScript interfaces for props
- Prefer composition over prop drilling

## Environment Variables

### Required
```env
DATABASE_URL="postgresql://..."           # Prisma database connection
NEXTAUTH_SECRET="random-secret"           # NextAuth encryption key
NEXTAUTH_URL="http://localhost:3000"      # App URL
DISCORD_CLIENT_ID="..."                   # Discord OAuth app ID
DISCORD_CLIENT_SECRET="..."               # Discord OAuth secret
```

### Optional
```env
REDIS_URL="redis://localhost:6379"        # Session storage and caching
SENTRY_DSN="..."                          # Error tracking
UPLOADTHING_SECRET="..."                  # File upload service
UPLOADTHING_APP_ID="..."                  # File upload app ID
NEXT_PUBLIC_BASE_URL="..."                # Public base URL
TOP_GG_WEBHOOK_SECRET="..."               # Top.gg webhook auth
NODE_ENV="development"                    # Environment (development/production)
```

## Key Configuration Files

### next.config.mjs
- Performance optimizations (PPR, parallelServerCompiles, etc.)
- Image optimization with WebP/AVIF support
- Security headers (CSP, X-Frame-Options, etc.)
- Bundle splitting strategy (vendor, motion, ui chunks)
- Redirects for /support, /invite, /vote, /docs
- Sentry integration

### biome.jsonc
- Single quotes (`quoteStyle: "single"`)
- 2-space indentation
- Trailing commas (ES5 style)
- Organize imports enabled
- Custom functions for sorted classes: `clsx`, `cva`, `cn`

### tsconfig.json
- Path alias: `@/*` maps to `./src/*`
- Strict mode enabled
- Module resolution: bundler

## Performance Considerations

- **Code Splitting**: Automatic route-based splitting, custom chunks for vendor, motion, and UI libraries
- **Image Optimization**: Next.js Image component with WebP/AVIF, multiple device sizes
- **Caching**: Redis for rate limiting and session storage (optional)
- **Bundle Analysis**: Run `npm run analyze` to visualize bundle size
- **PPR**: Partial Prerendering enabled experimentally
- **Server Components**: Use by default to reduce client bundle size

## Common Development Tasks

### Adding a New Page
1. Create file in `src/app/your-route/page.tsx`
2. Export default component
3. Add metadata export for SEO
4. Use Server Component by default

### Adding a New API Endpoint
1. Create router in `src/server/routers/new-router.ts`
2. Export router with `publicProcedure` or `protectedProcedure`
3. Import and add to `appRouter` in `src/server/routers/index.ts`
4. Use in components via `api.newRouter.procedureName.useQuery/useMutation`

### Modifying Database Schema
1. Edit `prisma/schema.prisma`
2. Run `npx prisma migrate dev --name "your_change"`
3. Review generated migration in `prisma/migrations/`
4. Apply migration (done automatically by previous command)

### Adding a UI Component
1. Create component in appropriate folder (`src/components/ui/` for base, domain folder for feature)
2. Use TypeScript for props
3. Style with Tailwind CSS
4. Use `cn()` for conditional classes
5. Import and use in pages/components

## Styling and Design

- **Tailwind CSS 4**: Utility-first CSS framework
- **Radix UI**: Accessible component primitives in `src/components/ui/`
- **Design System**: Consistent spacing, colors, and typography via Tailwind config
- **Dark Mode**: Supported via `next-themes` (system preference aware)
- **Icons**: Lucide React (`lucide-react`)
- **Animations**: Framer Motion (`motion` package)

## Troubleshooting

### Build Issues
```bash
rm -rf .next node_modules
npm install
npm run build
```

### Database Issues
```bash
npx prisma generate    # Regenerate Prisma client
npx prisma db push     # Push schema without migration (dev only)
npx prisma migrate reset  # Reset and reapply all migrations
```

### Type Errors
```bash
npm run typecheck      # Check TypeScript errors
npx prisma generate    # Regenerate Prisma types if needed
```

### Authentication Issues
- Verify `DISCORD_CLIENT_ID` and `DISCORD_CLIENT_SECRET` are correct
- Check Discord app redirect URIs include `http://localhost:3000/api/auth/callback/discord`
- Ensure `NEXTAUTH_SECRET` is set (generate with `openssl rand -base64 32`)
- Check `NEXTAUTH_URL` matches your app URL

## Important Notes

- **Server Components First**: Always use Server Components unless you need client interactivity
- **tRPC for APIs**: Don't create REST endpoints; use tRPC routers for all API logic
- **Prisma Client Regeneration**: Automatically happens on `npm install`, but run `npx prisma generate` manually if needed
- **Rate Limiting**: Configured via Redis (see `src/lib/rate-limit.ts` and `src/lib/rate-limit-middleware.ts`)
- **Error Handling**: tRPC errors are automatically formatted with Zod validation errors
- **File Structure**: Keep related files together (colocation pattern)
