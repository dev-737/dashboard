import { MessageSquare, PlusCircle, Server } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import {
  getServers,
  type ServerDataWithConnections,
} from '@/actions/server-actions';
import { auth } from '@/auth';
import { AnimatedDashboardSkeleton } from '@/components/dashboard/animated-dashboard-skeleton';
import { AnimatedWelcome } from '@/components/dashboard/animated-welcome';
import { AnimatedEmptyState } from '@/components/dashboard/hubs/animated-empty-state';
import { AnimatedHubCard } from '@/components/dashboard/hubs/animated-hub-card';
import { PageFooter } from '@/components/dashboard/page-footer';
import { ServerGrid } from '@/components/dashboard/servers/server-grid';
// import { StatCard } from '@/components/dashboard/stat-card';
import { UnderlinedTabs } from '@/components/dashboard/underlined-tabs';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { TabsContent } from '@/components/ui/tabs';
import { getUserHubs } from '@/lib/permissions';
import { db } from '@/lib/prisma';

export const metadata: Metadata = {
  title: 'Dashboard | InterChat',
  description: 'InterChat Dashboard - Manage your hubs, servers, and users',
};

export default function DashboardPage(props: {
  searchParams: Promise<{ hubId?: string; tab?: string }>;
}) {
  return (
    <Suspense fallback={<AnimatedDashboardSkeleton />}>
      <DashboardContent searchParams={props.searchParams} />
    </Suspense>
  );
}

