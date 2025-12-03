/**
 * Session Service
 * Backend service for managing language exchange sessions
 */

import { supabase } from '@/lib/supabase';
import {
  DatabaseError,
  ValidationError,
  parseSupabaseError,
} from '@/utils/errors';
import type {
  LanguageSession,
  LanguageSessionInsert,
  LanguageSessionUpdate,
  SessionParticipant,
  SessionParticipantInsert,
  Profile,
} from '@/types/database';

// ============================================================================
// TYPES
// ============================================================================

export interface SessionFilters {
  language?: string; // Filter by language
  isOnline?: boolean; // Filter by online/offline
  startDate?: string; // Filter sessions starting after this date (ISO string)
  endDate?: string; // Filter sessions ending before this date (ISO string)
  hostUserId?: string; // Filter by host
  userId?: string; // Filter sessions user is participating in
}

export interface SessionWithDetails extends LanguageSession {
  host: Profile;
  participantCount: number;
  isFull: boolean;
  currentUserParticipating: boolean;
  currentUserStatus?: 'joined' | 'waitlisted' | 'left';
}

// ============================================================================
// GET SESSIONS
// ============================================================================

/**
 * Get sessions with optional filters
 */
export async function getSessions(filters: SessionFilters = {}): Promise<SessionWithDetails[]> {
  const {
    language,
    isOnline,
    startDate,
    endDate,
    hostUserId,
    userId,
  } = filters;

  let query = supabase
    .from('language_sessions')
    .select(`
      *,
      host:profiles!language_sessions_host_user_id_fkey(*)
    `)
    .order('starts_at', { ascending: true });

  // Apply filters
  if (language) {
    query = query.eq('language', language);
  }

  if (isOnline !== undefined) {
    query = query.eq('is_online', isOnline);
  }

  if (startDate) {
    query = query.gte('starts_at', startDate);
  }

  if (endDate) {
    query = query.lte('ends_at', endDate);
  }

  if (hostUserId) {
    query = query.eq('host_user_id', hostUserId);
  }

  const { data: sessions, error: sessionsError } = await query;

  if (sessionsError) {
    throw parseSupabaseError(sessionsError);
  }

  if (!sessions || sessions.length === 0) {
    return [];
  }

  // Get participant counts and user participation status
  const sessionIds = sessions.map(s => s.id);
  const { data: participants } = await supabase
    .from('session_participants')
    .select('session_id, user_id, status')
    .in('session_id', sessionIds)
    .eq('status', 'joined');

  // Group participants by session
  const participantsBySession = new Map<string, SessionParticipant[]>();
  (participants || []).forEach((p: SessionParticipant) => {
    if (!participantsBySession.has(p.session_id)) {
      participantsBySession.set(p.session_id, []);
    }
    participantsBySession.get(p.session_id)!.push(p);
  });

  // Get current user's participation if userId provided
  let userParticipations: SessionParticipant[] = [];
  if (userId) {
    const { data: userParts } = await supabase
      .from('session_participants')
      .select('session_id, status')
      .in('session_id', sessionIds)
      .eq('user_id', userId);

    userParticipations = (userParts || []) as SessionParticipant[];
  }

  // Filter by user participation if requested
  let filteredSessions = sessions;
  if (userId && filters.userId) {
    // Only return sessions user is participating in
    const userSessionIds = new Set(userParticipations.map(p => p.session_id));
    filteredSessions = sessions.filter(s => userSessionIds.has(s.id));
  }

  // Build result with details
  const sessionsWithDetails: SessionWithDetails[] = filteredSessions.map(session => {
    const sessionParticipants = participantsBySession.get(session.id) || [];
    const participantCount = sessionParticipants.length;
    const isFull = participantCount >= session.capacity;
    const userParticipation = userParticipations.find(p => p.session_id === session.id);

    return {
      ...session,
      host: session.host as Profile,
      participantCount,
      isFull,
      currentUserParticipating: !!userParticipation,
      currentUserStatus: userParticipation?.status as 'joined' | 'waitlisted' | 'left' | undefined,
    };
  });

  return sessionsWithDetails;
}

/**
 * Get session by ID with full details
 */
