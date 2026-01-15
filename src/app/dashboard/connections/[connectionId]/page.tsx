import { ArrowLeft, Edit, ExternalLink, Globe, Server } from 'lucide-react';
import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { getServers } from '@/actions/server-actions';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { ConnectionNavigationTabs } from '@/components/features/dashboard/connections/ConnectionNavigationTabs';
import { ConnectionOverview } from '@/components/features/dashboard/connections/ConnectionOverview';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { db } from '@/lib/prisma';

export async function generateMetadata(props: {
  params: Promise<{ connectionId: string }>;
}): Promise<Metadata> {
  const params = await props.params;
  return {
    title: `Connection ${params.connectionId} | InterChat Dashboard`,
    description: 'View and manage this connection',
  };
}

// Server-side function to fetch connection data
async function getConnectionData(connectionId: string) {
  const session = await auth.api.getSession({
    headers: await headers()
  });
  if (!session?.user?.id) {
    redirect(`/login?callbackUrl=/dashboard/connections/${connectionId}`);
  }

  const connection = await db.connection.findUnique({
    where: { id: connectionId },
    include: {
      hub: {
        select: {
          id: true,
          name: true,
          description: true,
          ownerId: true,
          iconUrl: true,
          bannerUrl: true,
          welcomeMessage: true,
          private: true,
          locked: true,
          appealCooldownHours: true,
          lastActive: true,
          settings: true,
          createdAt: true,
          updatedAt: true,
          nsfw: true,
          verified: true,
          partnered: true,
          language: true,
          region: true,
          rules: true,
        },
      },
      server: {
        select: {
          id: true,
          name: true,
          iconUrl: true,
          createdAt: true,
          updatedAt: true,
          inviteCode: true,
          messageCount: true,
          lastMessageAt: true,
        },
      },
    },
  });

  if (!connection) {
    notFound();
  }

  // Check if user has permission to view this connection
  // User needs Discord server "Manage Channels" permission ONLY
  // Hub moderators/owners no longer have access to individual connection edit pages
  try {
    const serversResult = await getServers(session);

    if ('data' in serversResult) {
      const userServers = serversResult.data;
      // getServers() already filters for servers where user has Manage Channels permission (0x10)
      // So if the server is in the list, the user has the required permissions
      const hasServerAccess = userServers.some((server) =>
        server.connections.some((conn) => conn.id === connectionId)
      );

      if (hasServerAccess) {
        return connection;
      }
    }
  } catch (error) {
    console.error('Error checking server access:', error);
    // If we can't check server permissions due to rate limiting, deny access for security
  }

  // User doesn't have permission to view this connection
  // Only Discord server moderators with "Manage Channels" permission can access
  notFound();
}

export default async function ConnectionPage(props: {
  params: Promise<{ connectionId: string }>;
}) {
  const params = await props.params;
  const connection = await getConnectionData(params.connectionId);

  return (
    <div className="space-y-6">
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            className="border-gray-700 bg-gray-800/50 hover:bg-gray-700/50 hover:text-white"
            asChild
          >
            <Link href="/dashboard?tab=connections">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Connections
            </Link>
          </Button>
          <div>
            <h1 className="font-bold text-xl tracking-tight sm:text-2xl">
              Connection Details
            </h1>
            <p className="mt-1 text-gray-400 text-sm">
              View and manage this connection
            </p>
          </div>
        </div>
        <Button
          asChild
          size="sm"
          className="border-none bg-linear-to-r from-blue-600 to-purple-600 px-6 font-medium text-white hover:from-blue-700 hover:to-purple-700"
        >
          <Link href={`/dashboard/connections/${params.connectionId}/edit`}>
            <Edit className="mr-2 h-4 w-4" />
            Edit Connection
          </Link>
        </Button>
      </div>
      <ConnectionNavigationTabs
        connectionId={params.connectionId}
        currentTab="overview"
      />
      <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-3">
        <div className="md:col-span-2">
          <ConnectionOverview connection={connection} />
        </div>

        <div className="space-y-6">
          {/* Hub Information Card */}
          <Card className="border border-gray-800/50 bg-dash-main backdrop-blur-sm">
            <CardHeader className="px-6 py-4">
              <div className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-purple-400" />
                <CardTitle className="text-lg">Connected Hub</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="px-6 pb-6">
              <div className="rounded-lg border border-gray-800/50 bg-gray-900/20 p-4 transition-colors hover:bg-gray-900/30">
                <div className="flex items-center gap-3">
                  <Image
                    src={connection.hub.iconUrl || '/assets.images/pfp1.png'}
                    alt={connection.hub.name || 'Hub'}
                    width={48}
                    height={48}
                    className="rounded-full border border-gray-700"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-white">
                      {connection.hub.name}
                    </div>
                    <div className="line-clamp-2 text-gray-400 text-sm">
                      {connection.hub.description}
                    </div>
                  </div>
                </div>
                <div className="mt-3 border-gray-800 border-t pt-3">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full border-gray-700 bg-gray-800/50 hover:bg-gray-700/50"
                    asChild
                  >
                    <Link href={`/hubs/${connection.hub.id}`} target="_blank">
                      <ExternalLink className="mr-2 h-4 w-4" />
                      View Hub Details
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Server Information Card */}
          <Card className="border border-gray-800/50 bg-dash-main backdrop-blur-sm">
            <CardHeader className="px-6 py-4">
              <div className="flex items-center gap-2">
                <Server className="h-5 w-5 text-indigo-400" />
                <CardTitle className="text-lg">Discord Server</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="px-6 pb-6">
              <div className="rounded-lg border border-gray-800/50 bg-gray-900/20 p-4 transition-colors hover:bg-gray-900/30">
                <div className="flex items-center gap-3">
                  <Image
                    src={`https://api.dicebear.com/7.x/identicon/svg?seed=${connection.server.id}`}
                    alt={connection.server.name || 'Server'}
                    width={48}
                    height={48}
                    className="rounded-full border border-gray-700"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-white">
                      {connection.server.name}
                    </div>
                    <div className="text-gray-400 text-sm">Discord Server</div>
                  </div>
                </div>
                <div className="mt-3 border-gray-800 border-t pt-3">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full border-gray-700 bg-gray-800/50 hover:bg-gray-700/50"
                    asChild
                  >
                    <Link href={`/dashboard/servers/${connection.server.id}`}>
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Manage Server
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions Card */}
          <Card className="border border-gray-800/50 bg-dash-main backdrop-blur-sm">
            <CardHeader className="px-6 py-4">
              <div className="flex items-center gap-2">
                <Edit className="h-5 w-5 text-blue-400" />
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="px-6 pb-6">
              <Button
                asChild
                className="h-12 w-full border-none bg-linear-to-r from-blue-600 to-purple-600 font-medium text-white hover:from-blue-700 hover:to-purple-700"
              >
                <Link
                  href={`/dashboard/connections/${params.connectionId}/edit`}
                >
                  <Edit className="mr-2 h-5 w-5" />
                  Edit Connection
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
