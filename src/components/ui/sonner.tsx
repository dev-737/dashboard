'use client';

import {
  Alert01Icon,
  Cancel01Icon,
  CheckmarkCircle01Icon,
  InformationCircleIcon,
  Loading03Icon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';

import { useTheme } from 'next-themes';
import { Toaster as Sonner, type ToasterProps } from 'sonner';

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = 'system' } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps['theme']}
      className="toaster group"
      icons={{
        success: (
          <HugeiconsIcon
            strokeWidth={3}
            icon={CheckmarkCircle01Icon}
            className="size-4"
          />
        ),
        info: (
          <HugeiconsIcon
            strokeWidth={3}
            icon={InformationCircleIcon}
            className="size-4"
          />
        ),
        warning: (
          <HugeiconsIcon
            strokeWidth={3}
            icon={Alert01Icon}
            className="size-4"
          />
        ),
        error: (
          <HugeiconsIcon
            strokeWidth={3}
            icon={Cancel01Icon}
            className="size-4"
          />
        ),
        loading: (
          <HugeiconsIcon
            strokeWidth={3}
            icon={Loading03Icon}
            className="size-4 animate-spin"
          />
        ),
      }}
      toastOptions={{
        style: {
          background: 'rgba(17, 24, 39, 0.98)',
          color: 'hsl(210 40% 98%)',
          border: '1px solid rgba(55, 65, 81, 0.6)',
          backdropFilter: 'blur(12px)',
        },
        classNames: {
          success: '!border-emerald-500/30 [&>*:first-child]:text-emerald-400',
          error: '!border-red-500/30 [&>*:first-child]:text-red-400',
          warning: '!border-amber-500/30 [&>*:first-child]:text-amber-400',
          info: '!border-blue-500/30 [&>*:first-child]:text-blue-400',
        },
      }}
      style={
        {
          '--border-radius': '0.5rem',
        } as React.CSSProperties
      }
      {...props}
    />
  );
};

export { Toaster };
