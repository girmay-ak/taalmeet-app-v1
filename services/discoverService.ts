/**
 * Discover Service
 * Backend service for discover feed (recommended users, sessions, etc.)
 */

import { supabase } from '@/lib/supabase';
import { parseSupabaseError } from '@/utils/errors';
import type { Profile, UserLanguage, LanguageSession } from '@/types/database';
import * as sessionService from './sessionService';
import { excludeBlockedUsers } from './safetyService';

// ============================================================================
// TYPES
// ============================================================================

export interface DiscoverFilters {
  language?: string; // Filter by language
  maxDistance?: number; // Max distance in km (default: 50)
  limit?: number; // Max results per category (default: 50)
  gender?: 'all' | 'male' | 'female' | 'other' | 'prefer_not_to_say'; // Gender filter
  availabilityOnly?: boolean; // Only show users who are available
  minMatchScore?: number; // Minimum language match score (0-100)
  preferredLanguages?: string[]; // Array of preferred language codes
}

export interface DiscoverUser extends Profile {
  languages: UserLanguage[];
  matchScore?: number; // Language match score (0-100)
}

export interface DiscoverFeed {
  recommendedUsers: DiscoverUser[];
  newUsers: DiscoverUser[];
  activeUsers: DiscoverUser[];
  sessions: sessionService.SessionWithDetails[];
}

// ============================================================================
// GET DISCOVER FEED
// ============================================================================

/**
 * Get discover feed with recommended users, new users, active users, and sessions
 */
