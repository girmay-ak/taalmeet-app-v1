/**
 * User Service
 * Clean, production-ready user profile operations
 */

import { supabase } from '@/lib/supabase';
import {
  profileUpdateSchema,
  type ProfileUpdateInput,
  type Language,
  type TeachingLanguage,
} from '@/utils/validators';
import {
  DatabaseError,
  RecordNotFoundError,
  ValidationError,
  parseSupabaseError,
} from '@/utils/errors';
import type { User, UserInsert, UserUpdate, UserLanguage, UserLanguageInsert } from '@/types/database';

// ============================================================================
// TYPES
// ============================================================================

export interface CreateProfileInput {
  userId: string;
  email: string;
  fullName: string;
  bio?: string;
  city?: string;
  country?: string;
  interests?: string[];
  avatarUrl?: string;
}

export interface UpdateProfileInput {
  fullName?: string;
  bio?: string;
  city?: string;
  country?: string;
  interests?: string[];
  avatarUrl?: string | null;
}

export interface LanguagesInput {
  learning: Language[];
  teaching: TeachingLanguage;
}

export interface UserProfile extends User {
  languages: UserLanguage[];
}

// ============================================================================
// CREATE PROFILE
// ============================================================================

/**
 * Create user profile after signup
 */
export async function createProfile(input: CreateProfileInput): Promise<User> {
  const { userId, email, fullName, bio, city, country, interests, avatarUrl } = input;

  const insertData: UserInsert = {
    id: userId,
    email,
    full_name: fullName,
    bio: bio || null,
    city: city || null,
    country: country || null,
    interests: interests || null,
    avatar_url: avatarUrl || null,
  };

  const { data, error } = await supabase
    .from('users')
    .insert(insertData)
    .select()
    .single();

  if (error) {
    console.error('Create profile error:', error);
    throw parseSupabaseError(error);
  }

  return data;
}

// ============================================================================
// GET PROFILE
// ============================================================================

/**
 * Get user profile by ID
 */
export async function getProfile(userId: string): Promise<User | null> {
  const { data, error } = await supabase
    .from('users')
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
 * Queries the profiles table (not users table) to match getNearbyUsers
 */
export async function getProfileWithLanguages(userId: string): Promise<UserProfile | null> {
  console.log('[getProfileWithLanguages] Fetching profile for user:', userId);
  
  // Try profiles table first (used by getNearbyUsers)
  let { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  // If not found in profiles, try users table (backward compatibility)
  if (profileError && profileError.code === 'PGRST116') {
    console.log('[getProfileWithLanguages] Not found in profiles table, trying users table:', userId);
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (userError) {
      if (userError.code === 'PGRST116') {
        console.log('[getProfileWithLanguages] User not found in either table (PGRST116):', userId);
        return null;
      }
      console.error('[getProfileWithLanguages] Error fetching user:', {
        userId,
        errorCode: userError.code,
        errorMessage: userError.message,
      });
      throw parseSupabaseError(userError);
    }

    // Convert users table format to match profiles format
    profile = {
      id: user.id,
      display_name: user.full_name,
      avatar_url: user.avatar_url,
      bio: user.bio,
      city: user.city,
      country: user.country,
      is_online: user.is_online,
      last_active_at: user.last_seen_at,
      created_at: user.created_at,
      updated_at: user.updated_at,
    } as any;
    profileError = null;
  } else if (profileError) {
    // Actual error (not just not found)
    console.error('[getProfileWithLanguages] Error fetching profile:', {
      userId,
      errorCode: profileError.code,
      errorMessage: profileError.message,
      errorDetails: profileError,
    });
    throw parseSupabaseError(profileError);
  }

  if (!profile) {
    console.log('[getProfileWithLanguages] Profile data is null:', userId);
    return null;
  }

  console.log('[getProfileWithLanguages] Profile found:', profile.display_name || profile.id);

  // Get languages - transform to match UserLanguage interface
  const { data: languagesData, error: langError } = await supabase
    .from('user_languages')
    .select('*')
    .eq('user_id', userId);

  if (langError) {
    console.error('[getProfileWithLanguages] Error fetching languages:', {
      userId,
      errorCode: langError.code,
      errorMessage: langError.message,
    });
    throw parseSupabaseError(langError);
  }

  // Transform languages to match UserLanguage interface (with role field)
  const languages = (languagesData || []).map((lang: any) => ({
    id: lang.id,
    user_id: lang.user_id,
    language: lang.language || lang.language_code, // Support both field names
    level: lang.level || lang.proficiency_level, // Support both field names
    role: lang.role || (lang.is_learning ? 'learning' : 'teaching'), // Transform is_learning to role
    created_at: lang.created_at,
    updated_at: lang.updated_at || lang.created_at,
  }));

  console.log('[getProfileWithLanguages] Profile loaded successfully:', {
    userId,
    name: profile.display_name || profile.id,
    languagesCount: languages.length,
  });

  // Return in UserProfile format (matching User interface but with display_name)
  return {
    id: profile.id,
    email: '', // Not in profiles table
    full_name: profile.display_name || '',
    username: null,
    bio: profile.bio,
    avatar_url: profile.avatar_url,
    city: profile.city,
    country: profile.country,
    interests: null,
    date_of_birth: null,
    gender: null,
    is_online: profile.is_online || false,
    last_seen_at: profile.last_active_at || profile.updated_at,
    created_at: profile.created_at,
    updated_at: profile.updated_at,
    languages: languages,
  } as UserProfile;
}

/**
 * Get current user's profile
 */
export async function getCurrentUserProfile(): Promise<UserProfile | null> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return null;
  }

  return getProfileWithLanguages(user.id);
}

