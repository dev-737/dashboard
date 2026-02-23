import { Home01Icon, Search01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';

export default function HubNotFound() {
  return (
    <div className="container mx-auto max-w-6xl px-4 py-16 text-center">
      <h1 className="mb-4 font-bold text-4xl">Hub Not Found</h1>
      <p className="mx-auto mb-8 max-w-lg text-gray-600 dark:text-gray-400">
        Sorry, the hub you&apos;re looking for doesn&apos;t exist or may have
        been removed.
      </p>
      <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
        <Button asChild>
          <Link href="/hubs">
            <HugeiconsIcon
              strokeWidth={2}
              icon={Search01Icon}
              className="mr-2 h-4 w-4"
            />
            Browse Hubs
          </Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/">
            <HugeiconsIcon
              strokeWidth={2}
              icon={Home01Icon}
              className="mr-2 h-4 w-4"
            />
            Go Home
          </Link>
        </Button>
      </div>
    </div>
  );
}
