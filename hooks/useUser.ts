/**
 * User Profile Hooks
 * Clean, production-ready React Query hooks for user operations
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Alert } from 'react-native';
import * as userService from '@/services/userService';
import * as storageService from '@/services/storageService';
import { getUserFriendlyMessage } from '@/utils/errors';
import type { Language, TeachingLanguage } from '@/utils/validators';
import { authKeys } from './useAuth';

// ============================================================================
// QUERY KEYS
// ============================================================================

export const userKeys = {
  all: ['user'] as const,
  profile: (userId?: string) => [...userKeys.all, 'profile', userId] as const,
  currentProfile: () => [...userKeys.all, 'currentProfile'] as const,
  languages: (userId: string) => [...userKeys.all, 'languages', userId] as const,
};

// ============================================================================
// PROFILE QUERIES
// ============================================================================

/**
 * Get current user's profile
 */
export function useProfile() {
  return useQuery({
    queryKey: userKeys.currentProfile(),
    queryFn: userService.getCurrentUserProfile,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Get a specific user's profile
 */
export function useUserProfile(userId: string | undefined) {
  return useQuery({
    queryKey: userKeys.profile(userId),
    queryFn: async () => {
      if (!userId) {
        console.warn('[useUserProfile] No userId provided');
        return null;
      }
      console.log('[useUserProfile] Fetching profile for userId:', userId);
      try {
        const profile = await userService.getProfileWithLanguages(userId);
        if (!profile) {
          console.warn('[useUserProfile] Profile not found for userId:', userId);
        }
        return profile;
      } catch (error) {
        console.error('[useUserProfile] Error fetching profile:', {
          userId,
          error: error instanceof Error ? error.message : String(error),
        });
        throw error;
      }
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
    retry: 1, // Retry once on failure
  });
}

/**
 * Get user's languages
 */
export function useUserLanguages(userId: string | undefined) {
  return useQuery({
    queryKey: userKeys.languages(userId || ''),
    queryFn: () => (userId ? userService.getLanguages(userId) : []),
    enabled: !!userId,
  });
}

// ============================================================================
// PROFILE MUTATIONS
// ============================================================================

/**
 * Update profile mutation
 */
export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userId,
      data,
    }: {
      userId: string;
      data: userService.UpdateProfileInput;
    }) => {
      return userService.updateProfile(userId, data);
    },
    onSuccess: (_, variables) => {
      // Invalidate profile queries
      queryClient.invalidateQueries({ queryKey: userKeys.profile(variables.userId) });
      queryClient.invalidateQueries({ queryKey: userKeys.currentProfile() });
    },
    onError: (error) => {
      const message = getUserFriendlyMessage(error);
      Alert.alert('Update Failed', message);
    },
  });
}

/**
 * Update avatar mutation
 */
export function useUpdateAvatar() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, fileUri }: { userId: string; fileUri: string }) => {
      // Upload new avatar
      const result = await storageService.uploadAvatar(userId, fileUri);
      
      // Update profile with new avatar URL
      await userService.updateProfile(userId, { avatarUrl: result.publicUrl });
      
      return result.publicUrl;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: userKeys.profile(variables.userId) });
      queryClient.invalidateQueries({ queryKey: userKeys.currentProfile() });
    },
    onError: (error) => {
      const message = getUserFriendlyMessage(error);
      Alert.alert('Upload Failed', message);
    },
  });
}

/**
 * Remove avatar mutation
 */
export function useRemoveAvatar() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId }: { userId: string }) => {
      // Delete all avatars for user
      await storageService.deleteUserAvatars(userId);
      
      // Update profile to remove avatar URL
      await userService.updateProfile(userId, { avatarUrl: null });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: userKeys.profile(variables.userId) });
      queryClient.invalidateQueries({ queryKey: userKeys.currentProfile() });
    },
    onError: (error) => {
      const message = getUserFriendlyMessage(error);
      Alert.alert('Remove Failed', message);
    },
  });
}

// ============================================================================
// LANGUAGE MUTATIONS
// ============================================================================

/**
 * Save languages mutation
 */
export function useSaveLanguages() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userId,
      learning,
      teaching,
    }: {
      userId: string;
      learning: Language[];
      teaching: TeachingLanguage;
    }) => {
      return userService.saveLanguages(userId, { learning, teaching });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: userKeys.languages(variables.userId) });
      queryClient.invalidateQueries({ queryKey: userKeys.profile(variables.userId) });
      queryClient.invalidateQueries({ queryKey: userKeys.currentProfile() });
    },
    onError: (error) => {
      const message = getUserFriendlyMessage(error);
      Alert.alert('Save Failed', message);
    },
  });
}

// ============================================================================
// LOCATION MUTATION
// ============================================================================

/**
 * Update location mutation
 */
export function useUpdateLocation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userId,
      city,
      country,
    }: {
      userId: string;
      city: string;
      country: string;
    }) => {
      return userService.updateLocation(userId, city, country);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: userKeys.profile(variables.userId) });
      queryClient.invalidateQueries({ queryKey: userKeys.currentProfile() });
    },
    onError: (error) => {
      const message = getUserFriendlyMessage(error);
      Alert.alert('Update Failed', message);
    },
  });
}

// ============================================================================
// ONLINE STATUS
// ============================================================================

/**
 * Set online status mutation
 */
export function useSetOnlineStatus() {
  return useMutation({
    mutationFn: async ({ userId, isOnline }: { userId: string; isOnline: boolean }) => {
      return userService.setOnlineStatus(userId, isOnline);
    },
  });
}

// ============================================================================
// USERNAME CHECK
// ============================================================================

/**
 * Check username availability
 */
export function useCheckUsername() {
  return useMutation({
    mutationFn: (username: string) => userService.isUsernameAvailable(username),
  });
}

// ============================================================================
// DELETE ACCOUNT
// ============================================================================

/**
 * Delete account mutation
 */
export function useDeleteAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: string) => {
      // Delete avatar files
      await storageService.deleteUserAvatars(userId);
      
      // Delete user data
      await userService.deleteAccount(userId);
    },
    onSuccess: () => {
      queryClient.clear();
    },
    onError: (error) => {
      const message = getUserFriendlyMessage(error);
      Alert.alert('Delete Failed', message);
    },
  });
}

