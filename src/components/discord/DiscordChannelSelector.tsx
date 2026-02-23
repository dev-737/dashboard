'use client';

import {
  Loading03Icon,
  LockIcon,
  RefreshIcon,
  ServerStackIcon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';

import { useQuery } from '@tanstack/react-query';
import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';
import { ChannelIcon } from '@/components/discord/ChannelIcon';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useTRPC } from '@/utils/trpc';

interface DiscordChannelSelectorProps {
  hubId: string;
  value: string;
  onChange: (value: string) => void;
  onServerChange?: (serverId: string) => void;
  label: string;
  placeholder: string;
  description?: string;
  // New props for initial values and access control
  initialServerId?: string | null;
  initialChannelId?: string | null;
  initialChannelName?: string | null;
  initialServerName?: string | null;
  isAccessible?: boolean;
  onAccessDenied?: () => void;
}

export function DiscordChannelSelector({
  hubId,
  value,
  onChange,
  onServerChange,
  label,
  description,
  initialServerId = null,
  initialChannelId = null,
  initialChannelName = null,
  initialServerName = null,
  isAccessible = true,
  onAccessDenied,
}: DiscordChannelSelectorProps) {
  const trpc = useTRPC();
  const [selectedServer, setSelectedServer] = useState<string>(
    initialServerId || ''
  );
  const [selectedChannel, setSelectedChannel] = useState<string>(value);
  const [showRefresh, setShowRefresh] = useState(false);

  // Fetch servers that the user owns or moderates using tRPC
  const { data: serversData, isLoading: serversLoading } = useQuery(
    trpc.user.getManageableServers.queryOptions()
  );

  const servers = useMemo(
    () => serversData?.servers || [],
    [serversData?.servers]
  );

  // Fetch channels when a server is selected using tRPC
  const {
    data: channelsData,
    isLoading: channelsLoading,
    refetch: refetchChannels,
  } = useQuery(
    trpc.server.getServerChannels.queryOptions(
      { serverId: selectedServer, hubId },
      { enabled: !!selectedServer }
    )
  );

  const channels = channelsData?.channels || [];
  const isLoading = serversLoading || channelsLoading;

  // Group channels by category
  const { uncategorizedChannels, categorizedChannels } = useMemo(() => {
    const uncategorized: typeof channels = [];
    const categorized: Record<string, typeof channels> = {};

    channels.forEach((channel) => {
      if (channel.categoryName && channel.categoryId) {
        if (!categorized[channel.categoryName]) {
          categorized[channel.categoryName] = [];
        }
        categorized[channel.categoryName].push(channel);
      } else {
        uncategorized.push(channel);
      }
    });

    return {
      uncategorizedChannels: uncategorized,
      categorizedChannels: categorized,
    };
  }, [channels]);

  // Set initial server if provided
  useEffect(() => {
    if (initialServerId && !selectedServer) {
      setSelectedServer(initialServerId);
    }
  }, [initialServerId, selectedServer]);

  // Show refresh icon if we have a channel ID but no name (resolution failed)
  useEffect(() => {
    if (initialChannelId && !initialChannelName) {
      setShowRefresh(true);
    }
  }, [initialChannelId, initialChannelName]);

  // Update the selected channel when value changes
  useEffect(() => {
    setSelectedChannel(value);
  }, [value]);

  // Handle server selection
  const handleServerChange = (serverId: string) => {
    setSelectedServer(serverId);
    setSelectedChannel('');
    onChange('');
    onServerChange?.(serverId);
  };

  // Handle channel selection
  const handleChannelChange = (channelId: string) => {
    setSelectedChannel(channelId);
    onChange(channelId);
  };

  // Handle clearing locked configuration
  const handleClearConfig = () => {
    if (
      confirm(
        'Clear this configuration? It was set by another manager or in a server you no longer have access to.'
      )
    ) {
      onChange('');
      setSelectedChannel('');
      setSelectedServer('');
      onAccessDenied?.();
    }
  };

  return (
    <div className="relative space-y-2">
      <div className="flex items-center justify-between">
        <Label className="font-medium text-sm">{label}</Label>
        {description && (
          <span className="text-gray-400 text-xs">{description}</span>
        )}
      </div>

      {/* Server Selection */}
      <Select value={selectedServer} onValueChange={handleServerChange}>
        <SelectTrigger className="w-full border-gray-700/50 bg-gray-800/50 focus-visible:ring-indigo-500/50">
          <SelectValue placeholder="Select a server first" />
        </SelectTrigger>
        <SelectContent className="max-h-[300px] border border-gray-800/50 bg-linear-to-b from-gray-900/95 to-gray-950/95 backdrop-blur-md">
          {isLoading && !servers.length ? (
            <div className="flex items-center justify-center py-2">
              <HugeiconsIcon
                strokeWidth={2}
                icon={Loading03Icon}
                className="mr-2 h-4 w-4 animate-spin text-gray-400"
              />
              <span className="text-gray-400">Loading servers...</span>
            </div>
          ) : servers.length === 0 ? (
            <div className="p-2 text-center text-gray-400">
              No servers found where you have manage permissions
            </div>
          ) : (
            servers.map((server) => (
              <SelectItem key={server.id} value={server.id}>
                <div className="flex items-center gap-2">
                  {server.icon ? (
                    <div className="relative h-5 w-5 shrink-0 overflow-hidden rounded-full">
                      <Image
                        src={server.icon}
                        alt={server.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <HugeiconsIcon
                      strokeWidth={2}
                      icon={ServerStackIcon}
                      className="h-5 w-5 shrink-0 text-gray-400"
                    />
                  )}
                  <span className="truncate">{server.name}</span>
                </div>
              </SelectItem>
            ))
          )}
        </SelectContent>
      </Select>

      {/* Channel Selection - Only show if a server is selected */}
      {selectedServer && (
        <Command className="overflow-hidden rounded-lg border border-gray-700/50 bg-gray-800/50">
          <CommandInput
            placeholder="Search01Icon channels..."
            className="border-0 border-gray-700/50 border-b bg-transparent focus:ring-0"
          />
          <CommandList className="max-h-[300px] overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center py-4">
                <HugeiconsIcon
                  strokeWidth={2}
                  icon={Loading03Icon}
                  className="mr-2 h-4 w-4 animate-spin text-gray-400"
                />
                <span className="text-gray-400">Loading channels...</span>
              </div>
            ) : channels.length === 0 ? (
              <CommandEmpty>
                <div className="flex flex-col items-center gap-3 py-4 text-center">
                  <p className="font-medium text-sm">No channels found</p>
                  <p className="text-gray-400 text-xs">
                    The bot may not have permission to view channels in this
                    server.
                  </p>
                  <p className="text-gray-400 text-xs">
                    Please ensure the bot has "View Channels" permission and try
                    again.
                  </p>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => refetchChannels()}
                    className="mt-2"
                  >
                    <HugeiconsIcon
                      strokeWidth={2}
                      icon={RefreshIcon}
                      className="mr-2 h-4 w-4"
                    />
                    Retry
                  </Button>
                </div>
              </CommandEmpty>
            ) : (
              <>
                {/* Uncategorized channels first */}
                {uncategorizedChannels.length > 0 && (
                  <CommandGroup
                    heading="Uncategorized"
                    className="text-gray-400 text-xs"
                  >
                    {uncategorizedChannels.map((channel) => (
                      <CommandItem
                        key={channel.id}
                        value={`${channel.name}-${channel.id}`}
                        onSelect={() => handleChannelChange(channel.id)}
                        className={
                          selectedChannel === channel.id
                            ? 'bg-indigo-500/20 aria-selected:bg-indigo-500/20'
                            : ''
                        }
                      >
                        <div className="flex items-center gap-2">
                          <ChannelIcon
                            type={channel.type}
                            className="h-4 w-4 shrink-0"
                          />
                          <span className="truncate">#{channel.name}</span>
                          {channel.parentName && (
                            <span className="text-gray-400 text-xs">
                              (in {channel.parentName})
                            </span>
                          )}
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                )}

                {/* Categorized channels */}
                {Object.entries(categorizedChannels).map(
                  ([categoryName, categoryChannels]) => (
                    <CommandGroup
                      key={categoryName}
                      heading={categoryName}
                      className="text-gray-400 text-xs"
                    >
                      {categoryChannels.map((channel) => (
                        <CommandItem
                          key={channel.id}
                          value={`${channel.name}-${channel.id}`}
                          onSelect={() => handleChannelChange(channel.id)}
                          className={
                            selectedChannel === channel.id
                              ? 'bg-indigo-500/20 aria-selected:bg-indigo-500/20'
                              : ''
                          }
                        >
                          <div className="flex items-center gap-2">
                            <ChannelIcon
                              type={channel.type}
                              className="h-4 w-4 shrink-0"
                            />
                            <span className="truncate">#{channel.name}</span>
                            {channel.parentName && (
                              <span className="text-gray-400 text-xs">
                                (in {channel.parentName})
                              </span>
                            )}
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  )
                )}
              </>
            )}
          </CommandList>
        </Command>
      )}

      {/* Show initial channel info if we have it but no server selected */}
      {!selectedServer && initialChannelId && initialChannelName && (
        <div className="flex items-center justify-between rounded-lg border border-gray-700/50 bg-gray-800/50 p-3">
          <div className="flex items-center gap-2">
            <ChannelIcon type={0} className="h-4 w-4 shrink-0" />
            <div className="flex flex-col">
              <span className="text-sm">#{initialChannelName}</span>
              {initialServerName && (
                <span className="text-gray-400 text-xs">
                  in {initialServerName}
                </span>
              )}
            </div>
          </div>
          {showRefresh && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => window.location.reload()}
                  >
                    <HugeiconsIcon
                      strokeWidth={2}
                      icon={RefreshIcon}
                      className="h-4 w-4"
                    />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Retry loading channel details</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      )}

      {/* Graceful degradation: show ID if we have channel but no name */}
      {!selectedServer && initialChannelId && !initialChannelName && (
        <div className="flex items-center justify-between rounded-lg border border-gray-700/50 bg-gray-800/30 p-3">
          <div className="flex items-center gap-2">
            <ChannelIcon type={0} className="h-4 w-4 shrink-0 text-gray-500" />
            <div className="flex flex-col">
              <span className="text-gray-400 text-sm">
                Channel: {initialChannelId}
              </span>
              <span className="text-gray-500 text-xs">
                Unable to load channel details
              </span>
            </div>
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => window.location.reload()}
                >
                  <HugeiconsIcon
                    strokeWidth={2}
                    icon={RefreshIcon}
                    className="h-4 w-4"
                  />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Retry loading channel details</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      )}

      {/* Locked state overlay */}
      {!isAccessible && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 rounded-lg bg-gray-900/80 backdrop-blur-sm">
          <HugeiconsIcon
            strokeWidth={2}
            icon={LockIcon}
            className="h-6 w-6 text-amber-400"
          />
          <p className="px-4 text-center text-gray-300 text-sm">
            You don't have access to this server
          </p>
          <Button size="sm" variant="outline" onClick={handleClearConfig}>
            Clear Configuration
          </Button>
        </div>
      )}
    </div>
  );
}
