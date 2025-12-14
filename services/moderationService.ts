/**
 * Moderation Service
 * Backend service for content moderation and admin actions
 * Required for App Store compliance (safety, abuse prevention)
 */

import { supabase } from '@/lib/supabase';
import {
  DatabaseError,
  ValidationError,
  parseSupabaseError,
} from '@/utils/errors';
import { z } from 'zod';
import type { Report, ReportUpdate, UserAction, UserActionInsert, Profile } from '@/types/database';

// ============================================================================
// TYPES
// ============================================================================

export interface ReportWithDetails extends Report {
  reporter: {
    id: string;
    display_name: string;
    avatar_url: string | null;
  };
  target: {
    id: string;
    display_name: string;
    avatar_url: string | null;
  };
  action_taken?: UserAction | null;
}

export interface UserActionWithUser extends UserAction {
  user: {
    id: string;
    display_name: string;
    avatar_url: string | null;
  };
  created_by_user?: {
    id: string;
    display_name: string;
  } | null;
}

// Validation schemas
const createActionSchema = z.object({
  user_id: z.string().uuid('Invalid user ID'),
  action_type: z.enum(['warning', 'suspension', 'ban']),
  reason: z.string().min(1, 'Reason is required').max(500, 'Reason too long'),
  details: z.string().max(2000, 'Details too long').optional().nullable(),
  duration_days: z.number().int().positive().optional().nullable(),
});

// ============================================================================
// CHECK ADMIN STATUS
// ============================================================================

/**
 * Check if current user is an admin
 */
export async function isAdmin(userId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', userId)
    .single();

  if (error || !data) {
    return false;
  }

  return data.is_admin === true;
}

/**
 * Check if a user is banned or suspended
 */
export async function isUserBannedOrSuspended(userId: string): Promise<boolean> {
  const { data, error } = await supabase
    .rpc('is_user_banned_or_suspended', {
      check_user_id: userId,
    })
    .single();

  if (error) {
    // Fallback: manual check
    const { data: actions } = await supabase
      .from('user_actions')
      .select('id')
      .eq('user_id', userId)
      .eq('is_active', true)
      .in('action_type', ['ban', 'suspension'])
      .or('expires_at.is.null,expires_at.gt.' + new Date().toISOString())
      .limit(1);

    return (actions || []).length > 0;
  }

  return data === true;
}

// ============================================================================
// REPORTS MANAGEMENT (ADMIN)
// ============================================================================

/**
 * Get all reports (admin only)
 */
export async function getAllReports(
  status?: Report['status'],
  limit: number = 50
): Promise<ReportWithDetails[]> {
  let query = supabase
    .from('reports')
    .select(`
      *,
      reporter:profiles!reports_reporter_id_fkey(id, display_name, avatar_url),
      target:profiles!reports_target_id_fkey(id, display_name, avatar_url),
      action_taken:user_actions(*)
    `)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (status) {
    query = query.eq('status', status);
  }

  const { data, error } = await query;

  if (error) {
    throw parseSupabaseError(error);
  }

  return (data || []) as ReportWithDetails[];
}

/**
 * Get report by ID with details
 */
export async function getReportById(reportId: string): Promise<ReportWithDetails | null> {
  const { data, error } = await supabase
    .from('reports')
    .select(`
      *,
      reporter:profiles!reports_reporter_id_fkey(id, display_name, avatar_url),
      target:profiles!reports_target_id_fkey(id, display_name, avatar_url),
      action_taken:user_actions(*)
    `)
    .eq('id', reportId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    throw parseSupabaseError(error);
  }

  return data as ReportWithDetails;
}

/**
 * Update report status (admin only)
 */
export async function updateReportStatus(
  reportId: string,
  status: Report['status'],
  adminNotes?: string,
  adminId: string
): Promise<Report> {
  const updateData: ReportUpdate = {
    status,
    reviewed_by: adminId,
    reviewed_at: new Date().toISOString(),
  };

  if (adminNotes) {
    updateData.admin_notes = adminNotes;
  }

  const { data, error } = await supabase
    .from('reports')
    .update(updateData)
    .eq('id', reportId)
    .select()
    .single();

  if (error) {
    throw parseSupabaseError(error);
  }

  return data;
}

// ============================================================================
// USER ACTIONS (ADMIN)
// ============================================================================

