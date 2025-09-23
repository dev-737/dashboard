import type React from 'react';

export const Link = ({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) => (
  <a
    href={href}
    className="text-primary transition-colors duration-200 hover:text-primary/90"
  >
    {children}
  </a>
);
