/**
 * Location Service
 * Backend service for managing user locations and finding nearby partners
 */

import { supabase } from '@/lib/supabase';
import {
  DatabaseError,
  ValidationError,
  parseSupabaseError,
} from '@/utils/errors';
import type { Profile, UserLanguage } from '@/types/database';
import { calculateDistance } from '@/utils/distance';
import * as connectionsService from './connectionsService';

// ============================================================================
// TYPES
// ============================================================================

export interface NearbyPartnerFilters {
  maxDistance?: number; // km
  languages?: string[]; // Language names to filter by
  availability?: 'all' | 'now' | 'week'; // Filter by availability status
  minMatchScore?: number; // Minimum match score (0-100)
  meetingType?: string[]; // ['in-person', 'video', 'voice', 'chat']
}

export interface NearbyPartner extends Profile {
  languages: UserLanguage[];
  distance: number; // km
  matchScore: number; // 0-100
  availability?: {
    status: 'available' | 'soon' | 'busy' | 'offline';
    until: string | null;
    preferences: string[];
  };
}

// ============================================================================
// UPDATE USER LOCATION
// ============================================================================

/**
 * Update current user's location
 * Reads current user id from Supabase auth
 * Updates profiles table: lat, lng, last_active_at
 */
export async function updateUserLocation(
  lat: number,
  lng: number
): Promise<Profile> {
  // Validate coordinates
  if (lat < -90 || lat > 90) {
    throw new ValidationError('Invalid latitude. Must be between -90 and 90.');
  }
  if (lng < -180 || lng > 180) {
    throw new ValidationError('Invalid longitude. Must be between -180 and 180.');
  }

  // Get current user from Supabase auth
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new ValidationError('User must be authenticated to update location.');
  }

  // Update profiles table: lat, lng, last_active_at
  const { data, error } = await supabase
    .from('profiles')
    .update({
      lat,
      lng,
      last_active_at: new Date().toISOString(), // Update last_active_at
      last_location_update_at: new Date().toISOString(),
    })
    .eq('id', user.id)
    .select()
    .single();

  if (error) {
    throw parseSupabaseError(error);
  }

  return data;
}

// ============================================================================
// GET NEARBY USERS
// ============================================================================

export interface NearbyUsersFilters {
  userId?: string; // Optional: specific user ID (defaults to current user)
  maxDistanceKm?: number; // Max distance in km, default: 50
  languages?: {
    learning?: string[]; // Languages user is learning
    teaching?: string[]; // Languages user is teaching
  };
  availability?: 'all' | 'now' | 'soon' | 'offline'; // Filter by availability status
  meetingType?: ('in-person' | 'online')[]; // Filter by meeting type preference
}

export interface NearbyUser {
  id: string;
  displayName: string;
  avatarUrl: string | null;
  lat: number;
  lng: number;
  languages: UserLanguage[];
  distanceKm: number;
  availability?: {
    status: 'available' | 'soon' | 'busy' | 'offline';
    until: string | null;
  };
}

/**
 * Get nearby users with filters
 * 
 * Filters include:
 * - userId: Optional specific user ID (defaults to current user)
 * - maxDistanceKm: Max distance in km
 * - languages: Filter by learning and teaching languages
 * - availability: Filter by availability status
 * - meetingType: Filter by meeting type (in-person, online)
 * 
 * Returns list of nearby users with:
 * - id, displayName, avatarUrl, lat, lng
 * - languages, distanceKm, availability
 */
