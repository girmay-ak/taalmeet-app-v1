/**
 * Location Search Service
 * Smart location-aware search with city-specific place suggestions
 */

import * as Location from 'expo-location';

export interface LocationResult {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  type?: 'cafe' | 'restaurant' | 'library' | 'park' | 'custom' | 'other';
}

/**
 * City-specific popular places database
 * Curated list of popular cafes, libraries, and meeting spots for language exchange
 */
const CITY_PLACES: Record<string, LocationResult[]> = {
  // Den Haag (The Hague)
  'den haag': [
    {
      id: 'dh_1',
      name: 'Buitenhof Library (Bibliotheek)',
      address: 'Spui 68, 2511 BT Den Haag',
      latitude: 52.0779,
      longitude: 4.3100,
      type: 'library',
    },
    {
      id: 'dh_2',
      name: 'Starbucks Buitenhof',
      address: 'Buitenhof 38, 2513 AH Den Haag',
      latitude: 52.0782,
      longitude: 4.3095,
      type: 'cafe',
    },
    {
      id: 'dh_3',
      name: 'Coffee Company Grote Marktstraat',
      address: 'Grote Marktstraat 51, 2511 BJ Den Haag',
      latitude: 52.0788,
      longitude: 4.3092,
      type: 'cafe',
    },
    {
      id: 'dh_4',
      name: 'Bagels & Beans Spui',
      address: 'Spui 24, 2511 BV Den Haag',
      latitude: 52.0780,
      longitude: 4.3098,
      type: 'cafe',
    },
    {
      id: 'dh_5',
      name: 'Central Station Library (HS Biblio)',
      address: 'Koningin Julianaplein 10, 2595 AA Den Haag',
      latitude: 52.0811,
      longitude: 4.3247,
      type: 'library',
    },
    {
      id: 'dh_6',
      name: 'Park Populier',
      address: 'Van Speijkstraat, Den Haag',
      latitude: 52.0800,
      longitude: 4.3050,
      type: 'park',
    },
    {
      id: 'dh_7',
      name: 'Cafe De Zwarte Ruiter',
      address: 'Groenmarkt 14, 2511 AJ Den Haag',
      latitude: 52.0785,
      longitude: 4.3090,
      type: 'restaurant',
    },
    {
      id: 'dh_8',
      name: 'Starbucks Centraal Station',
      address: 'Koningin Julianaplein 1, 2595 AA Den Haag',
      latitude: 52.0810,
      longitude: 4.3245,
      type: 'cafe',
    },
    {
      id: 'dh_9',
      name: 'The Hague University Library',
      address: 'Johanna Westerdijkplein 75, 2521 EN Den Haag',
      latitude: 52.0617,
      longitude: 4.3790,
      type: 'library',
    },
    {
      id: 'dh_10',
      name: 'Coffee Company Den Haag Centrum',
      address: 'Lange Poten 23, 2511 CM Den Haag',
      latitude: 52.0789,
      longitude: 4.3088,
      type: 'cafe',
    },
  ],
  // Amsterdam
  'amsterdam': [
    {
      id: 'ams_1',
      name: 'Starbucks Dam Square',
      address: 'Dam 1, 1012 JS Amsterdam',
      latitude: 52.3731,
      longitude: 4.8922,
      type: 'cafe',
    },
    {
      id: 'ams_2',
      name: 'Central Library Amsterdam (OBA)',
      address: 'Oosterdokskade 143, 1011 DL Amsterdam',
      latitude: 52.3736,
      longitude: 4.9011,
      type: 'library',
    },
    {
      id: 'ams_3',
      name: 'Coffee Company Centraal Station',
      address: 'Stationsplein 10, 1012 AB Amsterdam',
      latitude: 52.3792,
      longitude: 4.9003,
      type: 'cafe',
    },
    {
      id: 'ams_4',
      name: 'Vondelpark',
      address: 'Vondelpark, Amsterdam',
      latitude: 52.3580,
      longitude: 4.8686,
      type: 'park',
    },
    {
      id: 'ams_5',
      name: 'Bagels & Beans Spui',
      address: 'Spui 16, 1012 XA Amsterdam',
      latitude: 52.3692,
      longitude: 4.8846,
      type: 'cafe',
    },
  ],
  // Rotterdam
  'rotterdam': [
    {
      id: 'rtm_1',
      name: 'Central Library Rotterdam',
      address: 'Hoogstraat 110, 3011 PV Rotterdam',
      latitude: 51.9220,
      longitude: 4.4777,
      type: 'library',
    },
    {
      id: 'rtm_2',
      name: 'Coffee Company Lijnbaan',
      address: 'Lijnbaan 80, 3012 EJ Rotterdam',
      latitude: 51.9215,
      longitude: 4.4765,
      type: 'cafe',
    },
    {
      id: 'rtm_3',
      name: 'Starbucks Centraal Station',
      address: 'Stationsplein 45, 3013 AK Rotterdam',
      latitude: 51.9244,
      longitude: 4.4777,
      type: 'cafe',
    },
  ],
  // Utrecht
  'utrecht': [
    {
      id: 'utr_1',
      name: 'Central Library Utrecht (UBU)',
      address: 'Drift 27, 3512 BR Utrecht',
      latitude: 52.0907,
      longitude: 5.1214,
      type: 'library',
    },
    {
      id: 'utr_2',
      name: 'Coffee Company Neude',
      address: 'Neude 20, 3512 AG Utrecht',
      latitude: 52.0934,
      longitude: 5.1195,
      type: 'cafe',
    },
  ],
  // Leiden
  'leiden': [
    {
      id: 'lei_1',
      name: 'University Library Leiden',
      address: 'Witte Singel 27, 2311 BG Leiden',
      latitude: 52.1582,
      longitude: 4.4870,
      type: 'library',
    },
    {
      id: 'lei_2',
      name: 'Starbucks Breestraat',
      address: 'Breestraat 85, 2311 CK Leiden',
      latitude: 52.1595,
      longitude: 4.4920,
      type: 'cafe',
    },
  ],
};

