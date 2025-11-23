'use server';

import {
  ChevronRight,
  Home,
  Info,
  MessageSquare,
  ScrollText,
  Search,
  Settings,
  Users,
} from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { auth } from '@/auth';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PermissionLevel } from '@/lib/constants';
import { getHubConnections, getHubData } from '@/lib/hub-queries';
import { cn } from '@/lib/utils';
import ClientReviewList from '../components/hub-detail/ClientReviewList';
import ClientReviewSection from '../components/hub-detail/ClientReviewSection';
import HubBanner from '../components/hub-detail/HubBanner';
import HubConnectedServers from '../components/hub-detail/HubConnectedServers';
import HubDetailsCard from '../components/hub-detail/HubDetailsCard';
import HubInfoCard from '../components/hub-detail/HubInfoCard';
import HubModeratorsCard from '../components/hub-detail/HubModeratorsCard';
import HubOverview from '../components/hub-detail/HubOverview';
import HubReviewAnalytics from '../components/hub-detail/HubReviewAnalytics';
import HubRules from '../components/hub-detail/HubRules';
import JoinButton from '../components/hub-detail/JoinButton';
import SimilarHubsCard from '../components/hub-detail/SimilarHubsCard';
import UpvoteButton from '../components/hub-detail/UpvoteButton';

