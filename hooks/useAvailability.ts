/**
 * Availability Hooks
 * React Query hooks for availability and schedule operations
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Alert } from 'react-native';
import * as availabilityService from '@/services/availabilityService';
import { getUserFriendlyMessage } from '@/utils/errors';
import { locationKeys } from './useLocation';
import type {
  UpdateAvailabilityStatusInput,
  UpdatePreferencesInput,
  AddScheduleSlotInput,
} from '@/services/availabilityService';

// ============================================================================
// QUERY KEYS
// ============================================================================

export const availabilityKeys = {
  all: ['availability'] as const,
  user: (userId: string) => [...availabilityKeys.all, 'user', userId] as const,
  schedule: (userId: string) => [...availabilityKeys.all, 'schedule', userId] as const,
};

// ============================================================================
// QUERIES
// ============================================================================

/**
 * Get complete availability data for current user
 * Returns: { status, until, preferences, weeklySchedule }
 */
export function useAvailability(userId: string | undefined) {
  return useQuery({
    queryKey: availabilityKeys.user(userId || ''),
    queryFn: () => (userId ? availabilityService.getAvailability(userId) : null),
    enabled: !!userId,
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60 * 1000, // Refetch every minute to update until
  });
}

/**
 * Get weekly schedule for a user
 */
export function useWeeklySchedule(userId: string | undefined) {
  return useQuery({
    queryKey: availabilityKeys.schedule(userId || ''),
    queryFn: () => (userId ? availabilityService.getWeeklySchedule(userId) : []),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// ============================================================================
// MUTATIONS
// ============================================================================

/**
 * Update availability status mutation
 */
export function useUpdateAvailabilityStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userId,
      data,
    }: {
      userId: string;
      data: UpdateAvailabilityStatusInput;
    }) => {
      return availabilityService.updateAvailabilityStatus(userId, data);
    },
    onSuccess: (_, variables) => {
      // Invalidate availability query
      queryClient.invalidateQueries({ queryKey: availabilityKeys.user(variables.userId) });
      // Invalidate nearby users queries so map updates with new availability status
      queryClient.invalidateQueries({ queryKey: ['nearbyUsers'] });
      queryClient.invalidateQueries({ queryKey: locationKeys.all });
    },
    onError: (error) => {
      const message = getUserFriendlyMessage(error);
      Alert.alert('Update Failed', message);
    },
  });
}

/**
 * Update preferences mutation
 */
export function useUpdatePreferences() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userId,
      data,
    }: {
      userId: string;
      data: UpdatePreferencesInput;
    }) => {
      return availabilityService.updatePreferences(userId, data);
    },
    onSuccess: (_, variables) => {
      // Invalidate availability query
      queryClient.invalidateQueries({ queryKey: availabilityKeys.user(variables.userId) });
      // Invalidate nearby users queries so map updates with new preferences
      queryClient.invalidateQueries({ queryKey: ['nearbyUsers'] });
      queryClient.invalidateQueries({ queryKey: locationKeys.all });
    },
    onError: (error) => {
      const message = getUserFriendlyMessage(error);
      Alert.alert('Update Failed', message);
    },
  });
}

/**
 * Add schedule slot mutation
 */
export function useAddScheduleSlot() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userId,
      data,
    }: {
      userId: string;
      data: AddScheduleSlotInput;
    }) => {
      return availabilityService.addScheduleSlot(userId, data);
    },
    onSuccess: (_, variables) => {
      // Invalidate schedule and availability queries
      queryClient.invalidateQueries({ queryKey: availabilityKeys.schedule(variables.userId) });
      queryClient.invalidateQueries({ queryKey: availabilityKeys.user(variables.userId) });
    },
    onError: (error) => {
      const message = getUserFriendlyMessage(error);
      Alert.alert('Add Failed', message);
    },
  });
}

/**
 * Remove schedule slot mutation
 */
export function useRemoveScheduleSlot() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ slotId, userId }: { slotId: string; userId: string }) => {
      return availabilityService.removeScheduleSlot(slotId);
    },
    onSuccess: (_, variables) => {
      // Invalidate schedule and availability queries
      queryClient.invalidateQueries({ queryKey: availabilityKeys.schedule(variables.userId) });
      queryClient.invalidateQueries({ queryKey: availabilityKeys.user(variables.userId) });
    },
    onError: (error) => {
      const message = getUserFriendlyMessage(error);
      Alert.alert('Remove Failed', message);
    },
  });
}
