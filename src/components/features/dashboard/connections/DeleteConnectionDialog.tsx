'use client';

import { Delete02Icon, Loading03Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';

import { useState } from 'react';
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

interface DeleteConnectionDialogProps {
  connectionId: string;
  serverName: string;
  onConfirm: (connectionId: string) => void;
  isLoading?: boolean;
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function DeleteConnectionDialog({
  connectionId,
  serverName,
  onConfirm,
  isLoading = false,
  trigger,
  open,
  onOpenChange,
}: DeleteConnectionDialogProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleDelete = () => {
    onConfirm(connectionId);
    if (onOpenChange) {
      onOpenChange(false);
    } else {
      setIsOpen(false);
    }
  };

  const dialogOpen = open !== undefined ? open : isOpen;
  const handleOpenChange = onOpenChange || setIsOpen;

  return (
    <AlertDialog open={dialogOpen} onOpenChange={handleOpenChange}>
      {trigger && <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>}
      <AlertDialogContent className="border border-gray-800 bg-gray-900">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-red-500">
            Remove Connection
          </AlertDialogTitle>
          <AlertDialogDescription className="text-gray-400">
            Are you sure you want to remove the connection to{' '}
            <span className="font-semibold text-gray-300">{serverName}</span>?
            This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="py-2">
          <div className="rounded-md border border-red-900/30 bg-red-950/20 p-3">
            <h4 className="font-medium text-red-400 text-sm">Warning</h4>
            <ul className="mt-2 space-y-1 text-gray-400 text-xs">
              <li>• The server will be disconnected from the hub</li>
              <li>• Messages will no longer be relayed</li>
              <li>• The connection can be re-established later</li>
              <li>• This action cannot be undone</li>
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
            disabled={isLoading}
            className="bg-red-600 text-white hover:bg-red-700"
          >
            {isLoading ? (
              <>
                <HugeiconsIcon
                  icon={Loading03Icon}
                  className="mr-2 h-4 w-4 animate-spin"
                />
                Removing...
              </>
            ) : (
              <>
                <HugeiconsIcon icon={Delete02Icon} className="mr-2 h-4 w-4" />
                Remove Connection
              </>
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
