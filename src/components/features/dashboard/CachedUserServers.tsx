import { cacheLife, cacheTag } from 'next/cache';
import { PlusCircle, Server } from 'lucide-react';
import Link from 'next/link';
import type { Session } from 'next-auth';
import { getServers } from '@/actions/server-actions';
import { ServerGrid } from '@/components/features/dashboard/servers/ServerGrid';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

interface CachedUserServersProps {
  session: Omit<Session, 'expires'>;
  targetHubId?: string;
}

/**
 * Cached wrapper component for user's Discord servers.
 * Uses private cache since data is user-specific.
 * MUST be wrapped in a Suspense boundary.
 */
export async function CachedUserServers({
  session,
  targetHubId,
}: CachedUserServersProps) {
  'use cache: private';
  cacheLife('user-data');
  cacheTag('user-servers', `user-${session.user.id}-servers`);

  // Get servers with a timeout
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

  // Handle errors
  if ('error' in serversResult) {
    return (
      <Card className="border-gray-800/50 bg-gradient-to-br from-gray-900/60 to-gray-950/60 backdrop-blur-sm">
        <CardHeader className="py-12 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10">
            <Server className="h-6 w-6 text-red-400" />
          </div>
          <CardTitle className="mb-2 text-xl">Error Loading Servers</CardTitle>
          <CardDescription className="mx-auto max-w-md text-gray-400">
            {serversResult.error}
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const servers = serversResult.data;

  if (servers.length === 0) {
    return (
      <Card className="border-gray-800/50 bg-gradient-to-br from-gray-900/60 to-gray-950/60 backdrop-blur-sm">
        <CardHeader className="py-12 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-500/10">
            <Server className="h-6 w-6 text-blue-400" />
          </div>
          <CardTitle className="mb-2 text-xl">No Servers Found</CardTitle>
          <CardDescription className="mx-auto max-w-md text-gray-400">
            Add InterChat to your Discord servers to get started managing
            connections and communities.
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
    );
  }

  return (
    <ServerGrid
      servers={servers}
      showConnectButton={!!targetHubId}
      selectedHubId={targetHubId}
    />
  );
}
