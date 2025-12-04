/**
 * Gamification Service
 * Handles points, achievements, streaks, and leaderboards
 */

import { supabase } from '@/lib/supabase';
import { parseSupabaseError } from '@/utils/errors';
import type { Profile } from '@/types/database';

// ============================================================================
// TYPES
// ============================================================================

export interface UserPoints {
  id: string;
  user_id: string;
  points: number;
  total_earned: number;
  last_updated: string;
  created_at: string;
}

export interface PointHistory {
  id: string;
  user_id: string;
  points: number;
  reason: string;
  source_type: string;
  source_id: string | null;
  created_at: string;
}

export interface Achievement {
  id: string;
  code: string;
  name: string;
  description: string;
  icon: string | null;
  points_reward: number;
  category: string | null;
  requirement_value: number | null;
  requirement_type: string | null;
  is_active: boolean;
  created_at: string;
}

export interface UserAchievement {
  id: string;
  user_id: string;
  achievement_id: string;
  unlocked_at: string;
  achievement?: Achievement;
}

export interface UserStreak {
  id: string;
  user_id: string;
  streak_type: string;
  current_streak: number;
  longest_streak: number;
  last_activity_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface LeaderboardEntry {
  id: string;
  user_id: string;
  period_type: string;
  period_start: string;
  period_end: string | null;
  language_code: string | null;
  points: number;
  rank: number | null;
  user?: {
    id: string;
    display_name: string;
    avatar_url: string | null;
  };
}

// ============================================================================
// POINTS SYSTEM
// ============================================================================

/**
 * Add points to a user
 */
export async function addPoints(
  userId: string,
  points: number,
  reason: string,
  sourceType: 'session_completed' | 'conversation_started' | 'conversation_message' | 'connection_made' | 'profile_completed' | 'daily_login' | 'streak_bonus' | 'achievement_unlocked' | 'helping_others' | 'admin_adjustment',
  sourceId?: string
): Promise<void> {
  const { error } = await supabase.rpc('add_user_points', {
    p_user_id: userId,
    p_points: points,
    p_reason: reason,
    p_source_type: sourceType,
    p_source_id: sourceId || null,
  });

  if (error) {
    throw parseSupabaseError(error);
  }

  // Check for achievement unlocks after adding points
  await checkAndUnlockAchievements(userId);
}

/**
 * Get user points
 */
export async function getUserPoints(userId: string): Promise<number> {
  const { data, error } = await supabase.rpc('get_user_points', {
    p_user_id: userId,
  });

  if (error) {
    throw parseSupabaseError(error);
  }

  return data || 0;
}

/**
 * Get user points with details
 */
export async function getUserPointsDetails(userId: string): Promise<UserPoints | null> {
  const { data, error } = await supabase
    .from('user_points')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    throw parseSupabaseError(error);
  }

  return data;
}

/**
 * Get point history for a user
 */
export async function getPointHistory(
  userId: string,
  limit: number = 50
): Promise<PointHistory[]> {
  const { data, error } = await supabase
    .from('point_history')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    throw parseSupabaseError(error);
  }

  return data || [];
}

// ============================================================================
// ACHIEVEMENTS SYSTEM
// ============================================================================

/**
 * Get all available achievements
 */
export async function getAchievements(): Promise<Achievement[]> {
  const { data, error } = await supabase
    .from('achievements')
    .select('*')
    .eq('is_active', true)
    .order('points_reward', { ascending: false });

  if (error) {
    throw parseSupabaseError(error);
  }

  return data || [];
}

/**
 * Get user achievements
 */
export async function getUserAchievements(userId: string): Promise<UserAchievement[]> {
  const { data, error } = await supabase
    .from('user_achievements')
    .select(`
      *,
      achievement:achievements(*)
    `)
    .eq('user_id', userId)
    .order('unlocked_at', { ascending: false });

  if (error) {
    throw parseSupabaseError(error);
  }

  return (data || []) as UserAchievement[];
}

/**
 * Unlock an achievement for a user
 */
