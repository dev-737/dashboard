# Architecture Patterns

## tRPC API Pattern

### Router Structure

All API endpoints defined in `src/server/routers/`. Each router exports procedures:

```typescript
// src/server/routers/example.ts
import { z } from 'zod';
import { router, publicProcedure, protectedProcedure } from '../trpc';
import { db } from '@/lib/prisma';

export const exampleRouter = router({
  // Public endpoint (no auth)
  getPublic: publicProcedure
    .query(async () => {
      return await db.example.findMany();
    }),

  // Protected endpoint (requires auth)
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

### Available Routers

- `hub`: Hub management (create, edit, delete, list)
- `user`: User operations (profile, settings)
- `server`: Discord server operations
- `moderation`: Moderation tools (bans, infractions)
- `connection`: Connection management
- `appeal`: Appeal system
- `announcement`: Announcements
- `discover`: Hub discovery
- `tags`: Tag management

### Client-Side Usage Pattern

**IMPORTANT**: Use `useTRPC()` hook pattern, NOT `api.router.procedure.useQuery()`:

```typescript
'use client';
import { useTRPC } from '@/utils/trpc';
import { useQuery, useMutation } from '@tanstack/react-query';

export function ExampleComponent() {
  const trpc = useTRPC();

  const { data, isLoading } = useQuery(
    trpc.example.getPublic.queryOptions()
  );

  const createMutation = useMutation(
    trpc.example.create.mutationOptions()
  );

  // ...
}
```

### Custom Hooks Pattern (Recommended)

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
    })
  );

  const createMutation = useMutation({
    ...trpc.example.create.mutationOptions(),
    onSuccess: () => {
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

## Server vs Client Components

### Server Components (Default)

Use by default - rendered on server, reduce bundle size:

```typescript
// No 'use client' directive
import { db } from '@/lib/prisma';

export default async function Page() {
  const data = await db.example.findMany();
  return <div>{/* render data */}</div>;
}
```

### Client Components (When Needed)

Only for interactivity, hooks, browser APIs:

```typescript
'use client';
import { useState } from 'react';
import { useSession } from 'next-auth/react';

export function InteractiveComponent() {
  const [state, setState] = useState(0);
  const { data: session } = useSession();
  // ...
}
```

## Authentication Pattern

### Server Components

```typescript
import { auth } from '@/auth';
import { redirect } from 'next/navigation';

export default async function ProtectedPage() {
  const session = await auth();
  if (!session) redirect('/login');
  // ...
}
```

### Client Components

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

### Middleware (Route Protection)

`src/middleware.ts` handles authentication for protected routes:

```typescript
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const protectedRoutes = ['/dashboard', '/admin'];
  
  if (protectedRoutes.some((route) => pathname.startsWith(route))) {
    const session = await auth();
    if (!session) {
      const url = new URL('/login', request.url);
      url.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(url);
    }
  }
  
  return NextResponse.next();
}
```

## Database Access Pattern

### Prisma Client Singleton

```typescript
import { db } from '@/lib/prisma';

// Query examples
const users = await db.user.findMany();
const user = await db.user.findUnique({ where: { id: '123' } });
const newUser = await db.user.create({ data: { name: 'John' } });
```

### In tRPC Procedures

```typescript
export const userRouter = router({
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      return await db.user.findUnique({
        where: { id: input.id },
      });
    }),
});
```

## Component Organization Pattern

### Feature-Based Structure

Components organized by domain/feature:

```
src/components/
├── ui/              # Base components (Button, Input, Dialog)
├── layout/          # Layout components (Navbar, Footer)
├── features/        # Feature-specific components
│   ├── dashboard/   # Dashboard domain
│   │   ├── hubs/    # Hub management UI
│   │   ├── connections/
│   │   └── shared/
│   ├── discover/    # Discovery domain
│   └── moderation/  # Moderation domain
├── forms/           # Form components
└── discord/         # Discord integration components
```

### Form Components Pattern

Complex forms split into sub-components:

```
src/components/forms/HubCreateForm/
├── HubCreateForm.tsx           # Main orchestrator
├── StepIndicator.tsx           # Progress UI
├── BasicInfoStep.tsx           # Step 1
├── DescriptionSettingsStep.tsx # Step 2
└── RulesWelcomeStep.tsx        # Step 3
```

## Error Handling Pattern

### Error Boundaries

- Global: `app/error.tsx`
- Route-specific: `app/dashboard/error.tsx`

```typescript
'use client';

export default function Error({ error, reset }: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div>
      <h2>Something went wrong!</h2>
      <button onClick={() => reset()}>Try again</button>
    </div>
  );
}
```

### Loading States

- Global: `app/loading.tsx`
- Route-specific: `app/dashboard/loading.tsx`

```typescript
export default function Loading() {
  return <div>Loading...</div>;
}
```

### Not Found Pages

- Global: `app/not-found.tsx`
- Route-specific: `app/dashboard/not-found.tsx`

## UI Component Pattern

```typescript
import { cn } from '@/lib/utils';
import type { VariantProps } from 'class-variance-authority';
import { cva } from 'class-variance-authority';

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md',
  {
    variants: {
      variant: {
        default: 'bg-primary text-white',
        outline: 'border border-input',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 px-3',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export function Button({ className, variant, size, ...props }: ButtonProps) {
  return (
    <button
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}
```