export async function getSessionById(sessionId: string, userId?: string): Promise<SessionWithDetails | null> {
  const { data: session, error: sessionError } = await supabase
    .from('language_sessions')
    .select(`
      *,
      host:profiles!language_sessions_host_user_id_fkey(*)
    `)
    .eq('id', sessionId)
    .single();

  if (sessionError) {
    if (sessionError.code === 'PGRST116') {
      return null; // Not found
    }
    throw parseSupabaseError(sessionError);
  }

  // Get participants
  const { data: participants } = await supabase
    .from('session_participants')
    .select(`
      *,
      user:profiles!session_participants_user_id_fkey(id, display_name, avatar_url)
    `)
    .eq('session_id', sessionId)
    .eq('status', 'joined')
    .order('joined_at', { ascending: true });

  const participantCount = participants?.length || 0;
  const isFull = participantCount >= session.capacity;

  // Get current user's participation
  let currentUserStatus: 'joined' | 'waitlisted' | 'left' | undefined;
  let currentUserParticipating = false;
  if (userId) {
    const { data: userParticipation } = await supabase
      .from('session_participants')
      .select('status')
      .eq('session_id', sessionId)
      .eq('user_id', userId)
      .single();

    if (userParticipation) {
      currentUserParticipating = true;
      currentUserStatus = userParticipation.status as 'joined' | 'waitlisted' | 'left';
    }
  }

  return {
    ...session,
    host: session.host as Profile,
    participantCount,
    isFull,
    currentUserParticipating,
    currentUserStatus,
  };
}

// ============================================================================
// SESSION ACTIONS
// ============================================================================

/**
 * Join a session
 */
export async function joinSession(sessionId: string, userId: string): Promise<SessionParticipant> {
  // Check if session exists and is not full
  const session = await getSessionById(sessionId);
  if (!session) {
    throw new ValidationError('Session not found');
  }

  if (session.isFull) {
    // Add to waitlist
    const { data, error } = await supabase
      .from('session_participants')
      .insert({
        session_id: sessionId,
        user_id: userId,
        status: 'waitlisted',
      } as SessionParticipantInsert)
      .select()
      .single();

    if (error) {
      // If already exists, update status
      if (error.code === '23505') {
        const { data: updated, error: updateError } = await supabase
          .from('session_participants')
          .update({ status: 'waitlisted' })
          .eq('session_id', sessionId)
          .eq('user_id', userId)
          .select()
          .single();

        if (updateError) {
          throw parseSupabaseError(updateError);
        }
        return updated;
      }
      throw parseSupabaseError(error);
    }

    return data;
  }

  // Join session
  const { data, error } = await supabase
    .from('session_participants')
    .insert({
      session_id: sessionId,
      user_id: userId,
      status: 'joined',
    } as SessionParticipantInsert)
    .select()
    .single();

  if (error) {
    // If already exists, update status
    if (error.code === '23505') {
      const { data: updated, error: updateError } = await supabase
        .from('session_participants')
        .update({ status: 'joined' })
        .eq('session_id', sessionId)
        .eq('user_id', userId)
        .select()
        .single();

      if (updateError) {
        throw parseSupabaseError(updateError);
      }
      return updated;
    }
    throw parseSupabaseError(error);
  }

  return data;
}

/**
 * Leave a session
 */
export async function leaveSession(sessionId: string, userId: string): Promise<void> {
  const { error } = await supabase
    .from('session_participants')
    .delete()
    .eq('session_id', sessionId)
    .eq('user_id', userId);

  if (error) {
    throw parseSupabaseError(error);
  }
}

/**
 * Create a new session
 */
export async function createSession(
  input: LanguageSessionInsert
): Promise<LanguageSession> {
  // Validate input
  if (!input.title || !input.language || !input.host_user_id) {
    throw new ValidationError('Title, language, and host_user_id are required');
  }

  if (new Date(input.starts_at) >= new Date(input.ends_at)) {
    throw new ValidationError('End time must be after start time');
  }

  const { data, error } = await supabase
    .from('language_sessions')
    .insert(input)
    .select()
    .single();

  if (error) {
    throw parseSupabaseError(error);
  }

  return data;
}

/**
 * Update a session (host only)
 */
export async function updateSession(
  sessionId: string,
  hostUserId: string,
  updates: LanguageSessionUpdate
): Promise<LanguageSession> {
  // Verify host owns the session
  const { data: session, error: checkError } = await supabase
    .from('language_sessions')
    .select('host_user_id')
    .eq('id', sessionId)
    .single();

  if (checkError) {
    throw parseSupabaseError(checkError);
  }

  if (session.host_user_id !== hostUserId) {
    throw new ValidationError('Only the host can update this session');
  }

  const { data, error } = await supabase
    .from('language_sessions')
    .update(updates)
    .eq('id', sessionId)
    .select()
    .single();

  if (error) {
    throw parseSupabaseError(error);
  }

  return data;
}

/**
 * Delete a session (host only)
 */
export async function deleteSession(sessionId: string, hostUserId: string): Promise<void> {
  // Verify host owns the session
  const { data: session, error: checkError } = await supabase
    .from('language_sessions')
    .select('host_user_id')
    .eq('id', sessionId)
    .single();

  if (checkError) {
    throw parseSupabaseError(checkError);
  }

  if (session.host_user_id !== hostUserId) {
    throw new ValidationError('Only the host can delete this session');
  }

  const { error } = await supabase
    .from('language_sessions')
    .delete()
    .eq('id', sessionId);

  if (error) {
    throw parseSupabaseError(error);
  }
}

