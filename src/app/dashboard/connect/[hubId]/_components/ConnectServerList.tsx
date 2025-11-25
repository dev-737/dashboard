'use client';

import { ArrowRight, Check, ExternalLink, Search } from 'lucide-react';
import { motion } from 'motion/react';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import type { ServerDataWithConnections } from '@/actions/server-actions';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface ConnectServerListProps {
  servers: ServerDataWithConnections[];
  hubId: string;
}

export function ConnectServerList({ servers, hubId }: ConnectServerListProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredServers = servers.filter((server) =>
    server.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="relative">
        <Search className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 text-gray-400" />
        <Input
          type="text"
          placeholder="Search your servers..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="h-11 border-gray-800 bg-gray-900/50 pl-10 text-base transition-all focus:border-indigo-500/50 focus:bg-gray-900 focus:ring-2 focus:ring-indigo-500/20"
        />
      </div>

      {/* Server List */}
      <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {filteredServers.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
            <div className="rounded-full bg-gray-900/50 p-4">
              <Search className="h-8 w-8 text-gray-500" />
            </div>
            <h3 className="mt-4 font-semibold text-gray-200">
              No servers found
            </h3>
            <p className="mt-2 text-gray-400 text-sm">
              {searchQuery
                ? "We couldn't find any servers matching your search."
                : "You don't have any servers available to connect."}
            </p>
          </div>
        ) : (
          filteredServers.map((server, index) => {
            const isConnected = server.connections.some(
              (c) => c.hubId === hubId && c.connected
            );

            return (
              <motion.div
                key={server.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card
                  className={cn(
                    'group relative overflow-hidden border-gray-800 bg-gray-900/40 transition-all hover:border-gray-700 hover:bg-gray-900/60',
                    isConnected && 'border-green-900/30 bg-green-900/5'
                  )}
                >
                  <CardHeader className="flex flex-row items-center gap-4 p-4">
                    <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-gray-800 shadow-lg">
                      {server.icon ? (
                        <Image
                          src={`https://cdn.discordapp.com/icons/${server.id}/${server.icon}.png`}
                          alt={server.name || 'Server Icon'}
                          fill
                          className="object-cover transition-transform duration-300 group-hover:scale-110"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-linear-to-br from-gray-800 to-gray-900 font-bold text-gray-400 text-lg">
                          {server.name?.substring(0, 2).toUpperCase()}
                        </div>
                      )}
                    </div>

                    <div className="flex-1 overflow-hidden">
                      <CardTitle className="truncate font-medium text-base text-gray-200 group-hover:text-white">
                        {server.name}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-2 text-xs">
                        {isConnected ? (
                          <span className="text-green-400">Connected</span>
                        ) : server.botAdded ? (
                          <span className="text-gray-400">
                            Ready to connect
                          </span>
                        ) : (
                          <span className="text-amber-400">Bot not added</span>
                        )}
                      </CardDescription>
                    </div>
                  </CardHeader>

                  <div className="p-4 pt-0">
                    {isConnected ? (
                      <Button
                        variant="outline"
                        disabled
                        className="w-full border-green-900/30 bg-green-900/10 text-green-400 hover:bg-green-900/20"
                      >
                        <Check className="mr-2 h-4 w-4" />
                        Connected
                      </Button>
                    ) : server.botAdded ? (
                      <Button
                        asChild
                        className="w-full bg-indigo-600 text-white shadow-indigo-500/20 shadow-lg transition-all hover:translate-y-[-1px] hover:bg-indigo-500 hover:shadow-indigo-500/30"
                      >
                        <Link
                          href={`/dashboard/servers/${server.id}/connect?hubId=${hubId}`}
                        >
                          Connect
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                    ) : (
                      <Button
                        asChild
                        variant="secondary"
                        className="w-full border border-gray-700 bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white"
                      >
                        <Link
                          href={`https://discord.com/oauth2/authorize?client_id=769921109209907241&guild_id=${server.id}&permissions=8&scope=bot%20applications.commands`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <ExternalLink className="mr-2 h-4 w-4" />
                          Add Bot
                        </Link>
                      </Button>
                    )}
                  </div>
                </Card>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}
