import { notFound } from 'next/navigation';
import { auth } from '@/auth';
import { HubLayout } from '@/components/features/dashboard/hubs/HubLayout';
import { HydrationBoundaryProvider } from '@/components/providers/HydrationBoundary';
import { PermissionLevel } from '@/lib/constants';
import { createDehydratedState } from '@/lib/create-dehydrated-state';
import { getUserHubPermission } from '@/lib/permissions';
import { db } from '@/lib/prisma';
import { MessagesClient } from './client';

interface MessagesPageProps {
  params: Promise<{
    hubId: string;
  }>;
}

export default async function MessagesPage({ params }: MessagesPageProps) {
  const { hubId } = await params;
  const session = await auth();

  if (!session?.user?.id) {
    return notFound();
  }

  // Get user's permission level for this hub
  const permissionLevel = await getUserHubPermission(session.user.id, hubId);
  const canModerate = permissionLevel >= PermissionLevel.MODERATOR;
  const canEdit = permissionLevel >= PermissionLevel.MANAGER;

  // If user doesn't have permission, return 404
  if (!canModerate) {
    return notFound();
  }

  // Fetch hub data
  const hub = await db.hub.findUnique({
    where: { id: hubId },
    select: {
      id: true,
      name: true,
      description: true,
      iconUrl: true,
      bannerUrl: true,
      private: true,
      nsfw: true,
      _count: {
        select: {
          connections: {
            where: { connected: true },
          },
        },
      },
    },
  });

  if (!hub) {
    notFound();
  }

  // Create dehydrated state for React Query
  const dehydratedState = await createDehydratedState(async () => {});

  // Prepare hub data for the layout
  const hubData = {
    id: hub.id,
    name: hub.name,
    description: hub.description,
    iconUrl: hub.iconUrl,
    bannerUrl: hub.bannerUrl,
    private: hub.private,
    nsfw: hub.nsfw,
    connectionCount: hub._count.connections,
  };

  return (
    <HubLayout
      hub={hubData}
      currentTab="messages"
      canModerate={canModerate}
      canEdit={canEdit}
    >
      <HydrationBoundaryProvider state={dehydratedState}>
        <MessagesClient />
      </HydrationBoundaryProvider>
    </HubLayout>
  );
}
