'use client';

import { useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { getBeginnerFriendlyError } from '@/lib/error-messages';

interface ErrorNotificationProps {
  isError: boolean;
  error: unknown;
  title?: string;
  description?: string;
  variant?: 'default' | 'destructive';
  context?: {
    action?: string;
    component?: string;
    userId?: string;
  };
  useBeginnerFriendly?: boolean;
}

/**
 * A hook to show error notifications when an error occurs
 * Now supports beginner-friendly error messages
 */
export function useErrorNotification({
  isError,
  error,
  title,
  description,
  variant = 'destructive',
  context,
  useBeginnerFriendly = true,
}: ErrorNotificationProps) {
  const { toast } = useToast();

  useEffect(() => {
    if (isError) {
      if (useBeginnerFriendly) {
        const friendlyError = getBeginnerFriendlyError(error, context);

        toast({
          title: title || friendlyError.title,
          description: description || friendlyError.description,
          variant:
            friendlyError.severity === 'error' ||
            friendlyError.severity === 'critical'
              ? 'destructive'
              : 'default',
        });
      } else {
        // Fallback to original behavior
        toast({
          title: title || 'Error',
          description:
            description ||
            (error instanceof Error
              ? error.message
              : 'An unknown error occurred'),
          variant,
        });
      }
    }
  }, [
    isError,
    error,
    title,
    description,
    variant,
    context,
    useBeginnerFriendly,
    toast,
  ]);
}

/**
 * A hook to show error notifications for query errors
 */
export function useQueryErrorNotification(
  query: { isError: boolean; error: unknown },
  title: string,
  description?: string
) {
  useErrorNotification({
    isError: query.isError,
    error: query.error,
    title,
    description,
  });
}
