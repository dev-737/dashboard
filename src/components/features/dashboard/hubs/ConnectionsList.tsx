'use client';

import {
  Cancel01Icon,
  Clock01Icon,
  Delete02Icon,
  HashtagIcon,
  Home01Icon,
  LegalHammerIcon,
  MoreVerticalIcon,
  Search01Icon,
  ServerStackIcon,
  UserMultipleIcon,
  Wifi01Icon,
  WifiDisconnected01Icon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';

import { useMutation } from '@tanstack/react-query';
import { formatDistanceToNow } from 'date-fns';
import Image from 'next/image';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import type { BasicHubConnection } from '@/app/dashboard/hubs/[hubId]/connections/client';
import { DeleteConnectionDialog } from '@/components/features/dashboard/connections/DeleteConnectionDialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/DropdownMenu';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { useTRPC } from '@/utils/trpc';

interface ServerData {
  id: string;
  name: string | null;
  iconUrl: string | null;
}

interface SimpleConnectionsListProps {
  connections: (BasicHubConnection & { server: ServerData | null })[];
  hubId: string;
  canManage: boolean;
  isLoading?: boolean;
  onConnectionRemoved?: (connectionId: string) => void;
}

export function ConnectionsList({
  connections,
  hubId,
  canManage,
  isLoading = false,
  onConnectionRemoved,
}: SimpleConnectionsListProps) {
  const trpc = useTRPC();

  const router = useRouter();

  // Simple state management
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredConnections, setFilteredConnections] = useState(connections);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [connectionToDelete, setConnectionToDelete] = useState<{
    id: string;
    serverName: string;
  } | null>(null);

  // tRPC mutation for removing connections
  const removeConnectionMutation = useMutation(
    trpc.connection.remove.mutationOptions({
      onSuccess: (_, variables) => {
        const connectionToRemove = connections.find(
          (c) => c.id === variables.connectionId
        );
        const serverName = connectionToRemove?.server?.name || 'Unknown Server';

        toast.success(`Connection to ${serverName} removed`, {
          description: `Disconnection from ${serverName} was successful`,
        });

        // Trigger callback to update the UI
        if (onConnectionRemoved) {
          onConnectionRemoved(variables.connectionId);
        }
      },
      onError: (error) => {
        console.error('Error removing connection:', error);
        toast.error('Error', {
          description: 'Failed to remove connection. Please try again.',
        });
      },
    })
  );

  // Update filtered connections when connections or search changes
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredConnections(connections);
      return;
    }

    const filtered = connections.filter(
      (connection) =>
        connection.server?.name
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        connection.serverId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        connection.channelId.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredConnections(filtered);
  }, [connections, searchQuery]);

  // Action handlers
  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text).then(
      () => {
        toast.success('Copied to Clipboard', {
          description: `${label} copied to clipboard`,
        });
      },
      (err) => {
        console.error('Could not copy text: ', err);
        toast.error('Error', {
          description: 'Failed to copy to clipboard',
        });
      }
    );
  };

  const handleRemoveConnection = (connectionId: string, serverName: string) => {
    setConnectionToDelete({ id: connectionId, serverName });
    setDeleteDialogOpen(true);
  };

  const handleConfirmRemove = (connectionId: string) => {
    removeConnectionMutation.mutate({ connectionId });
  };

  const handleBlacklistServer = (serverId: string) => {
    const params = new URLSearchParams();
    params.set('hubId', hubId);
    params.set('serverId', serverId);
    router.push(`/dashboard/moderation/blacklist/add?${params.toString()}`);
  };

  const connectedCount = connections.filter((c) => c.connected).length;
  const pausedCount = connections.filter((c) => !c.connected).length;

  if (isLoading) {
    return (
      <Card className="border border-gray-800/50 bg-dash-main backdrop-blur-sm">
        <CardHeader>
          <CardTitle>Server Connections</CardTitle>
          <CardDescription>Loading connections...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={`connection-skeleton-${i + 1}`}
                className="flex items-center gap-4 rounded-lg border border-gray-800/50 p-4"
              >
                <Skeleton className="h-12 w-12 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <Skeleton className="h-8 w-8" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border border-gray-800/50 bg-dash-main backdrop-blur-sm">
      <CardHeader className="border-gray-800/30 border-b pb-4">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div className="space-y-1">
              <CardTitle className="flex items-center gap-2 font-bold text-white text-xl">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-linear-to-br from-blue-500 to-indigo-600">
                  <HugeiconsIcon
                    icon={ServerStackIcon}
                    className="h-4 w-4 text-white"
                  />
                </div>
                Server Connections
              </CardTitle>
              <CardDescription className="text-gray-400 text-sm">
                {connections.length} server{connections.length !== 1 ? 's' : ''}{' '}
                connected to this hub
              </CardDescription>
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2 rounded-full border border-green-500/20 bg-green-500/10 px-3 py-1.5">
              <div className="h-2 w-2 animate-pulse rounded-full bg-green-500"></div>
              <span className="font-medium text-green-400">
                {connectedCount} active
              </span>
            </div>
            <div className="flex items-center gap-2 rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1.5">
              <div className="h-2 w-2 rounded-full bg-amber-500"></div>
              <span className="font-medium text-amber-400">
                {pausedCount} paused
              </span>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6 pt-6">
        {/* Simple Search01Icon */}
        <div className="relative">
          <HugeiconsIcon
            icon={Search01Icon}
            className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400"
          />
          <Input
            placeholder="Search01Icon servers by name or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-12 rounded-xl border-gray-700/50 bg-gray-800/30 pl-10 text-white placeholder:text-gray-500 focus:border-blue-500/50"
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute top-1/2 right-2 h-8 w-8 -translate-y-1/2 rounded-lg p-0 hover:bg-gray-700/50"
              onClick={() => setSearchQuery('')}
            >
              <HugeiconsIcon
                strokeWidth={3}
                icon={Cancel01Icon}
                className="h-4 w-4"
              />
            </Button>
          )}
        </div>

        {/* Connections List */}
        {connections.length === 0 ? (
          <div className="px-4 py-12 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-800/50">
              <HugeiconsIcon
                icon={Home01Icon}
                className="h-8 w-8 text-gray-500"
              />
            </div>
            <h3 className="mb-2 font-medium text-lg text-white">
              No Connections
            </h3>
            <p className="mx-auto mb-6 max-w-sm text-gray-400">
              This hub is not connected to any Discord servers yet. Connect your
              first server to start building your community.
            </p>
          </div>
        ) : filteredConnections.length === 0 ? (
          <div className="px-4 py-12 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-800/50">
              <HugeiconsIcon
                icon={Search01Icon}
                className="h-8 w-8 text-gray-500"
              />
            </div>
            <h3 className="mb-2 font-medium text-lg text-white">
              No Results Found
            </h3>
            <p className="mb-4 text-gray-400">
              No servers match your search criteria.
            </p>
            <Button
              variant="outline"
              onClick={() => setSearchQuery('')}
              className="h-10 border-gray-700/50 px-4 text-gray-300 hover:bg-gray-800/50 hover:text-white"
            >
              Clear Search01Icon
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredConnections.map((connection) => (
              <ConnectionItem
                key={connection.id}
                connection={connection}
                canManage={canManage}
                onCopy={copyToClipboard}
                onRemove={handleRemoveConnection}
                onBlacklist={handleBlacklistServer}
              />
            ))}
          </div>
        )}
      </CardContent>

      {/* Delete Connection Modal */}
      {connectionToDelete && (
        <DeleteConnectionDialog
          connectionId={connectionToDelete.id}
          serverName={connectionToDelete.serverName}
          onConfirm={handleConfirmRemove}
          isLoading={removeConnectionMutation.isPending}
          open={deleteDialogOpen}
          onOpenChange={(open) => {
            setDeleteDialogOpen(open);
            if (!open) {
              setConnectionToDelete(null);
            }
          }}
        />
      )}
    </Card>
  );
}

