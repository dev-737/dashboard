import { ArrowLeft, Loader2, ShieldAlert } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { Suspense } from 'react';
import { getServers } from '@/actions/server-actions';
import { auth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { SafeHubBanner } from '@/components/ui/HydrationSafeImage';
import { getHubData } from '@/lib/hub-queries';
import { ConnectServerList } from './_components/ConnectServerList';

export async function generateMetadata(props: {
  params: Promise<{ hubId: string }>;
}): Promise<Metadata> {
  const { hubId } = await props.params;
  const hub = await getHubData(hubId);

  if (!hub) return { title: 'Hub Not Found' };

  return {
    title: `Connect to ${hub.name} | InterChat`,
    description: `Connect your server to ${hub.name} on InterChat.`,
  };
}

export default async function ConnectHubPage(props: {
  params: Promise<{ hubId: string }>;
}) {
  await headers();

  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
        </div>
      }
    >
      <ConnectHubContent params={props.params} />
    </Suspense>
  );
}

async function ConnectHubContent(props: {
  params: Promise<{ hubId: string }>;
}) {
  const { hubId } = await props.params;
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    redirect(`/login?callbackUrl=/dashboard/connect/${hubId}`);
  }

  const [hub, serversResponse] = await Promise.all([
    getHubData(hubId),
    getServers(session),
  ]);

  if (!hub) {
    notFound();
  }

  if ('error' in serversResponse) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
        <ShieldAlert className="mb-4 h-12 w-12 text-red-500" />
        <h2 className="mb-2 font-bold text-2xl">Failed to load servers</h2>
        <p className="mb-6 text-gray-400">{serversResponse.error}</p>
        <Button asChild>
          <Link href="/dashboard">Return to Dashboard</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-none pb-20">
      {/* Header with Banner */}
      <div className="relative h-48 w-full overflow-hidden md:h-64">
        <div className="absolute inset-0 bg-none" />
        {hub.bannerUrl && (
          <SafeHubBanner
            src={hub.bannerUrl}
            name={hub.name}
            className="h-full w-full object-cover opacity-50 blur-xs"
            priority
          />
        )}
        <div className="absolute inset-0 bg-none" />

        <div className="container absolute right-0 bottom-0 left-0 mx-auto px-4 pb-8">
          <Button
            asChild
            variant="ghost"
            className="mb-4 text-gray-300 hover:bg-white/10 hover:text-white"
          >
            <Link href={`/hubs/${hubId}`}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Hub
            </Link>
          </Button>

          <div className="flex items-end gap-6">
            <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl border-4 border-gray-950 bg-gray-800 shadow-2xl md:h-24 md:w-24">
              {hub.iconUrl ? (
                <SafeHubBanner
                  src={hub.iconUrl}
                  name={hub.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-linear-to-br from-indigo-500 to-purple-600 font-bold text-2xl text-white">
                  {hub.name.substring(0, 2).toUpperCase()}
                </div>
              )}
            </div>
            <div className="mb-2">
              <h1 className="font-bold text-2xl text-white md:text-3xl">
                Connect to {hub.name}
              </h1>
              <p className="text-gray-300">
                Select a server to connect to this hub
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto max-w-5xl px-4 py-8">
        <ConnectServerList servers={serversResponse.data} hubId={hubId} />
      </div>
    </div>
  );
}
