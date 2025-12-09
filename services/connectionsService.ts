/**
 * Connections Service
 * Backend service for managing user connections
 */

import { supabase } from '@/lib/supabase';
import {
  DatabaseError,
  RecordNotFoundError,
  ValidationError,
  parseSupabaseError,
} from '@/utils/errors';
import type { Connection, ConnectionInsert, ConnectionUpdate, Profile, UserLanguage } from '@/types/database';
import { excludeBlockedUsers } from './safetyService';
import * as gamificationService from './gamificationService';
import * as notificationService from './notificationsService';

// ============================================================================
// TYPES
// ============================================================================

export interface ConnectionWithProfile extends Connection {
  partner: Profile & {
    languages: UserLanguage[];
  };
}

export interface SuggestedConnection extends Profile {
  languages: UserLanguage[];
  matchScore: number;
  reason: string;
}

// ============================================================================
// GET CONNECTIONS
// ============================================================================

/**
 * Get all accepted connections for a user (bidirectional)
 */
export async function getConnections(userId: string): Promise<ConnectionWithProfile[]> {
  // Get connections where current user is either initiator or partner
  const { data: connections, error: connError } = await supabase
    .from('connections')
    .select('*')
    .or(`user_id.eq.${userId},partner_id.eq.${userId}`)
    .eq('status', 'accepted')
    .order('accepted_at', { ascending: false, nullsFirst: false });

  if (connError) {
    throw parseSupabaseError(connError);
  }

  if (!connections || connections.length === 0) {
    return [];
  }

  // Get partner IDs (the other user in each connection)
  const partnerIds = connections.map(c => 
    c.user_id === userId ? c.partner_id : c.user_id
  );

  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select(`
      *,
      languages:user_languages(*)
    `)
    .in('id', partnerIds);

  if (profilesError) {
    throw parseSupabaseError(profilesError);
  }

  // Combine connections with profiles
  const profileMap = new Map((profiles || []).map(p => [p.id, p]));
  
  const connectionsWithProfiles = connections.map(conn => {
    const partnerId = conn.user_id === userId ? conn.partner_id : conn.user_id;
    return {
      ...conn,
      partner: profileMap.get(partnerId)!,
    };
  }).filter(item => item.partner) as ConnectionWithProfile[];

  // Filter out blocked users
  return await excludeBlockedUsers(userId, connectionsWithProfiles);
}

/**
 * Get connection requests (pending requests where user is the partner)
 */
export async function getConnectionRequests(userId: string): Promise<ConnectionWithProfile[]> {
  // Get connections where current user is the partner (received requests)
  const { data: connections, error: connError } = await supabase
    .from('connections')
    .select('*')
    .eq('partner_id', userId)
    .eq('status', 'pending')
    .order('created_at', { ascending: false });

  if (connError) {
    throw parseSupabaseError(connError);
  }

  if (!connections || connections.length === 0) {
    return [];
  }

  // Get profiles for all request senders
  const userIds = connections.map(c => c.user_id);
  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select(`
      *,
      languages:user_languages(*)
    `)
    .in('id', userIds);

  if (profilesError) {
    throw parseSupabaseError(profilesError);
  }

  // Combine connections with profiles
  const profileMap = new Map((profiles || []).map(p => [p.id, p]));
  
  const requestsWithProfiles = connections.map(conn => ({
    ...conn,
    partner: profileMap.get(conn.user_id)!,
  })).filter(item => item.partner) as ConnectionWithProfile[];

  // Filter out blocked users
  return await excludeBlockedUsers(userId, requestsWithProfiles);
}

/**
 * Get sent pending requests (pending requests where user is the initiator)
 */
