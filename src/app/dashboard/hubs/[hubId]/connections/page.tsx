import { Plus } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { HubLayout } from '@/components/features/dashboard/hubs/HubLayout';
import { HydrationBoundaryProvider } from '@/components/providers/HydrationBoundary';
import { Button } from '@/components/ui/button';
import { PermissionLevel } from '@/lib/constants';
import { createDehydratedState } from '@/lib/create-dehydrated-state';
import { getUserHubPermission } from '@/lib/permissions';
import { db } from '@/lib/prisma';
import { ClientConnectionsList } from './client';

interface HubConnectionsPageProps {
  params: Promise<{
    hubId: string;
  }>;
}

export default async function HubConnectionsPage({
  params,
}: HubConnectionsPageProps) {
  const hubId = (await params).hubId;
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session?.user?.id) {
    return notFound();
  }

  // Create dehydrated state for React Query
  const dehydratedState = await createDehydratedState(async (queryClient) => {
    // Prefetch connections for this hub
    await queryClient.prefetchQuery({
      queryKey: ['connections', hubId],
      queryFn: async () => {
        const connections = await db.connection.findMany({
          where: { hubId },
      visibility: true,
            id: true,
            serverId: true,
            channelId: true,
            connected: true,
            createdAt: true,
            lastActive: true,
            invite: true,
            hubId: true,
            server: {
              select: {
                id: true,
                name: true,
                iconUrl: true,
              },
            },
          },
          orderBy: { lastActive: 'desc' },
        });
        return connections;
      },
    });
  });

  // Get user's permission level for this hub
  const permissionLevel = await getUserHubPermission(session.user.id, hubId);
  const canModerate = permissionLevel >= PermissionLevel.MODERATOR;
  const canEdit = permissionLevel >= PermissionLevel.MANAGER;

  // Get hub details
  const hub = await db.hub.findUnique({
    where: { id: hubId },
    select: {
      id: true,
      name: true,
      description: true,
      visibility: true,
      ownerId: true,
      nsfw: true,
      iconUrl: true,
      bannerUrl: true,
    },
  });

  if (!hub) {
    return notFound();
  }
  // Only allow users with at least moderator permissions
  if (permissionLevel < PermissionLevel.MODERATOR) {
    return notFound();
  }

  // Get connections for this hub
  const connections = await db.connection.findMany({
    where: { hubId },
    select: {
      id: true,
      serverId: true,
      channelId: true,
      connected: true,
      createdAt: true,
      lastActive: true,
      invite: true,
      hubId: true,
      server: {
        select: {
          id: true,
          name: true,
          iconUrl: true,
        },
      },
    },
    orderBy: { lastActive: 'desc' },
  });

  // Prepare hub data for the layout
  const hubData = {
    id: hub.id,
    name: hub.name,
    description: hub.description,
    iconUrl: hub.iconUrl,
    bannerUrl: hub.bannerUrl,
    visibility: hub.visibility,
    nsfw: hub.nsfw,
    connectionCount: connections.filter((c) => c.connected).length,
  };

  // Header actions - Mobile optimized
  const headerActions = canEdit ? (
    <Button
      asChild
      className="h-10 touch-manipulation border-none bg-linear-to-r from-blue-600 to-indigo-600 px-3 text-sm hover:from-blue-600/80 hover:to-indigo-600/80 sm:h-9 sm:px-4"
    >
      <Link href={`/dashboard?hubId=${hubId}`}>
        <Plus className="mr-2 h-4 w-4" />
        <span className="xs:inline hidden">Connect Server</span>
        <span className="xs:hidden">Connect</span>
      </Link>
    </Button>
  ) : null;

  return (
    <HubLayout
      hub={hubData}
      currentTab="connections"
      canModerate={canModerate}
      canEdit={canEdit}
      headerActions={headerActions}
    >
      {/* Use the ClientConnectionsList component with the fetched data */}
      <HydrationBoundaryProvider state={dehydratedState}>
        <ClientConnectionsList
          initialConnections={connections}
          hubId={hubId}
          canManage={canEdit}
        />
      </HydrationBoundaryProvider>
    </HubLayout>
  );
}
