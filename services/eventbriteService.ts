/**
 * Eventbrite Service
 * Fetch language-related events from Eventbrite API
 */

import { EVENTBRITE_PUBLIC_TOKEN } from '@/lib/config';

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
 */
export async function searchEvents(params: {
  keywords?: string;
  location?: string;
  startDate?: string; // ISO 8601 format
  sortBy?: 'date' | 'best' | 'relevance';
  quantity?: number;
  onlineOnly?: boolean;
}): Promise<EventbriteEvent[]> {
  const {
    keywords = '',
    location,
    startDate,
    sortBy = 'date',
    quantity = 20,
    onlineOnly = false,
  } = params;

  try {
    // Build query parameters
    const queryParams = new URLSearchParams();
    
    if (keywords) {
      queryParams.append('q', keywords);
    }
    
    if (location) {
      queryParams.append('location.address', location);
    }
    
    if (startDate) {
      queryParams.append('start_date.range_start', startDate);
    } else {
      // Default to today
      const today = new Date().toISOString();
      queryParams.append('start_date.range_start', today);
    }
    
    queryParams.append('sort_by', sortBy);
    queryParams.append('expand', 'venue');
    
    if (onlineOnly) {
      queryParams.append('venue.online_event', 'true');
    }
    
    // Make API request
    const response = await fetch(
      `${EVENTBRITE_API_BASE}/events/search/?${queryParams.toString()}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${EVENTBRITE_PUBLIC_TOKEN}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Eventbrite API error:', errorText);
      throw new Error(`Eventbrite API error: ${response.status} ${response.statusText}`);
    }

    const data: EventbriteSearchResponse = await response.json();
    
    // Return limited quantity
    return data.events.slice(0, quantity);
  } catch (error) {
    console.error('Error fetching Eventbrite events:', error);
    throw error;
  }
}

/**
 * Search for language learning events
 * Filters events based on language keywords
 */
export async function searchLanguageEvents(params: {
  language: string;
  location?: string;
  onlineOnly?: boolean;
  limit?: number;
}): Promise<EventbriteEvent[]> {
  const { language, location, onlineOnly = false, limit = 10 } = params;

  // Build keywords for language learning events
  const keywords = `${language} language learning conversation practice meetup exchange`;

  try {
    const events = await searchEvents({
      keywords,
      location,
      onlineOnly,
      quantity: limit * 2, // Get more to filter better
      sortBy: 'date',
    });

    // Filter events to ensure they're language-related
    const filteredEvents = events.filter((event) => {
      const name = event.name.text.toLowerCase();
      const description = event.description.text.toLowerCase();
      const searchTerms = language.toLowerCase();
      
      // Check if event name or description contains language or learning keywords
      return (
        name.includes(searchTerms) ||
        description.includes(searchTerms) ||
        name.includes('language') ||
        name.includes('learning') ||
        name.includes('conversation') ||
        name.includes('exchange') ||
        name.includes('meetup')
      );
    });

    return filteredEvents.slice(0, limit);
  } catch (error) {
    console.error('Error fetching language events:', error);
    return [];
  }
}

/**
 * Get event details by ID
 */
export async function getEventById(eventId: string): Promise<EventbriteEvent | null> {
  try {
    const response = await fetch(
      `${EVENTBRITE_API_BASE}/events/${eventId}/?expand=venue`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${EVENTBRITE_PUBLIC_TOKEN}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch event: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching event details:', error);
    return null;
  }
}

