'use client';

import {
  HashtagIcon,
  Loading03Icon,
  LockIcon,
  Search01Icon,
  ServerStackIcon,
  Shield01Icon,
  Tick01Icon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';

import { useMutation, useQuery } from '@tanstack/react-query';
import Image from 'next/image';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { ChannelIcon } from '@/components/discord/ChannelIcon';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useTRPC } from '@/utils/trpc';

interface JoinHubModalProps {
  hubId: string;
  hubName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function JoinHubModal({
  hubId,
  hubName,
  open,
  onOpenChange,
}: JoinHubModalProps) {
  const trpc = useTRPC();

  const [serverSearch, setServerSearch] = useState('');
  const [channelSearch, setChannelSearch] = useState('');
  const [selectedServerId, setSelectedServerId] = useState<string>('');
  const [selectedChannelId, setSelectedChannelId] = useState<string>('');

  const serversQuery = useQuery(
    trpc.server.getHubJoinServers.queryOptions(
      { hubId },
      {
        enabled: open,
      }
    )
  );

  const channelsQuery = useQuery(
    trpc.server.getServerChannels.queryOptions(
      {
        serverId: selectedServerId,
        hubId,
        includeConnected: true,
      },
      {
        enabled: open && !!selectedServerId,
      }
    )
  );

  const connectMutation = useMutation(
    trpc.server.connectServerToHub.mutationOptions({
      onSuccess: () => {
        toast.success('Connected successfully', {
          description: `Your server is now connected to ${hubName}.`,
        });
        setSelectedServerId('');
        setSelectedChannelId('');
        setServerSearch('');
        setChannelSearch('');
        onOpenChange(false);
      },
      onError: (error) => {
        toast.error('Connection failed', {
          description: error.message,
        });
      },
    })
  );

  const servers = serversQuery.data?.servers ?? [];
  const channels = channelsQuery.data?.channels ?? [];

  const selectedServer = useMemo(
    () => servers.find((server) => server.id === selectedServerId),
    [servers, selectedServerId]
  );

  const filteredServers = useMemo(() => {
    return servers.filter((server) =>
      server.name.toLowerCase().includes(serverSearch.toLowerCase())
    );
  }, [servers, serverSearch]);

  const filteredChannels = useMemo(() => {
    return channels.filter(
      (channel) =>
        channel.name.toLowerCase().includes(channelSearch.toLowerCase()) ||
        channel.parentName?.toLowerCase().includes(channelSearch.toLowerCase())
    );
  }, [channels, channelSearch]);

  const handleSelectServer = (serverId: string) => {
    setSelectedServerId(serverId);
    setSelectedChannelId('');
    setChannelSearch('');
  };

  const handleConnect = () => {
    if (!selectedServerId || !selectedChannelId) {
      return;
    }

    connectMutation.mutate({
      hubId,
      serverId: selectedServerId,
      channelId: selectedChannelId,
    });
  };

  const handleModalOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      setSelectedServerId('');
      setSelectedChannelId('');
      setServerSearch('');
      setChannelSearch('');
    }
    onOpenChange(nextOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleModalOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-3xl overflow-hidden border-gray-800/80 bg-gray-900/95 p-0">
        <DialogHeader className="border-gray-800/70 border-b p-6">
          <DialogTitle className="text-white">Join {hubName}</DialogTitle>
          <DialogDescription className="text-gray-400">
            Pick one of your servers, then choose the channel to connect.
          </DialogDescription>
        </DialogHeader>

        <div className="grid max-h-[70vh] grid-cols-1 gap-0 overflow-hidden md:grid-cols-2">
          <div className="border-gray-800/60 border-b p-5 md:border-r md:border-b-0">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-medium text-sm text-white">Step 1: Server</h3>
              {serversQuery.isLoading && (
                <HugeiconsIcon
                  icon={Loading03Icon}
                  className="h-4 w-4 animate-spin text-gray-400"
                />
              )}
            </div>

            <div className="relative mb-3">
              <Input
                value={serverSearch}
                onChange={(event) => setServerSearch(event.target.value)}
                placeholder="Search01Icon servers..."
                className="border-gray-700/50 bg-gray-800/50 pl-9"
              />
              <HugeiconsIcon
                icon={Search01Icon}
                className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400"
              />
            </div>

            <div className="scrollbar-thin max-h-[48vh] space-y-2 overflow-y-auto pr-1">
              {filteredServers.length === 0 ? (
                <div className="rounded-lg border border-gray-800/60 bg-gray-800/30 p-4 text-center text-gray-400 text-sm">
                  No servers found.
                </div>
              ) : (
                filteredServers.map((server) => {
                  const isSelected = selectedServerId === server.id;
                  const isDisabled =
                    server.alreadyConnectedToHub || !server.botAdded;
                  const disabledReason = server.alreadyConnectedToHub
                    ? 'This server has already joined this hub.'
                    : 'Add the InterChat bot to this server before joining.';

                  return (
                    <TooltipProvider key={server.id}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            type="button"
                            disabled={isDisabled}
                            onClick={() => handleSelectServer(server.id)}
                            className={`w-full rounded-lg border p-3 text-left transition ${
                              isSelected
                                ? 'border-indigo-500/40 bg-indigo-900/20'
                                : 'border-gray-700/50 bg-gray-800/30'
                            } ${
                              isDisabled
                                ? 'cursor-not-allowed opacity-50'
                                : 'hover:border-gray-600/60 hover:bg-gray-700/40'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className="h-9 w-9 overflow-hidden rounded-full border border-gray-700/60 bg-gray-700/40">
                                {server.icon ? (
                                  <Image
                                    src={server.icon}
                                    alt={server.name}
                                    width={36}
                                    height={36}
                                    className="h-full w-full object-cover"
                                  />
                                ) : (
                                  <div className="flex h-full w-full items-center justify-center">
                                    <HugeiconsIcon
                                      icon={ServerStackIcon}
                                      className="h-4 w-4 text-gray-400"
                                    />
                                  </div>
                                )}
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="truncate font-medium text-sm text-white">
                                  {server.name}
                                </div>
                                <div className="mt-0.5 flex items-center gap-2">
                                  {server.owner && (
                                    <span className="inline-flex items-center gap-1 rounded-full bg-yellow-500/15 px-2 py-0.5 text-xs text-yellow-300">
                                      <HugeiconsIcon
                                        icon={Shield01Icon}
                                        className="h-3 w-3"
                                      />{' '}
                                      Owner
                                    </span>
                                  )}
                                  {server.alreadyConnectedToHub && (
                                    <span className="inline-flex items-center gap-1 rounded-full bg-gray-600/20 px-2 py-0.5 text-gray-300 text-xs">
                                      <HugeiconsIcon
                                        icon={LockIcon}
                                        className="h-3 w-3"
                                      />{' '}
                                      Joined
                                    </span>
                                  )}
                                </div>
                              </div>
                              {isSelected && (
                                <HugeiconsIcon
                                  icon={Tick01Icon}
                                  className="h-4 w-4 text-indigo-300"
                                />
                              )}
                            </div>
                          </button>
                        </TooltipTrigger>
                        {isDisabled && (
                          <TooltipContent>
                            <p>{disabledReason}</p>
                          </TooltipContent>
                        )}
                      </Tooltip>
                    </TooltipProvider>
                  );
                })
              )}
            </div>
          </div>

          <div className="p-5">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-medium text-sm text-white">
                Step 2: Channel
              </h3>
              {channelsQuery.isLoading && selectedServerId && (
                <HugeiconsIcon
                  icon={Loading03Icon}
                  className="h-4 w-4 animate-spin text-gray-400"
                />
              )}
            </div>

            {!selectedServerId ? (
              <div className="rounded-lg border border-gray-800/60 bg-gray-800/30 p-5 text-center text-gray-400 text-sm">
                Select a server first.
              </div>
            ) : (
              <>
                <div className="mb-3">
                  <Input
                    value={channelSearch}
                    onChange={(event) => setChannelSearch(event.target.value)}
                    placeholder="Search01Icon channels..."
                    className="border-gray-700/50 bg-gray-800/50"
                  />
                </div>

                <div className="scrollbar-thin max-h-[40vh] space-y-2 overflow-y-auto pr-1">
                  {filteredChannels.length === 0 ? (
                    <div className="rounded-lg border border-gray-800/60 bg-gray-800/30 p-4 text-center text-gray-400 text-sm">
                      No channels available.
                    </div>
                  ) : (
                    filteredChannels.map((channel) => {
                      const isSelected = selectedChannelId === channel.id;
                      const isLocked = channel.isConnectedElsewhere;

                      return (
                        <TooltipProvider key={channel.id}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button
                                type="button"
                                disabled={isLocked}
                                onClick={() => setSelectedChannelId(channel.id)}
                                className={`w-full rounded-lg border p-3 text-left transition ${
                                  isSelected
                                    ? 'border-indigo-500/40 bg-indigo-900/20'
                                    : 'border-gray-700/50 bg-gray-800/30'
                                } ${
                                  isLocked
                                    ? 'cursor-not-allowed opacity-50'
                                    : 'hover:border-gray-600/60 hover:bg-gray-700/40'
                                }`}
                              >
                                <div className="flex items-center gap-2">
                                  <ChannelIcon
                                    type={channel.type}
                                    className="h-4 w-4 text-gray-300"
                                  />
                                  <div className="min-w-0 flex-1">
                                    <div className="truncate font-medium text-sm text-white">
                                      {channel.name}
                                    </div>
                                    {channel.parentName && (
                                      <div className="truncate text-gray-400 text-xs">
                                        in {channel.parentName}
                                      </div>
                                    )}
                                  </div>
                                  {isSelected && (
                                    <HugeiconsIcon
                                      icon={Tick01Icon}
                                      className="h-4 w-4 text-indigo-300"
                                    />
                                  )}
                                  {isLocked && (
                                    <HugeiconsIcon
                                      icon={LockIcon}
                                      className="h-4 w-4 text-gray-400"
                                    />
                                  )}
                                </div>
                              </button>
                            </TooltipTrigger>
                            {isLocked && (
                              <TooltipContent>
                                <p>
                                  Already joined another hub. Leave that
                                  connection from dashboard first.
                                </p>
                              </TooltipContent>
                            )}
                          </Tooltip>
                        </TooltipProvider>
                      );
                    })
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between border-gray-800/70 border-t bg-gray-900/90 p-4">
          <div className="text-gray-400 text-xs">
            {selectedServer
              ? `Server: ${selectedServer.name}`
              : 'No server selected'}
          </div>
          <Button
            onClick={handleConnect}
            disabled={
              !selectedServerId ||
              !selectedChannelId ||
              connectMutation.isPending
            }
            className="border-none bg-linear-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700"
          >
            {connectMutation.isPending ? (
              <>
                <HugeiconsIcon
                  icon={Loading03Icon}
                  className="mr-2 h-4 w-4 animate-spin"
                />
                Joining...
              </>
            ) : (
              <>
                <HugeiconsIcon icon={HashtagIcon} className="mr-2 h-4 w-4" />
                Join Hub
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
