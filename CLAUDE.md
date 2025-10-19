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

```bash
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
│   │   │   ├── settings/     # User settings
│   │   │   ├── error.tsx     # Dashboard error boundary [NEW]
│   │   │   ├── loading.tsx   # Dashboard loading state [NEW]
│   │   │   └── not-found.tsx # Dashboard 404 page [NEW]
│   │   ├── discover/         # Hub discovery page
│   │   ├── hubs/             # Public hub pages
│   │   ├── login/            # Login page
│   │   ├── admin/            # Admin-only pages
│   │   ├── error.tsx         # Global error boundary [NEW]
│   │   ├── loading.tsx       # Global loading state [NEW]
│   │   └── not-found.tsx     # Global 404 page [NEW]
│   ├── components/           # Reusable components
│   │   ├── ui/               # Base UI components (Radix UI, 41 files)
│   │   ├── layout/           # Layout components (Navbar, Footer, Dashboard layouts)
│   │   ├── forms/            # Form components and utilities
│   │   │   ├── HubCreateForm/    # Hub creation wizard (split into sub-components)
│   │   │   ├── HubEditForm/      # Hub editing form (split into sub-components)
│   │   │   ├── ConnectionEditForm.tsx
│   │   │   ├── UserSettingsForm.tsx
│   │   │   ├── DurationSelector.tsx
│   │   │   ├── WordTagInput.tsx
│   │   │   └── PatternBuilder.tsx
│   │   ├── features/         # Feature-specific components organized by domain
│   │   │   ├── dashboard/    # All dashboard-related components
│   │   │   │   ├── connections/  # Connection management UI
│   │   │   │   ├── hubs/         # Hub management UI (27 files)
│   │   │   │   ├── servers/      # Server management UI
│   │   │   │   ├── notifications/# Notification components
│   │   │   │   ├── onboarding/   # Onboarding/guided tour
│   │   │   │   ├── shared/       # Shared dashboard components
│   │   │   │   └── *.tsx         # Root dashboard components (StatCard, SystemStatus, etc.)
│   │   │   ├── discover/     # Hub discovery components
│   │   │   ├── hubs/         # General hub components (StatsBar, TagSelector)
│   │   │   └── moderation/   # Moderation components
│   │   ├── discord/          # Discord integration components (selectors, icons)
│   │   ├── magicui/          # Magic UI components
│   │   └── providers/        # React context providers (Query, tRPC, Hydration)
│   ├── server/               # Server-side code
│   │   ├── routers/          # tRPC routers (hub, user, moderation, etc.)
│   │   └── trpc.ts           # tRPC setup (publicProcedure, protectedProcedure)
│   ├── lib/                  # Utility libraries
│   │   ├── prisma.ts         # Prisma client singleton
│   │   ├── utils.ts          # Utility functions (cn, etc.)
│   │   ├── constants.ts      # Application constants
│   │   ├── permissions.ts    # Permission checking
│   │   ├── rate-limit.ts     # Rate limiting utilities
│   │   ├── rate-limit-middleware.ts  # Rate limit middleware
│   │   ├── rate-limit-config.ts      # Rate limit configuration
│   │   ├── redis-config.ts   # Redis configuration
│   │   ├── hub-queries.ts    # Hub database queries
│   │   ├── hub-bans.ts       # Hub ban utilities
│   │   ├── platform-stats.ts # Platform statistics
│   │   ├── performance-cache.ts  # Performance caching utilities
│   │   └── services/         # Service layer utilities
│   ├── utils/                # Utility functions
│   │   └── trpc.ts           # tRPC client setup (useTRPC hook)
│   ├── hooks/                # React hooks
│   │   ├── use-hub.ts        # Hub management hooks
│   │   ├── use-connections.ts    # Connection hooks
│   │   ├── use-tags.ts       # Tag management hooks
│   │   └── use-*.ts          # Other custom hooks
│   ├── actions/              # Server actions
│   │   └── server-actions.ts # Form handling actions
│   ├── types/                # TypeScript type definitions
│   │   ├── global.d.ts       # Global type declarations
│   │   └── next-auth.d.ts    # NextAuth type extensions
│   ├── constants/            # Application constants [NEW]
│   │   └── index.ts          # Re-exports from lib/constants
│   ├── styles/               # Global styles [NEW]
│   │   ├── globals.css       # Global CSS and Tailwind imports
│   │   └── components.css    # Component-specific styles
│   ├── middleware.ts         # Next.js middleware (auth, redirects) [NEW]
│   ├── auth.ts               # NextAuth.js configuration
│   ├── instrumentation.ts    # Next.js instrumentation (Sentry)
│   └── instrumentation-client.ts  # Client-side instrumentation
├── prisma/
│   └── schema.prisma         # Prisma database schema
├── public/                   # Static assets [REORGANIZED]
│   ├── assets/               # Organized assets directory [NEW]
│   │   ├── images/           # Image assets
│   │   │   ├── features/     # Feature screenshots
│   │   │   ├── logos/        # Logo files (PNG, SVG, WebP)
│   │   │   ├── defaults/     # Default avatars/banners
│   │   │   └── blog/         # Blog images
│   │   └── icons/            # Icon files (SVG)
│   ├── favicon.ico           # Favicon
│   └── robots.txt            # Robots.txt
├── next.config.mjs           # Next.js configuration
├── biome.jsonc               # Biome configuration
├── tsconfig.json             # TypeScript configuration
├── sentry.server.config.ts   # Sentry server configuration
└── sentry.edge.config.ts     # Sentry edge configuration
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

**IMPORTANT**: This codebase uses the `useTRPC()` hook pattern from `@/utils/trpc`, not the `api.router.procedure.useQuery()` pattern.

```typescript
// In a Client Component
'use client';
import { useTRPC } from '@/utils/trpc';
import { useQuery, useMutation } from '@tanstack/react-query';

