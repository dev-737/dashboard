/**
 * tRPC server setup
 */

import { initTRPC, TRPCError } from '@trpc/server';
import superjson from 'superjson';
import z, { ZodError } from 'zod/v4';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

/**
 * Context type for tRPC procedures
 */
export interface Context {
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
  // We don't use the opts parameter in this implementation
  const session = await auth.api.getSession({
    headers: await headers(),
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
        zodError:
          error.cause instanceof ZodError ? z.treeifyError(error.cause) : null,
      },
    };
  },
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
 * Create a protected procedure that requires authentication
 */
export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.session?.user) {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }
  return next({
    ctx: {
      ...ctx,
      session: { ...ctx.session, user: ctx.session.user },
    },
  });
});
