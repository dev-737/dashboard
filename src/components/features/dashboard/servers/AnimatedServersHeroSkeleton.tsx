'use client';

import { Skeleton } from '@/components/ui/skeleton';

export function AnimatedServersHeroSkeleton() {
  return (
    <div className="relative mb-8 h-auto min-h-[250px] animate-pulse overflow-hidden rounded-[var(--radius-button)] shadow-lg sm:h-[30vh] md:h-[35vh]">
      {/* Background gradient */}
      <div className="absolute inset-0 z-0 bg-linear-to-br from-blue-900/30 via-indigo-900/20 to-purple-900/30" />

      {/* Mesh gradient overlay */}
      <div className="absolute inset-0 z-0 bg-mesh-gradient opacity-30 mix-blend-overlay" />

      <div className="relative z-10 flex h-full flex-col items-center justify-center p-6 text-center">
        <div className="mx-auto max-w-4xl">
          <Skeleton className="mx-auto mb-2 h-8 w-64" />
          <Skeleton className="mx-auto mb-8 h-4 w-80" />

          <div className="mb-6 grid w-full grid-cols-1 gap-4 px-2 sm:grid-cols-3">
            {[1, 2, 3].map((index) => (
              <div
                key={index}
                className="flex flex-col items-center justify-center gap-2 rounded-[var(--radius-button)] border border-gray-700/50 bg-gray-900/60 px-4 py-4 shadow-lg backdrop-blur-md"
              >
                <div className="mb-1 rounded-[var(--radius-avatar)] bg-opacity-20 p-2">
                  <Skeleton className="h-5 w-5 rounded-[var(--radius-avatar)]" />
                </div>
                <Skeleton className="h-6 w-12" />
                <Skeleton className="h-4 w-16" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
