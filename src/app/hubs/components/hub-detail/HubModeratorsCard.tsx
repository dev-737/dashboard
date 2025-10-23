import { Shield } from 'lucide-react';
import Image from 'next/image';
import type React from 'react';

interface HubModeratorsCardProps {
  moderators: Array<{
    id: string;
    role: string | null;
    user: { name: string | null; image: string | null; id: string } | null;
  }> | null;
}

const HubModeratorsCard: React.FC<HubModeratorsCardProps> = ({
  moderators,
}) => {
  return (
    <div className="rounded-xl border border-gray-800/70 bg-gray-900/60 p-4 shadow-lg backdrop-blur-md sm:p-6">
      <h3 className="mb-3 flex items-center font-semibold text-lg text-white sm:mb-5 sm:text-xl">
        <Shield className="mr-2 h-4 w-4 text-primary sm:h-5 sm:w-5" />
        Moderators
      </h3>
      {moderators && moderators.length > 0 ? (
        <div className="space-y-3">
          {moderators.map((mod) => (
            <div
              key={mod.id}
              className="flex items-center gap-3 rounded-md p-2 transition-colors hover:bg-gray-800/50"
            >
              <div className="h-8 w-8 flex-shrink-0 overflow-hidden rounded-full border border-gray-700/50 bg-gray-800 sm:h-10 sm:w-10">
                <Image
                  src={
                    mod.user?.image ||
                    '/assets/images/defaults/default-avatar.png'
                  }
                  alt={mod.user?.name || 'User Avatar'}
                  width={40}
                  height={40}
                  className="object-cover"
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-gray-200 text-xs sm:text-sm">
                  {mod.user?.name}
                </p>
                <p className="truncate text-gray-400 text-xs">
                  {mod.role || 'Moderator'}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="py-3 text-center text-gray-400 text-sm">
          No moderators listed
        </p>
      )}
    </div>
  );
};

export default HubModeratorsCard;
