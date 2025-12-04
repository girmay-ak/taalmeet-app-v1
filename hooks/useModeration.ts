/**
 * Moderation Hooks
 * React Query hooks for content moderation operations (admin only)
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Alert } from 'react-native';
import * as moderationService from '@/services/moderationService';
import { getUserFriendlyMessage } from '@/utils/errors';
import { useAuth } from '@/providers';

// ============================================================================
// QUERY KEYS
// ============================================================================

export const moderationKeys = {
  all: ['moderation'] as const,
  reports: (status?: string) => [...moderationKeys.all, 'reports', status] as const,
  report: (id: string) => [...moderationKeys.all, 'report', id] as const,
  userActions: (userId?: string, actionType?: string) =>
    [...moderationKeys.all, 'actions', userId, actionType] as const,
  isAdmin: (userId: string) => [...moderationKeys.all, 'isAdmin', userId] as const,
  isBanned: (userId: string) => [...moderationKeys.all, 'isBanned', userId] as const,
};

// ============================================================================
// QUERIES
// ============================================================================

/**
 * Check if current user is admin
 */
export function useIsAdmin(userId: string | undefined) {
  return useQuery({
    queryKey: moderationKeys.isAdmin(userId || ''),
    queryFn: () => (userId ? moderationService.isAdmin(userId) : false),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Check if a user is banned or suspended
 */
export function useIsUserBanned(userId: string | undefined) {
  return useQuery({
    queryKey: moderationKeys.isBanned(userId || ''),
    queryFn: () => (userId ? moderationService.isUserBannedOrSuspended(userId) : false),
    enabled: !!userId,
    staleTime: 1 * 60 * 1000, // 1 minute
  });
}

/**
 * Get all reports (admin only)
 */
export function useReports(status?: string) {
  const { user } = useAuth();
  const { data: isAdminUser } = useIsAdmin(user?.id);

  return useQuery({
    queryKey: moderationKeys.reports(status),
    queryFn: () => moderationService.getAllReports(status as any),
    enabled: !!user && isAdminUser === true,
    staleTime: 30 * 1000, // 30 seconds
  });
}

/**
 * Get report by ID (admin only)
 */
export function useReport(reportId: string | undefined) {
  const { user } = useAuth();
  const { data: isAdminUser } = useIsAdmin(user?.id);

  return useQuery({
    queryKey: moderationKeys.report(reportId || ''),
    queryFn: () => (reportId ? moderationService.getReportById(reportId) : null),
    enabled: !!reportId && !!user && isAdminUser === true,
    staleTime: 1 * 60 * 1000,
  });
}

/**
 * Get all user actions (admin only)
 */
export function useUserActions(userId?: string, actionType?: string) {
  const { user } = useAuth();
  const { data: isAdminUser } = useIsAdmin(user?.id);

  return useQuery({
    queryKey: moderationKeys.userActions(userId, actionType),
    queryFn: () => moderationService.getAllUserActions(userId, actionType as any),
    enabled: !!user && isAdminUser === true,
    staleTime: 1 * 60 * 1000,
  });
}

// ============================================================================
// MUTATIONS
// ============================================================================

/**
 * Update report status mutation
 */
export function useUpdateReportStatus() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      reportId,
      status,
      adminNotes,
    }: {
      reportId: string;
      status: 'pending' | 'reviewing' | 'resolved' | 'dismissed' | 'action_taken';
      adminNotes?: string;
    }) => {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }
      return moderationService.updateReportStatus(reportId, status, adminNotes, user.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: moderationKeys.all });
    },
    onError: (error) => {
      const message = getUserFriendlyMessage(error);
      Alert.alert('Update Failed', message);
    },
  });
}

/**
 * Create user action mutation (warn, suspend, ban)
 */
export function useCreateUserAction() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (actionData: {
      user_id: string;
      action_type: 'warning' | 'suspension' | 'ban';
      reason: string;
      details?: string;
      duration_days?: number;
    }) => {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }
      return moderationService.createUserAction(actionData, user.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: moderationKeys.all });
    },
    onError: (error) => {
      const message = getUserFriendlyMessage(error);
      Alert.alert('Action Failed', message);
    },
  });
}

/**
 * Resolve user action mutation
 */
export function useResolveUserAction() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (actionId: string) => {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }
      return moderationService.resolveUserAction(actionId, user.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: moderationKeys.all });
    },
    onError: (error) => {
      const message = getUserFriendlyMessage(error);
      Alert.alert('Resolve Failed', message);
    },
  });
}

/**
 * Link action to report mutation
 */
export function useLinkActionToReport() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      reportId,
      actionId,
    }: {
      reportId: string;
      actionId: string;
    }) => {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }
      return moderationService.linkActionToReport(reportId, actionId, user.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: moderationKeys.all });
    },
    onError: (error) => {
      const message = getUserFriendlyMessage(error);
      Alert.alert('Link Failed', message);
    },
  });
}

