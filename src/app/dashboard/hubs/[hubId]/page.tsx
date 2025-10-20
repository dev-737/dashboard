import { Globe } from 'lucide-react';
import type { Metadata } from 'next';
import { headers } from 'next/headers';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { auth } from '@/auth';
import { DeleteHubDialog } from '@/components/features/dashboard/hubs/DeleteHubDialog';
import { HubLayout } from '@/components/features/dashboard/hubs/HubLayout';
import { Button } from '@/components/ui/button';
import { PermissionLevel } from '@/lib/constants';
import { getUserHubPermission } from '@/lib/permissions';
import { db } from '@/lib/prisma';
import { HubEditForm } from '@/components/forms/HubEditForm';

interface HubEditPageProps {
  params: Promise<{
    hubId: string;
  }>;
}

export async function generateMetadata({
  params,
}: HubEditPageProps): Promise<Metadata> {
  const { hubId } = await params;
  const hub = await db.hub.findUnique({
    where: { id: hubId },
    select: { name: true },
  });

  return {
    title: hub
      ? `Edit ${hub.name} | InterChat Dashboard`
      : 'Edit Hub | InterChat Dashboard',
    description:
      'Manage your InterChat hub modules, appearance, and configuration',
  };
}

export default async function HubEditPage({ params }: HubEditPageProps) {
  const { hubId } = await params;
  const session = await auth();

  if (!session?.user?.id) {
    redirect(`/login?callbackUrl=/dashboard/hubs/${hubId}`);
  }

  const permissionLevel = await getUserHubPermission(session.user.id, hubId);
  const canEdit = permissionLevel >= PermissionLevel.MANAGER;
  const isOwner = permissionLevel === PermissionLevel.OWNER;

  if (permissionLevel === PermissionLevel.NONE) {
    notFound();
  }

  if (!canEdit) {
    redirect(`/dashboard/hubs/${hubId}`);
  }

  // Fetch hub data with all necessary relations
  const hub = await db.hub.findUnique({
    where: { id: hubId },
    include: {
      tags: {
        select: { name: true },
      },
      _count: {
        select: {
          connections: {
            where: { connected: true },
          },
          upvotes: true,
        },
      },
    },
  });

  if (!hub) {
    notFound();
  }

  // Transform data for client component
  const hubData = {
    id: hub.id,
    name: hub.name,
    description: hub.description,
    private: hub.private,
    welcomeMessage: hub.welcomeMessage,
    rules: hub.rules,
    bannerUrl: hub.bannerUrl,
    iconUrl: hub.iconUrl,
    language: hub.language,
    nsfw: hub.nsfw,
    tags: hub.tags.map((tag) => tag.name),
    connectionCount: hub._count.connections,
    isOwner,
    canEdit,
  };

  // Prepare hub data for the layout (only the required fields)
  const hubLayoutData = {
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
      hub={hubLayoutData}
      currentTab="edit"
      canModerate={permissionLevel >= PermissionLevel.MODERATOR}
      canEdit={canEdit}
      headerActions={
        <div className="flex items-center gap-3">
          <Button
            asChild
            variant="outline"
            className="border-gray-700 hover:bg-gray-800 hover:text-white"
          >
            <Link href={`/hubs/${hubId}`}>
              <Globe className="mr-2 h-4 w-4" />
              View Public
            </Link>
          </Button>

          {isOwner && <DeleteHubDialog hubId={hubId} hubName={hubData.name} />}
        </div>
      }
    >
      <div className="space-y-8">
        <div className="container mx-auto space-y-8 p-6">
          <HubEditForm hubData={hubData} />
        </div>
      </div>
    </HubLayout>
  );
}
