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
          className="relative h-[380px] sm:h-[420px] animate-pulse overflow-hidden rounded-[var(--radius)] border border-gray-700/50 bg-gradient-to-br from-gray-900/90 to-gray-950/90 backdrop-blur-sm"
          style={{
            // Exact dimensions matching DiscoverHubCard to prevent layout shifts
            minHeight: '380px',
            maxHeight: '420px',
            aspectRatio: '1 / 1.2',
            contain: 'layout style paint',
          }}
        >
          {/* Shimmer effect */}
          <div
            className="absolute inset-0 animate-shimmer bg-gradient-to-r from-transparent via-gray-800/20 to-transparent"
            style={{
              backgroundSize: '200% 100%',
              animation: 'shimmer 2s infinite linear',
            }}
          />
          <div className="space-y-4 p-8">
            {/* Avatar and title skeleton */}
            <div className="mt-8 flex items-center gap-4">
              <div className="h-14 w-14 rounded-full bg-gray-800/60" />
              <div className="flex-1 space-y-2">
                <div className="h-5 w-3/4 rounded bg-gray-800/60" />
                <div className="h-4 w-1/2 rounded bg-gray-800/40" />
              </div>
            </div>

            {/* Stats skeleton */}
            <div className="mt-6 grid grid-cols-2 gap-3">
              <div className="h-16 rounded-xl bg-gray-800/40" />
              <div className="h-16 rounded-xl bg-gray-800/40" />
            </div>

            {/* Activity skeleton */}
            <div className="h-12 rounded-xl bg-gray-800/40" />

            {/* Tags skeleton */}
            <div className="flex gap-2">
              <div className="h-6 w-12 rounded-xl bg-gray-800/40" />
              <div className="h-6 w-16 rounded-xl bg-gray-800/40" />
            </div>

            {/* Action buttons skeleton */}
            <div className="flex gap-2 pt-4">
              <div className="h-10 flex-1 rounded-xl bg-gray-800/40" />
              <div className="h-10 w-10 rounded-xl bg-gray-800/40" />
            </div>
          </div>
        </div>
      ))}
    </>
  );
}