export async function unlockAchievement(
  userId: string,
  achievementId: string
): Promise<UserAchievement> {
  // Check if already unlocked
  const { data: existing } = await supabase
    .from('user_achievements')
    .select('*')
    .eq('user_id', userId)
    .eq('achievement_id', achievementId)
    .single();

  if (existing) {
    return existing as UserAchievement;
  }

  // Get achievement details
  const { data: achievement } = await supabase
    .from('achievements')
    .select('*')
    .eq('id', achievementId)
    .single();

  if (!achievement) {
    throw new Error('Achievement not found');
  }

  // Insert user achievement
  const { data, error } = await supabase
    .from('user_achievements')
    .insert({
      user_id: userId,
      achievement_id: achievementId,
    })
    .select(`
      *,
      achievement:achievements(*)
    `)
    .single();

  if (error) {
    throw parseSupabaseError(error);
  }

  // Award points if achievement has points reward
  if (achievement.points_reward > 0) {
    await addPoints(
      userId,
      achievement.points_reward,
      `Achievement unlocked: ${achievement.name}`,
      'achievement_unlocked',
      achievementId
    );
  }

  return data as UserAchievement;
}

/**
 * Check and unlock achievements based on user activity
 */
export async function checkAndUnlockAchievements(userId: string): Promise<UserAchievement[]> {
  const unlocked: UserAchievement[] = [];

  // Get user stats
  const conversationCount = await getUserConversationCount(userId);
  const sessionCount = await getUserSessionCount(userId);
  const connectionCount = await getUserConnectionCount(userId);
  const profileComplete = await isProfileComplete(userId);
  const loginStreak = await getUserStreak(userId, 'daily_login');
  const conversationStreak = await getUserStreak(userId, 'daily_conversation');

  // Get all achievements
  const achievements = await getAchievements();
  const userAchievements = await getUserAchievements(userId);
  const unlockedCodes = new Set(userAchievements.map(ua => ua.achievement?.code));

  // Check each achievement
  for (const achievement of achievements) {
    if (unlockedCodes.has(achievement.code)) {
      continue; // Already unlocked
    }

    let shouldUnlock = false;

    switch (achievement.code) {
      case 'first_conversation':
        shouldUnlock = conversationCount >= 1;
        break;
      case '10_conversations':
        shouldUnlock = conversationCount >= 10;
        break;
      case '50_conversations':
        shouldUnlock = conversationCount >= 50;
        break;
      case 'first_session':
        shouldUnlock = sessionCount >= 1;
        break;
      case '10_sessions':
        shouldUnlock = sessionCount >= 10;
        break;
      case '50_sessions':
        shouldUnlock = sessionCount >= 50;
        break;
      case 'first_connection':
        shouldUnlock = connectionCount >= 1;
        break;
      case '10_connections':
        shouldUnlock = connectionCount >= 10;
        break;
      case 'profile_complete':
        shouldUnlock = profileComplete;
        break;
      case 'daily_login_7':
        shouldUnlock = (loginStreak?.current_streak || 0) >= 7;
        break;
      case 'daily_login_30':
        shouldUnlock = (loginStreak?.current_streak || 0) >= 30;
        break;
      case 'daily_conversation_7':
        shouldUnlock = (conversationStreak?.current_streak || 0) >= 7;
        break;
    }

    if (shouldUnlock) {
      const unlockedAchievement = await unlockAchievement(userId, achievement.id);
      unlocked.push(unlockedAchievement);
    }
  }

  return unlocked;
}

// Helper functions for achievement checks
async function getUserConversationCount(userId: string): Promise<number> {
  const { count, error } = await supabase
    .from('conversation_participants')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId);

  if (error) {
    return 0;
  }
  return count || 0;
}

async function getUserSessionCount(userId: string): Promise<number> {
  const { count, error } = await supabase
    .from('language_sessions')
    .select('*', { count: 'exact', head: true })
    .eq('host_user_id', userId);

  if (error) {
    return 0;
  }
  return count || 0;
}

async function getUserConnectionCount(userId: string): Promise<number> {
  const { count, error } = await supabase
    .from('connections')
    .select('*', { count: 'exact', head: true })
    .or(`user_id.eq.${userId},partner_id.eq.${userId}`)
    .eq('status', 'accepted');

  if (error) {
    return 0;
  }
  return count || 0;
}

async function isProfileComplete(userId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('profiles')
    .select('display_name, bio, city, country, avatar_url')
    .eq('id', userId)
    .single();

  if (error || !data) {
    return false;
  }

  return !!(
    data.display_name &&
    data.bio &&
    data.city &&
    data.country &&
    data.avatar_url
  );
}

// ============================================================================
// STREAKS SYSTEM
// ============================================================================

/**
 * Update user streak
 */
