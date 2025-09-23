import { dehydrate, QueryClient } from '@/lib/tanstack-query';

/**
 * Creates a dehydrated state for React Query by prefetching the given queries.
 *
 * @param prefetchFn A function that takes a QueryClient and prefetches queries
 * @returns The dehydrated state that can be passed to HydrationBoundary
 */
export async function createDehydratedState(
  prefetchFn: (queryClient: QueryClient) => Promise<void>
) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        // Don't retry on the server
        retry: false,
        // Don't refetch on the server
        refetchOnWindowFocus: false,
        // Keep data fresh for 1 minute
        staleTime: 60 * 1000,
      },
    },
  });

  try {
    // Prefetch all queries defined in the prefetch function
    await prefetchFn(queryClient);
  } catch (error) {
    // If prefetching fails, log the error but don't throw
    // This allows the page to still render with loading states
    console.error('Error prefetching queries:', error);
  }

  // Dehydrate the query cache
  return dehydrate(queryClient);
}
