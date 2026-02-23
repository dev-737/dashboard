'use client';

import {
  Alert01Icon,
  Calendar01Icon,
  Clock01Icon,
  Home01Icon,
  Shield01Icon,
  UserIcon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';

import { formatDistanceToNow } from 'date-fns';
import { useState } from 'react';
import { toast } from 'sonner';
import { revokeInfraction } from '@/actions/server-actions';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/AlertDialog';
import type {
  InfractionStatus,
  InfractionType,
} from '@/lib/generated/prisma/client/client';

interface Infraction {
  id: string;
  type: InfractionType;
  reason: string;
  status: InfractionStatus;
  createdAt: string | Date;
  expiresAt: string | Date | null;
  userId: string | null;
  serverId: string | null;
  serverName: string | null;
  user: {
    name?: string | null;
    username?: string | null;
    image: string | null;
  } | null;
}

interface InfractionRevokeModalProps {
  infraction: Infraction;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function InfractionRevokeModal({
  infraction,
  isOpen,
  onClose,
  onSuccess,
}: InfractionRevokeModalProps) {
  const [isRevoking, setIsRevoking] = useState(false);

  const isUserInfraction = !!infraction.userId;
  const targetName = isUserInfraction
    ? infraction.user?.username || infraction.user?.name || 'Unknown User'
    : infraction.serverName || 'Unknown Server';

  const handleRevoke = async () => {
    setIsRevoking(true);

    try {
      const result = await revokeInfraction(infraction.id);

      if (result.error) {
        toast.error('Failed to revoke infraction', {
          description: result.error,
        });
      } else {
        toast.success('Infraction revoked', {
          description: `Successfully revoked the ${infraction.type.toLowerCase()} infraction for ${targetName}.`,
        });
        onSuccess();
        onClose();
      }
    } catch (_error) {
      toast.error('Failed to revoke infraction', {
        description: 'An unexpected error occurred. Please try again.',
      });
    } finally {
      setIsRevoking(false);
    }
  };

  const formatInfractionType = (type: InfractionType) => {
    switch (type) {
      case 'BLACKLIST':
        return 'Blacklist';
      case 'WARNING':
        return 'Warning';
      case 'BAN':
        return 'Ban';
      case 'MUTE':
        return 'Mute';
      default:
        return type;
    }
  };

  const getInfractionIcon = (type: InfractionType) => {
    switch (type) {
      case 'BLACKLIST':
        return (
          <HugeiconsIcon icon={Shield01Icon} className="h-4 w-4 text-red-400" />
        );
      case 'WARNING':
        return (
          <HugeiconsIcon
            icon={Alert01Icon}
            className="h-4 w-4 text-yellow-400"
          />
        );
      case 'BAN':
        return (
          <HugeiconsIcon icon={Shield01Icon} className="h-4 w-4 text-red-500" />
        );
      case 'MUTE':
        return (
          <HugeiconsIcon
            icon={Clock01Icon}
            className="h-4 w-4 text-orange-400"
          />
        );
      default:
        return (
          <HugeiconsIcon
            icon={Shield01Icon}
            className="h-4 w-4 text-gray-400"
          />
        );
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="max-w-md border-gray-800 bg-gray-900">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-white">
            <HugeiconsIcon
              icon={Alert01Icon}
              className="h-5 w-5 text-red-400"
            />
            Revoke Infraction
          </AlertDialogTitle>
          <AlertDialogDescription className="text-gray-300">
            Are you sure you want to revoke this infraction? This action cannot
            be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>

        {/* Infraction Details */}
        <div className="space-y-4 py-4">
          {/* Target01Icon Information */}
          <div className="flex items-center gap-3 rounded-lg border border-gray-800/50 bg-gray-900/50 p-3">
            <div className="relative">
              {isUserInfraction ? (
                <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-gray-800 bg-gray-700">
                  <HugeiconsIcon
                    icon={UserIcon}
                    className="h-5 w-5 text-blue-400"
                  />
                </div>
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-gray-800 bg-gray-700">
                  <HugeiconsIcon
                    icon={Home01Icon}
                    className="h-5 w-5 text-green-400"
                  />
                </div>
              )}
            </div>
            <div className="flex-1">
              <div className="font-medium text-white">{targetName}</div>
              <div className="text-gray-400 text-sm">
                {isUserInfraction ? 'User' : 'Server'}
              </div>
            </div>
          </div>

          {/* Infraction Details */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm">
              {getInfractionIcon(infraction.type)}
              <span className="text-gray-400">Type:</span>
              <span className="font-medium text-white">
                {formatInfractionType(infraction.type)}
              </span>
            </div>

            <div className="flex items-start gap-2 text-sm">
              <HugeiconsIcon
                icon={Alert01Icon}
                className="mt-0.5 h-4 w-4 shrink-0 text-yellow-400"
              />
              <div className="flex-1">
                <span className="text-gray-400">Reason:</span>
                <div className="mt-1 rounded border border-gray-800/50 bg-gray-950/50 p-2 text-white">
                  {infraction.reason}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm">
              <HugeiconsIcon
                icon={Calendar01Icon}
                className="h-4 w-4 text-gray-400"
              />
              <span className="text-gray-400">Created:</span>
              <span className="text-white">
                {formatDistanceToNow(new Date(infraction.createdAt), {
                  addSuffix: true,
                })}
              </span>
            </div>

            {infraction.expiresAt && (
              <div className="flex items-center gap-2 text-sm">
                <HugeiconsIcon
                  icon={Clock01Icon}
                  className="h-4 w-4 text-gray-400"
                />
                <span className="text-gray-400">Expires:</span>
                <span className="text-white">
                  {formatDistanceToNow(new Date(infraction.expiresAt), {
                    addSuffix: true,
                  })}
                </span>
              </div>
            )}
          </div>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel
            className="border-gray-700/50 bg-gray-800/50 text-white hover:bg-gray-700/50"
            disabled={isRevoking}
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleRevoke}
            disabled={isRevoking}
            className="border-red-700/30 bg-red-950/50 text-red-400 hover:border-red-700/50 hover:bg-red-900/50 hover:text-red-300"
          >
            {isRevoking ? 'Revoking...' : 'Revoke'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
