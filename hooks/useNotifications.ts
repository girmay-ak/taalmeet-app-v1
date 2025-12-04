/**
 * Push Notifications Hooks
 * React Query hooks for push notification management
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';
import { Alert, Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as notificationService from '@/services/notificationsService';
import { getUserFriendlyMessage } from '@/utils/errors';
import { useAuth } from '@/providers';

// ============================================================================
// QUERY KEYS
// ============================================================================

export const notificationKeys = {
  all: ['notifications'] as const,
  preferences: (userId: string) => [...notificationKeys.all, 'preferences', userId] as const,
  deviceTokens: (userId: string) => [...notificationKeys.all, 'deviceTokens', userId] as const,
};

// ============================================================================
// QUERIES
// ============================================================================

/**
 * Get notification preferences
 */
export function useNotificationPreferences(userId: string | undefined) {
  return useQuery({
    queryKey: notificationKeys.preferences(userId || ''),
    queryFn: () => (userId ? notificationService.getNotificationPreferences(userId) : null),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Get user device tokens
 */
export function useDeviceTokens(userId: string | undefined) {
  return useQuery({
    queryKey: notificationKeys.deviceTokens(userId || ''),
    queryFn: () => (userId ? notificationService.getUserDeviceTokens(userId) : []),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
  });
}

// ============================================================================
// MUTATIONS
// ============================================================================

/**
 * Register device token mutation
 */
export function useRegisterDeviceToken() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ token, deviceId }: { token: string; deviceId?: string }) => {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }
      return notificationService.registerDeviceToken(user.id, token, deviceId);
    },
    onSuccess: () => {
      if (user?.id) {
        queryClient.invalidateQueries({ queryKey: notificationKeys.deviceTokens(user.id) });
      }
    },
    onError: (error) => {
      console.error('Failed to register device token:', error);
      // Don't show alert - this is a background operation
    },
  });
}

/**
 * Unregister device token mutation
 */
export function useUnregisterDeviceToken() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (token: string) => {
      return notificationService.unregisterDeviceToken(token);
    },
    onSuccess: () => {
      if (user?.id) {
        queryClient.invalidateQueries({ queryKey: notificationKeys.deviceTokens(user.id) });
      }
    },
    onError: (error) => {
      console.error('Failed to unregister device token:', error);
    },
  });
}

/**
 * Update notification preferences mutation
 */
export function useUpdateNotificationPreferences() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (preferences: {
      push_enabled?: boolean;
      new_message_enabled?: boolean;
      connection_request_enabled?: boolean;
      connection_accepted_enabled?: boolean;
      match_found_enabled?: boolean;
      session_reminder_enabled?: boolean;
      session_starting_soon_enabled?: boolean;
      achievement_unlocked_enabled?: boolean;
      weekly_summary_enabled?: boolean;
      marketing_enabled?: boolean;
      quiet_hours_start?: string | null;
      quiet_hours_end?: string | null;
      timezone?: string;
    }) => {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }
      return notificationService.updateNotificationPreferences(user.id, preferences);
    },
    onSuccess: () => {
      if (user?.id) {
        queryClient.invalidateQueries({ queryKey: notificationKeys.preferences(user.id) });
      }
    },
    onError: (error) => {
      const message = getUserFriendlyMessage(error);
      Alert.alert('Update Failed', message);
    },
  });
}

// ============================================================================
// NOTIFICATION SETUP HOOK
// ============================================================================

/**
 * Hook to set up push notifications on app launch
 * Registers device token and sets up notification handlers
 */
export function usePushNotificationsSetup() {
  const { user } = useAuth();
  const registerTokenMutation = useRegisterDeviceToken();
  const notificationListener = useRef<Notifications.Subscription>();
  const responseListener = useRef<Notifications.Subscription>();

  useEffect(() => {
    // Configure notification handler
    notificationService.configureNotificationHandler();

    // Request permissions and register token
    const setupNotifications = async () => {
      if (!user?.id) return;

      try {
        // Request permissions
        const hasPermission = await notificationService.requestNotificationPermissions();
        if (!hasPermission) {
          console.log('Notification permissions not granted');
          return;
        }

        // Get Expo push token
        const token = await notificationService.getExpoPushToken();
        if (!token) {
          console.log('Failed to get Expo push token');
          return;
        }

        // Register token with backend
        await registerTokenMutation.mutateAsync({
          token,
          deviceId: Platform.OS === 'ios' || Platform.OS === 'android' ? token : undefined,
        });
      } catch (error) {
        console.error('Error setting up push notifications:', error);
      }
    };

    setupNotifications();

    // Set up notification listeners
    notificationListener.current = Notifications.addNotificationReceivedListener((notification) => {
      // Handle notification received while app is in foreground
      console.log('Notification received:', notification);
    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener((response) => {
      // Handle notification tapped
      const data = response.notification.request.content.data;
      console.log('Notification tapped:', data);

      // Handle navigation based on notification type
      // This would be handled by your navigation system
    });

    return () => {
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(notificationListener.current);
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, [user?.id, registerTokenMutation]);
}

