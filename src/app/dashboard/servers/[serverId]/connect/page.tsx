'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  AlertTriangle,
  ArrowLeft,
  Check,
  Hash,
  Home,
  Loader2,
  MessageSquare,
  Search,
  X,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { ChannelIcon } from '@/components/discord/ChannelIcon';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useSession } from 'next-auth/react';
import { useTRPC } from '@/utils/trpc';

interface ServerData {
  id: string;
  name: string;
  icon: string | null;
}

interface HubData {
  id: string;
  name: string;
  iconUrl: string;
  description: string;
}

interface ChannelData {
  id: string;
  name: string;
  type: number;
  parentId: string | null;
  parentName: string | null;
  position: number;
  isThread: boolean;
  isPrivateThread: boolean;
}

interface LoadingState {
  server: boolean;
  hubs: boolean;
  channels: boolean;
  preselectedHub: boolean;
}

export default function ServerConnectPage() {
  const trpc = useTRPC();
  const inviteCodeFieldId = useId();
  // State management
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isValidatingInvite, setIsValidatingInvite] = useState(false);
  const [inviteCode, setInviteCode] = useState('');
  const [isHubPreselected, setIsHubPreselected] = useState(false);
  const [preselectedHub, setPreselectedHub] = useState<HubData | null>(null);
  const [hubLoadError, setHubLoadError] = useState<string | null>(null);

  // Data states
  const [server, setServer] = useState<ServerData | null>(null);
  const [hubs, setHubs] = useState<HubData[]>([]);
  const [selectedHub, setSelectedHub] = useState<string>('');
  const [selectedChannel, setSelectedChannel] = useState<string>('');
  const [channels, setChannels] = useState<ChannelData[]>([]);
  const [channelSearchQuery, setChannelSearchQuery] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Loading states
  const [loadingState, setLoadingState] = useState<LoadingState>({
    server: true,
    hubs: true,
    channels: true,
    preselectedHub: false,
  });

  const { toast } = useToast();
  const router = useRouter();
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const { serverId } = useParams();

  // Refs to prevent duplicate API calls and toasts
  const fetchedRef = useRef({
    server: false,
    hubs: false,
    channels: false,
  });
  const hubToastShownRef = useRef(false);

  const hubIdParam = searchParams.get('hubId');

  // tRPC utils
  const queryClient = useQueryClient();

  // tRPC queries
  const serverQuery = useQuery(
    trpc.server.getServer.queryOptions(
      { serverId: serverId as string },
      { enabled: !!session && !!serverId }
    )
  );
  const hubsQuery = useQuery(
    trpc.user.getAccessibleHubs.queryOptions(undefined, {
      enabled: !!session,
    })
  );
  // Note: channels depend on server and optional hub param for parity
  const channelsQuery = useQuery(
    trpc.server.getServerChannels.queryOptions(
      { serverId: serverId as string, hubId: hubIdParam ?? undefined },
      { enabled: !!session && !!serverId }
    )
  );

  // Mutations
  const connectMutation = useMutation(
    trpc.server.connectServerToHub.mutationOptions()
  );

  // Utility functions
  const showError = useCallback(
    (title: string, description: string, redirectAfter?: number) => {
      toast({
        title,
        description,
        variant: 'destructive',
      });
      if (redirectAfter) {
        setTimeout(() => router.push('/discover'), redirectAfter * 1000);
      }
    },
    [toast, router]
  );

  const showSuccess = useCallback(
    (title: string, description: string) => {
      toast({
        title,
        description,
        variant: 'dashboard',
      });
    },
    [toast]
  );

  // Enhanced hub fetching with better error handling
  const fetchHubDetails = useCallback(
    async (hubId: string): Promise<boolean> => {
      if (!hubId) return false;
      try {
        setLoadingState((prev) => ({ ...prev, preselectedHub: true }));
        setHubLoadError(null);
        const hub = await queryClient.fetchQuery(
          trpc.hub.getHub.queryOptions({ id: hubId })
        );
        if (hub) {
          setPreselectedHub({
            id: hub.id,
            name: hub.name,
            iconUrl: hub.iconUrl ?? '',
            description: hub.description,
          });
          setSelectedHub(hub.id);
          setIsHubPreselected(true);
          return true;
        }
        setHubLoadError('Hub not found');
        return false;
      } catch (error) {
        const message =
          error instanceof Error ? error.message : 'Failed to load hub details';
        setHubLoadError(message);
        return false;
      } finally {
        setLoadingState((prev) => ({ ...prev, preselectedHub: false }));
      }
    },
    [queryClient, trpc.hub.getHub]
  );

  // Data fetching function
  const fetchData = useCallback(
    async (type: keyof Omit<LoadingState, 'preselectedHub'>) => {
      if (!session || fetchedRef.current[type]) return;
      try {
        setLoadingState((prev) => ({ ...prev, [type]: true }));
        switch (type) {
          case 'server': {
            const data = await queryClient.fetchQuery(
              trpc.server.getServer.queryOptions({
                serverId: serverId as string,
              })
            );
            setServer({
              id: data.server.id,
              name: data.server.name,
              icon: data.server.icon,
            });
            fetchedRef.current.server = true;
            break;
          }
          case 'hubs': {
            const data = await queryClient.fetchQuery(
              trpc.user.getAccessibleHubs.queryOptions()
            );
            setHubs(
              data.hubs.map((h) => ({
                id: h.id,
                name: h.name,
                iconUrl: h.iconUrl ?? '',
                description: '',
              }))
            );
            fetchedRef.current.hubs = true;
            break;
          }
          case 'channels': {
            const data = await queryClient.fetchQuery(
              trpc.server.getServerChannels.queryOptions({
                serverId: serverId as string,
                hubId: hubIdParam ?? undefined,
              })
            );
            setChannels(data.channels as unknown as ChannelData[]);
            if (data.channels.length === 0 && hubIdParam) {
              showError(
                'Already Connected',
                'This server is already connected to the selected hub.',
                3
              );
            }
            fetchedRef.current.channels = true;
            break;
          }
        }
      } catch (error) {
        console.error(`Error fetching ${type}:`, error);
        showError(
          'Loading Error',
          `Failed to load ${type}. Please refresh the page.`
        );
      } finally {
        setLoadingState((prev) => ({ ...prev, [type]: false }));
      }
    },
    [
      session,
      serverId,
      hubIdParam,
      showError,
      queryClient,
      trpc.server.getServer,
      trpc.user.getAccessibleHubs,
      trpc.server.getServerChannels,
    ]
  );

  // Effects
  useEffect(() => {
    if (!session) return;

    // Load all data in parallel
    fetchData('server');
    fetchData('hubs');
    fetchData('channels');
  }, [session, fetchData]);

  // Auto-select first hub when hubs are loaded and no hub is selected
  useEffect(() => {
    if (hubs.length > 0 && !selectedHub && !isHubPreselected) {
      setSelectedHub(hubs[0].id);
    }
  }, [hubs, selectedHub, isHubPreselected]);

  // Load preselected hub from URL params
  useEffect(() => {
    if (!hubIdParam || hubToastShownRef.current) return;

    const loadHub = async () => {
      const success = await fetchHubDetails(hubIdParam);
      if (!hubToastShownRef.current) {
        if (success) {
          showSuccess('Hub Selected', 'Ready to connect to hub');
        } else {
          showError(
            'Hub Loading Failed',
            'Could not load the selected hub. Choose a different hub below.'
          );
        }
        hubToastShownRef.current = true;
      }
    };

    loadHub();
  }, [hubIdParam, fetchHubDetails, showSuccess, showError]);

  // Handle invite code validation
  const validateInviteCode = async () => {
    if (!inviteCode.trim()) return;

    try {
      setIsValidatingInvite(true);
      const data = await queryClient.fetchQuery(
        trpc.hub.validateInvite.queryOptions({ code: inviteCode.trim() })
      );
      setSelectedHub(data.hub.id);
      setPreselectedHub({
        id: data.hub.id,
        name: data.hub.name,
        iconUrl: data.hub.iconUrl ?? '',
        description: data.hub.description,
      });
      setIsHubPreselected(true);
      setInviteCode('');

      showSuccess('Success', `Joined hub: ${data.hub.name}`);
    } catch (error) {
      showError(
        'Invalid Invite',
        error instanceof Error
          ? error.message
          : 'Invalid or expired invite code'
      );
    } finally {
      setIsValidatingInvite(false);
    }
  };

  // Handle connection creation
  const handleConnect = async () => {
    if (!selectedHub) {
      showError('Missing Selection', 'Please select a hub to connect to.');
      return;
    }

    if (!selectedChannel) {
      showError(
        'Missing Selection',
        'Please select a channel for the connection.'
      );
      return;
    }

    try {
      setIsSubmitting(true);
      const hubIdToUse =
        isHubPreselected && preselectedHub ? preselectedHub.id : selectedHub;
      await connectMutation.mutateAsync({
        serverId: serverId as string,
        hubId: hubIdToUse,
        channelId: selectedChannel,
      });
      showSuccess(
        'Connection Created',
        `Successfully connected to ${preselectedHub?.name || 'the hub'}!`
      );
      setTimeout(() => {
        router.push(`/dashboard/servers/${serverId}`);
      }, 1500);
    } catch (error) {
      showError(
        'Connection Failed',
        error instanceof Error ? error.message : 'Failed to create connection'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter functions
  const filteredHubs = hubs.filter((hub) =>
    hub.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredChannels = channels.filter(
    (channel) =>
      channel.name.toLowerCase().includes(channelSearchQuery.toLowerCase()) ||
      channel.parentName
        ?.toLowerCase()
        .includes(channelSearchQuery.toLowerCase())
  );

  // Show loading state
  useEffect(() => {
    if (serverQuery.data && !fetchedRef.current.server) {
      setServer({
        id: serverQuery.data.server.id,
        name: serverQuery.data.server.name,
        icon: serverQuery.data.server.icon,
      });
      fetchedRef.current.server = true;
      setLoadingState((prev) => ({ ...prev, server: false }));
    }
  }, [serverQuery.data]);

  useEffect(() => {
    if (hubsQuery.data && !fetchedRef.current.hubs) {
      setHubs(
        hubsQuery.data.hubs.map((h) => ({
          id: h.id,
          name: h.name,
          iconUrl: h.iconUrl ?? '',
          description: '',
        }))
      );
      fetchedRef.current.hubs = true;
      setLoadingState((prev) => ({ ...prev, hubs: false }));
    }
  }, [hubsQuery.data]);

  useEffect(() => {
    if (channelsQuery.data && !fetchedRef.current.channels) {
      setChannels(channelsQuery.data.channels as unknown as ChannelData[]);
      fetchedRef.current.channels = true;
      setLoadingState((prev) => ({ ...prev, channels: false }));
      if (channelsQuery.data.channels.length === 0 && hubIdParam) {
        showError(
          'Already Connected',
          'This server is already connected to the selected hub.',
          3
        );
      }
    }
  }, [channelsQuery.data, hubIdParam, showError]);

  const isInitialLoading =
    Object.values(loadingState).some((loading) => loading) ||
    serverQuery.isLoading ||
    hubsQuery.isLoading ||
    channelsQuery.isLoading;

  if (isInitialLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="space-y-4 text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
          <p className="text-gray-400">Setting up connection...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-gray-950">
      <div className="mx-auto max-w-6xl px-4 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              className="rounded-[var(--radius-button)] border-gray-700/50 bg-gray-800/50 hover:bg-gray-700/50 hover:text-white"
              asChild
            >
              <Link href="/dashboard">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
              </Link>
            </Button>
            <div>
              <h1 className="font-bold text-3xl text-white tracking-tight">
                Connect Server to Hub
              </h1>
              <p className="mt-1 text-gray-400">
                {server?.name
                  ? `Set up ${server.name} with a hub`
                  : 'Connect your server to a hub'}
              </p>
            </div>
          </div>
          {server && (
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 overflow-hidden rounded-full">
                <Image
                  src={
                    server.icon
                      ? `https://cdn.discordapp.com/icons/${server.id}/${server.icon}.png?size=128`
                      : `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(server.id)}`
                  }
                  alt={server.name}
                  width={40}
                  height={40}
                  className="object-cover"
                />
              </div>
              <div>
                <div className="font-medium text-sm text-white">
                  {server.name}
                </div>
                <div className="text-gray-400 text-xs">Server</div>
              </div>
            </div>
          )}
        </div>

        {/* Error banner for hub loading issues */}
        {hubLoadError && !preselectedHub && (
          <Card className="mb-8 border-red-500/50 bg-gradient-to-r from-red-900/20 to-red-800/20 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 flex-shrink-0 text-red-400" />
                <div>
                  <h3 className="font-medium text-red-300">
                    Hub Loading Failed
                  </h3>
                  <p className="mt-1 text-red-200 text-sm">{hubLoadError}</p>
                  <p className="mt-2 text-red-200 text-xs">
                    You can still choose a hub manually below.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Left Column - Hub Selection */}
          <div className="lg:col-span-2">
            <Card className="premium-card">
              <CardHeader>
                <CardTitle className="font-semibold text-white text-xl">
                  {isHubPreselected ? 'Selected Hub' : 'Choose a Hub'}
                </CardTitle>
                <CardDescription className="text-gray-400">
                  {isHubPreselected
                    ? `This server will be connected to ${preselectedHub?.name}`
                    : 'Select which hub you want to connect this server to'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {isHubPreselected && preselectedHub ? (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-lg text-white">
                        Selected Hub
                      </h3>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="rounded-[var(--radius-button)] text-gray-400 hover:bg-gray-800/50 hover:text-white"
                        onClick={() => {
                          setIsHubPreselected(false);
                          setPreselectedHub(null);
                          setHubLoadError(null);
                        }}
                      >
                        <X className="mr-2 h-4 w-4" />
                        Change Hub
                      </Button>
                    </div>

                    <Card className="border-indigo-500/30 bg-gradient-to-r from-indigo-900/20 to-purple-900/20 backdrop-blur-sm">
                      <CardContent className="pt-6">
                        <div className="flex items-center gap-4">
                          <div className="relative">
                            <Image
                              src={
                                preselectedHub.iconUrl ||
                                `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(preselectedHub.id)}`
                              }
                              alt={preselectedHub.name}
                              width={64}
                              height={64}
                              className="rounded-full ring-2 ring-indigo-500/30"
                            />
                            <div className="-bottom-1 -right-1 absolute flex h-6 w-6 items-center justify-center rounded-full bg-green-500">
                              <Check className="h-3 w-3 text-white" />
                            </div>
                          </div>
                          <div>
                            <h4 className="font-bold text-white text-xl">
                              {preselectedHub.name}
                            </h4>
                            <p className="mt-1 text-gray-300 text-sm">
                              {preselectedHub.description}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <div className="flex items-center gap-2 rounded-lg border border-green-500/20 bg-green-900/20 p-3 text-green-400 text-sm">
                      <Check className="h-4 w-4" />
                      <span>
                        Hub selected. Now choose a channel below to complete the
                        connection.
                      </span>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Invite Code Section */}
                    <div className="rounded-[var(--radius)] border border-gray-700/50 bg-gray-800/30 p-4">
                      <Label
                        htmlFor={inviteCodeFieldId}
                        className="mb-2 flex items-center gap-2 font-medium text-sm text-white"
                      >
                        <MessageSquare className="h-4 w-4" />
                        Have an invite code?
                      </Label>
                      <div className="relative">
                        <Input
                          id={inviteCodeFieldId}
                          type="text"
                          placeholder="Enter invite code here..."
                          value={inviteCode}
                          onChange={(e) => setInviteCode(e.target.value)}
                          className="input-standard pr-24"
                          onKeyDown={(e) =>
                            e.key === 'Enter' && validateInviteCode()
                          }
                        />
                        <Button
                          size="sm"
                          className="btn-primary absolute top-1 right-1"
                          onClick={validateInviteCode}
                          disabled={isValidatingInvite || !inviteCode.trim()}
                        >
                          {isValidatingInvite ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Check className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                      <p className="mt-2 text-gray-400 text-xs">
                        Use an invite code to join a private hub
                      </p>
                    </div>

                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-gray-700/50 border-t" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-gray-900 px-2 text-gray-400">
                          Or select from your hubs
                        </span>
                      </div>
                    </div>

                    {/* Hub Search */}
                    <div className="relative">
                      <Input
                        type="text"
                        placeholder="Search hubs..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="input-standard pl-10"
                      />
                      <div className="-translate-y-1/2 absolute top-1/2 left-3 transform">
                        <Search className="h-4 w-4 text-gray-400" />
                      </div>
                    </div>

                    {/* Hub List */}
                    <div className="scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800 max-h-[300px] space-y-3 overflow-y-auto pr-2">
                      {filteredHubs.length === 0 ? (
                        <div className="py-8 text-center">
                          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gray-800/50">
                            <MessageSquare className="h-6 w-6 text-gray-400" />
                          </div>
                          <p className="text-gray-400">
                            No hubs found matching your search.
                          </p>
                          <p className="mt-1 text-gray-500 text-xs">
                            Try adjusting your search terms
                          </p>
                        </div>
                      ) : (
                        filteredHubs.map((hub) => (
                          <button
                            key={hub.id}
                            type="button"
                            className={`group w-full cursor-pointer rounded-[var(--radius)] p-4 text-left transition-all duration-200 ${
                              selectedHub === hub.id
                                ? 'border border-indigo-500/30 bg-gradient-to-r from-indigo-900/30 to-purple-900/30 ring-1 ring-indigo-500/20'
                                : 'border border-gray-700/50 bg-gray-800/30 hover:border-gray-600/50 hover:bg-gray-700/40'
                            }`}
                            onClick={() => {
                              setSelectedHub(hub.id);
                              setPreselectedHub(hub);
                              setIsHubPreselected(true);
                            }}
                          >
                            <div className="flex items-center gap-3">
                              <div className="relative">
                                <Image
                                  src={
                                    hub.iconUrl ||
                                    `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(hub.id)}`
                                  }
                                  alt={hub.name}
                                  width={48}
                                  height={48}
                                  className="rounded-full ring-2 ring-gray-600/50 transition-all group-hover:ring-gray-500/50"
                                />
                                {selectedHub === hub.id && (
                                  <div className="-bottom-1 -right-1 absolute flex h-5 w-5 items-center justify-center rounded-full bg-indigo-500">
                                    <Check className="h-3 w-3 text-white" />
                                  </div>
                                )}
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="font-medium text-white transition-colors group-hover:text-gray-100">
                                  {hub.name}
                                </div>
                                <div className="line-clamp-2 text-gray-400 text-sm transition-colors group-hover:text-gray-300">
                                  {hub.description}
                                </div>
                              </div>
                            </div>
                          </button>
                        ))
                      )}
                    </div>
                  </>
                )}

                {/* Channel Selection */}
                <div className="space-y-4">
                  <Label
                    htmlFor="channel"
                    className="flex items-center gap-2 font-medium text-white"
                  >
                    <Hash className="h-4 w-4" />
                    Discord Channel
                  </Label>
                  <div className="relative">
                    <Input
                      type="text"
                      placeholder="Search channels..."
                      value={channelSearchQuery}
                      onChange={(e) => setChannelSearchQuery(e.target.value)}
                      className="input-standard pl-10"
                    />
                    <div className="-translate-y-1/2 absolute top-1/2 left-3 transform">
                      <Search className="h-4 w-4 text-gray-400" />
                    </div>
                  </div>

                  <div className="scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800 max-h-[300px] space-y-2 overflow-y-auto pr-2">
                    {filteredChannels.length === 0 ? (
                      <div className="py-8 text-center">
                        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gray-800/50">
                          <Hash className="h-6 w-6 text-gray-400" />
                        </div>
                        <p className="text-gray-400">No channels found</p>
                        <p className="mt-1 text-gray-500 text-xs">
                          Try adjusting your search terms
                        </p>
                      </div>
                    ) : (
                      filteredChannels.map((channel) => (
                        <button
                          key={channel.id}
                          type="button"
                          className={`group flex w-full cursor-pointer items-center rounded-[var(--radius)] p-3 text-left transition-all duration-200 ${
                            selectedChannel === channel.id
                              ? 'border border-indigo-500/30 bg-gradient-to-r from-indigo-900/30 to-purple-900/30 ring-1 ring-indigo-500/20'
                              : 'border border-gray-700/50 bg-gray-800/30 hover:border-gray-600/50 hover:bg-gray-700/40'
                          }`}
                          onClick={() => setSelectedChannel(channel.id)}
                        >
                          <ChannelIcon
                            type={channel.type}
                            className="mr-3 h-4 w-4 flex-shrink-0 text-gray-400 group-hover:text-gray-300"
                          />
                          <div className="min-w-0 flex-1">
                            <div className="truncate font-medium text-white transition-colors group-hover:text-gray-100">
                              {channel.name}
                            </div>
                            {channel.parentName && (
                              <div className="truncate text-gray-400 text-xs transition-colors group-hover:text-gray-300">
                                in {channel.parentName}
                              </div>
                            )}
                          </div>
                          {selectedChannel === channel.id && (
                            <div className="ml-2 flex h-5 w-5 items-center justify-center rounded-full bg-indigo-500">
                              <Check className="h-3 w-3 text-white" />
                            </div>
                          )}
                        </button>
                      ))
                    )}
                  </div>

                  <div className="rounded-[var(--radius)] border border-blue-500/20 bg-blue-900/20 p-3">
                    <p className="flex items-start gap-2 text-blue-300 text-xs">
                      <MessageSquare className="mt-0.5 h-3 w-3 flex-shrink-0" />
                      Select the Discord channel where messages will be sent and
                      received. This channel will be connected to the hub.
                    </p>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="border-gray-700/50 border-t bg-gray-800/20">
                <Button
                  onClick={handleConnect}
                  disabled={isSubmitting || !selectedHub || !selectedChannel}
                  className="btn-primary w-full py-6 font-semibold text-lg"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                      Connecting Server...
                    </>
                  ) : (
                    <>
                      <MessageSquare className="mr-3 h-5 w-5" />
                      Connect to Hub
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </div>

          {/* Right Column - Server Info */}
          <div>
            <Card className="premium-card sticky top-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Home className="h-5 w-5" />
                  Server Information
                </CardTitle>
                <CardDescription>
                  The Discord server you&apos;re connecting
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-4 rounded-[var(--radius)] border border-gray-700/50 bg-gray-800/30 p-4">
                  <div className="relative">
                    <Image
                      src={
                        server?.icon
                          ? `https://cdn.discordapp.com/icons/${server.id}/${server.icon}.png?size=128`
                          : `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(server?.id || (serverId as string))}`
                      }
                      alt={server?.name || 'Server'}
                      width={64}
                      height={64}
                      className="rounded-full ring-2 ring-gray-600/50"
                    />
                    <div className="-bottom-1 -right-1 absolute flex h-6 w-6 items-center justify-center rounded-full bg-green-500">
                      <Check className="h-3 w-3 text-white" />
                    </div>
                  </div>
                  <div>
                    <div className="font-semibold text-lg text-white">
                      {server?.name || 'Unknown Server'}
                    </div>
                    <div className="flex items-center text-gray-400 text-sm">
                      <Home className="mr-1 h-3 w-3" />
                      Discord Server
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="flex items-center gap-2 font-semibold text-sm text-white">
                    <MessageSquare className="h-4 w-4" />
                    About Hub Connections
                  </h3>
                  <div className="rounded-[var(--radius)] border border-indigo-500/20 bg-indigo-900/20 p-4">
                    <p className="mb-3 text-indigo-200 text-sm">
                      Connecting your server to a hub allows members to chat
                      across Discord servers.
                    </p>
                    <ul className="space-y-2 text-indigo-300 text-sm">
                      <li className="flex items-start gap-2">
                        <div className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-indigo-400"></div>
                        Messages sent in the selected channel will be shared
                        with the hub
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-indigo-400"></div>
                        Messages from other servers in the hub will appear in
                        your channel
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-indigo-400"></div>
                        You can disconnect at any time from the server
                        management page
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
