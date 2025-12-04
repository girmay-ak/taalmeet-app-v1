/**
 * Data Export Service
 * Handles GDPR data export requests
 */

import { supabase } from '@/lib/supabase';
import { parseSupabaseError } from '@/utils/errors';
import type { Profile, UserLanguage, Connection, Message, Conversation } from '@/types/database';

// ============================================================================
// TYPES
// ============================================================================

export interface UserDataExport {
  profile: Profile | null;
  languages: UserLanguage[];
  connections: Connection[];
  conversations: Conversation[];
  messages: Message[];
  exportDate: string;
}

// ============================================================================
// EXPORT USER DATA
// ============================================================================

/**
 * Export all user data for GDPR compliance
 * Returns a JSON object with all user data
 */
export async function exportUserData(userId: string): Promise<UserDataExport> {
  // Get profile
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (profileError && profileError.code !== 'PGRST116') {
    throw parseSupabaseError(profileError);
  }

  // Get languages
  const { data: languages = [], error: languagesError } = await supabase
    .from('user_languages')
    .select('*')
    .eq('user_id', userId);

  if (languagesError) {
    throw parseSupabaseError(languagesError);
  }

  // Get connections
  const { data: connections = [], error: connectionsError } = await supabase
    .from('connections')
    .select('*')
    .or(`user_id.eq.${userId},partner_id.eq.${userId}`);

  if (connectionsError) {
    throw parseSupabaseError(connectionsError);
  }

  // Get conversations
  const { data: participants, error: participantsError } = await supabase
    .from('conversation_participants')
    .select('conversation_id')
    .eq('user_id', userId);

  if (participantsError) {
    throw parseSupabaseError(participantsError);
  }

  const conversationIds = (participants || []).map(p => p.conversation_id);
  let conversations: Conversation[] = [];
  let messages: Message[] = [];

  if (conversationIds.length > 0) {
    // Get conversations
    const { data: convs, error: convsError } = await supabase
      .from('conversations')
      .select('*')
      .in('id', conversationIds);

    if (convsError) {
      throw parseSupabaseError(convsError);
    }

    conversations = convs || [];

    // Get messages
    const { data: msgs, error: msgsError } = await supabase
      .from('messages')
      .select('*')
      .in('conversation_id', conversationIds)
      .order('created_at', { ascending: true });

    if (msgsError) {
      throw parseSupabaseError(msgsError);
    }

    messages = msgs || [];
  }

  return {
    profile: profile || null,
    languages: languages || [],
    connections: connections || [],
    conversations: conversations || [],
    messages: messages || [],
    exportDate: new Date().toISOString(),
  };
}

