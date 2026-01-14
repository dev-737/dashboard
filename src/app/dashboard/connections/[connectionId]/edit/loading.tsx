import { ConnectionNavigationTabsSkeleton } from '@/components/features/dashboard/connections/ConnectionNavigationTabs';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function ConnectionEditLoading() {
  return (
    <div className="space-y-6">
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <Skeleton className="h-10 w-32" />
      </div>
      <ConnectionNavigationTabsSkeleton currentTab="edit" />
      <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-3">
        <Card className="border border-gray-800/50 bg-dash-hub-main backdrop-blur-sm md:col-span-2">
          <CardHeader className="px-4 sm:px-6">
            <CardTitle>Connection Settings</CardTitle>
            <CardDescription>
              Configure how this connection works
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 px-4 sm:px-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-48" />
              </div>
              <Skeleton className="h-6 w-12" />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-48" />
              </div>
              <Skeleton className="h-6 w-12" />
            </div>

            <div className="space-y-2">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-4 w-64" />
            </div>
          </CardContent>
          <CardFooter className="px-4 sm:px-6">
            <Skeleton className="h-10 w-full" />
          </CardFooter>
        </Card>

        <div className="space-y-4 sm:space-y-6">
          <Card className="border border-gray-800/50 bg-dash-hub-main backdrop-blur-sm">
            <CardHeader className="px-4 sm:px-6">
              <CardTitle>Hub</CardTitle>
              <CardDescription>
                The hub this connection links to
              </CardDescription>
            </CardHeader>
            <CardContent className="px-4 sm:px-6">
              <div className="flex items-center gap-3">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div>
                  <Skeleton className="mb-1 h-5 w-32" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-gray-800/50 bg-dash-hub-main backdrop-blur-sm">
            <CardHeader className="px-4 sm:px-6">
              <CardTitle>Server</CardTitle>
              <CardDescription>
                The Discord server this connection links to
              </CardDescription>
            </CardHeader>
            <CardContent className="px-4 sm:px-6">
              <div className="flex items-center gap-3">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div>
                  <Skeleton className="mb-1 h-5 w-32" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
