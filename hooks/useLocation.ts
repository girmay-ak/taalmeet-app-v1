/**
 * Location Hooks
 * React Query hooks for location and nearby partners operations
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Alert } from 'react-native';
import * as locationService from '@/services/locationService';
import { getUserFriendlyMessage } from '@/utils/errors';
import type { NearbyPartnerFilters, NearbyUsersFilters } from '@/services/locationService';

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
  return useQuery({
    queryKey: locationKeys.nearbyUsers(filters),
    queryFn: () => locationService.getNearbyUsers(filters),
    staleTime: 5 * 1000, // 5 seconds
    refetchInterval: 10 * 1000, // Refetch every 10 seconds
    refetchOnMount: true,
    refetchOnWindowFocus: true,
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
      const message = getUserFriendlyMessage(error);
      Alert.alert('Update Failed', message);
    },
  });
}