export async function getSentConnectionRequests(userId: string): Promise<ConnectionWithProfile[]> {
  // Get connections where current user is the initiator (sent requests)
  const { data: connections, error: connError } = await supabase
    .from('connections')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'pending')
    .order('created_at', { ascending: false });

  if (connError) {
    throw parseSupabaseError(connError);
  }

  if (!connections || connections.length === 0) {
    return [];
  }

  // Get profiles for all request recipients
  const partnerIds = connections.map(c => c.partner_id);
  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select(`
      *,
      languages:user_languages(*)
    `)
    .in('id', partnerIds);

  if (profilesError) {
    throw parseSupabaseError(profilesError);
  }

  // Combine connections with profiles
  const profileMap = new Map((profiles || []).map(p => [p.id, p]));
  
  const sentRequestsWithProfiles = connections.map(conn => ({
    ...conn,
    partner: profileMap.get(conn.partner_id)!,
  })).filter(item => item.partner) as ConnectionWithProfile[];

  // Filter out blocked users
  return await excludeBlockedUsers(userId, sentRequestsWithProfiles);
}

/**
 * Get suggested connections based on language compatibility
 */
export async function getSuggestedConnections(userId: string, limit: number = 20): Promise<SuggestedConnection[]> {
  // Get current user's profile and languages
  const { data: currentUser, error: userError } = await supabase
    .from('profiles')
    .select(`
      *,
      languages:user_languages(*)
    `)
    .eq('id', userId)
    .single();

  if (userError || !currentUser) {
    throw parseSupabaseError(userError || new Error('User not found'));
  }

  const currentUserLanguages = currentUser.languages || [];
  const teachingLanguages = currentUserLanguages
    .filter((lang: UserLanguage) => lang.role === 'teaching')
    .map((lang: UserLanguage) => lang.language);
  const learningLanguages = currentUserLanguages
    .filter((lang: UserLanguage) => lang.role === 'learning')
    .map((lang: UserLanguage) => lang.language);

  if (teachingLanguages.length === 0 && learningLanguages.length === 0) {
    return [];
  }

  // Get users who:
  // 1. Are not the current user
  // 2. Are not already connected (no connection record exists)
  // 3. Have matching languages (they learn what we teach, or teach what we learn)
  const { data: existingConnections, error: connError } = await supabase
    .from('connections')
    .select('partner_id')
    .or(`user_id.eq.${userId},partner_id.eq.${userId}`);

  if (connError) {
    throw parseSupabaseError(connError);
  }

  const excludedUserIds = new Set([
    userId,
    ...(existingConnections?.map((c: any) => 
      c.partner_id === userId ? c.user_id : c.partner_id
    ) || [])
  ]);

  // Get all profiles with languages
  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select(`
      *,
      languages:user_languages(*)
    `)
    .neq('id', userId)
    .limit(limit * 3); // Get more to filter and score

  if (profilesError) {
    throw parseSupabaseError(profilesError);
  }

  // Filter and score profiles
  const suggestions: SuggestedConnection[] = (profiles || [])
    .filter((profile: any) => !excludedUserIds.has(profile.id))
    .map((profile: any) => {
      const profileLanguages = profile.languages || [];
      const profileTeaching = profileLanguages
        .filter((lang: UserLanguage) => lang.role === 'teaching')
        .map((lang: UserLanguage) => lang.language);
      const profileLearning = profileLanguages
        .filter((lang: UserLanguage) => lang.role === 'learning')
        .map((lang: UserLanguage) => lang.language);

      // Calculate match score
      let matchScore = 0;
      let reason = '';

      // Check if they learn what we teach
      const teachingMatch = teachingLanguages.filter(lang => 
        profileLearning.includes(lang)
      ).length;
      
      // Check if they teach what we learn
      const learningMatch = learningLanguages.filter(lang => 
        profileTeaching.includes(lang)
      ).length;

      if (teachingMatch > 0 && learningMatch > 0) {
        matchScore = 90 + (teachingMatch + learningMatch) * 5;
        reason = `Perfect match! You teach ${teachingMatch} language(s) they learn, and they teach ${learningMatch} language(s) you learn.`;
      } else if (teachingMatch > 0) {
        matchScore = 70 + teachingMatch * 10;
        reason = `They learn ${teachingMatch} language(s) you teach.`;
      } else if (learningMatch > 0) {
        matchScore = 70 + learningMatch * 10;
        reason = `They teach ${learningMatch} language(s) you learn.`;
      } else {
        matchScore = 30; // Low score for no language match
        reason = 'No direct language match, but might be interested.';
      }

      // Cap at 100
      matchScore = Math.min(100, matchScore);

      return {
        ...profile,
        languages: profileLanguages,
        matchScore,
        reason,
      };
    })
    .filter((suggestion: SuggestedConnection) => suggestion.matchScore >= 50) // Only show good matches
    .sort((a: SuggestedConnection, b: SuggestedConnection) => b.matchScore - a.matchScore)
    .slice(0, limit);

  // Filter out blocked users
  return await excludeBlockedUsers(userId, suggestions);
}

