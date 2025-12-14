/// <reference types="vite/client" />

/**
 * Type definitions for Vite environment variables
 * This file provides TypeScript types for import.meta.env
 */

interface ImportMetaEnv {
  // Supabase Configuration (Required)
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;

  // Maps Configuration (Optional)
  readonly VITE_MAPBOX_ACCESS_TOKEN?: string;
  readonly VITE_GOOGLE_MAPS_API_KEY?: string;

  // External Services (Optional)
  readonly VITE_EVENTBRITE_API_KEY?: string;
  readonly VITE_EVENTBRITE_PUBLIC_TOKEN?: string;

  // Feature Flags (Optional)
  readonly VITE_ENABLE_ANALYTICS?: string;
  readonly VITE_ENABLE_CRASH_REPORTING?: string;
  readonly VITE_ENABLE_MOCK_DATA?: string;

  // Error Tracking & Analytics (Optional)
  readonly VITE_SENTRY_DSN?: string;
  readonly VITE_MIXPANEL_TOKEN?: string;

  // App Configuration (Optional)
  readonly VITE_NODE_ENV?: string;
  readonly VITE_API_TIMEOUT?: string;

  // Vite built-in variables
  readonly MODE: string;
  readonly DEV: boolean;
  readonly PROD: boolean;
  readonly SSR: boolean;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

