import { headers } from 'next/headers';
import { notFound, redirect } from 'next/navigation';
import { auth } from '@/auth';
import { HubLayout } from '@/components/dashboard/hubs/hub-layout';
import { HydrationBoundaryProvider } from '@/components/providers/hydration-boundary';
import { PermissionLevel } from '@/lib/constants';
import { createDehydratedState } from '@/lib/create-dehydrated-state';
import { getUserHubPermission } from '@/lib/permissions';
import { db } from '@/lib/prisma';
import { ReportsClient } from './client';

interface HubReportsPageProps {
  params: Promise<{
    hubId: string;
  }>;
}

export default async function HubReportsPage({ params }: HubReportsPageProps) {
  const { hubId } = await params;
const session = await auth()

  if (!session?.user?.id) {
    redirect(`/login?callbackUrl=/dashboard/hubs/${hubId}/reports`);
  }

  // Check if user has at least moderator permissions
  const permissionLevel = await getUserHubPermission(session.user.id, hubId);

  if (permissionLevel < PermissionLevel.MODERATOR) {
    // User doesn't have sufficient permissions
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
  const dehydratedState = createDehydratedState(async (queryClient) => {
    // Prefetch recent reports for this hub
    await queryClient.prefetchQuery({
      queryKey: ['hubReports', hubId, 1],
      queryFn: async () => {
        // Fetch reports directly from database for SSR
        const reports = await db.hubReport.findMany({
          where: { hubId },
          include: {
            hub: {
              select: {
                id: true,
                name: true,
                iconUrl: true,
              },
            },
            reporter: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
            reportedUser: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
            handler: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
        });

        // Enhance reports with message and server data
        const reportsWithEnhancedData = await Promise.all(
          reports.map(async (report) => {
            let messageData = null;
            let serverData = null;

            // Fetch message data if messageId exists (with content sanitization)
            if (report.messageId) {
              try {
                const message = await db.message.findUnique({
                  where: { id: report.messageId },
                  select: {
                    id: true,
                    content: true,
                    imageUrl: true,
                    channelId: true,
                    guildId: true,
                    authorId: true,
                    createdAt: true,
                    reactions: true,
                    referredMessageId: true,
                  },
                });

                // Include full message content for proper report review
                if (message) {
                  messageData = {
                    ...message,
                    // Keep full content for thorough report review
                    // Content is already sanitized by Prisma and database constraints
                  };
                }
              } catch (error) {
                console.error(
                  `Failed to fetch message ${report.messageId}:`,
                  error
                );
              }
            }

            // Fetch server data from ServerData model
            if (report.reportedServerId) {
              try {
                serverData = await db.serverData.findUnique({
                  where: { id: report.reportedServerId },
                  select: {
                    id: true,
                    name: true,
                    iconUrl: true,
                  },
                });
              } catch (error) {
                console.error(
                  `Failed to fetch server ${report.reportedServerId}:`,
                  error
                );
              }
            }

            return {
              ...report,
              messageData,
              serverData,
            };
          })
        );

        const total = await db.hubReport.count({
          where: { hubId },
        });

        return { reports: reportsWithEnhancedData, total };
      },
    });
  });

  return (
    <HubLayout
      hub={hubData}
      currentTab="reports"
      canModerate={canModerate}
      canEdit={canEdit}
    >
      <HydrationBoundaryProvider state={await dehydratedState}>
        <ReportsClient hubId={hubId} />
      </HydrationBoundaryProvider>
    </HubLayout>
  );
}
