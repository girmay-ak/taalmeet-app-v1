/**
 * Session Hooks
 * React Query hooks for language session operations
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Alert } from 'react-native';
import * as sessionService from '@/services/sessionService';
import { getUserFriendlyMessage } from '@/utils/errors';
import type { SessionFilters } from '@/services/sessionService';
import type { LanguageSessionInsert, LanguageSessionUpdate } from '@/types/database';

// ============================================================================
// QUERY KEYS
// ============================================================================

export const sessionKeys = {
  all: ['sessions'] as const,
  lists: () => [...sessionKeys.all, 'list'] as const,
  list: (filters: SessionFilters) => [...sessionKeys.lists(), filters] as const,
  details: () => [...sessionKeys.all, 'detail'] as const,
  detail: (id: string) => [...sessionKeys.details(), id] as const,
};

// ============================================================================
// QUERIES
// ============================================================================

/**
 * Get sessions with filters
 */
export function useSessions(filters: SessionFilters = {}, enabled = true) {
  return useQuery({
    queryKey: sessionKeys.list(filters),
    queryFn: () => sessionService.getSessions(filters),
    enabled,
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60 * 1000, // Refetch every minute for real-time updates
  });
}

/**
 * Get session by ID
 */
export function useSessionDetail(sessionId: string | undefined, userId?: string) {
  return useQuery({
    queryKey: sessionKeys.detail(sessionId || ''),
    queryFn: () => (sessionId ? sessionService.getSessionById(sessionId, userId) : null),
    enabled: !!sessionId,
    staleTime: 30 * 1000,
  });
}

// ============================================================================
// MUTATIONS
// ============================================================================

/**
 * Join a session
 */
export function useJoinSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ sessionId, userId }: { sessionId: string; userId: string }) => {
      return sessionService.joinSession(sessionId, userId);
    },
    onSuccess: (_, variables) => {
      // Invalidate session queries
      queryClient.invalidateQueries({ queryKey: sessionKeys.detail(variables.sessionId) });
      queryClient.invalidateQueries({ queryKey: sessionKeys.lists() });
    },
    onError: (error) => {
      const message = getUserFriendlyMessage(error);
      Alert.alert('Join Failed', message);
    },
  });
}

/**
 * Leave a session
 */
export function useLeaveSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ sessionId, userId }: { sessionId: string; userId: string }) => {
      return sessionService.leaveSession(sessionId, userId);
    },
    onSuccess: (_, variables) => {
      // Invalidate session queries
      queryClient.invalidateQueries({ queryKey: sessionKeys.detail(variables.sessionId) });
      queryClient.invalidateQueries({ queryKey: sessionKeys.lists() });
    },
    onError: (error) => {
      const message = getUserFriendlyMessage(error);
      Alert.alert('Leave Failed', message);
    },
  });
}

/**
 * Create a new session
 */
export function useCreateSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: LanguageSessionInsert) => {
      return sessionService.createSession(input);
    },
    onSuccess: () => {
      // Invalidate all session lists
      queryClient.invalidateQueries({ queryKey: sessionKeys.lists() });
    },
    onError: (error) => {
      const message = getUserFriendlyMessage(error);
      Alert.alert('Create Failed', message);
    },
  });
}

/**
 * Update a session
 */
export function useUpdateSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      sessionId,
      hostUserId,
      updates,
    }: {
      sessionId: string;
      hostUserId: string;
      updates: LanguageSessionUpdate;
    }) => {
      return sessionService.updateSession(sessionId, hostUserId, updates);
    },
    onSuccess: (_, variables) => {
      // Invalidate session detail and lists
      queryClient.invalidateQueries({ queryKey: sessionKeys.detail(variables.sessionId) });
      queryClient.invalidateQueries({ queryKey: sessionKeys.lists() });
    },
    onError: (error) => {
      const message = getUserFriendlyMessage(error);
      Alert.alert('Update Failed', message);
    },
  });
}

/**
 * Delete a session
 */
export function useDeleteSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ sessionId, hostUserId }: { sessionId: string; hostUserId: string }) => {
      return sessionService.deleteSession(sessionId, hostUserId);
    },
    onSuccess: () => {
      // Invalidate all session queries
      queryClient.invalidateQueries({ queryKey: sessionKeys.all });
    },
    onError: (error) => {
      const message = getUserFriendlyMessage(error);
      Alert.alert('Delete Failed', message);
    },
  });
}

