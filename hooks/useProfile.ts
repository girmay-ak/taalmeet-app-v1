/**
 * Profile Hooks
 * React Query hooks for profile operations using new profiles table
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { Alert } from 'react-native';
import { useAuth } from '@/providers';
import * as profileService from '@/services/profileService';
import { getUserFriendlyMessage } from '@/utils/errors';
import type { UpdateProfileInput, UpdateLanguagesInput } from '@/services/profileService';
import { authLogger } from '@/utils/logger';

// ============================================================================
// QUERY KEYS
// ============================================================================

export const profileKeys = {
  all: ['profile'] as const,
  current: () => ['currentUser'] as const, // Use ['currentUser'] as specified
  detail: (userId: string) => [...profileKeys.all, 'detail', userId] as const,
  languages: (userId: string) => [...profileKeys.all, 'languages', userId] as const,
};

// ============================================================================
// QUERIES
// ============================================================================

/**
 * Get current user's profile with languages
 * Auto-refetches when session changes
 * 
 * @returns { data, isLoading, error }
 * - data: ProfileWithLanguages | null (includes name, avatar, city, country, bio, languages)
 * - isLoading: boolean
 * - error: Error | null
 */
export function useCurrentUser() {
  const { session } = useAuth();
  const queryClient = useQueryClient();
  
  const query = useQuery({
    queryKey: profileKeys.current(),
    queryFn: profileService.getCurrentUserProfile,
    enabled: !!session, // Only fetch when session exists
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: false,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });

  // Auto-refetch when session changes
  useEffect(() => {
    if (session?.user?.id) {
      // Session exists, refetch profile
      queryClient.invalidateQueries({ queryKey: profileKeys.current() });
    } else {
      // Session cleared, remove cached data
      queryClient.setQueryData(profileKeys.current(), null);
    }
  }, [session?.user?.id, queryClient]);

  return query;
}

/**
 * Get a specific user's profile
 */
export function useUserProfile(userId: string | undefined) {
  return useQuery({
    queryKey: profileKeys.detail(userId || ''),
    queryFn: () => (userId ? profileService.getProfileWithLanguages(userId) : null),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Get user's languages
 */
export function useUserLanguages(userId: string | undefined) {
  return useQuery({
    queryKey: profileKeys.languages(userId || ''),
    queryFn: () => (userId ? profileService.getUserLanguages(userId) : []),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
  });
}

// ============================================================================
// MUTATIONS
// ============================================================================

/**
 * Update profile mutation
 * Can be used with userId or without (uses current user)
 */
export function useUpdateProfile() {
  const queryClient = useQueryClient();
  const { profile } = useAuth();

  return useMutation({
    mutationFn: async ({
      userId,
      data,
    }: {
      userId?: string;
      data: UpdateProfileInput;
    }) => {
      // If userId not provided, use current user
      if (userId) {
        return profileService.updateProfile(userId, data);
      } else {
        return profileService.updateCurrentUserProfile(data);
      }
    },
    onSuccess: async (_, variables) => {
      // Invalidate profile queries
      const userId = variables.userId || profile?.id;
      if (userId) {
        queryClient.invalidateQueries({ queryKey: profileKeys.detail(userId) });
      }
      queryClient.invalidateQueries({ queryKey: profileKeys.current() });
      // Also invalidate AuthProvider profile
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
      
      // Log profile update
      if (userId) {
        const updatedFields = Object.keys(variables.data).filter(
          key => variables.data[key as keyof UpdateProfileInput] !== undefined
        );
        authLogger.profileUpdate(userId, updatedFields);
      }
      
      // Refetch current user profile to update AuthProvider
      await queryClient.refetchQueries({ queryKey: profileKeys.current() });
    },
    onError: (error) => {
      const message = getUserFriendlyMessage(error);
      Alert.alert('Update Failed', message);
    },
  });
}

/**
 * Update user languages mutation
 */
export function useUpdateUserLanguages() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userId,
      data,
    }: {
      userId: string;
      data: UpdateLanguagesInput;
    }) => {
      return profileService.updateUserLanguages(userId, data);
    },
    onSuccess: (_, variables) => {
      // Invalidate language and profile queries
      queryClient.invalidateQueries({ queryKey: profileKeys.languages(variables.userId) });
      queryClient.invalidateQueries({ queryKey: profileKeys.detail(variables.userId) });
      queryClient.invalidateQueries({ queryKey: profileKeys.current() });
    },
    onError: (error) => {
      const message = getUserFriendlyMessage(error);
      Alert.alert('Update Failed', message);
    },
  });
}

/**
 * Set online status mutation
 */
export function useSetOnlineStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, isOnline }: { userId: string; isOnline: boolean }) => {
      return profileService.setOnlineStatus(userId, isOnline);
    },
    onSuccess: (_, variables) => {
      // Invalidate profile queries to reflect online status
      queryClient.invalidateQueries({ queryKey: profileKeys.detail(variables.userId) });
      queryClient.invalidateQueries({ queryKey: profileKeys.current() });
    },
  });
}

