'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function AnimatedDashboardSkeleton() {
  return (
    <div className="space-y-8">
      {/* Hero Section Skeleton */}
      <div className="relative mb-8 h-[30vh] animate-pulse overflow-hidden rounded-[var(--radius-button)] bg-linear-to-br from-purple-900/30 via-blue-900/20 to-indigo-900/30 md:h-[40vh]">
        <div className="flex h-full flex-col items-center justify-center px-6">
          <Skeleton className="mb-4 h-12 w-64" />
          <Skeleton className="h-16 w-80" />
        </div>
      </div>

      {/* Stats Cards Skeleton */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card
            key={`stat-card-${i + 1}`}
            className="border-gray-800 bg-linear-to-b from-gray-900/50 to-gray-900/30"
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-5 w-5 rounded-full" />
            </CardHeader>
            <CardContent>
              <Skeleton className="mb-2 h-10 w-20" />
              <Skeleton className="h-4 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Activity and Quick Actions Skeleton */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-gray-800 bg-linear-to-b from-gray-900/50 to-gray-900/30">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <Skeleton className="h-6 w-40" />
              <Skeleton className="mt-1 h-4 w-56" />
            </div>
            <Skeleton className="h-4 w-16" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={`activity-item-${i + 1}`}
                  className="flex items-center space-x-4 rounded-md border border-gray-800/50 p-3"
                >
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-40" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions Skeleton */}
        <Card className="border-gray-800 bg-linear-to-b from-gray-900/50 to-gray-900/30">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-5 rounded-full" />
              <Skeleton className="h-6 w-40" />
            </div>
            <Skeleton className="mt-1 h-4 w-56" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={`action-item-${i + 1}`}
                  className="flex items-center justify-between rounded-md border border-gray-800/50 bg-gray-800/30 p-4"
                >
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div>
                      <Skeleton className="h-5 w-32" />
                      <Skeleton className="mt-1 h-4 w-40" />
                    </div>
                  </div>
                  <Skeleton className="h-5 w-5" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
