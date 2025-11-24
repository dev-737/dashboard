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

export interface SpinnerProps
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

// Loading button component that shows spinner when loading
interface LoadingButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  loadingText?: string;
  spinnerSize?: VariantProps<typeof spinnerVariants>['size'];
  children: React.ReactNode;
}

function LoadingButton({
  loading = false,
  loadingText,
  spinnerSize = 'sm',
  children,
  disabled,
  className,
  ...props
}: LoadingButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-(--radius-button) px-4 py-2 font-medium text-sm transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Spinner size={spinnerSize} variant="current" />}
      {loading ? loadingText || 'Loading...' : children}
    </button>
  );
}

// Loading overlay component
interface LoadingOverlayProps {
  loading?: boolean;
  children: React.ReactNode;
  className?: string;
  spinnerSize?: VariantProps<typeof spinnerVariants>['size'];
  label?: string;
}

function LoadingOverlay({
  loading = false,
  children,
  className,
  spinnerSize = 'lg',
  label,
}: LoadingOverlayProps) {
  return (
    <div className={cn('relative', className)}>
      {children}
      {loading && (
        <div className="absolute inset-0 z-50 flex items-center justify-center rounded-(--radius) bg-background/80 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-3">
            <Spinner size={spinnerSize} label={label} />
            {label && (
              <p className="font-medium text-muted-foreground text-sm">
                {label}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Inline loading component for text
interface InlineLoadingProps {
  loading?: boolean;
  children: React.ReactNode;
  className?: string;
  spinnerSize?: VariantProps<typeof spinnerVariants>['size'];
}

function InlineLoading({
  loading = false,
  children,
  className,
  spinnerSize = 'xs',
}: InlineLoadingProps) {
  if (!loading) return <>{children}</>;

  return (
    <span className={cn('inline-flex items-center gap-2', className)}>
      <Spinner size={spinnerSize} variant="current" />
      {children}
    </span>
  );
}

// Page loading component
interface PageLoadingProps {
  title?: string;
  description?: string;
  className?: string;
}

function PageLoading({
  title = 'Loading...',
  description,
  className,
}: PageLoadingProps) {
  return (
    <div
      className={cn(
        'flex min-h-[400px] flex-col items-center justify-center p-8',
        className
      )}
    >
      <div className="flex flex-col items-center gap-4 text-center">
        <Spinner size="xl" />
        <div className="space-y-2">
          <h3 className="font-semibold text-lg">{title}</h3>
          {description && (
            <p className="max-w-md text-muted-foreground text-sm">
              {description}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export {
  Spinner,
  LoadingButton,
  LoadingOverlay,
  InlineLoading,
  PageLoading,
  spinnerVariants,
};
