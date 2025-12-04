/**
 * Gamification Hooks
 * React Query hooks for gamification features
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Alert } from 'react-native';
import * as gamificationService from '@/services/gamificationService';
import { getUserFriendlyMessage } from '@/utils/errors';
import { useAuth } from '@/providers';

// ============================================================================
// QUERY KEYS
// ============================================================================

export const gamificationKeys = {
  all: ['gamification'] as const,
  points: (userId: string) => [...gamificationKeys.all, 'points', userId] as const,
  pointHistory: (userId: string) => [...gamificationKeys.all, 'pointHistory', userId] as const,
  achievements: () => [...gamificationKeys.all, 'achievements'] as const,
  userAchievements: (userId: string) => [...gamificationKeys.all, 'userAchievements', userId] as const,
  streaks: (userId: string) => [...gamificationKeys.all, 'streaks', userId] as const,
  leaderboard: (periodType: string, languageCode?: string) =>
    [...gamificationKeys.all, 'leaderboard', periodType, languageCode] as const,
  userRank: (userId: string, periodType: string, languageCode?: string) =>
    [...gamificationKeys.all, 'userRank', userId, periodType, languageCode] as const,
};

// ============================================================================
// QUERIES
// ============================================================================

/**
 * Get user points
 */
export function useUserPoints(userId: string | undefined) {
  return useQuery({
    queryKey: gamificationKeys.points(userId || ''),
    queryFn: () => (userId ? gamificationService.getUserPoints(userId) : 0),
    enabled: !!userId,
    staleTime: 30 * 1000, // 30 seconds
  });
}

/**
 * Get user points details
 */
export function useUserPointsDetails(userId: string | undefined) {
  return useQuery({
    queryKey: gamificationKeys.points(userId || ''),
    queryFn: () => (userId ? gamificationService.getUserPointsDetails(userId) : null),
    enabled: !!userId,
    staleTime: 30 * 1000,
  });
}

/**
 * Get point history
 */
export function usePointHistory(userId: string | undefined, limit: number = 50) {
  return useQuery({
    queryKey: gamificationKeys.pointHistory(userId || ''),
    queryFn: () => (userId ? gamificationService.getPointHistory(userId, limit) : []),
    enabled: !!userId,
    staleTime: 1 * 60 * 1000, // 1 minute
  });
}

/**
 * Get all achievements
 */
export function useAchievements() {
  return useQuery({
    queryKey: gamificationKeys.achievements(),
    queryFn: () => gamificationService.getAchievements(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Get user achievements
 */
export function useUserAchievements(userId: string | undefined) {
  return useQuery({
    queryKey: gamificationKeys.userAchievements(userId || ''),
    queryFn: () => (userId ? gamificationService.getUserAchievements(userId) : []),
    enabled: !!userId,
    staleTime: 1 * 60 * 1000,
  });
}

/**
 * Get user streaks
 */
export function useUserStreaks(userId: string | undefined) {
  return useQuery({
    queryKey: gamificationKeys.streaks(userId || ''),
    queryFn: () => (userId ? gamificationService.getAllUserStreaks(userId) : []),
    enabled: !!userId,
    staleTime: 1 * 60 * 1000,
  });
}

/**
 * Get leaderboard
 */
export function useLeaderboard(
  periodType: 'weekly' | 'monthly' | 'all_time' | 'language' = 'all_time',
  languageCode?: string,
  limit: number = 100
) {
  return useQuery({
    queryKey: gamificationKeys.leaderboard(periodType, languageCode),
    queryFn: () => gamificationService.getLeaderboard(periodType, languageCode, limit),
    staleTime: 1 * 60 * 1000,
  });
}

/**
 * Get user rank
 */
export function useUserRank(
  userId: string | undefined,
  periodType: 'weekly' | 'monthly' | 'all_time' | 'language' = 'all_time',
  languageCode?: string
) {
  return useQuery({
    queryKey: gamificationKeys.userRank(userId || '', periodType, languageCode),
    queryFn: () =>
      userId
        ? gamificationService.getUserRank(userId, periodType, languageCode)
        : null,
    enabled: !!userId,
    staleTime: 1 * 60 * 1000,
  });
}

// ============================================================================
// MUTATIONS
// ============================================================================

/**
 * Add points mutation
 */
export function useAddPoints() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      points,
      reason,
      sourceType,
      sourceId,
    }: {
      points: number;
      reason: string;
      sourceType: 'session_completed' | 'conversation_started' | 'conversation_message' | 'connection_made' | 'profile_completed' | 'daily_login' | 'streak_bonus' | 'achievement_unlocked' | 'helping_others' | 'admin_adjustment';
      sourceId?: string;
    }) => {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }
      return gamificationService.addPoints(user.id, points, reason, sourceType, sourceId);
    },
    onSuccess: (_, variables) => {
      if (user?.id) {
        queryClient.invalidateQueries({ queryKey: gamificationKeys.points(user.id) });
        queryClient.invalidateQueries({ queryKey: gamificationKeys.pointHistory(user.id) });
        queryClient.invalidateQueries({ queryKey: gamificationKeys.all });
      }
      
      // Show success message for significant point gains
      if (variables.points >= 50) {
        Alert.alert('Points Earned!', `+${variables.points} points: ${variables.reason}`);
      }
    },
    onError: (error) => {
      // Silently fail for points - don't interrupt user flow
      console.error('Failed to add points:', error);
    },
  });
}

/**
 * Update streak mutation
 */
export function useUpdateStreak() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (streakType: 'daily_login' | 'daily_conversation' | 'daily_session') => {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }
      return gamificationService.updateStreak(user.id, streakType);
    },
    onSuccess: (newStreak) => {
      if (user?.id) {
        queryClient.invalidateQueries({ queryKey: gamificationKeys.streaks(user.id) });
        queryClient.invalidateQueries({ queryKey: gamificationKeys.points(user.id) });
      }
      
      if (newStreak > 0 && newStreak % 7 === 0) {
        Alert.alert('Streak Bonus!', `🔥 ${newStreak}-day streak! +50 bonus points!`);
      }
    },
    onError: (error) => {
      console.error('Failed to update streak:', error);
    },
  });
}

