/**
 * Messages Hooks
 * React Query hooks for conversation and message operations
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Alert } from 'react-native';
import * as messagesService from '@/services/messagesService';
import { getUserFriendlyMessage } from '@/utils/errors';
import { useCurrentUser } from '@/hooks/useCurrentUser';

// ============================================================================
// QUERY KEYS
// ============================================================================

export const messageKeys = {
  all: ['messages'] as const,
  conversations: (userId: string) => [...messageKeys.all, 'conversations', userId] as const,
  messages: (conversationId: string) => [...messageKeys.all, 'list', conversationId] as const,
};

// ============================================================================
// QUERIES
// ============================================================================

/**
 * Get all conversations for current user
 * Returns list of conversations with other user info, last message, and unread count
 */
export function useConversations() {
  const { data: currentUser } = useCurrentUser();
  const userId = currentUser?.id;

  return useQuery({
    queryKey: messageKeys.conversations(userId || ''),
    queryFn: () => {
      return userId ? messagesService.getConversations(userId) : [];
    },
    enabled: !!userId,
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60 * 1000, // Refetch every minute for real-time feel
  });
}

/**
 * Get messages in a conversation
 * Returns messages sorted by created_at ascending (oldest first)
 */
export function useMessages(conversationId: string | undefined) {
  return useQuery({
    queryKey: messageKeys.messages(conversationId || ''),
    queryFn: () => {
      return conversationId ? messagesService.getMessages(conversationId) : [];
    },
    enabled: !!conversationId,
    staleTime: 10 * 1000, // 10 seconds
    refetchInterval: 30 * 1000, // Refetch every 30 seconds
  });
}

// ============================================================================
// MUTATIONS
// ============================================================================

/**
 * Send message mutation
 */
export function useSendMessage() {
  const queryClient = useQueryClient();
  const { data: currentUser } = useCurrentUser();
  const userId = currentUser?.id;

  return useMutation({
    mutationFn: async ({
      conversationId,
      text,
    }: {
      conversationId: string;
      text: string;
    }) => {
      if (!userId) {
        throw new Error('User not authenticated');
      }
      return messagesService.sendMessage(conversationId, text, userId);
    },
    onSuccess: (data, variables) => {
      // Invalidate messages and conversations
      queryClient.invalidateQueries({ queryKey: messageKeys.messages(variables.conversationId) });
      if (userId) {
        queryClient.invalidateQueries({ queryKey: messageKeys.conversations(userId) });
      }
    },
    onError: (error) => {
      const message = getUserFriendlyMessage(error);
      Alert.alert('Send Failed', message);
    },
  });
}

/**
 * Create conversation mutation
 * Checks for existing conversation first, creates if needed
 */
export function useCreateConversation() {
  const queryClient = useQueryClient();
  const { data: currentUser } = useCurrentUser();
  const userId = currentUser?.id;

  return useMutation({
    mutationFn: async (otherUserId: string) => {
      if (!userId) {
        throw new Error('User not authenticated');
      }
      // createConversation already checks for existing conversations
      return messagesService.createConversation(userId, otherUserId);
    },
    onSuccess: (conversationId) => {
      // Invalidate conversations to include new one
      if (userId) {
        queryClient.invalidateQueries({ queryKey: messageKeys.conversations(userId) });
      }
    },
    onError: (error) => {
      const message = getUserFriendlyMessage(error);
      Alert.alert('Create Failed', message);
    },
  });
}

/**
 * Mark conversation as read mutation
 */
export function useMarkAsRead() {
  const queryClient = useQueryClient();
  const { data: currentUser } = useCurrentUser();
  const userId = currentUser?.id;

  return useMutation({
    mutationFn: (conversationId: string) => {
      if (!userId) {
        throw new Error('User not authenticated');
      }
      return messagesService.markAsRead(conversationId, userId);
    },
    onSuccess: (_, conversationId) => {
      // Invalidate conversations to update unread count
      if (userId) {
        queryClient.invalidateQueries({ queryKey: messageKeys.conversations(userId) });
      }
      // Invalidate messages to update read status
      queryClient.invalidateQueries({ queryKey: messageKeys.messages(conversationId) });
    },
    onError: () => {
      // Silent error - read marking failures are not critical
    },
  });
}
