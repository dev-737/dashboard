import { headers } from 'next/headers';
import { notFound } from 'next/navigation';
import { HubLayout } from '@/components/features/dashboard/hubs/HubLayout';
import { HydrationBoundaryProvider } from '@/components/providers/HydrationBoundary';
import { auth } from '@/lib/auth';
import { PermissionLevel } from '@/lib/constants';
import { createDehydratedState } from '@/lib/create-dehydrated-state';
import { getUserHubPermission } from '@/lib/permissions';
import { db } from '@/lib/prisma';
import { MembersClient } from './client';

// We'll use the same query key format as in the hook, but define it directly here

interface HubMembersPageProps {
  params: Promise<{
    hubId: string;
  }>;
}

export default async function HubMembersPage({ params }: HubMembersPageProps) {
  const { hubId } = await params;
  const session = await auth.api.getSession({
    headers: await headers(),
  });

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
      visibility: true,
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
  const dehydratedState = await createDehydratedState(async (queryClient) => {
    // Prefetch hub members
    await queryClient.prefetchQuery({
      queryKey: ['hubMembers', hubId],
      queryFn: async () => {
        const hubMembers = await db.hub.findUnique({
          where: { id: hubId },
          select: {
            owner: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
            moderators: {
              select: {
                id: true,
                userId: true,
                role: true,
                user: {
                  select: {
                    id: true,
                    name: true,
                    image: true,
                  },
                },
              },
            },
          },
        });

        if (!hubMembers) {
          throw new Error('Hub not found');
        }

        return {
          owner: hubMembers.owner,
          moderators: hubMembers.moderators,
        };
      },
    });
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
    connectionCount: hub._count.connections,
  };

  return (
    <HubLayout
      hub={hubData}
      currentTab="members"
      canModerate={canModerate}
      canEdit={canEdit}
    >
      <HydrationBoundaryProvider state={dehydratedState}>
        <MembersClient hubId={hubId} />
      </HydrationBoundaryProvider>
    </HubLayout>
  );
}
