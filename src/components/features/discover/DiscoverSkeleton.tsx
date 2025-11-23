'use client';

import { useMemo } from 'react';

interface DiscoverSkeletonProps {
  count?: number;
}

export function DiscoverSkeleton({ count = 8 }: DiscoverSkeletonProps) {
  const skeletons = useMemo(
    () => Array.from({ length: count }, (_, i) => ({ id: `skeleton-${i}` })),
    [count]
  );

  return (
    <>
      {skeletons.map((skeleton) => (
        <div
          key={skeleton.id}
          className="relative flex h-full animate-pulse flex-col overflow-hidden rounded-xl border border-gray-800/60 bg-gray-900/90 sm:bg-gray-900/40 sm:backdrop-blur-sm"
        >
          {/* Shimmer effect */}
          <div
            className="pointer-events-none absolute inset-0 bg-linear-to-r from-transparent via-gray-800/10 to-transparent"
            style={{
              backgroundSize: '200% 100%',
              animation: 'shimmer 2s infinite linear',
            }}
          />

          {/* Header */}
          <div className="relative space-y-3 px-6 pt-5 pb-3">
            <div className="flex items-start gap-4">
              {/* Avatar */}
              <div className="h-14 w-14 shrink-0 rounded-full bg-gray-800/50" />

              {/* Title and description */}
              <div className="min-w-0 flex-1 space-y-2">
                <div className="h-5 w-3/4 rounded bg-gray-800/50" />
                <div className="h-4 w-full rounded bg-gray-800/30" />
                <div className="h-4 w-2/3 rounded bg-gray-800/30" />
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="relative flex-1 space-y-4 px-6 pb-4">
            {/* Tags skeleton */}
            <div className="flex flex-wrap gap-1.5">
              <div className="h-6 w-16 rounded-full bg-gray-800/40" />
              <div className="h-6 w-20 rounded-full bg-gray-800/40" />
              <div className="h-6 w-14 rounded-full bg-gray-800/40" />
            </div>

            {/* Stats Grid - 3 columns to match new design */}
            <div className="grid grid-cols-3 gap-3">
              <div className="flex flex-col items-center gap-1 rounded-lg border border-gray-800/50 bg-gray-950/30 p-3">
                <div className="h-4 w-4 rounded bg-gray-800/40" />
                <div className="h-5 w-12 rounded bg-gray-800/50" />
                <div className="h-3 w-10 rounded bg-gray-800/30" />
              </div>
              <div className="flex flex-col items-center gap-1 rounded-lg border border-gray-800/50 bg-gray-950/30 p-3">
                <div className="h-4 w-4 rounded bg-gray-800/40" />
                <div className="h-5 w-12 rounded bg-gray-800/50" />
                <div className="h-3 w-10 rounded bg-gray-800/30" />
              </div>
              <div className="flex flex-col items-center gap-1 rounded-lg border border-gray-800/50 bg-gray-950/30 p-3">
                <div className="h-4 w-4 rounded bg-gray-800/40" />
                <div className="h-5 w-12 rounded bg-gray-800/50" />
                <div className="h-3 w-10 rounded bg-gray-800/30" />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="relative border-gray-800/50 border-t px-6 pt-4 pb-6">
            <div className="flex gap-2">
              <div className="h-10 flex-1 rounded-lg bg-gray-800/40" />
              <div className="h-10 w-10 rounded-lg bg-gray-800/40" />
            </div>
          </div>
        </div>
      ))}
    </>
  );
}
