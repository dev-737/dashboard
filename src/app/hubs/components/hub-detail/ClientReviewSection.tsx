'use client';

import { Message02Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { authClient } from '@/lib/auth-client';
import WriteReviewForm from './WriteReviewForm';

interface ClientReviewSectionProps {
  hubId: string;
}

export default function ClientReviewSection({
  hubId,
}: ClientReviewSectionProps) {
  const { data: session } = authClient.useSession();
  const [showForm, setShowForm] = useState(false);

  if (!session?.user?.id) {
    return (
      <div className="mb-6 flex flex-col items-center justify-center rounded-lg border border-gray-700/30 bg-gray-800/30 p-6">
        <HugeiconsIcon
          icon={Message02Icon}
          className="mb-3 h-8 w-8 text-gray-500"
        />
        <p className="mb-2 text-center text-gray-300">
          Sign in to write a review
        </p>
        <Button
          variant="outline"
          className="mt-2 border-gray-700 bg-gray-800/50 text-gray-200 hover:bg-gray-700/50"
          asChild
        >
          <a href={`/login?callbackUrl=/hubs/${hubId}`}>Sign In</a>
        </Button>
      </div>
    );
  }

  return (
    <>
      {showForm ? (
        <WriteReviewForm hubId={hubId} />
      ) : (
        <div className="mb-6 flex justify-center">
          <Button
            onClick={() => setShowForm(true)}
            className="rounded-lg bg-linear-to-r from-primary to-primary-alt px-4 py-2 font-medium text-white transition-opacity hover:opacity-90"
          >
            <HugeiconsIcon icon={Message02Icon} className="mr-2 h-4 w-4" />
            Write a Review
          </Button>
        </div>
      )}
    </>
  );
}
