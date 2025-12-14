/**
 * Mapbox Configuration
 * Loads Mapbox access token and configures Mapbox settings
 */

import Constants from 'expo-constants';
import { MAPBOX_ACCESS_TOKEN } from '@/lib/config';
import { isMapboxAvailable, Mapbox } from '@/services/mapbox';

// ============================================================================
// CONFIGURATION
// ============================================================================

/**
 * Get Mapbox access token from config
 */
export function getMapboxAccessToken(): string {
  if (!MAPBOX_ACCESS_TOKEN) {
    throw new Error(
      'Mapbox access token is missing. Please add EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN to your .env file.'
    );
  }

  return MAPBOX_ACCESS_TOKEN;
}

/**
 * Initialize Mapbox with access token
 * Call this once at app startup (e.g., in _layout.tsx or App.tsx)
 * Returns true if initialization was successful, false otherwise
 */
export function initializeMapbox(): boolean {
  try {
    // Check if Mapbox native code is available
    if (!isMapboxAvailable || !Mapbox) {
      console.warn('[Mapbox] Native code not available. Run "npx expo prebuild" and rebuild the app.');
      return false;
    }

    const accessToken = getMapboxAccessToken();

    if (!accessToken || !accessToken.startsWith('pk.')) {
      console.warn('[Mapbox] Invalid access token format. Mapbox will not work.');
      return false;
    }

    // Set access token
    Mapbox.setAccessToken(accessToken);

    // Configure user location
    Mapbox.setConnected(true);

    // Enable telemetry (optional - set to false to disable)
    // Mapbox telemetry helps Mapbox improve their services
    const enableTelemetry = __DEV__ ? false : true; // Disable in dev, enable in production
    Mapbox.setTelemetryEnabled(enableTelemetry);

    // Set user agent (optional - helps with analytics)
    if (Constants.platform?.ios) {
      Mapbox.setConnected(true);
    }

    console.log('[Mapbox] Successfully initialized');
    return true;
  } catch (error) {
    console.warn('[Mapbox] Initialization failed:', error);
    return false;
  }
}

/**
 * Get default camera settings
 */
export function getDefaultCameraSettings() {
  return {
    zoomLevel: 12,
    animationDuration: 1000,
    animationMode: 'flyTo' as const,
  };
}

/**
 * Get user location settings
 */
export function getUserLocationSettings() {
  return {
    visible: true,
    showsUserHeadingIndicator: true,
    androidRenderMode: 'gps' as const,
    iosShowsUserHeadingIndicator: true,
  };
}

/**
 * Check if Mapbox is properly configured
 */
export function isMapboxConfigured(): boolean {
  try {
    const token = getMapboxAccessToken();
    return !!token && token.startsWith('pk.');
  } catch {
    return false;
  }
}

