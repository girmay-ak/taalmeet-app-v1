/**
 * Messages Hooks for Web
 * React Query hooks for conversation and message operations
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import * as messagesService from '@/services/messagesService';
import { useAuth } from '../providers/AuthProvider';

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
  const { user } = useAuth();
  const userId = user?.id;

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
 */
export function useMessages(conversationId: string | undefined, limit: number = 50) {
  return useQuery({
    queryKey: messageKeys.messages(conversationId || ''),
    queryFn: () => {
      if (!conversationId) return [];
      return messagesService.getMessages(conversationId, limit);
    },
    enabled: !!conversationId,
    staleTime: 10 * 1000, // 10 seconds (messages update frequently)
    refetchInterval: 30 * 1000, // Refetch every 30 seconds
  });
}

// ============================================================================
// MUTATIONS
// ============================================================================

/**
 * Send a message
 */
export function useSendMessage() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      conversationId,
      receiverId,
      content,
    }: {
      conversationId?: string;
      receiverId: string;
      content: string;
    }) => {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      // If conversationId is provided, send to that conversation
      if (conversationId) {
        return messagesService.sendMessage(conversationId, content, user.id);
      }

      // Otherwise, find or create conversation
      return messagesService.sendMessageToUser(user.id, receiverId, content);
    },
    onSuccess: (data, variables) => {
      // Invalidate conversations list
      queryClient.invalidateQueries({ queryKey: messageKeys.all });

      // Invalidate messages for this conversation
      if (variables.conversationId) {
        queryClient.invalidateQueries({
          queryKey: messageKeys.messages(variables.conversationId),
        });
      }

      // Optimistically update the UI (React Query will refetch)
    },
    onError: (error: any) => {
      const errorMessage = error?.message || 'Failed to send message';
      toast.error(errorMessage);
    },
  });
}

/**
 * Mark messages as read
 */
export function useMarkAsRead() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (conversationId: string) => {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }
      return messagesService.markAsRead(conversationId, user.id);
    },
    onSuccess: (_, conversationId) => {
      queryClient.invalidateQueries({ queryKey: messageKeys.conversations(user?.id || '') });
      queryClient.invalidateQueries({ queryKey: messageKeys.messages(conversationId) });
    },
    onError: (error: any) => {
      console.error('Failed to mark as read:', error);
    },
  });
}

