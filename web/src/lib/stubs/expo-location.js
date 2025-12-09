/**
 * Expo Location Stub for Web
 * Provides empty implementations for web builds
 */

const locationStub = {
  getCurrentPositionAsync: async () => ({
    coords: { latitude: 0, longitude: 0, altitude: null, accuracy: null, altitudeAccuracy: null, heading: null, speed: null },
    timestamp: Date.now(),
  }),
  requestForegroundPermissionsAsync: async () => ({ status: 'denied', granted: false }),
  getForegroundPermissionsAsync: async () => ({ status: 'denied', granted: false }),
  reverseGeocodeAsync: async () => [],
  geocodeAsync: async () => [],
  watchPositionAsync: () => ({ remove: () => {} }),
  stopLocationUpdatesAsync: async () => {},
};

// Export both default and named exports for compatibility
export default locationStub;
export const {
  getCurrentPositionAsync,
  requestForegroundPermissionsAsync,
  getForegroundPermissionsAsync,
  reverseGeocodeAsync,
  geocodeAsync,
  watchPositionAsync,
  stopLocationUpdatesAsync,
} = locationStub;

