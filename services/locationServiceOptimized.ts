/**
 * Optimized Location Service
 * High-performance location service with advanced caching and batching
 */

import { supabase } from '@/lib/supabase';
import {
  DatabaseError,
  ValidationError,
  RecordNotFoundError,
  parseSupabaseError,
} from '@/utils/errors';
import type { Profile, UserLanguage } from '@/types/database';
import { calculateDistance } from '@/utils/distance';
import type { NearbyUsersFilters, NearbyUser } from './locationService';

// ============================================================================
// CONFIGURATION
// ============================================================================

const CACHE_CONFIG = {
  // Cache duration for different data types
  NEARBY_USERS_CACHE_MS: 30000, // 30 seconds
  USER_LOCATION_CACHE_MS: 60000, // 1 minute
  
  // Batch update settings
  BATCH_UPDATE_INTERVAL_MS: 2000, // 2 seconds
  MAX_BATCH_SIZE: 10,
  
  // Performance limits
  MAX_USERS_TO_FETCH: 500,
  MAX_DISTANCE_KM: 100,
  
  // Viewport settings
  VIEWPORT_BUFFER_PERCENT: 0.15, // 15% buffer around viewport
};

// ============================================================================
// IN-MEMORY CACHE
// ============================================================================

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

class LocationCache {
  private cache = new Map<string, CacheEntry<any>>();

  set<T>(key: string, data: T, ttl: number): void {
    const now = Date.now();
    this.cache.set(key, {
      data,
      timestamp: now,
      expiresAt: now + ttl,
    });
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    const now = Date.now();
    if (now > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  invalidate(key: string): void {
    this.cache.delete(key);
  }

  invalidatePattern(pattern: string): void {
    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key);
      }
    }
  }

  clear(): void {
    this.cache.clear();
  }

  getStats() {
    const now = Date.now();
    const entries = Array.from(this.cache.entries());
    return {
      total: entries.length,
      expired: entries.filter(([_, entry]) => now > entry.expiresAt).length,
      valid: entries.filter(([_, entry]) => now <= entry.expiresAt).length,
      size: entries.reduce((sum, [key]) => sum + key.length, 0),
    };
  }
}

const cache = new LocationCache();

// ============================================================================
// BATCH UPDATE MANAGER
// ============================================================================

interface LocationUpdate {
  lat: number;
  lng: number;
  timestamp: number;
}

class BatchUpdateManager {
  private pendingUpdates = new Map<string, LocationUpdate>();
  private updateTimer: NodeJS.Timeout | null = null;
  private isProcessing = false;

  schedule(userId: string, lat: number, lng: number): void {
    // Store the update
    this.pendingUpdates.set(userId, {
      lat,
      lng,
      timestamp: Date.now(),
    });

    // Schedule batch processing
    if (!this.updateTimer && !this.isProcessing) {
      this.updateTimer = setTimeout(
        () => this.processBatch(),
        CACHE_CONFIG.BATCH_UPDATE_INTERVAL_MS
      );
    }
  }

  private async processBatch(): Promise<void> {
    if (this.isProcessing || this.pendingUpdates.size === 0) return;

    this.isProcessing = true;
    this.updateTimer = null;

    try {
      const updates = Array.from(this.pendingUpdates.entries());
      this.pendingUpdates.clear();

      console.log(`[BatchUpdateManager] Processing ${updates.length} location updates`);

      // Process in batches to avoid overwhelming the database
      const batches = [];
      for (let i = 0; i < updates.length; i += CACHE_CONFIG.MAX_BATCH_SIZE) {
        batches.push(updates.slice(i, i + CACHE_CONFIG.MAX_BATCH_SIZE));
      }

      for (const batch of batches) {
        await this.processSingleBatch(batch);
      }

      console.log('[BatchUpdateManager] Batch processing complete');
    } catch (error) {
      console.error('[BatchUpdateManager] Error processing batch:', error);
    } finally {
      this.isProcessing = false;

      // If more updates came in while processing, schedule another batch
      if (this.pendingUpdates.size > 0 && !this.updateTimer) {
        this.updateTimer = setTimeout(
          () => this.processBatch(),
          CACHE_CONFIG.BATCH_UPDATE_INTERVAL_MS
        );
      }
    }
  }

  private async processSingleBatch(
    batch: Array<[string, LocationUpdate]>
  ): Promise<void> {
    // Update all locations in parallel
    await Promise.all(
      batch.map(async ([userId, update]) => {
        try {
          await supabase
            .from('profiles')
            .update({
              lat: update.lat,
              lng: update.lng,
              last_active_at: new Date(update.timestamp).toISOString(),
              last_location_update_at: new Date(update.timestamp).toISOString(),
            })
            .eq('id', userId);

          // Invalidate cache for this user
          cache.invalidate(`userLocation:${userId}`);
        } catch (error) {
          console.error(`[BatchUpdateManager] Error updating location for user ${userId}:`, error);
        }
      })
    );
  }

  getStats() {
    return {
      pending: this.pendingUpdates.size,
      isProcessing: this.isProcessing,
      hasScheduledUpdate: !!this.updateTimer,
    };
  }
}

const batchManager = new BatchUpdateManager();

// ============================================================================
// OPTIMIZED LOCATION UPDATES
// ============================================================================

/**
 * Update user location (batched for performance)
 */
