import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
import { Database } from '@/types/database';
import { SUPABASE_URL, SUPABASE_ANON_KEY, validateEnvVars } from './config';

// Validate environment variables on import
validateEnvVars();

const supabaseUrl = SUPABASE_URL!;
const supabaseAnonKey = SUPABASE_ANON_KEY!;

// SecureStore has a 2048 byte limit per key, so we need to chunk large values
const CHUNK_SIZE = 2000; // Leave some buffer under 2048

/**
 * Chunked storage adapter for Expo SecureStore
 * Handles Supabase session tokens that exceed SecureStore's 2048 byte limit
 */
const ChunkedSecureStoreAdapter = {
  getItem: async (key: string): Promise<string | null> => {
    try {
      // First try to get the metadata (number of chunks)
      const chunkCountStr = await SecureStore.getItemAsync(`${key}_chunks`);
      
      if (chunkCountStr) {
        // This is a chunked value
        const chunkCount = parseInt(chunkCountStr, 10);
        const chunks: string[] = [];
        
        for (let i = 0; i < chunkCount; i++) {
          const chunk = await SecureStore.getItemAsync(`${key}_${i}`);
          if (chunk === null) {
            // If any chunk is missing, the data is corrupted
            console.warn(`Missing chunk ${i} for key ${key}`);
            return null;
          }
          chunks.push(chunk);
        }
        
        return chunks.join('');
      }
      
      // Fall back to direct read (for small values or legacy data)
      return await SecureStore.getItemAsync(key);
    } catch (error) {
      console.error('SecureStore getItem error:', error);
      return null;
    }
  },

  setItem: async (key: string, value: string): Promise<void> => {
    try {
      // First, clean up any existing chunks for this key
      await ChunkedSecureStoreAdapter.removeItem(key);
      
      if (value.length <= CHUNK_SIZE) {
        // Small enough to store directly
        await SecureStore.setItemAsync(key, value);
      } else {
        // Need to chunk the value
        const chunks: string[] = [];
        for (let i = 0; i < value.length; i += CHUNK_SIZE) {
          chunks.push(value.slice(i, i + CHUNK_SIZE));
        }
        
        // Store each chunk
        for (let i = 0; i < chunks.length; i++) {
          await SecureStore.setItemAsync(`${key}_${i}`, chunks[i]);
        }
        
        // Store the chunk count as metadata
        await SecureStore.setItemAsync(`${key}_chunks`, chunks.length.toString());
      }
    } catch (error) {
      console.error('SecureStore setItem error:', error);
      throw error;
    }
  },

  removeItem: async (key: string): Promise<void> => {
    try {
      // Check if this is a chunked value
      const chunkCountStr = await SecureStore.getItemAsync(`${key}_chunks`);
      
      if (chunkCountStr) {
        const chunkCount = parseInt(chunkCountStr, 10);
        
        // Delete all chunks
        for (let i = 0; i < chunkCount; i++) {
          await SecureStore.deleteItemAsync(`${key}_${i}`);
        }
        
        // Delete the metadata
        await SecureStore.deleteItemAsync(`${key}_chunks`);
      }
      
      // Also try to delete the direct key (for small values or legacy data)
      await SecureStore.deleteItemAsync(key);
    } catch (error) {
      console.error('SecureStore removeItem error:', error);
    }
  },
};

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: ChunkedSecureStoreAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Helper function to get current user
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

// Helper function to get current session
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

