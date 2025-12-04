/**
 * Help & Support Hooks
 * React Query hooks for help articles, FAQs, and support tickets
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Alert } from 'react-native';
import * as helpService from '@/services/helpService';
import { getUserFriendlyMessage } from '@/utils/errors';
import { useAuth } from '@/providers';

// ============================================================================
// QUERY KEYS
// ============================================================================

export const helpKeys = {
  all: ['help'] as const,
  articles: (category?: string) => [...helpKeys.all, 'articles', category] as const,
  article: (slug: string) => [...helpKeys.all, 'article', slug] as const,
  faqs: (category?: string) => [...helpKeys.all, 'faqs', category] as const,
  faq: (id: string) => [...helpKeys.all, 'faq', id] as const,
  tickets: (userId: string) => [...helpKeys.all, 'tickets', userId] as const,
  ticket: (ticketId: string, userId: string) => [...helpKeys.all, 'ticket', ticketId, userId] as const,
  ticketMessages: (ticketId: string) => [...helpKeys.all, 'ticketMessages', ticketId] as const,
};

// ============================================================================
// QUERIES
// ============================================================================

/**
 * Get help articles
 */
export function useHelpArticles(category?: string) {
  return useQuery({
    queryKey: helpKeys.articles(category),
    queryFn: () => helpService.getHelpArticles(category),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Get help article by slug
 */
export function useHelpArticle(slug: string) {
  return useQuery({
    queryKey: helpKeys.article(slug),
    queryFn: () => helpService.getHelpArticleBySlug(slug),
    enabled: !!slug,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Search help articles
 */
export function useSearchHelpArticles(query: string) {
  return useQuery({
    queryKey: [...helpKeys.all, 'search', query],
    queryFn: () => helpService.searchHelpArticles(query),
    enabled: query.length > 2, // Only search if query is longer than 2 characters
    staleTime: 2 * 60 * 1000,
  });
}

/**
 * Get FAQs
 */
export function useFAQs(category?: string) {
  return useQuery({
    queryKey: helpKeys.faqs(category),
    queryFn: () => helpService.getFAQs(category),
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Get FAQ by ID
 */
export function useFAQ(id: string) {
  return useQuery({
    queryKey: helpKeys.faq(id),
    queryFn: () => helpService.getFAQById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Search FAQs
 */
export function useSearchFAQs(query: string) {
  return useQuery({
    queryKey: [...helpKeys.all, 'searchFAQs', query],
    queryFn: () => helpService.searchFAQs(query),
    enabled: query.length > 2,
    staleTime: 2 * 60 * 1000,
  });
}

/**
 * Get user's support tickets
 */
export function useSupportTickets(userId: string | undefined) {
  return useQuery({
    queryKey: helpKeys.tickets(userId || ''),
    queryFn: () => (userId ? helpService.getUserSupportTickets(userId) : []),
    enabled: !!userId,
    staleTime: 1 * 60 * 1000, // 1 minute - tickets can change frequently
  });
}

/**
 * Get support ticket by ID
 */
export function useSupportTicket(ticketId: string, userId: string | undefined) {
  return useQuery({
    queryKey: helpKeys.ticket(ticketId, userId || ''),
    queryFn: () => (userId ? helpService.getSupportTicketById(ticketId, userId) : null),
    enabled: !!ticketId && !!userId,
    staleTime: 30 * 1000, // 30 seconds
  });
}

/**
 * Get support ticket messages
 */
export function useSupportTicketMessages(ticketId: string) {
  return useQuery({
    queryKey: helpKeys.ticketMessages(ticketId),
    queryFn: () => helpService.getSupportTicketMessages(ticketId),
    enabled: !!ticketId,
    staleTime: 30 * 1000,
  });
}

// ============================================================================
// MUTATIONS
// ============================================================================

/**
 * Create support ticket mutation
 */
export function useCreateSupportTicket() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      subject,
      category,
      message,
      priority = 'medium' as const,
    }: {
      subject: string;
      category: 'account' | 'technical' | 'billing' | 'safety' | 'feature_request' | 'bug_report' | 'other';
      message: string;
      priority?: 'low' | 'medium' | 'high' | 'urgent';
    }) => {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }
      return helpService.createSupportTicket(user.id, subject, category, message, priority);
    },
    onSuccess: () => {
      if (user?.id) {
        queryClient.invalidateQueries({ queryKey: helpKeys.tickets(user.id) });
      }
      Alert.alert('Success', 'Support ticket created successfully. We will get back to you soon!');
    },
    onError: (error) => {
      const message = getUserFriendlyMessage(error);
      Alert.alert('Error', message);
    },
  });
}

/**
 * Update support ticket status mutation
 */
export function useUpdateSupportTicketStatus() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      ticketId,
      status,
    }: {
      ticketId: string;
      status: 'open' | 'in_progress' | 'waiting_user' | 'resolved' | 'closed';
    }) => {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }
      return helpService.updateSupportTicketStatus(ticketId, user.id, status);
    },
    onSuccess: (_, variables) => {
      if (user?.id) {
        queryClient.invalidateQueries({ queryKey: helpKeys.tickets(user.id) });
        queryClient.invalidateQueries({ queryKey: helpKeys.ticket(variables.ticketId, user.id) });
      }
    },
    onError: (error) => {
      const message = getUserFriendlyMessage(error);
      Alert.alert('Error', message);
    },
  });
}

/**
 * Add message to support ticket mutation
 */
export function useAddSupportTicketMessage() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      ticketId,
      message,
    }: {
      ticketId: string;
      message: string;
    }) => {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }
      return helpService.addSupportTicketMessage({
        ticket_id: ticketId,
        sender_id: user.id,
        message,
        is_internal: false,
      });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: helpKeys.ticketMessages(variables.ticketId) });
      if (user?.id) {
        queryClient.invalidateQueries({ queryKey: helpKeys.ticket(variables.ticketId, user.id) });
        queryClient.invalidateQueries({ queryKey: helpKeys.tickets(user.id) });
      }
    },
    onError: (error) => {
      const message = getUserFriendlyMessage(error);
      Alert.alert('Error', message);
    },
  });
}

/**
 * Rate FAQ mutation
 */
export function useRateFAQ() {
  return useMutation({
    mutationFn: async ({ faqId, isHelpful }: { faqId: string; isHelpful: boolean }) => {
      return helpService.rateFAQ(faqId, isHelpful);
    },
    onError: (error) => {
      // Silent fail - rating is not critical
      console.warn('Failed to rate FAQ:', error);
    },
  });
}

