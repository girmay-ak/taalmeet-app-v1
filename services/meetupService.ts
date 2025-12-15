/**
 * Meetup.com Service
 * Alternative event API since Eventbrite public search is deprecated
 */

// ============================================================================
// TYPES
// ============================================================================

export interface MeetupEvent {
  id: string;
  name: string;
  description: string;
  time: number; // Unix timestamp in milliseconds
  duration: number; // Duration in milliseconds
  local_date: string; // YYYY-MM-DD
  local_time: string; // HH:MM
  venue?: {
    name: string;
    address_1?: string;
    city?: string;
    country?: string;
    lat?: number;
    lon?: number;
  };
  link: string;
  yes_rsvp_count: number;
  group: {
    name: string;
    urlname: string;
  };
  is_online_event: boolean;
  status: string;
}

export interface MeetupSearchResponse {
  events: MeetupEvent[];
}

// ============================================================================
// MEETUP API
// ============================================================================

const MEETUP_API_BASE = 'https://api.meetup.com';

/**
 * Search for language-related events on Meetup.com
 */
export async function searchMeetupEvents(params: {
  location?: string;
  query?: string;
  category?: number; // Meetup category ID (34 = Language & Ethnic Identity)
  radius?: number; // Radius in miles
  limit?: number;
}): Promise<MeetupEvent[]> {
  const {
    location = 'Netherlands',
    query = 'language exchange',
    category = 34, // Language & Ethnic Identity category
    radius = 50,
    limit = 20,
  } = params;

  try {
    // Build query parameters
    const queryParams = new URLSearchParams();
    queryParams.append('text', query);
    queryParams.append('location', location);
    queryParams.append('radius', radius.toString());
    queryParams.append('category', category.toString());
    queryParams.append('page', limit.toString());
    queryParams.append('status', 'upcoming');
    queryParams.append('fields', 'venue,group');

    const url = `${MEETUP_API_BASE}/find/upcoming_events?${queryParams.toString()}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      // Meetup API might require authentication or have rate limits
      // Return empty array gracefully for any error
      if (response.status === 401 || response.status === 403) {
        console.log('Meetup API requires authentication');
        return [];
      }
      if (response.status === 404) {
        console.log('Meetup API endpoint not found - API may have changed');
        return [];
      }
      // For any other error, return empty array instead of throwing
      console.log(`Meetup API error: ${response.status} ${response.statusText}`);
      return [];
    }

    const data: MeetupSearchResponse = await response.json();
    
    // Filter to ensure events are language-related
    const filteredEvents = (data.events || []).filter((event) => {
      const name = event.name.toLowerCase();
      const description = (event.description || '').toLowerCase();
      
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
    console.error('Error fetching Meetup events:', error);
    return [];
  }
}

/**
 * Convert Meetup event to Eventbrite-like format for compatibility
 */
export function convertMeetupToEventbriteFormat(meetupEvent: MeetupEvent): any {
  const startDate = new Date(meetupEvent.time);
  const endDate = new Date(meetupEvent.time + (meetupEvent.duration || 3600000)); // Default 1 hour

  return {
    id: `meetup-${meetupEvent.id}`,
    name: {
      text: meetupEvent.name,
      html: meetupEvent.description || meetupEvent.name,
    },
    description: {
      text: meetupEvent.description || '',
      html: meetupEvent.description || '',
    },
    start: {
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      local: startDate.toISOString(),
      utc: startDate.toISOString(),
    },
    end: {
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      local: endDate.toISOString(),
      utc: endDate.toISOString(),
    },
    url: meetupEvent.link,
    venue_id: meetupEvent.venue?.name,
    online_event: meetupEvent.is_online_event || false,
    is_free: true, // Most Meetup events are free
    status: meetupEvent.status,
    venue: meetupEvent.venue ? {
      name: meetupEvent.venue.name,
      address: {
        localized_area_display: meetupEvent.venue.address_1 || '',
        city: meetupEvent.venue.city,
        country: meetupEvent.venue.country,
      },
    } : undefined,
  };
}

