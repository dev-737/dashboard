'use client';

import { useQueryClient } from '@tanstack/react-query';
import type {
  ContentFilter,
  SortOptions,
  VerificationStatus,
} from '@/app/hubs/constants';
import type {
  HubActivityLevel,
  Role,
} from '@/lib/generated/prisma/client/client';
import { useInfiniteQuery } from '@/lib/tanstack-query';
import { useTRPC } from '@/utils/trpc';
import { useErrorNotification } from './use-error-notification';

// Types
export interface SimplifiedHub {
  id: string;
  name: string;
  description: string;
  shortDescription: string | null;
  iconUrl: string;
  bannerUrl: string | null;
  createdAt: Date;
  lastActive: Date;
  rules: string[];
  moderators: {
    id: string;
    role: Role;
    user: { name: string | null; image: string | null; id: string };
  }[];
  upvotes: { id: string; userId: string }[];
  reviews: {
    id: string;
    createdAt: Date;
    user: {
      name: string | null;
      id: string;
      image: string | null;
    };
    rating: number;
    text: string;
  }[];
  tags: { name: string }[];
  nsfw: boolean;
  verified: boolean;
  partnered: boolean;
  activityLevel: HubActivityLevel;
  _count: {
    connections: number;
    messages?: number;
  };
}

export interface PaginationInfo {
  page: number;
  totalPages: number;
  totalItems: number;
  hasMore: boolean;
}

export interface HubsResponse {
  hubs: SimplifiedHub[];
  pagination: PaginationInfo;
}

// Enhanced filter options interface (simplified to match tRPC schema)
export interface HubFilterOptions {
  search?: string;
  tags?: string[];
  sort?: SortOptions;
  // Note: Other filters may need additional tRPC procedures
  contentFilter?: ContentFilter;
  verificationStatus?: VerificationStatus;
  language?: string;
  region?: string;
  minMembers?: number;
  maxMembers?: number;
  activityLevels?: HubActivityLevel[];
}

/**
 * Hook for infinite query of hubs using tRPC with optimized caching and error handling
 */
export function useInfiniteHubs(
  params: HubFilterOptions & {
    limit?: number;
    enabled?: boolean;
    staleTime?: number;
  }
) {
  const trpc = useTRPC();
  const { search, tags, sort, limit = 12, enabled = true, staleTime } = params;

  const queryClient = useQueryClient();

  const query = useInfiniteQuery({
    queryKey: ['infiniteHubs', { search, tags, sort, limit }],
    queryFn: async ({ pageParam = 0 }) => {
      return await queryClient.fetchQuery(
        trpc.hub.getHubs.queryOptions({
          search,
          tags,
          sort,
          skip: pageParam,
          limit,
        })
      );
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage: HubsResponse, allPages: HubsResponse[]) => {
      if (!lastPage.pagination.hasMore) return null;
      // Calculate total hubs loaded so far across all pages
      const totalHubsLoaded = allPages.reduce(
        (total: number, page: HubsResponse) => total + page.hubs.length,
        0
      );
      return totalHubsLoaded;
    },
    enabled,
    staleTime: staleTime || 1000 * 60 * 5, // 5 minutes default
    retry: 2,
    refetchOnWindowFocus: false,
  });

  // Handle error notification
  useErrorNotification({
    isError: query.isError,
    error: query.error,
    title: 'Hubs Error',
    description: 'Failed to load hubs',
  });

  // Flatten the pages of hubs into a single array and filter out duplicates
  const hubs =
    query.data?.pages.reduce<SimplifiedHub[]>((acc, page) => {
      // Filter out hubs that are already in the accumulated array
      const uniqueHubs = page.hubs.filter(
        (hub) => !acc.some((existingHub) => existingHub.id === hub.id)
      );
      // biome-ignore lint/performance/noAccumulatingSpread: <explanation>
      return [...acc, ...uniqueHubs];
    }, []) || [];

  // Determine if there are more hubs to load
  // We need to check if the last page indicates there are more results
  const lastPage = query.data?.pages[query.data.pages.length - 1];
  const hasMore = lastPage?.pagination.hasMore ?? false;

  return {
    ...query,
    hubs,
    hasMore,
  };
}
