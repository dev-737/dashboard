import { ArrowLeftIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import Link from 'next/link';

import { ConnectionNavigationTabsSkeleton } from '@/components/features/dashboard/connections/ConnectionNavigationTabs';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function ConnectionLoading() {
  return (
    <div className="space-y-6">
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="sm"
            className="mr-2 border-gray-700/50 bg-gray-800/50 hover:bg-gray-700/50 hover:text-white"
            asChild
          >
            <Link href="/dashboard?tab=connections">
              <HugeiconsIcon
                strokeWidth={3}
                icon={ArrowLeftIcon}
                className="mr-1 h-4 w-4"
              />
              Back
            </Link>
          </Button>
          <Skeleton className="h-8 w-48" />
        </div>
      </div>
      <ConnectionNavigationTabsSkeleton currentTab="overview" />
      {/* Connection Details Skeleton */}
      <Card className="border border-gray-800/50 bg-dash-main backdrop-blur-sm">
        <CardHeader className="px-4 sm:px-6">
          <CardTitle>Connection Details</CardTitle>
          <CardDescription>Information about this connection</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 px-4 sm:px-6">
          <div className="flex flex-col gap-4 sm:gap-6 md:flex-row">
            <div className="flex-1 space-y-4">
              <div className="space-y-2">
                <Skeleton className="h-5 w-24" />
                <div className="flex items-center gap-3">
                  <Skeleton className="h-12 w-12 rounded-md" />
                  <div className="space-y-1">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Skeleton className="h-5 w-24" />
                <div className="flex items-center gap-3">
                  <Skeleton className="h-12 w-12 rounded-md" />
                  <div className="space-y-1">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex-1 space-y-4">
              <div className="space-y-2">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-10 w-full" />
              </div>

              <div className="space-y-2">
                <Skeleton className="h-5 w-32" />
                <div className="flex items-center gap-2">
                  <Skeleton className="h-6 w-12" />
                  <Skeleton className="h-5 w-24" />
                </div>
              </div>

              <div className="space-y-2">
                <Skeleton className="h-5 w-32" />
                <div className="flex items-center gap-2">
                  <Skeleton className="h-6 w-12" />
                  <Skeleton className="h-5 w-24" />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
