import { Bell, FileText, Gavel, Globe, Home, Shield } from 'lucide-react';
import type { Metadata } from 'next';
import { headers } from 'next/headers';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { DeleteHubDialog } from '@/components/features/dashboard/hubs/DeleteHubDialog';
import { HubLayout } from '@/components/features/dashboard/hubs/HubLayout';
import { HubEditForm } from '@/components/forms/HubEditForm';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { auth } from '@/lib/auth';
import { PermissionLevel } from '@/lib/constants';
import { HubVisibility } from '@/lib/generated/prisma/client/client';
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
  const session = await auth.api.getSession({
    headers: await headers(),
  });

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
    visibility: hub.visibility,
    nsfw: hub.nsfw,
    connectionCount: hub._count.connections,
  };

  // Fetch moderation stats for moderators
  const moderationStats: [number, number] = canModerate
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
      ])
    : [0, 0];

  const [pendingReports, pendingAppeals] = moderationStats;

  // If user is moderator (not manager), show read-only overview
  if (canModerate && !canEdit) {
    return (
      <HubLayout
        hub={hubLayoutData}
        currentTab="overview"
        canModerate={canModerate}
        canEdit={canEdit}
        pendingCounts={{
          reports: pendingReports,
          appeals: pendingAppeals,
        }}
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
          {/* Hub Stats Grid */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="group overflow-hidden rounded-2xl border-gray-700/50 bg-linear-to-br from-blue-900/20 to-blue-950/20 transition-all hover:border-blue-500/50 hover:shadow-blue-500/10 hover:shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <p className="font-medium text-blue-400 text-sm">
                      Connections
                    </p>
                    <p className="font-bold text-3xl text-white">
                      {hub._count.connections}
                    </p>
                    <p className="text-gray-400 text-xs">Active servers</p>
                  </div>
                  <div className="rounded-xl bg-blue-500/10 p-3 transition-all group-hover:bg-blue-500/20">
                    <Home className="h-6 w-6 text-blue-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="group overflow-hidden rounded-2xl border-gray-700/50 bg-linear-to-br from-purple-900/20 to-purple-950/20 transition-all hover:border-purple-500/50">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <p className="font-medium text-purple-400 text-sm">
                      Visibility
                    </p>
                    <p className="font-bold text-2xl text-white">
                      {hub.visibility === HubVisibility.PRIVATE
                        ? 'Private'
                        : 'Public'}
                    </p>
                    <p className="text-gray-400 text-xs">
                      {hub.nsfw ? 'NSFW Content' : 'Safe for Work'}
                    </p>
                  </div>
                  <div className="rounded-xl bg-purple-500/10 p-3 transition-all group-hover:bg-purple-500/20">
                    <Globe className="h-6 w-6 text-purple-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="group overflow-hidden rounded-2xl border-gray-700/50 bg-linear-to-br from-green-900/20 to-green-950/20 transition-all hover:border-green-500/50 hover:shadow-green-500/10 hover:shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <p className="font-medium text-green-400 text-sm">Access</p>
                    <p className="font-bold text-2xl text-white">
                      {canEdit ? 'Manager' : 'Moderator'}
                    </p>
                    <p className="text-gray-400 text-xs">Your hub role</p>
                  </div>
                  <div className="rounded-xl bg-green-500/10 p-3 transition-all group-hover:bg-green-500/20">
                    <Shield className="h-6 w-6 text-green-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Hub Information Card */}
          <Card className="overflow-hidden rounded-2xl border-gray-700/50 bg-gray-900/50 backdrop-blur-sm">
            <CardHeader className="border-gray-700/50 border-b bg-linear-to-r from-gray-800/50 to-gray-900/50">
              <CardTitle className="flex items-center gap-2 text-white">
                <FileText className="h-5 w-5 text-indigo-400" />
                Hub Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 p-6">
              <div>
                <h3 className="mb-2 font-semibold text-gray-300 text-sm uppercase tracking-wide">
                  Name
                </h3>
                <p className="font-medium text-lg text-white">{hub.name}</p>
              </div>
              {hub.description && (
                <div>
                  <h3 className="mb-2 font-semibold text-gray-300 text-sm uppercase tracking-wide">
                    Description
                  </h3>
                  <p className="text-base text-gray-200 leading-relaxed">
                    {hub.description}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Moderation Quick Actions */}
          <div>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-bold text-white text-xl">Moderation Tools</h2>
              <p className="text-gray-400 text-sm">
                Manage your hub's moderation
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <Link href={`/dashboard/hubs/${hubId}/reports`}>
                <Card className="group cursor-pointer overflow-hidden rounded-2xl border-gray-700/50 bg-linear-to-br from-red-900/20 to-red-950/20 transition-all hover:scale-[1.02] hover:border-red-500/50 hover:shadow-red-500/20 hover:shadow-xl">
                  <CardContent className="p-6">
                    <div className="mb-4 flex items-start justify-between">
                      <div className="rounded-xl bg-red-500/10 p-3 transition-all group-hover:scale-110 group-hover:bg-red-500/20">
                        <Shield className="h-6 w-6 text-red-400" />
                      </div>
                      {pendingReports > 0 && (
                        <span className="rounded-full bg-red-500/30 px-2.5 py-1 font-bold text-sm text-white shadow-lg shadow-red-500/30 ring-2 ring-red-500/50">
                          {pendingReports}
                        </span>
                      )}
                    </div>
                    <h3 className="mb-2 font-bold text-white text-xl">
                      Reports
                    </h3>
                    <p className="text-gray-300 text-sm leading-relaxed">
                      Review and manage reports from hub members
                    </p>
                  </CardContent>
                </Card>
              </Link>

              <Link href={`/dashboard/hubs/${hubId}/appeals`}>
                <Card className="group cursor-pointer overflow-hidden rounded-2xl border-gray-700/50 bg-linear-to-br from-orange-900/20 to-orange-950/20 transition-all hover:scale-[1.02] hover:border-orange-500/50 hover:shadow-orange-500/20 hover:shadow-xl">
                  <CardContent className="p-6">
                    <div className="mb-4 flex items-start justify-between">
                      <div className="rounded-xl bg-orange-500/10 p-3 transition-all group-hover:scale-110 group-hover:bg-orange-500/20">
                        <Bell className="h-6 w-6 text-orange-400" />
                      </div>
                      {pendingAppeals > 0 && (
                        <span className="rounded-full bg-orange-500/30 px-2.5 py-1 font-bold text-sm text-white shadow-lg shadow-orange-500/30 ring-2 ring-orange-500/50">
                          {pendingAppeals}
                        </span>
                      )}
                    </div>
                    <h3 className="mb-2 font-bold text-white text-xl">
                      Appeals
                    </h3>
                    <p className="text-gray-300 text-sm leading-relaxed">
                      Review and process infraction appeal requests
                    </p>
                  </CardContent>
                </Card>
              </Link>

              <Link href={`/dashboard/hubs/${hubId}/infractions`}>
                <Card className="group cursor-pointer overflow-hidden rounded-2xl border-gray-700/50 bg-linear-to-br from-purple-900/20 to-purple-950/20 transition-all hover:scale-[1.02] hover:border-purple-500/50 hover:shadow-purple-500/20 hover:shadow-xl">
                  <CardContent className="p-6">
                    <div className="mb-4 flex items-start justify-between">
                      <div className="rounded-xl bg-purple-500/10 p-3 transition-all group-hover:scale-110 group-hover:bg-purple-500/20">
                        <Gavel className="h-6 w-6 text-purple-400" />
                      </div>
                    </div>
                    <h3 className="mb-2 font-bold text-white text-xl">
                      Infractions
                    </h3>
                    <p className="text-gray-300 text-sm leading-relaxed">
                      View and manage bans, mutes, and warnings
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
    visibility: hub.visibility,
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
      pendingCounts={{ reports: pendingReports, appeals: pendingAppeals }}
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
