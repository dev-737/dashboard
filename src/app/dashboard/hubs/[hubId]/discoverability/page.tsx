import { Globe, Palette } from 'lucide-react';
import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { notFound, redirect } from 'next/navigation';
import { auth } from '@/auth';
import { HubLayout } from '@/components/features/dashboard/hubs/HubLayout';
import { PermissionLevel } from '@/lib/constants';
import { getUserHubPermission } from '@/lib/permissions';
import { db } from '@/lib/prisma';
import { HubDiscoverabilityForm } from '@/components/forms/HubDiscoverabilityForm';

interface HubDiscoverabilityPageProps {
  params: Promise<{
    hubId: string;
  }>;
}

export async function generateMetadata({
  params,
}: HubDiscoverabilityPageProps): Promise<Metadata> {
  const { hubId } = await params;
  const hub = await db.hub.findUnique({
    where: { id: hubId },
    select: { name: true },
  });

  return {
    title: hub
      ? `${hub.name} Discoverability | InterChat Dashboard`
      : 'Hub Discoverability | InterChat Dashboard',
    description:
      'Manage your InterChat hub discoverability settings, tags, and language',
  };
}

export default async function HubDiscoverabilityPage({
  params,
}: HubDiscoverabilityPageProps) {
  const { hubId } = await params;
  const session = await auth();

  if (!session?.user?.id) {
    redirect(`/login?callbackUrl=/dashboard/hubs/${hubId}/discoverability`);
  }

  const permissionLevel = await getUserHubPermission(session.user.id, hubId);
  const canEdit = permissionLevel >= PermissionLevel.MANAGER;
  const isOwner = permissionLevel === PermissionLevel.OWNER;

  if (permissionLevel === PermissionLevel.NONE) {
    notFound();
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

  return (
    <HubLayout
      hub={hubData}
      currentTab="edit"
      canModerate={permissionLevel >= PermissionLevel.MODERATOR}
      canEdit={canEdit}
    >
      <div className="container mx-auto space-y-8 p-6">
        {/* Feature Overview */}
        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="rounded-lg border border-blue-500/20 bg-gradient-to-br from-blue-500/10 to-cyan-600/10 p-6">
            <div className="mb-3 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/20">
                <Palette className="h-5 w-5 text-blue-400" />
              </div>
              <h3 className="font-semibold text-white">Appearance</h3>
            </div>
            <p className="text-gray-400 text-sm">
              Customize your hub&apos;s visual identity with banners, icons, and
              branding
            </p>
          </div>

          <div className="rounded-lg border border-green-500/20 bg-gradient-to-br from-green-500/10 to-emerald-600/10 p-6">
            <div className="mb-3 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/20">
                <Globe className="h-5 w-5 text-green-400" />
              </div>
              <h3 className="font-semibold text-white">Discovery</h3>
            </div>
            <p className="text-gray-400 text-sm">
              Manage tags, language settings, and content preferences for better
              discoverability
            </p>
          </div>
          <div className="rounded-lg border border-yellow-500/20 bg-gradient-to-br from-yellow-500/10 to-amber-600/10 p-6">
            <div className="mb-3 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-500/20">
                <Globe className="h-5 w-5 text-yellow-400" />
              </div>
              <h3 className="font-semibold text-white">NSFW Configuration</h3>
            </div>
            <p className="text-gray-400 text-sm">
              Configure your hub&apos;s NSFW settings and content filtering
              options
            </p>
          </div>
        </div>

        <HubDiscoverabilityForm hubData={hubData} />
      </div>
    </HubLayout>
  );
}