/**
 * Detect city name from coordinates using reverse geocoding
 */
async function detectCity(latitude: number, longitude: number): Promise<string | null> {
  try {
    const results = await Location.reverseGeocodeAsync({ latitude, longitude });
    if (results.length > 0) {
      const result = results[0];
      // Try city, subAdministrativeArea, or region
      const city = result.city || result.subAdministrativeArea || result.region || null;
      return city ? city.toLowerCase() : null;
    }
    return null;
  } catch (error) {
    console.error('Error detecting city:', error);
    return null;
  }
}

/**
 * Get city-specific places based on detected city
 */
async function getCityPlaces(
  latitude?: number,
  longitude?: number
): Promise<LocationResult[]> {
  if (!latitude || !longitude) {
    return [];
  }

  try {
    const cityName = await detectCity(latitude, longitude);
    if (!cityName) {
      return [];
    }

    // Check exact match first
    if (CITY_PLACES[cityName]) {
      return CITY_PLACES[cityName];
    }

    // Check for partial matches (e.g., "den haag" matches "the hague")
    const normalizedCity = cityName
      .toLowerCase()
      .replace(/\s+/g, ' ')
      .trim();

    // Special cases for common variations
    const cityAliases: Record<string, string> = {
      'the hague': 'den haag',
      "'s-gravenhage": 'den haag',
      's-gravenhage': 'den haag',
    };

    const aliasedCity = cityAliases[normalizedCity] || normalizedCity;
    if (CITY_PLACES[aliasedCity]) {
      return CITY_PLACES[aliasedCity];
    }

    // Check if any city key contains the detected city name or vice versa
    for (const [cityKey, places] of Object.entries(CITY_PLACES)) {
      if (normalizedCity.includes(cityKey) || cityKey.includes(normalizedCity)) {
        return places;
      }
    }

    return [];
  } catch (error) {
    console.error('Error getting city places:', error);
    return [];
  }
}

/**
 * Search for places by query string
 * Smart search with city-aware suggestions
 */
