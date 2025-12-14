/**
 * Web App Configuration
 * Centralized configuration for environment variables
 * 
 * Note: Next.js exposes environment variables via process.env
 * All client-side variables must be prefixed with NEXT_PUBLIC_ to be exposed
 */

// ==========================================
// SUPABASE CONFIGURATION
// ==========================================
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// ==========================================
// MAPS CONFIGURATION
// ==========================================
export const MAPBOX_ACCESS_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || '';
export const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';

// ==========================================
// EXTERNAL SERVICES
// ==========================================
export const EVENTBRITE_API_KEY = process.env.NEXT_PUBLIC_EVENTBRITE_API_KEY || '';
export const EVENTBRITE_PUBLIC_TOKEN = process.env.NEXT_PUBLIC_EVENTBRITE_PUBLIC_TOKEN || '';

// ==========================================
// FEATURE FLAGS
// ==========================================
export const ENABLE_ANALYTICS = process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === 'true';
export const ENABLE_CRASH_REPORTING = process.env.NEXT_PUBLIC_ENABLE_CRASH_REPORTING === 'true';
export const ENABLE_MOCK_DATA = process.env.NEXT_PUBLIC_ENABLE_MOCK_DATA === 'true';
export const ENABLE_LOGGING = process.env.NEXT_PUBLIC_ENABLE_LOGGING === 'true' || process.env.NODE_ENV === 'development';

// ==========================================
// ERROR TRACKING & ANALYTICS
// ==========================================
export const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN || '';
export const MIXPANEL_TOKEN = process.env.NEXT_PUBLIC_MIXPANEL_TOKEN || '';

// ==========================================
// APP CONFIGURATION
// ==========================================
export const API_TIMEOUT = Number(process.env.NEXT_PUBLIC_API_TIMEOUT) || 30000;
export const NODE_ENV = process.env.NODE_ENV || 'development';
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
  // Only validate in production or if explicitly enabled
  // In development, allow missing values to prevent blocking startup
  if (IS_DEV && process.env.NEXT_PUBLIC_SKIP_ENV_VALIDATION === 'true') {
    return;
  }

  const required: Record<string, string | undefined> = {
    NEXT_PUBLIC_SUPABASE_URL: SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: SUPABASE_ANON_KEY,
  };

  const missing = Object.entries(required)
    .filter(([_, value]) => !value || value === 'your_supabase_url_here' || value === 'your_supabase_anon_key_here')
    .map(([key]) => key);

  if (missing.length > 0) {
    // In development, log warning instead of throwing
    if (IS_DEV) {
      console.warn(`
⚠️  Missing required environment variables: ${missing.join(', ')}

Please create a .env.local file in the web/ directory with the required variables.

Required variables:
${Object.keys(required).map(key => `  - ${key}`).join('\n')}

To get your Supabase credentials:
1. Go to https://app.supabase.com
2. Select your project
3. Go to Settings > API
4. Copy the "Project URL" and "anon public" key

To skip this validation in development, add NEXT_PUBLIC_SKIP_ENV_VALIDATION=true to .env.local
      `.trim());
      return;
    }

    // In production, throw error
    const errorMessage = `
Missing required environment variables: ${missing.join(', ')}

Please create a .env.local file in the web/ directory with the required variables.
See .env.example for reference.

Required variables:
${Object.keys(required).map(key => `  - ${key}`).join('\n')}

To get your Supabase credentials:
1. Go to https://app.supabase.com
2. Select your project
3. Go to Settings > API
4. Copy the "Project URL" and "anon public" key
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
