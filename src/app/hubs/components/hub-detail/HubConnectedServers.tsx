import {
  Clock01Icon,
  PlusSignIcon,
  UserMultipleIcon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { formatDistanceToNow } from 'date-fns';
import type React from 'react';

interface HubConnectedServersProps {
  connections: {
    id: string;
    lastActive: Date;
    server: { name: string | null };
  }[]; // Replace with actual type if available
}

const HubConnectedServers: React.FC<HubConnectedServersProps> = ({
  connections,
}) => {
  const visibleConnections = connections.slice(0, 10);
  const remainingCount = connections.length - 10;

  return (
    <>
      {connections.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {visibleConnections.map((conn) => (
            <div
              key={conn.id}
              className="flex items-center gap-4 rounded-lg border border-gray-800/60 bg-gray-800/30 p-4 transition-colors duration-200 hover:bg-gray-800/50"
            >
              <div className="h-12 w-12 overflow-hidden rounded-lg border border-gray-700/50">
                <div className="flex h-full w-full items-center justify-center bg-gray-700">
                  <HugeiconsIcon
                    icon={UserMultipleIcon}
                    className="h-6 w-6 text-gray-300"
                  />
                </div>
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="truncate font-medium text-sm text-white">
                  {conn.server?.name || 'Discord Server'}
                </h4>
                <p className="mt-1 flex items-center text-gray-400 text-xs">
                  <HugeiconsIcon
                    strokeWidth={3}
                    icon={Clock01Icon}
                    className="mr-1 h-3 w-3"
                  />
                  {formatDistanceToNow(new Date(conn.lastActive), {
                    addSuffix: true,
                  })}
                </p>
              </div>
            </div>
          ))}
          {remainingCount > 0 && (
            <div className="flex items-center gap-4 rounded-lg border border-gray-700/50 bg-gray-700/20 p-4 transition-colors duration-200 hover:bg-gray-700/30">
              <div className="h-12 w-12 overflow-hidden rounded-lg border border-gray-600/50">
                <div className="flex h-full w-full items-center justify-center bg-gray-600">
                  <HugeiconsIcon
                    icon={PlusSignIcon}
                    className="h-6 w-6 text-gray-300"
                  />
                </div>
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="font-medium text-gray-300 text-sm">
                  +{remainingCount} more server{remainingCount !== 1 ? 's' : ''}
                </h4>
                <p className="mt-1 text-gray-400 text-xs">
                  View all connections in dashboard
                </p>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center p-10 text-gray-400">
          <HugeiconsIcon
            icon={UserMultipleIcon}
            className="mb-3 h-12 w-12 text-gray-500 opacity-50"
          />
          <p className="text-center text-gray-400">No servers connected yet</p>
          <p className="mt-1 text-center text-gray-500 text-sm">
            Be the first to connect your Discord server!
          </p>
        </div>
      )}
    </>
  );
};

export default HubConnectedServers;
