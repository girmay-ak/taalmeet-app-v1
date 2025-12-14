/**
 * Mapbox Service
 * Exports Mapbox SDK for use throughout the app
 * Conditionally imports to handle when native code is not available
 */

let Mapbox: any = null;
let isMapboxAvailable = false;

try {
  const mapboxModule = require('@rnmapbox/maps');
  Mapbox = mapboxModule?.default || mapboxModule;
  // Check if Mapbox is actually available (has required methods)
  if (Mapbox && typeof Mapbox.setAccessToken === 'function') {
    isMapboxAvailable = true;
    console.log('[Mapbox] ✅ Native code is available');
  } else {
    console.warn('[Mapbox] ⚠️ Mapbox module loaded but missing required methods');
    isMapboxAvailable = false;
  }
} catch (error: any) {
  // Silently handle error - Mapbox not available in Expo Go
  // Only log in development
  if (__DEV__) {
    console.warn('[Mapbox] ❌ Native code not available:', error?.message || error);
    console.warn('[Mapbox] This is normal in Expo Go. Build with EAS or run "npx expo prebuild" to use Mapbox.');
  }
  isMapboxAvailable = false;
  Mapbox = null;
}

// Re-export Mapbox for convenience
export { Mapbox, isMapboxAvailable };
export default Mapbox;

