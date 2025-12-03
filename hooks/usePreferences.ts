/**
 * Preferences Hooks
 * React Query hooks for discovery preferences operations
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Alert } from 'react-native';
import * as preferencesService from '@/services/preferencesService';
import { getUserFriendlyMessage } from '@/utils/errors';
import type { DiscoveryPreferencesUpdate } from '@/types/database';

// ============================================================================
// QUERY KEYS
// ============================================================================

export const preferencesKeys = {
  all: ['preferences'] as const,
  discovery: (userId: string) => [...preferencesKeys.all, 'discovery', userId] as const,
};

// ============================================================================
// QUERIES
// ============================================================================

/**
 * Get user's discovery preferences
 */
export function useDiscoveryPreferences(userId: string | undefined) {
  return useQuery({
    queryKey: preferencesKeys.discovery(userId || ''),
    queryFn: () => (userId ? preferencesService.getDiscoveryPreferences(userId) : null),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// ============================================================================
// MUTATIONS
// ============================================================================

/**
 * Update discovery preferences
 */
export function useUpdateDiscoveryPreferences() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userId,
      payload,
    }: {
      userId: string;
      payload: DiscoveryPreferencesUpdate;
    }) => {
      return preferencesService.updateDiscoveryPreferences(userId, payload);
    },
    onSuccess: (_, variables) => {
      // Invalidate preferences query
      queryClient.invalidateQueries({
        queryKey: preferencesKeys.discovery(variables.userId),
      });
    },
    onError: (error) => {
      const message = getUserFriendlyMessage(error);
      Alert.alert('Update Failed', message);
    },
  });
}

/**
 * Reset preferences to defaults
 */
export function useResetDiscoveryPreferences() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: string) => {
      return preferencesService.resetDiscoveryPreferences(userId);
    },
    onSuccess: (_, userId) => {
      // Invalidate preferences query
      queryClient.invalidateQueries({
        queryKey: preferencesKeys.discovery(userId),
      });
    },
    onError: (error) => {
      const message = getUserFriendlyMessage(error);
      Alert.alert('Reset Failed', message);
    },
  });
}

