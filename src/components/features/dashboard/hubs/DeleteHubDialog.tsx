'use client';

import { Delete02Icon, Loading03Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';

import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/AlertDialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useTRPC } from '@/utils/trpc';

interface DeleteHubDialogProps {
  hubId: string;
  hubName: string;
}

export function DeleteHubDialog({ hubId, hubName }: DeleteHubDialogProps) {
  const trpc = useTRPC();
  const [isOpen, setIsOpen] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const router = useRouter();

  const deleteMutation = useMutation(trpc.hub.deleteHub.mutationOptions());

  const handleDelete = async () => {
    if (confirmText !== hubName) return;

    try {
      await deleteMutation.mutateAsync({ hubId, confirmName: confirmText });

      toast.success('Hub Deleted', {
        description: 'Your hub has been permanently deleted.',
      });

      // Close the dialog and redirect to the hubs page
      setIsOpen(false);
      router.push('/dashboard');
      router.refresh();
    } catch (error) {
      console.error('Error deleting hub:', error);
      toast.error('Error', {
        description:
          error instanceof Error ? error.message : 'Failed to delete hub',
      });
    }
  };

  const isConfirmValid = confirmText === hubName;

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        <Button
          variant="destructive"
          className="bg-red-600 text-white hover:bg-red-700"
        >
          <HugeiconsIcon
            strokeWidth={3}
            icon={Delete02Icon}
            className="mr-2 h-4 w-4"
          />
          Delete Hub
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="border border-gray-800 bg-gray-900">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-red-500">
            Delete Hub
          </AlertDialogTitle>
          <AlertDialogDescription className="text-gray-400">
            This action cannot be undone. This will permanently delete the hub
            <span className="font-semibold text-gray-300"> {hubName} </span>
            and all of its data, including connections, members, and settings.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="py-4">
          <div className="space-y-2">
            <p className="text-gray-400 text-sm">
              To confirm, type{' '}
              <span className="font-semibold text-gray-300">{hubName}</span>{' '}
              below:
            </p>
            <Input
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder={`Type "${hubName}" to confirm`}
              className="border-gray-700/50 bg-gray-800/50 focus-visible:ring-red-500/50"
              autoComplete="off"
            />
          </div>

          <div className="mt-4 rounded-md border border-red-900/30 bg-red-950/20 p-3">
            <h4 className="font-medium text-red-400 text-sm">Warning</h4>
            <ul className="mt-2 space-y-1 text-gray-400 text-xs">
              <li>• All connections to Discord servers will be removed</li>
              <li>• All members and moderators will lose access</li>
              <li>• All hub settings and rules will be deleted</li>
              <li>• This action is permanent and cannot be reversed</li>
            </ul>
          </div>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel className="border-gray-700 bg-gray-800 hover:bg-gray-700">
            Cancel
          </AlertDialogCancel>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={!isConfirmValid || deleteMutation.isPending}
            className="bg-red-600 text-white hover:bg-red-700"
          >
            {deleteMutation.isPending ? (
              <>
                <HugeiconsIcon
                  icon={Loading03Icon}
                  className="mr-2 h-4 w-4 animate-spin"
                />
                Deleting...
              </>
            ) : (
              'Delete Hub'
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