// Separate component for each connection item
interface ConnectionItemProps {
  connection: BasicHubConnection & { server: ServerData | null };
  canManage: boolean;
  onCopy: (text: string, label: string) => void;
  onRemove: (connectionId: string, serverName: string) => void;
  onBlacklist: (serverId: string) => void;
}

function ConnectionItem({
  connection,
  canManage,
  onCopy,
  onRemove,
  onBlacklist,
}: ConnectionItemProps) {
  return (
    <div className="group relative rounded-xl border border-gray-800/50 bg-linear-to-r from-gray-800/20 to-gray-800/10 p-4 transition-all duration-200 hover:border-gray-700/70 hover:from-gray-800/40 hover:to-gray-800/30">
      <div className="flex items-center gap-4">
        {/* Server Icon */}
        <div className="relative shrink-0">
          <div className="h-12 w-12 overflow-hidden rounded-xl border border-gray-700/50 bg-linear-to-br from-gray-700 to-gray-800 sm:h-14 sm:w-14">
            {connection.server?.iconUrl ? (
              <Image
                src={connection.server.iconUrl}
                alt={connection.server.name || 'Server'}
                width={56}
                height={56}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <HugeiconsIcon
                  icon={UserMultipleIcon}
                  className="h-6 w-6 text-gray-400"
                />
              </div>
            )}
          </div>

          {/* Status Indicator */}
          <div className="absolute -right-1 -bottom-1 flex h-4 w-4 items-center justify-center rounded-full border-2 border-gray-900">
            {connection.connected ? (
              <div className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
            ) : (
              <div className="h-2 w-2 rounded-full bg-amber-500" />
            )}
          </div>
        </div>

        {/* Server InformationCircleIcon */}
        <div className="min-w-0 flex-1">
          <div className="mb-2 flex flex-col gap-2 sm:flex-row sm:items-center">
            <h4 className="truncate font-semibold text-base text-white">
              {connection.server?.name || 'Unknown Server'}
            </h4>
            <Badge
              variant={connection.connected ? 'default' : 'secondary'}
              className={`w-fit rounded-full px-2 py-1 font-medium text-xs ${
                connection.connected
                  ? 'border-green-500/40 bg-green-500/20 text-green-300'
                  : 'border-amber-500/40 bg-amber-500/20 text-amber-300'
              }`}
            >
              {connection.connected ? (
                <>
                  <HugeiconsIcon
                    strokeWidth={3}
                    icon={Wifi01Icon}
                    className="mr-1 h-3 w-3"
                  />
                  Active
                </>
              ) : (
                <>
                  <HugeiconsIcon
                    icon={WifiDisconnected01Icon}
                    className="mr-1 h-3 w-3"
                  />
                  Paused
                </>
              )}
            </Badge>
          </div>

          {/* Connection details */}
          <div className="flex flex-col gap-2 text-gray-400 text-sm sm:flex-row sm:items-center sm:gap-4">
            <div className="flex items-center gap-1">
              <HugeiconsIcon
                strokeWidth={3}
                icon={HashtagIcon}
                className="h-3 w-3 shrink-0"
              />
              <span className="truncate font-mono text-xs">
                {connection.channelId}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <HugeiconsIcon
                strokeWidth={3}
                icon={Clock01Icon}
                className="h-3 w-3 shrink-0"
              />
              <span className="truncate text-xs">
                {formatDistanceToNow(new Date(connection.lastActive), {
                  addSuffix: true,
                })}
              </span>
            </div>
          </div>
        </div>

        {/* Actions Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 rounded-lg p-0 opacity-0 transition-opacity hover:bg-gray-700/50 group-hover:opacity-100 sm:opacity-100"
            >
              <HugeiconsIcon
                strokeWidth={3}
                icon={MoreVerticalIcon}
                className="h-4 w-4"
              />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="border-gray-800 bg-gray-900"
          >
            <DropdownMenuItem
              onClick={() => onCopy(connection.serverId, 'Server ID')}
              className="text-gray-300 hover:bg-gray-800 hover:text-white"
            >
              <HugeiconsIcon
                strokeWidth={3}
                icon={ServerStackIcon}
                className="mr-2 h-4 w-4"
              />
              Copy01Icon Server ID
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onCopy(connection.channelId, 'Channel ID')}
              className="text-gray-300 hover:bg-gray-800 hover:text-white"
            >
              <HugeiconsIcon
                strokeWidth={3}
                icon={HashtagIcon}
                className="mr-2 h-4 w-4"
              />
              Copy01Icon Channel ID
            </DropdownMenuItem>
            {canManage && (
              <>
                <DropdownMenuSeparator className="bg-gray-800" />
                <DropdownMenuItem
                  onClick={() => onBlacklist(connection.serverId)}
                  className="text-orange-300 hover:bg-orange-600/10 hover:text-orange-200"
                >
                  <HugeiconsIcon
                    icon={LegalHammerIcon}
                    className="mr-2 h-4 w-4"
                  />
                  Blacklist Server
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() =>
                    onRemove(
                      connection.id,
                      connection.server?.name || 'Unknown Server'
                    )
                  }
                  className="text-red-300 hover:bg-red-600/10 hover:text-red-200"
                >
                  <HugeiconsIcon
                    strokeWidth={3}
                    icon={Delete02Icon}
                    className="mr-2 h-4 w-4"
                  />
                  Remove Connection
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
