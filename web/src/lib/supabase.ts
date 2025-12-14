/**
 * Supabase Client for Web
 * Web-optimized version using localStorage instead of SecureStore
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';
import { SUPABASE_URL, SUPABASE_ANON_KEY, validateEnvVars } from './config';

// Validate environment variables on import
validateEnvVars();

// Use placeholder values if not set (for development)
const supabaseUrl = SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = SUPABASE_ANON_KEY || 'placeholder-key';

/**
 * localStorage adapter for Supabase auth
 * Web-compatible storage adapter that uses browser's localStorage
 */
const localStorageAdapter = {
  getItem: (key: string): string | null => {
    try {
      if (typeof window === 'undefined') {
        return null;
      }
      return window.localStorage.getItem(key);
    } catch (error) {
      console.error('localStorage getItem error:', error);
      return null;
    }
  },

  setItem: (key: string, value: string): void => {
    try {
      if (typeof window === 'undefined') {
        return;
      }
      window.localStorage.setItem(key, value);
    } catch (error) {
      console.error('localStorage setItem error:', error);
      // Handle quota exceeded error
      if (error instanceof DOMException && error.name === 'QuotaExceededError') {
        console.warn('localStorage quota exceeded, clearing old data');
        // Optionally clear old Supabase data
        try {
          const keys = Object.keys(window.localStorage);
          keys
            .filter((k) => k.startsWith('sb-'))
            .forEach((k) => window.localStorage.removeItem(k));
          // Retry setting the item
          window.localStorage.setItem(key, value);
        } catch (retryError) {
          console.error('Failed to clear and retry localStorage:', retryError);
        }
      }
    }
  },

  removeItem: (key: string): void => {
    try {
      if (typeof window === 'undefined') {
        return;
      }
      window.localStorage.removeItem(key);
    } catch (error) {
      console.error('localStorage removeItem error:', error);
    }
  },
};

/**
 * Create and configure Supabase client for web
 * Uses localStorage for session persistence
 */
export const supabase: SupabaseClient<Database> = createClient<Database>(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      storage: localStorageAdapter,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true, // Enable for OAuth callbacks
      flowType: 'pkce', // Use PKCE flow for better security
    },
    global: {
      headers: {
        'x-client-info': 'taalmeet-web',
      },
    },
    db: {
      schema: 'public',
    },
    realtime: {
      params: {
        eventsPerSecond: 10,
      },
    },
  }
);

/**
 * Helper function to get current authenticated user
 * @returns Current user or null if not authenticated
 * @throws Error if there's an issue fetching the user
 */
export async function getCurrentUser() {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    throw error;
  }

  return user;
}

/**
 * Helper function to get current session
 * @returns Current session or null if not authenticated
 * @throws Error if there's an issue fetching the session
 */
export async function getCurrentSession() {
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  if (error) {
    throw error;
  }

  return session;
}

/**
 * Helper function to check if user is authenticated
 * @returns true if user is authenticated, false otherwise
 */
export async function isAuthenticated(): Promise<boolean> {
  try {
    const session = await getCurrentSession();
    return !!session;
  } catch {
    return false;
  }
}

/**
 * Helper function to sign out the current user
 * Clears session from localStorage
 */
export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) {
    throw error;
  }
}

/**
 * Get the Supabase client instance
 * Useful for direct access to Supabase features
 */
export function getSupabaseClient(): SupabaseClient<Database> {
  return supabase;
}

// Export types for convenience
export type { Database } from '@/types/database';
export type { SupabaseClient } from '@supabase/supabase-js';

