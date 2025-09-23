import { Star } from 'lucide-react';
import type React from 'react';
import { cn } from '@/lib/utils';

interface ReviewStats {
  total: number;
  average: number;
  distribution: Array<{ rating: number; count: number; percentage: number }>;
}

interface HubReviewAnalyticsProps {
  reviewStats: ReviewStats;
}

const HubReviewAnalytics: React.FC<HubReviewAnalyticsProps> = ({
  reviewStats,
}) => {
  return (
    <div className="mb-8 flex flex-col gap-6 md:flex-row">
      <div className="flex-1 rounded-xl border border-gray-700/40 bg-gray-800/40 p-5">
        <div className="mb-2 flex items-end gap-2">
          <span className="font-bold text-4xl text-white">
            {reviewStats.average.toFixed(1)}
          </span>
          <div className="mb-1 flex items-center text-amber-400">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={`rating-star-${i + 1}`}
                className={cn(
                  'h-4 w-4',
                  i < Math.round(reviewStats.average)
                    ? 'fill-amber-400'
                    : 'fill-gray-700'
                )}
              />
            ))}
          </div>
        </div>
        <p className="text-gray-400 text-sm">
          {reviewStats.total} review
          {reviewStats.total !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Rating distribution */}
      <div className="flex-1 rounded-xl border border-gray-700/40 bg-gray-800/40 p-5">
        <div className="space-y-2">
          {reviewStats.distribution.map((item) => (
            <div key={item.rating} className="flex items-center gap-3">
              <div className="flex w-12 items-center gap-1">
                <span className="font-medium text-gray-300 text-sm">
                  {item.rating}
                </span>
                <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
              </div>
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-700">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-amber-400"
                  style={{ width: `${item.percentage}%` }}
                />
              </div>
              <span className="w-10 text-right font-medium text-gray-400 text-xs">
                {item.percentage}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HubReviewAnalytics;
