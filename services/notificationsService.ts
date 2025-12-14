/**
 * Notifications Service
 * Service for handling push notifications and connection request notifications
 */

import { supabase } from '@/lib/supabase';
import { parseSupabaseError } from '@/utils/errors';
import type { Connection, Profile, UserLanguage, DeviceToken, DeviceTokenInsert, NotificationPreferences, NotificationPreferencesInsert, NotificationPreferencesUpdate } from '@/types/database';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

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

// ============================================================================
// EXPO PUSH NOTIFICATIONS
// ============================================================================

/**
 * Configure notification handler
 */
export function configureNotificationHandler() {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    }),
  });
}

/**
 * Request notification permissions
 */
export async function requestNotificationPermissions(): Promise<boolean> {
  if (!Device.isDevice) {
    console.warn('Push notifications only work on physical devices');
    return false;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.warn('Failed to get push token for push notification!');
    return false;
  }

  return true;
}

/**
 * Get Expo push token
 */
export async function getExpoPushToken(): Promise<string | null> {
  try {
    if (!Device.isDevice) {
      // Silently return null in development for simulators/emulators
      if (__DEV__) {
        return null;
      }
      console.warn('Push notifications only work on physical devices');
      return null;
    }

    const hasPermission = await requestNotificationPermissions();
    if (!hasPermission) {
      return null;
    }

    // Try to get projectId from various sources
    const projectId = 
      Constants.expoConfig?.extra?.eas?.projectId || 
      Constants.easConfig?.projectId ||
      Constants.expoConfig?.extra?.projectId;

    // Validate projectId is a valid UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const isValidProjectId = projectId && uuidRegex.test(projectId);

    if (!isValidProjectId) {
      // In development, skip push token registration if no projectId
      // This prevents the deprecation warnings from cluttering logs
      if (__DEV__) {
        // Only log once per session to reduce noise
        if (!(global as any).__pushTokenWarningLogged) {
          console.log('Push notifications: Skipping token registration in development (no EAS projectId configured)');
          console.log('To enable push notifications: Run "eas init" or add projectId to app.json extra.eas.projectId');
          (global as any).__pushTokenWarningLogged = true;
        }
        return null;
      }

      // For production or when explicitly needed, try without projectId (legacy method)
      // This works in Expo Go and development builds
      try {
        const tokenData = await Notifications.getExpoPushTokenAsync();
        return tokenData.data;
      } catch (legacyError) {
        console.warn('Project ID not found or invalid. Push notifications require a valid EAS project ID for production.');
        console.warn('To set up EAS project: Run "eas init" or add a valid projectId to app.json extra.eas.projectId');
        return null;
      }
    }

    const tokenData = await Notifications.getExpoPushTokenAsync({
      projectId,
    });

    return tokenData.data;
  } catch (error) {
    // Only log errors in production or if it's not the expected deprecation warning
    if (!__DEV__ || !(error as any)?.message?.includes('projectId')) {
      console.error('Error getting Expo push token:', error);
    }
    return null;
  }
}

/**
 * Get device platform
 */
function getDevicePlatform(): 'ios' | 'android' | 'web' {
  if (Platform.OS === 'ios') return 'ios';
  if (Platform.OS === 'android') return 'android';
  return 'web';
}

/**
 * Register device token
 */
export async function registerDeviceToken(
  userId: string,
  token: string,
  deviceId?: string
): Promise<DeviceToken> {
  const platform = getDevicePlatform();
  const appVersion = Constants.expoConfig?.version || '1.0.0';
  
  const deviceInfo = {
    platform: Platform.OS,
    version: Platform.Version,
    model: Device.modelName,
    brand: Device.brand,
    osVersion: Device.osVersion,
  };

  const insertData: DeviceTokenInsert = {
    user_id: userId,
    token,
    device_id: deviceId,
    platform,
    app_version: appVersion,
    device_info: deviceInfo,
  };

  // Use upsert to handle duplicate tokens
  const { data, error } = await supabase
    .from('device_tokens')
    .upsert(insertData, {
      onConflict: 'user_id,token',
      ignoreDuplicates: false,
    })
    .select()
    .single();

  if (error) {
    throw parseSupabaseError(error);
  }

  // Update last used timestamp
  await supabase.rpc('update_device_token_usage', {
    p_token: token,
  });

  // Cleanup old tokens (keep only 5 most recent)
  await supabase.rpc('cleanup_old_device_tokens', {
    p_user_id: userId,
    p_keep_count: 5,
  });

  return data;
}

