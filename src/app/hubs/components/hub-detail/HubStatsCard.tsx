'use client';

import { formatDistanceToNow } from 'date-fns';
import { Calendar, Clock, Heart, Home } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import type { SimplifiedHub } from '@/hooks/use-infinite-hubs';
import type { HubConnectionData } from '@/lib/hub-queries';

export default function HubStatsCard({
  hub,
  connections,
}: {
  hub: SimplifiedHub;
  connections: HubConnectionData[];
}) {
  const { createdAt, upvotes } = hub;
  const connectionCount = hub._count.connections;
  const upvoteCount = upvotes.length;

  const lastActive =
    connections.length > 0
      ? connections.reduce(
          (latest, connection) =>
            connection.lastActive && (!latest || connection.lastActive > latest)
              ? connection.lastActive
              : latest,
          null as Date | null
        )
      : null;

  const lastActiveText = lastActive
    ? formatDistanceToNow(new Date(lastActive), { addSuffix: true })
    : 'No recent activity';

  const createdDate = new Date(createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <Card className="border-gray-800 bg-[#0f1117]">
      <div className="border-gray-800 border-b p-4">
        <h2 className="font-semibold text-lg">Hub Stats</h2>
      </div>
      <CardContent className="p-0">
        <div className="divide-y divide-gray-800">
          <div className="flex items-center justify-between p-4 transition-colors hover:bg-gray-900/50">
            <div className="flex items-center gap-3">
              <Home className="h-5 w-5 text-purple-400" />
              <span>Connected Servers</span>
            </div>
            <span className="font-medium">{connectionCount}</span>
          </div>

          <div className="flex items-center justify-between p-4 transition-colors hover:bg-gray-900/50">
            <div className="flex items-center gap-3">
              <Heart className="h-5 w-5 text-purple-400" />
              <span>Upvotes</span>
            </div>
            <span className="font-medium">{upvoteCount}</span>
          </div>

          <div className="flex items-center justify-between p-4 transition-colors hover:bg-gray-900/50">
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-purple-400" />
              <span>Last Active</span>
            </div>
            <span className="font-medium">{lastActiveText}</span>
          </div>

          <div className="flex items-center justify-between p-4 transition-colors hover:bg-gray-900/50">
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-purple-400" />
              <span>Created On</span>
            </div>
            <span className="font-medium">{createdDate}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
