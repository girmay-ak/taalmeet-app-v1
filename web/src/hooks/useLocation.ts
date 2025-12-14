/**
 * Location Hooks for Web
 * React Query hooks for location and nearby partners operations
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useAuth } from '../providers/AuthProvider';
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
  const { user } = useAuth();

  return useQuery({
    queryKey: locationKeys.nearbyUsers({ ...filters, userId: user?.id }),
    queryFn: () => locationService.getNearbyUsers({ ...filters, userId: user?.id }),
    enabled: !!user?.id,
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
  const { user } = useAuth();

  return useMutation({
    mutationFn: (location: { lat: number; lng: number }) => 
      locationService.updateUserLocation(location.lat, location.lng),
    onSuccess: () => {
      // Invalidate location-related queries
      queryClient.invalidateQueries({ queryKey: locationKeys.all });
      if (user?.id) {
        queryClient.invalidateQueries({ queryKey: locationKeys.userLocation(user.id) });
      }
    },
    onError: (error) => {
      const message = getUserFriendlyMessage(error);
      toast.error('Failed to update location', {
        description: message,
      });
    },
  });
}

