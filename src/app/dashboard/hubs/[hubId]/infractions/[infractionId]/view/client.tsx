'use client';

import { useMutation, useQuery } from '@tanstack/react-query';
import { formatDistanceToNow } from 'date-fns';
import {
  AlertTriangle,
  ArrowLeft,
  Ban,
  Calendar,
  Edit,
  Eye,
  Server,
  Shield,
  User,
  XCircle,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useId, useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useTRPC } from '@/utils/trpc';

interface Infraction {
  id: string;
  hubId: string;
  moderatorId: string;
  reason: string;
  expiresAt: string | Date | null;
  userId: string | null;
  serverId: string | null;
  serverName: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
  type: 'BAN' | 'BLACKLIST' | 'WARNING' | 'MUTE';
  status: 'ACTIVE' | 'REVOKED' | 'APPEALED';
  notified: boolean;
  appealedAt?: string | Date | null;
  hub: {
    id: string;
    name: string;
    iconUrl: string | null;
  };
  moderator: {
    id: string;
    name: string | null;
    image: string | null;
  };
  user: {
    id: string;
    name: string | null;
    image: string | null;
  } | null;
  _count: {
    appeals: number;
  };
}

interface ViewInfractionClientProps {
  hubId: string;
  infractionId: string;
  canModifyDuration: boolean;
}