/**
 * Create a user action (warning, suspension, ban)
 */
export async function createUserAction(
  actionData: UserActionInsert,
  adminId: string
): Promise<UserAction> {
  // Validate input
  const validated = createActionSchema.parse(actionData);

  // Calculate expires_at if duration_days is provided
  let expiresAt: string | null = null;
  if (validated.duration_days && validated.action_type !== 'ban') {
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + validated.duration_days);
    expiresAt = expiryDate.toISOString();
  }

  const insertData: UserActionInsert = {
    ...validated,
    expires_at: expiresAt,
    created_by: adminId,
  };

  const { data, error } = await supabase
    .from('user_actions')
    .insert(insertData)
    .select()
    .single();

  if (error) {
    throw parseSupabaseError(error);
  }

  // If this is for a report, link the action to the report
  // (This would be done separately when updating the report)

  return data;
}

/**
 * Get all user actions (admin only)
 */
export async function getAllUserActions(
  userId?: string,
  actionType?: UserAction['action_type'],
  limit: number = 50
): Promise<UserActionWithUser[]> {
  let query = supabase
    .from('user_actions')
    .select(`
      *,
      user:profiles!user_actions_user_id_fkey(id, display_name, avatar_url),
      created_by_user:profiles!user_actions_created_by_fkey(id, display_name)
    `)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (userId) {
    query = query.eq('user_id', userId);
  }

  if (actionType) {
    query = query.eq('action_type', actionType);
  }

  const { data, error } = await query;

  if (error) {
    throw parseSupabaseError(error);
  }

  return (data || []) as UserActionWithUser[];
}

/**
 * Resolve/Deactivate a user action
 */
export async function resolveUserAction(
  actionId: string,
  adminId: string
): Promise<UserAction> {
  const { data, error } = await supabase
    .from('user_actions')
    .update({
      is_active: false,
      resolved_at: new Date().toISOString(),
      resolved_by: adminId,
    })
    .eq('id', actionId)
    .select()
    .single();

  if (error) {
    throw parseSupabaseError(error);
  }

  return data;
}

/**
 * Link a user action to a report
 */
export async function linkActionToReport(
  reportId: string,
  actionId: string,
  adminId: string
): Promise<void> {
  const { error } = await supabase
    .from('reports')
    .update({
      status: 'action_taken',
      action_taken_id: actionId,
      reviewed_by: adminId,
      reviewed_at: new Date().toISOString(),
    })
    .eq('id', reportId);

  if (error) {
    throw parseSupabaseError(error);
  }
}

// ============================================================================
// CONTENT FILTERING
// ============================================================================

/**
 * Check if message contains profanity or inappropriate content
 * Simple implementation - in production, use a proper profanity filter library
 */
export function containsProfanity(text: string): boolean {
  const profanityWords = [
    // Add common profanity words here (keep this minimal for example)
    // In production, use a proper library like 'bad-words' or similar
  ];

  const lowerText = text.toLowerCase();
  return profanityWords.some(word => lowerText.includes(word));
}

/**
 * Check if message is spam
 * Simple heuristics - in production, use ML-based spam detection
 */
