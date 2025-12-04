/**
 * Notifications Service
 * Service for handling connection request notifications
 */

import { supabase } from '@/lib/supabase';
import type { Connection, Profile, UserLanguage } from '@/types/database';

// ============================================================================
// TYPES
// ============================================================================

export interface ConnectionNotification {
  id: string;
  type: 'connection_request' | 'connection_accepted';
  connectionId: string;
  fromUserId: string;
  fromUserName: string;
  fromUserAvatar: string | null;
  matchScore: number;
  timestamp: string;
  languages?: UserLanguage[];
}

export interface NotificationCallback {
  onConnectionRequest?: (notification: ConnectionNotification) => void;
  onConnectionAccepted?: (notification: ConnectionNotification) => void;
}

// ============================================================================
// NOTIFICATION SUBSCRIPTIONS
// ============================================================================

/**
 * Subscribe to connection request notifications for a user
 * Listens for:
 * 1. New connection requests (pending status where user is partner_id)
 * 2. Accepted connections (status changed to accepted where user is user_id or partner_id)
 */
export function subscribeToConnectionNotifications(
  userId: string,
  callbacks: NotificationCallback
): () => void {
  // Subscribe to new connection requests (INSERT where partner_id = userId)
  const requestSubscription = supabase
    .channel(`connection_requests:${userId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'connections',
        filter: `partner_id=eq.${userId}`,
      },
      async (payload) => {
        const connection = payload.new as Connection;
        if (connection.status === 'pending') {
          // Fetch sender profile
          const { data: profile } = await supabase
            .from('profiles')
            .select(`
              id,
              display_name,
              avatar_url,
              languages:user_languages(*)
            `)
            .eq('id', connection.user_id)
            .single();

          if (profile && callbacks.onConnectionRequest) {
            callbacks.onConnectionRequest({
              id: connection.id,
              type: 'connection_request',
              connectionId: connection.id,
              fromUserId: connection.user_id,
              fromUserName: profile.display_name,
              fromUserAvatar: profile.avatar_url,
              matchScore: connection.match_score || 0,
              timestamp: connection.created_at,
              languages: profile.languages as UserLanguage[],
            });
          }
        }
      }
    )
    .subscribe();

  // Subscribe to accepted connections (UPDATE where status changes to accepted)
  const acceptedSubscription = supabase
    .channel(`connection_accepted:${userId}`)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'connections',
        filter: `status=eq.accepted`,
      },
      async (payload) => {
        const connection = payload.new as Connection;
        const oldConnection = payload.old as Connection;
        
        // Only trigger if status changed from pending to accepted
        if (oldConnection.status === 'pending' && connection.status === 'accepted') {
          // Check if this connection involves the current user
          const isInvolved = connection.user_id === userId || connection.partner_id === userId;
          
          if (isInvolved) {
            // Determine who accepted (the other user)
            const otherUserId = connection.user_id === userId ? connection.partner_id : connection.user_id;
            
            // Fetch other user's profile
            const { data: profile } = await supabase
              .from('profiles')
              .select(`
                id,
                display_name,
                avatar_url,
                languages:user_languages(*)
              `)
              .eq('id', otherUserId)
              .single();

            if (profile && callbacks.onConnectionAccepted) {
              callbacks.onConnectionAccepted({
                id: connection.id,
                type: 'connection_accepted',
                connectionId: connection.id,
                fromUserId: otherUserId,
                fromUserName: profile.display_name,
                fromUserAvatar: profile.avatar_url,
                matchScore: connection.match_score || 0,
                timestamp: connection.accepted_at || connection.updated_at,
                languages: profile.languages as UserLanguage[],
              });
            }
          }
        }
      }
    )
    .subscribe();

  // Return unsubscribe function
  return () => {
    requestSubscription.unsubscribe();
    acceptedSubscription.unsubscribe();
  };
}

// ============================================================================
// NOTIFICATION HELPERS
// ============================================================================

/**
 * Get unread connection request count
 */
export async function getUnreadConnectionRequestCount(userId: string): Promise<number> {
  const { count, error } = await supabase
    .from('connections')
    .select('*', { count: 'exact', head: true })
    .eq('partner_id', userId)
    .eq('status', 'pending');

  if (error) {
    console.error('Error getting unread connection requests:', error);
    return 0;
  }

  return count || 0;
}

