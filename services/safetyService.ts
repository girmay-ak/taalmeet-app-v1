/**
 * Safety Service
 * Backend service for user blocking and reporting features
 * Required for App Store compliance (safety, harassment prevention)
 */

import { supabase } from '@/lib/supabase';
import {
  DatabaseError,
  RecordNotFoundError,
  ValidationError,
  parseSupabaseError,
} from '@/utils/errors';
import { z } from 'zod';

// ============================================================================
// TYPES
// ============================================================================

export interface BlockedUser {
  id: string;
  blocker_id: string;
  blocked_id: string;
  created_at: string;
}

export interface BlockedUserWithProfile extends BlockedUser {
  blocked_user: {
    id: string;
    display_name: string;
    avatar_url: string | null;
  };
}

export interface Report {
  id: string;
  reporter_id: string;
  target_id: string;
  reason: string;
  message: string | null;
  created_at: string;
}

export interface ReportInsert {
  target_id: string;
  reason: string;
  message?: string | null;
}

// Validation schemas
const reportSchema = z.object({
  target_id: z.string().uuid('Invalid user ID'),
  reason: z.string().min(1, 'Reason is required').max(500, 'Reason too long'),
  message: z.string().max(2000, 'Message too long').optional().nullable(),
});

// ============================================================================
// BLOCK USER
// ============================================================================

/**
 * Block a user
 * - Prevents the blocked user from appearing in discover, connections, chat
 * - Bidirectional visibility (if A blocks B, B cannot see A either)
 * - If already blocked, returns existing record
 */
export async function blockUser(
  blockerId: string,
  targetUserId: string
): Promise<BlockedUser> {
  if (blockerId === targetUserId) {
    throw new ValidationError('Cannot block yourself');
  }

  // Check if already blocked
  const { data: existing, error: checkError } = await supabase
    .from('blocked_users')
    .select('*')
    .eq('blocker_id', blockerId)
    .eq('blocked_id', targetUserId)
    .single();

  if (checkError && checkError.code !== 'PGRST116') {
    throw parseSupabaseError(checkError);
  }

  if (existing) {
    return existing;
  }

  // Create new block
  const { data, error } = await supabase
    .from('blocked_users')
    .insert({
      blocker_id: blockerId,
      blocked_id: targetUserId,
    })
    .select()
    .single();

  if (error) {
    throw parseSupabaseError(error);
  }

  return data;
}

// ============================================================================
// UNBLOCK USER
// ============================================================================

/**
 * Unblock a user
 * - Removes the block, allowing the user to appear in feeds again
 */
export async function unblockUser(
  blockerId: string,
  targetUserId: string
): Promise<void> {
  const { error } = await supabase
    .from('blocked_users')
    .delete()
    .eq('blocker_id', blockerId)
    .eq('blocked_id', targetUserId);

  if (error) {
    throw parseSupabaseError(error);
  }
}

// ============================================================================
// GET BLOCKED USERS
// ============================================================================

/**
 * Get all users blocked by the current user
 * Returns blocked users with their profile information
 */
export async function getBlockedUsers(
  userId: string
): Promise<BlockedUserWithProfile[]> {
  const { data: blocks, error } = await supabase
    .from('blocked_users')
    .select(`
      *,
      blocked_user:profiles!blocked_users_blocked_id_fkey(
        id,
        display_name,
        avatar_url
      )
    `)
    .eq('blocker_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    throw parseSupabaseError(error);
  }

  return (blocks || []) as BlockedUserWithProfile[];
}

// ============================================================================
// CHECK IF USER IS BLOCKED
// ============================================================================

/**
 * Check if a user is blocked (bidirectional check)
 * Returns true if either user has blocked the other
 */
export async function isUserBlocked(
  userId1: string,
  userId2: string
): Promise<boolean> {
  if (userId1 === userId2) {
    return false;
  }

  // Check both directions
  const { data, error } = await supabase
    .rpc('is_user_blocked', {
      user1_id: userId1,
      user2_id: userId2,
    })
    .single();

  if (error) {
    // If function doesn't exist, fall back to manual check
    const { data: blockData } = await supabase
      .from('blocked_users')
      .select('id')
      .or(
        `and(blocker_id.eq.${userId1},blocked_id.eq.${userId2}),and(blocker_id.eq.${userId2},blocked_id.eq.${userId1})`
      )
      .limit(1)
      .single();

    return !!blockData;
  }

  return data === true;
}

// ============================================================================
// GET BLOCKED USER IDS
// ============================================================================

/**
 * Get all user IDs that are blocked in relation to the current user
 * Returns IDs of users who have blocked this user OR users this user has blocked
 * Useful for filtering queries
 */
export async function getBlockedUserIds(userId: string): Promise<string[]> {
  // Try using the function first
  const { data: functionResult, error: functionError } = await supabase
    .rpc('get_blocked_user_ids', {
      for_user_id: userId,
    });

  if (!functionError && functionResult) {
    return functionResult.map((row: { blocked_user_id: string }) => row.blocked_user_id);
  }

  // Fallback: manual query
  const { data: blocks, error } = await supabase
    .from('blocked_users')
    .select('blocker_id, blocked_id')
    .or(`blocker_id.eq.${userId},blocked_id.eq.${userId}`);

  if (error) {
    throw parseSupabaseError(error);
  }

  const blockedIds = new Set<string>();
  (blocks || []).forEach((block) => {
    if (block.blocker_id === userId) {
      blockedIds.add(block.blocked_id);
    } else {
      blockedIds.add(block.blocker_id);
    }
  });

  return Array.from(blockedIds);
}

// ============================================================================
// REPORT USER
// ============================================================================

/**
 * Report a user for inappropriate behavior
 * - Creates a report record for moderation review
 * - Reports are stored but not automatically acted upon
 */
export async function reportUser(
  reporterId: string,
  reportData: ReportInsert
): Promise<Report> {
  if (reporterId === reportData.target_id) {
    throw new ValidationError('Cannot report yourself');
  }

  // Validate input
  const validated = reportSchema.parse(reportData);

  const { data, error } = await supabase
    .from('reports')
    .insert({
      reporter_id: reporterId,
      target_id: validated.target_id,
      reason: validated.reason,
      message: validated.message || null,
    })
    .select()
    .single();

  if (error) {
    throw parseSupabaseError(error);
  }

  return data;
}

// ============================================================================
// HELPER: EXCLUDE BLOCKED USERS
// ============================================================================

/**
 * Helper function to filter out blocked users from query results
 * Use this in services that return user lists (discover, connections, etc.)
 */
export async function excludeBlockedUsers<T extends { id: string }>(
  userId: string,
  items: T[]
): Promise<T[]> {
  if (items.length === 0) {
    return items;
  }

  const blockedIds = await getBlockedUserIds(userId);
  if (blockedIds.length === 0) {
    return items;
  }

  const blockedSet = new Set(blockedIds);
  return items.filter((item) => !blockedSet.has(item.id));
}

