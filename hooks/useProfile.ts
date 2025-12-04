/**
 * Profile Hooks
 * React Query hooks for profile operations
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Alert } from 'react-native';
import * as profileService from '@/services/profileService';
import { getUserFriendlyMessage } from '@/utils/errors';
import { currentUserKeys } from './useCurrentUser';

// ============================================================================
// UPDATE PROFILE
// ============================================================================

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: profileService.UpdateProfileInput) => {
      return profileService.updateCurrentUserProfile(input);
    },
    onSuccess: () => {
      // Invalidate current user query to refetch updated profile
      queryClient.invalidateQueries({ queryKey: currentUserKeys.all });
      // Also invalidate profile in AuthProvider
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
    onError: (error) => {
      const message = getUserFriendlyMessage(error);
      Alert.alert('Update Failed', message);
    },
  });
}