export function ViewInfractionClient({
  hubId,
  infractionId,
  canModifyDuration,
}: ViewInfractionClientProps) {
  const trpc = useTRPC();
  const { toast } = useToast();

  // Generate unique IDs for form fields
  const permanentCheckboxId = useId();
  const expiresAtFieldId = useId();

  const [infraction, setInfraction] = useState<Infraction | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditDurationOpen, setIsEditDurationOpen] = useState(false);
  const [newExpiresAt, setNewExpiresAt] = useState('');
  const [isPermanent, setIsPermanent] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const {
    data,
    isLoading,
    error: queryError,
  } = useQuery(
    trpc.moderation.getInfractionById.queryOptions({ infractionId })
  );

  useEffect(() => {
    setLoading(isLoading);
    if (queryError) {
      const msg =
        queryError instanceof Error
          ? queryError.message
          : 'Failed to load infraction';
      setError(msg);
    } else {
      setError(null);
    }
    if (data?.infraction) {
      setInfraction(data.infraction);
      if (data.infraction.expiresAt) {
        setNewExpiresAt(
          new Date(data.infraction.expiresAt).toISOString().slice(0, 16)
        );
        setIsPermanent(false);
      } else {
        setIsPermanent(true);
      }
    }
  }, [data, isLoading, queryError]);

  const updateInfraction = useMutation(
    trpc.moderation.updateInfraction.mutationOptions()
  );
  const handleUpdateDuration = async () => {
    if (!infraction) return;

    try {
      setIsUpdating(true);
      const result = await updateInfraction.mutateAsync({
        infractionId,
        expiresAt: isPermanent ? null : newExpiresAt,
      });
      setInfraction(result.infraction);
      setIsEditDurationOpen(false);

      toast({
        title: 'Duration Updated',
        description: isPermanent
          ? 'Infraction is now permanent'
          : 'Infraction duration has been updated',
        variant: 'default',
      });
    } catch (error) {
      console.error('Error updating duration:', error);
      toast({
        title: 'Error',
        description: 'Failed to update infraction duration',
        variant: 'destructive',
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const getInfractionTypeInfo = (type: string) => {
    switch (type) {
      case 'BLACKLIST':
        return {
          label: 'Blacklist',
          icon: Ban,
          color: 'bg-red-500/20 text-red-400 border-red-500/50',
        };
      case 'WARNING':
        return {
          label: 'Warning',
          icon: AlertTriangle,
          color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50',
        };
      case 'BAN':
        return {
          label: 'Ban',
          icon: Shield,
          color: 'bg-red-500/20 text-red-400 border-red-500/50',
        };
      case 'MUTE':
        return {
          label: 'Mute',
          icon: XCircle,
          color: 'bg-gray-500/20 text-gray-400 border-gray-500/50',
        };
      default:
        return {
          label: type,
          icon: Shield,
          color: 'bg-gray-500/20 text-gray-400 border-gray-500/50',
        };
    }
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return {
          label: 'Active',
          color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50',
        };
      case 'REVOKED':
        return {
          label: 'Revoked',
          color: 'bg-gray-500/20 text-gray-400 border-gray-500/50',
        };
      case 'APPEALED':
        return {
          label: 'Appealed',
          color: 'bg-blue-500/20 text-blue-400 border-blue-500/50',
        };
      default:
        return {
          label: status,
          color: 'bg-gray-500/20 text-gray-400 border-gray-500/50',
        };
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Header Skeleton */}
        <div className="flex items-center gap-4">
          <div className="h-8 w-8 animate-pulse rounded bg-gray-800/50" />
          <div className="space-y-2">
            <div className="h-6 w-48 animate-pulse rounded bg-gray-800/50" />
            <div className="h-4 w-32 animate-pulse rounded bg-gray-800/50" />
          </div>
        </div>

        {/* Content Skeleton */}
        <div className="space-y-4">
          <div className="premium-card space-y-4 p-6">
            <div className="h-6 w-40 animate-pulse rounded bg-gray-800/50" />
            <div className="space-y-2">
              <div className="h-4 w-full animate-pulse rounded bg-gray-800/50" />
              <div className="h-4 w-3/4 animate-pulse rounded bg-gray-800/50" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            asChild
            className="border-gray-700/50 bg-gray-800/50 hover:bg-gray-700/50"
          >
            <Link href={`/dashboard/hubs/${hubId}/infractions`}>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="font-bold text-2xl text-white tracking-tight">
              View Infraction
            </h1>
            <p className="text-gray-400 text-sm">Infraction details</p>
          </div>
        </div>

        <Alert className="border-red-500/50 bg-red-950/20">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!infraction) {
    return null;
  }

  const typeInfo = getInfractionTypeInfo(infraction.type);
  const statusInfo = getStatusInfo(infraction.status);
  const TypeIcon = typeInfo.icon;

  const isUserInfraction = infraction.userId !== null;
  const targetName = isUserInfraction
    ? infraction.user?.name || 'Unknown User'
    : infraction.serverName || 'Unknown Server';
  const targetId = isUserInfraction ? infraction.userId : infraction.serverId;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="icon"
          asChild
          className="border-gray-700/50 bg-gray-800/50 hover:bg-gray-700/50"
        >
          <Link href={`/dashboard/hubs/${hubId}/infractions`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="font-bold text-2xl text-white tracking-tight">
            View Infraction
          </h1>
          <p className="text-gray-400 text-sm">
            Infraction details and management
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main Infraction Details */}
        <div className="space-y-6 lg:col-span-2">
          {/* Target Information */}
          <Card className="premium-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div
                  className={`rounded-[var(--radius-button)] p-2 ${typeInfo.color}`}
                >
                  <TypeIcon className="h-5 w-5" />
                </div>
                {typeInfo.label} Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Target Info */}
              <div className="flex items-center gap-4 rounded-[var(--radius)] border border-gray-700/50 bg-gray-900/50 p-4">
                {isUserInfraction ? (
                  <>
                    <Image
                      src={infraction.user?.image || '/assets.images/pfp1.png'}
                      alt={targetName}
                      width={48}
                      height={48}
                      className="rounded-full border-2 border-gray-700"
                    />
                    <div>
                      <div className="font-medium text-white">{targetName}</div>
                      <div className="text-gray-400 text-sm">
                        User ID: {targetId}
                      </div>
                    </div>
                    <Badge
                      variant="outline"
                      className="ml-auto border-blue-500/50 bg-blue-500/20 text-blue-400"
                    >
                      <User className="mr-1 h-3 w-3" />
                      User
                    </Badge>
                  </>
                ) : (
                  <>
                    <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-gray-700 bg-gradient-to-br from-green-500/20 to-blue-500/20">
                      <Server className="h-6 w-6 text-green-400" />
                    </div>
                    <div>
                      <div className="font-medium text-white">{targetName}</div>
                      <div className="text-gray-400 text-sm">
                        Server ID: {targetId}
                      </div>
                    </div>
                    <Badge
                      variant="outline"
                      className="ml-auto border-green-500/50 bg-green-500/20 text-green-400"
                    >
                      <Server className="mr-1 h-3 w-3" />
                      Server
                    </Badge>
                  </>
                )}
              </div>

              {/* Status and Type */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="font-medium text-gray-400 text-sm">
                    Status
                  </Label>
                  <Badge
                    variant="outline"
                    className={`w-fit ${statusInfo.color}`}
                  >
                    {statusInfo.label}
                  </Badge>
                </div>
                <div className="space-y-2">
                  <Label className="font-medium text-gray-400 text-sm">
                    Type
                  </Label>
                  <Badge
                    variant="outline"
                    className={`w-fit ${typeInfo.color}`}
                  >
                    <TypeIcon className="mr-1 h-3 w-3" />
                    {typeInfo.label}
                  </Badge>
                </div>
              </div>

              {/* Reason */}
              <div className="space-y-2">
                <Label className="font-medium text-gray-400 text-sm">
                  Reason
                </Label>
                <div className="rounded-[var(--radius-button)] border border-gray-700/50 bg-gray-900/50 p-3">
                  <p className="whitespace-pre-wrap text-gray-300">
                    {infraction.reason}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Duration Information */}
          <Card className="premium-card">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="rounded-[var(--radius-button)] bg-purple-500/20 p-2">
                    <Calendar className="h-5 w-5 text-purple-400" />
                  </div>
                  Duration
                </div>
                {canModifyDuration && infraction.status === 'ACTIVE' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditDurationOpen(true)}
                    className="border-purple-500/50 bg-purple-500/10 text-purple-400 hover:bg-purple-500/20"
                  >
                    <Edit className="mr-1 h-3 w-3" />
                    Edit Duration
                  </Button>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label className="font-medium text-gray-400 text-sm">
                    Created
                  </Label>
                  <div className="text-gray-300">
                    {new Date(infraction.createdAt).toLocaleString()}
                  </div>
                  <div className="text-gray-500 text-xs">
                    {formatDistanceToNow(new Date(infraction.createdAt), {
                      addSuffix: true,
                    })}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="font-medium text-gray-400 text-sm">
                    Expires
                  </Label>
                  {infraction.expiresAt ? (
                    <>
                      <div className="text-gray-300">
                        {new Date(infraction.expiresAt).toLocaleString()}
                      </div>
                      <div className="text-gray-500 text-xs">
                        {new Date(infraction.expiresAt) > new Date()
                          ? `Expires ${formatDistanceToNow(new Date(infraction.expiresAt), { addSuffix: true })}`
                          : 'Expired'}
                      </div>
                    </>
                  ) : (
                    <div className="font-medium text-yellow-400">Permanent</div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Moderator Information */}
          <Card className="premium-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="rounded-[var(--radius-button)] bg-indigo-500/20 p-2">
                  <Shield className="h-5 w-5 text-indigo-400" />
                </div>
                Issued By
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <Image
                  src={infraction.moderator.image || '/assets.images/pfp1.png'}
                  alt={infraction.moderator.name || 'Moderator'}
                  width={40}
                  height={40}
                  className="rounded-full border-2 border-gray-700"
                />
                <div>
                  <div className="font-medium text-white">
                    {infraction.moderator.name}
                  </div>
                  <div className="text-gray-400 text-sm">Moderator</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Appeals Information */}
          {infraction._count.appeals > 0 && (
            <Card className="premium-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="rounded-[var(--radius-button)] bg-blue-500/20 p-2">
                    <Eye className="h-5 w-5 text-blue-400" />
                  </div>
                  Appeals
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="font-medium text-blue-400">
                  {infraction._count.appeals} appeal
                  {infraction._count.appeals !== 1 ? 's' : ''} submitted
                </div>
                {infraction.appealedAt && (
                  <div className="mt-1 text-gray-400 text-sm">
                    Last appeal:{' '}
                    {formatDistanceToNow(new Date(infraction.appealedAt), {
                      addSuffix: true,
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Hub Information */}
          <Card className="premium-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="rounded-[var(--radius-button)] bg-emerald-500/20 p-2">
                  <Server className="h-5 w-5 text-emerald-400" />
                </div>
                Hub
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <Image
                  src={
                    infraction.hub.iconUrl ||
                    '/assets/images/defaults/default-server.svg'
                  }
                  alt={infraction.hub.name}
                  width={40}
                  height={40}
                  className="rounded-full border-2 border-gray-700"
                />
                <div>
                  <div className="font-medium text-white">
                    {infraction.hub.name}
                  </div>
                  <div className="text-gray-400 text-sm">Hub</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="premium-card">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                variant="outline"
                className="w-full border-gray-700/50 bg-gray-800/50 hover:bg-gray-700/50"
                asChild
              >
                <Link href={`/dashboard/hubs/${hubId}/infractions`}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Infractions
                </Link>
              </Button>

              {isUserInfraction && (
                <Button
                  variant="outline"
                  className="w-full border-blue-700/50 bg-blue-950/20 text-blue-400 hover:bg-blue-900/30"
                  asChild
                >
                  <Link
                    href={`/dashboard/hubs/${hubId}/infractions?userId=${infraction.userId}`}
                  >
                    <User className="mr-2 h-4 w-4" />
                    View User Infractions
                  </Link>
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Edit Duration Dialog */}
      <Dialog open={isEditDurationOpen} onOpenChange={setIsEditDurationOpen}>
        <DialogContent className="border-gray-800 bg-gray-900">
          <DialogHeader>
            <DialogTitle>Edit Infraction Duration</DialogTitle>
            <DialogDescription>
              Modify when this infraction expires. This action will be logged.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id={permanentCheckboxId}
                checked={isPermanent}
                onChange={(e) => setIsPermanent(e.target.checked)}
                className="rounded border-gray-600 bg-gray-800 text-purple-500 focus:ring-purple-500"
              />
              <Label htmlFor={permanentCheckboxId} className="text-sm">
                Make permanent (no expiration)
              </Label>
            </div>

            {!isPermanent && (
              <div className="space-y-2">
                <Label
                  htmlFor={expiresAtFieldId}
                  className="font-medium text-sm"
                >
                  Expires At
                </Label>
                <Input
                  id={expiresAtFieldId}
                  type="datetime-local"
                  value={newExpiresAt}
                  onChange={(e) => setNewExpiresAt(e.target.value)}
                  min={new Date().toISOString().slice(0, 16)}
                  className="border-gray-700 bg-gray-800"
                />
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDurationOpen(false)}
              disabled={isUpdating}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdateDuration}
              disabled={isUpdating || (!isPermanent && !newExpiresAt)}
              className="bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600"
            >
              {isUpdating ? 'Updating...' : 'Update Duration'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
