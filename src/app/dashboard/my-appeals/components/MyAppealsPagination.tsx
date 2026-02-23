'use client';

import { ArrowLeftIcon, ArrowRightIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';

import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { CardFooter } from '@/components/ui/card';

interface MyAppealsPaginationProps {
  currentPage: number;
  totalPages: number;
}

export function MyAppealsPagination({
  currentPage,
  totalPages,
}: MyAppealsPaginationProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', newPage.toString());
    router.push(`/dashboard/my-appeals?${params.toString()}`);
  };

  return (
    <CardFooter className="flex justify-between border-gray-800 border-t pt-4">
      <div className="text-gray-400 text-sm">
        Page {currentPage} of {totalPages}
      </div>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
        >
          <HugeiconsIcon icon={ArrowLeftIcon} className="mr-1 h-4 w-4" />
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() =>
            handlePageChange(Math.min(totalPages, currentPage + 1))
          }
          disabled={currentPage === totalPages}
        >
          Next
          <HugeiconsIcon icon={ArrowRightIcon} className="ml-1 h-4 w-4" />
        </Button>
      </div>
    </CardFooter>
  );
}
