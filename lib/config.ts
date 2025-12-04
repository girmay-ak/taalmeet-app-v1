/**
 * Application Configuration
 * Centralized configuration for environment variables
 */

// Supabase
export const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
export const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

// Maps
export const MAPBOX_ACCESS_TOKEN = process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN;
export const GOOGLE_MAPS_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || 'AIzaSyCJlhCsal8nx2Gj3VRgrQ6zQ7JLNSJbpRA';

// API
export const API_TIMEOUT = Number(process.env.API_TIMEOUT) || 30000;
export const ENABLE_LOGGING = process.env.ENABLE_LOGGING === 'true';
export const ENABLE_MOCK_DATA = process.env.ENABLE_MOCK_DATA === 'true';

// Feature Flags
export const ENABLE_ANALYTICS = process.env.ENABLE_ANALYTICS === 'true';
export const ENABLE_CRASH_REPORTING =
  process.env.ENABLE_CRASH_REPORTING === 'true';
export const ENABLE_PUSH_NOTIFICATIONS =
  process.env.ENABLE_PUSH_NOTIFICATIONS === 'true';

// External Services
export const SENTRY_DSN = process.env.SENTRY_DSN;
export const MIXPANEL_TOKEN = process.env.MIXPANEL_TOKEN;

// Eventbrite API
export const EVENTBRITE_API_KEY = process.env.EXPO_PUBLIC_EVENTBRITE_API_KEY || 'FUPDHNPWHA5UVEGZYL';
export const EVENTBRITE_PUBLIC_TOKEN = process.env.EXPO_PUBLIC_EVENTBRITE_PUBLIC_TOKEN || 'VK5VH2TIESVMBC2UHXWJ';
export const EVENTBRITE_PRIVATE_TOKEN = process.env.EXPO_PUBLIC_EVENTBRITE_PRIVATE_TOKEN || 'JMMC4ILSKMGBPYTPMQEG';

// App Info
export const APP_NAME = process.env.APP_NAME || 'TaalMeet';
export const NODE_ENV = process.env.NODE_ENV || 'development';
export const IS_DEV = NODE_ENV === 'development';
export const IS_PROD = NODE_ENV === 'production';

// Validate required environment variables
export function validateEnvVars() {
  const required = {
    EXPO_PUBLIC_SUPABASE_URL: SUPABASE_URL,
    EXPO_PUBLIC_SUPABASE_ANON_KEY: SUPABASE_ANON_KEY,
  };

  const missing = Object.entries(required)
    .filter(([_, value]) => !value)
    .map(([key]) => key);

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}\n\n` +
        'Please create a .env file with the required variables.\n' +
        'See .env.example for reference.'
    );
  }
}

// Validate Mapbox token (optional - only needed if using maps)
export function validateMapboxToken(): boolean {
  return !!MAPBOX_ACCESS_TOKEN && MAPBOX_ACCESS_TOKEN.startsWith('pk.');
}