/**
 * Unregister device token
 */
export async function unregisterDeviceToken(token: string): Promise<void> {
  const { error } = await supabase
    .from('device_tokens')
    .update({ is_active: false })
    .eq('token', token);

  if (error) {
    throw parseSupabaseError(error);
  }
}

/**
 * Get user's active device tokens
 */
export async function getUserDeviceTokens(userId: string): Promise<DeviceToken[]> {
  const { data, error } = await supabase
    .from('device_tokens')
    .select('*')
    .eq('user_id', userId)
    .eq('is_active', true)
    .order('last_used_at', { ascending: false });

  if (error) {
    throw parseSupabaseError(error);
  }

  return data || [];
}

// ============================================================================
// NOTIFICATION PREFERENCES
// ============================================================================

/**
 * Get user notification preferences
 */
export async function getNotificationPreferences(userId: string): Promise<NotificationPreferences | null> {
  const { data, error } = await supabase
    .from('notification_preferences')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      // No preferences found, create default
      return await createDefaultPreferences(userId);
    }
    throw parseSupabaseError(error);
  }

  return data;
}

/**
 * Create default notification preferences
 */
export async function createDefaultPreferences(userId: string): Promise<NotificationPreferences> {
  const insertData: NotificationPreferencesInsert = {
    user_id: userId,
    push_enabled: true,
    new_message_enabled: true,
    connection_request_enabled: true,
    connection_accepted_enabled: true,
    match_found_enabled: true,
    session_reminder_enabled: true,
    session_starting_soon_enabled: true,
    achievement_unlocked_enabled: true,
    weekly_summary_enabled: false,
    marketing_enabled: false,
  };

  const { data, error } = await supabase
    .from('notification_preferences')
    .insert(insertData)
    .select()
    .single();

  if (error) {
    throw parseSupabaseError(error);
  }

  return data;
}

/**
 * Update notification preferences
 */
export async function updateNotificationPreferences(
  userId: string,
  preferences: NotificationPreferencesUpdate
): Promise<NotificationPreferences> {
  const { data, error } = await supabase
    .from('notification_preferences')
    .update(preferences)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) {
    throw parseSupabaseError(error);
  }

  return data;
}

// ============================================================================
// SEND PUSH NOTIFICATIONS (Server-side function)
// ============================================================================

/**
 * Send push notification to user
 * Note: This should be called from a server-side function or Edge Function
 * For client-side, we'll prepare the notification data
 */
export interface PushNotificationData {
  to: string; // Expo push token
  sound: 'default';
  title: string;
  body: string;
  data?: Record<string, any>;
  badge?: number;
}

/**
 * Prepare push notification data
 * This prepares the notification, but actual sending should be done server-side
 */
export function preparePushNotification(
  token: string,
  title: string,
  body: string,
  data?: Record<string, any>,
  badge?: number
): PushNotificationData {
  return {
    to: token,
    sound: 'default',
    title,
    body,
    data,
    badge,
  };
}

/**
 * Check if user should receive notification based on preferences
 */
export async function shouldSendNotification(
  userId: string,
  notificationType: 'new_message' | 'connection_request' | 'connection_accepted' | 'match_found' | 'session_reminder' | 'session_starting_soon' | 'achievement_unlocked' | 'weekly_summary' | 'marketing'
): Promise<boolean> {
  const preferences = await getNotificationPreferences(userId);

  if (!preferences || !preferences.push_enabled) {
    return false;
  }

  // Check quiet hours
  if (preferences.quiet_hours_start && preferences.quiet_hours_end) {
    const now = new Date();
    const currentTime = now.toTimeString().slice(0, 5); // HH:MM format
    
    // Simple quiet hours check (can be enhanced with timezone support)
    if (currentTime >= preferences.quiet_hours_start && currentTime <= preferences.quiet_hours_end) {
      return false;
    }
  }

  // Check specific notification type preference
  switch (notificationType) {
    case 'new_message':
      return preferences.new_message_enabled;
    case 'connection_request':
      return preferences.connection_request_enabled;
    case 'connection_accepted':
      return preferences.connection_accepted_enabled;
    case 'match_found':
      return preferences.match_found_enabled;
    case 'session_reminder':
      return preferences.session_reminder_enabled;
    case 'session_starting_soon':
      return preferences.session_starting_soon_enabled;
    case 'achievement_unlocked':
      return preferences.achievement_unlocked_enabled;
    case 'weekly_summary':
      return preferences.weekly_summary_enabled;
    case 'marketing':
      return preferences.marketing_enabled;
    default:
      return true;
  }
}

