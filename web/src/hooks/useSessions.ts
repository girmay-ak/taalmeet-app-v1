/**
 * Session Hooks for Web
 * React Query hooks for language session operations
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import * as sessionService from '@/services/sessionService';
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
      queryClient.invalidateQueries({ queryKey: sessionKeys.detail(variables.sessionId) });
      queryClient.invalidateQueries({ queryKey: sessionKeys.lists() });
      toast.success('Joined session successfully!');
    },
    onError: (error: any) => {
      const errorMessage = error?.message || 'Failed to join session';
      toast.error(errorMessage);
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
      queryClient.invalidateQueries({ queryKey: sessionKeys.detail(variables.sessionId) });
      queryClient.invalidateQueries({ queryKey: sessionKeys.lists() });
      toast.success('Left session');
    },
    onError: (error: any) => {
      const errorMessage = error?.message || 'Failed to leave session';
      toast.error(errorMessage);
    },
  });
}

