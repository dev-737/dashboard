'use client';

import { type ReactNode, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@/lib/tanstack-query';

/**
 * TanstackQueryProvider component that creates a new QueryClient for each request
 * to ensure data is not shared between users and requests.
 */
export function TanstackQueryProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // With SSR, we usually want to set some default staleTime
            // above 0 to avoid refetching immediately on the client
            staleTime: 60 * 1000, // 1 minute
            refetchOnWindowFocus: false,
            retry: 1,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
