// Supabase Edge Function: Fetch Events
// This function fetches events from Eventbrite API server-side
// to avoid exposing API keys and handle CORS issues

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { corsHeaders } from '../_shared/cors.ts';

const EVENTBRITE_API_BASE = 'https://www.eventbriteapi.com/v3';

interface EventbriteEvent {
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
  online_event: boolean;
  is_free: boolean;
  status: string;
  venue?: {
    name: string;
    address: {
      localized_area_display?: string;
      city?: string;
      country?: string;
    };
  };
}

interface EventbriteSearchResponse {
  events: EventbriteEvent[];
  pagination: {
    object_count: number;
    page_number: number;
    page_size: number;
    page_count: number;
  };
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { location, onlineOnly = false, limit = 20, query = 'language exchange' } = await req.json();

    // Get Eventbrite token from environment (set in Supabase dashboard)
    const EVENTBRITE_TOKEN = Deno.env.get('EVENTBRITE_PUBLIC_TOKEN') || Deno.env.get('EVENTBRITE_PRIVATE_TOKEN');
    
    if (!EVENTBRITE_TOKEN) {
      return new Response(
        JSON.stringify({ 
          error: 'Eventbrite token not configured',
          events: [] 
        }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Build Eventbrite API request
    const queryParams = new URLSearchParams();
    queryParams.append('q', query);
    
    if (location) {
      queryParams.append('location.address', location);
    }
    
    if (onlineOnly) {
      queryParams.append('venue.online_event', 'true');
    }
    
    queryParams.append('sort_by', 'date');
    queryParams.append('expand', 'venue');
    queryParams.append('page_size', Math.min(limit, 50).toString());
    queryParams.append('token', EVENTBRITE_TOKEN);

    // Try Eventbrite search endpoint
    const eventbriteUrl = `${EVENTBRITE_API_BASE}/events/search/?${queryParams.toString()}`;
    
    const response = await fetch(eventbriteUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      const data: EventbriteSearchResponse = await response.json();
      
      // Filter to ensure events are language-related
      const filteredEvents = (data.events || []).filter((event) => {
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

      return new Response(
        JSON.stringify({ 
          events: filteredEvents.slice(0, limit),
          source: 'eventbrite'
        }),
        { 
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    } else {
      // If Eventbrite fails, return empty array
      console.error(`Eventbrite API error: ${response.status} ${response.statusText}`);
      return new Response(
        JSON.stringify({ 
          events: [],
          source: 'none',
          error: `Eventbrite API returned ${response.status}`
        }),
        { 
          status: 200, // Return 200 with empty array so app doesn't crash
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
  } catch (error) {
    console.error('Error in fetch-events function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        events: []
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