// ============================================================================
// SEND NOTIFICATIONS (Helper functions for server-side)
// ============================================================================

/**
 * Send push notification to user's devices
 * This should be called from a server-side function or Edge Function
 * For now, we'll prepare the notification data structure
 */
export async function sendPushNotificationToUser(
  userId: string,
  title: string,
  body: string,
  notificationType: 'new_message' | 'connection_request' | 'connection_accepted' | 'match_found' | 'session_reminder' | 'session_starting_soon' | 'achievement_unlocked' | 'weekly_summary' | 'marketing',
  data?: Record<string, any>
): Promise<void> {
  // Check if user should receive this notification
  const shouldSend = await shouldSendNotification(userId, notificationType);
  if (!shouldSend) {
    return;
  }

  // Get user's active device tokens
  const tokens = await getUserDeviceTokens(userId);
  if (tokens.length === 0) {
    return;
  }

  // Prepare notification data for each token
  // Note: Actual sending should be done via Expo Push Notification API
  // This is typically done from a server-side function or Edge Function
  // For now, we'll log the notification data
  console.log('Preparing push notifications:', {
    userId,
    tokens: tokens.map(t => t.token),
    title,
    body,
    notificationType,
    data,
  });

  // In production, you would:
  // 1. Call Expo Push Notification API from a server-side function
  // 2. Or use Supabase Edge Function to send notifications
  // 3. Or use a service like OneSignal, Firebase Cloud Messaging, etc.
  
  // Example server-side code (Edge Function):
  // const messages = tokens.map(token => ({
  //   to: token.token,
  //   sound: 'default',
  //   title,
  //   body,
  //   data: { ...data, type: notificationType },
  // }));
  // await fetch('https://exp.host/--/api/v2/push/send', {
  //   method: 'POST',
  //   headers: {
  //     'Content-Type': 'application/json',
  //   },
  //   body: JSON.stringify(messages),
  // });
}

/**
 * Send notification for new message
 */
export async function sendNewMessageNotification(
  recipientUserId: string,
  senderName: string,
  messagePreview: string,
  conversationId: string
): Promise<void> {
  await sendPushNotificationToUser(
    recipientUserId,
    `New message from ${senderName}`,
    messagePreview.length > 50 ? messagePreview.substring(0, 50) + '...' : messagePreview,
    'new_message',
    {
      conversationId,
      type: 'new_message',
    }
  );
}

/**
 * Send notification for connection request
 */
export async function sendConnectionRequestNotification(
  recipientUserId: string,
  requesterName: string,
  connectionId: string
): Promise<void> {
  await sendPushNotificationToUser(
    recipientUserId,
    'New Connection Request',
    `${requesterName} wants to connect with you`,
    'connection_request',
    {
      connectionId,
      type: 'connection_request',
    }
  );
}

/**
 * Send notification for connection accepted
 */
export async function sendConnectionAcceptedNotification(
  userId: string,
  accepterName: string,
  connectionId: string
): Promise<void> {
  await sendPushNotificationToUser(
    userId,
    'Connection Accepted! 🎉',
    `${accepterName} accepted your connection request`,
    'connection_accepted',
    {
      connectionId,
      type: 'connection_accepted',
    }
  );
}

/**
 * Send notification for match found
 */
export async function sendMatchFoundNotification(
  userId: string,
  matchName: string,
  connectionId: string
): Promise<void> {
  await sendPushNotificationToUser(
    userId,
    'New Match! 💚',
    `You and ${matchName} are now connected`,
    'match_found',
    {
      connectionId,
      type: 'match_found',
    }
  );
}

/**
 * Send notification for achievement unlocked
 */
export async function sendAchievementUnlockedNotification(
  userId: string,
  achievementName: string,
  pointsReward: number
): Promise<void> {
  await sendPushNotificationToUser(
    userId,
    'Achievement Unlocked! 🏆',
    `You unlocked "${achievementName}" and earned ${pointsReward} points!`,
    'achievement_unlocked',
    {
      achievementName,
      pointsReward,
      type: 'achievement_unlocked',
    }
  );
}

