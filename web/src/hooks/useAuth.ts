/**
 * Authentication Hooks for Web
 * React Query hooks for authentication operations
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as authService from '@/services/authService';
import * as profileService from '@/services/profileService';
import type { SignInInput } from '@/services/authService';

// Re-export the auth context hook
export { useAuth as useAuthContext } from '../providers/AuthProvider';

// ============================================================================
// TYPES
// ============================================================================

export interface CurrentUserProfile {
  id: string;
  displayName: string;
  avatarUrl: string | null;
  bio: string | null;
  city: string | null;
  country: string | null;
  languages: {
    learning: Array<{ language: string; level: string | null }>;
    teaching: Array<{ language: string; level: string | null }>;
  };
}

// ============================================================================
// QUERY KEYS
// ============================================================================

export const authKeys = {
  all: ['auth'] as const,
  session: () => [...authKeys.all, 'session'] as const,
  user: () => [...authKeys.all, 'user'] as const,
  profile: () => [...authKeys.all, 'profile'] as const,
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
  const { refreshProfile } = useAuthContext();

  return useMutation({
    mutationFn: (input: SignInInput) => authService.signIn(input),
    onSuccess: async () => {
      // Invalidate and refetch auth data
      queryClient.invalidateQueries({ queryKey: authKeys.all });
      // Refresh profile in AuthProvider
      await refreshProfile();
      // Navigation will be handled by the component using this hook
    },
    onError: (error: any) => {
      console.error('Sign in failed:', error);
      // Error handling is done in the component
    },
  });
}

// ============================================================================
// SIGN UP
// ============================================================================

interface SignUpInput {
  email: string;
  password: string;
  name: string;
}

/**
 * Sign up mutation
 */
export function useSignUp() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: SignUpInput) => {
      return authService.signUp(input.email, input.password, input.name);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: authKeys.all });
      
      if (data.needsEmailVerification) {
        // You can add toast notification here
        console.log('Please check your email for verification');
      }
    },
    onError: (error: any) => {
      console.error('Sign up failed:', error);
      // You can add toast notification here
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
      // Navigation will be handled by the component using this hook
    },
    onError: (error: any) => {
      console.error('Sign out failed:', error);
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
      // You can add toast notification here
      console.log('Password reset email sent');
    },
    onError: (error: any) => {
      console.error('Password reset failed:', error);
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
      // You can add toast notification here
      console.log('Password updated successfully');
    },
    onError: (error: any) => {
      console.error('Password update failed:', error);
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
      // You can add toast notification here
      console.log('Verification email sent');
    },
    onError: (error: any) => {
      console.error('Resend verification failed:', error);
    },
  });
}

// ============================================================================
// PROFILE
// ============================================================================

/**
 * Get current user profile
 */
export function useCurrentUserProfile() {
  return useQuery({
    queryKey: authKeys.profile(),
    queryFn: profileService.getCurrentUserProfile,
    staleTime: 5 * 60 * 1000,
    retry: false,
    enabled: true, // Only run if user is authenticated
  });
}

