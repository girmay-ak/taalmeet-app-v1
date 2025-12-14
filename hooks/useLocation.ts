/**
 * Location Hooks
 * React Query hooks for location and nearby partners operations
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Alert } from 'react-native';
import * as locationService from '@/services/locationService';
import * as locationServiceOptimized from '@/services/locationServiceOptimized';
import { getUserFriendlyMessage } from '@/utils/errors';
import type { NearbyPartnerFilters, NearbyUsersFilters } from '@/services/locationService';
import { useSession } from './useAuth';

// ============================================================================
// QUERY KEYS
// ============================================================================

export const locationKeys = {
  all: ['location'] as const,
  userLocation: (userId: string) => [...locationKeys.all, 'user', userId] as const,
  nearbyUsers: (filters: NearbyUsersFilters) => 
    ['nearbyUsers', filters] as const,
  nearbyPartners: (userId: string, filters: NearbyPartnerFilters) => 
    [...locationKeys.all, 'nearby', userId, JSON.stringify(filters)] as const,
};

// ============================================================================
// QUERIES
// ============================================================================

/**
 * Get nearby users with filters
 * React Query hook with key: ['nearbyUsers', filters]
 * Refetches every 10 seconds for real-time updates
 */
export function useNearbyUsers(filters: NearbyUsersFilters = {}) {
  // Get current user ID from auth
  const { data: session } = useSession();
  const currentUserId = session?.user?.id;

  return useQuery({
    queryKey: locationKeys.nearbyUsers({ ...filters, userId: currentUserId }),
    queryFn: () => {
      // Explicitly exclude current user ID
      const userId = currentUserId || undefined;
      return locationService.getNearbyUsers({ ...filters, userId });
    },
    enabled: !!currentUserId, // Only run query if user is authenticated
    staleTime: 5 * 1000, // 5 seconds
    refetchInterval: 10 * 1000, // Refetch every 10 seconds
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    // Handle network errors gracefully
    retry: (failureCount, error) => {
      // Check if it's a network error
      const isNetworkErr = error instanceof Error && (
        error.message.includes('Network request failed') ||
        error.message.includes('network') ||
        error.message.includes('fetch')
      );
      // Retry network errors up to 2 times
      return isNetworkErr && failureCount < 2;
    },
    // Don't throw errors, handle them in component
    throwOnError: false,
  });
}

/**
 * Get user's current location
 */
export function useUserLocation(userId: string | undefined) {
  return useQuery({
    queryKey: locationKeys.userLocation(userId || ''),
    queryFn: () => (userId ? locationService.getUserLocation(userId) : null),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Get nearby partners with filters
 */
export function useNearbyPartners(
  userId: string | undefined,
  filters: NearbyPartnerFilters = {}
) {
  return useQuery({
    queryKey: locationKeys.nearbyPartners(userId || '', filters),
    queryFn: () => (userId ? locationService.getNearbyPartners(userId, filters) : []),
    enabled: !!userId,
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60 * 1000, // Refetch every minute for real-time updates
  });
}

// ============================================================================
// MUTATIONS
// ============================================================================

/**
 * Update current user's location mutation
 * Automatically uses current authenticated user
 */
export function useUpdateUserLocation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      lat,
      lng,
    }: {
      lat: number;
      lng: number;
    }) => {
      return locationService.updateUserLocation(lat, lng);
    },
    onSuccess: () => {
      // Invalidate all location queries
      queryClient.invalidateQueries({ queryKey: locationKeys.all });
      queryClient.invalidateQueries({ queryKey: ['nearbyUsers'] });
    },
    onError: (error) => {
      // Only show alert for non-network errors
      const isNetworkErr = error instanceof Error && (
        error.message.includes('Network request failed') ||
        error.message.includes('network') ||
        error.message.includes('fetch')
      );
      
      if (!isNetworkErr) {
        const message = getUserFriendlyMessage(error);
        Alert.alert('Update Failed', message);
      }
      // Network errors are handled silently - location will retry automatically
    },
    // Don't throw errors, handle them in onError
    throwOnError: false,
  });
}

// ============================================================================
// OPTIMIZED HOOKS (High Performance)
// ============================================================================

/**
 * Optimized nearby users with viewport-based filtering and caching
 * Use this instead of useNearbyUsers for better performance
 */
export function useNearbyUsersOptimized(
  filters: NearbyUsersFilters & {
    viewport?: { north: number; south: number; east: number; west: number };
  } = {}
) {
  const { data: session } = useSession();
  const currentUserId = session?.user?.id;

  return useQuery({
    queryKey: ['nearbyUsersOptimized', { ...filters, userId: currentUserId }],
    queryFn: () => locationServiceOptimized.getNearbyUsersOptimized({ 
      ...filters, 
      userId: currentUserId 
    }),
    enabled: !!currentUserId,
    staleTime: 30 * 1000, // 30 seconds (matches cache)
    refetchInterval: 10 * 1000, // 10 seconds
    refetchOnMount: false,
    keepPreviousData: true, // Smooth transitions
  });
}

/**
 * Optimized location update with batching
 * Updates are batched every 2 seconds for performance
 */
export function useUpdateUserLocationOptimized() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ lat, lng }: { lat: number; lng: number }) => {
      return locationServiceOptimized.updateUserLocationOptimized(lat, lng);
    },
    onSuccess: () => {
      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ['nearbyUsersOptimized'] });
      queryClient.invalidateQueries({ queryKey: ['nearbyUsers'] });
    },
    onError: (error) => {
      const message = getUserFriendlyMessage(error);
      console.error('Optimized location update failed:', message);
      // Silent fail - location updates are not critical
    },
  });
}

