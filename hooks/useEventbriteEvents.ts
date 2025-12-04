/**
 * Hook for fetching Eventbrite events based on user's learning languages
 */

import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/providers';
import { searchLanguageEvents, type EventbriteEvent } from '@/services/eventbriteService';

export const eventbriteKeys = {
  all: ['eventbrite'] as const,
  language: (language: string, location?: string) => 
    [...eventbriteKeys.all, 'language', language, location] as const,
  user: (userId: string) => 
    [...eventbriteKeys.all, 'user', userId] as const,
};

/**
 * Fetch events for a specific language
 */
export function useLanguageEvents(params: {
  language: string;
  location?: string;
  onlineOnly?: boolean;
  enabled?: boolean;
}) {
  const { language, location, onlineOnly = false, enabled = true } = params;

  return useQuery<EventbriteEvent[]>({
    queryKey: eventbriteKeys.language(language, location),
    queryFn: () => searchLanguageEvents({ language, location, onlineOnly, limit: 10 }),
    enabled: enabled && !!language,
    staleTime: 30 * 60 * 1000, // 30 minutes
    retry: 2,
  });
}

/**
 * Fetch events for all user's learning languages
 */
export function useUserLanguageEvents(params?: {
  location?: string;
  onlineOnly?: boolean;
}) {
  const { profile } = useAuth();
  const { location, onlineOnly = false } = params || {};

  // Get user's learning languages
  const learningLanguages = profile?.languages?.learning || [];

  // Fetch events for each language
  const eventQueries = learningLanguages.map((lang) =>
    useLanguageEvents({
      language: lang.language,
      location,
      onlineOnly,
      enabled: learningLanguages.length > 0,
    })
  );

  // Combine all events
  const allEvents: EventbriteEvent[] = [];
  const isLoading = eventQueries.some((query) => query.isLoading);
  const isError = eventQueries.some((query) => query.isError);

  eventQueries.forEach((query) => {
    if (query.data) {
      allEvents.push(...query.data);
    }
  });

  // Sort by date and remove duplicates
  const uniqueEvents = Array.from(
    new Map(allEvents.map((event) => [event.id, event])).values()
  ).sort((a, b) => {
    const dateA = new Date(a.start.utc).getTime();
    const dateB = new Date(b.start.utc).getTime();
    return dateA - dateB;
  });

  return {
    data: uniqueEvents,
    isLoading,
    isError,
    refetch: () => Promise.all(eventQueries.map((query) => query.refetch())),
  };
}