export function ExampleComponent() {
  const trpc = useTRPC();

  // Query data
  const { data, isLoading } = useQuery(
    trpc.example.getPublic.queryOptions()
  );

  // Mutation
  const createMutation = useMutation(
    trpc.example.create.mutationOptions()
  );

  const handleCreate = () => {
    createMutation.mutate({ name: 'test' });
  };

  if (isLoading) return <div>Loading...</div>;
  return <div>{data?.data}</div>;
}
```

**Using Custom Hooks Pattern** (Recommended):

```typescript
// src/hooks/use-example.ts
'use client';
import { useTRPC } from '@/utils/trpc';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export function useExample() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const query = useQuery(
    trpc.example.getPublic.queryOptions({
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 2,
    })
  );

  const createMutation = useMutation({
    ...trpc.example.create.mutationOptions(),
    onSuccess: () => {
      // Invalidate queries on success
      queryClient.invalidateQueries({ queryKey: ['example'] });
    },
  });

  return {
    data: query.data,
    isLoading: query.isLoading,
    create: createMutation.mutate,
    isCreating: createMutation.isPending,
  };
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
import { redirect } from 'next/navigation';

export default async function ProtectedPage() {
  const session = await auth();
  if (!session) redirect('/login');
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

### Middleware Pattern

The application uses Next.js middleware for authentication and route protection:

**`src/middleware.ts`**:

```typescript
import { auth } from '@/auth';
import { NextResponse } from 'next/server';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protected routes requiring authentication
  const protectedRoutes = ['/dashboard', '/admin'];
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  if (isProtectedRoute) {
    const session = await auth();
    if (!session) {
      // Redirect to login with callback URL
      const url = new URL('/login', request.url);
      url.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}
```

**Key Features**:

- Automatic authentication checks for protected routes
- Callback URL preservation for post-login redirects
- Excludes static files and API routes for performance
- Can be extended with role-based access control

### Error Handling and Loading States

The application uses Next.js App Router conventions for error boundaries and loading states:

**Error Boundaries** (`error.tsx`):

- Catch errors in route segments
- Provide user-friendly error messages
- Include retry functionality
- Log errors to monitoring services (Sentry)
- Exist at both global (`app/error.tsx`) and route-specific levels (`app/dashboard/error.tsx`)

**Loading States** (`loading.tsx`):

- Display loading UI while route segments load
- Support streaming and Suspense
- Provide immediate feedback to users
- Can include skeleton loaders for better UX

**Not Found Pages** (`not-found.tsx`):

- Custom 404 pages at global and route-specific levels
- Branded error messages
- Navigation back to valid pages

**Example Usage**:

```typescript
// app/dashboard/error.tsx
'use client';

export default function DashboardError({ error, reset }: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div>
      <h2>Dashboard Error</h2>
      <p>{error.message}</p>
      <button onClick={() => reset()}>Try again</button>
    </div>
  );
}
```

### File Organization Best Practices

**Current Structure**:

The codebase has been reorganized into a clean, structured architecture with clear separation of concerns:

1. **Layout Components** → `src/components/layout/`
   - Navbar, Footer, UserNav
   - Dashboard-specific layouts (DashboardTopbar, DashboardMobileSidebar, DashboardBreadcrumb, DashboardPageFooter)
   - All layout components use PascalCase naming

2. **Feature Components** → `src/components/features/`
   - **dashboard/** - All dashboard-related components with subdirectories:
     - `connections/` - Connection management UI
     - `hubs/` - Hub management UI (27 files including automod, dialogs, upload modals)
     - `servers/` - Server management components
     - `notifications/` - Notification badge and dropdown
     - `onboarding/` - Guided tour and onboarding help
     - `shared/` - Shared dashboard components
   - **discover/** - Hub discovery components (DiscoverHubCard, HubSearch, TagPicker)
   - **hubs/** - General hub components (StatsBar, TagSelector)
   - **moderation/** - Moderation components (InfractionRevokeModal)

3. **Form Components** → `src/components/forms/`
   - **HubCreateForm/** - Multi-step hub creation wizard split into:
     - `HubCreateForm.tsx` - Main orchestrator
     - `StepIndicator.tsx` - Progress visualization
     - `BasicInfoStep.tsx` - Step 1 component
     - `DescriptionSettingsStep.tsx` - Step 2 component
     - `RulesWelcomeStep.tsx` - Step 3 component
   - **HubEditForm/** - Hub editing form split into:
     - `HubEditForm.tsx` - Main orchestrator
     - `BasicInfoSection.tsx`, `WelcomeMessageSection.tsx`, `RulesSection.tsx`
   - Other forms: ConnectionEditForm, UserSettingsForm, HubDiscoverabilityForm
   - Form utilities: DurationSelector, WordTagInput, PatternBuilder

4. **Discord Components** → `src/components/discord/`
   - ChannelIcon, DiscordChannelSelector, DiscordRoleSelector
   - Consolidated Discord-specific integration components

5. **Assets Organization** → `public/assets/`
   - `public/assets/images/` - All image files
   - `public/assets/icons/` - Icon files (SVG)
   - Subdirectories by purpose (features/, logos/, defaults/)

**Naming Convention**:

- **All component files use PascalCase**: `ConnectionEditForm.tsx`, `HubLayout.tsx`, `AnimatedWelcome.tsx`
- **Imports use `@/components/` path alias**: Maintained for all imports
- **Directory structure reflects feature domains**: Clear organization by feature area

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
- Sentry integration with tunnel route `/monitoring`

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
- **Performance Caching**: Custom performance cache utilities in `lib/performance-cache.ts`
- **Bundle Analysis**: Run `npm run analyze` to visualize bundle size
- **PPR**: Partial Prerendering enabled experimentally
- **Server Components**: Use by default to reduce client bundle size
- **Optimized Package Imports**: Configured for lucide-react, radix-ui, motion, date-fns, lodash-es

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
4. Use in components via `useTRPC()` hook pattern

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

### Adding a Custom Hook

1. Create hook file in `src/hooks/use-your-hook.ts`
2. Use `'use client'` directive at top
3. Import `useTRPC()` for tRPC calls
4. Use TanStack Query's `useQuery`/`useMutation` for data fetching
5. Export hook function with clear TypeScript types

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
- **tRPC Pattern**: Use `useTRPC()` hook from `@/utils/trpc`, not an `api` export
- **Custom Hooks**: Follow the pattern in `src/hooks/` for consistent data fetching
- **Prisma Client Regeneration**: Automatically happens on `npm install`, but run `npx prisma generate` manually if needed
- **Rate Limiting**: Configured via Redis (see `src/lib/rate-limit.ts` and `src/lib/rate-limit-middleware.ts`)
- **Error Handling**: tRPC errors are automatically formatted with Zod validation errors
- **File Structure**: Keep related files together (colocation pattern)
- **Sentry Monitoring**: Error tracking configured with tunnel route `/monitoring` to avoid ad-blockers