export async function updateUserLocationOptimized(
  lat: number,
  lng: number
): Promise<void> {
  // Validate coordinates
  if (isNaN(lat) || isNaN(lng)) {
    throw new ValidationError('Invalid coordinates provided');
  }
  if (lat < -90 || lat > 90) {
    throw new ValidationError('Invalid latitude. Must be between -90 and 90.');
  }
  if (lng < -180 || lng > 180) {
    throw new ValidationError('Invalid longitude. Must be between -180 and 180.');
  }

  // Get current user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new ValidationError('User must be authenticated to update location.');
  }

  // Schedule batched update (non-blocking)
  batchManager.schedule(user.id, lat, lng);

  // Update local cache immediately for instant UI updates
  cache.set(
    `userLocation:${user.id}`,
    { lat, lng },
    CACHE_CONFIG.USER_LOCATION_CACHE_MS
  );
}

// ============================================================================
// OPTIMIZED NEARBY USERS QUERY
// ============================================================================

/**
 * Get nearby users with advanced caching and viewport optimization
 */
export async function getNearbyUsersOptimized(
  filters: NearbyUsersFilters & {
    viewport?: {
      north: number;
      south: number;
      east: number;
      west: number;
    };
  } = {}
): Promise<NearbyUser[]> {
  const {
    userId,
    maxDistanceKm = 50,
    languages,
    availability = 'all',
    viewport,
  } = filters;

  // Get current user
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

  // Check cache first
  const cacheKey = `nearbyUsers:${currentUserId}:${JSON.stringify(filters)}`;
  const cachedData = cache.get<NearbyUser[]>(cacheKey);
  if (cachedData) {
    console.log('[getNearbyUsersOptimized] Cache hit:', cacheKey);
    return cachedData;
  }

  // Get current user's location
  const { data: currentUser, error: userError } = await supabase
    .from('profiles')
    .select('lat, lng')
    .eq('id', currentUserId)
    .single();

  if (userError || !currentUser?.lat || !currentUser?.lng) {
    return [];
  }

  const userLat = currentUser.lat;
  const userLng = currentUser.lng;

  // Calculate bounding box
  // If viewport is provided, use it (with buffer); otherwise use maxDistance
  let latMin, latMax, lngMin, lngMax;

  if (viewport) {
    // Use viewport with buffer
    const latBuffer = (viewport.north - viewport.south) * CACHE_CONFIG.VIEWPORT_BUFFER_PERCENT;
    const lngBuffer = (viewport.east - viewport.west) * CACHE_CONFIG.VIEWPORT_BUFFER_PERCENT;
    
    latMin = viewport.south - latBuffer;
    latMax = viewport.north + latBuffer;
    lngMin = viewport.west - lngBuffer;
    lngMax = viewport.east + lngBuffer;
  } else {
    // Use maxDistance
    const latBuffer = maxDistanceKm / 111;
    const lngBuffer = maxDistanceKm / (111 * Math.cos((userLat * Math.PI) / 180));
    
    latMin = userLat - latBuffer;
    latMax = userLat + latBuffer;
    lngMin = userLng - lngBuffer;
    lngMax = userLng + lngBuffer;
  }

  // Build optimized query
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
    .gte('lat', latMin)
    .lte('lat', latMax)
    .gte('lng', lngMin)
    .lte('lng', lngMax)
    .limit(CACHE_CONFIG.MAX_USERS_TO_FETCH);

  // Filter by availability
  if (availability === 'now') {
    query = query.eq('is_online', true);
  } else if (availability === 'offline') {
    query = query.eq('is_online', false);
  }

  // Execute query
  const { data: profiles, error: profilesError } = await query;

  if (profilesError) {
    throw parseSupabaseError(profilesError);
  }

  if (!profiles || profiles.length === 0) {
    cache.set(cacheKey, [], CACHE_CONFIG.NEARBY_USERS_CACHE_MS);
    return [];
  }

  // Get availability statuses (batch query)
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

  // Process and filter users
  const usersWithDistance: NearbyUser[] = [];

  for (const profile of profiles) {
    // Exclude current user (safety check)
    if (profile.id === currentUserId) continue;
    if (!profile.lat || !profile.lng) continue;

    // Calculate distance
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

    // Language filtering
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

    // Availability filtering
    const userAvailability = availabilityMap.get(profile.id);
    const effectiveStatus = userAvailability?.status || (profile.is_online ? 'available' : 'offline');
    
    if (availability === 'now' && effectiveStatus !== 'available') continue;
    if (availability === 'soon' && effectiveStatus !== 'soon') continue;
    if (availability === 'offline' && effectiveStatus !== 'offline') continue;

    // Add to results
    usersWithDistance.push({
      id: profile.id,
      displayName: profile.display_name,
      avatarUrl: profile.avatar_url,
      lat: profile.lat,
      lng: profile.lng,
      languages: profileLanguages,
      distanceKm,
      availability: userAvailability || {
        status: effectiveStatus as any,
        until: null,
      },
    });
  }

  // Sort by distance
  const sortedUsers = usersWithDistance.sort((a, b) => a.distanceKm - b.distanceKm);

  // Cache results
  cache.set(cacheKey, sortedUsers, CACHE_CONFIG.NEARBY_USERS_CACHE_MS);

  console.log(`[getNearbyUsersOptimized] Found ${sortedUsers.length} nearby users (cached)`);

  return sortedUsers;
}

// ============================================================================
// CACHE MANAGEMENT
// ============================================================================

/**
 * Invalidate all location caches
 */
export function invalidateLocationCache(): void {
  cache.invalidatePattern('nearbyUsers');
  cache.invalidatePattern('userLocation');
}

/**
 * Get cache statistics
 */
export function getCacheStats() {
  return {
    cache: cache.getStats(),
    batchManager: batchManager.getStats(),
  };
}

/**
 * Clear all caches
 */
export function clearAllCaches(): void {
  cache.clear();
}


