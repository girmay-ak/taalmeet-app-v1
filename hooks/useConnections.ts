/**
 * Connections Hooks
 * React Query hooks for connection operations
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Alert } from 'react-native';
import * as connectionsService from '@/services/connectionsService';
import { getUserFriendlyMessage } from '@/utils/errors';
import { useAuth } from '@/providers';

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

/**
 * Get only accepted connections
 */
export function useConnectionsList(userId: string | undefined) {
  return useQuery({
    queryKey: connectionKeys.list(userId || ''),
    queryFn: () => (userId ? connectionsService.getConnections(userId) : []),
    enabled: !!userId,
    staleTime: 2 * 60 * 1000,
  });
}

/**
 * Get only connection requests
 */
export function useConnectionRequests(userId: string | undefined) {
  return useQuery({
    queryKey: connectionKeys.requests(userId || ''),
    queryFn: () => (userId ? connectionsService.getConnectionRequests(userId) : []),
    enabled: !!userId,
    staleTime: 1 * 60 * 1000,
  });
}

/**
 * Get only suggested connections
 */
export function useSuggestedConnections(userId: string | undefined) {
  return useQuery({
    queryKey: connectionKeys.suggested(userId || ''),
    queryFn: () => (userId ? connectionsService.getSuggestedConnections(userId, 20) : []),
    enabled: !!userId,
    staleTime: 10 * 60 * 1000,
  });
}

// ============================================================================
// MUTATIONS
// ============================================================================

/**
 * Send connection request mutation
 */
export function useSendConnectionRequest() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (targetUserId: string) => {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }
      return connectionsService.sendConnectionRequest(user.id, targetUserId);
    },
    onSuccess: (_, targetUserId) => {
      // Invalidate relevant queries
      if (user?.id) {
        queryClient.invalidateQueries({ queryKey: connectionKeys.suggested(user.id) });
        queryClient.invalidateQueries({ queryKey: connectionKeys.requests(user.id) });
        queryClient.invalidateQueries({ queryKey: connectionKeys.list(user.id) });
      }
    },
    onError: (error) => {
      const message = getUserFriendlyMessage(error);
      Alert.alert('Request Failed', message);
    },
  });
}

/**
 * Accept connection request mutation
 */
export function useAcceptRequest() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: (connectionId: string) => {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }
      return connectionsService.acceptRequest(connectionId, user.id);
    },
    onSuccess: () => {
      // Invalidate relevant queries
      if (user?.id) {
        queryClient.invalidateQueries({ queryKey: connectionKeys.requests(user.id) });
        queryClient.invalidateQueries({ queryKey: connectionKeys.list(user.id) });
      }
    },
    onError: (error) => {
      const message = getUserFriendlyMessage(error);
      Alert.alert('Accept Failed', message);
    },
  });
}

/**
 * Reject connection request mutation
 */
export function useRejectRequest() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: (connectionId: string) => connectionsService.rejectRequest(connectionId),
    onSuccess: () => {
      // Invalidate relevant queries
      if (user?.id) {
        queryClient.invalidateQueries({ queryKey: connectionKeys.requests(user.id) });
      }
    },
    onError: (error) => {
      const message = getUserFriendlyMessage(error);
      Alert.alert('Reject Failed', message);
    },
  });
}

/**
 * Remove connection mutation
 */
export function useRemoveConnection() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: (connectionId: string) => connectionsService.removeConnection(connectionId),
    onSuccess: () => {
      // Invalidate relevant queries
      if (user?.id) {
        queryClient.invalidateQueries({ queryKey: connectionKeys.list(user.id) });
      }
    },
    onError: (error) => {
      const message = getUserFriendlyMessage(error);
      Alert.alert('Remove Failed', message);
    },
  });
}

