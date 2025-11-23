'use client';

import { formatDistanceToNow } from 'date-fns';
import { Clock, Home, Link2, MessageSquare, Settings } from 'lucide-react';
import { motion } from 'motion/react';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { useInView } from 'react-intersection-observer';
import { Badge } from '@/components/ui/badge';
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
import type {
  Connection,
  Hub,
  ServerData,
} from '@/lib/generated/prisma/client/client';

interface Props {
  connections: (Connection & {
    hub: Hub;
    server: ServerData | null;
  })[];
}

export function ConnectionsGrid({ connections }: Props) {
  const [searchQuery, setSearchQuery] = useState('');

  // Filter connections based on search query
  const filteredConnections = connections.filter(
    (connection) =>
      connection.hub.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      connection.server?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (connections.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="mb-4 rounded-full bg-gray-800/50 p-3">
          <MessageSquare className="h-6 w-6 text-gray-400" />
        </div>
        <h3 className="mb-2 font-medium text-lg">No connections found</h3>
        <p className="mb-4 max-w-md text-gray-400">
          You don&apos;t have any connections between your servers and hubs yet.
        </p>
        <Button
          asChild
          className="border-none bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-600/80 hover:to-indigo-600/80"
        >
          <Link href="/dashboard">Manage Servers</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="relative">
        <Input
          type="text"
          placeholder="Search connections..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="border-gray-700/50 bg-gray-800/50 pl-10 focus-visible:ring-indigo-500/50"
        />
        <div className="-translate-y-1/2 absolute top-1/2 left-3 transform text-gray-400">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <title>Search icon</title>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
      </div>

      {filteredConnections.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="mb-4 rounded-full bg-gray-800/50 p-3">
            <MessageSquare className="h-6 w-6 text-gray-400" />
          </div>
          <h3 className="mb-2 font-medium text-lg">No matching connections</h3>
          <p className="max-w-md text-gray-400">
            No connections match your search query. Try a different search term.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredConnections.map((connection, index) => (
            <ConnectionCard
              key={connection.id}
              connection={connection}
              index={index}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface ConnectionCardProps {
  connection: Props['connections'][0];
  index: number;
}

function ConnectionCard({ connection, index }: ConnectionCardProps) {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });
  // Format times
  const createdAt = formatDistanceToNow(new Date(connection.createdAt), {
    addSuffix: true,
  });
  const lastActive = connection.lastActive
    ? formatDistanceToNow(new Date(connection.lastActive), { addSuffix: true })
    : 'Never';

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.5, delay: index * 0.05 }}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
      className="h-full"
    >
      <Card className="flex h-full flex-col overflow-hidden border border-gray-800/50 bg-linear-to-b from-gray-900/80 to-gray-950/80 backdrop-blur-sm transition-all duration-300">
        <CardHeader className="relative pb-2">
          <div className="flex items-center justify-between">
            <Badge
              variant={connection.connected ? 'default' : 'destructive'}
              className={`mb-2 ${connection.connected ? 'border-green-500/30 bg-green-500/20 text-green-300 hover:bg-green-500/30' : ''}`}
            >
              {connection.connected ? 'Connected' : 'Disconnected'}
            </Badge>
            <span className="text-gray-400 text-xs">Created {createdAt}</span>
          </div>
          <div className="flex items-center gap-3">
            <motion.div
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              <div className="h-12 w-12 overflow-hidden rounded-full border-2 border-gray-700/50">
                <Image
                  src={connection.hub.iconUrl}
                  alt={connection.hub.name}
                  width={48}
                  height={48}
                  className="object-cover"
                  style={{ width: '100%', height: '100%' }}
                />
              </div>
            </motion.div>
            <div className="min-w-0 flex-1">
              <CardTitle className="truncate text-lg">
                {connection.hub.name}
              </CardTitle>
              <CardDescription className="truncate">Hub</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex-grow py-4">
          <div className="mb-4 flex items-center gap-3">
            <div className="min-w-0 flex-1">
              <div className="truncate font-medium">
                {connection.server?.name}
              </div>
              <div className="text-gray-400 text-xs">Server</div>
            </div>
          </div>
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1 text-gray-400">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-800/80">
                  <Link2 className="h-3 w-3 text-blue-400" />
                </div>
                Channel ID
              </span>
              <span className="font-mono text-gray-200 text-xs">
                {connection.channelId}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1 text-gray-400">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-800/80">
                  <Clock className="h-3 w-3 text-gray-400" />
                </div>
                Last Active
              </span>
              <span className="text-gray-200">{lastActive}</span>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex gap-2 border-gray-800/50 border-t pt-2 pb-4">
          <Button
            asChild
            className="flex-1 border-none bg-linear-to-r from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700"
          >
            <Link href={`/dashboard/servers/${connection.serverId}`}>
              <Home className="mr-2 h-4 w-4" />
              Server
            </Link>
          </Button>
          <Button
            asChild
            className="flex-1 border-none bg-linear-to-r from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700"
          >
            <Link href={`/dashboard/hubs/${connection.hubId}`}>
              <MessageSquare className="mr-2 h-4 w-4" />
              Hub
            </Link>
          </Button>
          <Button
            asChild
            className="flex-1 border-none bg-linear-to-r from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700"
          >
            <Link href={`/dashboard/connections/${connection.id}/edit`}>
              <Settings className="mr-2 h-4 w-4" />
              Edit
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
