/**
 * Location Search Service
 * Search for places, cafes, and locations using reverse geocoding
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
 * Search for places by query string
 * Uses reverse geocoding to find locations
 */
export async function searchLocations(
  query: string,
  userLocation?: { latitude: number; longitude: number }
): Promise<LocationResult[]> {
  if (!query || query.trim().length < 2) {
    return [];
  }

  try {
    // Use reverse geocoding to search for places
    // For a full implementation, you would use Google Places API
    // For now, we'll use a simple approach with expo-location
    
    // If user has location, try to geocode based on city/area + query
    const results: LocationResult[] = [];
    
    // For demo purposes, we'll create some sample locations
    // In production, integrate with Google Places API or similar
    const sampleLocations: LocationResult[] = [
      {
        id: '1',
        name: 'Starbucks',
        address: '123 Main Street, Amsterdam',
        latitude: 52.3676,
        longitude: 4.9041,
        type: 'cafe',
      },
      {
        id: '2',
        name: 'Central Library',
        address: '456 Library Lane, Amsterdam',
        latitude: 52.3696,
        longitude: 4.9061,
        type: 'library',
      },
      {
        id: '3',
        name: 'Coffee Corner',
        address: '789 Coffee Street, Amsterdam',
        latitude: 52.3656,
        longitude: 4.9021,
        type: 'cafe',
      },
    ];

    // Filter by query
    let filtered = sampleLocations.filter((loc) =>
      loc.name.toLowerCase().includes(query.toLowerCase()) ||
      loc.address.toLowerCase().includes(query.toLowerCase())
    );

    // Also try to geocode the query directly (in case it's an address)
    // This is useful for custom addresses
    try {
      const geocoded = await geocodeAddress(query);
      if (geocoded) {
        // Add to results if not already there
        if (!filtered.find((loc) => loc.id === geocoded.id)) {
          filtered = [geocoded, ...filtered];
        }
      }
    } catch (error) {
      // Ignore geocoding errors, just use filtered results
    }

    return filtered;
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
      return {
        id: `geo_${Date.now()}`,
        name: address,
        address: address,
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
 * This would typically use Google Places API
 */
export async function getNearbyPlaces(
  latitude: number,
  longitude: number,
  radius: number = 1000,
  type: 'cafe' | 'restaurant' | 'library' | 'all' = 'all'
): Promise<LocationResult[]> {
  // For now, return sample data
  // In production, integrate with Google Places API
  return [
    {
      id: 'nearby_1',
      name: 'Nearby Cafe',
      address: 'Close to you',
      latitude: latitude + 0.001,
      longitude: longitude + 0.001,
      type: 'cafe',
    },
  ];
}

