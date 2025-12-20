/**
 * Event Types
 * Enhanced types for language exchange sessions and events
 */

import { z } from 'zod';
import type { Profile } from './database';

// ============================================================================
// ENUMS
// ============================================================================

export type EventCategory = 
  | 'language_exchange'
  | 'conversation_practice'
  | 'cultural_event'
  | 'study_group'
  | 'social_meetup'
  | 'workshop'
  | 'online_session'
  | 'conference'
  | 'networking';

export type EventLevel = 
  | 'beginner'
  | 'intermediate'
  | 'advanced'
  | 'all_levels';

export type EventStatus = 
  | 'upcoming'
  | 'ongoing'
  | 'completed'
  | 'cancelled';

export type ParticipantStatus = 
  | 'joined'
  | 'waitlisted'
  | 'left'
  | 'declined';

export type EventVisibility = 
  | 'public'
  | 'private'
  | 'friends_only';

// ============================================================================
// EVENT INTERFACES
// ============================================================================

export interface EventTag {
  id: string;
  name: string;
  color?: string;
}

export interface EventLocation {
  address?: string;
  city?: string;
  country?: string;
  venue?: string;
  latitude?: number;
  longitude?: number;
  isOnline: boolean;
  meetingLink?: string;
}

export interface EventHost {
  id: string;
  displayName: string;
  avatarUrl?: string;
  bio?: string;
  verified?: boolean;
  languages?: Array<{
    language: string;
    level: string;
  }>;
}

export interface EventParticipant {
  id: string;
  userId: string;
  eventId: string;
  status: ParticipantStatus;
  joinedAt: string;
  user?: Profile;
}

export interface EventBase {
  id: string;
  title: string;
  description: string;
  language: string;
  category: EventCategory;
  level: EventLevel;
  hostUserId: string;
  
  // Dates
  startsAt: string; // ISO timestamp
  endsAt: string; // ISO timestamp
  createdAt: string;
  updatedAt: string;
  
  // Capacity
  capacity: number;
  minParticipants?: number;
  
  // Location
  location: EventLocation;
  
  // Media
  coverImageUrl?: string;
  imageUrls?: string[];
  
  // Tags & Features
  tags?: EventTag[];
  requirements?: string[];
  
  // Pricing (optional for premium events)
  isFree: boolean;
  price?: number;
  currency?: string;
  
  // Status
  status: EventStatus;
  visibility: EventVisibility;
  
  // Metadata
  views?: number;
  isRecurring?: boolean;
  recurrenceRule?: string; // e.g., "weekly", "monthly"
  externalUrl?: string; // For Eventbrite or external events
  externalId?: string;
}

export interface Event extends EventBase {
  host: EventHost;
  participantCount: number;
  participants?: EventParticipant[];
  isFull: boolean;
  currentUserParticipating: boolean;
  currentUserStatus?: ParticipantStatus;
  isFavorited?: boolean;
  isHostedByCurrentUser?: boolean;
  distance?: number; // km from user
}

// ============================================================================
// FILTERS & SEARCH
// ============================================================================

export interface EventFilters {
  language?: string;
  category?: EventCategory;
  level?: EventLevel;
  isOnline?: boolean;
  isFree?: boolean;
  startDate?: string; // ISO
  endDate?: string; // ISO
  maxDistance?: number; // km
  minCapacity?: number;
  onlyAvailable?: boolean; // Only events with space
  tags?: string[];
  hostUserId?: string;
  searchQuery?: string;
  limit?: number;
  offset?: number;
}

export interface EventSearchResult {
  events: Event[];
  total: number;
  hasMore: boolean;
}

// ============================================================================
// USER INTERACTIONS
// ============================================================================

export interface EventFavorite {
  id: string;
  userId: string;
  eventId: string;
  createdAt: string;
}

export interface EventRSVP {
  eventId: string;
  userId: string;
  status: ParticipantStatus;
  notes?: string;
}

export interface EventReview {
  id: string;
  eventId: string;
  userId: string;
  rating: number; // 1-5
  comment?: string;
  createdAt: string;
  user?: Profile;
}

// ============================================================================
// EVENT CREATION & UPDATES
// ============================================================================

