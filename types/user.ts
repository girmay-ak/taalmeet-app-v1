import { z } from 'zod';
import { User, UserLanguage, Location } from './database';

export interface UserProfile extends User {
  languages: UserLanguage[];
  location: Location | null;
  distance?: number; // Distance in kilometers from current user
}

export interface NearbyUser {
  profile: UserProfile;
  distanceKm: number;
  isOnline: boolean;
}

// Validation schemas
export const profileSetupSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
  bio: z.string().max(500, 'Bio must be less than 500 characters').optional(),
  dateOfBirth: z.string().optional(),
  gender: z.enum(['male', 'female', 'other', 'prefer_not_to_say']).optional(),
});

export const languageSchema = z.object({
  languageCode: z.string().length(2, 'Language code must be 2 characters'),
  proficiencyLevel: z.enum(['native', 'fluent', 'intermediate', 'beginner']),
  isLearning: z.boolean(),
});

export interface ProfileSetupFormData {
  fullName: string;
  username: string;
  bio?: string;
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
}

export interface LanguageFormData {
  languageCode: string;
  proficiencyLevel: 'native' | 'fluent' | 'intermediate' | 'beginner';
  isLearning: boolean;
}

