/**
 * tRPC API handler for Next.js App Router
 */
import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import type { NextRequest } from 'next/server';
import { appRouter } from '@/server/routers';
import { createContext } from '@/server/trpc';

/**
 * Handle tRPC requests
 */
const handler = async (req: NextRequest) => {
  try {
    return await fetchRequestHandler({
      endpoint: '/api/trpc',
      req,
      router: appRouter,
      createContext,
    });
  } catch (error) {
    console.error('Unhandled tRPC error:', error);
    throw error;
  }
};

export { handler as GET, handler as POST };