// ============================================================================
// IN-APP NOTIFICATIONS
// ============================================================================

export interface InAppNotification {
  id: string;
  type: 'match' | 'message' | 'connection' | 'connection_accepted' | 'achievement' | 'session' | 'reminder';
  title: string;
  message: string;
  time: string;
  timestamp: string;
  read: boolean;
  avatar?: string;
  icon?: 'heart' | 'message' | 'user' | 'calendar' | 'star' | 'sparkles';
  relatedId?: string;
}

/**
 * Get all in-app notifications for a user
 * Aggregates notifications from multiple sources
 */
export async function getNotifications(userId: string): Promise<InAppNotification[]> {
  const notifications: InAppNotification[] = [];

  try {
    // 1. Get pending connection requests (where user is partner_id)
    const { data: connectionRequests, error: connError } = await supabase
      .from('connections')
      .select(`
        id,
        user_id,
        match_score,
        created_at,
        profiles!connections_user_id_fkey (
          display_name,
          avatar_url
        )
      `)
      .eq('partner_id', userId)
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (!connError && connectionRequests) {
      connectionRequests.forEach((conn: any) => {
        const profile = conn.profiles;
        notifications.push({
          id: `connection_${conn.id}`,
          type: 'connection',
          title: 'Connection Request',
          message: `${profile?.display_name || 'Someone'} wants to connect with you`,
          time: formatTimeAgo(conn.created_at),
          timestamp: conn.created_at,
          read: false, // Connection requests are always unread
          avatar: profile?.avatar_url || undefined,
          icon: 'user',
          relatedId: conn.id,
        });
      });
    }

    // 2. Get recently accepted connections (where user is user_id or partner_id)
    const { data: acceptedConnections, error: acceptedError } = await supabase
      .from('connections')
      .select(`
        id,
        user_id,
        partner_id,
        match_score,
        accepted_at,
        profiles!connections_user_id_fkey (
          display_name,
          avatar_url
        ),
        partner:profiles!connections_partner_id_fkey (
          display_name,
          avatar_url
        )
      `)
      .or(`user_id.eq.${userId},partner_id.eq.${userId}`)
      .eq('status', 'accepted')
      .not('accepted_at', 'is', null)
      .order('accepted_at', { ascending: false })
      .limit(10);

    if (!acceptedError && acceptedConnections) {
      acceptedConnections.forEach((conn: any) => {
        const otherUser = conn.user_id === userId ? conn.partner : conn.profiles;
        if (otherUser) {
          notifications.push({
            id: `connection_accepted_${conn.id}`,
            type: 'connection_accepted',
            title: 'Connection Accepted',
            message: `${otherUser?.display_name || 'Someone'} accepted your connection request`,
            time: formatTimeAgo(conn.accepted_at),
            timestamp: conn.accepted_at,
            read: false,
            avatar: otherUser?.avatar_url || undefined,
            icon: 'heart',
            relatedId: conn.id,
          });
        }
      });
    }

    // 3. Get unread messages (grouped by conversation)
    const { data: unreadMessages, error: messagesError } = await supabase
      .from('messages')
      .select(`
        id,
        sender_id,
        content,
        created_at,
        profiles!messages_sender_id_fkey (
          display_name,
          avatar_url
        )
      `)
      .eq('receiver_id', userId)
      .eq('is_read', false)
      .order('created_at', { ascending: false })
      .limit(20);

    if (!messagesError && unreadMessages) {
      // Group by sender to avoid duplicate notifications
      const messageMap = new Map<string, any>();
      unreadMessages.forEach((msg: any) => {
        if (!messageMap.has(msg.sender_id)) {
          messageMap.set(msg.sender_id, msg);
        }
      });

      messageMap.forEach((msg: any) => {
        const profile = msg.profiles;
        notifications.push({
          id: `message_${msg.id}`,
          type: 'message',
          title: 'New Message',
          message: `${profile?.display_name || 'Someone'}: "${msg.content.substring(0, 50)}${msg.content.length > 50 ? '...' : ''}"`,
          time: formatTimeAgo(msg.created_at),
          timestamp: msg.created_at,
          read: false,
          avatar: profile?.avatar_url || undefined,
          icon: 'message',
          relatedId: msg.id,
        });
      });
    }

    // 4. Get recent matches (if matches table exists)
    try {
      const { data: matches, error: matchesError } = await supabase
        .from('matches')
        .select(`
          id,
          user_id_1,
          user_id_2,
          matched_at,
          created_at
        `)
        .or(`user_id_1.eq.${userId},user_id_2.eq.${userId}`)
        .eq('status', 'accepted')
        .not('matched_at', 'is', null)
        .order('matched_at', { ascending: false })
        .limit(10);

      if (!matchesError && matches && matches.length > 0) {
        // Fetch all profiles for matches in parallel
        const profilePromises = matches.map(async (match: any) => {
          const otherUserId = match.user_id_1 === userId ? match.user_id_2 : match.user_id_1;
          const { data: profile } = await supabase
            .from('profiles')
            .select('display_name, avatar_url')
            .eq('id', otherUserId)
            .single();
          
          if (profile) {
            return {
              id: `match_${match.id}`,
              type: 'match' as const,
              title: 'New Match!',
              message: `You matched with ${profile.display_name || 'Someone'}`,
              time: formatTimeAgo(match.matched_at || match.created_at),
              timestamp: match.matched_at || match.created_at,
              read: false,
              avatar: profile.avatar_url || undefined,
              icon: 'heart' as const,
              relatedId: match.id,
            };
          }
          return null;
        });

        const matchNotifications = await Promise.all(profilePromises);
        matchNotifications.forEach((notif) => {
          if (notif) {
            notifications.push(notif);
          }
        });
      }
    } catch (error) {
      // Matches table might not exist, ignore
      console.log('Matches table not available');
    }

    // Sort by timestamp (newest first)
    notifications.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return notifications;
  } catch (error) {
    console.error('[notificationsService] Error fetching notifications:', error);
    return [];
  }
}

