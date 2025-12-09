/**
 * Connections Hooks for Web
 * React Query hooks for connection operations
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import * as connectionsService from '@/services/connectionsService';
import { useAuth } from '../providers/AuthProvider';

// ============================================================================
// QUERY KEYS
// ============================================================================

export const connectionKeys = {
  all: ['connections'] as const,
  list: (userId: string) => [...connectionKeys.all, 'list', userId] as const,
  requests: (userId: string) => [...connectionKeys.all, 'requests', userId] as const,
  suggested: (userId: string) => [...connectionKeys.all, 'suggested', userId] as const,
};

// ============================================================================
// QUERIES
// ============================================================================

/**
 * Get all connections data for a user
 * Returns: { connections, requests, suggested }
 */
export function useConnections(userId: string | undefined) {
  const connectionsQuery = useQuery({
    queryKey: connectionKeys.list(userId || ''),
    queryFn: () => (userId ? connectionsService.getConnections(userId) : []),
    enabled: !!userId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  const requestsQuery = useQuery({
    queryKey: connectionKeys.requests(userId || ''),
    queryFn: () => (userId ? connectionsService.getConnectionRequests(userId) : []),
    enabled: !!userId,
    staleTime: 1 * 60 * 1000, // 1 minute (requests change more frequently)
  });

  const suggestedQuery = useQuery({
    queryKey: connectionKeys.suggested(userId || ''),
    queryFn: () => (userId ? connectionsService.getSuggestedConnections(userId, 20) : []),
    enabled: !!userId,
    staleTime: 10 * 60 * 1000, // 10 minutes (suggestions don't change often)
  });

  return {
    connections: connectionsQuery.data || [],
    requests: requestsQuery.data || [],
    suggested: suggestedQuery.data || [],
    isLoading: connectionsQuery.isLoading || requestsQuery.isLoading || suggestedQuery.isLoading,
    isError: connectionsQuery.isError || requestsQuery.isError || suggestedQuery.isError,
    refetch: () => {
      connectionsQuery.refetch();
      requestsQuery.refetch();
      suggestedQuery.refetch();
    },
  };
}

// ============================================================================
// MUTATIONS
// ============================================================================

/**
 * Send connection request
 */
export function useSendConnectionRequest() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: (partnerId: string) => {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }
      return connectionsService.sendConnectionRequest(user.id, partnerId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: connectionKeys.all });
      toast.success('Connection request sent!');
    },
    onError: (error: any) => {
      const errorMessage = error?.message || 'Failed to send connection request';
      toast.error(errorMessage);
    },
  });
}

/**
 * Accept connection request
 */
export function useAcceptRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (connectionId: string) => connectionsService.acceptRequest(connectionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: connectionKeys.all });
      toast.success('Connection accepted!');
    },
    onError: (error: any) => {
      const errorMessage = error?.message || 'Failed to accept connection';
      toast.error(errorMessage);
    },
  });
}

/**
 * Reject connection request
 */
export function useRejectRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (connectionId: string) => connectionsService.rejectRequest(connectionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: connectionKeys.all });
      toast.success('Connection request declined');
    },
    onError: (error: any) => {
      const errorMessage = error?.message || 'Failed to reject connection';
      toast.error(errorMessage);
    },
  });
}

/**
 * Remove connection
 */
export function useRemoveConnection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (connectionId: string) => connectionsService.removeConnection(connectionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: connectionKeys.all });
      toast.success('Connection removed');
    },
    onError: (error: any) => {
      const errorMessage = error?.message || 'Failed to remove connection';
      toast.error(errorMessage);
    },
  });
}

