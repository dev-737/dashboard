import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function DashboardNotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center p-4">
      <div className="text-center">
        <h2 className="mb-4 font-bold text-2xl">Dashboard Page Not Found</h2>
        <p className="mb-6 text-muted-foreground">
          The dashboard page you're looking for doesn't exist.
        </p>
        <Button asChild>
          <Link href="/dashboard">Go to Dashboard</Link>
        </Button>
      </div>
    </div>
  );
}
