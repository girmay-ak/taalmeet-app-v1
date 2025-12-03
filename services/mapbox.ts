/**
 * Mapbox Service
 * Sets up Mapbox access token and exports Mapbox instance
 */

import Mapbox from '@rnmapbox/maps';
import { MAPBOX_ACCESS_TOKEN } from '@/lib/config';

// Set access token
if (MAPBOX_ACCESS_TOKEN) {
  Mapbox.setAccessToken(MAPBOX_ACCESS_TOKEN);
} else {
  console.warn(
    'Mapbox access token is missing. Please add EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN to your .env file.'
  );
}

export { Mapbox };

