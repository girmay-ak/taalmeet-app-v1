/**
 * Current User Hook
 * React Query hook for fetching current user's profile
 */

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useAuth } from '@/providers';
import * as profileService from '@/services/profileService';

// ============================================================================
// QUERY KEYS
// ============================================================================

export const currentUserKeys = {
  all: ['currentUser'] as const,
};

// ============================================================================
// QUERY
// ============================================================================

/**
 * Get current user's profile
 * Automatically refetches when session changes
 * 
 * @returns { data, isLoading, error }
 * - data: CurrentUserProfile | null
 * - isLoading: boolean
 * - error: Error | null
 */
export function useCurrentUser() {
  const { session } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: currentUserKeys.all,
    queryFn: profileService.getCurrentUserProfile,
    enabled: !!session, // Only fetch when session exists
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: false,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });

  // Auto-refetch when session changes
  useEffect(() => {
    if (session?.user?.id) {
      // Session exists, refetch profile
      queryClient.invalidateQueries({ queryKey: currentUserKeys.all });
    } else {
      // Session cleared, remove cached data
      queryClient.setQueryData(currentUserKeys.all, null);
    }
  }, [session?.user?.id, queryClient]);

  return query;
}

