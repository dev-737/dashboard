'use client';

import { useQuery } from '@tanstack/react-query';
import { Loader2, ServerIcon } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';
import { ChannelIcon } from '@/components/discord/channel-icon';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useTRPC } from '@/utils/trpc';

interface DiscordChannelSelectorProps {
  hubId: string;
  value: string;
  onChange: (value: string) => void;
  onServerChange?: (serverId: string) => void;
  label: string;
  placeholder: string;
  description?: string;
}

export function DiscordChannelSelector({
  hubId,
  value,
  onChange,
  onServerChange,
  label,
  placeholder,
  description,
}: DiscordChannelSelectorProps) {
  const trpc = useTRPC();
  const [selectedServer, setSelectedServer] = useState<string>('');
  const [selectedChannel, setSelectedChannel] = useState<string>(value);

  // Fetch servers that the user owns or moderates using tRPC
  const { data: serversData, isLoading: serversLoading } = useQuery(
    trpc.user.getManageableServers.queryOptions()
  );

  const servers = useMemo(
    () => serversData?.servers || [],
    [serversData?.servers]
  );

  // Fetch channels when a server is selected using tRPC
  const { data: channelsData, isLoading: channelsLoading } = useQuery(
    trpc.server.getServerChannels.queryOptions(
      { serverId: selectedServer, hubId },
      { enabled: !!selectedServer }
    )
  );

  const channels = channelsData?.channels || [];
  const isLoading = serversLoading || channelsLoading;

  // Set selected server if we have a channel value and servers are loaded
  useEffect(() => {
    if (value && servers.length > 0 && !selectedServer) {
      // For now, we'll require manual server selection
      // The auto-finding logic would need to be refactored to use tRPC efficiently
      console.log(
        'Channel value provided but server auto-selection disabled in tRPC version'
      );
    }
  }, [value, servers, selectedServer]);

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

  return (
    <div className="space-y-2">
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
        <SelectContent className="max-h-[300px] border border-gray-800/50 bg-gradient-to-b from-gray-900/95 to-gray-950/95 backdrop-blur-md">
          {isLoading && !servers.length ? (
            <div className="flex items-center justify-center py-2">
              <Loader2 className="mr-2 h-4 w-4 animate-spin text-gray-400" />
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
                    <div className="relative h-5 w-5 flex-shrink-0 overflow-hidden rounded-full">
                      <Image
                        src={server.icon}
                        alt={server.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <ServerIcon className="h-5 w-5 flex-shrink-0 text-gray-400" />
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
        <Select value={selectedChannel} onValueChange={handleChannelChange}>
          <SelectTrigger className="w-full border-gray-700/50 bg-gray-800/50 focus-visible:ring-indigo-500/50">
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent className="max-h-[300px] border border-gray-800/50 bg-gradient-to-b from-gray-900/95 to-gray-950/95 backdrop-blur-md">
            {isLoading ? (
              <div className="flex items-center justify-center py-2">
                <Loader2 className="mr-2 h-4 w-4 animate-spin text-gray-400" />
                <span className="text-gray-400">Loading channels...</span>
              </div>
            ) : channels.length === 0 ? (
              <div className="p-2 text-center text-gray-400">
                No channels found in this server
              </div>
            ) : (
              channels.map((channel) => (
                <SelectItem key={channel.id} value={channel.id}>
                  <div className="flex items-center gap-2">
                    <ChannelIcon
                      type={channel.type}
                      className="h-4 w-4 flex-shrink-0"
                    />
                    <span className="truncate">#{channel.name}</span>
                    {channel.parentName && (
                      <span className="text-gray-400 text-xs">
                        (in {channel.parentName})
                      </span>
                    )}
                  </div>
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
      )}
    </div>
  );
}