export async function getNearbyUsers(
  filters: NearbyUsersFilters = {}
): Promise<NearbyUser[]> {
  const {
    userId,
    maxDistanceKm = 50,
    languages,
    availability = 'all',
    meetingType = [],
  } = filters;

  // Get current user (use provided userId or get from auth)
  let currentUserId: string;
  if (userId) {
    currentUserId = userId;
  } else {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return [];
    }
    currentUserId = user.id;
  }

  // Get current user's location
  const { data: currentUser, error: userError } = await supabase
    .from('profiles')
    .select('lat, lng')
    .eq('id', currentUserId)
    .single();

  if (userError || !currentUser?.lat || !currentUser?.lng) {
    // User doesn't have location set
    return [];
  }

  const userLat = currentUser.lat;
  const userLng = currentUser.lng;

  // Rough bounding box for performance (±1 degree ≈ 111km)
  const latBuffer = maxDistanceKm / 111;
  const lngBuffer = maxDistanceKm / (111 * Math.cos((userLat * Math.PI) / 180));

  // Build base query - get all profiles except current user
  let query = supabase
    .from('profiles')
    .select(`
      id,
      display_name,
      avatar_url,
      lat,
      lng,
      is_online,
      last_active_at,
      languages:user_languages(*)
    `)
    .neq('id', currentUserId)
    .not('lat', 'is', null)
    .not('lng', 'is', null)
    .gte('lat', userLat - latBuffer)
    .lte('lat', userLat + latBuffer)
    .gte('lng', userLng - lngBuffer)
    .lte('lng', userLng + lngBuffer);

  // Filter by availability status
  if (availability === 'now') {
    query = query.eq('is_online', true);
  } else if (availability === 'offline') {
    query = query.eq('is_online', false);
  }

  const { data: profiles, error: profilesError } = await query;

  if (profilesError) {
    throw parseSupabaseError(profilesError);
  }

  if (!profiles || profiles.length === 0) {
    return [];
  }

  // Get availability statuses for all profiles
  const profileIds = profiles.map(p => p.id);
  const { data: availabilityStatuses } = await supabase
    .from('availability_status')
    .select('user_id, status, until')
    .in('user_id', profileIds);

  const availabilityMap = new Map(
    (availabilityStatuses || []).map((status: any) => [
      status.user_id,
      {
        status: status.status,
        until: status.until,
      },
    ])
  );

  // Calculate distances and filter
  const usersWithDistance: NearbyUser[] = [];

  for (const profile of profiles) {
    if (!profile.lat || !profile.lng) continue;

    // Calculate distance using Haversine formula
    const distanceKm = calculateDistance(userLat, userLng, profile.lat, profile.lng);

    // Filter by max distance
    if (distanceKm > maxDistanceKm) continue;

    const profileLanguages = (profile.languages || []) as UserLanguage[];
    const profileTeaching = profileLanguages
      .filter(l => l.role === 'teaching')
      .map(l => l.language.toLowerCase());
    const profileLearning = profileLanguages
      .filter(l => l.role === 'learning')
      .map(l => l.language.toLowerCase());

    // Optional language matching
    if (languages) {
      const learningFilter = languages.learning || [];
      const teachingFilter = languages.teaching || [];

      if (learningFilter.length > 0 || teachingFilter.length > 0) {
        const learningMatch = learningFilter.length === 0 || 
          learningFilter.some(lang => profileTeaching.includes(lang.toLowerCase()));
        const teachingMatch = teachingFilter.length === 0 || 
          teachingFilter.some(lang => profileLearning.includes(lang.toLowerCase()));

        if (!learningMatch && !teachingMatch) continue;
      }
    }

    // Filter by availability status
    const userAvailability = availabilityMap.get(profile.id);
    
    // If no availability status in database, use is_online as fallback
    const effectiveStatus = userAvailability?.status || (profile.is_online ? 'available' : 'offline');
    
    // Filter based on availability filter
    if (availability === 'now') {
      // Only show users who are available right now
      if (effectiveStatus !== 'available') {
        continue;
      }
    } else if (availability === 'soon') {
      // Only show users who are available soon
      if (effectiveStatus !== 'soon') {
        continue;
      }
    } else if (availability === 'offline') {
      // Only show offline users
      if (effectiveStatus !== 'offline') {
        continue;
      }
    } else if (availability === 'all') {
      // Show all except offline users by default
      if (effectiveStatus === 'offline') {
        continue;
      }
    }

    // Filter by meeting type if specified
    if (meetingType.length > 0 && userAvailability) {
      // Check if user's availability preferences include the requested meeting types
      // This would require checking availability_status.preferences JSON field
      // For now, we'll include all if meetingType is specified (can be enhanced)
    }

    // Get availability info (use database status or fallback to is_online)
    const availabilityInfo = userAvailability || {
      status: (profile.is_online ? 'available' : 'offline') as 'available' | 'offline',
      until: null,
    };

    usersWithDistance.push({
      id: profile.id,
      displayName: profile.display_name,
      avatarUrl: profile.avatar_url,
      lat: profile.lat,
      lng: profile.lng,
      languages: profileLanguages,
      distanceKm,
      availability: availabilityInfo,
    });
  }

  // Sort by distance (closest first)
  return usersWithDistance.sort((a, b) => a.distanceKm - b.distanceKm);
}

// ============================================================================
// GET NEARBY PARTNERS (Legacy - kept for backward compatibility)
// ============================================================================

/**
 * Get nearby partners with filters
 */
