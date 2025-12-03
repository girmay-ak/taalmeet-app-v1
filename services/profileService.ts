/**
 * Profile Service
 * Backend service for user profiles using new profiles table
 */

import { supabase } from '@/lib/supabase';
import {
  profileUpdateSchema,
  type ProfileUpdateInput,
} from '@/utils/validators';
import {
  DatabaseError,
  RecordNotFoundError,
  ValidationError,
  parseSupabaseError,
} from '@/utils/errors';
import type { Profile, ProfileInsert, ProfileUpdate, UserLanguage, UserLanguageInsert } from '@/types/database';

// ============================================================================
// TYPES
// ============================================================================

export interface CreateProfileInput {
  userId: string;
  displayName: string;
  avatarUrl?: string;
  bio?: string;
  city?: string;
  country?: string;
  lat?: number;
  lng?: number;
}

export interface UpdateProfileInput {
  displayName?: string;
  avatarUrl?: string | null;
  bio?: string;
  city?: string;
  country?: string;
  lat?: number;
  lng?: number;
  isOnline?: boolean;
}

export interface UpdateLanguagesInput {
  languages: Array<{
    language: string;
    level: 'native' | 'advanced' | 'intermediate' | 'beginner' | null;
    role: 'teaching' | 'learning';
  }>;
}

export interface ProfileWithLanguages extends Profile {
  languages: UserLanguage[];
}

export interface CurrentUserProfile {
  id: string;
  displayName: string;
  avatarUrl: string | null;
  bio: string | null;
  city: string | null;
  country: string | null;
  interests: string[] | null;
  languages: {
    learning: Array<{ language: string; level: string | null }>;
    teaching: Array<{ language: string; level: string | null }>;
  };
}

// ============================================================================
// CREATE PROFILE
// ============================================================================

/**
 * Create user profile (inserts into profiles table)
 */
export async function createProfile(input: CreateProfileInput): Promise<Profile> {
  const { userId, displayName, avatarUrl, bio, city, country, lat, lng } = input;

  const insertData: ProfileInsert = {
    id: userId,
    display_name: displayName,
    avatar_url: avatarUrl || null,
    bio: bio || null,
    city: city || null,
    country: country || null,
    lat: lat || null,
    lng: lng || null,
    is_online: false,
  };

  const { data, error } = await supabase
    .from('profiles')
    .insert(insertData)
    .select()
    .single();

  if (error) {
    // If profile already exists (from trigger), try to update it
    if (error.code === '23505') { // Unique violation
      return updateProfile(userId, {
        displayName,
        avatarUrl,
        bio,
        city,
        country,
        lat,
        lng,
      });
    }
    throw parseSupabaseError(error);
  }

  return data;
}

// ============================================================================
// GET PROFILE
// ============================================================================

/**
 * Get current user's profile with languages
 * Reads from supabase.auth.getUser() and fetches profile + languages
 * Returns clean structured object with grouped languages
 */
export async function getCurrentUserProfile(): Promise<CurrentUserProfile | null> {
  // Get current authenticated user
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError || !user) {
    console.log('getCurrentUserProfile - No authenticated user:', authError?.message);
    return null;
  }

  console.log('getCurrentUserProfile - Fetching profile for user:', user.id);

  // Fetch profile from profiles table
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (profileError) {
    if (profileError.code === 'PGRST116') {
      // Profile doesn't exist yet
      console.log('getCurrentUserProfile - Profile not found for user:', user.id);
      return null;
    }
    console.error('getCurrentUserProfile - Error fetching profile:', profileError);
    throw parseSupabaseError(profileError);
  }

  console.log('getCurrentUserProfile - Profile found:', profile?.display_name);

  // Fetch languages from user_languages table
  const { data: languages, error: langError } = await supabase
    .from('user_languages')
    .select('*')
    .eq('user_id', user.id);

  if (langError) {
    throw parseSupabaseError(langError);
  }

  // Group languages by role
  const learningLanguages = (languages || [])
    .filter((lang: UserLanguage) => lang.role === 'learning')
    .map((lang: UserLanguage) => ({
      language: lang.language,
      level: lang.level,
    }));

  const teachingLanguages = (languages || [])
    .filter((lang: UserLanguage) => lang.role === 'teaching')
    .map((lang: UserLanguage) => ({
      language: lang.language,
      level: lang.level,
    }));

  // Return structured object
  // Note: interests is not in profiles table yet, returning null for now
  const result = {
    id: profile.id,
    displayName: profile.display_name,
    avatarUrl: profile.avatar_url,
    bio: profile.bio,
    city: profile.city,
    country: profile.country,
    interests: null, // TODO: Add interests column to profiles table
    languages: {
      learning: learningLanguages,
      teaching: teachingLanguages,
    },
  };

  console.log('getCurrentUserProfile - Returning profile:', {
    displayName: result.displayName,
    hasLanguages: result.languages.learning.length + result.languages.teaching.length,
  });

  return result;
}

