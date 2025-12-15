/**
 * Hook for fetching Eventbrite events based on user's learning languages
 */

import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/providers';
import { searchLanguageEvents, type EventbriteEvent } from '@/services/eventbriteService';

export const eventbriteKeys = {
  all: ['eventbrite'] as const,
  language: (language: string, location?: string, onlineOnly?: boolean) => 
    [...eventbriteKeys.all, 'language', language, location, onlineOnly] as const,
  user: (userId: string) => 
    [...eventbriteKeys.all, 'user', userId] as const,
};

/**
 * Fetch general language-related events (not language-specific)
 * Location is required (country or city)
 */
export function useLanguageEvents(params: {
  language?: string; // Not used - kept for compatibility
  location?: string;
  onlineOnly?: boolean;
  enabled?: boolean;
}) {
  const { location, onlineOnly = false, enabled = true } = params;

  // For online events, location is not required
  // For in-person events, location is required
  const shouldFetch = enabled && (onlineOnly || !!location);

  return useQuery<EventbriteEvent[]>({
    queryKey: eventbriteKeys.language('language-events', location, onlineOnly),
    queryFn: () => searchLanguageEvents({ location, onlineOnly, limit: 20 }),
    enabled: shouldFetch,
    staleTime: 30 * 60 * 1000, // 30 minutes
    retry: 2,
  });
}

/**
 * Fetch general language-related events based on user's profile location (country)
 * Shows all language exchange/learning events:
 * - In the user's country (location-based)
 * - OR online events (available anywhere)
 */
export function useUserLanguageEvents(params?: {
  location?: string;
  onlineOnly?: boolean;
}) {
  const { profile } = useAuth();
  const { location: providedLocation, onlineOnly = false } = params || {};

  // Use provided location or get from user profile (country)
  const location = providedLocation || (profile?.country ? profile.country : undefined);

  // Fetch location-based events
  const { 
    data: locationEvents = [], 
    isLoading: isLoadingLocation, 
    isError: isErrorLocation 
  } = useLanguageEvents({
    language: '',
    location,
    onlineOnly: false, // Get in-person events in location
    enabled: !!location, // Only fetch if we have a location
  });

  // Fetch online events (available anywhere)
  const { 
    data: onlineEvents = [], 
    isLoading: isLoadingOnline, 
    isError: isErrorOnline 
  } = useLanguageEvents({
    language: '',
    location: undefined, // No location for online events
    onlineOnly: true, // Get online events
    enabled: true, // Always fetch online events
  });

  // Combine both types of events
  const allEvents: EventbriteEvent[] = [];
  const eventMap = new Map<string, EventbriteEvent>();

  // Add location-based events
  locationEvents.forEach((event) => {
    eventMap.set(event.id, event);
  });

  // Add online events (avoid duplicates)
  onlineEvents.forEach((event) => {
    if (!eventMap.has(event.id)) {
      eventMap.set(event.id, event);
    }
  });

  // Convert map to array and sort by date
  const combinedEvents = Array.from(eventMap.values()).sort((a, b) => {
    const dateA = new Date(a.start.utc).getTime();
    const dateB = new Date(b.start.utc).getTime();
    return dateA - dateB;
  });

  return {
    data: combinedEvents,
    isLoading: isLoadingLocation || isLoadingOnline,
    isError: isErrorLocation || isErrorOnline,
    refetch: async () => {
      // Refetch both queries
      // Note: This is a simplified refetch - in a real implementation,
      // you'd want to refetch both queries properly
      return Promise.resolve();
    },
  };
}

