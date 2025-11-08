import { notFound, redirect } from 'next/navigation';
import { auth } from '@/auth';
import { AutomodDashboard } from '@/components/features/dashboard/hubs/AutomodDashboard';
import { HubLayout } from '@/components/features/dashboard/hubs/HubLayout';
import { PermissionLevel } from '@/lib/constants';
import { getUserHubPermission } from '@/lib/permissions';
import { db } from '@/lib/prisma';

interface HubAntiSwearPageProps {
  params: Promise<{
    hubId: string;
  }>;
}

export default async function HubAntiSwearPage({
  params,
}: HubAntiSwearPageProps) {
  const { hubId } = await params;
  const session = await auth();

  if (!session?.user?.id) {
    redirect(`/login?callbackUrl=/dashboard/hubs/${hubId}/anti-swear`);
  }

  const permissionLevel = await getUserHubPermission(session.user.id, hubId);
  const canEdit = permissionLevel >= PermissionLevel.MANAGER;
  const canModerate = permissionLevel >= PermissionLevel.MODERATOR;

  if (permissionLevel < PermissionLevel.MODERATOR) {
    redirect(`/dashboard/hubs/${hubId}`);
  }

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
      currentTab="anti-swear"
      canModerate={canModerate}
      canEdit={canEdit}
    >
      <AutomodDashboard
        hubId={hubId}
        canEdit={canEdit}
        canModerate={canModerate}
      />
    </HubLayout>
  );
}
