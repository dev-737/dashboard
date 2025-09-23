'use client';

import { SessionProvider } from 'next-auth/react';
import { ThemeProvider } from 'next-themes';
import type { ReactNode } from 'react';
import type { DehydratedState } from '@/lib/tanstack-query';
import { HydrationBoundaryProvider } from './providers/hydration-boundary';
import { TanstackQueryProvider } from './providers/query-provider';
import { TRPCProvider } from './providers/trpc-provider';

export function Providers({
  children,
  dehydratedState = null,
}: {
  children: ReactNode;
  dehydratedState?: DehydratedState | null;
}) {
  return (
    <SessionProvider>
      <ThemeProvider attribute="class" defaultTheme="dark" forcedTheme="dark">
        <TanstackQueryProvider>
          <HydrationBoundaryProvider state={dehydratedState}>
            <TRPCProvider>{children}</TRPCProvider>
          </HydrationBoundaryProvider>
        </TanstackQueryProvider>
      </ThemeProvider>
    </SessionProvider>
  );
}
