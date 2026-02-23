import {
  AlertCircleIcon,
  CheckmarkCircle01Icon,
  File01Icon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { headers } from 'next/headers';
import { notFound, redirect } from 'next/navigation';
import { HubLayout } from '@/components/features/dashboard/hubs/HubLayout';
import { HubLoggingForm } from '@/components/features/dashboard/hubs/HubLoggingForm';
import { Card, CardContent } from '@/components/ui/card';
import { auth } from '@/lib/auth';
import { PermissionLevel } from '@/lib/constants';
import { getUserHubPermission } from '@/lib/permissions';
import { db } from '@/lib/prisma';

interface HubLoggingPageProps {
  params: Promise<{
    hubId: string;
  }>;
}

export default async function HubLoggingPage({
  params: paramsPromise,
}: HubLoggingPageProps) {
  const { hubId } = await paramsPromise;
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    redirect('/login');
  }

  // Get the user's permission level for this hub
  const permissionLevel = await getUserHubPermission(session.user.id, hubId);
  const canModerate = permissionLevel >= PermissionLevel.MODERATOR;
  const canEdit = permissionLevel >= PermissionLevel.MANAGER;

  // If the user doesn't have permission to edit the hub, redirect to the hub overview
  if (!canEdit) {
    redirect(`/dashboard/hubs/${hubId}`);
  }

  // Get the hub data
  const hub = await db.hub.findUnique({
    where: { id: hubId },
    include: {
      logConfig: true,
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
    visibility: hub.visibility,
    nsfw: hub.nsfw,
    connectionCount: hub._count.connections,
  };

  // Get logging stats
  const logConfig = hub.logConfig;
  const configuredLogs = logConfig
    ? [
        logConfig.modLogsChannelId ? 'modLogs' : null,
        logConfig.joinLeavesChannelId ? 'joinLeaves' : null,
        logConfig.appealsChannelId ? 'appeals' : null,
        logConfig.reportsChannelId ? 'reports' : null,
        logConfig.networkAlertsChannelId ? 'networkAlerts' : null,
        logConfig.messageModerationChannelId ? 'messageModeration' : null,
      ].filter(Boolean)
    : [];

  return (
    <HubLayout
      hub={hubData}
      currentTab="logging"
      canModerate={canModerate}
      canEdit={canEdit}
    >
      <div className="space-y-8">
        <div className="space-y-6">
          {/* Configuration Header */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h2 className="flex items-center gap-3 font-bold text-2xl text-white">
                <div className="rounded-(--radius-button) bg-indigo-500/20 p-2">
                  <HugeiconsIcon
                    icon={File01Icon}
                    className="h-6 w-6 text-indigo-400"
                  />
                </div>
                Logging Configuration
              </h2>
              <p className="text-gray-400">
                Configure Discord channels to receive notifications about
                different hub activities and events.
              </p>
            </div>
            {configuredLogs.length > 0 && (
              <div className="flex items-center gap-2 rounded-(--radius-badge) border border-emerald-500/30 bg-emerald-500/20 px-3 py-1.5">
                <HugeiconsIcon
                  icon={CheckmarkCircle01Icon}
                  className="h-4 w-4 text-emerald-400"
                />
                <span className="font-medium text-emerald-400 text-sm">
                  {configuredLogs.length} Active
                </span>
              </div>
            )}
          </div>

          {/* Main Configuration Card */}
          <Card className="premium-card overflow-hidden">
            <CardContent className="p-0">
              {canEdit ? (
                <HubLoggingForm
                  hubId={hubId}
                  initialLogConfig={hub.logConfig || null}
                />
              ) : (
                <div className="flex flex-col items-center justify-center p-12 text-center">
                  <div className="mb-4 rounded-(--radius-modal) bg-amber-500/20 p-4">
                    <HugeiconsIcon
                      icon={AlertCircleIcon}
                      className="h-8 w-8 text-amber-400"
                    />
                  </div>
                  <h3 className="mb-2 font-semibold text-lg text-white">
                    Access Restricted
                  </h3>
                  <p className="max-w-md text-gray-400">
                    You need manager permissions to configure logging settings
                    for this hub. Contact a hub manager to make changes.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </HubLayout>
  );
}
