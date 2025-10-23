import { Bell, FileText, Gavel, Globe, Shield } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { auth } from '@/auth';
import { DeleteHubDialog } from '@/components/features/dashboard/hubs/DeleteHubDialog';
import { HubLayout } from '@/components/features/dashboard/hubs/HubLayout';
import { HubEditForm } from '@/components/forms/HubEditForm';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PermissionLevel } from '@/lib/constants';
import { getUserHubPermission } from '@/lib/permissions';
import { db } from '@/lib/prisma';

interface HubOverviewPageProps {
  params: Promise<{
    hubId: string;
  }>;
}

export async function generateMetadata({
  params,
}: HubOverviewPageProps): Promise<Metadata> {
  const { hubId } = await params;
  const hub = await db.hub.findUnique({
    where: { id: hubId },
    select: { name: true },
  });

  return {
    title: hub
      ? `${hub.name} | InterChat Dashboard`
      : 'Hub Dashboard | InterChat',
    description:
      'Manage your InterChat hub modules, appearance, and configuration',
  };
}

export default async function HubOverviewPage({
  params,
}: HubOverviewPageProps) {
  const { hubId } = await params;
  const session = await auth();

  if (!session?.user?.id) {
    notFound();
  }

  const permissionLevel = await getUserHubPermission(session.user.id, hubId);
  const canModerate = permissionLevel >= PermissionLevel.MODERATOR;
  const canEdit = permissionLevel >= PermissionLevel.MANAGER;
  const isOwner = permissionLevel === PermissionLevel.OWNER;

  // Require at least moderator permission to access hub dashboard
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

  // Fetch moderation stats for moderators
  const moderationStats = canModerate
    ? await db.$transaction([
        db.hubReport.count({
          where: { hubId, status: 'PENDING' },
        }),
        db.appeal.count({
          where: {
            status: 'PENDING',
            infraction: { hubId },
          },
        }),
        db.infraction.count({
          where: {
            hubId,
            status: 'ACTIVE',
          },
        }),
      ])
    : [0, 0, 0];

  const [pendingReports, pendingAppeals, activeInfractions] = moderationStats;

  // If user is moderator (not manager), show read-only overview
  if (canModerate && !canEdit) {
    return (
      <HubLayout
        hub={hubLayoutData}
        currentTab="overview"
        canModerate={canModerate}
        canEdit={canEdit}
        headerActions={
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
        }
      >
        <div className="space-y-6">
          {/* Hub Information Card */}
          <Card className="rounded-2xl border-gray-700/50 bg-gray-900/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Hub Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-medium text-gray-400 text-sm">Name</h3>
                <p className="mt-1 text-base text-white">{hub.name}</p>
              </div>
              {hub.description && (
                <div>
                  <h3 className="font-medium text-gray-400 text-sm">
                    Description
                  </h3>
                  <p className="mt-1 text-base text-gray-200">
                    {hub.description}
                  </p>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium text-gray-400 text-sm">
                    Visibility
                  </h3>
                  <p className="mt-1 text-base text-white">
                    {hub.private ? 'Private' : 'Public'}
                  </p>
                </div>
                <div>
                  <h3 className="font-medium text-gray-400 text-sm">NSFW</h3>
                  <p className="mt-1 text-base text-white">
                    {hub.nsfw ? 'Yes' : 'No'}
                  </p>
                </div>
              </div>
              <div>
                <h3 className="font-medium text-gray-400 text-sm">
                  Connected Servers
                </h3>
                <p className="mt-1 text-base text-white">
                  {hub._count.connections}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Moderation Quick Actions */}
          <div>
            <h2 className="mb-4 font-semibold text-lg text-white">
              Moderation Tools
            </h2>
            <div className="grid gap-4 md:grid-cols-3">
              <Link href={`/dashboard/hubs/${hubId}/reports`}>
                <Card className="cursor-pointer rounded-2xl border-gray-700/50 bg-gradient-to-br from-red-900/20 to-red-950/20 transition-all hover:border-red-500/50 hover:shadow-lg hover:shadow-red-500/10">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center justify-between text-base">
                      <div className="flex items-center gap-2">
                        <Shield className="h-5 w-5 text-red-400" />
                        <span>Reports</span>
                      </div>
                      {pendingReports > 0 && (
                        <span className="rounded-full bg-red-500/20 px-2 py-1 font-semibold text-red-300 text-xs">
                          {pendingReports}
                        </span>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-400 text-sm">
                      Review and manage content reports
                    </p>
                  </CardContent>
                </Card>
              </Link>

              <Link href={`/dashboard/hubs/${hubId}/appeals`}>
                <Card className="cursor-pointer rounded-2xl border-gray-700/50 bg-gradient-to-br from-orange-900/20 to-orange-950/20 transition-all hover:border-orange-500/50 hover:shadow-lg hover:shadow-orange-500/10">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center justify-between text-base">
                      <div className="flex items-center gap-2">
                        <Bell className="h-5 w-5 text-orange-400" />
                        <span>Appeals</span>
                      </div>
                      {pendingAppeals > 0 && (
                        <span className="rounded-full bg-orange-500/20 px-2 py-1 font-semibold text-orange-300 text-xs">
                          {pendingAppeals}
                        </span>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-400 text-sm">
                      Review infraction appeals
                    </p>
                  </CardContent>
                </Card>
              </Link>

              <Link href={`/dashboard/hubs/${hubId}/infractions`}>
                <Card className="cursor-pointer rounded-2xl border-gray-700/50 bg-gradient-to-br from-purple-900/20 to-purple-950/20 transition-all hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-500/10">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center justify-between text-base">
                      <div className="flex items-center gap-2">
                        <Gavel className="h-5 w-5 text-purple-400" />
                        <span>Infractions</span>
                      </div>
                      {activeInfractions > 0 && (
                        <span className="rounded-full bg-purple-500/20 px-2 py-1 font-semibold text-purple-300 text-xs">
                          {activeInfractions}
                        </span>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-400 text-sm">
                      Manage bans, mutes, and warnings
                    </p>
                  </CardContent>
                </Card>
              </Link>
            </div>
          </div>
        </div>
      </HubLayout>
    );
  }

  // For managers and owners, show the edit form
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
      hub={hubLayoutData}
      currentTab="overview"
      canModerate={canModerate}
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
      <div className="space-y-6">
        <HubEditForm hubData={hubData} />
      </div>
    </HubLayout>
  );
}
