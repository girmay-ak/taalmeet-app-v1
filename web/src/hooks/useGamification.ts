/**
 * Gamification Hooks for Web
 * React Query hooks for gamification features
 */

import { useQuery } from '@tanstack/react-query';
import * as gamificationService from '@/services/gamificationService';

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

