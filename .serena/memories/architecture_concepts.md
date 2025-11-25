# Architecture & Key Concepts

## Application Architecture

### Architectural Style
**Modern Full-Stack Next.js 16**: Server-first architecture with React Server Components, client-side interactivity where needed, and type-safe APIs via tRPC v11.

### Layer Structure
```
┌─────────────────────────────────────────┐
│  Client Layer (Browser)                 │
│  - React 19 (RSC + Client Components)   │
│  - TanStack Query (client state)        │
│  - tRPC Client (type-safe API calls)    │
└─────────────────────────────────────────┘
              ↕ HTTP/tRPC
┌─────────────────────────────────────────┐
│  Server Layer (Next.js App Router)      │
│  - Server Components (data fetching)    │
│  - API Routes (tRPC handler)            │
│  - Server Actions (form submissions)    │
└─────────────────────────────────────────┘
              ↕ Prisma ORM
┌─────────────────────────────────────────┐
│  Data Layer                             │
│  - PostgreSQL (primary database)        │
│  - Redis (caching/sessions)             │
└─────────────────────────────────────────┘
              ↕ External APIs
┌─────────────────────────────────────────┐
│  External Services                      │
│  - Discord API (OAuth, webhooks)        │
│  - UploadThing (file uploads)           │
│  - Sentry (error tracking)              │
│  - Top.gg (voting webhooks)             │
└─────────────────────────────────────────┘
```

## Core Concepts

### React Server Components (RSC)
- **Default**: All components are Server Components unless marked with `'use client'`
- **Benefits**: 
  - Direct database access (no API needed)
  - Automatic code splitting
  - Zero JavaScript sent for non-interactive components
  - SEO-friendly by default
- **Client Components**: Used for:
  - Event handlers (onClick, onChange)
  - Hooks (useState, useEffect)
  - Browser APIs (localStorage, window)
  - Interactive UI (forms, modals)

### tRPC (Type-Safe APIs)
- **End-to-End Type Safety**: Client knows exact API shape at compile time
- **No Code Generation**: Types inferred directly from server
- **Routers**: Domain-specific (hub, user, server, etc.)
- **Procedures**:
  - `query`: Read operations (GET-like)
  - `mutation`: Write operations (POST-like)
  - `publicProcedure`: No authentication required
  - `protectedProcedure`: Requires logged-in user
- **Integration**: TanStack Query handles caching, refetching, optimistic updates

### Authentication Flow (NextAuth.js)
1. User clicks "Login with Discord"
2. Redirected to Discord OAuth
3. Discord redirects back with code
4. NextAuth exchanges code for tokens
5. Session created and stored (database + cookie)
6. Session available in Server Components via `auth()`
7. Session available in Client Components via `useSession()`

### Data Flow Patterns

**Server Component → Database (Direct)**
```typescript
// In Server Component (app/page.tsx)
import { db } from '@/lib/prisma';

async function Page() {
  const hubs = await db.hub.findMany(); // Direct DB access
  return <HubList hubs={hubs} />;
}
```

**Client Component → tRPC → Database**
```typescript
// In Client Component
'use client';
const { data } = trpc.hub.getAll.useQuery();
// tRPC → Server Router → Prisma → Database
```

**Form Submission → Server Action**
```typescript
// Server Action
async function updateHub(formData: FormData) {
  'use server';
  await db.hub.update({ ... });
}
```

### State Management
- **Server State**: TanStack Query (API data, caching, refetching)
- **URL State**: Next.js routing + searchParams
- **Local UI State**: React useState/useReducer
- **Global UI State**: React Context (theme, toast notifications)
- **Form State**: React Hook Form

### Caching Strategy

**Next.js Cache Layers:**
1. **Request Memoization**: Dedupes identical requests in single render
2. **Data Cache**: Server-side cache for fetch() calls
3. **Full Route Cache**: Pre-rendered pages at build time
4. **Router Cache**: Client-side soft navigation

**Custom Caching:**
- **Redis**: Session data, rate limiting, performance cache
- **TanStack Query**: Client-side API response cache (stale-while-revalidate)
- **Cache Components**: Next.js 16 feature for granular caching (5-30 min TTLs)

### API Design

**tRPC Router Structure:**
```
appRouter
├── hub (CRUD, settings, moderation)
├── user (profile, settings, achievements)
├── server (Discord server data)
├── moderation (infractions, appeals)
├── discover (public hub listing)
├── connection (server-hub connections)
├── announcement (hub announcements)
├── tags (hub categorization)
├── appeal (appeal management)
└── message (message queries, reports)
```

**Input Validation:**
- All inputs validated with Zod schemas
- Type-safe on client and server
- Automatic error formatting

### Database Design Principles
- **Normalized**: Avoid data duplication
- **Indexed**: Strategic indexes for query performance
- **Cascading**: Related data deleted automatically
- **Audit Trail**: `createdAt`, `updatedAt` timestamps
- **Soft Deletes**: Status fields for messages (not hard delete)
- **Composite Keys**: Unique constraints for relationships

### Security Model
- **Authentication**: Discord OAuth only (no passwords)
- **Authorization**: Role-based (owner, manager, moderator, user)
- **CSRF Protection**: Built into NextAuth.js
- **Rate Limiting**: Custom middleware in tRPC routers
- **Input Sanitization**: Zod validation, Prisma parameterized queries
- **XSS Protection**: React auto-escapes, rehype-sanitize for Markdown
- **Secure Headers**: Content-Security-Policy, X-Frame-Options, etc.

### File Upload Flow
1. Client requests upload URL from `/api/uploadthing`
2. UploadThing returns presigned URL
3. Client uploads directly to UploadThing CDN
4. Client receives file URL
5. Client saves URL to database via tRPC

### Real-Time Updates
- **Polling**: TanStack Query refetch intervals
- **Optimistic Updates**: UI updates before server confirms
- **Background Refetch**: `refetchOnWindowFocus`, `refetchInterval`
- **Webhooks**: Discord → Next.js `/api/webhooks/*` → Database updates

## Design Patterns Used

1. **Repository Pattern**: Prisma client as data access layer
2. **Service Layer**: Business logic in tRPC routers
3. **DTO Pattern**: Zod schemas for data transfer objects
4. **Factory Pattern**: Component variants with `cva`
5. **Compound Components**: Radix UI composable components
6. **Render Props**: Form components with React Hook Form
7. **Custom Hooks**: Reusable stateful logic
8. **Provider Pattern**: Context for global state (theme, session)

## Key Technologies Explained

### Why Prisma?
- Type-safe database access
- Auto-completion for queries
- Migration management
- Supports edge runtime (Vercel)

### Why tRPC?
- Full type safety without codegen
- Automatic type inference
- Better DX than REST
- Integrates perfectly with Next.js

### Why TanStack Query?
- Industry-standard data fetching
- Powerful caching strategies
- Optimistic updates
- Background refetching

### Why Radix UI?
- Unstyled, accessible primitives
- Full keyboard navigation
- ARIA attributes automatic
- Composable and customizable

### Why Tailwind CSS 4?
- Utility-first, no CSS files
- JIT compilation (fast builds)
- Zero runtime (CSS only)
- Consistent design tokens

## Performance Strategies
- **Code Splitting**: Dynamic imports for heavy components
- **Lazy Loading**: Images with next/image (automatic)
- **Prefetching**: Link component prefetches on hover
- **Bundle Optimization**: Custom webpack chunks
- **Database Indexing**: Strategic indexes on frequent queries
- **Redis Caching**: Reduce database load
- **Edge Runtime**: Prisma adapter for edge functions