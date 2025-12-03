/**
 * Messages Service
 * Backend service for managing conversations and messages
 */

import { supabase } from '@/lib/supabase';
import {
  DatabaseError,
  RecordNotFoundError,
  ValidationError,
  parseSupabaseError,
} from '@/utils/errors';
import type {
  Conversation,
  ConversationParticipant,
  Message,
  MessageInsert,
  Profile,
} from '@/types/database';

// ============================================================================
// TYPES
// ============================================================================

export interface ConversationListItem {
  id: string;
  otherUser: {
    id: string;
    displayName: string;
    avatarUrl: string | null;
  };
  lastMessage: string | null;
  lastMessageAt: string | null;
  unreadCount: number;
}

// ============================================================================
// GET CONVERSATIONS
// ============================================================================

/**
 * Get all conversations for a user
 * Returns conversations with other user info, last message, and unread count
 */
export async function getConversations(userId: string): Promise<ConversationListItem[]> {
  // Get all conversations where user is a participant
  const { data: participants, error: participantsError } = await supabase
    .from('conversation_participants')
    .select('conversation_id, last_read_at')
    .eq('user_id', userId);

  if (participantsError) {
    throw parseSupabaseError(participantsError);
  }

  if (!participants || participants.length === 0) {
    return [];
  }

  const conversationIds = participants.map(p => p.conversation_id);
  const lastReadMap = new Map(
    participants.map(p => [p.conversation_id, p.last_read_at])
  );

  // Get conversations with last message info
  const { data: conversations, error: conversationsError } = await supabase
    .from('conversations')
    .select('*')
    .in('id', conversationIds)
    .order('last_message_at', { ascending: false, nullsFirst: false });

  if (conversationsError) {
    throw parseSupabaseError(conversationsError);
  }

  if (!conversations || conversations.length === 0) {
    return [];
  }

  // Get all participants for these conversations
  const { data: allParticipants, error: allParticipantsError } = await supabase
    .from('conversation_participants')
    .select('conversation_id, user_id')
    .in('conversation_id', conversationIds);

  if (allParticipantsError) {
    throw parseSupabaseError(allParticipantsError);
  }

  // Get unique user IDs (excluding current user)
  const otherUserIds = new Set<string>();
  const conversationToOtherUser = new Map<string, string>();

  (allParticipants || []).forEach((p: any) => {
    if (p.user_id !== userId) {
      otherUserIds.add(p.user_id);
      // Map conversation to other user (for 1-on-1 conversations)
      if (!conversationToOtherUser.has(p.conversation_id)) {
        conversationToOtherUser.set(p.conversation_id, p.user_id);
      }
    }
  });

  // Get profiles for other users
  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('id, display_name, avatar_url')
    .in('id', Array.from(otherUserIds));

  if (profilesError) {
    throw parseSupabaseError(profilesError);
  }

  // Create profile map
  const profileMap = new Map(
    (profiles || []).map((p: any) => [p.id, p])
  );

  // Calculate unread counts for each conversation
  const unreadCounts = await Promise.all(
    conversationIds.map(async (convId) => {
      const lastRead = lastReadMap.get(convId);
      
      // Count unread messages (messages from other user that are unread)
      const otherUserId = conversationToOtherUser.get(convId);
      if (!otherUserId) {
        return { convId, count: 0 };
      }

      let query = supabase
        .from('messages')
        .select('id', { count: 'exact', head: true })
        .eq('conversation_id', convId)
        .eq('sender_id', otherUserId)
        .eq('is_read', false);

      if (lastRead) {
        query = query.gt('created_at', lastRead);
      }

      const { count, error } = await query;
      return { convId, count: count || 0 };
    })
  );

  const unreadMap = new Map(unreadCounts.map(u => [u.convId, u.count]));

  // Build result
  return conversations.map(conv => {
    const otherUserId = conversationToOtherUser.get(conv.id);
    const otherUserProfile = otherUserId ? profileMap.get(otherUserId) : null;

    return {
      id: conv.id,
      otherUser: {
        id: otherUserId || '',
        displayName: otherUserProfile?.display_name || 'Unknown User',
        avatarUrl: otherUserProfile?.avatar_url || null,
      },
      lastMessage: conv.last_message_content || null,
      lastMessageAt: conv.last_message_at || null,
      unreadCount: unreadMap.get(conv.id) || 0,
    };
  });
}

// ============================================================================
// GET MESSAGES
// ============================================================================

/**
 * Get all messages in a conversation
 * Sorted by created_at ascending (oldest first)
 */
