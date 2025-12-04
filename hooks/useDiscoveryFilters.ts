/**
 * Discovery Filters Hooks
 * React Query hooks for discovery filter preferences
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Alert } from 'react-native';
import * as discoveryFilterService from '@/services/discoveryFilterService';
import { getUserFriendlyMessage } from '@/utils/errors';
import { useAuth } from '@/providers';
import type { DiscoveryFilterPreferencesUpdate } from '@/types/database';

// ============================================================================
// QUERY KEYS
// ============================================================================

export const discoveryFilterKeys = {
  all: ['discoveryFilters'] as const,
  preferences: (userId: string) => [...discoveryFilterKeys.all, 'preferences', userId] as const,
};

// ============================================================================
// QUERIES
// ============================================================================

/**
 * Get user's discovery filter preferences
 */
export function useDiscoveryFilterPreferences(userId: string | undefined) {
  return useQuery({
    queryKey: discoveryFilterKeys.preferences(userId || ''),
    queryFn: () => (userId ? discoveryFilterService.getDiscoveryFilterPreferences(userId) : null),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// ============================================================================
// MUTATIONS
// ============================================================================

/**
 * Update discovery filter preferences mutation
 */
export function useUpdateDiscoveryFilterPreferences() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (preferences: DiscoveryFilterPreferencesUpdate) => {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }
      return discoveryFilterService.upsertDiscoveryFilterPreferences(user.id, preferences);
    },
    onSuccess: () => {
      if (user?.id) {
        queryClient.invalidateQueries({ queryKey: discoveryFilterKeys.preferences(user.id) });
        // Also invalidate discover feed to refresh with new filters
        queryClient.invalidateQueries({ queryKey: ['discover'] });
      }
    },
    onError: (error) => {
      const message = getUserFriendlyMessage(error);
      Alert.alert('Error', message);
    },
  });
}

/**
 * Reset discovery filter preferences mutation
 */
export function useResetDiscoveryFilterPreferences() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async () => {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }
      return discoveryFilterService.resetDiscoveryFilterPreferences(user.id);
    },
    onSuccess: () => {
      if (user?.id) {
        queryClient.invalidateQueries({ queryKey: discoveryFilterKeys.preferences(user.id) });
        queryClient.invalidateQueries({ queryKey: ['discover'] });
      }
    },
    onError: (error) => {
      const message = getUserFriendlyMessage(error);
      Alert.alert('Error', message);
    },
  });
}

