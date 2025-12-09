/**
 * Notifications Hooks for Web
 * React Query hooks for notification operations
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import * as notificationsService from '@/services/notificationsService';
import { useAuth } from '../providers/AuthProvider';

// ============================================================================
// TYPES
// ============================================================================

export interface InAppNotification {
  id: string;
  type: 'match' | 'message' | 'connection' | 'connection_accepted' | 'achievement' | 'session' | 'reminder';
  title: string;
  message: string;
  time: string;
  timestamp: string;
  read: boolean;
  avatar?: string;
  icon?: 'heart' | 'message' | 'user' | 'calendar' | 'star' | 'sparkles';
  relatedId?: string; // ID of related entity (connection_id, message_id, etc.)
}

// ============================================================================
// QUERY KEYS
// ============================================================================

export const notificationKeys = {
  all: ['notifications'] as const,
  list: (userId: string) => [...notificationKeys.all, 'list', userId] as const,
};

// ============================================================================
// QUERIES
// ============================================================================

/**
 * Get all notifications for current user
 * Aggregates notifications from multiple sources:
 * - Connection requests
 * - Connection accepted
 * - Unread messages
 * - Matches
 * - Achievements (if available)
 */
export function useNotifications() {
  const { user } = useAuth();
  const userId = user?.id;

  return useQuery({
    queryKey: notificationKeys.list(userId || ''),
    queryFn: async () => {
      if (!userId) return [];
      return notificationsService.getNotifications(userId);
    },
    enabled: !!userId,
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60 * 1000, // Refetch every minute for real-time feel
  });
}

// ============================================================================
// MUTATIONS
// ============================================================================

/**
 * Mark notification as read
 */
export function useMarkNotificationAsRead() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (notificationId: string) => {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }
      return notificationsService.markNotificationAsRead(notificationId, user.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    },
    onError: (error: any) => {
      console.error('Failed to mark notification as read:', error);
    },
  });
}

/**
 * Mark all notifications as read
 */
export function useMarkAllNotificationsAsRead() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async () => {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }
      return notificationsService.markAllNotificationsAsRead(user.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    },
    onError: (error: any) => {
      const errorMessage = error?.message || 'Failed to mark all notifications as read';
      toast.error(errorMessage);
    },
  });
}

/**
 * Delete notification
 */
export function useDeleteNotification() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (notificationId: string) => {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }
      return notificationsService.deleteNotification(notificationId, user.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    },
    onError: (error: any) => {
      console.error('Failed to delete notification:', error);
    },
  });
}

