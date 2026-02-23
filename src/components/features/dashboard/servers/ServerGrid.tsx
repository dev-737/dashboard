'use client';

import {
  Clock01Icon,
  FilterIcon,
  Home01Icon,
  LinkSquare02Icon,
  Search01Icon,
  UserMultipleIcon,
} from '@hugeicons/core-free-icons';

import { HugeiconsIcon } from '@hugeicons/react';
import { formatDistanceToNow } from 'date-fns';
import { motion } from 'motion/react';
import Image from 'next/image';
import Link from 'next/link';

import { useState } from 'react';
import { useInView } from 'react-intersection-observer';
import type { ServerDataWithConnections } from '@/actions/server-actions';
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

interface ServerGridProps {
  servers: ServerDataWithConnections[];
}

export function ServerGrid({ servers }: ServerGridProps) {
  const [searchQuery, setSearchQuery] = useState('');

  // FilterIcon servers based on search query
  const filteredServers = servers.filter((server) =>
    server.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="relative">
        <Input
          type="text"
          placeholder="Search01Icon servers..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="border-gray-700/50 bg-transparent pl-10 focus-visible:ring-indigo-500/50"
        />
        <div className="absolute top-1/2 left-3 -translate-y-1/2 transform text-gray-400">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <title>Search01Icon servers</title>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
      </div>

      {filteredServers.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="mb-4 rounded-full bg-gray-800/50 p-3">
            <HugeiconsIcon
              icon={Home01Icon}
              className="h-6 w-6 text-gray-400"
            />
          </div>
          <h3 className="mb-2 font-medium text-lg">No matching servers</h3>
          <p className="max-w-md text-gray-400">
            No servers match your search query. Try a different search term.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 lg:gap-6">
          {filteredServers.map((server, index) => (
            <ServerCard key={server.id} server={server} index={index} />
          ))}
        </div>
      )}
    </div>
  );
}

interface ServerCardProps {
  server: ServerDataWithConnections;
  index: number;
}

function ServerCard({ server, index }: ServerCardProps) {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  // Get server icon URL
  const iconUrl = server.icon
    ? `https://cdn.discordapp.com/icons/${server.id}/${server.icon}.png?size=128`
    : `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(
        server.id
      )}`;

  // Format last active time
  const lastActive = server.lastMessageAt
    ? formatDistanceToNow(new Date(server.lastMessageAt), { addSuffix: true })
    : 'Never';

  // Check if user is owner
  const isOwner = server.owner;

  // Get connection count
  const connectionCount = server.connections?.length || 0;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 10 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
      transition={{ duration: 0.3, delay: Math.min(index * 0.03, 0.3) }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="h-full"
    >
      <Card className="flex h-full min-h-70 flex-col overflow-hidden rounded-2xl border border-gray-800/50 bg-dash-surface backdrop-blur-sm transition-all duration-300 hover:border-blue-500/30">
        <CardHeader className="relative pb-2">
          <div className="absolute top-3 right-3">
            {isOwner && (
              <div className="rounded-full border border-yellow-500/30 bg-linear-to-r from-yellow-500/20 to-orange-500/20 px-2 py-0.5 font-medium text-xs text-yellow-300 backdrop-blur-sm">
                Owner
              </div>
            )}
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <div>
              <div className="h-10 w-10 shrink-0 overflow-hidden rounded-xl border-2 border-gray-700/50 bg-linear-to-br from-blue-500/10 to-indigo-500/10 sm:h-12 sm:w-12">
                <Image
                  src={iconUrl}
                  alt={server.name}
                  width={48}
                  height={48}
                  className="object-cover"
                  style={{ width: '100%', height: '100%' }}
                />
              </div>
            </div>
            <div className="min-w-0 flex-1">
              <CardTitle className="truncate text-base text-white sm:text-lg">
                {server.name}
              </CardTitle>
              <CardDescription className="truncate text-gray-400 text-xs sm:text-sm">
                {server.id}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="grow py-3 sm:py-4">
          <div className="max-w-full space-y-2 text-xs sm:space-y-3 sm:text-sm">
            <div className="flex w-full items-center justify-between">
              <span className="flex items-center gap-1 text-gray-400">
                <div className="flex h-5 w-5 items-center justify-center rounded-lg bg-blue-500/20 sm:h-6 sm:w-6">
                  <HugeiconsIcon
                    icon={UserMultipleIcon}
                    className="h-3 w-3 text-blue-400"
                  />
                </div>
                <span className="hidden sm:inline">Connections</span>
                <span className="sm:hidden">Conn.</span>
              </span>
              <span className="font-medium text-white">{connectionCount}</span>
            </div>
            <div className="flex w-full items-center justify-between">
              <span className="flex items-center gap-1 text-gray-400">
                <div className="flex h-5 w-5 items-center justify-center rounded-lg bg-gray-500/20 sm:h-6 sm:w-6">
                  <HugeiconsIcon
                    icon={Clock01Icon}
                    className="h-3 w-3 text-gray-400"
                  />
                </div>
                <span className="hidden sm:inline">Last Active</span>
                <span className="sm:hidden">Active</span>
              </span>
              <span className="max-w-30 truncate text-right font-medium text-white sm:max-w-none">
                {lastActive}
              </span>
            </div>
            <div className="flex w-full items-center justify-between">
              <span className="flex items-center gap-1 text-gray-400">
                <div className="flex h-5 w-5 items-center justify-center rounded-lg bg-indigo-500/20 sm:h-6 sm:w-6">
                  <HugeiconsIcon
                    icon={Home01Icon}
                    className="h-3 w-3 text-indigo-400"
                  />
                </div>
                <span className="hidden sm:inline">Bot Added</span>
                <span className="sm:hidden">Bot</span>
              </span>
              <span
                className={
                  server.botAdded
                    ? 'font-medium text-green-400'
                    : 'font-medium text-red-400'
                }
              >
                {server.botAdded ? 'Yes' : 'No'}
              </span>
            </div>
          </div>
        </CardContent>
        <CardFooter className="border-gray-800/50 border-t pt-0 pb-3 sm:pb-4">
          {server.botAdded ? (
            <Button
              asChild
              className="mt-2 w-full rounded-xl border-none bg-linear-to-r from-gray-800 to-gray-800 shadow-lg transition-all duration-200 hover:from-gray-600 hover:to-gray-700 hover:shadow-gray-500/25"
            >
              <Link href={`/dashboard/servers/${server.id}`}>
                <HugeiconsIcon icon={Home01Icon} className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">Manage Server</span>
                <span className="sm:hidden">Manage</span>
              </Link>
            </Button>
          ) : (
            <Button
              asChild
              className="btn-primary w-full rounded-xl border-none shadow-lg transition-all duration-200"
            >
              <Link
                href={`https://discord.com/oauth2/authorize?client_id=769921109209907241&guild_id=${server.id}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <HugeiconsIcon
                  icon={LinkSquare02Icon}
                  className="mr-2 h-4 w-4"
                />
                <span className="hidden sm:inline">Add Bot</span>
                <span className="sm:hidden">Add</span>
              </Link>
            </Button>
          )}
        </CardFooter>
      </Card>
    </motion.div>
  );
}