/**
 * Get user profile by ID
 */
export async function getProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    throw parseSupabaseError(error);
  }

  return data;
}

/**
 * Get user profile with languages
 */
export async function getProfileWithLanguages(userId: string): Promise<ProfileWithLanguages | null> {
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (profileError) {
    if (profileError.code === 'PGRST116') {
      return null;
    }
    throw parseSupabaseError(profileError);
  }

  const { data: languages, error: langError } = await supabase
    .from('user_languages')
    .select('*')
    .eq('user_id', userId);

  if (langError) {
    throw parseSupabaseError(langError);
  }

  return {
    ...profile,
    languages: languages || [],
  };
}

// ============================================================================
// UPDATE PROFILE
// ============================================================================

/**
 * Update current user's profile
 * Automatically gets current user from session
 */
export async function updateCurrentUserProfile(
  input: UpdateProfileInput
): Promise<Profile> {
  // Get current user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new ValidationError('User must be authenticated to update profile.');
  }

  return updateProfile(user.id, input);
}

/**
 * Update user profile
 */
export async function updateProfile(
  userId: string,
  input: UpdateProfileInput
): Promise<Profile> {
  const updateData: ProfileUpdate = {};

  if (input.displayName !== undefined) updateData.display_name = input.displayName;
  if (input.avatarUrl !== undefined) updateData.avatar_url = input.avatarUrl;
  if (input.bio !== undefined) updateData.bio = input.bio;
  if (input.city !== undefined) updateData.city = input.city;
  if (input.country !== undefined) updateData.country = input.country;
  if (input.lat !== undefined) updateData.lat = input.lat;
  if (input.lng !== undefined) updateData.lng = input.lng;
  if (input.isOnline !== undefined) {
    updateData.is_online = input.isOnline;
    updateData.last_active_at = new Date().toISOString();
  }

  const { data, error } = await supabase
    .from('profiles')
    .update(updateData)
    .eq('id', userId)
    .select()
    .single();

  if (error) {
    throw parseSupabaseError(error);
  }

  return data;
}

// ============================================================================
// LANGUAGES
// ============================================================================

/**
 * Get user's languages
 */
export async function getUserLanguages(userId: string): Promise<UserLanguage[]> {
  const { data, error } = await supabase
    .from('user_languages')
    .select('*')
    .eq('user_id', userId)
    .order('role', { ascending: true })
    .order('created_at', { ascending: true });

  if (error) {
    throw parseSupabaseError(error);
  }

  return data || [];
}

/**
 * Update user languages (replaces all existing languages)
 */
export async function updateUserLanguages(
  userId: string,
  input: UpdateLanguagesInput
): Promise<UserLanguage[]> {
  // Delete existing languages
  const { error: deleteError } = await supabase
    .from('user_languages')
    .delete()
    .eq('user_id', userId);

  if (deleteError) {
    throw parseSupabaseError(deleteError);
  }

  // Insert new languages
  if (input.languages.length === 0) {
    return [];
  }

  const languageInserts: UserLanguageInsert[] = input.languages.map((lang) => ({
    user_id: userId,
    language: lang.language,
    level: lang.level,
    role: lang.role,
  }));

  const { data, error } = await supabase
    .from('user_languages')
    .insert(languageInserts)
    .select();

  if (error) {
    throw parseSupabaseError(error);
  }

  return data || [];
}

// ============================================================================
// ONLINE STATUS
// ============================================================================

/**
 * Update user's online status
 */
export async function setOnlineStatus(userId: string, isOnline: boolean): Promise<void> {
  const { error } = await supabase
    .from('profiles')
    .update({
      is_online: isOnline,
      last_active_at: new Date().toISOString(),
    })
    .eq('id', userId);

  if (error) {
    throw parseSupabaseError(error);
  }
}

