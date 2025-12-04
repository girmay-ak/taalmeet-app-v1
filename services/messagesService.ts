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
import { getBlockedUserIds } from './safetyService';
import { ENABLE_LOGGING } from '@/lib/config';

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
  if (ENABLE_LOGGING) {
    console.log('[messagesService] getConversations called with userId:', userId);
  }
  
  // Get all conversations where user is a participant
  const { data: participants, error: participantsError } = await supabase
    .from('conversation_participants')
    .select('conversation_id, last_read_at')
    .eq('user_id', userId);

  if (participantsError) {
    console.error('[messagesService] Error fetching participants:', participantsError);
    throw parseSupabaseError(participantsError);
  }

  if (ENABLE_LOGGING) {
    console.log('[messagesService] Participants found:', participants?.length || 0, participants);
  }

  if (!participants || participants.length === 0) {
    if (ENABLE_LOGGING) {
      console.log('[messagesService] No participants found, returning empty array');
    }
    return [];
  }

  const conversationIds = participants.map(p => p.conversation_id);
  const lastReadMap = new Map(
    participants.map(p => [p.conversation_id, p.last_read_at])
  );

  // Get conversations with last message info
  if (ENABLE_LOGGING) {
    console.log('[messagesService] Fetching conversations for IDs:', conversationIds);
  }
  const { data: conversations, error: conversationsError } = await supabase
    .from('conversations')
    .select('*')
    .in('id', conversationIds)
    .order('last_message_at', { ascending: false, nullsFirst: false });

  if (conversationsError) {
    console.error('[messagesService] Error fetching conversations:', conversationsError);
    throw parseSupabaseError(conversationsError);
  }

  if (ENABLE_LOGGING) {
    console.log('[messagesService] Conversations found:', conversations?.length || 0, conversations);
  }

  if (!conversations || conversations.length === 0) {
    if (ENABLE_LOGGING) {
      console.log('[messagesService] No conversations found, returning empty array');
    }
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
  if (ENABLE_LOGGING) {
    console.log('[messagesService] Fetching profiles for user IDs:', Array.from(otherUserIds));
  }
  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('id, display_name, avatar_url')
    .in('id', Array.from(otherUserIds));

  if (profilesError) {
    console.error('[messagesService] Error fetching profiles:', profilesError);
    throw parseSupabaseError(profilesError);
  }

  if (ENABLE_LOGGING) {
    console.log('[messagesService] Profiles found:', profiles?.length || 0, profiles);
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

  // Fetch actual last messages for conversations where last_message_content is null
  // but last_message_at is set (indicating messages exist)
  const conversationsNeedingLastMessage = conversations.filter(
    conv => !conv.last_message_content && conv.last_message_at
  );
  
  const lastMessageMap = new Map<string, string>();
  
  if (conversationsNeedingLastMessage.length > 0) {
    const lastMessagePromises = conversationsNeedingLastMessage.map(async (conv) => {
      const { data: lastMsg, error } = await supabase
        .from('messages')
        .select('content')
        .eq('conversation_id', conv.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      
      if (!error && lastMsg) {
        return { convId: conv.id, content: lastMsg.content };
      }
      return null;
    });
    
    const lastMessages = await Promise.all(lastMessagePromises);
    lastMessages.forEach(msg => {
      if (msg) {
        lastMessageMap.set(msg.convId, msg.content);
      }
    });
  }

  // Build result
  const result = conversations.map(conv => {
    const otherUserId = conversationToOtherUser.get(conv.id);
    const otherUserProfile = otherUserId ? profileMap.get(otherUserId) : null;

    // Use last_message_content if available, otherwise fetch from map
    const lastMessage = conv.last_message_content || lastMessageMap.get(conv.id) || null;

    return {
      id: conv.id,
      otherUser: {
        id: otherUserId || '',
        displayName: otherUserProfile?.display_name || 'Unknown User',
        avatarUrl: otherUserProfile?.avatar_url || null,
      },
      lastMessage: lastMessage,
      lastMessageAt: conv.last_message_at || null,
      unreadCount: unreadMap.get(conv.id) || 0,
    };
  });

  // Filter out conversations with blocked users
  const blockedIds = await getBlockedUserIds(userId);
  const blockedSet = new Set(blockedIds);
  const filteredResult = result.filter(
    (conv) => !blockedSet.has(conv.otherUser.id)
  );

  if (ENABLE_LOGGING) {
    console.log('[messagesService] getConversations returning:', filteredResult.length, 'conversations', filteredResult);
  }
  return filteredResult;
}

// ============================================================================
// GET MESSAGES
// ============================================================================

/**
 * Get all messages in a conversation
 * Sorted by created_at ascending (oldest first)
 */
export async function getMessages(conversationId: string): Promise<Message[]> {
  if (ENABLE_LOGGING) {
    console.log('[messagesService] getMessages called with conversationId:', conversationId);
  }
  
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('[messagesService] Error fetching messages:', error);
    throw parseSupabaseError(error);
  }

  if (ENABLE_LOGGING) {
    console.log('[messagesService] getMessages returning:', data?.length || 0, 'messages');
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
  if (ENABLE_LOGGING) {
    console.log('[messagesService] sendMessage called:', { conversationId, text: text.substring(0, 50), senderId });
  }
  
  if (!text || text.trim().length === 0) {
    if (ENABLE_LOGGING) {
      console.error('[messagesService] Message content is empty');
    }
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
    console.error('[messagesService] User is not a participant:', participantError);
    throw new ValidationError('User is not a participant in this conversation');
  }

  if (ENABLE_LOGGING) {
    console.log('[messagesService] Participant verified, inserting message');
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
    console.error('[messagesService] Error sending message:', error);
    throw parseSupabaseError(error);
  }

  if (ENABLE_LOGGING) {
    console.log('[messagesService] Message sent successfully:', data.id);
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
  if (ENABLE_LOGGING) {
    console.log('[messagesService] createConversation called:', { userId, otherUserId });
  }
  
  if (userId === otherUserId) {
    if (ENABLE_LOGGING) {
      console.error('[messagesService] Cannot create conversation with yourself');
    }
    throw new ValidationError('Cannot create conversation with yourself');
  }

  // Check if conversation already exists
  // Get all conversations where current user is a participant
  const { data: userConversations, error: userConvError } = await supabase
    .from('conversation_participants')
    .select('conversation_id')
    .eq('user_id', userId);

  if (userConvError) {
    console.error('[messagesService] Error checking existing conversations:', userConvError);
    throw parseSupabaseError(userConvError);
  }

  if (ENABLE_LOGGING) {
    console.log('[messagesService] User conversations found:', userConversations?.length || 0);
  }

  if (userConversations && userConversations.length > 0) {
    const conversationIds = userConversations.map(c => c.conversation_id);
    if (ENABLE_LOGGING) {
      console.log('[messagesService] Checking for existing conversation with IDs:', conversationIds);
    }

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
      if (ENABLE_LOGGING) {
        console.log('[messagesService] Existing conversation found:', existing.conversation_id);
      }
      return existing.conversation_id;
    }
    if (ENABLE_LOGGING) {
      console.log('[messagesService] No existing conversation found, creating new one');
    }
  }

  // Create new conversation using SECURITY DEFINER function
  // This bypasses RLS and allows us to add both participants
  if (ENABLE_LOGGING) {
    console.log('[messagesService] Creating new conversation using function');
  }
  const { data: conversationId, error: createError } = await supabase
    .rpc('get_or_create_conversation', {
      user1_id: userId,
      user2_id: otherUserId,
    })
    .single();

  if (createError) {
    console.error('[messagesService] Error creating conversation:', createError);
    throw parseSupabaseError(createError);
  }

  if (!conversationId) {
    console.error('[messagesService] No conversation ID returned');
    throw new Error('Failed to create conversation');
  }

  if (ENABLE_LOGGING) {
    console.log('[messagesService] Conversation created/found:', conversationId);
  }
  return conversationId;
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
  if (ENABLE_LOGGING) {
    console.log('[messagesService] markAsRead called:', { conversationId, userId });
  }
  
  // Update participant's last_read_at
  // The trigger will automatically mark messages as read
  const { error } = await supabase
    .from('conversation_participants')
    .update({ last_read_at: new Date().toISOString() })
    .eq('conversation_id', conversationId)
    .eq('user_id', userId);

  if (error) {
    console.error('[messagesService] Error marking as read:', error);
    throw parseSupabaseError(error);
  }

  if (ENABLE_LOGGING) {
    console.log('[messagesService] Marked as read successfully');
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
