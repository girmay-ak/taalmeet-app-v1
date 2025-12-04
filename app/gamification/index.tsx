/**
 * Gamification Screen - React Native
 * View achievements, points, streaks, and leaderboard
 */

import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useTheme } from '@/lib/theme/ThemeProvider';
import { LinearGradient } from 'expo-linear-gradient';
import { ConfettiRN } from '@/components/animations/ConfettiRN';
import { useAuth } from '@/providers';
import {
  useUserPoints,
  useUserPointsDetails,
  useAchievements,
  useUserAchievements,
  useUserStreaks,
  useLeaderboard,
  useUserRank,
} from '@/hooks/useGamification';

type TabType = 'overview' | 'achievements' | 'leaderboard';

const rarityColors: Record<string, string[]> = {
  common: ['#6B7280', '#4B5563'],
  rare: ['#3B82F6', '#2563EB'],
  epic: ['#A855F7', '#7E22CE'],
  legendary: ['#F59E0B', '#D97706'],
};

// Calculate level from points (1000 points per level)
function calculateLevel(points: number): { level: number; currentXP: number; nextLevelXP: number } {
  const level = Math.floor(points / 1000) + 1;
  const currentXP = points % 1000;
  const nextLevelXP = 1000;
  return { level, currentXP, nextLevelXP };
}

// Map achievement category to display category
function mapCategory(category: string | null): string {
  const categoryMap: Record<string, string> = {
    conversation: 'social',
    session: 'sessions',
    streak: 'streaks',
    social: 'social',
    profile: 'special',
    special: 'special',
  };
  return categoryMap[category || ''] || 'special';
}

