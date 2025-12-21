/**
 * Event Hooks
 * React Query hooks for event management
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/providers';
import * as eventService from '@/services/eventService';
import type {
  EventFilters,
  CreateEventInput,
  UpdateEventInput,
  Event,
} from '@/types/events';

// ============================================================================
// QUERY KEYS
// ============================================================================

export const eventKeys = {
  all: ['events'] as const,
  lists: () => [...eventKeys.all, 'list'] as const,
  list: (filters: EventFilters) => [...eventKeys.lists(), filters] as const,
  details: () => [...eventKeys.all, 'detail'] as const,
  detail: (id: string) => [...eventKeys.details(), id] as const,
  favorites: (userId: string) => [...eventKeys.all, 'favorites', userId] as const,
  trending: () => [...eventKeys.all, 'trending'] as const,
  stats: (id: string) => [...eventKeys.all, 'stats', id] as const,
};

// ============================================================================
// QUERY HOOKS
// ============================================================================

/**
 * Search and filter events
 */
export function useEvents(filters: EventFilters = {}, enabled: boolean = true) {
  const { user } = useAuth();

  return useQuery({
    queryKey: eventKeys.list(filters),
    queryFn: () => eventService.searchEvents(filters, user?.id),
    enabled,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

/**
 * Get single event by ID
 */
export function useEvent(eventId: string | undefined, enabled: boolean = true) {
  const { user } = useAuth();

  return useQuery({
    queryKey: eventKeys.detail(eventId || ''),
    queryFn: () => {
      if (!eventId) return null;
      return eventService.getEventById(eventId, user?.id);
    },
    enabled: enabled && !!eventId,
    staleTime: 1000 * 60 * 1, // 1 minute
  });
}

/**
 * Get user's favorite events
 */
export function useFavoriteEvents() {
  const { user } = useAuth();

  return useQuery({
    queryKey: eventKeys.favorites(user?.id || ''),
    queryFn: () => {
      if (!user?.id) return [];
      return eventService.getFavoriteEvents(user.id);
    },
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Get trending events
 */
export function useTrendingEvents(limit: number = 10) {
  const { user } = useAuth();

  return useQuery({
    queryKey: eventKeys.trending(),
    queryFn: () => eventService.getTrendingEvents(limit, user?.id),
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}

/**
 * Get event statistics
 */
export function useEventStats(eventId: string | undefined) {
  return useQuery({
    queryKey: eventKeys.stats(eventId || ''),
    queryFn: () => {
      if (!eventId) return null;
      return eventService.getEventStats(eventId);
    },
    enabled: !!eventId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

// ============================================================================
// MUTATION HOOKS
// ============================================================================

/**
 * Create new event
 */
export function useCreateEvent() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: (input: CreateEventInput) => {
      if (!user?.id) throw new Error('User not authenticated');
      return eventService.createEvent(input, user.id);
    },
    onSuccess: () => {
      // Invalidate events lists
      queryClient.invalidateQueries({ queryKey: eventKeys.lists() });
    },
  });
}

/**
 * Update event
 */
export function useUpdateEvent() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: ({ eventId, updates }: { eventId: string; updates: UpdateEventInput }) => {
      if (!user?.id) throw new Error('User not authenticated');
      return eventService.updateEvent(eventId, updates, user.id);
    },
    onSuccess: (data) => {
      // Invalidate specific event and lists
      queryClient.invalidateQueries({ queryKey: eventKeys.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: eventKeys.lists() });
    },
  });
}

/**
 * Delete event
 */
export function useDeleteEvent() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: (eventId: string) => {
      if (!user?.id) throw new Error('User not authenticated');
      return eventService.deleteEvent(eventId, user.id);
    },
    onSuccess: () => {
      // Invalidate all event queries
      queryClient.invalidateQueries({ queryKey: eventKeys.all });
    },
  });
}

/**
 * RSVP to event
 */
export function useRSVPToEvent() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: ({ 
      eventId, 
      status 
    }: { 
      eventId: string; 
      status: 'joined' | 'declined';
    }) => {
      if (!user?.id) throw new Error('User not authenticated');
      return eventService.rsvpToEvent(eventId, user.id, status);
    },
    onSuccess: (_, variables) => {
      // Invalidate event detail and lists
      queryClient.invalidateQueries({ queryKey: eventKeys.detail(variables.eventId) });
      queryClient.invalidateQueries({ queryKey: eventKeys.lists() });
    },
  });
}

/**
 * Toggle event favorite
 */
export function useToggleFavorite() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: (eventId: string) => {
      if (!user?.id) throw new Error('User not authenticated');
      return eventService.toggleEventFavorite(eventId, user.id);
    },
    onSuccess: (_, eventId) => {
      // Invalidate event detail, lists, and favorites
      queryClient.invalidateQueries({ queryKey: eventKeys.detail(eventId) });
      queryClient.invalidateQueries({ queryKey: eventKeys.lists() });
      if (user?.id) {
        queryClient.invalidateQueries({ queryKey: eventKeys.favorites(user.id) });
      }
    },
  });
}

// ============================================================================
// HELPER HOOKS
// ============================================================================

/**
 * Check if user is event host
 */
export function useIsEventHost(event: Event | null | undefined): boolean {
  const { user } = useAuth();
  return !!(event && user && event.hostUserId === user.id);
}

/**
 * Check if user has RSVP'd to event
 */
export function useHasRSVPd(event: Event | null | undefined): boolean {
  return !!(event && event.currentUserParticipating);
}

/**
 * Check if event is favorited
 */
export function useIsEventFavorited(event: Event | null | undefined): boolean {
  return !!(event && event.isFavorited);
}