export function isSpam(text: string): boolean {
  // Skip spam detection for very short messages (likely legitimate)
  if (text.trim().length < 50) {
    return false;
  }

  // Check for excessive repetition (only for longer messages)
  const words = text.split(/\s+/);
  if (words.length > 15) {
    const uniqueWords = new Set(words);
    const repetitionRatio = uniqueWords.size / words.length;
    // More lenient: only flag if repetition ratio is very low (< 0.2) and message is long (> 20 words)
    if (repetitionRatio < 0.2 && words.length > 20) {
      return true;
    }
  }

  // Check for excessive capitalization (only for longer messages)
  if (text.length > 50) {
    const capsRatio = (text.match(/[A-Z]/g) || []).length / text.length;
    // More lenient: only flag if > 80% caps and message is long
    if (capsRatio > 0.8 && text.length > 50) {
      return true;
    }
  }

  // Check for excessive special characters (exclude common punctuation)
  // Only count suspicious special chars, not common punctuation like . , ? !
  const suspiciousChars = text.match(/[!@#$%^&*(){}|<>]/g) || [];
  const suspiciousCharRatio = suspiciousChars.length / text.length;
  // More lenient: only flag if > 40% suspicious chars and message is long
  if (suspiciousCharRatio > 0.4 && text.length > 50) {
    return true;
  }

  return false;
}

/**
 * Validate message content before sending
 * Returns validation result with reason if invalid
 */
export function validateMessageContent(text: string): {
  isValid: boolean;
  reason?: string;
} {
  if (!text || text.trim().length === 0) {
    return { isValid: false, reason: 'Message cannot be empty' };
  }

  if (text.length > 2000) {
    return { isValid: false, reason: 'Message is too long (max 2000 characters)' };
  }

  if (containsProfanity(text)) {
    return { isValid: false, reason: 'Message contains inappropriate content' };
  }

  if (isSpam(text)) {
    return { isValid: false, reason: 'Message appears to be spam' };
  }

  return { isValid: true };
}

// ============================================================================
// ADMIN STATISTICS
// ============================================================================

export interface AdminStatistics {
  totalUsers: number;
  activeUsers: number; // Online in last 24 hours
  totalReports: number;
  pendingReports: number;
  totalActions: number;
  activeBans: number;
  activeSuspensions: number;
  totalConnections: number;
  totalConversations: number;
  totalMessages: number;
}

/**
 * Get admin statistics dashboard
 */
export async function getAdminStatistics(): Promise<AdminStatistics> {
  // Get total users count
  const { count: totalUsers, error: usersError } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true });

  if (usersError) {
    throw parseSupabaseError(usersError);
  }

  // Get active users (online in last 24 hours)
  const yesterday = new Date();
  yesterday.setHours(yesterday.getHours() - 24);
  
  const { count: activeUsers, error: activeError } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .gte('last_active_at', yesterday.toISOString());

  if (activeError) {
    throw parseSupabaseError(activeError);
  }

  // Get total reports count
  const { count: totalReports, error: reportsError } = await supabase
    .from('reports')
    .select('*', { count: 'exact', head: true });

  if (reportsError) {
    throw parseSupabaseError(reportsError);
  }

  // Get pending reports count
  const { count: pendingReports, error: pendingError } = await supabase
    .from('reports')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'pending');

  if (pendingError) {
    throw parseSupabaseError(pendingError);
  }

  // Get total actions count
  const { count: totalActions, error: actionsError } = await supabase
    .from('user_actions')
    .select('*', { count: 'exact', head: true });

  if (actionsError) {
    throw parseSupabaseError(actionsError);
  }

  // Get active bans count
  const { count: activeBans, error: bansError } = await supabase
    .from('user_actions')
    .select('*', { count: 'exact', head: true })
    .eq('action_type', 'ban')
    .eq('is_active', true)
    .or('expires_at.is.null,expires_at.gt.' + new Date().toISOString());

  if (bansError) {
    throw parseSupabaseError(bansError);
  }

  // Get active suspensions count
  const { count: activeSuspensions, error: suspensionsError } = await supabase
    .from('user_actions')
    .select('*', { count: 'exact', head: true })
    .eq('action_type', 'suspension')
    .eq('is_active', true)
    .gt('expires_at', new Date().toISOString());

  if (suspensionsError) {
    throw parseSupabaseError(suspensionsError);
  }

  // Get total connections count
  const { count: totalConnections, error: connectionsError } = await supabase
    .from('connections')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'accepted');

  if (connectionsError) {
    throw parseSupabaseError(connectionsError);
  }

  // Get total conversations count
  const { count: totalConversations, error: conversationsError } = await supabase
    .from('conversations')
    .select('*', { count: 'exact', head: true });

  if (conversationsError) {
    throw parseSupabaseError(conversationsError);
  }

  // Get total messages count
  const { count: totalMessages, error: messagesError } = await supabase
    .from('messages')
    .select('*', { count: 'exact', head: true });

  if (messagesError) {
    throw parseSupabaseError(messagesError);
  }

  return {
    totalUsers: totalUsers || 0,
    activeUsers: activeUsers || 0,
    totalReports: totalReports || 0,
    pendingReports: pendingReports || 0,
    totalActions: totalActions || 0,
    activeBans: activeBans || 0,
    activeSuspensions: activeSuspensions || 0,
    totalConnections: totalConnections || 0,
    totalConversations: totalConversations || 0,
    totalMessages: totalMessages || 0,
  };
}

