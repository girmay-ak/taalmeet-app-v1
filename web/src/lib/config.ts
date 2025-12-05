/**
 * Web App Configuration
 * Centralized configuration for environment variables
 * 
 * Note: Vite exposes environment variables via import.meta.env
 * All variables must be prefixed with VITE_ to be exposed to client code
 */

// ==========================================
// SUPABASE CONFIGURATION
// ==========================================
export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
export const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

// ==========================================
// MAPS CONFIGURATION
// ==========================================
export const MAPBOX_ACCESS_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;
export const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

// ==========================================
// EXTERNAL SERVICES
// ==========================================
export const EVENTBRITE_API_KEY = import.meta.env.VITE_EVENTBRITE_API_KEY;
export const EVENTBRITE_PUBLIC_TOKEN = import.meta.env.VITE_EVENTBRITE_PUBLIC_TOKEN;

// ==========================================
// FEATURE FLAGS
// ==========================================
export const ENABLE_ANALYTICS = import.meta.env.VITE_ENABLE_ANALYTICS === 'true';
export const ENABLE_CRASH_REPORTING = import.meta.env.VITE_ENABLE_CRASH_REPORTING === 'true';
export const ENABLE_MOCK_DATA = import.meta.env.VITE_ENABLE_MOCK_DATA === 'true';

// ==========================================
// ERROR TRACKING & ANALYTICS
// ==========================================
export const SENTRY_DSN = import.meta.env.VITE_SENTRY_DSN;
export const MIXPANEL_TOKEN = import.meta.env.VITE_MIXPANEL_TOKEN;

// ==========================================
// APP CONFIGURATION
// ==========================================
export const API_TIMEOUT = Number(import.meta.env.VITE_API_TIMEOUT) || 30000;
export const NODE_ENV = import.meta.env.VITE_NODE_ENV || import.meta.env.MODE || 'development';
export const IS_DEV = NODE_ENV === 'development';
export const IS_PROD = NODE_ENV === 'production';
export const APP_NAME = 'TaalMeet';

// ==========================================
// VALIDATION
// ==========================================

/**
 * Validates that all required environment variables are set
 * Throws an error if any required variables are missing
 */
export function validateEnvVars(): void {
  const required: Record<string, string | undefined> = {
    VITE_SUPABASE_URL: SUPABASE_URL,
    VITE_SUPABASE_ANON_KEY: SUPABASE_ANON_KEY,
  };

  const missing = Object.entries(required)
    .filter(([_, value]) => !value)
    .map(([key]) => key);

  if (missing.length > 0) {
    const errorMessage = `
Missing required environment variables: ${missing.join(', ')}

Please create a .env file in the web/ directory with the required variables.
See .env.example for reference.

Required variables:
${Object.keys(required).map(key => `  - ${key}`).join('\n')}
    `.trim();

    throw new Error(errorMessage);
  }
}

/**
 * Validates Mapbox token format (optional - only needed if using maps)
 * @returns true if token is valid, false otherwise
 */
export function validateMapboxToken(): boolean {
  if (!MAPBOX_ACCESS_TOKEN) {
    return false;
  }
  return MAPBOX_ACCESS_TOKEN.startsWith('pk.');
}

/**
 * Gets all environment variables (for debugging)
 * @returns Object with all environment variables
 */
export function getEnvVars() {
  return {
    SUPABASE_URL,
    SUPABASE_ANON_KEY: SUPABASE_ANON_KEY ? '***' : undefined, // Mask sensitive key
    MAPBOX_ACCESS_TOKEN: MAPBOX_ACCESS_TOKEN ? '***' : undefined,
    GOOGLE_MAPS_API_KEY: GOOGLE_MAPS_API_KEY ? '***' : undefined,
    EVENTBRITE_API_KEY: EVENTBRITE_API_KEY ? '***' : undefined,
    ENABLE_ANALYTICS,
    ENABLE_CRASH_REPORTING,
    ENABLE_MOCK_DATA,
    NODE_ENV,
    IS_DEV,
    IS_PROD,
    API_TIMEOUT,
  };
}