// ============================================================================
// UPDATE PROFILE
// ============================================================================

/**
 * Update user profile
 */
export async function updateProfile(
  userId: string,
  input: UpdateProfileInput
): Promise<User> {
  const updateData: UserUpdate = {};

  if (input.fullName !== undefined) updateData.full_name = input.fullName;
  if (input.bio !== undefined) updateData.bio = input.bio;
  if (input.city !== undefined) updateData.city = input.city;
  if (input.country !== undefined) updateData.country = input.country;
  if (input.interests !== undefined) updateData.interests = input.interests;
  if (input.avatarUrl !== undefined) updateData.avatar_url = input.avatarUrl;

  const { data, error } = await supabase
    .from('users')
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
 * Save user languages (learning and teaching)
 */
export async function saveLanguages(
  userId: string,
  input: LanguagesInput
): Promise<UserLanguage[]> {
  const { learning, teaching } = input;

  // Delete existing languages first
  await supabase
    .from('user_languages')
    .delete()
    .eq('user_id', userId);

  // Prepare insert data
  const languageInserts: UserLanguageInsert[] = [];

  // Add learning languages
  learning.forEach((lang) => {
    languageInserts.push({
      user_id: userId,
      language_code: lang.code,
      language_name: lang.name,
      is_learning: true,
      is_teaching: false,
      proficiency_level: null,
    });
  });

  // Add teaching language
  languageInserts.push({
    user_id: userId,
    language_code: teaching.code,
    language_name: teaching.name,
    is_learning: false,
    is_teaching: true,
    proficiency_level: teaching.level,
  });

  const { data, error } = await supabase
    .from('user_languages')
    .insert(languageInserts)
    .select();

  if (error) {
    console.error('Save languages error:', error);
    throw parseSupabaseError(error);
  }

  return data;
}

/**
 * Get user's languages
 */
export async function getLanguages(userId: string): Promise<UserLanguage[]> {
  const { data, error } = await supabase
    .from('user_languages')
    .select('*')
    .eq('user_id', userId);

  if (error) {
    throw parseSupabaseError(error);
  }

  return data || [];
}

/**
 * Update a single language
 */
export async function updateLanguage(
  languageId: string,
  input: Partial<UserLanguageInsert>
): Promise<UserLanguage> {
  const { data, error } = await supabase
    .from('user_languages')
    .update(input)
    .eq('id', languageId)
    .select()
    .single();

  if (error) {
    throw parseSupabaseError(error);
  }

  return data;
}

// ============================================================================
// LOCATION
// ============================================================================

/**
 * Update user's location
 */
export async function updateLocation(
  userId: string,
  city: string,
  country: string
): Promise<User> {
  return updateProfile(userId, { city, country });
}

// ============================================================================
// ONLINE STATUS
// ============================================================================

/**
 * Update user's online status
 */
export async function setOnlineStatus(userId: string, isOnline: boolean): Promise<void> {
  const { error } = await supabase
    .from('users')
    .update({
      is_online: isOnline,
      last_seen_at: new Date().toISOString(),
    })
    .eq('id', userId);

  if (error) {
    throw parseSupabaseError(error);
  }
}

// ============================================================================
// CHECK USERNAME
// ============================================================================

/**
 * Check if username is available
 */
export async function isUsernameAvailable(username: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('users')
    .select('id')
    .eq('username', username)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return true; // Not found = available
    }
    throw parseSupabaseError(error);
  }

  return !data;
}

// ============================================================================
// DELETE ACCOUNT
// ============================================================================

/**
 * Delete user account and all associated data
 */
export async function deleteAccount(userId: string): Promise<void> {
  // Delete languages
  await supabase.from('user_languages').delete().eq('user_id', userId);
  
  // Delete locations
  await supabase.from('locations').delete().eq('user_id', userId);
  
  // Delete user profile
  const { error } = await supabase.from('users').delete().eq('id', userId);
  
  if (error) {
    throw parseSupabaseError(error);
  }
}