export async function updateStreak(
  userId: string,
  streakType: 'daily_login' | 'daily_conversation' | 'daily_session'
): Promise<number> {
  const { data, error } = await supabase.rpc('update_user_streak', {
    p_user_id: userId,
    p_streak_type: streakType,
  });

  if (error) {
    throw parseSupabaseError(error);
  }

  const newStreak = data || 0;

  // Award streak bonus points
  if (newStreak > 0 && newStreak % 7 === 0) {
    await addPoints(
      userId,
      50,
      `${newStreak}-day ${streakType} streak bonus!`,
      'streak_bonus'
    );
  }

  return newStreak;
}

/**
 * Get user streak
 */
export async function getUserStreak(
  userId: string,
  streakType: 'daily_login' | 'daily_conversation' | 'daily_session'
): Promise<UserStreak | null> {
  const { data, error } = await supabase
    .from('user_streaks')
    .select('*')
    .eq('user_id', userId)
    .eq('streak_type', streakType)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    throw parseSupabaseError(error);
  }

  return data;
}

/**
 * Get all user streaks
 */
export async function getAllUserStreaks(userId: string): Promise<UserStreak[]> {
  const { data, error } = await supabase
    .from('user_streaks')
    .select('*')
    .eq('user_id', userId)
    .order('current_streak', { ascending: false });

  if (error) {
    throw parseSupabaseError(error);
  }

  return data || [];
}

// ============================================================================
// LEADERBOARDS
// ============================================================================

/**
 * Get leaderboard
 */
export async function getLeaderboard(
  periodType: 'weekly' | 'monthly' | 'all_time' | 'language' = 'all_time',
  languageCode?: string,
  limit: number = 100
): Promise<LeaderboardEntry[]> {
  // Calculate period dates
  let periodStart: Date;
  let periodEnd: Date | null = null;

  const now = new Date();
  if (periodType === 'weekly') {
    periodStart = new Date(now);
    periodStart.setDate(periodStart.getDate() - 7);
  } else if (periodType === 'monthly') {
    periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
    periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  } else {
    periodStart = new Date(0); // All time
  }

  let query = supabase
    .from('leaderboard_entries')
    .select(`
      *,
      user:profiles!leaderboard_entries_user_id_fkey(id, display_name, avatar_url)
    `)
    .eq('period_type', periodType)
    .gte('period_start', periodStart.toISOString().split('T')[0])
    .order('points', { ascending: false })
    .limit(limit);

  if (periodEnd) {
    query = query.lte('period_end', periodEnd.toISOString().split('T')[0]);
  }

  if (periodType === 'language' && languageCode) {
    query = query.eq('language_code', languageCode);
  }

  const { data, error } = await query;

  if (error) {
    throw parseSupabaseError(error);
  }

  // If no cached entries, calculate from user_points
  if (!data || data.length === 0) {
    return await calculateLeaderboard(periodType, languageCode, limit);
  }

  // Add rank
  return (data || []).map((entry, index) => ({
    ...entry,
    rank: index + 1,
  })) as LeaderboardEntry[];
}

/**
 * Calculate leaderboard from user_points (fallback)
 */
async function calculateLeaderboard(
  periodType: 'weekly' | 'monthly' | 'all_time' | 'language',
  languageCode?: string,
  limit: number = 100
): Promise<LeaderboardEntry[]> {
  // For now, use all-time points
  // In production, you'd filter by period and language
  const { data, error } = await supabase
    .from('user_points')
    .select(`
      *,
      user:profiles!user_points_user_id_fkey(id, display_name, avatar_url)
    `)
    .order('points', { ascending: false })
    .limit(limit);

  if (error) {
    throw parseSupabaseError(error);
  }

  return (data || []).map((entry, index) => ({
    id: entry.id,
    user_id: entry.user_id,
    period_type: periodType,
    period_start: new Date().toISOString().split('T')[0],
    period_end: null,
    language_code: languageCode || null,
    points: entry.points,
    rank: index + 1,
    user: entry.user as any,
  })) as LeaderboardEntry[];
}

/**
 * Get user rank in leaderboard
 */
export async function getUserRank(
  userId: string,
  periodType: 'weekly' | 'monthly' | 'all_time' | 'language' = 'all_time',
  languageCode?: string
): Promise<number | null> {
  const leaderboard = await getLeaderboard(periodType, languageCode, 1000);
  const userEntry = leaderboard.find(entry => entry.user_id === userId);
  return userEntry?.rank || null;
}

