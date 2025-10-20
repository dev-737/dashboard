import { headers } from 'next/headers';
import { notFound, redirect } from 'next/navigation';
import { auth } from '@/auth';
import { HubLayout } from '@/components/features/dashboard/hubs/HubLayout';
import { HydrationBoundaryProvider } from '@/components/providers/HydrationBoundary';
import { PermissionLevel } from '@/lib/constants';
import { createDehydratedState } from '@/lib/create-dehydrated-state';
import { getUserHubPermission } from '@/lib/permissions';
import { db } from '@/lib/prisma';
import { InfractionsClient } from './client';

interface HubInfractionsPageProps {
  params: Promise<{
    hubId: string;
  }>;
}

export default async function HubInfractionsPage({
  params,
}: HubInfractionsPageProps) {
  const { hubId } = await params;
  const session = await auth();

  if (!session?.user?.id) {
    redirect(`/login?callbackUrl=/dashboard/hubs/${hubId}/infractions`);
  }

  // Check if user has at least moderator permissions
  const permissionLevel = await getUserHubPermission(session.user.id, hubId);

  if (permissionLevel < PermissionLevel.MODERATOR) {
    notFound();
  }

  // Get hub details
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

  const canModerate = permissionLevel >= PermissionLevel.MODERATOR;
  const canEdit = permissionLevel >= PermissionLevel.MANAGER;

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

  // Create dehydrated state for React Query
  const dehydratedState = await createDehydratedState(async () => {
    // No prefetching needed for this page
  });

  return (
    <HubLayout
      hub={hubData}
      currentTab="infractions"
      canModerate={canModerate}
      canEdit={canEdit}
    >
      <HydrationBoundaryProvider state={dehydratedState}>
        <InfractionsClient hubId={hubId} />
      </HydrationBoundaryProvider>
    </HubLayout>
  );
}
