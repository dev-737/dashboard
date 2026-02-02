'use client';

import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const spinnerVariants = cva(
  'animate-spin rounded-(--radius-avatar) border-current border-r-transparent border-solid align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]',
  {
    variants: {
      size: {
        xs: 'h-3 w-3 border-[1px]',
        sm: 'h-4 w-4 border-[1px]',
        default: 'h-5 w-5 border-2',
        lg: 'h-6 w-6 border-2',
        xl: 'h-8 w-8 border-[3px]',
      },
      variant: {
        default: 'text-primary',
        secondary: 'text-secondary',
        muted: 'text-muted-foreground',
        white: 'text-white',
        current: 'text-current',
      },
    },
    defaultVariants: {
      size: 'default',
      variant: 'default',
    },
  }
);

interface SpinnerProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof spinnerVariants> {
  label?: string;
}

function Spinner({ className, size, variant, label, ...props }: SpinnerProps) {
  return (
    // biome-ignore lint/a11y/useSemanticElements: Component needs div flexibility for props
    <div
      className={cn(spinnerVariants({ size, variant }), className)}
      role="status"
      aria-label={label || 'Loading'}
      aria-live="polite"
      {...props}
    >
      <span className="sr-only">{label || 'Loading...'}</span>
    </div>
  );
}

export { Spinner };
