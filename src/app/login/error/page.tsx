import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function ErrorPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="mx-auto max-w-sm space-y-6 p-6 text-center">
        <h1 className="font-bold text-3xl">Authentication Error</h1>
        <p className="text-gray-500 dark:text-gray-400">
          There was an error signing in. Please try again.
        </p>
        <Button asChild>
          <Link href="/login">Back to Login</Link>
        </Button>
      </div>
    </div>
  );
}
