/**
 * Authentication Service
 * Clean, production-ready auth operations
 */

import { supabase } from '@/lib/supabase';
import {
  signInSchema,
  signUpSchema,
  forgotPasswordSchema,
  type SignInInput,
  type FullSignupInput,
} from '@/utils/validators';
import {
  AuthError,
  InvalidCredentialsError,
  UserAlreadyExistsError,
  parseSupabaseError,
  ValidationError,
} from '@/utils/errors';
import { authLogger } from '@/utils/logger';
import type { User as SupabaseUser, Session } from '@supabase/supabase-js';

// ============================================================================
// TYPES
// ============================================================================

export interface AuthResponse {
  user: SupabaseUser | null;
  session: Session | null;
}

export interface SignUpResponse extends AuthResponse {
  needsEmailVerification: boolean;
}

// ============================================================================
// SIGN IN
// ============================================================================

/**
 * Sign in with email and password
 */
export async function signIn(input: SignInInput): Promise<AuthResponse> {
  // Validate input
  const result = signInSchema.safeParse(input);
  if (!result.success) {
    const errors: Record<string, string[]> = {};
    result.error.errors.forEach((err) => {
      const path = err.path.join('.');
      if (!errors[path]) errors[path] = [];
      errors[path].push(err.message);
    });
    throw new ValidationError('Invalid input', errors);
  }

  const { email, password } = result.data;

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    authLogger.signIn(email, false, error.message);
    throw parseSupabaseError(error);
  }

  // Log successful sign in with user details
  authLogger.signIn(email, true);
  
  if (data.user) {
    authLogger.info('AUTH', 'User signed in successfully', {
      userId: data.user.id,
      email: data.user.email,
      action: 'sign_in_success',
    });
  }

  return {
    user: data.user,
    session: data.session,
  };
}

// ============================================================================
// SIGN UP
// ============================================================================

/**
 * Sign up with email and password (creates auth user only)
 * Profile data is saved separately via userService
 */
export async function signUp(
  email: string,
  password: string,
  fullName: string
): Promise<SignUpResponse> {
  // Let Supabase handle email validation - it will return an error if email exists
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
    },
  });

  if (error) {
    authLogger.signUp(email, false, undefined, error.message);
    // Parse error will convert "User already registered" to UserAlreadyExistsError
    throw parseSupabaseError(error);
  }

  // Log successful sign up
  if (data.user) {
    authLogger.signUp(email, true, data.user.id);
  }

  // Check if email confirmation is required
  const needsEmailVerification = !data.session && !!data.user;

  return {
    user: data.user,
    session: data.session,
    needsEmailVerification,
  };
}

// ============================================================================
// CHECK EMAIL EXISTS
// ============================================================================

/**
 * Check if an email is already registered
 * Note: This is a best-effort check. Supabase will also validate on signup.
 */
export async function checkEmailExists(email: string): Promise<boolean> {
  try {
    // Try to sign in with a dummy password - if user exists, we get a specific error
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password: 'dummy-password-check-12345',
    });

    // If error is "Invalid login credentials", user exists
    // If error is "User not found" or similar, user doesn't exist
    if (error) {
      if (error.message.includes('Invalid login credentials') || error.message.includes('Invalid')) {
        return true;
      }
      // User doesn't exist
      return false;
    }

    // If no error (unlikely with dummy password), user exists
    return true;
  } catch (error) {
    // If check fails, let Supabase handle the validation on signup
    return false;
  }
}

// ============================================================================
// SIGN OUT
// ============================================================================

/**
 * Sign out current user
 */
export async function signOut(): Promise<void> {
  const { error } = await supabase.auth.signOut();

  if (error) {
    throw parseSupabaseError(error);
  }
}

// ============================================================================
// SESSION MANAGEMENT
// ============================================================================

/**
 * Get current session
 */
export async function getSession(): Promise<Session | null> {
  const { data, error } = await supabase.auth.getSession();

  if (error) {
    throw parseSupabaseError(error);
  }

  return data.session;
}

/**
 * Get current authenticated user
 */
export async function getCurrentUser(): Promise<SupabaseUser | null> {
  const { data, error } = await supabase.auth.getUser();

  if (error) {
    // Don't throw for "not authenticated" errors
    if (error.message.includes('Auth session missing')) {
      return null;
    }
    throw parseSupabaseError(error);
  }

  return data.user;
}

/**
 * Refresh the current session
 */
export async function refreshSession(): Promise<Session | null> {
  const { data, error } = await supabase.auth.refreshSession();

  if (error) {
    throw parseSupabaseError(error);
  }

  return data.session;
}

// ============================================================================
// PASSWORD RESET
// ============================================================================

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(email: string): Promise<void> {
  // Validate email
  const result = forgotPasswordSchema.safeParse({ email });
  if (!result.success) {
    throw new ValidationError('Invalid email address');
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: 'taalmeet://reset-password',
  });

  if (error) {
    throw parseSupabaseError(error);
  }
}

/**
 * Update password (for authenticated users)
 */
export async function updatePassword(newPassword: string): Promise<void> {
  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (error) {
    throw parseSupabaseError(error);
  }
}

// ============================================================================
// AUTH STATE LISTENER
// ============================================================================

/**
 * Subscribe to auth state changes
 */
export function onAuthStateChange(
  callback: (event: string, session: Session | null) => void
) {
  const { data } = supabase.auth.onAuthStateChange((event, session) => {
    callback(event, session);
  });

  return data.subscription;
}

// ============================================================================
// EMAIL VERIFICATION
// ============================================================================

/**
 * Resend verification email
 */
export async function resendVerificationEmail(email: string): Promise<void> {
  const { error } = await supabase.auth.resend({
    type: 'signup',
    email,
  });

  if (error) {
    throw parseSupabaseError(error);
  }
}

// ============================================================================
// ACCOUNT DELETION
// ============================================================================

/**
 * Delete user account and all associated data
 * This will cascade delete all user data due to ON DELETE CASCADE constraints
 * 
 * Process:
 * 1. Delete all database records (via RPC function)
 * 2. Delete auth user (requires admin API or server-side function)
 * 3. Sign out
 */
export async function deleteAccount(userId: string): Promise<void> {
  // Step 1: Delete all database records (profiles, messages, connections, etc.)
  // This uses the delete_user_account function which handles cascade deletion
  const { error: dbError } = await supabase.rpc('delete_user_account', {
    user_id: userId,
  });

  if (dbError) {
    throw parseSupabaseError(dbError);
  }

  // Step 2: Delete auth user
  // Note: Client-side code cannot delete auth users directly (requires admin API).
  // The database cleanup is done above. For production, you should:
  // 1. Create a server-side endpoint that uses service role key to delete auth user
  // 2. Call that endpoint here, or
  // 3. Use Supabase Edge Functions to handle auth deletion
  // 
  // For now, database cleanup is complete. The auth user deletion should be
  // handled by a server-side function or Edge Function.

  // Step 3: Sign out
  await supabase.auth.signOut();
}

