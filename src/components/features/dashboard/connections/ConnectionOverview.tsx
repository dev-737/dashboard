'use client';

import {
  ActivityIcon,
  AlertCircleIcon,
  Calendar01Icon,
  CheckmarkCircle01Icon,
  GlobeIcon,
  HashtagIcon,
  Link01Icon,
  ServerStackIcon,
  Shield01Icon,
  ZapIcon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';

import { formatDistanceToNow } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import type {
  Connection,
  HubVisibility,
  ServerData,
} from '@/lib/generated/prisma/client/client';

interface ConnectionOverviewProps {
  connection: Connection & {
    hub: { name: string; description: string; visibility: HubVisibility };
    server: ServerData;
  };
}

export function ConnectionOverview({ connection }: ConnectionOverviewProps) {
  const isPrivate = connection.hub.visibility === 'PRIVATE';
  const formatDate = (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return formatDistanceToNow(dateObj, { addSuffix: true });
  };

  return (
    <div className="space-y-6">
      {/* Comprehensive Connection Overview */}
      <Card className="relative overflow-hidden border border-gray-800/50 bg-dash-surface backdrop-blur-sm">
        <div className="absolute inset-0 bg-linear-to-r from-blue-500/5 to-purple-500/5" />
        <CardHeader className="relative px-6 py-4">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-lg border border-blue-500/20 bg-blue-500/10 p-2">
                <HugeiconsIcon
                  strokeWidth={2}
                  icon={ActivityIcon}
                  className="h-5 w-5 text-blue-400"
                />
              </div>
              <div>
                <CardTitle className="text-xl">Connection Overview</CardTitle>
                <CardDescription className="text-gray-400">
                  Complete status and configuration summary
                </CardDescription>
              </div>
            </div>
            <Badge
              variant={connection.connected ? 'default' : 'secondary'}
              className={`${
                connection.connected
                  ? 'border-green-500/20 bg-green-500/10 text-green-400'
                  : 'border-gray-500/20 bg-gray-500/10 text-gray-400'
              } px-3 py-1 text-sm`}
            >
              {connection.connected ? (
                <>
                  <HugeiconsIcon
                    strokeWidth={2}
                    icon={CheckmarkCircle01Icon}
                    className="mr-2 h-4 w-4"
                  />
                  Active Connection
                </>
              ) : (
                <>
                  <HugeiconsIcon
                    strokeWidth={2}
                    icon={AlertCircleIcon}
                    className="mr-2 h-4 w-4"
                  />
                  Inactive Connection
                </>
              )}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="px-6 pb-6">
          {/* Key Information Grid */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Hub Information */}
            <div className="rounded-lg border border-gray-800/50 bg-gray-900/20 p-4 transition-colors hover:bg-gray-900/30">
              <div className="mb-3 flex items-center gap-3">
                <div className="rounded-md border border-purple-500/20 bg-purple-500/10 p-2">
                  <HugeiconsIcon
                    strokeWidth={2}
                    icon={GlobeIcon}
                    className="h-4 w-4 text-purple-400"
                  />
                </div>
                <div>
                  <div className="font-medium text-white">Connected Hub</div>
                  <div className="text-gray-400 text-sm">
                    Community hub details
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-white">
                    {connection.hub.name}
                  </span>
                  <Badge
                    variant="outline"
                    className={`text-xs ${
                      isPrivate
                        ? 'border-purple-500/30 bg-purple-500/10 text-purple-400'
                        : 'border-green-500/30 bg-green-500/10 text-green-400'
                    }`}
                  >
                    {isPrivate ? 'Private' : 'Public'}
                  </Badge>
                </div>
                <p className="line-clamp-2 text-gray-400 text-sm">
                  {connection.hub.description}
                </p>
              </div>
            </div>

            {/* Server Information */}
            <div className="rounded-lg border border-gray-800/50 bg-gray-900/20 p-4 transition-colors hover:bg-gray-900/30">
              <div className="mb-3 flex items-center gap-3">
                <div className="rounded-md border border-indigo-500/20 bg-indigo-500/10 p-2">
                  <HugeiconsIcon
                    strokeWidth={2}
                    icon={ServerStackIcon}
                    className="h-4 w-4 text-indigo-400"
                  />
                </div>
                <div>
                  <div className="font-medium text-white">Discord Server</div>
                  <div className="text-gray-400 text-sm">
                    Server and channel info
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="font-medium text-white">
                  {connection.server.name}
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <HugeiconsIcon
                    strokeWidth={2}
                    icon={HashtagIcon}
                    className="h-3 w-3 text-gray-400"
                  />
                  <span className="font-mono text-gray-300 text-xs">
                    {connection.channelId}
                  </span>
                  <Badge
                    variant="outline"
                    className="border-gray-600 px-1 py-0 text-gray-400 text-xs"
                  >
                    Channel
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Settings Grid */}
          <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
            {/* Connection Status */}
            <div className="rounded-lg border border-gray-800/50 bg-gray-900/20 p-3 text-center">
              <div className="mb-2 flex items-center justify-center">
                <HugeiconsIcon
                  strokeWidth={2}
                  icon={ZapIcon}
                  className={`h-4 w-4 ${connection.connected ? 'text-green-400' : 'text-red-400'}`}
                />
              </div>
              <div className="mb-1 text-gray-400 text-xs">Status</div>
              <div
                className={`font-medium text-sm ${connection.connected ? 'text-green-400' : 'text-red-400'}`}
              >
                {connection.connected ? 'Connected' : 'Disconnected'}
              </div>
            </div>

            {/* Join Requests */}
            <div className="rounded-lg border border-gray-800/50 bg-gray-900/20 p-3 text-center">
              <div className="mb-2 flex items-center justify-center">
                <HugeiconsIcon
                  strokeWidth={2}
                  icon={Shield01Icon}
                  className="h-4 w-4 text-orange-400"
                />
              </div>
              <div className="mb-1 text-gray-400 text-xs">Join Requests</div>
            </div>

            {/* Last Active */}
            <div className="rounded-lg border border-gray-800/50 bg-gray-900/20 p-3 text-center">
              <div className="mb-2 flex items-center justify-center">
                <HugeiconsIcon
                  strokeWidth={2}
                  icon={ActivityIcon}
                  className="h-4 w-4 text-indigo-400"
                />
              </div>
              <div className="mb-1 text-gray-400 text-xs">Last Active</div>
              <div className="font-medium text-indigo-400 text-sm">
                {formatDate(connection.lastActive)}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Additional Details */}
      <Card className="border border-gray-800/50 bg-dash-main backdrop-blur-sm">
        <CardHeader className="px-6 py-4">
          <CardTitle className="text-lg">Additional Details</CardTitle>
          <CardDescription className="text-gray-400">
            Technical information and metadata
          </CardDescription>
        </CardHeader>
        <CardContent className="px-6 pb-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {/* Server Invite Link01Icon (if exists) */}
            {connection.invite && (
              <div className="rounded-lg border border-gray-800/50 bg-gray-900/20 p-4">
                <div className="mb-3 flex items-center gap-3">
                  <div className="rounded-md border border-green-500/20 bg-green-500/10 p-2">
                    <HugeiconsIcon
                      strokeWidth={2}
                      icon={Link01Icon}
                      className="h-4 w-4 text-green-400"
                    />
                  </div>
                  <div>
                    <div className="font-medium text-white">Server Invite</div>
                    <div className="text-gray-400 text-sm">
                      Active invitation link
                    </div>
                  </div>
                </div>
                <div className="break-all rounded border border-gray-700 bg-gray-800/50 px-3 py-2 font-mono text-xs">
                  {connection.invite}
                </div>
              </div>
            )}

            {/* Connection ID */}
            <div className="rounded-lg border border-gray-800/50 bg-gray-900/20 p-4">
              <div className="mb-3 flex items-center gap-3">
                <div className="rounded-md border border-gray-500/20 bg-gray-500/10 p-2">
                  <HugeiconsIcon
                    strokeWidth={2}
                    icon={HashtagIcon}
                    className="h-4 w-4 text-gray-400"
                  />
                </div>
                <div>
                  <div className="font-medium text-white">Connection ID</div>
                  <div className="text-gray-400 text-sm">Unique identifier</div>
                </div>
              </div>
              <div className="break-all rounded border border-gray-700 bg-gray-800/50 px-3 py-2 font-mono text-xs">
                {connection.id}
              </div>
            </div>

            {/* Parent Channel (if thread) */}
            {connection.parentId && (
              <div className="rounded-lg border border-gray-800/50 bg-gray-900/20 p-4">
                <div className="mb-3 flex items-center gap-3">
                  <div className="rounded-md border border-yellow-500/20 bg-yellow-500/10 p-2">
                    <HugeiconsIcon
                      strokeWidth={2}
                      icon={HashtagIcon}
                      className="h-4 w-4 text-yellow-400"
                    />
                  </div>
                  <div>
                    <div className="font-medium text-white">Parent Channel</div>
                    <div className="text-gray-400 text-sm">
                      Thread parent ID
                    </div>
                  </div>
                </div>
                <div className="break-all rounded border border-gray-700 bg-gray-800/50 px-3 py-2 font-mono text-xs">
                  {connection.parentId}
                </div>
              </div>
            )}

            {/* Creation Date */}
            <div className="rounded-lg border border-gray-800/50 bg-gray-900/20 p-4">
              <div className="mb-3 flex items-center gap-3">
                <div className="rounded-md border border-blue-500/20 bg-blue-500/10 p-2">
                  <HugeiconsIcon
                    strokeWidth={2}
                    icon={Calendar01Icon}
                    className="h-4 w-4 text-blue-400"
                  />
                </div>
                <div>
                  <div className="font-medium text-white">Created</div>
                  <div className="text-gray-400 text-sm">
                    Connection established
                  </div>
                </div>
              </div>
              <div className="text-gray-300 text-sm">
                {formatDate(connection.createdAt)}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
