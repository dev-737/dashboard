import { AlertCircle, Shield } from 'lucide-react';
import { headers } from 'next/headers';
import { notFound, redirect } from 'next/navigation';
import { auth } from '@/auth';
import { AntiSwearForm } from '@/components/dashboard/hubs/anti-swear-form';
import { HubLayout } from '@/components/dashboard/hubs/hub-layout';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { PermissionLevel } from '@/lib/constants';
import { getUserHubPermission } from '@/lib/permissions';
import { db } from '@/lib/prisma';

interface HubAntiSwearPageProps {
  params: Promise<{
    hubId: string;
  }>;
}

export default async function HubAntiSwearPage({
  params,
}: HubAntiSwearPageProps) {
  const { hubId } = await params;
const session = await auth()

  if (!session?.user?.id) {
    redirect(`/login?callbackUrl=/dashboard/hubs/${hubId}/anti-swear`);
  }

  const permissionLevel = await getUserHubPermission(session.user.id, hubId);
  const canEdit = permissionLevel >= PermissionLevel.MANAGER;
  const canModerate = permissionLevel >= PermissionLevel.MODERATOR;

  // Only allow moderators and managers to access this page
  if (permissionLevel < PermissionLevel.MODERATOR) {
    redirect(`/dashboard/hubs/${hubId}`);
  }

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
      blockWords: {
        select: {
          id: true,
          name: true,
        },
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

  return (
    <HubLayout
      hub={hubData}
      currentTab="anti-swear"
      canModerate={canModerate}
      canEdit={canEdit}
    >
      <Card className="mb-6 border border-purple-800/30 bg-gradient-to-b from-gray-900/80 to-gray-950/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-gradient text-transparent">
            <Shield className="mr-2 h-5 w-5 text-purple-400" />
            Anti-Swear Configuration
          </CardTitle>
          <CardDescription>
            Configure word filters to block inappropriate content in your hub
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6 rounded-md border border-amber-800/30 bg-gradient-to-br from-gray-950/80 to-purple-950/10 p-5">
            <div className="flex items-start">
              <AlertCircle className="mt-0.5 mr-3 h-5 w-5 text-amber-500" />
              <div className="space-y-3">
                <p className="font-medium text-amber-200">
                  Pattern Matching Guide
                </p>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <div className="rounded-md border border-gray-800/50 bg-gray-950/70 p-3 transition-all duration-200 hover:border-gray-700/50">
                    <p className="mb-1 font-medium text-purple-300">
                      Exact Match
                    </p>
                    <code className="rounded bg-gray-800/70 px-2 py-1 text-white">
                      word
                    </code>
                    <p className="mt-2 text-gray-300 text-sm">
                      Only matches exactly &quot;word&quot;
                    </p>
                  </div>
                  <div className="rounded-md border border-gray-800/50 bg-gray-950/70 p-3 transition-all duration-200 hover:border-gray-700/50">
                    <p className="mb-1 font-medium text-purple-300">
                      Prefix Match
                    </p>
                    <code className="rounded bg-gray-800/70 px-2 py-1 text-white">
                      word*
                    </code>
                    <p className="mt-2 text-gray-300 text-sm">
                      Matches &quot;word&quot;, &quot;words&quot;,
                      &quot;wordy&quot;
                    </p>
                  </div>
                  <div className="rounded-md border border-gray-800/50 bg-gray-950/70 p-3 transition-all duration-200 hover:border-gray-700/50">
                    <p className="mb-1 font-medium text-purple-300">
                      Suffix Match
                    </p>
                    <code className="rounded bg-gray-800/70 px-2 py-1 text-white">
                      *word
                    </code>
                    <p className="mt-2 text-gray-300 text-sm">
                      Matches &quot;word&quot;, &quot;badword&quot;,
                      &quot;myword&quot;
                    </p>
                  </div>
                  <div className="rounded-md border border-gray-800/50 bg-gray-950/70 p-3 transition-all duration-200 hover:border-gray-700/50">
                    <p className="mb-1 font-medium text-purple-300">
                      Contains Match
                    </p>
                    <code className="rounded bg-gray-800/70 px-2 py-1 text-white">
                      *word*
                    </code>
                    <p className="mt-2 text-gray-300 text-sm">
                      Matches any text containing &quot;word&quot;
                    </p>
                  </div>
                </div>
                <p className="rounded-md border border-gray-800/50 bg-gray-950/70 p-3 text-gray-300 text-sm">
                  Separate words or phrases with a comma (dog, cat, tiger) or
                  new line.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <AntiSwearForm hubId={hubId} canEdit={canEdit} />
    </HubLayout>
  );
}