export async function getDiscoverFeed(
  userId: string,
  filters: DiscoverFilters = {}
): Promise<DiscoverFeed> {
  const {
    language,
    maxDistance = 50,
    limit = 50,
    gender,
    availabilityOnly = false,
    minMatchScore = 0,
    preferredLanguages,
  } = filters;

  // Get current user's languages for matching
  const { data: currentUserLanguages, error: langError } = await supabase
    .from('user_languages')
    .select('language, role')
    .eq('user_id', userId);

  if (langError) {
    throw parseSupabaseError(langError);
  }

  const currentUserTeaching = (currentUserLanguages || [])
    .filter((l: UserLanguage) => l.role === 'teaching')
    .map((l: UserLanguage) => l.language.toLowerCase());
  const currentUserLearning = (currentUserLanguages || [])
    .filter((l: UserLanguage) => l.role === 'learning')
    .map((l: UserLanguage) => l.language.toLowerCase());

  // Get current user's location for distance calculation
  const { data: currentUserProfile } = await supabase
    .from('profiles')
    .select('lat, lng')
    .eq('id', userId)
    .single();

  const userLat = currentUserProfile?.lat;
  const userLng = currentUserProfile?.lng;

  // Build base query for profiles (exclude current user)
  let baseQuery = supabase
    .from('profiles')
    .select(`
      *,
      languages:user_languages(*)
    `)
    .neq('id', userId);

  // Apply gender filter
  if (gender && gender !== 'all') {
    baseQuery = baseQuery.eq('gender', gender);
  }

  // Apply availability filter
  if (availabilityOnly) {
    baseQuery = baseQuery.eq('is_available', true);
  }

  // Apply language filter if provided
  if (language) {
    baseQuery = baseQuery
      .in('id', 
        supabase
          .from('user_languages')
          .select('user_id')
          .eq('language', language)
          .neq('user_id', userId)
      );
  } else if (preferredLanguages && preferredLanguages.length > 0) {
    // Filter by preferred languages array
    baseQuery = baseQuery
      .in('id', 
        supabase
          .from('user_languages')
          .select('user_id')
          .in('language', preferredLanguages)
          .neq('user_id', userId)
      );
  }

  // ============================================================================
  // RECOMMENDED USERS
  // ============================================================================
  // Users with matching languages (user's learning matches their teaching, or vice versa)
  let recommendedQuery = baseQuery;

  // If we have language preferences, filter by matching languages
  if (currentUserTeaching.length > 0 || currentUserLearning.length > 0) {
    // Get all user languages for potential matches
    const { data: allUserLanguages } = await supabase
      .from('user_languages')
      .select('user_id, language, role')
      .neq('user_id', userId);

    // Filter for matching users
    const matchingIds = new Set<string>();

    (allUserLanguages || []).forEach((ul: any) => {
      const langLower = ul.language.toLowerCase();
      
      // They teach what we're learning
      if (ul.role === 'teaching' && currentUserLearning.includes(langLower)) {
        matchingIds.add(ul.user_id);
      }
      
      // They learn what we're teaching
      if (ul.role === 'learning' && currentUserTeaching.includes(langLower)) {
        matchingIds.add(ul.user_id);
      }
    });

    if (matchingIds.size > 0) {
      recommendedQuery = recommendedQuery.in('id', Array.from(matchingIds));
    } else {
      // No matches, return empty array
      recommendedQuery = recommendedQuery.eq('id', '00000000-0000-0000-0000-000000000000'); // Impossible ID
    }
  }

  // Order by recently active
  recommendedQuery = recommendedQuery
    .order('last_active_at', { ascending: false, nullsLast: true })
    .limit(limit);

  const { data: recommendedProfiles, error: recommendedError } = await recommendedQuery;

  if (recommendedError) {
    throw parseSupabaseError(recommendedError);
  }

  // Calculate match scores and add distance
  const recommendedUsers: DiscoverUser[] = (recommendedProfiles || []).map((profile: any) => {
    const userLanguages = (profile.languages || []) as UserLanguage[];
    const matchScore = calculateLanguageMatchScore(
      currentUserTeaching,
      currentUserLearning,
      userLanguages
    );

    let distance: number | undefined;
    if (userLat && userLng && profile.lat && profile.lng) {
      distance = calculateDistance(userLat, userLng, profile.lat, profile.lng);
    }

    return {
      ...profile,
      languages: userLanguages,
      matchScore,
    };
  }).filter((user: DiscoverUser) => {
    // Filter by maxDistance if location is available
    if (maxDistance && user.lat && user.lng && userLat && userLng) {
      const distance = calculateDistance(userLat, userLng, user.lat, user.lng);
      if (distance > maxDistance) return false;
    }
    
    // Filter by minimum match score
    if (minMatchScore > 0 && (user.matchScore || 0) < minMatchScore) {
      return false;
    }
    
    return true;
  }).sort((a, b) => {
    // Sort by match score (descending), then by last_active_at
    if (a.matchScore !== b.matchScore) {
      return (b.matchScore || 0) - (a.matchScore || 0);
    }
    return new Date(b.last_active_at).getTime() - new Date(a.last_active_at).getTime();
  });

  // ============================================================================
  // NEW USERS
  // ============================================================================
  // Recently created profiles (last 7 days)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  let newUsersQuery = baseQuery
    .gte('created_at', sevenDaysAgo.toISOString())
    .order('created_at', { ascending: false })
    .limit(limit);

  const { data: newUsersProfiles, error: newUsersError } = await newUsersQuery;

  if (newUsersError) {
    throw parseSupabaseError(newUsersError);
  }

  const newUsers: DiscoverUser[] = (newUsersProfiles || []).map((profile: any) => {
    const userLanguages = (profile.languages || []) as UserLanguage[];
    const matchScore = calculateLanguageMatchScore(
      currentUserTeaching,
      currentUserLearning,
      userLanguages
    );

    let distance: number | undefined;
    if (userLat && userLng && profile.lat && profile.lng) {
      distance = calculateDistance(userLat, userLng, profile.lat, profile.lng);
    }

    return {
      ...profile,
      languages: userLanguages,
      matchScore,
    };
  }).filter((user: DiscoverUser) => {
    // Filter by maxDistance if location is available
    if (maxDistance && user.lat && user.lng && userLat && userLng) {
      const distance = calculateDistance(userLat, userLng, user.lat, user.lng);
      if (distance > maxDistance) return false;
    }
    
    // Filter by minimum match score
    if (minMatchScore > 0 && (user.matchScore || 0) < minMatchScore) {
      return false;
    }
    
    return true;
  });

  // ============================================================================
  // ACTIVE USERS
  // ============================================================================
  // Users active in the last 24 hours
  const oneDayAgo = new Date();
  oneDayAgo.setHours(oneDayAgo.getHours() - 24);

  let activeUsersQuery = baseQuery
    .gte('last_active_at', oneDayAgo.toISOString())
    .eq('is_online', true)
    .order('last_active_at', { ascending: false })
    .limit(limit);

  const { data: activeUsersProfiles, error: activeUsersError } = await activeUsersQuery;

  if (activeUsersError) {
    throw parseSupabaseError(activeUsersError);
  }

  const activeUsers: DiscoverUser[] = (activeUsersProfiles || []).map((profile: any) => {
    const userLanguages = (profile.languages || []) as UserLanguage[];
    const matchScore = calculateLanguageMatchScore(
      currentUserTeaching,
      currentUserLearning,
      userLanguages
    );

    let distance: number | undefined;
    if (userLat && userLng && profile.lat && profile.lng) {
      distance = calculateDistance(userLat, userLng, profile.lat, profile.lng);
    }

    return {
      ...profile,
      languages: userLanguages,
      matchScore,
    };
  }).filter((user: DiscoverUser) => {
    // Filter by maxDistance if location is available
    if (maxDistance && user.lat && user.lng && userLat && userLng) {
      const distance = calculateDistance(userLat, userLng, user.lat, user.lng);
      if (distance > maxDistance) return false;
    }
    
    // Filter by minimum match score
    if (minMatchScore > 0 && (user.matchScore || 0) < minMatchScore) {
      return false;
    }
    
    return true;
  });

  // ============================================================================
  // SESSIONS
  // ============================================================================
  // Fetch sessions with language filter
  const sessions = await sessionService.getSessions({
    language,
    startDate: new Date().toISOString(), // Only future sessions
  });

  // Limit sessions
  const limitedSessions = sessions.slice(0, limit);

  // Filter out blocked users from all user lists
  const filteredRecommendedUsers = await excludeBlockedUsers(userId, recommendedUsers);
  const filteredNewUsers = await excludeBlockedUsers(userId, newUsers);
  const filteredActiveUsers = await excludeBlockedUsers(userId, activeUsers);

  return {
    recommendedUsers: filteredRecommendedUsers.slice(0, limit),
    newUsers: filteredNewUsers.slice(0, limit),
    activeUsers: filteredActiveUsers.slice(0, limit),
    sessions: limitedSessions,
  };
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Calculate language match score (0-100)
 * Higher score = better match
 */
function calculateLanguageMatchScore(
  currentUserTeaching: string[],
  currentUserLearning: string[],
  partnerLanguages: UserLanguage[]
): number {
  if (partnerLanguages.length === 0) {
    return 0;
  }

  let matchCount = 0;
  let totalPossibleMatches = currentUserTeaching.length + currentUserLearning.length;

  if (totalPossibleMatches === 0) {
    return 50; // Neutral score if user has no languages set
  }

  const partnerTeaching = partnerLanguages
    .filter((l) => l.role === 'teaching')
    .map((l) => l.language.toLowerCase());
  const partnerLearning = partnerLanguages
    .filter((l) => l.role === 'learning')
    .map((l) => l.language.toLowerCase());

  // Check if they teach what we're learning
  for (const lang of currentUserLearning) {
    if (partnerTeaching.includes(lang)) {
      matchCount += 2; // Weight this higher (perfect match)
    }
  }

  // Check if they learn what we're teaching
  for (const lang of currentUserTeaching) {
    if (partnerLearning.includes(lang)) {
      matchCount += 1;
    }
  }

  // Calculate percentage score
  const score = Math.min(100, Math.round((matchCount / totalPossibleMatches) * 100));
  return score;
}

/**
 * Calculate distance between two coordinates (Haversine formula)
 * Returns distance in kilometers
 */
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

