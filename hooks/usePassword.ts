/**
 * Password Hooks
 * React Query hooks for password operations
 */

import { useMutation } from '@tanstack/react-query';
import { Alert } from 'react-native';
import * as authService from '@/services/authService';
import { getUserFriendlyMessage } from '@/utils/errors';

// ============================================================================
// CHANGE PASSWORD
// ============================================================================

export function useChangePassword() {
  return useMutation({
    mutationFn: async (newPassword: string) => {
      return authService.updatePassword(newPassword);
    },
    onError: (error) => {
      const message = getUserFriendlyMessage(error);
      Alert.alert('Password Update Failed', message);
    },
  });
}

