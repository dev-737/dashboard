'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { formatDistanceToNow } from 'date-fns';
import {
  ExternalLink,
  MoreHorizontal,
  Power,
  PowerOff,
  Settings,
  Trash2,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { DeleteConnectionDialog } from '@/components/features/dashboard/connections/DeleteConnectionDialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/DropdownMenu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useToast } from '@/components/ui/use-toast';
import type { Connection, Hub } from '@/lib/generated/prisma/client/client';
import { useTRPC } from '@/utils/trpc';

interface ServerConnectionsTableProps {
  connections: (Connection & { hub: Hub })[];
}

export function ServerConnectionsTable({
  connections,
}: ServerConnectionsTableProps) {
  const trpc = useTRPC();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Modal state for delete confirmation
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [connectionToDelete, setConnectionToDelete] = useState<{
    id: string;
    hubName: string;
  } | null>(null);

  // tRPC mutations for connection management
  const updateConnectionMutation = useMutation(
    trpc.connection.update.mutationOptions({
      onSuccess: (_data, variables) => {
        toast({
          title: variables.connected
            ? 'Connection enabled'
            : 'Connection disabled',
          description: variables.connected
            ? 'The connection has been enabled successfully.'
            : 'The connection has been disabled successfully.',
        });
        // Invalidate and refetch relevant queries
        queryClient.invalidateQueries(trpc.connection.pathFilter());
      },
      onError: (error) => {
        toast({
          title: 'Error',
          description: error.message || 'Failed to update connection',
          variant: 'destructive',
        });
      },
    })
  );

  const deleteConnectionMutation = useMutation(
    trpc.connection.remove.mutationOptions({
      onSuccess: () => {
        toast({
          title: 'Connection deleted',
          description: 'The connection has been deleted successfully.',
        });
        // Invalidate and refetch relevant queries
        queryClient.invalidateQueries(trpc.connection.pathFilter());
        // Force a page refresh to show updated data
        window.location.reload();
      },
      onError: (error) => {
        toast({
          title: 'Error',
          description: error.message || 'Failed to delete connection',
          variant: 'destructive',
        });
      },
    })
  );

  if (connections.length === 0) {
    return (
      <div className="py-10 text-center">
        <h3 className="mb-2 font-semibold text-xl">No Connections</h3>
        <p className="mb-4 text-gray-400">
          No connections found for this server.
        </p>
      </div>
    );
  }

  // Function to toggle connection status using tRPC
  const toggleConnection = (connectionId: string, connected: boolean) => {
    updateConnectionMutation.mutate({
      connectionId,
      connected: !connected,
    });
  };

  const handleDeleteConnection = (connectionId: string, hubName: string) => {
    setConnectionToDelete({ id: connectionId, hubName });
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = (connectionId: string) => {
    deleteConnectionMutation.mutate({
      connectionId,
    });
  };

  const isLoading =
    updateConnectionMutation.isPending || deleteConnectionMutation.isPending;

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Hub</TableHead>
            <TableHead>Channel ID</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Connected Since</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {connections.map((connection) => {
            const formattedDate = new Date(
              connection.createdAt
            ).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            });

            const timeAgo = formatDistanceToNow(
              new Date(connection.createdAt),
              {
                addSuffix: true,
              }
            );

            return (
              <TableRow key={connection.id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className="h-6 w-6 overflow-hidden rounded-full border border-gray-700/50">
                      <Image
                        src={connection.hub.iconUrl}
                        alt={connection.hub.name}
                        width={24}
                        height={24}
                        className="object-cover"
                        style={{ width: '100%', height: '100%' }}
                      />
                    </div>
                    <span className="font-medium">{connection.hub.name}</span>
                  </div>
                </TableCell>
                <TableCell className="font-mono text-xs">
                  {connection.channelId}
                </TableCell>
                <TableCell>
                  {connection.connected ? (
                    <Badge
                      variant="outline"
                      className="border-green-500/20 bg-green-500/10 text-green-400"
                    >
                      Connected
                    </Badge>
                  ) : (
                    <Badge
                      variant="outline"
                      className="border-red-500/20 bg-red-500/10 text-red-400"
                    >
                      Paused
                    </Badge>
                  )}
                </TableCell>
                <TableCell title={formattedDate}>{timeAgo}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 hover:bg-gray-800/50"
                        disabled={isLoading}
                      >
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      className="border border-gray-800/50 bg-gradient-to-b from-gray-900/95 to-gray-950/95 backdrop-blur-md"
                    >
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator className="bg-gray-800/50" />
                      <DropdownMenuItem className="cursor-pointer hover:bg-gray-800/50">
                        <Link
                          href={`/hubs/${connection.hubId}`}
                          target="_blank"
                          className="flex w-full items-center"
                        >
                          <ExternalLink className="mr-2 h-4 w-4" />
                          View Hub
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem className="cursor-pointer hover:bg-gray-800/50">
                        <Link
                          href={`/dashboard/connections/${connection.id}/edit`}
                          className="flex w-full items-center"
                        >
                          <Settings className="mr-2 h-4 w-4" />
                          Edit Connection
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator className="bg-gray-800/50" />
                      <DropdownMenuItem
                        className={
                          connection.connected
                            ? 'cursor-pointer text-red-400 hover:bg-red-900/30 hover:text-red-300'
                            : 'cursor-pointer text-green-400 hover:bg-green-900/30 hover:text-green-300'
                        }
                        onClick={() =>
                          toggleConnection(connection.id, connection.connected)
                        }
                        disabled={isLoading}
                      >
                        {connection.connected ? (
                          <>
                            <PowerOff className="mr-2 h-4 w-4" />
                            Pause Connection
                          </>
                        ) : (
                          <>
                            <Power className="mr-2 h-4 w-4" />
                            Unpause Connection
                          </>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="cursor-pointer text-red-400 hover:bg-red-900/30 hover:text-red-300"
                        onClick={() => {
                          handleDeleteConnection(
                            connection.id,
                            connection.hub.name
                          );
                        }}
                        disabled={isLoading}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete Connection
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      {/* Delete Connection Modal */}
      {connectionToDelete && (
        <DeleteConnectionDialog
          connectionId={connectionToDelete.id}
          serverName={connectionToDelete.hubName}
          onConfirm={handleConfirmDelete}
          isLoading={deleteConnectionMutation.isPending}
          open={deleteDialogOpen}
          onOpenChange={(open) => {
            setDeleteDialogOpen(open);
            if (!open) {
              setConnectionToDelete(null);
            }
          }}
        />
      )}
    </div>
  );
}
