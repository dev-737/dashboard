import {
  AlertCircle,
  CheckCircle,
  FileText,
  MessageSquare,
  Shield,
  TrendingUp,
  XCircle,
} from 'lucide-react';
import { headers } from 'next/headers';
import { notFound, redirect } from 'next/navigation';
import { auth } from '@/auth';
import { HubLayout } from '@/components/features/dashboard/hubs/HubLayout';
import { HubLoggingForm } from '@/components/features/dashboard/hubs/HubLoggingForm';
import { Card, CardContent } from '@/components/ui/card';
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
const session = await auth()

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
    private: hub.private,
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
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {/* Total Configured Logs */}
          <Card className="premium-card group transition-all duration-300 hover:scale-[1.02]">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="font-medium text-gray-400 text-sm">
                    Configured Logs
                  </p>
                  <div className="flex items-baseline gap-2">
                    <p className="font-bold text-3xl text-white">
                      {configuredLogs.length}
                    </p>
                    <p className="text-gray-500 text-sm">/6</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="h-2 w-16 overflow-hidden rounded-full bg-gray-800">
                      <div
                        className="h-full bg-gradient-to-r from-emerald-500 to-green-400 transition-all duration-500"
                        style={{
                          width: `${(configuredLogs.length / 6) * 100}%`,
                        }}
                      />
                    </div>
                    <span className="text-gray-500 text-xs">
                      {Math.round((configuredLogs.length / 6) * 100)}%
                    </span>
                  </div>
                </div>
                <div className="rounded-[var(--radius-button)] bg-emerald-500/20 p-3 transition-colors group-hover:bg-emerald-500/30">
                  <FileText className="h-6 w-6 text-emerald-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Moderation Status */}
          <Card className="premium-card group transition-all duration-300 hover:scale-[1.02]">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="font-medium text-gray-400 text-sm">
                    Moderation
                  </p>
                  <div className="flex items-center gap-2">
                    {logConfig?.modLogsChannelId ? (
                      <>
                        <CheckCircle className="h-4 w-4 text-green-400" />
                        <span className="font-semibold text-green-400 text-lg">
                          Active
                        </span>
                      </>
                    ) : (
                      <>
                        <XCircle className="h-4 w-4 text-red-400" />
                        <span className="font-semibold text-lg text-red-400">
                          Inactive
                        </span>
                      </>
                    )}
                  </div>
                  <p className="text-gray-500 text-xs">
                    Moderation logging status
                  </p>
                </div>
                <div className="rounded-[var(--radius-button)] bg-indigo-500/20 p-3 transition-colors group-hover:bg-indigo-500/30">
                  <Shield className="h-6 w-6 text-indigo-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Message Logs Status */}
          <Card className="premium-card group transition-all duration-300 hover:scale-[1.02]">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="font-medium text-gray-400 text-sm">Messages</p>
                  <div className="flex items-center gap-2">
                    {logConfig?.messageModerationChannelId ? (
                      <>
                        <CheckCircle className="h-4 w-4 text-green-400" />
                        <span className="font-semibold text-green-400 text-lg">
                          Active
                        </span>
                      </>
                    ) : (
                      <>
                        <XCircle className="h-4 w-4 text-red-400" />
                        <span className="font-semibold text-lg text-red-400">
                          Inactive
                        </span>
                      </>
                    )}
                  </div>
                  <p className="text-gray-500 text-xs">
                    Message logging status
                  </p>
                </div>
                <div className="rounded-[var(--radius-button)] bg-purple-500/20 p-3 transition-colors group-hover:bg-purple-500/30">
                  <MessageSquare className="h-6 w-6 text-purple-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* System Health */}
          <Card className="premium-card group transition-all duration-300 hover:scale-[1.02]">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="font-medium text-gray-400 text-sm">
                    System Health
                  </p>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 animate-pulse rounded-full bg-green-400" />
                    <span className="font-semibold text-green-400 text-lg">
                      Healthy
                    </span>
                  </div>
                  <p className="text-gray-500 text-xs">
                    All systems operational
                  </p>
                </div>
                <div className="rounded-[var(--radius-button)] bg-green-500/20 p-3 transition-colors group-hover:bg-green-500/30">
                  <TrendingUp className="h-6 w-6 text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="space-y-6">
          {/* Configuration Header */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h2 className="flex items-center gap-3 font-bold text-2xl text-white">
                <div className="rounded-[var(--radius-button)] bg-indigo-500/20 p-2">
                  <FileText className="h-6 w-6 text-indigo-400" />
                </div>
                Logging Configuration
              </h2>
              <p className="text-gray-400">
                Configure Discord channels to receive notifications about
                different hub activities and events.
              </p>
            </div>
            {configuredLogs.length > 0 && (
              <div className="flex items-center gap-2 rounded-[var(--radius-badge)] border border-emerald-500/30 bg-emerald-500/20 px-3 py-1.5">
                <CheckCircle className="h-4 w-4 text-emerald-400" />
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
                  <div className="mb-4 rounded-[var(--radius-modal)] bg-amber-500/20 p-4">
                    <AlertCircle className="h-8 w-8 text-amber-400" />
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
