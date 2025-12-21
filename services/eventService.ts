/**
 * Event Service
 * Comprehensive service for managing language exchange events and sessions
 */

import { supabase } from '@/lib/supabase';
import {
  DatabaseError,
  ValidationError,
  parseSupabaseError,
} from '@/utils/errors';
import type {
  Event,
  EventFilters,
  EventSearchResult,
  CreateEventInput,
  UpdateEventInput,
  EventRSVP,
  EventFavorite,
  EventReview,
  EventStats,
  EventRecommendation,
  EventParticipant,
  ParticipantStatus,
} from '@/types/events';
import type { Profile } from '@/types/database';

// ============================================================================
// EVENT DISCOVERY & SEARCH
// ============================================================================

/**
 * Get events with comprehensive filters and search
 */
export async function searchEvents(
  filters: EventFilters = {},
  userId?: string
): Promise<EventSearchResult> {
  const {
    language,
    category,
    level,
    isOnline,
    isFree,
    startDate,
    endDate,
    maxDistance,
    minCapacity,
    onlyAvailable,
    tags,
    hostUserId,
    searchQuery,
    limit = 20,
    offset = 0,
  } = filters;

  let query = supabase
    .from('language_sessions')
    .select(`
      *,
      host:profiles!language_sessions_host_user_id_fkey(
        id,
        display_name,
        avatar_url,
        bio
      )
    `, { count: 'exact' })
    .order('starts_at', { ascending: true })
    .range(offset, offset + limit - 1);

  // Apply filters
  if (language) {
    query = query.eq('language', language);
  }

  if (category) {
    query = query.eq('category', category);
  }

  if (level) {
    query = query.eq('level', level);
  }

  if (isOnline !== undefined) {
    query = query.eq('is_online', isOnline);
  }

  if (isFree !== undefined) {
    query = query.eq('is_free', isFree);
  }

  if (startDate) {
    query = query.gte('starts_at', startDate);
  }

  if (endDate) {
    query = query.lte('starts_at', endDate);
  }

  if (hostUserId) {
    query = query.eq('host_user_id', hostUserId);
  }

  if (minCapacity) {
    query = query.gte('capacity', minCapacity);
  }

  // Text search
  if (searchQuery) {
    query = query.or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`);
  }

  // Only upcoming/ongoing events
  query = query.in('status', ['upcoming', 'ongoing']);

  const { data: events, error: eventsError, count } = await query;

  if (eventsError) {
    throw parseSupabaseError(eventsError);
  }

  if (!events || events.length === 0) {
    return { events: [], total: count || 0, hasMore: false };
  }

  // Get participant counts
  const eventIds = events.map(e => e.id);
  const { data: participants } = await supabase
    .from('session_participants')
    .select('session_id, user_id, status')
    .in('session_id', eventIds);

  // Group participants by event
  const participantsByEvent = new Map<string, any[]>();
  (participants || []).forEach((p: any) => {
    if (!participantsByEvent.has(p.session_id)) {
      participantsByEvent.set(p.session_id, []);
    }
    if (p.status === 'joined') {
      participantsByEvent.get(p.session_id)!.push(p);
    }
  });

  // Get favorites if user is logged in
  let favoriteEventIds = new Set<string>();
  if (userId) {
    const { data: favorites } = await supabase
      .from('event_favorites')
      .select('event_id')
      .eq('user_id', userId)
      .in('event_id', eventIds);

    favoriteEventIds = new Set((favorites || []).map(f => f.event_id));
  }

  // Get user participation status
  let userParticipations = new Map<string, ParticipantStatus>();
  if (userId) {
    const { data: userParts } = await supabase
      .from('session_participants')
      .select('session_id, status')
      .in('session_id', eventIds)
      .eq('user_id', userId);

    (userParts || []).forEach((p: any) => {
      userParticipations.set(p.session_id, p.status);
    });
  }

  // Build event objects
  let enrichedEvents: Event[] = events.map(event => {
    const eventParticipants = participantsByEvent.get(event.id) || [];
    const participantCount = eventParticipants.length;
    const isFull = participantCount >= event.capacity;
    const userStatus = userParticipations.get(event.id);

    return {
      id: event.id,
      title: event.title,
      description: event.description || '',
      language: event.language,
      category: event.category || 'language_exchange',
      level: event.level || 'all_levels',
      hostUserId: event.host_user_id,
      startsAt: event.starts_at,
      endsAt: event.ends_at,
      createdAt: event.created_at,
      updatedAt: event.updated_at,
      capacity: event.capacity,
      minParticipants: event.min_participants,
      location: {
        address: event.location_address,
        city: event.location_city,
        country: event.location_country,
        venue: event.location_venue,
        latitude: event.location_lat,
        longitude: event.location_lng,
        isOnline: event.is_online,
        meetingLink: event.meeting_link,
      },
      coverImageUrl: event.cover_image_url,
      imageUrls: event.image_urls || [],
      tags: event.tags ? event.tags.map((tag: string, index: number) => ({
        id: `${event.id}-tag-${index}`,
        name: tag,
      })) : [],
      requirements: event.requirements || [],
      isFree: event.is_free,
      price: event.price,
      currency: event.currency,
      status: event.status || 'upcoming',
      visibility: event.visibility || 'public',
      views: event.views || 0,
      isRecurring: event.is_recurring,
      recurrenceRule: event.recurrence_rule,
      externalUrl: event.external_url,
      externalId: event.external_id,
      host: {
        id: event.host.id,
        displayName: event.host.display_name,
        avatarUrl: event.host.avatar_url,
        bio: event.host.bio,
        verified: event.host.id_verified,
      },
      participantCount,
      isFull,
      currentUserParticipating: !!userStatus,
      currentUserStatus: userStatus,
      isFavorited: favoriteEventIds.has(event.id),
      isHostedByCurrentUser: userId === event.host_user_id,
    };
  });

  // Filter by availability if requested
  if (onlyAvailable) {
    enrichedEvents = enrichedEvents.filter(e => !e.isFull);
  }

  const total = count || 0;
  const hasMore = offset + enrichedEvents.length < total;

  return {
    events: enrichedEvents,
    total,
    hasMore,
  };
}

/**
 * Get single event by ID
 */
export async function getEventById(
  eventId: string,
  userId?: string
): Promise<Event | null> {
  const { data: event, error: eventError } = await supabase
    .from('language_sessions')
    .select(`
      *,
      host:profiles!language_sessions_host_user_id_fkey(
        id,
        display_name,
        avatar_url,
        bio,
        id_verified
      )
    `)
    .eq('id', eventId)
    .single();

  if (eventError) {
    if (eventError.code === 'PGRST116') {
      return null;
    }
    throw parseSupabaseError(eventError);
  }

  // Get participants with user details
  const { data: participants } = await supabase
    .from('session_participants')
    .select(`
      *,
      user:profiles!session_participants_user_id_fkey(
        id,
        display_name,
        avatar_url
      )
    `)
    .eq('session_id', eventId)
    .eq('status', 'joined')
    .order('joined_at', { ascending: true });

  const participantCount = participants?.length || 0;
  const isFull = participantCount >= event.capacity;

  // Check if favorited
  let isFavorited = false;
  if (userId) {
    const { data: favorite } = await supabase
      .from('event_favorites')
      .select('id')
      .eq('user_id', userId)
      .eq('event_id', eventId)
      .single();

    isFavorited = !!favorite;
  }

  // Get user participation status
  let userStatus: ParticipantStatus | undefined;
  if (userId) {
    const { data: userPart } = await supabase
      .from('session_participants')
      .select('status')
      .eq('session_id', eventId)
      .eq('user_id', userId)
      .single();

    userStatus = userPart?.status as ParticipantStatus;
  }

  // Increment view count (fire and forget)
  if (userId && userId !== event.host_user_id) {
    supabase
      .from('language_sessions')
      .update({ views: (event.views || 0) + 1 })
      .eq('id', eventId)
      .then(() => {});
  }

  return {
    id: event.id,
    title: event.title,
    description: event.description || '',
    language: event.language,
    category: event.category || 'language_exchange',
    level: event.level || 'all_levels',
    hostUserId: event.host_user_id,
    startsAt: event.starts_at,
    endsAt: event.ends_at,
    createdAt: event.created_at,
    updatedAt: event.updated_at,
    capacity: event.capacity,
    minParticipants: event.min_participants,
    location: {
      address: event.location_address,
      city: event.location_city,
      country: event.location_country,
      venue: event.location_venue,
      latitude: event.location_lat,
      longitude: event.location_lng,
      isOnline: event.is_online,
      meetingLink: event.meeting_link,
    },
    coverImageUrl: event.cover_image_url,
    imageUrls: event.image_urls || [],
    tags: event.tags ? event.tags.map((tag: string, index: number) => ({
      id: `${event.id}-tag-${index}`,
      name: tag,
    })) : [],
    requirements: event.requirements || [],
    isFree: event.is_free,
    price: event.price,
    currency: event.currency,
    status: event.status || 'upcoming',
    visibility: event.visibility || 'public',
    views: event.views || 0,
    isRecurring: event.is_recurring,
    recurrenceRule: event.recurrence_rule,
    externalUrl: event.external_url,
    externalId: event.external_id,
    host: {
      id: event.host.id,
      displayName: event.host.display_name,
      avatarUrl: event.host.avatar_url,
      bio: event.host.bio,
      verified: event.host.id_verified,
    },
    participantCount,
    participants: participants?.map(p => ({
      id: p.id,
      userId: p.user_id,
      eventId: p.session_id,
      status: p.status as ParticipantStatus,
      joinedAt: p.joined_at,
      user: p.user,
    })),
    isFull,
    currentUserParticipating: !!userStatus,
    currentUserStatus: userStatus,
    isFavorited,
    isHostedByCurrentUser: userId === event.host_user_id,
  };
}

// ============================================================================
// EVENT ACTIONS
// ============================================================================

/**
 * RSVP to an event
 */
export async function rsvpToEvent(
  eventId: string,
  userId: string,
  status: 'joined' | 'declined'
): Promise<EventParticipant> {
  if (status === 'declined') {
    // Remove participation
    await supabase
      .from('session_participants')
      .delete()
      .eq('session_id', eventId)
      .eq('user_id', userId);

    return {
      id: '',
      userId,
      eventId,
      status: 'declined',
      joinedAt: new Date().toISOString(),
    };
  }

  // Check if event is full
  const event = await getEventById(eventId);
  if (!event) {
    throw new ValidationError('Event not found');
  }

  if (event.isFull) {
    // Add to waitlist
    const { data, error } = await supabase
      .from('session_participants')
      .upsert({
        session_id: eventId,
        user_id: userId,
        status: 'waitlisted',
      })
      .select()
      .single();

    if (error) {
      throw parseSupabaseError(error);
    }

    return {
      id: data.id,
      userId: data.user_id,
      eventId: data.session_id,
      status: data.status as ParticipantStatus,
      joinedAt: data.joined_at,
    };
  }

  // Join event
  const { data, error } = await supabase
    .from('session_participants')
    .upsert({
      session_id: eventId,
      user_id: userId,
      status: 'joined',
    })
    .select()
    .single();

  if (error) {
    throw parseSupabaseError(error);
  }

  return {
    id: data.id,
    userId: data.user_id,
    eventId: data.session_id,
    status: data.status as ParticipantStatus,
    joinedAt: data.joined_at,
  };
}

/**
 * Toggle event favorite
 */
export async function toggleEventFavorite(
  eventId: string,
  userId: string
): Promise<boolean> {
  // Check if already favorited
  const { data: existing } = await supabase
    .from('event_favorites')
    .select('id')
    .eq('user_id', userId)
    .eq('event_id', eventId)
    .single();

  if (existing) {
    // Remove favorite
    const { error } = await supabase
      .from('event_favorites')
      .delete()
      .eq('id', existing.id);

    if (error) {
      throw parseSupabaseError(error);
    }

    return false; // Not favorited
  } else {
    // Add favorite
    const { error } = await supabase
      .from('event_favorites')
      .insert({
        user_id: userId,
        event_id: eventId,
      });

    if (error) {
      throw parseSupabaseError(error);
    }

    return true; // Favorited
  }
}

/**
 * Get user's favorited events
 */
export async function getFavoriteEvents(userId: string): Promise<Event[]> {
  const { data: favorites, error } = await supabase
    .from('event_favorites')
    .select('event_id')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    throw parseSupabaseError(error);
  }

  if (!favorites || favorites.length === 0) {
    return [];
  }

  const eventIds = favorites.map(f => f.event_id);
  const result = await searchEvents({ limit: 100 }, userId);
  
  return result.events.filter(e => eventIds.includes(e.id));
}

// ============================================================================
// EVENT CREATION & MANAGEMENT
// ============================================================================

/**
 * Create new event
 */
export async function createEvent(
  input: CreateEventInput,
  userId: string
): Promise<Event> {
  // Validate dates
  const start = new Date(input.startsAt);
  const end = new Date(input.endsAt);
  
  if (start >= end) {
    throw new ValidationError('End time must be after start time');
  }

  if (start < new Date()) {
    throw new ValidationError('Event cannot start in the past');
  }

  // Insert event
  const { data, error } = await supabase
    .from('language_sessions')
    .insert({
      host_user_id: userId,
      title: input.title,
      description: input.description,
      language: input.language,
      category: input.category,
      level: input.level,
      starts_at: input.startsAt,
      ends_at: input.endsAt,
      capacity: input.capacity,
      min_participants: input.minParticipants,
      is_online: input.location.isOnline,
      location_address: input.location.address,
      location_city: input.location.city,
      location_venue: input.location.venue,
      meeting_link: input.location.meetingLink,
      cover_image_url: input.coverImageUrl,
      tags: input.tags || [],
      requirements: input.requirements || [],
      is_free: input.isFree,
      price: input.price,
      currency: input.currency,
      visibility: input.visibility || 'public',
      is_recurring: input.isRecurring || false,
      recurrence_rule: input.recurrenceRule,
      status: 'upcoming',
    })
    .select()
    .single();

  if (error) {
    throw parseSupabaseError(error);
  }

  // Fetch full event with details
  const event = await getEventById(data.id, userId);
  if (!event) {
    throw new DatabaseError('Failed to retrieve created event');
  }

  return event;
}

/**
 * Update event
 */
export async function updateEvent(
  eventId: string,
  updates: UpdateEventInput,
  userId: string
): Promise<Event> {
  // Verify ownership
  const event = await getEventById(eventId);
  if (!event) {
    throw new ValidationError('Event not found');
  }

  if (event.hostUserId !== userId) {
    throw new ValidationError('Only the host can update this event');
  }

  // Build update object
  const updateData: any = { updated_at: new Date().toISOString() };

  if (updates.title) updateData.title = updates.title;
  if (updates.description) updateData.description = updates.description;
  if (updates.language) updateData.language = updates.language;
  if (updates.category) updateData.category = updates.category;
  if (updates.level) updateData.level = updates.level;
  if (updates.startsAt) updateData.starts_at = updates.startsAt;
  if (updates.endsAt) updateData.ends_at = updates.endsAt;
  if (updates.capacity) updateData.capacity = updates.capacity;
  if (updates.location) {
    if (updates.location.isOnline !== undefined) updateData.is_online = updates.location.isOnline;
    if (updates.location.address) updateData.location_address = updates.location.address;
    if (updates.location.venue) updateData.location_venue = updates.location.venue;
    if (updates.location.meetingLink) updateData.meeting_link = updates.location.meetingLink;
  }
  if (updates.coverImageUrl) updateData.cover_image_url = updates.coverImageUrl;
  if (updates.tags) updateData.tags = updates.tags;
  if (updates.requirements) updateData.requirements = updates.requirements;
  if (updates.isFree !== undefined) updateData.is_free = updates.isFree;
  if (updates.price !== undefined) updateData.price = updates.price;
  if (updates.status) updateData.status = updates.status;

  const { error } = await supabase
    .from('language_sessions')
    .update(updateData)
    .eq('id', eventId);

  if (error) {
    throw parseSupabaseError(error);
  }

  const updatedEvent = await getEventById(eventId, userId);
  if (!updatedEvent) {
    throw new DatabaseError('Failed to retrieve updated event');
  }

  return updatedEvent;
}

/**
 * Delete event
 */
export async function deleteEvent(eventId: string, userId: string): Promise<void> {
  // Verify ownership
  const event = await getEventById(eventId);
  if (!event) {
    throw new ValidationError('Event not found');
  }

  if (event.hostUserId !== userId) {
    throw new ValidationError('Only the host can delete this event');
  }

  const { error } = await supabase
    .from('language_sessions')
    .delete()
    .eq('id', eventId);

  if (error) {
    throw parseSupabaseError(error);
  }
}

// ============================================================================
// EVENT STATISTICS
// ============================================================================

/**
 * Get event statistics
 */
export async function getEventStats(eventId: string): Promise<EventStats> {
  const event = await getEventById(eventId);
  if (!event) {
    throw new ValidationError('Event not found');
  }

  // Get favorites count
  const { count: favoritesCount } = await supabase
    .from('event_favorites')
    .select('*', { count: 'exact', head: true })
    .eq('event_id', eventId);

  // Get reviews
  const { data: reviews } = await supabase
    .from('event_reviews')
    .select('rating')
    .eq('event_id', eventId);

  const totalReviews = reviews?.length || 0;
  const averageRating = totalReviews > 0
    ? reviews!.reduce((sum, r) => sum + r.rating, 0) / totalReviews
    : undefined;

  return {
    eventId,
    views: event.views || 0,
    favorites: favoritesCount || 0,
    shares: 0, // TODO: Track shares
    averageRating,
    totalReviews,
  };
}

/**
 * Get trending events
 */
export async function getTrendingEvents(
  limit: number = 10,
  userId?: string
): Promise<Event[]> {
  // Get events with high engagement (views, favorites, participants)
  const result = await searchEvents({
    limit,
    startDate: new Date().toISOString(),
  }, userId);

  // Sort by engagement score
  const events = result.events.sort((a, b) => {
    const scoreA = (a.views || 0) + (a.participantCount * 5);
    const scoreB = (b.views || 0) + (b.participantCount * 5);
    return scoreB - scoreA;
  });

  return events.slice(0, limit);
}

