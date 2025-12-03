/**
 * Preferences Service
 * Backend service for managing user discovery preferences
 */

import { supabase } from '@/lib/supabase';
import {
  DatabaseError,
  ValidationError,
  parseSupabaseError,
} from '@/utils/errors';
import type {
  DiscoveryPreferences,
  DiscoveryPreferencesInsert,
  DiscoveryPreferencesUpdate,
} from '@/types/database';

// ============================================================================
// GET DISCOVERY PREFERENCES
// ============================================================================

/**
 * Get user's discovery preferences
 * Returns default preferences if none exist
 */
export async function getDiscoveryPreferences(
  userId: string
): Promise<DiscoveryPreferences> {
  const { data, error } = await supabase
    .from('discovery_preferences')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      // No preferences found, return defaults
      return {
        id: '',
        user_id: userId,
        only_my_languages: false,
        show_nearby_first: true,
        max_distance_km: 50,
        min_match_score: 0,
        meeting_type: ['in-person', 'video', 'call', 'chat'],
        preferred_levels: ['Beginner (A1-A2)', 'Intermediate (B1-B2)', 'Advanced (C1-C2)', 'Native'],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
    }
    throw parseSupabaseError(error);
  }

  return data;
}

// ============================================================================
// UPDATE DISCOVERY PREFERENCES
// ============================================================================

/**
 * Update user's discovery preferences
 * Creates preferences if they don't exist
 */
export async function updateDiscoveryPreferences(
  userId: string,
  payload: DiscoveryPreferencesUpdate
): Promise<DiscoveryPreferences> {
  // Validate payload
  if (payload.max_distance_km !== undefined) {
    if (payload.max_distance_km < 1 || payload.max_distance_km > 1000) {
      throw new ValidationError('Max distance must be between 1 and 1000 km');
    }
  }

  if (payload.min_match_score !== undefined) {
    if (payload.min_match_score < 0 || payload.min_match_score > 100) {
      throw new ValidationError('Min match score must be between 0 and 100');
    }
  }

  // Check if preferences exist
  const { data: existing } = await supabase
    .from('discovery_preferences')
    .select('id')
    .eq('user_id', userId)
    .single();

  if (existing) {
    // Update existing preferences
    const { data, error } = await supabase
      .from('discovery_preferences')
      .update(payload)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      throw parseSupabaseError(error);
    }

    return data;
  } else {
    // Create new preferences
    const insertData: DiscoveryPreferencesInsert = {
      user_id: userId,
      ...payload,
    };

    const { data, error } = await supabase
      .from('discovery_preferences')
      .insert(insertData)
      .select()
      .single();

    if (error) {
      throw parseSupabaseError(error);
    }

    return data;
  }
}

/**
 * Reset preferences to defaults
 */
export async function resetDiscoveryPreferences(
  userId: string
): Promise<DiscoveryPreferences> {
  return updateDiscoveryPreferences(userId, {
    only_my_languages: false,
    show_nearby_first: true,
    max_distance_km: 50,
    min_match_score: 0,
    meeting_type: ['in-person', 'video', 'call', 'chat'],
    preferred_levels: ['Beginner (A1-A2)', 'Intermediate (B1-B2)', 'Advanced (C1-C2)', 'Native'],
  });
}