export async function searchLocations(
  query: string,
  userLocation?: { latitude: number; longitude: number }
): Promise<LocationResult[]> {
  if (!query || query.trim().length < 2) {
    // If no query, return city-specific suggestions
    if (userLocation) {
      return await getCityPlaces(userLocation.latitude, userLocation.longitude);
    }
    return [];
  }

  try {
    const queryLower = query.toLowerCase().trim();
    const results: LocationResult[] = [];

    // 1. Get city-specific places if user location is available
    let cityPlaces: LocationResult[] = [];
    if (userLocation) {
      cityPlaces = await getCityPlaces(userLocation.latitude, userLocation.longitude);
      
      // Filter city places by query
      const matchingCityPlaces = cityPlaces.filter(
        (place) =>
          place.name.toLowerCase().includes(queryLower) ||
          place.address.toLowerCase().includes(queryLower) ||
          place.type?.toLowerCase().includes(queryLower)
      );
      results.push(...matchingCityPlaces);
    }

    // 2. Search all cities if no city-specific matches or query is generic
    if (results.length === 0 || queryLower.length >= 3) {
      for (const places of Object.values(CITY_PLACES)) {
        const matching = places.filter(
          (place) =>
            place.name.toLowerCase().includes(queryLower) ||
            place.address.toLowerCase().includes(queryLower) ||
            place.type?.toLowerCase().includes(queryLower)
        );
        results.push(...matching);
      }
    }

    // 3. Try to geocode the query directly (for addresses not in our database)
    try {
      const geocoded = await geocodeAddress(query);
      if (geocoded) {
        // Check if we already have this location
        const exists = results.find(
          (loc) =>
            Math.abs(loc.latitude - geocoded.latitude) < 0.001 &&
            Math.abs(loc.longitude - geocoded.longitude) < 0.001
        );
        if (!exists) {
          results.unshift(geocoded); // Add geocoded result at the beginning
        }
      }
    } catch (error) {
      // Ignore geocoding errors
    }

    // Remove duplicates and sort by relevance
    const uniqueResults = Array.from(
      new Map(results.map((item) => [item.id, item])).values()
    );

    // Sort: city places first, then by name match
    uniqueResults.sort((a, b) => {
      const aInCity = cityPlaces.some((p) => p.id === a.id);
      const bInCity = cityPlaces.some((p) => p.id === b.id);
      
      if (aInCity && !bInCity) return -1;
      if (!aInCity && bInCity) return 1;
      
      // Both in city or both not - sort by name match
      const aNameMatch = a.name.toLowerCase().startsWith(queryLower);
      const bNameMatch = b.name.toLowerCase().startsWith(queryLower);
      if (aNameMatch && !bNameMatch) return -1;
      if (!aNameMatch && bNameMatch) return 1;
      
      return a.name.localeCompare(b.name);
    });

    return uniqueResults.slice(0, 20); // Limit to 20 results
  } catch (error) {
    console.error('Error searching locations:', error);
    return [];
  }
}

/**
 * Geocode an address to get coordinates
 */
export async function geocodeAddress(address: string): Promise<LocationResult | null> {
  try {
    const results = await Location.geocodeAsync(address);
    if (results.length > 0) {
      const result = results[0];
      
      // Try to reverse geocode to get a better address format
      let formattedAddress = address;
      try {
        const reversed = await Location.reverseGeocodeAsync({
          latitude: result.latitude,
          longitude: result.longitude,
        });
        if (reversed.length > 0) {
          const parts = [];
          if (reversed[0].street) parts.push(reversed[0].street);
          if (reversed[0].city) parts.push(reversed[0].city);
          if (reversed[0].country) parts.push(reversed[0].country);
          formattedAddress = parts.join(', ') || address;
        }
      } catch (error) {
        // Use original address if reverse geocoding fails
      }
      
      return {
        id: `geo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: address,
        address: formattedAddress,
        latitude: result.latitude,
        longitude: result.longitude,
        type: 'custom',
      };
    }
    return null;
  } catch (error) {
    console.error('Error geocoding address:', error);
    return null;
  }
}

/**
 * Reverse geocode coordinates to get address
 */
export async function reverseGeocode(
  latitude: number,
  longitude: number
): Promise<string | null> {
  try {
    const results = await Location.reverseGeocodeAsync({ latitude, longitude });
    if (results.length > 0) {
      const result = results[0];
      const parts = [];
      if (result.street) parts.push(result.street);
      if (result.city) parts.push(result.city);
      if (result.country) parts.push(result.country);
      return parts.join(', ') || null;
    }
    return null;
  } catch (error) {
    console.error('Error reverse geocoding:', error);
    return null;
  }
}

/**
 * Get nearby places (cafes, restaurants, etc.)
 * Returns city-specific places if user is in a known city
 */
export async function getNearbyPlaces(
  latitude: number,
  longitude: number,
  radius: number = 1000,
  type: 'cafe' | 'restaurant' | 'library' | 'all' = 'all'
): Promise<LocationResult[]> {
  try {
    // First, try to get city-specific places
    const cityPlaces = await getCityPlaces(latitude, longitude);
    
    if (cityPlaces.length > 0) {
      // Filter by type if specified
      const filtered = type === 'all' 
        ? cityPlaces 
        : cityPlaces.filter(place => place.type === type);
      
      // Filter by approximate distance (within 5km radius for city places)
      // This is a simplified check - in production, use proper distance calculation
      const nearby = filtered.slice(0, 10); // Return top 10
      
      if (nearby.length > 0) {
        return nearby;
      }
    }
    
    // Fallback: return empty or generic nearby place
    // In production, integrate with Google Places API here
    return [];
  } catch (error) {
    console.error('Error getting nearby places:', error);
    return [];
  }
}

/**
 * Get popular places for a specific city (for suggestions when no query)
 */
export async function getPopularPlaces(
  latitude?: number,
  longitude?: number
): Promise<LocationResult[]> {
  if (!latitude || !longitude) {
    return [];
  }
  
  return await getCityPlaces(latitude, longitude);
}