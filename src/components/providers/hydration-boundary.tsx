'use client';

import type { ReactNode } from 'react';
import { type DehydratedState, HydrationBoundary } from '@/lib/tanstack-query';

/**
 * HydrationBoundaryProvider component that wraps children with a HydrationBoundary
 * to handle server-side rendering of React Query data.
 */
export function HydrationBoundaryProvider({
  children,
  state,
}: {
  children: ReactNode;
  state?: DehydratedState | null; // Optional initial state for hydration
}) {
  return <HydrationBoundary state={state}>{children}</HydrationBoundary>;
}
