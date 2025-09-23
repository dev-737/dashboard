import { Tag } from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';

const SimilarHubsCard = () => {
  return (
    <div className="rounded-xl border border-gray-800/70 bg-gray-900/60 p-4 shadow-lg backdrop-blur-md sm:p-6">
      <h3 className="mb-3 flex items-center font-semibold text-lg text-white sm:mb-5 sm:text-xl">
        <Tag className="mr-2 h-4 w-4 text-primary sm:h-5 sm:w-5" />
        Similar Hubs
      </h3>

      <div className="space-y-3">
        {/* Placeholder for similar hubs - would be dynamically populated */}
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-gray-800/40"
          >
            <div className="h-10 w-10 overflow-hidden rounded-lg border border-gray-700/50">
              <Image
                src={`https://api.dicebear.com/7.x/shapes/svg?seed=hub${i}`}
                alt={`Similar Hub ${i}`}
                width={40}
                height={40}
                className="object-cover"
                unoptimized
              />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium text-gray-200 text-sm">
                {['Gaming Central', 'Anime Hangout', 'Tech Community'][i - 1]}
              </p>
              <p className="truncate text-gray-400 text-xs">
                {[24, 18, 32][i - 1]} servers
              </p>
            </div>
          </div>
        ))}

        <Button className="mt-2 w-full rounded-lg border border-gray-700/30 bg-gray-800/60 px-4 py-2 font-medium text-sm text-white transition-colors hover:bg-gray-700/60">
          Explore More Hubs
        </Button>
      </div>
    </div>
  );
};

export default SimilarHubsCard;
