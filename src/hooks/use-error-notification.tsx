'use client';

import { useEffect } from 'react';
import { toast } from 'sonner';
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
  useEffect(() => {
    if (isError) {
      if (useBeginnerFriendly) {
        const friendlyError = getBeginnerFriendlyError(error, context);

        const message = title || friendlyError.title;
        const descriptionText = description || friendlyError.description;
        const isDestructive =
          friendlyError.severity === 'error' ||
          friendlyError.severity === 'critical';

        if (isDestructive) {
          toast.error(message, {
            description: descriptionText,
          });
        } else {
          toast(message, {
            description: descriptionText,
          });
        }
      } else {
        // Fallback to original behavior
        const message = title || 'Error';
        const descriptionText =
          description ||
          (error instanceof Error
            ? error.message
            : 'An unknown error occurred');

        if (variant === 'destructive') {
          toast.error(message, {
            description: descriptionText,
          });
        } else {
          toast(message, {
            description: descriptionText,
          });
        }
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
  ]);
}
