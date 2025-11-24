import type React from 'react';
import { cn } from '@/lib/utils';

export const Link = ({
  href,
  children,
  className,
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) => (
  <a
    href={href}
    className={cn(
      'text-primary transition-colors duration-200 hover:text-primary/90',
      className
    )}
  >
    {children}
  </a>
);