export default function GamificationScreen() {
  const { colors } = useTheme();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showConfetti, setShowConfetti] = useState(false);
  const [leaderboardPeriod, setLeaderboardPeriod] = useState<'weekly' | 'monthly' | 'all_time'>('all_time');

  // Fetch data
  const { data: points = 0, isLoading: pointsLoading, refetch: refetchPoints } = useUserPoints(user?.id);
  const { data: pointsDetails } = useUserPointsDetails(user?.id);
  const { data: achievements = [], isLoading: achievementsLoading } = useAchievements();
  const { data: userAchievements = [], isLoading: userAchievementsLoading, refetch: refetchAchievements } = useUserAchievements(user?.id);
  const { data: streaks = [], isLoading: streaksLoading } = useUserStreaks(user?.id);
  const { data: leaderboard = [], isLoading: leaderboardLoading, refetch: refetchLeaderboard } = useLeaderboard(leaderboardPeriod);
  const { data: userRank } = useUserRank(user?.id, leaderboardPeriod);

  const isLoading = pointsLoading || achievementsLoading || userAchievementsLoading || streaksLoading || leaderboardLoading;

  // Calculate level
  const { level, currentXP, nextLevelXP } = useMemo(() => calculateLevel(points), [points]);
  const levelProgress = (currentXP / nextLevelXP) * 100;

  // Get login streak
  const loginStreak = streaks.find(s => s.streak_type === 'daily_login');
  const conversationStreak = streaks.find(s => s.streak_type === 'daily_conversation');
  const currentStreak = loginStreak?.current_streak || 0;
  const longestStreak = loginStreak?.longest_streak || 0;

  // Create achievement map with unlock status
  const unlockedAchievementIds = new Set(userAchievements.map(ua => ua.achievement_id));
  const achievementsWithStatus = achievements.map(achievement => {
    const isUnlocked = unlockedAchievementIds.has(achievement.id);
    return {
      ...achievement,
      unlocked: isUnlocked,
      category: mapCategory(achievement.category),
    };
  });

  // Filter achievements by category
  const filteredAchievements = useMemo(() => {
    if (selectedCategory === 'all') {
      return achievementsWithStatus;
    }
    return achievementsWithStatus.filter(a => a.category === selectedCategory);
  }, [achievementsWithStatus, selectedCategory]);

  // Get user's position in leaderboard
  const userLeaderboardEntry = leaderboard.find(entry => entry.user_id === user?.id);

  const handleRefresh = () => {
    refetchPoints();
    refetchAchievements();
    refetchLeaderboard();
  };

  const tabs = [
    { id: 'overview' as TabType, label: 'Overview', icon: 'trending-up' },
    { id: 'achievements' as TabType, label: 'Achievements', icon: 'trophy' },
    { id: 'leaderboard' as TabType, label: 'Leaderboard', icon: 'medal' },
  ];

  const categories = [
    { id: 'all', label: 'All', icon: '🌟' },
    { id: 'sessions', label: 'Sessions', icon: '📚' },
    { id: 'streaks', label: 'Streaks', icon: '🔥' },
    { id: 'social', label: 'Social', icon: '👥' },
    { id: 'special', label: 'Special', icon: '👑' },
  ];

  if (isLoading && points === 0) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background.primary }]} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.text.muted }]}>Loading your progress...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background.primary }]}
      edges={['top']}
    >
      <ConfettiRN active={showConfetti} />
      {/* Header */}
      <View
        style={[
          styles.header,
          { backgroundColor: colors.background.secondary, borderColor: colors.border.default },
        ]}
      >
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text.primary }]}>Your Progress</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Tabs */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.tabsScroll}
          contentContainerStyle={styles.tabsContainer}
        >
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab.id}
              onPress={() => setActiveTab(tab.id)}
              style={[
                styles.tab,
                activeTab === tab.id
                  ? { backgroundColor: colors.primary }
                  : { backgroundColor: colors.background.primary },
              ]}
            >
              <Ionicons
                name={tab.icon as any}
                size={16}
                color={activeTab === tab.id ? '#FFFFFF' : colors.text.muted}
              />
              <Text
                style={[
                  styles.tabLabel,
                  {
                    color: activeTab === tab.id ? '#FFFFFF' : colors.text.muted,
                  },
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Content */}
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={handleRefresh} tintColor={colors.primary} />
        }
      >
        {activeTab === 'overview' && (
          <View style={styles.overviewContent}>
            {/* Level Card */}
            <LinearGradient
              colors={[colors.primary, '#1ED760', '#5FB3B3']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.levelCard}
            >
              <View style={styles.levelCardContent}>
                <View style={styles.levelHeader}>
                  <View>
                    <Text style={styles.levelLabel}>Current Level</Text>
                    <View style={styles.levelValueRow}>
                      <Text style={styles.levelValue}>{level}</Text>
                      <Text style={styles.trophyEmoji}>🏆</Text>
                    </View>
                  </View>
                </View>

                {/* XP Progress */}
                <View style={styles.xpSection}>
                  <View style={styles.xpHeader}>
                    <Text style={styles.xpText}>{currentXP.toLocaleString()} XP</Text>
                    <Text style={styles.xpText}>{nextLevelXP.toLocaleString()} XP</Text>
                  </View>
                  <View style={styles.xpProgressBar}>
                    <View
                      style={[
                        styles.xpProgressFill,
                        { width: `${levelProgress}%`, backgroundColor: '#FFFFFF' },
                      ]}
                    />
                  </View>
                  <Text style={styles.xpToNext}>
                    {nextLevelXP - currentXP} XP to Level {level + 1}
                  </Text>
                </View>
              </View>
            </LinearGradient>

            {/* Streak Card */}
            {currentStreak > 0 && (
              <LinearGradient
                colors={['#FF6B35', '#F7931E', '#FFB800']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.streakCard}
              >
                <View style={styles.streakContent}>
                  <View>
                    <Text style={styles.streakLabel}>Current Streak</Text>
                    <View style={styles.streakValueRow}>
                      <Text style={styles.streakValue}>{currentStreak}</Text>
                      <Text style={styles.streakUnit}>days</Text>
                    </View>
                  </View>
                  <Ionicons name="flame" size={64} color="#FFFFFF" />
                </View>
                <View style={styles.streakFooter}>
                  <View>
                    <Text style={styles.streakFooterLabel}>Longest Streak</Text>
                    <Text style={styles.streakFooterValue}>{longestStreak} days 🎖️</Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={styles.streakFooterLabel}>Keep it up!</Text>
                    <Text style={styles.streakFooterValue}>+5 XP/day</Text>
                  </View>
                </View>
              </LinearGradient>
            )}

            {/* Quick Stats */}
            <View style={styles.statsGrid}>
              <LinearGradient
                colors={['#6366F1', '#4F46E5']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.statCard}
              >
                <Text style={styles.statIcon}>💎</Text>
                <Text style={styles.statValue}>{points.toLocaleString()}</Text>
                <Text style={styles.statLabel}>Total Points</Text>
              </LinearGradient>

              <LinearGradient
                colors={['#EC4899', '#DB2777']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.statCard}
              >
                <Text style={styles.statIcon}>🏆</Text>
                <Text style={styles.statValue}>{userAchievements.length}</Text>
                <Text style={styles.statLabel}>Achievements</Text>
              </LinearGradient>

              <LinearGradient
                colors={['#14B8A6', '#0D9488']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.statCard}
              >
                <Text style={styles.statIcon}>🌍</Text>
                <Text style={styles.statValue}>
                  {userRank ? `#${userRank}` : '—'}
                </Text>
                <Text style={styles.statLabel}>Global Rank</Text>
              </LinearGradient>

              <LinearGradient
                colors={['#F59E0B', '#D97706']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.statCard}
              >
                <Text style={styles.statIcon}>⚡</Text>
                <Text style={styles.statValue}>{pointsDetails?.total_earned?.toLocaleString() || 0}</Text>
                <Text style={styles.statLabel}>Total Earned</Text>
              </LinearGradient>
            </View>
          </View>
        )}

        {activeTab === 'achievements' && (
          <View style={styles.achievementsContent}>
            {/* Category Filter */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.categoriesScroll}
              contentContainerStyle={styles.categoriesContainer}
            >
              {categories.map((cat) => (
                <TouchableOpacity
                  key={cat.id}
                  onPress={() => setSelectedCategory(cat.id)}
                  style={[
                    styles.categoryButton,
                    selectedCategory === cat.id
                      ? { backgroundColor: colors.primary }
                      : { backgroundColor: colors.background.secondary },
                  ]}
                >
                  <Text style={styles.categoryIcon}>{cat.icon}</Text>
                  <Text
                    style={[
                      styles.categoryLabel,
                      {
                        color: selectedCategory === cat.id ? '#FFFFFF' : colors.text.muted,
                      },
                    ]}
                  >
                    {cat.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Achievements List */}
            <View style={styles.achievementsList}>
              {filteredAchievements.length === 0 ? (
                <View style={styles.emptyState}>
                  <Ionicons name="trophy-outline" size={64} color={colors.text.muted} />
                  <Text style={[styles.emptyText, { color: colors.text.muted }]}>
                    No achievements found
                  </Text>
                </View>
              ) : (
                filteredAchievements.map((achievement) => {
                  const rarity = achievement.points_reward >= 500 ? 'legendary' :
                                achievement.points_reward >= 200 ? 'epic' :
                                achievement.points_reward >= 100 ? 'rare' : 'common';

                  return (
                    <LinearGradient
                      key={achievement.id}
                      colors={
                        achievement.unlocked
                          ? rarityColors[rarity] || ['#6B7280', '#4B5563']
                          : [colors.background.secondary, colors.background.secondary]
                      }
                      style={[
                        styles.achievementCard,
                        !achievement.unlocked && {
                          borderColor: colors.border.default,
                          borderWidth: 1,
                        },
                      ]}
                    >
                      <View style={styles.achievementContent}>
                        <Text style={styles.achievementIcon}>{achievement.icon || '🏆'}</Text>
                        <View style={styles.achievementInfo}>
                          <Text
                            style={[
                              styles.achievementTitle,
                              {
                                color: achievement.unlocked ? '#FFFFFF' : colors.text.primary,
                              },
                            ]}
                          >
                            {achievement.name}
                          </Text>
                          <Text
                            style={[
                              styles.achievementDescription,
                              {
                                color: achievement.unlocked ? 'rgba(255,255,255,0.8)' : colors.text.secondary,
                              },
                            ]}
                          >
                            {achievement.description}
                          </Text>
                          <View style={styles.achievementReward}>
                            <Ionicons name="gift-outline" size={16} color={achievement.unlocked ? '#FFFFFF' : colors.text.muted} />
                            <Text
                              style={[
                                styles.achievementRewardText,
                                {
                                  color: achievement.unlocked ? '#FFFFFF' : colors.text.muted,
                                },
                              ]}
                            >
                              +{achievement.points_reward} points
                            </Text>
                          </View>
                        </View>
                        {achievement.unlocked && (
                          <Ionicons name="checkmark-circle" size={24} color="#FFFFFF" />
                        )}
                      </View>
                    </LinearGradient>
                  );
                })
              )}
            </View>
          </View>
        )}

        {activeTab === 'leaderboard' && (
          <View style={styles.leaderboardContent}>
            {/* Period Selector */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.periodSelector}
              contentContainerStyle={styles.periodSelectorContent}
            >
              {[
                { id: 'weekly', label: 'Weekly' },
                { id: 'monthly', label: 'Monthly' },
                { id: 'all_time', label: 'All Time' },
              ].map((period) => (
                <TouchableOpacity
                  key={period.id}
                  onPress={() => setLeaderboardPeriod(period.id as any)}
                  style={[
                    styles.periodButton,
                    leaderboardPeriod === period.id
                      ? { backgroundColor: colors.primary }
                      : { backgroundColor: colors.background.secondary },
                  ]}
                >
                  <Text
                    style={[
                      styles.periodButtonText,
                      {
                        color: leaderboardPeriod === period.id ? '#FFFFFF' : colors.text.secondary,
                      },
                    ]}
                  >
                    {period.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Top 3 Podium */}
            {leaderboard.length >= 3 && (
              <View style={styles.podium}>
                {/* 2nd Place */}
                <View style={styles.podiumItem}>
                  {leaderboard[1].user?.avatar_url ? (
                    <Image source={{ uri: leaderboard[1].user.avatar_url }} style={styles.podiumAvatar} />
                  ) : (
                    <View style={[styles.podiumAvatar, { backgroundColor: colors.background.secondary }]}>
                      <Ionicons name="person" size={32} color={colors.text.muted} />
                    </View>
                  )}
                  <Text style={[styles.podiumName, { color: colors.text.primary }]}>
                    {leaderboard[1].user?.display_name?.split(' ')[0] || 'User'}
                  </Text>
                  <Text style={[styles.podiumPoints, { color: colors.primary }]}>
                    {leaderboard[1].points.toLocaleString()}
                  </Text>
                  <View style={[styles.podiumBase, { backgroundColor: '#C0C0C0', height: 112 }]}>
                    <Text style={styles.podiumBadge}>🥈</Text>
                  </View>
                </View>

                {/* 1st Place */}
                <View style={styles.podiumItem}>
                  {leaderboard[0].user?.avatar_url ? (
                    <Image source={{ uri: leaderboard[0].user.avatar_url }} style={[styles.podiumAvatar, styles.podiumAvatarFirst]} />
                  ) : (
                    <View style={[styles.podiumAvatar, styles.podiumAvatarFirst, { backgroundColor: colors.background.secondary }]}>
                      <Ionicons name="person" size={40} color={colors.text.muted} />
                    </View>
                  )}
                  <Text style={[styles.podiumName, { color: colors.text.primary }]}>
                    {leaderboard[0].user?.display_name?.split(' ')[0] || 'User'}
                  </Text>
                  <Text style={[styles.podiumPoints, { color: colors.primary }]}>
                    {leaderboard[0].points.toLocaleString()}
                  </Text>
                  <View style={[styles.podiumBase, { backgroundColor: '#FFD700', height: 144 }]}>
                    <Text style={styles.podiumBadge}>👑</Text>
                  </View>
                </View>

                {/* 3rd Place */}
                <View style={styles.podiumItem}>
                  {leaderboard[2].user?.avatar_url ? (
                    <Image source={{ uri: leaderboard[2].user.avatar_url }} style={styles.podiumAvatar} />
                  ) : (
                    <View style={[styles.podiumAvatar, { backgroundColor: colors.background.secondary }]}>
                      <Ionicons name="person" size={32} color={colors.text.muted} />
                    </View>
                  )}
                  <Text style={[styles.podiumName, { color: colors.text.primary }]}>
                    {leaderboard[2].user?.display_name?.split(' ')[0] || 'User'}
                  </Text>
                  <Text style={[styles.podiumPoints, { color: colors.primary }]}>
                    {leaderboard[2].points.toLocaleString()}
                  </Text>
                  <View style={[styles.podiumBase, { backgroundColor: '#CD7F32', height: 96 }]}>
                    <Text style={styles.podiumBadge}>🥉</Text>
                  </View>
                </View>
              </View>
            )}

            {/* Your Rank Card */}
            {userLeaderboardEntry && (
              <LinearGradient
                colors={[colors.primary, '#5FB3B3']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.yourRankCard}
              >
                {user?.id && (
                  <>
                    <View style={[styles.yourRankAvatar, { backgroundColor: colors.background.secondary }]}>
                      <Ionicons name="person" size={28} color={colors.text.primary} />
                    </View>
                    <View style={styles.yourRankInfo}>
                      <Text style={styles.yourRankLabel}>Your Rank</Text>
                      <Text style={styles.yourRankValue}>
                        #{userLeaderboardEntry.rank || '—'}
                      </Text>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                      <Text style={styles.yourRankLabel}>Total Points</Text>
                      <Text style={styles.yourRankValue}>
                        {userLeaderboardEntry.points.toLocaleString()}
                      </Text>
                    </View>
                  </>
                )}
              </LinearGradient>
            )}

            {/* Full Leaderboard */}
            <View style={styles.fullLeaderboard}>
              <Text style={[styles.leaderboardTitle, { color: colors.text.primary }]}>
                Top Language Learners
              </Text>
              {leaderboard.length === 0 ? (
                <View style={styles.emptyState}>
                  <Ionicons name="medal-outline" size={64} color={colors.text.muted} />
                  <Text style={[styles.emptyText, { color: colors.text.muted }]}>
                    No leaderboard data yet
                  </Text>
                </View>
              ) : (
                leaderboard.map((entry, index) => {
                  const isCurrentUser = entry.user_id === user?.id;
                  const badge = entry.rank === 1 ? '👑' : entry.rank === 2 ? '🥈' : entry.rank === 3 ? '🥉' : null;

                  return (
                    <View
                      key={entry.id}
                      style={[
                        styles.leaderboardItem,
                        {
                          backgroundColor: isCurrentUser
                            ? `${colors.primary}20`
                            : colors.background.secondary,
                          borderColor: isCurrentUser ? colors.primary : colors.border.default,
                          borderWidth: isCurrentUser ? 1 : 0,
                        },
                      ]}
                    >
                      <Text style={[styles.leaderboardRank, { color: colors.text.muted }]}>
                        {badge || `#${entry.rank || index + 1}`}
                      </Text>
                      {entry.user?.avatar_url ? (
                        <Image source={{ uri: entry.user.avatar_url }} style={styles.leaderboardAvatar} />
                      ) : (
                        <View style={[styles.leaderboardAvatar, { backgroundColor: colors.background.primary }]}>
                          <Ionicons name="person" size={24} color={colors.text.muted} />
                        </View>
                      )}
                      <View style={styles.leaderboardUserInfo}>
                        <Text style={[styles.leaderboardUserName, { color: colors.text.primary }]}>
                          {entry.user?.display_name || 'Unknown User'}
                          {isCurrentUser && ' (You)'}
                        </Text>
                        <Text style={[styles.leaderboardUserPoints, { color: colors.text.muted }]}>
                          {entry.points.toLocaleString()} points
                        </Text>
                      </View>
                      {badge && <Text style={styles.leaderboardBadge}>{badge}</Text>}
                    </View>
                  );
                })
              )}
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
  },
  header: {
    borderBottomWidth: 1,
    paddingBottom: 12,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  tabsScroll: {
    maxHeight: 50,
  },
  tabsContainer: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  tabLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  content: {
    flex: 1,
  },
  overviewContent: {
    padding: 16,
    gap: 16,
  },
  levelCard: {
    borderRadius: 24,
    padding: 24,
    overflow: 'hidden',
  },
  levelCardContent: {
    gap: 16,
  },
  levelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  levelLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '500',
    marginBottom: 4,
  },
  levelValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
  },
  levelValue: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  trophyEmoji: {
    fontSize: 24,
  },
  xpSection: {
    gap: 8,
  },
  xpHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  xpText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  xpProgressBar: {
    height: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 6,
    overflow: 'hidden',
  },
  xpProgressFill: {
    height: '100%',
    borderRadius: 6,
  },
  xpToNext: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '500',
  },
  streakCard: {
    borderRadius: 24,
    padding: 24,
    overflow: 'hidden',
  },
  streakContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  streakLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '500',
    marginBottom: 4,
  },
  streakValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
  },
  streakValue: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  streakUnit: {
    fontSize: 20,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '600',
  },
  streakFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.2)',
  },
  streakFooterLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 4,
  },
  streakFooterValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    width: '47%',
    padding: 16,
    borderRadius: 16,
    gap: 8,
  },
  statIcon: {
    fontSize: 24,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '500',
  },
  achievementsContent: {
    padding: 16,
    gap: 16,
  },
  categoriesScroll: {
    maxHeight: 50,
  },
  categoriesContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  categoryIcon: {
    fontSize: 16,
  },
  categoryLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  achievementsList: {
    gap: 12,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    gap: 16,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '500',
  },
  achievementCard: {
    borderRadius: 16,
    padding: 20,
  },
  achievementContent: {
    flexDirection: 'row',
    gap: 16,
    alignItems: 'flex-start',
  },
  achievementIcon: {
    fontSize: 40,
  },
  achievementInfo: {
    flex: 1,
    gap: 8,
  },
  achievementTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  achievementDescription: {
    fontSize: 13,
    lineHeight: 18,
  },
  achievementReward: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  achievementRewardText: {
    fontSize: 14,
    fontWeight: '600',
  },
  leaderboardContent: {
    padding: 16,
    gap: 16,
  },
  periodSelector: {
    maxHeight: 50,
  },
  periodSelectorContent: {
    flexDirection: 'row',
    gap: 8,
  },
  periodButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  periodButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  podium: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: 12,
    height: 200,
  },
  podiumItem: {
    flex: 1,
    alignItems: 'center',
    gap: 8,
  },
  podiumAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 4,
    borderColor: '#C0C0C0',
  },
  podiumAvatarFirst: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderColor: '#FFD700',
  },
  podiumName: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  podiumPoints: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  podiumBase: {
    width: '100%',
    borderRadius: 12,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: 12,
  },
  podiumBadge: {
    fontSize: 24,
  },
  yourRankCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    gap: 12,
  },
  yourRankAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 3,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  yourRankInfo: {
    flex: 1,
  },
  yourRankLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '500',
    marginBottom: 4,
  },
  yourRankValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  fullLeaderboard: {
    gap: 8,
  },
  leaderboardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  leaderboardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  leaderboardRank: {
    width: 32,
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  leaderboardAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  leaderboardUserInfo: {
    flex: 1,
  },
  leaderboardUserName: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  leaderboardUserPoints: {
    fontSize: 13,
  },
  leaderboardBadge: {
    fontSize: 20,
  },
});
