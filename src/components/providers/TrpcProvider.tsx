'use client';

import { useQueryClient } from '@tanstack/react-query';
import { type ReactNode, useState } from 'react';
import {
  TRPCProvider as ContextTRPCProvider,
  getTRPCClient,
} from '@/utils/trpc';

export function TRPCProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [trpcClient] = useState(() => getTRPCClient());

  return (
    <ContextTRPCProvider trpcClient={trpcClient} queryClient={queryClient}>
      {children}
    </ContextTRPCProvider>
  );
}
