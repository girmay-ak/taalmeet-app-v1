/**
 * Authentication Hooks
 * Clean, production-ready React Query hooks for auth
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { Alert } from 'react-native';
import * as authService from '@/services/authService';
import * as profileService from '@/services/profileService';
import * as storageService from '@/services/storageService';
import { getUserFriendlyMessage, isAppError } from '@/utils/errors';
import { authLogger } from '@/utils/logger';
import type { SignInInput, FullSignupInput, Language, TeachingLanguage } from '@/utils/validators';

// ============================================================================
// QUERY KEYS
// ============================================================================

export const authKeys = {
  all: ['auth'] as const,
  session: () => [...authKeys.all, 'session'] as const,
  user: () => [...authKeys.all, 'user'] as const,
};

// ============================================================================
// SESSION QUERY
// ============================================================================

/**
 * Get current session
 */
export function useSession() {
  return useQuery({
    queryKey: authKeys.session(),
    queryFn: authService.getSession,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: false,
  });
}

/**
 * Get current authenticated user
 */
export function useCurrentUser() {
  return useQuery({
    queryKey: authKeys.user(),
    queryFn: authService.getCurrentUser,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });
}

// ============================================================================
// SIGN IN
// ============================================================================

/**
 * Sign in mutation
 */
export function useSignIn() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: SignInInput) => authService.signIn(input),
    onSuccess: () => {
      // Invalidate and refetch auth data
      queryClient.invalidateQueries({ queryKey: authKeys.all });
      
      // Navigate to main app
      router.replace('/(tabs)');
    },
    onError: (error) => {
      const message = getUserFriendlyMessage(error);
      Alert.alert('Sign In Failed', message);
    },
  });
}

// ============================================================================
// SIGN UP (Basic - auth only)
// ============================================================================

/**
 * Basic sign up mutation (creates auth user only)
 */
export function useSignUp() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: { email: string; password: string; name: string }) => {
      return authService.signUp(input.email, input.password, input.name);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: authKeys.all });
      
      if (data.needsEmailVerification) {
        Alert.alert(
          'Verify Your Email',
          'Please check your email and click the verification link to continue.',
          [{ text: 'OK' }]
        );
      }
    },
    onError: (error) => {
      const message = getUserFriendlyMessage(error);
      Alert.alert('Sign Up Failed', message);
    },
  });
}

// ============================================================================
// FULL SIGN UP (Multi-step with profile)
// ============================================================================

interface FullSignUpInput {
  name: string;
  email: string;
  password: string;
  learning?: Language[];
  teaching?: TeachingLanguage;
  city?: string;
  country?: string;
  bio?: string;
  interests?: string[];
  avatar?: string; // Local URI
}

/**
 * Full sign up mutation (creates auth user + profile)
 * Use this at the END of SignupStep4
 */
export function useFullSignUp() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: FullSignUpInput) => {
      try {
        // Step 1: Create auth user
        const authResult = await authService.signUp(
          input.email,
          input.password,
          input.name
        );

        if (!authResult.user) {
          throw new Error('Failed to create account');
        }

        const userId = authResult.user.id;

        // Log sign up attempt
        authLogger.signUp(input.email, true, userId);

        // Step 2: Upload avatar if provided
        let avatarUrl: string | undefined;
        if (input.avatar) {
          try {
            const uploadResult = await storageService.uploadAvatar(userId, input.avatar);
            avatarUrl = uploadResult.publicUrl;
          } catch (error) {
            console.error('Avatar upload failed:', error);
            // Continue without avatar
          }
        }

        // Step 3: Create user profile in profiles table
        await profileService.createProfile({
          userId,
          displayName: input.name,
          avatarUrl,
          bio: input.bio,
          city: input.city,
          country: input.country,
        });

        // Log profile creation
        authLogger.profileCreated(userId, input.email);

        // Step 4: Save languages
        if (input.learning && input.teaching) {
          const languages = [
            // Add learning languages
            ...input.learning.map(lang => ({
              language: lang.name,
              level: null as const,
              role: 'learning' as const,
            })),
            // Add teaching language
            {
              language: input.teaching.name,
              level: input.teaching.level as 'native' | 'advanced' | 'intermediate' | 'beginner' | null,
              role: 'teaching' as const,
            },
          ];

          await profileService.updateUserLanguages(userId, { languages });
        }

        return authResult;
      } catch (error: any) {
        // Log failed sign up
        authLogger.signUp(input.email, false, undefined, error?.message || 'Unknown error');
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: authKeys.all });
    },
    onError: (error) => {
      const message = getUserFriendlyMessage(error);
      const isUserExistsError = isAppError(error) && error.code === 'USER_ALREADY_EXISTS';
      
      Alert.alert(
        'Sign Up Failed',
        message,
        isUserExistsError
          ? [
              {
                text: 'Go to Sign In',
                onPress: () => router.replace('/(auth)/sign-in'),
                style: 'default' as const,
              },
              {
                text: 'OK',
                style: 'cancel' as const,
              },
            ]
          : [{ text: 'OK' }]
      );
    },
  });
}

// ============================================================================
// SIGN OUT
// ============================================================================

/**
 * Sign out mutation
 */
export function useSignOut() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authService.signOut,
    onSuccess: () => {
      // Clear all cached data
      queryClient.clear();
      
      // Navigate to sign in
      router.replace('/(auth)/sign-in');
    },
    onError: (error) => {
      const message = getUserFriendlyMessage(error);
      Alert.alert('Sign Out Failed', message);
    },
  });
}

// ============================================================================
// PASSWORD RESET
// ============================================================================

/**
 * Send password reset email
 */
export function useForgotPassword() {
  return useMutation({
    mutationFn: (email: string) => authService.sendPasswordResetEmail(email),
    onSuccess: () => {
      Alert.alert(
        'Email Sent',
        'Check your email for password reset instructions.',
        [{ text: 'OK' }]
      );
    },
    onError: (error) => {
      const message = getUserFriendlyMessage(error);
      Alert.alert('Request Failed', message);
    },
  });
}

/**
 * Update password
 */
export function useUpdatePassword() {
  return useMutation({
    mutationFn: (newPassword: string) => authService.updatePassword(newPassword),
    onSuccess: () => {
      Alert.alert('Success', 'Your password has been updated.');
    },
    onError: (error) => {
      const message = getUserFriendlyMessage(error);
      Alert.alert('Update Failed', message);
    },
  });
}

// ============================================================================
// EMAIL VERIFICATION
// ============================================================================

/**
 * Resend verification email
 */
export function useResendVerification() {
  return useMutation({
    mutationFn: (email: string) => authService.resendVerificationEmail(email),
    onSuccess: () => {
      Alert.alert('Email Sent', 'Verification email has been resent.');
    },
    onError: (error) => {
      const message = getUserFriendlyMessage(error);
      Alert.alert('Request Failed', message);
    },
  });
}

// ============================================================================
// CHECK EMAIL
// ============================================================================

/**
 * Check if email already exists
 */
export function useCheckEmail() {
  return useMutation({
    mutationFn: (email: string) => authService.checkEmailExists(email),
  });
}