export async function generateMetadata(props: {
  params: Promise<{ hubId: string }>;
}): Promise<Metadata> {
  const { hubId } = await props.params;
  const hub = await getHubData(hubId, undefined);

  if (!hub) return { title: 'Hub Not Found' };

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://interchat.dev';

  return {
    title: `${hub.name} | InterChat Cross-Server Hubs`,
    description:
      hub.description ||
      'Join this active Cross-Server Hubs with InterChat. Connect your server and start chatting with other communities.',
    keywords: [
      'discord community',
      'discord hub',
      'connect discord servers',
      'interchat hub',
      ...(hub.tags.map((t) => t.name) || []),
    ],
    openGraph: {
      title: `${hub.name} | InterChat Cross-Server Hubs`,
      description:
        hub.description ||
        'Join this active Cross-Server Hubs with InterChat. Connect your server and start chatting with other communities.',
      type: 'website',
      url: `${baseUrl}/hubs/${hubId}`,
      images: [
        {
          url: hub.bannerUrl || hub.iconUrl,
          width: 1200,
          height: 630,
          alt: hub.name,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      images: [hub.bannerUrl || hub.iconUrl],
      title: `${hub.name} | InterChat Cross-Server Hubs`,
      description:
        hub.description || 'Join this active Cross-Server Hubs with InterChat.',
      creator: '@737_dev',
      site: '@interchatapp',
    },
    alternates: {
      canonical: `${baseUrl}/hubs/${hubId}`,
    },
  };
}

export default async function HubDetailView(props: {
  params: Promise<{ hubId: string }>;
}) {
  const { hubId } = await props.params;

  const session = await auth();
  const userId = session?.user?.id;

  const [hub, connections] = await Promise.all([
    getHubData(hubId, userId),
    getHubConnections(hubId),
  ]);

  if (!hub) {
    notFound();
  }

  let userPermissionLevel = PermissionLevel.NONE;
  if (userId) {
    if (hub.ownerId === userId) {
      userPermissionLevel = PermissionLevel.OWNER;
    } else {
      const moderatorRole = hub.moderators.find((mod) => mod.userId === userId);
      if (moderatorRole) {
        userPermissionLevel =
          moderatorRole.role === 'MANAGER'
            ? PermissionLevel.MANAGER
            : PermissionLevel.MODERATOR;
      }
    }
  }

  const canManageHub = userPermissionLevel >= PermissionLevel.MODERATOR;
  const connectionsData = connections ?? [];

  const formattedDate = new Date(hub.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Group reviews by rating to show analytics
  const reviewStats = {
    total: hub.reviews?.length || 0,
    average:
      hub.reviews?.reduce((acc, review) => acc + review.rating, 0) /
      (hub.reviews?.length || 1),
    distribution: [5, 4, 3, 2, 1].map((rating) => ({
      rating,
      count: hub.reviews?.filter((r) => r.rating === rating).length || 0,
      percentage: Math.round(
        ((hub.reviews?.filter((r) => r.rating === rating).length || 0) /
          (hub.reviews?.length || 1)) *
          100
      ),
    })),
  };

  return (
    <div className="flex min-h-screen flex-col bg-linear-to-b from-gray-950 to-gray-900 text-gray-200">
      {/* Main Content */}
      <div className="flex-grow">
        <HubBanner bannerUrl={hub.bannerUrl} name={hub.name} />

        <div className="container mx-auto max-w-7xl px-4 pt-4">
          <nav className="flex items-center gap-2 text-gray-400 text-sm">
            <Link
              href="/"
              className="flex items-center gap-1 transition-colors hover:text-gray-200"
            >
              <Home className="h-4 w-4" />
              <span>Home</span>
            </Link>
            <ChevronRight className="h-4 w-4" />
            <Link
              href="/discover"
              className="flex items-center gap-1 transition-colors hover:text-gray-200"
            >
              <Search className="h-4 w-4" />
              <span>Browse Hubs</span>
            </Link>
            <ChevronRight className="h-4 w-4" />
            <span className="font-medium text-gray-200">{hub.name}</span>
          </nav>
        </div>

        {/* Page Content */}
        <div className="container mx-auto max-w-7xl px-4 pb-16">
          <div className="-mt-32 md:-mt-40 relative mb-12 transform transition-all duration-300">
            <div className="rounded-2xl border border-gray-800/70 bg-gray-900/90 p-6 shadow-xl backdrop-blur-xl md:p-8">
              <div className="flex w-full flex-col md:flex-row md:items-start md:justify-between">
                <HubInfoCard hub={hub} />

                <div className="mt-6 flex flex-shrink-0 gap-3 rounded-lg border border-gray-700/50 bg-gray-800/40 p-2 md:mt-0 md:ml-auto">
                  {/* Manage Hub button - only show for users with management permissions */}
                  {canManageHub && (
                    <Link href={`/dashboard/hubs/${hubId}`}>
                      <Button
                        className="flex cursor-pointer items-center gap-2 rounded-lg border-0 bg-linear-to-r from-indigo-600 to-purple-600 px-4 py-2 font-medium text-white shadow-lg transition-all duration-200 hover:scale-105 hover:from-indigo-600/80 hover:to-purple-600/80"
                        size="sm"
                        variant="outline"
                      >
                        <Settings className="h-4 w-4" />
                        Manage Hub
                      </Button>
                    </Link>
                  )}
                  <div className="group relative">
                    <JoinButton hubName={hub.name} hubId={hub.id} />
                  </div>
                  <UpvoteButton hubId={hub.id} initialUpvotes={hub.upvotes} />
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {/* Left Column (Tabs and Reviews) */}
            <div className="space-y-8 lg:col-span-2">
              <Tabs defaultValue="overview" className="w-full">
                <div className="relative mb-6">
                  <TabsList className="inline-flex h-auto w-full items-center justify-start gap-1 rounded-lg border border-gray-700/40 bg-gray-800/40 p-1.5 px-4 sm:gap-2">
                    {[
                      { value: 'overview', icon: Info, label: 'Overview' },
                      { value: 'rules', icon: ScrollText, label: 'Rules' },
                      {
                        value: 'servers',
                        icon: Users,
                        label: 'Connected Servers',
                      },
                    ].map((tab) => (
                      <TabsTrigger
                        key={tab.value}
                        value={tab.value}
                        className={cn(
                          'inline-flex flex-shrink-0 cursor-pointer items-center justify-center whitespace-nowrap rounded-md px-2 py-2 font-medium text-xs ring-offset-background transition-all sm:px-3 sm:py-2.5 sm:text-sm md:px-4',
                          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                          'disabled:pointer-events-none disabled:opacity-50',
                          'data-[state=active]:bg-linear-to-r data-[state=active]:from-primary data-[state=active]:to-primary-alt data-[state=active]:text-white data-[state=active]:shadow-md', // Active state
                          'data-[state=active]:animate-tab-glow', // Animation for active tab
                          'text-gray-300 hover:bg-gray-700/50 hover:text-white' // Inactive state
                        )}
                      >
                        <tab.icon className="mr-1 h-3 w-3 flex-shrink-0 sm:mr-2 sm:h-4 sm:w-4" />
                        <span className="truncate">{tab.label}</span>
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </div>

                <TabsContent
                  value="overview"
                  className={cn(
                    'rounded-xl border border-gray-800/70 bg-gray-900/60 p-6 shadow-lg backdrop-blur-md md:p-8', // Container with padding
                    'mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2' // Standard focus styles
                  )}
                >
                  <HubOverview description={hub.description} />

                  {/* Reviews Section - Now part of Overview */}
                  <div className="mt-8 border-gray-700/50 border-t pt-8">
                    <div className="mb-6 flex items-center gap-2">
                      <MessageSquare className="h-5 w-5 text-primary" />
                      <h3 className="font-semibold text-lg text-white">
                        Reviews
                      </h3>
                    </div>

                    <HubReviewAnalytics reviewStats={reviewStats} />

                    {/* Review Form */}
                    <ClientReviewSection hubId={hub.id} />

                    {/* Review list */}
                    <ClientReviewList
                      hubId={hub.id}
                      initialReviews={hub.reviews}
                    />
                  </div>
                </TabsContent>

                <TabsContent
                  value="rules"
                  className={cn(
                    'rounded-xl border border-gray-800/70 bg-gray-900/60 p-6 shadow-lg backdrop-blur-md md:p-8',
                    'mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
                  )}
                >
                  <HubRules rules={hub.rules} />
                </TabsContent>

                <TabsContent
                  value="servers"
                  className={cn(
                    'rounded-xl border border-gray-800/70 bg-gray-900/60 p-6 shadow-lg backdrop-blur-md md:p-8',
                    'mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
                  )}
                >
                  <HubConnectedServers connections={connectionsData} />
                </TabsContent>
              </Tabs>
            </div>
            {/* Filter Sidebar */}
            <div className="space-y-4 sm:space-y-6 lg:col-span-1">
              <HubDetailsCard
                formattedDate={formattedDate}
                hub={hub}
                connections={connectionsData}
              />

              <HubModeratorsCard moderators={hub.moderators} />

              <SimilarHubsCard
                currentHubId={hub.id}
                hubTags={hub.tags?.map((tag) => tag.name) || []}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