export interface CreateEventInput {
  title: string;
  description: string;
  language: string;
  category: EventCategory;
  level: EventLevel;
  startsAt: string;
  endsAt: string;
  capacity: number;
  minParticipants?: number;
  location: EventLocation;
  coverImageUrl?: string;
  tags?: string[];
  requirements?: string[];
  isFree: boolean;
  price?: number;
  currency?: string;
  visibility?: EventVisibility;
  isRecurring?: boolean;
  recurrenceRule?: string;
}

export interface UpdateEventInput extends Partial<CreateEventInput> {
  status?: EventStatus;
}

// ============================================================================
// ANALYTICS & STATS
// ============================================================================

export interface EventStats {
  eventId: string;
  views: number;
  favorites: number;
  shares: number;
  averageRating?: number;
  totalReviews: number;
}

export interface HostStats {
  totalEvents: number;
  totalParticipants: number;
  averageRating: number;
  completionRate: number; // % of events that actually happened
}

// ============================================================================
// DISCOVERY & RECOMMENDATIONS
// ============================================================================

export interface EventRecommendation {
  event: Event;
  score: number; // 0-100
  reasons: string[]; // e.g., ["Matches your language goals", "Near your location"]
}

export interface TrendingEvent extends Event {
  trendScore: number;
  growthRate: number; // % increase in interest
}

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

export const createEventSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(100),
  description: z.string().min(20, 'Description must be at least 20 characters').max(2000),
  language: z.string().length(2, 'Language code must be 2 characters'),
  category: z.enum([
    'language_exchange',
    'conversation_practice',
    'cultural_event',
    'study_group',
    'social_meetup',
    'workshop',
    'online_session',
    'conference',
    'networking',
  ]),
  level: z.enum(['beginner', 'intermediate', 'advanced', 'all_levels']),
  startsAt: z.string().datetime(),
  endsAt: z.string().datetime(),
  capacity: z.number().min(2).max(1000),
  isFree: z.boolean(),
  price: z.number().min(0).optional(),
  location: z.object({
    isOnline: z.boolean(),
    address: z.string().optional(),
    venue: z.string().optional(),
    meetingLink: z.string().url().optional(),
  }),
});

export const eventRSVPSchema = z.object({
  eventId: z.string().uuid(),
  status: z.enum(['joined', 'declined']),
  notes: z.string().max(500).optional(),
});

export const eventReviewSchema = z.object({
  eventId: z.string().uuid(),
  rating: z.number().min(1).max(5),
  comment: z.string().max(1000).optional(),
});

// ============================================================================
// CATEGORY HELPERS
// ============================================================================

export const EVENT_CATEGORIES: Record<EventCategory, { label: string; icon: string; color: string }> = {
  language_exchange: {
    label: 'Language Exchange',
    icon: 'people-outline',
    color: '#3B82F6',
  },
  conversation_practice: {
    label: 'Conversation',
    icon: 'chatbubbles-outline',
    color: '#10B981',
  },
  cultural_event: {
    label: 'Cultural Event',
    icon: 'flag-outline',
    color: '#F59E0B',
  },
  study_group: {
    label: 'Study Group',
    icon: 'book-outline',
    color: '#8B5CF6',
  },
  social_meetup: {
    label: 'Social',
    icon: 'cafe-outline',
    color: '#EC4899',
  },
  workshop: {
    label: 'Workshop',
    icon: 'construct-outline',
    color: '#EF4444',
  },
  online_session: {
    label: 'Online Session',
    icon: 'videocam-outline',
    color: '#06B6D4',
  },
  conference: {
    label: 'Conference',
    icon: 'business-outline',
    color: '#6366F1',
  },
  networking: {
    label: 'Networking',
    icon: 'share-social-outline',
    color: '#14B8A6',
  },
};

export const EVENT_LEVELS: Record<EventLevel, { label: string; color: string }> = {
  beginner: { label: 'Beginner', color: '#10B981' },
  intermediate: { label: 'Intermediate', color: '#F59E0B' },
  advanced: { label: 'Advanced', color: '#EF4444' },
  all_levels: { label: 'All Levels', color: '#6B7280' },
};

