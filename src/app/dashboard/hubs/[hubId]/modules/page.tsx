import { AlertCircle } from 'lucide-react';
import { headers } from 'next/headers';
import { notFound, redirect } from 'next/navigation';
import { auth } from '@/auth';
import { HubLayout } from '@/components/dashboard/hubs/hub-layout';
import { HubModulesForm } from '@/components/dashboard/hubs/hub-modules-form';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { PermissionLevel } from '@/lib/constants';
import { getUserHubPermission } from '@/lib/permissions';
import { db } from '@/lib/prisma';

interface HubModulesPageProps {
  params: Promise<{
    hubId: string;
  }>;
}

export default async function HubModulesPage({ params }: HubModulesPageProps) {
  const { hubId } = await params;
const session = await auth()

  if (!session?.user?.id) {
    redirect(`/login?callbackUrl=/dashboard/hubs/${hubId}/modules`);
  }

  const permissionLevel = await getUserHubPermission(session.user.id, hubId);
  const canEdit = permissionLevel >= PermissionLevel.MANAGER;
  const canModerate = permissionLevel >= PermissionLevel.MODERATOR;

  if (permissionLevel === PermissionLevel.NONE) {
    notFound();
  }

  const hub = await db.hub.findUnique({
    where: { id: hubId },
    select: {
      id: true,
      name: true,
      description: true,
      private: true,
      settings: true,
      iconUrl: true,
      bannerUrl: true,
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
      currentTab="modules"
      canModerate={canModerate}
      canEdit={canEdit}
    >
      <Card className="border border-gray-800/50 bg-gradient-to-b from-gray-900/80 to-gray-950/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>Hub Modules</CardTitle>
          <CardDescription>
            Configure hub modules and preferences
          </CardDescription>
        </CardHeader>
        <CardContent>
          {canEdit ? (
            <HubModulesForm hubId={hubId} initialModules={hub.settings || 0} />
          ) : (
            <div className="flex items-center justify-center p-6">
              <AlertCircle className="mr-2 h-5 w-5 text-amber-500" />
              <p className="text-gray-400">
                You don&apos;t have permission to edit this hub.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </HubLayout>
  );
}
