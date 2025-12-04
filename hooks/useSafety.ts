/**
 * Safety Hooks
 * React Query hooks for user blocking and reporting operations
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Alert } from 'react-native';
import * as safetyService from '@/services/safetyService';
import { getUserFriendlyMessage } from '@/utils/errors';
import { useAuth } from '@/providers';

// ============================================================================
// QUERY KEYS
// ============================================================================

export const safetyKeys = {
  all: ['safety'] as const,
  blockedUsers: (userId: string) => [...safetyKeys.all, 'blocked', userId] as const,
  isBlocked: (userId1: string, userId2: string) =>
    [...safetyKeys.all, 'isBlocked', userId1, userId2] as const,
  blockedIds: (userId: string) => [...safetyKeys.all, 'blockedIds', userId] as const,
};

// ============================================================================
// QUERIES
// ============================================================================

/**
 * Get all users blocked by the current user
 */
export function useBlockedUsers(userId: string | undefined) {
  return useQuery({
    queryKey: safetyKeys.blockedUsers(userId || ''),
    queryFn: () => (userId ? safetyService.getBlockedUsers(userId) : []),
    enabled: !!userId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

/**
 * Check if a specific user is blocked (bidirectional)
 */
export function useIsBlocked(userId1: string | undefined, userId2: string | undefined) {
  return useQuery({
    queryKey: safetyKeys.isBlocked(userId1 || '', userId2 || ''),
    queryFn: () => {
      if (!userId1 || !userId2) return false;
      return safetyService.isUserBlocked(userId1, userId2);
    },
    enabled: !!userId1 && !!userId2 && userId1 !== userId2,
    staleTime: 1 * 60 * 1000, // 1 minute
  });
}

/**
 * Get all blocked user IDs (for filtering)
 * This is useful for filtering queries in other hooks
 */
export function useBlockedUserIds(userId: string | undefined) {
  return useQuery({
    queryKey: safetyKeys.blockedIds(userId || ''),
    queryFn: () => (userId ? safetyService.getBlockedUserIds(userId) : []),
    enabled: !!userId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

// ============================================================================
// MUTATIONS
// ============================================================================

/**
 * Block a user mutation
 */
export function useBlockUser() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (targetUserId: string) => {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }
      return safetyService.blockUser(user.id, targetUserId);
    },
    onSuccess: () => {
      // Invalidate all relevant queries
      if (user?.id) {
        queryClient.invalidateQueries({ queryKey: safetyKeys.blockedUsers(user.id) });
        queryClient.invalidateQueries({ queryKey: safetyKeys.blockedIds(user.id) });
        // Invalidate discover, connections, messages to remove blocked user
        queryClient.invalidateQueries({ queryKey: ['discover'] });
        queryClient.invalidateQueries({ queryKey: ['connections'] });
        queryClient.invalidateQueries({ queryKey: ['messages'] });
      }
    },
    onError: (error) => {
      const message = getUserFriendlyMessage(error);
      Alert.alert('Block Failed', message);
    },
  });
}

/**
 * Unblock a user mutation
 */
export function useUnblockUser() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (targetUserId: string) => {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }
      return safetyService.unblockUser(user.id, targetUserId);
    },
    onSuccess: () => {
      // Invalidate all relevant queries
      if (user?.id) {
        queryClient.invalidateQueries({ queryKey: safetyKeys.blockedUsers(user.id) });
        queryClient.invalidateQueries({ queryKey: safetyKeys.blockedIds(user.id) });
        // Invalidate discover, connections, messages to show unblocked user
        queryClient.invalidateQueries({ queryKey: ['discover'] });
        queryClient.invalidateQueries({ queryKey: ['connections'] });
        queryClient.invalidateQueries({ queryKey: ['messages'] });
      }
    },
    onError: (error) => {
      const message = getUserFriendlyMessage(error);
      Alert.alert('Unblock Failed', message);
    },
  });
}

/**
 * Report a user mutation
 */
export function useReportUser() {
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (reportData: safetyService.ReportInsert) => {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }
      return safetyService.reportUser(user.id, reportData);
    },
    onSuccess: () => {
      Alert.alert(
        'Report Submitted',
        'Thank you for your report. We will review it and take appropriate action.',
        [{ text: 'OK' }]
      );
    },
    onError: (error) => {
      const message = getUserFriendlyMessage(error);
      Alert.alert('Report Failed', message);
    },
  });
}

