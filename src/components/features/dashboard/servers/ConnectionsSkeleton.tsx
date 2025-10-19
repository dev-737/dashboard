import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function ConnectionsSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <Card
          key={`connection-card-${i + 1}`}
          className="overflow-hidden border-gray-800 bg-[#0f1117]"
        >
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <Skeleton className="h-5 w-20 bg-gray-800" />
              <Skeleton className="h-4 w-24 bg-gray-800" />
            </div>
            <div className="mt-2 flex items-center gap-3">
              <Skeleton className="h-12 w-12 rounded-[var(--radius-avatar)] bg-gray-800" />
              <div className="space-y-2">
                <Skeleton className="h-5 w-32 bg-gray-800" />
                <Skeleton className="h-4 w-16 bg-gray-800" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="py-4">
            <div className="mb-4 flex items-center gap-3">
              <Skeleton className="h-8 w-8 rounded-[var(--radius-avatar)] bg-gray-800" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-28 bg-gray-800" />
                <Skeleton className="h-3 w-16 bg-gray-800" />
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <Skeleton className="h-4 w-20 bg-gray-800" />
                <Skeleton className="h-4 w-24 bg-gray-800" />
              </div>
              <div className="flex justify-between">
                <Skeleton className="h-4 w-20 bg-gray-800" />
                <Skeleton className="h-4 w-16 bg-gray-800" />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex gap-2 border-gray-800 border-t pt-2 pb-4">
            <Skeleton className="h-9 flex-1 rounded-[var(--radius-button)] bg-gray-800" />
            <Skeleton className="h-9 flex-1 rounded-[var(--radius-button)] bg-gray-800" />
            <Skeleton className="h-9 flex-1 rounded-[var(--radius-button)] bg-gray-800" />
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
