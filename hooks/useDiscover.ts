/**
 * Discover Hooks
 * React Query hooks for discover feed
 */

import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/providers';
import * as discoverService from '@/services/discoverService';
import type { DiscoverFilters } from '@/services/discoverService';

// ============================================================================
// QUERY KEYS
// ============================================================================

export const discoverKeys = {
  all: ['discover'] as const,
  feed: (userId: string, filters: DiscoverFilters) =>
    [...discoverKeys.all, 'feed', userId, filters] as const,
};

// ============================================================================
// QUERIES
// ============================================================================

/**
 * Get discover feed (recommended users, new users, active users, sessions)
 */
export function useDiscoverFeed(filters: DiscoverFilters = {}) {
  const { user } = useAuth();

  return useQuery({
    queryKey: discoverKeys.feed(user?.id || '', filters),
    queryFn: () => {
      if (!user?.id) {
        throw new Error('User must be authenticated to fetch discover feed');
      }
      return discoverService.getDiscoverFeed(user.id, filters);
    },
    enabled: !!user?.id,
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60 * 1000, // Refetch every minute for fresh data
  });
}