// ============================================================================
// CONNECTION ACTIONS
// ============================================================================

/**
 * Send a connection request
 */
export async function sendConnectionRequest(
  currentUserId: string,
  targetUserId: string
): Promise<Connection> {
  // Check if connection already exists
  const { data: existing, error: checkError } = await supabase
    .from('connections')
    .select('*')
    .or(`and(user_id.eq.${currentUserId},partner_id.eq.${targetUserId}),and(user_id.eq.${targetUserId},partner_id.eq.${currentUserId})`)
    .single();

  if (checkError && checkError.code !== 'PGRST116') {
    throw parseSupabaseError(checkError);
  }

  if (existing) {
    // If exists and rejected, update to pending
    if (existing.status === 'rejected') {
      const { data, error } = await supabase
        .from('connections')
        .update({ status: 'pending' })
        .eq('id', existing.id)
        .select()
        .single();

      if (error) {
        throw parseSupabaseError(error);
      }

      return data;
    }

    // Otherwise, connection already exists
    throw new ValidationError('Connection request already exists');
  }

  // Calculate match score (simplified - you can enhance this)
  const matchScore = await calculateMatchScore(currentUserId, targetUserId);

  // Create new connection
  const insertData: ConnectionInsert = {
    user_id: currentUserId,
    partner_id: targetUserId,
    status: 'pending',
    match_score: matchScore,
  };

  const { data, error } = await supabase
    .from('connections')
    .insert(insertData)
    .select()
    .single();

  if (error) {
    throw parseSupabaseError(error);
  }

  // Send push notification to target user
  try {
    // Get requester's name for notification
    const { data: requesterProfile } = await supabase
      .from('profiles')
      .select('display_name')
      .eq('id', currentUserId)
      .single();

    if (requesterProfile) {
      await notificationService.sendConnectionRequestNotification(
        targetUserId,
        requesterProfile.display_name,
        data.id
      );
    }
  } catch (error) {
    // Don't fail connection request if notification fails
    console.warn('Failed to send push notification:', error);
  }

  return data;
}

/**
 * Accept a connection request
 */
export async function acceptRequest(connectionId: string, userId: string): Promise<Connection> {
  const { data, error } = await supabase
    .from('connections')
    .update({ 
      status: 'accepted',
      accepted_at: new Date().toISOString(),
    })
    .eq('id', connectionId)
    .select()
    .single();

  if (error) {
    throw parseSupabaseError(error);
  }

  // Award points for accepting a connection
  try {
    await gamificationService.addPoints(
      userId,
      50,
      'Made a new connection',
      'connection_made',
      connectionId
    );
  } catch (error) {
    // Don't fail connection acceptance if points fail
    console.warn('Failed to award points for connection:', error);
  }

  // Send push notifications
  try {
    // Get connection details to find both users
    const connection = data;
    const requesterId = connection.user_id;
    const accepterId = connection.partner_id;

    // Get accepter's name for requester's notification
    const { data: accepterProfile } = await supabase
      .from('profiles')
      .select('display_name')
      .eq('id', userId)
      .single();

    if (accepterProfile) {
      // Notify the requester that their request was accepted
      await notificationService.sendConnectionAcceptedNotification(
        requesterId,
        accepterProfile.display_name,
        connectionId
      );

      // Also send match found notification to both users
      const { data: requesterProfile } = await supabase
        .from('profiles')
        .select('display_name')
        .eq('id', requesterId)
        .single();

      if (requesterProfile) {
        await notificationService.sendMatchFoundNotification(
          userId,
          requesterProfile.display_name,
          connectionId
        );
        await notificationService.sendMatchFoundNotification(
          requesterId,
          accepterProfile.display_name,
          connectionId
        );
      }
    }
  } catch (error) {
    // Don't fail connection acceptance if notifications fail
    console.warn('Failed to send push notifications:', error);
  }

  return data;
}

