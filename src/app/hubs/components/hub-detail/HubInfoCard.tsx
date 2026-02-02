import { formatDistanceToNow } from 'date-fns';
import { Clock, Handshake, Heart, Tag, Users } from 'lucide-react';
import Image from 'next/image';
import type React from 'react';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import type { SimplifiedHub } from '@/hooks/use-infinite-hubs';

interface HubInfoCardProps {
  hub: {
    name: string;
    description: string | null;
    iconUrl: string | null;
    upvotes: SimplifiedHub['upvotes']; // Replace with actual type if available
    _count: { connections: number };
    lastActive: Date | null;
    tags: Array<{ name: string }>;
    verified?: boolean;
    partnered?: boolean;
  };
}

const HubInfoCard: React.FC<HubInfoCardProps> = ({ hub }) => {
  return (
    <div className="relative flex flex-col items-start gap-6 md:flex-row md:items-center">
      <div className="group h-28 w-28 shrink-0 transform overflow-hidden rounded-2xl border-4 border-gray-700/70 bg-gray-800/80 shadow-lg transition-transform duration-300 hover:scale-105 md:h-36 md:w-36">
        <div className="relative h-full w-full">
          <Image
            src={hub.iconUrl || '/assets/images/defaults/default-hub-icon.png'}
            alt={hub.name}
            width={144}
            height={144}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          {/* Subtle glow effect on hover */}
          <div className="absolute inset-0 bg-linear-to-tr from-primary/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        </div>
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <h1 className="wrap-break-word bg-linear-to-r from-white to-gray-300 bg-clip-text font-bold text-3xl text-transparent md:text-4xl">
              {hub.name}
            </h1>
            <div className="flex items-center gap-2">
              {hub.verified && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex h-6 w-6 cursor-help items-center justify-center rounded-full bg-blue-500">
                      <svg
                        className="h-4 w-4 text-white"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <title>Verified hub</title>
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Verified Hub</p>
                  </TooltipContent>
                </Tooltip>
              )}
              {hub.partnered && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex h-6 w-6 cursor-help items-center justify-center rounded-full bg-linear-to-br from-purple-500 via-purple-600 to-violet-700">
                      <Handshake className="h-4 w-4 text-white" />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Partner Hub</p>
                  </TooltipContent>
                </Tooltip>
              )}
            </div>
          </div>
        </div>
        {/* Brief description preview */}
        <p className="mt-2 line-clamp-2 text-gray-300 text-sm md:text-base">
          {hub.description?.split('\n')[0] ||
            'Join this active Cross-Server Hubs and connect with like-minded people.'}
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-gray-300">
          {/* Server Count */}
          <span className="flex items-center gap-1.5 rounded-full border border-gray-700/30 bg-gray-800/50 px-3 py-1.5 text-sm transition-colors hover:bg-gray-800">
            <Users className="h-4 w-4 text-primary" /> {hub._count.connections}{' '}
            server
            {hub._count.connections !== 1 ? 's' : ''}
          </span>
          {/* Upvotes */}
          <span className="flex items-center gap-1.5 rounded-full border border-gray-700/30 bg-gray-800/50 px-3 py-1.5 text-sm transition-colors hover:bg-gray-800">
            <Heart className="h-4 w-4 text-rose-500" /> {hub.upvotes.length}{' '}
            upvote
            {hub.upvotes.length !== 1 ? 's' : ''}
          </span>
          {/* Activity */}
          <span className="flex items-center gap-1.5 rounded-full border border-gray-700/30 bg-gray-800/50 px-3 py-1.5 text-sm transition-colors hover:bg-gray-800">
            <Clock className="h-4 w-4 text-primary" />
            {hub.lastActive
              ? formatDistanceToNow(hub.lastActive, { addSuffix: true })
              : 'No activity yet'}
          </span>
          {/* Tags with hover effect */}
          {hub.tags && hub.tags.length > 0 && (
            <span className="flex items-center gap-1.5 rounded-full border border-gray-700/30 bg-gray-800/50 px-3 py-1.5 text-sm transition-colors hover:bg-gray-800">
              <Tag className="h-4 w-4 text-primary" />
              {hub.tags.map((tag) => tag.name).join(', ')}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
export default HubInfoCard;
