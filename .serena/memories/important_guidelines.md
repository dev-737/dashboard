# Important Guidelines and Best Practices

## Critical Guidelines

### 1. Database Schema Synchronization

**CRITICAL**: This web dashboard uses Prisma, but the parent monorepo's bot/CLI uses SQLAlchemy. Both systems connect to the **same PostgreSQL database**.

- **Source of truth**: SQLAlchemy models in `projects/db/src/db/models.py` (parent project)
- **Web schema**: Prisma schema in `projects/web/prisma/schema.prisma` (this project)
- **These must be manually synchronized!**

**When SQLAlchemy models change**:
1. Someone updates `projects/db/src/db/models.py`
2. They generate Atlas migration: `uv run interchat db diff "name"`
3. **You must manually update** `prisma/schema.prisma` to match
4. Run `npx prisma generate` to regenerate Prisma client

**When making web-only schema changes**:
- Avoid if possible - prefer coordinating with main database changes
- If necessary, use `npx prisma migrate dev` but ensure SQLAlchemy is updated too

### 2. Server Components First

**Always use Server Components by default**. Only add `'use client'` when you need:
- React hooks (useState, useEffect, etc.)
- Browser APIs (localStorage, window, etc.)
- Event handlers (onClick, onChange, etc.)
- Client-side libraries that don't support SSR

**Benefits of Server Components**:
- Smaller bundle size (less JavaScript sent to client)
- Better initial page load
- Direct database access (no API layer needed)
- Better SEO

### 3. tRPC Usage Pattern

**IMPORTANT**: This codebase uses `useTRPC()` hook pattern, NOT `api.router.procedure.useQuery()`.

**Wrong**:
```typescript
const { data } = api.hub.getById.useQuery({ id: '123' });
```

**Correct**:
```typescript
const trpc = useTRPC();
const { data } = useQuery(trpc.hub.getById.queryOptions({ id: '123' }));
```

### 4. No Emojis Unless Requested

Do not add emojis to code, comments, or UI unless the user explicitly requests them.

### 5. Import Path Alias

Always use `@/` path alias for internal imports:

```typescript
// Good
import { db } from '@/lib/prisma';
import { Button } from '@/components/ui/Button';

// Bad
import { db } from '../../../lib/prisma';
import { Button } from '../../components/ui/Button';
```

## Performance Best Practices

### 1. Code Splitting

- Next.js automatically splits code by route
- Custom chunks configured: vendor, motion, ui
- Use dynamic imports for heavy components:

```typescript
import dynamic from 'next/dynamic';

const HeavyComponent = dynamic(() => import('@/components/HeavyComponent'), {
  loading: () => <div>Loading...</div>,
});
```

### 2. Image Optimization

Always use Next.js `Image` component:

```typescript
import Image from 'next/image';

<Image
  src="/assets/images/logo.png"
  alt="Logo"
  width={200}
  height={100}
  priority // for above-the-fold images
/>
```

### 3. Data Fetching

- Use Server Components for initial data (no client bundle cost)
- Use tRPC queries for client-side data fetching
- Configure `staleTime` to reduce refetches:

```typescript
const { data } = useQuery(
  trpc.hub.getById.queryOptions({
    id: hubId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
);
```

### 4. Caching

- Redis available for rate limiting and caching (optional)
- Custom performance cache in `lib/performance-cache.ts`
- Prisma query caching built-in

## Security Best Practices

### 1. Environment Variables

**Never commit sensitive data**. Use environment variables:

```typescript
// Good
const token = process.env.DISCORD_CLIENT_SECRET;

// Bad
const token = 'abc123...'; // Never hardcode
```

**Client-side variables** must be prefixed with `NEXT_PUBLIC_`:

```typescript
// Accessible in browser
const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
```

### 2. Authentication

- Use `protectedProcedure` for authenticated tRPC endpoints
- Use middleware for route protection (`src/middleware.ts`)
- Check session in Server Components with `await auth()`

### 3. Input Validation

Always validate inputs with Zod in tRPC procedures:

```typescript
.input(z.object({
  id: z.string().uuid(),
  name: z.string().min(3).max(50),
  optional: z.number().optional(),
}))
```

### 4. Rate Limiting

- Configured in `lib/rate-limit-config.ts`
- Applied via middleware in `lib/rate-limit-middleware.ts`
- Uses Redis when available

## Error Handling Best Practices

### 1. Error Boundaries

- Global error boundary: `app/error.tsx`
- Route-specific: `app/dashboard/error.tsx`
- Always include retry functionality

### 2. Loading States

- Show loading UI for async operations
- Use Suspense boundaries where appropriate
- Provide meaningful loading messages

### 3. User Feedback

- Show success messages for mutations
- Display user-friendly error messages
- Include retry options for failed operations

## Development Workflow

### 1. Before Starting

```bash
git pull              # Get latest changes
npm install           # Install dependencies
npm run dev           # Start dev server
```

### 2. During Development

```bash
npm run typecheck     # Check types frequently
npm run lint          # Lint code
npm run format        # Format code
```

### 3. Before Committing

```bash
npm run typecheck     # MUST pass
npm run lint          # MUST pass
npm run build         # MUST succeed
```

### 4. After Committing

```bash
git push              # Push to remote
```

## Common Pitfalls to Avoid

### 1. Client Component Overuse

Don't make everything a client component. Start with Server Component, add `'use client'` only when needed.

### 2. Prisma Client Import

Always import from singleton:

```typescript
// Good
import { db } from '@/lib/prisma';

// Bad - creates new instances
import { PrismaClient } from '@prisma/client';
const db = new PrismaClient();
```

### 3. Direct API Calls

Don't make direct fetch calls. Use tRPC:

```typescript
// Good
const { data } = useQuery(trpc.hub.getById.queryOptions({ id }));

// Bad
const response = await fetch('/api/hub/123');
```

### 4. Forgetting to Invalidate Queries

After mutations, invalidate affected queries:

```typescript
const mutation = useMutation({
  ...trpc.hub.update.mutationOptions(),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['hub', hubId] });
  },
});
```

### 5. Not Handling Loading/Error States

Always handle loading and error states:

```typescript
const { data, isLoading, error } = useQuery(trpc.hub.getById.queryOptions({ id }));

if (isLoading) return <div>Loading...</div>;
if (error) return <div>Error: {error.message}</div>;
if (!data) return null;

return <div>{data.name}</div>;
```

## File Upload Guidelines

- Use UploadThing service (configured in environment)
- Images automatically optimized by Next.js
- Store file URLs in database, not file contents

## Monitoring and Debugging

- **Sentry**: Error tracking configured (check `instrumentation*.ts`)
- **Prisma Studio**: `npx prisma studio` for database GUI
- **Bundle Analysis**: `npm run analyze` to check bundle size
- **Performance**: `npm run perf:test` for performance testing

## Documentation

- Update CLAUDE.md if new patterns introduced
- Add JSDoc comments for complex functions
- Keep this memory file updated with new guidelines
