'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface LoadingStateProps {
  variant?: 'card' | 'list' | 'grid' | 'hero' | 'table' | 'form';
  count?: number;
  className?: string;
  showAvatar?: boolean;
  showActions?: boolean;
}

export function LoadingState({
  variant = 'card',
  count = 3,
  className,
  showAvatar = false,
  showActions = false,
}: LoadingStateProps) {
  const renderCardSkeleton = () => (
    <Card className="animate-pulse border-gray-800 bg-linear-to-b from-gray-900/50 to-gray-900/30">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-16" />
        </div>
        {showAvatar && (
          <div className="mt-2 flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-[var(--radius-avatar)]" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
        {showActions && (
          <div className="mt-4 flex gap-2">
            <Skeleton className="h-9 w-20 rounded-[var(--radius-button)]" />
            <Skeleton className="h-9 w-16 rounded-[var(--radius-button)]" />
          </div>
        )}
      </CardContent>
    </Card>
  );

  const renderListSkeleton = () => (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={`list-skeleton-${i + 1}`}
          className="flex animate-pulse items-center gap-4 rounded-[var(--radius)] border border-gray-800 bg-gray-900/30 p-4"
        >
          {showAvatar && (
            <Skeleton className="h-12 w-12 rounded-[var(--radius-avatar)]" />
          )}
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-3 w-1/2" />
          </div>
          {showActions && (
            <div className="flex gap-2">
              <Skeleton className="h-8 w-16 rounded-[var(--radius-button)]" />
              <Skeleton className="h-8 w-8 rounded-[var(--radius-button)]" />
            </div>
          )}
        </div>
      ))}
    </div>
  );

  const renderGridSkeleton = () => (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map(() => renderCardSkeleton())}
    </div>
  );

  const renderHeroSkeleton = () => (
    <div className="relative mb-8 h-[30vh] animate-pulse overflow-hidden rounded-[var(--radius-button)] bg-linear-to-br from-purple-900/30 via-blue-900/20 to-indigo-900/30 md:h-[40vh]">
      <div className="flex h-full flex-col items-center justify-center px-6">
        <Skeleton className="mb-4 h-12 w-64" />
        <Skeleton className="mb-8 h-6 w-80" />
        <div className="grid w-full max-w-md grid-cols-1 gap-4 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={`card-skeleton-${i + 1}`}
              className="flex flex-col items-center gap-2 rounded-[var(--radius-button)] border border-gray-700/50 bg-gray-900/60 px-4 py-4 backdrop-blur-md"
            >
              <Skeleton className="h-8 w-8 rounded-[var(--radius-avatar)]" />
              <Skeleton className="h-6 w-12" />
              <Skeleton className="h-4 w-16" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderTableSkeleton = () => (
    <div className="animate-pulse rounded-[var(--radius)] border border-gray-800 bg-gray-900/30">
      <div className="border-gray-800 border-b p-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-9 w-24 rounded-[var(--radius-button)]" />
        </div>
      </div>
      <div className="divide-y divide-gray-800">
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={`table-row-${i + 1}`}
            className="flex items-center gap-4 p-4"
          >
            {showAvatar && (
              <Skeleton className="h-10 w-10 rounded-[var(--radius-avatar)]" />
            )}
            <div className="grid flex-1 grid-cols-3 gap-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
            {showActions && (
              <div className="flex gap-2">
                <Skeleton className="h-8 w-8 rounded-[var(--radius-button)]" />
                <Skeleton className="h-8 w-8 rounded-[var(--radius-button)]" />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  const renderFormSkeleton = () => (
    <div className="animate-pulse space-y-6 rounded-[var(--radius)] border border-gray-800 bg-gray-900/30 p-6">
      <div className="space-y-2">
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-10 w-full rounded-[var(--radius-input)]" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-24 w-full rounded-[var(--radius-input)]" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-10 w-full rounded-[var(--radius-input)]" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-10 w-full rounded-[var(--radius-input)]" />
        </div>
      </div>
      <div className="flex gap-3 pt-4">
        <Skeleton className="h-10 w-24 rounded-[var(--radius-button)]" />
        <Skeleton className="h-10 w-20 rounded-[var(--radius-button)]" />
      </div>
    </div>
  );

  const renderSkeleton = () => {
    switch (variant) {
      case 'card':
        return renderCardSkeleton();
      case 'list':
        return renderListSkeleton();
      case 'grid':
        return renderGridSkeleton();
      case 'hero':
        return renderHeroSkeleton();
      case 'table':
        return renderTableSkeleton();
      case 'form':
        return renderFormSkeleton();
      default:
        return renderCardSkeleton();
    }
  };

  return <div className={cn('w-full', className)}>{renderSkeleton()}</div>;
}

// Specialized loading components for common use cases
export function CardLoadingState({
  count = 3,
  showAvatar = false,
  showActions = false,
  className,
}: Omit<LoadingStateProps, 'variant'>) {
  return (
    <LoadingState
      variant="card"
      count={count}
      showAvatar={showAvatar}
      showActions={showActions}
      className={className}
    />
  );
}

export function ListLoadingState({
  count = 5,
  showAvatar = true,
  showActions = true,
  className,
}: Omit<LoadingStateProps, 'variant'>) {
  return (
    <LoadingState
      variant="list"
      count={count}
      showAvatar={showAvatar}
      showActions={showActions}
      className={className}
    />
  );
}

export function GridLoadingState({
  count = 6,
  showAvatar = true,
  showActions = true,
  className,
}: Omit<LoadingStateProps, 'variant'>) {
  return (
    <LoadingState
      variant="grid"
      count={count}
      showAvatar={showAvatar}
      showActions={showActions}
      className={className}
    />
  );
}

export function HeroLoadingState({ className }: { className?: string }) {
  return <LoadingState variant="hero" className={className} />;
}

export function TableLoadingState({
  count = 5,
  showAvatar = true,
  showActions = true,
  className,
}: Omit<LoadingStateProps, 'variant'>) {
  return (
    <LoadingState
      variant="table"
      count={count}
      showAvatar={showAvatar}
      showActions={showActions}
      className={className}
    />
  );
}

export function FormLoadingState({ className }: { className?: string }) {
  return <LoadingState variant="form" className={className} />;
}