export async function getMessages(conversationId: string): Promise<Message[]> {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true });

  if (error) {
    throw parseSupabaseError(error);
  }

  return data || [];
}

// ============================================================================
// SEND MESSAGE
// ============================================================================

/**
 * Send a message in a conversation
 * - Inserts message with sender_id
 * - Updates conversation.last_message + last_message_at (via trigger)
 * - Messages from sender are automatically marked as read for sender
 * - Messages remain unread for other participant
 */
export async function sendMessage(
  conversationId: string,
  text: string,
  senderId: string
): Promise<Message> {
  if (!text || text.trim().length === 0) {
    throw new ValidationError('Message content cannot be empty');
  }

  // Verify user is a participant
  const { data: participant, error: participantError } = await supabase
    .from('conversation_participants')
    .select('conversation_id')
    .eq('conversation_id', conversationId)
    .eq('user_id', senderId)
    .single();

  if (participantError || !participant) {
    throw new ValidationError('User is not a participant in this conversation');
  }

  // Insert message
  // Note: The trigger will automatically update conversation.last_message_at and last_message_content
  // Messages start as unread (is_read = false)
  // The unread count for the receiver is calculated by counting messages where sender_id != receiver_id AND is_read = false
  // The sender's messages are always considered "read" from their perspective (we don't check is_read for messages they sent)
  const insertData: MessageInsert = {
    conversation_id: conversationId,
    sender_id: senderId,
    content: text.trim(),
    is_read: false, // Unread for receiver, will be marked as read when receiver marks conversation as read
  };

  const { data, error } = await supabase
    .from('messages')
    .insert(insertData)
    .select()
    .single();

  if (error) {
    throw parseSupabaseError(error);
  }

  return data;
}

// ============================================================================
// CREATE CONVERSATION
// ============================================================================

/**
 * Create a conversation between current user and another user
 * - Checks if conversation already exists
 * - If exists → returns existing conversation_id
 * - If not → creates new conversation and adds both users as participants
 */
export async function createConversation(
  userId: string,
  otherUserId: string
): Promise<string> {
  if (userId === otherUserId) {
    throw new ValidationError('Cannot create conversation with yourself');
  }

  // Check if conversation already exists
  // Get all conversations where current user is a participant
  const { data: userConversations, error: userConvError } = await supabase
    .from('conversation_participants')
    .select('conversation_id')
    .eq('user_id', userId);

  if (userConvError) {
    throw parseSupabaseError(userConvError);
  }

  if (userConversations && userConversations.length > 0) {
    const conversationIds = userConversations.map(c => c.conversation_id);

    // Check if any of these conversations also have the other user
    const { data: existing, error: checkError } = await supabase
      .from('conversation_participants')
      .select('conversation_id')
      .eq('user_id', otherUserId)
      .in('conversation_id', conversationIds)
      .limit(1)
      .single();

    if (existing && !checkError) {
      // Conversation already exists
      return existing.conversation_id;
    }
  }

  // Create new conversation
  const { data: newConversation, error: createError } = await supabase
    .from('conversations')
    .insert({})
    .select()
    .single();

  if (createError || !newConversation) {
    throw parseSupabaseError(createError || new Error('Failed to create conversation'));
  }

  // Add both users as participants
  const { error: participantsError } = await supabase
    .from('conversation_participants')
    .insert([
      { conversation_id: newConversation.id, user_id: userId },
      { conversation_id: newConversation.id, user_id: otherUserId },
    ]);

  if (participantsError) {
    throw parseSupabaseError(participantsError);
  }

  return newConversation.id;
}

// ============================================================================
// MARK AS READ
// ============================================================================

/**
 * Mark all messages in a conversation as read for the current user
 * - Sets messages.is_read = true for messages not sent by current user
 * - Updates conversation_participants.last_read_at
 * - The trigger will automatically mark messages as read
 */
export async function markAsRead(
  conversationId: string,
  userId: string
): Promise<void> {
  // Update participant's last_read_at
  // The trigger will automatically mark messages as read
  const { error } = await supabase
    .from('conversation_participants')
    .update({ last_read_at: new Date().toISOString() })
    .eq('conversation_id', conversationId)
    .eq('user_id', userId);

  if (error) {
    throw parseSupabaseError(error);
  }

  // Also explicitly mark all unread messages from other users as read
  // (in case trigger doesn't fire or for immediate update)
  await supabase
    .from('messages')
    .update({
      is_read: true,
      read_at: new Date().toISOString(),
    })
    .eq('conversation_id', conversationId)
    .neq('sender_id', userId)
    .eq('is_read', false);
}
