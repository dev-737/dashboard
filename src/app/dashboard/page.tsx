import { MessageSquare, PlusCircle, Server } from 'lucide-react';
import type { Metadata } from 'next';
import { headers } from 'next/headers';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import {
  getServers,
  type ServerDataWithConnections,
} from '@/actions/server-actions';
import { AnimatedWelcome } from '@/components/features/dashboard/AnimatedWelcome';
import { AnimatedEmptyState } from '@/components/features/dashboard/hubs/AnimatedEmptyState';
import { AnimatedHubCard } from '@/components/features/dashboard/hubs/AnimatedHubCard';
import { ServerGrid } from '@/components/features/dashboard/servers/ServerGrid';
import { UnderlinedTabs } from '@/components/features/dashboard/UnderlinedTabs';
import { PageFooter } from '@/components/layout/DashboardPageFooter';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { TabsContent } from '@/components/ui/tabs';
import { auth } from '@/lib/auth';
import { getUserHubs } from '@/lib/permissions';
import { db } from '@/lib/prisma';

export const metadata: Metadata = {
  title: 'Dashboard | InterChat',
  description: 'InterChat Dashboard - Manage your hubs, servers, and users',
};

export default async function DashboardPage(props: {
  searchParams: Promise<{ hubId?: string; tab?: string }>;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  const { hubId, tab } = await props.searchParams;
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
        visibility: true,
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

  return (
    <div className="space-y-8">
      {/* Animated Welcome Hero */}
      <AnimatedWelcome user={session.user} />

      {/* Hub Connection Flow Banner */}
      {targetHub && (
        <Card className="border-indigo-500/50 bg-linear-to-r from-indigo-900/20 to-purple-900/20 backdrop-blur-sm">
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
                className="border-none bg-linear-to-r from-blue-600 to-indigo-600 text-white shadow-lg hover:from-blue-700 hover:to-indigo-700"
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
              <Card className="border-gray-800/50 bg-dash-main backdrop-blur-sm">
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
                    className="border-none bg-linear-to-r from-blue-600 to-indigo-600 text-white shadow-lg hover:from-blue-700 hover:to-indigo-700"
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
                className="border-none bg-linear-to-r from-[#6352BE]/80 to-[#6352BE]/50 text-white shadow-lg "
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
