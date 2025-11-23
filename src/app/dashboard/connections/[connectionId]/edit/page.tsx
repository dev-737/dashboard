import { ArrowLeft, Trash } from 'lucide-react';
import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { getServers } from '@/actions/server-actions';
import { auth } from '@/auth';
import { ConnectionNavigationTabs } from '@/components/features/dashboard/connections/ConnectionNavigationTabs';
import { ConnectionEditFormClient } from '@/components/forms/ConnectionEditForm';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { db } from '@/lib/prisma';

interface ConnectionEditPageProps {
  params: Promise<{
    connectionId: string;
  }>;
}

export async function generateMetadata(
  props: ConnectionEditPageProps
): Promise<Metadata> {
  const { connectionId } = await props.params;
  const connection = await getConnectionForEdit(connectionId);

  if (!connection) {
    return {
      title: 'Connection Not Found - InterChat',
    };
  }

  return {
    title: `Edit ${connection.server?.name || 'Connection'} - InterChat`,
    description: `Edit connection settings for ${connection.server?.name || 'this server'} in ${connection.hub.name}`,
  };
}

async function getConnectionForEdit(connectionId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect('/login');
  }

  // Get connection with related data
  const connection = await db.connection.findUnique({
    where: { id: connectionId },
    include: {
      hub: true,
      server: true,
    },
  });

  if (!connection) {
    return null;
  }

  // Check if user has permission to edit this connection
  // User needs Discord server "Manage Channels" permission ONLY
  // Hub moderators/owners no longer have access to edit individual connections
  try {
    const serversResult = await getServers(session);

    if ('data' in serversResult) {
      const userServers = serversResult.data;
      // getServers() already filters for servers where user has Manage Channels permission (0x10)
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

  // User doesn't have permission to edit this connection
  // Only Discord server moderators with "Manage Channels" permission can access
  return null;
}

export default async function ConnectionEditPage(
  props: ConnectionEditPageProps
) {
  const { connectionId } = await props.params;
  const connection = await getConnectionForEdit(connectionId);

  if (!connection) {
    notFound();
  }

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
            <Link href={`/dashboard/connections/${connectionId}`}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Connection
            </Link>
          </Button>
          <div>
            <h1 className="font-bold text-xl tracking-tight sm:text-2xl">
              Edit Connection
            </h1>
            <p className="mt-1 text-gray-400 text-sm">
              Configure connection settings
            </p>
          </div>
        </div>
      </div>

      <ConnectionNavigationTabs connectionId={connectionId} currentTab="edit" />

      <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-3">
        <div className="md:col-span-2">
          <ConnectionEditFormClient connection={connection} />
        </div>

        <div className="space-y-6">
          {/* Hub Information Card */}
          <Card className="border border-gray-800/50 bg-linear-to-b from-gray-900/80 to-gray-950/80 backdrop-blur-sm">
            <CardHeader className="px-6 py-4">
              <div className="flex items-center gap-2">
                <div className="rounded-lg border border-purple-500/20 bg-purple-500/10 p-2">
                  <Image
                    src={
                      connection.hub.iconUrl ||
                      '/assets/images/defaults/default-hub-icon.png'
                    }
                    alt={connection.hub.name}
                    width={20}
                    height={20}
                    className="rounded"
                  />
                </div>
                <CardTitle className="text-lg">Connected Hub</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="px-6 pb-6">
              <div className="rounded-lg border border-gray-800/50 bg-gray-900/20 p-4 transition-colors hover:bg-gray-900/30">
                <div className="flex items-center gap-3">
                  <div>
                    <h4 className="font-medium text-white">
                      {connection.hub.name}
                    </h4>
                    <p className="mt-1 text-gray-400 text-sm">
                      {connection.hub.description}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Server Information Card */}
          <Card className="border border-gray-800/50 bg-linear-to-b from-gray-900/80 to-gray-950/80 backdrop-blur-sm">
            <CardHeader className="px-6 py-4">
              <div className="flex items-center gap-2">
                <div className="rounded-lg border border-blue-500/20 bg-blue-500/10 p-2">
                  {connection.server?.iconUrl ? (
                    <Image
                      src={connection.server.iconUrl}
                      alt={connection.server.name || 'Server'}
                      width={20}
                      height={20}
                      className="rounded"
                    />
                  ) : (
                    <div className="h-5 w-5 rounded bg-gray-600" />
                  )}
                </div>
                <CardTitle className="text-lg">Discord Server</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="px-6 pb-6">
              <div className="rounded-lg border border-gray-800/50 bg-gray-900/20 p-4">
                <div className="flex items-center gap-3">
                  <div>
                    <h4 className="font-medium text-white">
                      {connection.server?.name || 'Unknown Server'}
                    </h4>
                    <p className="mt-1 text-gray-400 text-sm">
                      Channel: #{connection.channelId}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Danger Zone */}
          <Card className="border border-red-800/50 bg-linear-to-b from-red-900/20 to-red-950/20 backdrop-blur-sm">
            <CardHeader className="px-6 py-4">
              <CardTitle className="text-lg text-red-400">
                Danger Zone
              </CardTitle>
              <CardDescription className="text-red-300/70">
                Irreversible and destructive actions
              </CardDescription>
            </CardHeader>
            <CardContent className="px-6 pb-6">
              <div className="rounded-lg border border-red-800/50 bg-red-900/10 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="mb-1 font-medium text-white">
                      Delete Connection
                    </h4>
                    <p className="text-gray-400 text-sm">
                      Permanently remove this connection. This action cannot be
                      undone.
                    </p>
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="bg-red-600 text-white hover:bg-red-700"
                    asChild
                  >
                    <Link
                      href={`/dashboard/connections/${connectionId}/delete`}
                    >
                      <Trash className="mr-2 h-4 w-4" />
                      Delete
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