/**
 * Mark notification as read
 * For connection requests, this marks the connection as viewed
 * For messages, this marks the message as read
 */
export async function markNotificationAsRead(notificationId: string, userId: string): Promise<void> {
  try {
    if (notificationId.startsWith('connection_')) {
      const connectionId = notificationId.replace('connection_', '');
      // Connection requests are marked as read when viewed
      // We could add a viewed_at field to connections table if needed
      return;
    } else if (notificationId.startsWith('message_')) {
      const messageId = notificationId.replace('message_', '');
      await supabase
        .from('messages')
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq('id', messageId)
        .eq('receiver_id', userId);
    } else if (notificationId.startsWith('connection_accepted_')) {
      // Connection accepted notifications are informational, no action needed
      return;
    } else if (notificationId.startsWith('match_')) {
      // Match notifications are informational, no action needed
      return;
    }
  } catch (error) {
    console.error('[notificationsService] Error marking notification as read:', error);
    throw error;
  }
}

/**
 * Mark all notifications as read
 */
export async function markAllNotificationsAsRead(userId: string): Promise<void> {
  try {
    // Mark all unread messages as read
    await supabase
      .from('messages')
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq('receiver_id', userId)
      .eq('is_read', false);

    // Connection requests and other notifications are informational
    // They don't have a read status in the database
  } catch (error) {
    console.error('[notificationsService] Error marking all notifications as read:', error);
    throw error;
  }
}

/**
 * Delete notification
 * For connection requests, this could reject the connection
 * For messages, this just removes from view (message still exists)
 */
export async function deleteNotification(notificationId: string, userId: string): Promise<void> {
  try {
    if (notificationId.startsWith('connection_')) {
      const connectionId = notificationId.replace('connection_', '');
      // Optionally reject the connection request
      // await supabase
      //   .from('connections')
      //   .update({ status: 'rejected' })
      //   .eq('id', connectionId)
      //   .eq('partner_id', userId);
      return;
    } else if (notificationId.startsWith('message_')) {
      // Messages can't be deleted, just marked as read
      await markNotificationAsRead(notificationId, userId);
    }
    // Other notification types are informational and don't need deletion
  } catch (error) {
    console.error('[notificationsService] Error deleting notification:', error);
    throw error;
  }
}

/**
 * Format timestamp as time ago (e.g., "2 min ago", "1 hour ago")
 */
function formatTimeAgo(timestamp: string): string {
  const now = new Date();
  const time = new Date(timestamp);
  const diffMs = now.getTime() - time.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} min ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
  return time.toLocaleDateString();
}

