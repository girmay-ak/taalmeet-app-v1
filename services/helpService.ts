/**
 * Help & Support Service
 * Backend service for managing help articles, FAQs, and support tickets
 */

import { supabase } from '@/lib/supabase';
import { parseSupabaseError } from '@/utils/errors';
import type {
  HelpArticle,
  FAQ,
  SupportTicket,
  SupportTicketInsert,
  SupportTicketMessage,
  SupportTicketMessageInsert,
} from '@/types/database';

// ============================================================================
// HELP ARTICLES
// ============================================================================

/**
 * Get all published help articles, optionally filtered by category
 */
export async function getHelpArticles(
  category?: HelpArticle['category']
): Promise<HelpArticle[]> {
  let query = supabase
    .from('help_articles')
    .select('*')
    .eq('is_published', true)
    .order('order_index', { ascending: true })
    .order('created_at', { ascending: false });

  if (category) {
    query = query.eq('category', category);
  }

  const { data, error } = await query;

  if (error) {
    throw parseSupabaseError(error);
  }

  return (data || []) as HelpArticle[];
}

/**
 * Get a single help article by slug
 */
export async function getHelpArticleBySlug(slug: string): Promise<HelpArticle | null> {
  const { data, error } = await supabase
    .from('help_articles')
    .select('*')
    .eq('slug', slug)
    .eq('is_published', true)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    throw parseSupabaseError(error);
  }

  // Increment view count
  await supabase.rpc('increment_article_views', {
    article_id: data.id,
  });

  return data as HelpArticle;
}

/**
 * Search help articles by title or content
 */
export async function searchHelpArticles(query: string): Promise<HelpArticle[]> {
  const { data, error } = await supabase
    .from('help_articles')
    .select('*')
    .eq('is_published', true)
    .or(`title.ilike.%${query}%,content.ilike.%${query}%`)
    .order('order_index', { ascending: true });

  if (error) {
    throw parseSupabaseError(error);
  }

  return (data || []) as HelpArticle[];
}

// ============================================================================
// FAQS
// ============================================================================

/**
 * Get all published FAQs, optionally filtered by category
 */
export async function getFAQs(category?: FAQ['category']): Promise<FAQ[]> {
  let query = supabase
    .from('faqs')
    .select('*')
    .eq('is_published', true)
    .order('order_index', { ascending: true })
    .order('created_at', { ascending: false });

  if (category) {
    query = query.eq('category', category);
  }

  const { data, error } = await query;

  if (error) {
    throw parseSupabaseError(error);
  }

  return (data || []) as FAQ[];
}

/**
 * Get a single FAQ by ID
 */
export async function getFAQById(id: string): Promise<FAQ | null> {
  const { data, error } = await supabase
    .from('faqs')
    .select('*')
    .eq('id', id)
    .eq('is_published', true)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    throw parseSupabaseError(error);
  }

  // Increment view count
  await supabase.rpc('increment_faq_views', {
    faq_id: data.id,
  });

  return data as FAQ;
}

/**
 * Rate an FAQ as helpful or not helpful
 */
export async function rateFAQ(faqId: string, isHelpful: boolean): Promise<void> {
  const { error } = await supabase.rpc('rate_faq', {
    faq_id: faqId,
    is_helpful: isHelpful,
  });

  if (error) {
    throw parseSupabaseError(error);
  }
}

/**
 * Search FAQs by question or answer
 */
export async function searchFAQs(query: string): Promise<FAQ[]> {
  const { data, error } = await supabase
    .from('faqs')
    .select('*')
    .eq('is_published', true)
    .or(`question.ilike.%${query}%,answer.ilike.%${query}%`)
    .order('order_index', { ascending: true });

  if (error) {
    throw parseSupabaseError(error);
  }

  return (data || []) as FAQ[];
}

// ============================================================================
// SUPPORT TICKETS
// ============================================================================

/**
 * Create a new support ticket
 */
export async function createSupportTicket(
  userId: string,
  subject: string,
  category: SupportTicket['category'],
  message: string,
  priority: SupportTicket['priority'] = 'medium'
): Promise<SupportTicket> {
  const insertData: SupportTicketInsert = {
    user_id: userId,
    subject,
    category,
    priority,
    first_message: message,
  };

  const { data, error } = await supabase
    .from('support_tickets')
    .insert(insertData)
    .select()
    .single();

  if (error) {
    throw parseSupabaseError(error);
  }

  // Create the first message
  await addSupportTicketMessage({
    ticket_id: data.id,
    sender_id: userId,
    message,
    is_internal: false,
  });

  return data as SupportTicket;
}

/**
 * Get user's support tickets
 */
export async function getUserSupportTickets(userId: string): Promise<SupportTicket[]> {
  const { data, error } = await supabase
    .from('support_tickets')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    throw parseSupabaseError(error);
  }

  return (data || []) as SupportTicket[];
}

/**
 * Get a single support ticket by ID
 */
export async function getSupportTicketById(
  ticketId: string,
  userId: string
): Promise<SupportTicket | null> {
  const { data, error } = await supabase
    .from('support_tickets')
    .select('*')
    .eq('id', ticketId)
    .eq('user_id', userId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    throw parseSupabaseError(error);
  }

  return data as SupportTicket;
}

/**
 * Update support ticket status
 */
export async function updateSupportTicketStatus(
  ticketId: string,
  userId: string,
  status: SupportTicket['status']
): Promise<SupportTicket> {
  const updateData: { status: SupportTicket['status']; resolved_at?: string } = {
    status,
  };

  if (status === 'resolved' || status === 'closed') {
    updateData.resolved_at = new Date().toISOString();
  }

  const { data, error } = await supabase
    .from('support_tickets')
    .update(updateData)
    .eq('id', ticketId)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) {
    throw parseSupabaseError(error);
  }

  return data as SupportTicket;
}

// ============================================================================
// SUPPORT TICKET MESSAGES
// ============================================================================

/**
 * Get messages for a support ticket
 */
export async function getSupportTicketMessages(
  ticketId: string
): Promise<SupportTicketMessage[]> {
  const { data, error } = await supabase
    .from('support_ticket_messages')
    .select('*')
    .eq('ticket_id', ticketId)
    .order('created_at', { ascending: true });

  if (error) {
    throw parseSupabaseError(error);
  }

  return (data || []) as SupportTicketMessage[];
}

/**
 * Add a message to a support ticket
 */
export async function addSupportTicketMessage(
  message: SupportTicketMessageInsert
): Promise<SupportTicketMessage> {
  const { data, error } = await supabase
    .from('support_ticket_messages')
    .insert(message)
    .select()
    .single();

  if (error) {
    throw parseSupabaseError(error);
  }

  return data as SupportTicketMessage;
}

