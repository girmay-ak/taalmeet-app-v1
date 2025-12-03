/**
 * Validation Schemas
 * Zod schemas for all input validation
 */

import { z } from 'zod';

// ============================================================================
// AUTH SCHEMAS
// ============================================================================

/**
 * Email validation
 */
export const emailSchema = z
  .string()
  .min(1, 'Email is required')
  .email('Please enter a valid email address')
  .toLowerCase()
  .trim();

/**
 * Password validation
 */
export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number');

/**
 * Simple password (for login - less strict)
 */
export const simplePasswordSchema = z
  .string()
  .min(6, 'Password must be at least 6 characters');

/**
 * Sign in schema
 */
export const signInSchema = z.object({
  email: emailSchema,
  password: simplePasswordSchema,
});

/**
 * Sign up schema (Step 1)
 */
export const signUpSchema = z
  .object({
    name: z
      .string()
      .min(2, 'Name must be at least 2 characters')
      .max(100, 'Name must be less than 100 characters')
      .trim(),
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

/**
 * Forgot password schema
 */
export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

/**
 * Reset password schema
 */
export const resetPasswordSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

// ============================================================================
// LANGUAGE SCHEMAS
// ============================================================================

/**
 * Language codes (ISO 639-1)
 */
export const languageCodeSchema = z
  .string()
  .min(2, 'Language code is required')
  .max(5);

/**
 * Proficiency levels
 */
export const proficiencyLevelSchema = z.enum([
  'native',
  'advanced',
  'intermediate',
  'beginner',
]);

/**
 * Single language object
 */
export const languageSchema = z.object({
  code: languageCodeSchema,
  name: z.string().min(1),
  flag: z.string().min(1),
});

/**
 * Teaching language with level
 */
export const teachingLanguageSchema = languageSchema.extend({
  level: proficiencyLevelSchema,
});

/**
 * Languages selection schema (Step 2)
 */
export const languagesSchema = z.object({
  learning: z
    .array(languageSchema)
    .min(1, 'Select at least one language to learn'),
  teaching: teachingLanguageSchema,
});

// ============================================================================
// LOCATION SCHEMAS
// ============================================================================

/**
 * City validation
 */
export const citySchema = z
  .string()
  .min(2, 'City must be at least 2 characters')
  .max(100, 'City must be less than 100 characters')
  .trim();

/**
 * Country validation
 */
export const countrySchema = z
  .string()
  .min(2, 'Country is required')
  .max(100)
  .trim();

/**
 * Location schema (Step 3)
 */
export const locationSchema = z.object({
  city: citySchema,
  country: countrySchema,
});

/**
 * GPS coordinates schema
 */
export const coordinatesSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  accuracy: z.number().optional(),
});

// ============================================================================
// PROFILE SCHEMAS
// ============================================================================

/**
 * Bio validation
 */
export const bioSchema = z
  .string()
  .max(500, 'Bio must be less than 500 characters')
  .trim();

/**
 * Interests validation
 */
export const interestsSchema = z
  .array(z.string())
  .min(1, 'Select at least one interest')
  .max(8, 'Maximum 8 interests allowed');

/**
 * Profile completion schema (Step 4)
 */
export const profileSchema = z.object({
  bio: bioSchema.min(1, 'Please write a short bio'),
  interests: interestsSchema,
  avatar: z.string().url().optional().or(z.literal('')),
});

/**
 * Profile update schema
 */
export const profileUpdateSchema = z.object({
  fullName: z.string().min(2).max(100).optional(),
  bio: bioSchema.optional(),
  city: citySchema.optional(),
  country: countrySchema.optional(),
  interests: z.array(z.string()).max(8).optional(),
  avatarUrl: z.string().url().optional().nullable(),
});

// ============================================================================
// FULL SIGNUP SCHEMA
// ============================================================================

/**
 * Complete signup data schema
 */
export const fullSignupSchema = z.object({
  // Step 1 - Account
  name: z.string().min(2).max(100).trim(),
  email: emailSchema,
  password: passwordSchema,
  
  // Step 2 - Languages
  learning: z.array(languageSchema).optional(),
  teaching: teachingLanguageSchema.optional(),
  
  // Step 3 - Location
  city: citySchema.optional(),
  country: countrySchema.optional(),
  
  // Step 4 - Profile
  bio: bioSchema.optional(),
  interests: z.array(z.string()).max(8).optional(),
  avatar: z.string().optional(),
});

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type SignInInput = z.infer<typeof signInSchema>;
export type SignUpInput = z.infer<typeof signUpSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type LanguagesInput = z.infer<typeof languagesSchema>;
export type LocationInput = z.infer<typeof locationSchema>;
export type CoordinatesInput = z.infer<typeof coordinatesSchema>;
export type ProfileInput = z.infer<typeof profileSchema>;
export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;
export type FullSignupInput = z.infer<typeof fullSignupSchema>;
export type Language = z.infer<typeof languageSchema>;
export type TeachingLanguage = z.infer<typeof teachingLanguageSchema>;
export type ProficiencyLevel = z.infer<typeof proficiencyLevelSchema>;

// ============================================================================
// VALIDATION HELPERS
// ============================================================================

/**
 * Validate data against schema with formatted errors
 */
export function validate<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; errors: Record<string, string[]> } {
  const result = schema.safeParse(data);
  
  if (result.success) {
    return { success: true, data: result.data };
  }
  
  const errors: Record<string, string[]> = {};
  result.error.errors.forEach((err) => {
    const path = err.path.join('.');
    if (!errors[path]) {
      errors[path] = [];
    }
    errors[path].push(err.message);
  });
  
  return { success: false, errors };
}

/**
 * Get password strength score (0-100)
 */
export function getPasswordStrength(password: string): {
  score: number;
  label: 'weak' | 'fair' | 'good' | 'strong';
  color: string;
} {
  let score = 0;
  
  if (password.length >= 8) score += 25;
  if (password.length >= 12) score += 10;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 25;
  if (/[0-9]/.test(password)) score += 20;
  if (/[^a-zA-Z0-9]/.test(password)) score += 20;
  
  if (score <= 25) return { score, label: 'weak', color: '#EF4444' };
  if (score <= 50) return { score, label: 'fair', color: '#F59E0B' };
  if (score <= 75) return { score, label: 'good', color: '#EAB308' };
  return { score: Math.min(score, 100), label: 'strong', color: '#10B981' };
}

