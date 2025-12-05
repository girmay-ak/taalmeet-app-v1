/**
 * Web Authentication Hooks
 * Uses shared auth service with web-compatible error handling
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import * as authService from '@/shared/services/authService';
import * as profileService from '@/shared/services/profileService';
import { useAuth as useAuthContext } from '../providers/AuthProvider';
import type { SignInInput, FullSignupInput } from '@/shared/utils/validators';

// Re-export the context hook
export { useAuthContext as useAuth };

/**
 * Sign in mutation
 */
export function useSignIn() {
  const queryClient = useQueryClient();
  const { refreshProfile } = useAuthContext();

  return useMutation({
    mutationFn: (input: SignInInput) => authService.signIn(input),
    onSuccess: async () => {
      // Invalidate auth queries
      queryClient.invalidateQueries({ queryKey: ['auth'] });
      // Refresh profile
      await refreshProfile();
    },
    onError: (error: any) => {
      console.error('Sign in error:', error);
      // Error will be handled by the component
    },
  });
}

/**
 * Sign up mutation
 */
export function useSignUp() {
  const queryClient = useQueryClient();
  const { refreshProfile } = useAuthContext();

  return useMutation({
    mutationFn: async (input: FullSignupInput) => {
      // Create auth user
      const authResult = await authService.signUp(
        input.email,
        input.password,
        input.fullName
      );

      // Create profile
      await profileService.createProfile({
        userId: authResult.user!.id,
        displayName: input.fullName,
        city: input.city,
        country: input.country,
        lat: input.lat,
        lng: input.lng,
        bio: input.bio,
        avatarUrl: input.avatarUrl,
      });

      // Add languages
      if (input.languages && input.languages.length > 0) {
        await profileService.updateLanguages({
          languages: input.languages.map((lang) => ({
            language: lang.language,
            level: lang.level,
            role: lang.role,
          })),
        });
      }

      return authResult;
    },
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ['auth'] });
      await refreshProfile();
    },
    onError: (error: any) => {
      console.error('Sign up error:', error);
    },
  });
}

