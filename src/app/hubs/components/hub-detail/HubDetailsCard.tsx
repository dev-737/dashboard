import { formatDistanceToNow } from 'date-fns';
import { Calendar, Heart, MessageSquare, Users } from 'lucide-react';
import type React from 'react';

interface HubDetailsCardProps {
  formattedDate: string;
  hub: {
    lastActive: Date | null;
    upvotes: Array<{ id: string; userId: string }>;
  };
  connections: Array<{
    id: string;
    serverId: string;
    connected: boolean;
    createdAt: Date;
    lastActive: Date;
    server: { id: string; name: string | null };
  }>;
}

const HubDetailsCard: React.FC<HubDetailsCardProps> = ({
  formattedDate,
  hub,
  connections,
}) => {
  return (
    <div className="rounded-xl border border-gray-800/70 bg-gray-900/60 p-4 shadow-lg backdrop-blur-md sm:p-6">
      <h3 className="mb-3 flex items-center font-semibold text-lg text-white sm:mb-5 sm:text-xl">
        <Calendar className="mr-2 h-4 w-4 text-primary sm:h-5 sm:w-5" />
        Hub Details
      </h3>
      <dl className="space-y-2 sm:space-y-3">
        {/* Created Date */}
        <div className="flex items-center justify-between rounded-md border border-gray-700/30 bg-gray-800/40 p-3 transition-colors hover:bg-gray-800/60">
          <dt className="flex items-center text-gray-400 text-sm">
            <Calendar className="mr-2 h-4 w-4 text-primary/80" />
            Created
          </dt>
          <dd className="font-medium text-gray-200 text-sm">{formattedDate}</dd>
        </div>

        {/* Last Message */}
        <div className="flex items-center justify-between rounded-md border border-gray-700/30 bg-gray-800/40 p-3 transition-colors hover:bg-gray-800/60">
          <dt className="flex items-center text-gray-400 text-sm">
            <MessageSquare className="mr-2 h-4 w-4 text-primary/80" />
            Last Message
          </dt>
          <dd className="font-medium text-gray-200 text-sm">
            {hub.lastActive
              ? formatDistanceToNow(hub.lastActive, {
                  addSuffix: true,
                })
              : 'No activity yet'}
          </dd>
        </div>

        {/* Connected Servers */}
        <div className="flex items-center justify-between rounded-md border border-gray-700/30 bg-gray-800/40 p-3 transition-colors hover:bg-gray-800/60">
          <dt className="flex items-center text-gray-400 text-sm">
            <Users className="mr-2 h-4 w-4 text-primary/80" />
            Connected Servers
          </dt>
          <dd className="font-medium text-gray-200 text-sm">
            {connections.length}
          </dd>
        </div>

        {/* Upvotes */}
        <div className="flex items-center justify-between rounded-md border border-gray-700/30 bg-gray-800/40 p-3 transition-colors hover:bg-gray-800/60">
          <dt className="flex items-center text-gray-400 text-sm">
            <Heart className="mr-2 h-4 w-4 text-rose-500/80" />
            Upvotes
          </dt>
          <dd className="font-medium text-gray-200 text-sm">
            {hub.upvotes.length}
          </dd>
        </div>
      </dl>
    </div>
  );
};

export default HubDetailsCard;