/**
 * Reject a connection request
 */
export async function rejectRequest(connectionId: string): Promise<Connection> {
  const { data, error } = await supabase
    .from('connections')
    .update({ status: 'rejected' })
    .eq('id', connectionId)
    .select()
    .single();

  if (error) {
    throw parseSupabaseError(error);
  }

  return data;
}

/**
 * Get a connection by ID with full profile data
 */
export async function getConnectionById(
  connectionId: string,
  currentUserId: string
): Promise<ConnectionWithProfile | null> {
  const { data: connection, error: connError } = await supabase
    .from('connections')
    .select('*')
    .eq('id', connectionId)
    .single();

  if (connError || !connection) {
    throw parseSupabaseError(connError || new Error('Connection not found'));
  }

  // Get partner ID (the other user)
  const partnerId = connection.user_id === currentUserId ? connection.partner_id : connection.user_id;

  // Get partner profile with languages
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select(`
      *,
      languages:user_languages(*)
    `)
    .eq('id', partnerId)
    .single();

  if (profileError || !profile) {
    throw parseSupabaseError(profileError || new Error('Profile not found'));
  }

  return {
    ...connection,
    partner: profile,
  };
}

/**
 * Remove/Delete a connection
 */
export async function removeConnection(connectionId: string): Promise<void> {
  const { error } = await supabase
    .from('connections')
    .delete()
    .eq('id', connectionId);

  if (error) {
    throw parseSupabaseError(error);
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Calculate match score between two users based on languages
 */
async function calculateMatchScore(userId1: string, userId2: string): Promise<number> {
  const { data: user1, error: error1 } = await supabase
    .from('profiles')
    .select('languages:user_languages(*)')
    .eq('id', userId1)
    .single();

  const { data: user2, error: error2 } = await supabase
    .from('profiles')
    .select('languages:user_languages(*)')
    .eq('id', userId2)
    .single();

  if (error1 || error2 || !user1 || !user2) {
    return 50; // Default score
  }

  const user1Languages = user1.languages || [];
  const user2Languages = user2.languages || [];

  const user1Teaching = user1Languages
    .filter((lang: UserLanguage) => lang.role === 'teaching')
    .map((lang: UserLanguage) => lang.language);
  const user1Learning = user1Languages
    .filter((lang: UserLanguage) => lang.role === 'learning')
    .map((lang: UserLanguage) => lang.language);

  const user2Teaching = user2Languages
    .filter((lang: UserLanguage) => lang.role === 'teaching')
    .map((lang: UserLanguage) => lang.language);
  const user2Learning = user2Languages
    .filter((lang: UserLanguage) => lang.role === 'learning')
    .map((lang: UserLanguage) => lang.language);

  let score = 50; // Base score

  // Perfect match: they learn what we teach AND we learn what they teach
  const teachingMatch = user1Teaching.filter(lang => user2Learning.includes(lang)).length;
  const learningMatch = user1Learning.filter(lang => user2Teaching.includes(lang)).length;

  if (teachingMatch > 0 && learningMatch > 0) {
    score = 90 + (teachingMatch + learningMatch) * 5;
  } else if (teachingMatch > 0) {
    score = 70 + teachingMatch * 10;
  } else if (learningMatch > 0) {
    score = 70 + learningMatch * 10;
  }

  return Math.min(100, score);
}

