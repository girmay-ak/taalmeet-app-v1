/**
 * Profile Hooks for Web
 * React Query hooks for profile operations
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import * as profileService from '../../services/profileService';
import { useAuthContext } from './useAuth';

// ============================================================================
// QUERY KEYS
// ============================================================================

export const profileKeys = {
  all: ['profile'] as const,
  current: () => [...profileKeys.all, 'current'] as const,
};

// ============================================================================
// QUERY
// ============================================================================

/**
 * Get current user's profile
 */
export function useProfile() {
  const { user } = useAuthContext();

  return useQuery({
    queryKey: profileKeys.current(),
    queryFn: profileService.getCurrentUserProfile,
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: false,
  });
}

// ============================================================================
// UPDATE PROFILE
// ============================================================================

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  const { refreshProfile } = useAuthContext();

  return useMutation({
    mutationFn: async (input: profileService.UpdateProfileInput) => {
      return profileService.updateCurrentUserProfile(input);
    },
    onSuccess: () => {
      // Invalidate profile queries
      queryClient.invalidateQueries({ queryKey: profileKeys.all });
      // Refresh profile in AuthProvider
      refreshProfile();
      toast.success('Profile updated successfully!');
    },
    onError: (error: any) => {
      const errorMessage = error?.message || 'Failed to update profile';
      toast.error(errorMessage);
    },
  });
}

// ============================================================================
// UPDATE LANGUAGES
// ============================================================================

export function useUpdateLanguages() {
  const queryClient = useQueryClient();
  const { refreshProfile, user } = useAuthContext();

  return useMutation({
    mutationFn: async (input: profileService.UpdateLanguagesInput) => {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }
      return profileService.updateUserLanguages(user.id, input);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: profileKeys.all });
      refreshProfile();
      toast.success('Languages updated successfully!');
    },
    onError: (error: any) => {
      const errorMessage = error?.message || 'Failed to update languages';
      toast.error(errorMessage);
    },
  });
}