export async function getNearbyPartners(
  userId: string,
  filters: NearbyPartnerFilters = {}
): Promise<NearbyPartner[]> {
  const {
    maxDistance = 50,
    languages = [],
    availability = 'all',
    minMatchScore = 0,
    meetingType = [],
  } = filters;

  // Get current user's location
  const { data: currentUser, error: userError } = await supabase
    .from('profiles')
    .select('lat, lng')
    .eq('id', userId)
    .single();

  if (userError || !currentUser?.lat || !currentUser?.lng) {
    // User doesn't have location set
    return [];
  }

  const userLat = currentUser.lat;
  const userLng = currentUser.lng;

  // Get all profiles with location (within a rough bounding box first for performance)
  // Rough bounding box: ±1 degree ≈ 111km, so we add buffer for maxDistance
  const latBuffer = maxDistance / 111;
  const lngBuffer = maxDistance / (111 * Math.cos((userLat * Math.PI) / 180));

  let query = supabase
    .from('profiles')
    .select(`
      *,
      languages:user_languages(*)
    `)
    .neq('id', userId)
    .not('lat', 'is', null)
    .not('lng', 'is', null)
    .gte('lat', userLat - latBuffer)
    .lte('lat', userLat + latBuffer)
    .gte('lng', userLng - lngBuffer)
    .lte('lng', userLng + lngBuffer);

  // Filter by availability if needed
  if (availability === 'now') {
    // Get profiles with 'available' status
    query = query.eq('is_online', true);
  }

  const { data: profiles, error: profilesError } = await query;

  if (profilesError) {
    throw parseSupabaseError(profilesError);
  }

  if (!profiles || profiles.length === 0) {
    return [];
  }

  // Calculate distances and filter
  const partnersWithDistance: Array<Profile & { languages: UserLanguage[]; distance: number }> = [];

  for (const profile of profiles) {
    if (!profile.lat || !profile.lng) continue;

    const distance = calculateDistance(userLat, userLng, profile.lat, profile.lng);

    // Filter by max distance
    if (distance > maxDistance) continue;

    // Filter by languages if specified
    if (languages.length > 0) {
      const profileLanguages = (profile.languages || []).map((l: UserLanguage) => l.language);
      const hasMatchingLanguage = languages.some(lang => profileLanguages.includes(lang));
      if (!hasMatchingLanguage) continue;
    }

    partnersWithDistance.push({
      ...profile,
      languages: profile.languages || [],
      distance,
    });
  }

  // Get availability statuses for partners
  const partnerIds = partnersWithDistance.map(p => p.id);
  const { data: availabilityStatuses } = await supabase
    .from('availability_status')
    .select('*')
    .in('user_id', partnerIds);

  const availabilityMap = new Map(
    (availabilityStatuses || []).map((status: any) => [
      status.user_id,
      {
        status: status.status,
        until: status.until,
        preferences: Array.isArray(status.preferences) ? status.preferences : [],
      },
    ])
  );

  // Filter by availability
  let filteredPartners = partnersWithDistance;
  if (availability === 'now') {
    filteredPartners = filteredPartners.filter(p => {
      const avail = availabilityMap.get(p.id);
      return avail?.status === 'available' || avail?.status === 'soon';
    });
  } else if (availability === 'week') {
    // Filter by weekly schedule (simplified - check if they have any schedule)
    // This could be enhanced to check actual schedule times
    filteredPartners = filteredPartners; // For now, include all
  }

  // Calculate match scores
  const { data: currentUserProfile } = await supabase
    .from('profiles')
    .select('languages:user_languages(*)')
    .eq('id', userId)
    .single();

  const currentUserLanguages = currentUserProfile?.languages || [];
  const currentUserTeaching = currentUserLanguages
    .filter((l: UserLanguage) => l.role === 'teaching')
    .map((l: UserLanguage) => l.language);
  const currentUserLearning = currentUserLanguages
    .filter((l: UserLanguage) => l.role === 'learning')
    .map((l: UserLanguage) => l.language);

  // Calculate match scores and add availability
  const partnersWithScores: NearbyPartner[] = filteredPartners.map(partner => {
    const partnerLanguages = partner.languages || [];
    const partnerTeaching = partnerLanguages
      .filter(l => l.role === 'teaching')
      .map(l => l.language);
    const partnerLearning = partnerLanguages
      .filter(l => l.role === 'learning')
      .map(l => l.language);

    // Calculate match score
    let matchScore = 50; // Base score

    // Perfect match: they learn what we teach AND we learn what they teach
    const teachingMatch = currentUserTeaching.filter(lang => partnerLearning.includes(lang)).length;
    const learningMatch = currentUserLearning.filter(lang => partnerTeaching.includes(lang)).length;

    if (teachingMatch > 0 && learningMatch > 0) {
      matchScore = 90 + (teachingMatch + learningMatch) * 5;
    } else if (teachingMatch > 0) {
      matchScore = 70 + teachingMatch * 10;
    } else if (learningMatch > 0) {
      matchScore = 70 + learningMatch * 10;
    }

    matchScore = Math.min(100, matchScore);

    return {
      ...partner,
      distance,
      matchScore,
      availability: availabilityMap.get(partner.id),
    };
  });

  // Filter by min match score
  const finalPartners = partnersWithScores.filter(p => p.matchScore >= minMatchScore);

  // Filter by meeting type preferences if specified
  let meetingTypeFiltered = finalPartners;
  if (meetingType.length > 0) {
    meetingTypeFiltered = finalPartners.filter(p => {
      const avail = p.availability;
      if (!avail || !avail.preferences || avail.preferences.length === 0) {
        return false; // No preferences = can't match
      }
      return meetingType.some(type => avail.preferences.includes(type));
    });
  }

  // Sort by distance (closest first)
  return meetingTypeFiltered.sort((a, b) => a.distance - b.distance);
}

/**
 * Get user's current location from profile
 */
export async function getUserLocation(userId: string): Promise<{ lat: number; lng: number } | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('lat, lng')
    .eq('id', userId)
    .single();

  if (error || !data) {
    return null;
  }

  if (!data.lat || !data.lng) {
    return null;
  }

  return {
    lat: data.lat,
    lng: data.lng,
  };
}