async function DashboardContent({
  searchParams,
}: {
  searchParams: Promise<{ hubId?: string; tab?: string }>;
}) {
  const session = await auth();
  const { hubId, tab } = await searchParams;

  if (!session?.user?.id) {
    redirect('/login?callbackUrl=/dashboard');
  }

  // Get user's hubs
  const userHubs = await getUserHubs(session.user.id);

  // If hubId is provided, check if it's a valid hub for connection
  let targetHub = null;
  if (hubId) {
    targetHub = await db.hub.findUnique({
      where: { id: hubId },
      select: {
        id: true,
        name: true,
        description: true,
        iconUrl: true,
        private: true,
      },
    });
  }

  // Get servers using the server action with a timeout
  const serversPromise = getServers(session);
  const timeoutPromise = new Promise<{ error: string; status: number }>(
    (resolve) => {
      setTimeout(() => {
        resolve({
          error: 'Request timed out. Please refresh the page to try again.',
          status: 408,
        });
      }, 10000); // 10 second timeout
    }
  );

  const serversResult = await Promise.race([serversPromise, timeoutPromise]);

  let servers: ServerDataWithConnections[] = [];
  if (!('error' in serversResult)) {
    servers = serversResult.data;
  }

  // Get date for filtering recent activity
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

  // Get user's hub IDs
  // const userHubIds = userHubs.map((hub) => hub.id);

  // Optimize dashboard queries by combining them into a single Promise.all
  // const [connections, connectedServers] = await Promise.all([
  //   // Get connections for user's hubs
  //   db.connection.count({
  //     where: {
  //       hubId: { in: userHubIds },
  //       connected: true,
  //     },
  //   }),
  //   // Get servers connected to user's hubs (unique count)
  //   db.connection.groupBy({
  //     by: ['serverId'],
  //     where: {
  //       hubId: { in: userHubIds },
  //       connected: true,
  //     },
  //   }),
  // ]);

  // // Get active hubs count (user's hubs with activity in the last 7 days)
  // const activeHubs = userHubs.filter(
  //   (hub) => new Date(hub.lastActive) >= oneWeekAgo
  // ).length;

  // // Get total message count across user's hubs
  // const totalMessages = userHubs.reduce((sum, hub) => {
  //   // We'll use connections as a proxy for message activity
  //   return sum + (hub.connections?.length || 0);
  // }, 0);

  // // Calculate average messages per day (rough estimate)
  // const avgMessagesPerDay = Math.round(totalMessages / 7); // Assuming weekly activity

  // const stats = {
  //   totalHubs: userHubs.length,
  //   totalConnections: connections,
  //   totalServers: connectedServers.length,
  //   activeHubs,
  //   messagesPerDay: avgMessagesPerDay,
  // };

  return (
    <div className="space-y-8">
      {/* Animated Welcome Hero */}
      <AnimatedWelcome user={session.user as any} />

      {/* Hub Connection Flow Banner */}
      {targetHub && (
        <Card className="border-indigo-500/50 bg-gradient-to-r from-indigo-900/20 to-purple-900/20 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-500/20">
                <MessageSquare className="h-6 w-6 text-indigo-400" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg text-white">
                  Connect Server to {targetHub.name}
                </h3>
                <p className="mt-1 text-gray-400 text-sm">
                  Choose a server below to connect to this hub, or switch to the
                  &quot;My Servers&quot; tab to get started.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Cards */}
      {/* <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Your Hubs"
          value={stats.totalHubs.toLocaleString()}
          description="Hubs you own or moderate"
          iconName="MessageSquare"
          index={0}
          color="purple"
        />
        <StatCard
          title="Connections"
          value={stats.totalConnections.toLocaleString()}
          description="Active channel connections"
          iconName="BarChart3"
          index={1}
          color="blue"
        />
        <StatCard
          title="Connected Servers"
          value={stats.totalServers.toLocaleString()}
          description="Discord servers in your hubs"
          iconName="Server"
          index={2}
          color="emerald"
        />
        <StatCard
          title="Active Hubs"
          value={stats.activeHubs.toLocaleString()}
          description="Hubs with recent activity"
          iconName="Activity"
          index={3}
          color="red"
        />
      </div> */}

      {/* Main Dashboard Content with Tabs */}
      <div className="space-y-6">
        {/* Main Content - Servers and Hubs Tabs */}
        <UnderlinedTabs
          defaultValue={tab === 'hubs' ? 'hubs' : 'servers'}
          className="w-full space-y-6"
          tabs={[
            {
              value: 'servers',
              label: 'My Servers',
              color: 'blue',
              icon: <Server className="h-4 w-4" />,
            },
            {
              value: 'hubs',
              label: 'My Hubs',
              color: 'purple',
              icon: <MessageSquare className="h-4 w-4" />,
            },
          ]}
        >
          <TabsContent value="servers" className="space-y-6">
            <div className="flex flex-col justify-between gap-4 pb-4 sm:flex-row sm:items-center">
              <div>
                <h2 className="mt-4 font-bold text-2xl text-white tracking-tight">
                  My Servers
                </h2>
                <p className="mt-1 text-gray-400">
                  Manage your Discord servers connected to InterChat
                </p>
              </div>
              <Button
                asChild
                className="border-none bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg hover:from-blue-700 hover:to-indigo-700"
              >
                <Link
                  href="https://discord.com/oauth2/authorize?client_id=769921109209907241"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add Bot to Server
                </Link>
              </Button>
            </div>

            {servers.length === 0 ? (
              <Card className="border-gray-800/50 bg-gradient-to-br from-gray-900/60 to-gray-950/60 backdrop-blur-sm">
                <CardHeader className="py-12 text-center">
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-500/10">
                    <Server className="h-6 w-6 text-blue-400" />
                  </div>
                  <CardTitle className="mb-2 text-xl">
                    No Servers Found
                  </CardTitle>
                  <CardDescription className="mx-auto max-w-md text-gray-400">
                    Add InterChat to your Discord servers to get started
                    managing connections and communities.
                  </CardDescription>
                </CardHeader>
                <CardContent className="pb-12 text-center">
                  <Button
                    asChild
                    size="lg"
                    className="border-none bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg hover:from-blue-700 hover:to-indigo-700"
                  >
                    <Link
                      href="https://discord.com/oauth2/authorize?client_id=769921109209907241"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Add Bot to Server
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <ServerGrid
                servers={servers}
                showConnectButton={!!targetHub}
                selectedHubId={targetHub?.id}
              />
            )}
          </TabsContent>

          <TabsContent value="hubs" className="space-y-6">
            <div className="flex flex-col justify-between gap-4 pb-4 sm:flex-row sm:items-center">
              <div>
                <h2 className="mt-4 font-bold text-2xl tracking-tight">
                  My Hubs
                </h2>
                <p className="mt-1 text-gray-400">
                  Manage your InterChat hubs and connections
                </p>
              </div>
              <Button
                asChild
                className="border-none bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg hover:from-purple-700 hover:to-indigo-700"
              >
                <Link href="/dashboard/hubs/create">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Create Hub
                </Link>
              </Button>
            </div>

            {userHubs.length === 0 ? (
              <AnimatedEmptyState type="owned" />
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 lg:gap-6">
                {userHubs.map((hub, index) => (
                  <AnimatedHubCard key={hub.id} hub={hub} index={index} />
                ))}
              </div>
            )}
          </TabsContent>
        </UnderlinedTabs>

        {/* Page Footer - provides scroll space for mobile prompts */}
        <PageFooter
          height="md"
          message="Welcome to your InterChat dashboard! 🎉"
        />
      </div>
    </div>
  );
}
