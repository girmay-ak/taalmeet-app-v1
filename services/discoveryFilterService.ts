/**
 * Discovery Filter Preferences Service
 * Backend service for managing user discovery filter preferences
 */

import { supabase } from '@/lib/supabase';
import { parseSupabaseError } from '@/utils/errors';
import type {
  DiscoveryFilterPreferences,
  DiscoveryFilterPreferencesInsert,
  DiscoveryFilterPreferencesUpdate,
} from '@/types/database';

/**
 * Get user's discovery filter preferences
 */
export async function getDiscoveryFilterPreferences(
  userId: string
): Promise<DiscoveryFilterPreferences | null> {
  const { data, error } = await supabase
    .from('discovery_filter_preferences')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      // No preferences found, return null (will use defaults)
      return null;
    }
    throw parseSupabaseError(error);
  }

  return data as DiscoveryFilterPreferences;
}

/**
 * Create or update discovery filter preferences
 */
export async function upsertDiscoveryFilterPreferences(
  userId: string,
  preferences: DiscoveryFilterPreferencesUpdate
): Promise<DiscoveryFilterPreferences> {
  // First, try to get existing preferences
  const existing = await getDiscoveryFilterPreferences(userId);

  if (existing) {
    // Update existing
    const { data, error } = await supabase
      .from('discovery_filter_preferences')
      .update(preferences)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      throw parseSupabaseError(error);
    }

    return data as DiscoveryFilterPreferences;
  } else {
    // Create new
    const insertData: DiscoveryFilterPreferencesInsert = {
      user_id: userId,
      ...preferences,
    };

    const { data, error } = await supabase
      .from('discovery_filter_preferences')
      .insert(insertData)
      .select()
      .single();

    if (error) {
      throw parseSupabaseError(error);
    }

    return data as DiscoveryFilterPreferences;
  }
}

/**
 * Reset discovery filter preferences to defaults
 */
export async function resetDiscoveryFilterPreferences(
  userId: string
): Promise<DiscoveryFilterPreferences> {
  return upsertDiscoveryFilterPreferences(userId, {
    max_distance: 50,
    preferred_languages: null,
    gender_preference: 'all',
    availability_filter: false,
    timezone_match: false,
    min_match_score: 0,
  });
}

