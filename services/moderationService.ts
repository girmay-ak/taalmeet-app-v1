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
  // Check for excessive repetition
  const words = text.split(/\s+/);
  if (words.length > 0) {
    const uniqueWords = new Set(words);
    const repetitionRatio = uniqueWords.size / words.length;
    if (repetitionRatio < 0.3 && words.length > 10) {
      return true;
    }
  }

  // Check for excessive capitalization
  const capsRatio = (text.match(/[A-Z]/g) || []).length / text.length;
  if (capsRatio > 0.7 && text.length > 20) {
    return true;
  }

  // Check for excessive special characters
  const specialCharRatio = (text.match(/[!@#$%^&*(),.?":{}|<>]/g) || []).length / text.length;
  if (specialCharRatio > 0.3) {
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

