'use client';

import { ConnectionsList } from '@/components/dashboard/hubs/connections-list';
import { useConnections, useRemoveConnection } from '@/hooks/use-connections';

export interface ServerData {
  id: string;
  name: string | null;
  iconUrl: string | null;
}

export interface BasicHubConnection {
  id: string;
  serverId: string;
  channelId: string;
  connected: boolean;
  createdAt: Date;
  lastActive: Date;
  hubId: string;
  invite?: string | null;
}

interface ClientConnectionsListProps {
  initialConnections: (BasicHubConnection & { server: ServerData | null })[];
  hubId: string;
  canManage: boolean;
}

export function ClientConnectionsList({
  initialConnections,
  hubId,
  canManage,
}: ClientConnectionsListProps) {
  // Use Tanstack Query to fetch and manage connections data
  const { data: connections = initialConnections, isLoading } =
    useConnections(hubId);

  // Use Tanstack Query mutation for removing connections
  const removeConnectionMutation = useRemoveConnection(hubId);

  // Handle connection removal
  const handleConnectionRemoved = (connectionId: string) => {
    removeConnectionMutation.remove(connectionId);
  };

  return (
    <ConnectionsList
      connections={connections}
      hubId={hubId}
      canManage={canManage}
      isLoading={isLoading}
      onConnectionRemoved={handleConnectionRemoved}
    />
  );
}
