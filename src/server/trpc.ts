/**
 * tRPC server setup
 */
import { trackEvent } from '@/lib/analytics';
import { auth } from '@/lib/auth';
import { initTRPC, TRPCError } from '@trpc/server';
import { headers } from 'next/headers';
import superjson from 'superjson';
import { ZodError } from 'zod'; // Use standard Zod import

/**
 * Context type for tRPC procedures
 */
interface Context {
  session: {
    user?: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    } | null;
  } | null;
}

/**
 * Creates context for tRPC procedures
 */
export async function createContext(): Promise<Context> {
  const session = await auth.api.getSession({
    headers: await headers(), // Correctly awaited for Next.js 15+
  });
  return { session: session ? { user: session.user } : null };
}

/**
 * Initialize tRPC
 */
const t = initTRPC.context<Context>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        // Standardized Zod error handling
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

/**
 * Analytics middleware — automatically tracks all successful mutations.
 */
const analyticsMiddleware = t.middleware(async ({ ctx, next, type, path }) => {
  const result = await next();

  if (type === 'mutation' && result.ok) {
    const userId = ctx.session?.user?.id;
    trackEvent('web.trpc_mutation', {
      userId: userId ?? '',
      properties: { type: 'mutation', path, outcome: 'success' },
    });
  }

  return result;
});

/**
 * Auth middleware — ensures user is authenticated and narrows the context type.
 */
const isAuthed = t.middleware(({ ctx, next }) => {
  if (!ctx.session?.user) {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }

  return next({
    ctx: {
      session: {
        ...ctx.session,
        user: ctx.session.user, // TypeScript safely narrows user to non-null
      },
    },
  });
});

/**
 * Create a router
 */
export const router = t.router;

/**
 * Create an unprotected procedure
 */
export const publicProcedure = t.procedure;

/**
 * Create a protected procedure that requires authentication.
 * Includes analytics middleware.
 */
export const protectedProcedure = t.procedure
  .use(isAuthed)
  .use(analyticsMiddleware);
