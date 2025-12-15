/**
 * Eventbrite Service
 * Fetch language-related events from Eventbrite API
 */

import { EVENTBRITE_PUBLIC_TOKEN, EVENTBRITE_API_KEY } from '@/lib/config';

// ============================================================================
// TYPES
// ============================================================================

export interface EventbriteEvent {
  id: string;
  name: {
    text: string;
    html: string;
  };
  description: {
    text: string;
    html: string;
  };
  start: {
    timezone: string;
    local: string;
    utc: string;
  };
  end: {
    timezone: string;
    local: string;
    utc: string;
  };
  url: string;
  venue_id?: string;
  online_event?: boolean;
  is_free?: boolean;
  status: string;
  logo?: {
    url: string;
  };
  venue?: {
    name: string;
    address?: {
      localized_area_display: string;
      city?: string;
      country?: string;
    };
  };
}

export interface EventbriteSearchResponse {
  events: EventbriteEvent[];
  pagination: {
    object_count: number;
    page_number: number;
    page_size: number;
    page_count: number;
    has_more_items: boolean;
  };
}

// ============================================================================
// EVENTBRITE API
// ============================================================================

const EVENTBRITE_API_BASE = 'https://www.eventbriteapi.com/v3';

/**
 * Search for events on Eventbrite
 * 
 * NOTE: Eventbrite deprecated the public event search endpoint in February 2020.
 * The /events/search/ endpoint is no longer available for public searches.
 * 
 * Available alternatives:
 * - Use organization-specific events: GET /v3/organizations/:organization_id/events/
 * - Use venue-specific events: GET /v3/venues/:venue_id/events/
 * - Get specific event by ID: GET /v3/events/:event_id/
 * 
 * For now, this function returns an empty array to prevent app crashes.
 * To enable Eventbrite integration, you would need:
 * 1. Organization IDs or Venue IDs to query
 * 2. Or use Eventbrite's Discovery API (if available with your account)
 */
export async function searchEvents(params: {
  keywords?: string;
  location?: string;
  startDate?: string; // ISO 8601 format
  sortBy?: 'date' | 'best' | 'relevance';
  quantity?: number;
  onlineOnly?: boolean;
}): Promise<EventbriteEvent[]> {
  // Eventbrite public search is deprecated - return empty array
  console.warn('Eventbrite public event search is deprecated. Events cannot be searched without organization/venue IDs.');
  return [];
  
  /* 
  // Legacy code - kept for reference if you have organization/venue IDs
  const {
    keywords = '',
    location,
    startDate,
    sortBy = 'date',
    quantity = 20,
    onlineOnly = false,
  } = params;

  try {
    // If you have organization IDs, you can use:
    // GET /v3/organizations/:organization_id/events/
    // Example:
    // const orgId = 'YOUR_ORG_ID';
    // const url = `${EVENTBRITE_API_BASE}/organizations/${orgId}/events/?token=${EVENTBRITE_PUBLIC_TOKEN}`;
    
    // For now, return empty array since public search is not available
    return [];
  } catch (error) {
    console.error('Error fetching Eventbrite events:', error);
    return [];
  }
  */
}

/**
 * Search for general language-related events (language exchange, learning, conversation)
 * Based on location (country/city) from user profile
 * 
 * NOTE: Eventbrite public search is deprecated, but we keep this function structure
 * for potential future use with organization/venue IDs or Discovery API.
 */
export async function searchLanguageEvents(params: {
  location?: string;
  onlineOnly?: boolean;
  limit?: number;
}): Promise<EventbriteEvent[]> {
  const { location, onlineOnly = false, limit = 20 } = params;
  
  // Eventbrite public search is deprecated
  // For now, return empty array - app will continue to work without events
  // When Eventbrite API access is available, this will fetch real events
  
  // Validation:
  // - If onlineOnly is true, location is not required (online events are global)
  // - If onlineOnly is false, location is required (in-person events need location)
  if (!onlineOnly && !location) {
    // Silently return empty array if no location for in-person events
    return [];
  }
  
  // Try Supabase Edge Function first (recommended - secure, server-side)
  try {
    const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
    if (supabaseUrl) {
      const edgeFunctionUrl = `${supabaseUrl}/functions/v1/fetch-events`;
      
      const response = await fetch(edgeFunctionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          location: location,
          onlineOnly: onlineOnly,
          limit: limit,
          query: 'language exchange',
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.events && data.events.length > 0) {
          return data.events as EventbriteEvent[];
        }
      }
    }
  } catch (error) {
    console.log('Edge function not available, trying direct API...');
  }

  // Fallback: Try Eventbrite API directly (client-side, less secure)
  try {
    // Try Eventbrite search endpoint (may work with some API keys)
    const queryParams = new URLSearchParams();
    queryParams.append('q', 'language exchange');
    if (location) {
      queryParams.append('location.address', location);
    }
    if (onlineOnly) {
      queryParams.append('venue.online_event', 'true');
    }
    queryParams.append('sort_by', 'date');
    queryParams.append('expand', 'venue');
    queryParams.append('page_size', Math.min(limit, 50).toString());
    queryParams.append('token', EVENTBRITE_PUBLIC_TOKEN);
    
    const eventbriteUrl = `${EVENTBRITE_API_BASE}/events/search/?${queryParams.toString()}`;
    const eventbriteResponse = await fetch(eventbriteUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (eventbriteResponse.ok) {
      const eventbriteData: EventbriteSearchResponse = await eventbriteResponse.json();
      if (eventbriteData.events && eventbriteData.events.length > 0) {
        // Filter to ensure events are language-related
        const filteredEvents = eventbriteData.events.filter((event) => {
          const name = event.name.text.toLowerCase();
          const description = event.description.text.toLowerCase();
          return (
            name.includes('language') ||
            name.includes('learning') ||
            name.includes('conversation') ||
            name.includes('exchange') ||
            description.includes('language') ||
            description.includes('learning') ||
            description.includes('conversation') ||
            description.includes('exchange')
          );
        });
        return filteredEvents.slice(0, limit);
      }
    }
  } catch (error) {
    console.log('Direct Eventbrite API not available');
  }
  
  // Final fallback: Return empty array
  return [];
  
  /* 
  // Future implementation when Eventbrite API access is available:
  // Search for general language-related events
  const keywords = 'language exchange learning conversation practice meetup';
  
  try {
    const events = await searchEvents({
      keywords,
      location,
      onlineOnly,
      quantity: limit * 2,
      sortBy: 'date',
    });

    // Filter to ensure events are language-related
    const filteredEvents = events.filter((event) => {
      const name = event.name.text.toLowerCase();
      const description = event.description.text.toLowerCase();
      
      return (
        name.includes('language') ||
        name.includes('learning') ||
        name.includes('conversation') ||
        name.includes('exchange') ||
        name.includes('meetup') ||
        description.includes('language') ||
        description.includes('learning') ||
        description.includes('conversation') ||
        description.includes('exchange')
      );
    });

    return filteredEvents.slice(0, limit);
  } catch (error) {
    console.error('Error fetching language events:', error);
    return [];
  }
  */
}

/**
 * Get event details by ID
 */
export async function getEventById(eventId: string): Promise<EventbriteEvent | null> {
  try {
    const url = `${EVENTBRITE_API_BASE}/events/${eventId}/?expand=venue&token=${EVENTBRITE_PUBLIC_TOKEN}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Eventbrite API error fetching event:', errorText);
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching event details:', error);
    return null;
  }
}

