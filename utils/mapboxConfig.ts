/**
 * Mapbox Configuration
 * Loads Mapbox access token and configures Mapbox settings
 */

import Mapbox from '@rnmapbox/maps';
import Constants from 'expo-constants';
import { MAPBOX_ACCESS_TOKEN } from '@/lib/config';

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
 */
export function initializeMapbox(): void {
  const accessToken = getMapboxAccessToken();

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

