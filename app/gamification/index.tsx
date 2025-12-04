/**
 * Gamification Screen - React Native
 * View achievements, challenges, and leaderboard
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useTheme } from '@/lib/theme/ThemeProvider';
import { LinearGradient } from 'expo-linear-gradient';
import { ConfettiRN } from '@/components/animations/ConfettiRN';

type TabType = 'overview' | 'achievements' | 'challenges' | 'leaderboard';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'sessions' | 'streaks' | 'social' | 'learning' | 'special';
  progress: number;
  total: number;
  unlocked: boolean;
  reward: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

interface Challenge {
  id: string;
  title: string;
  description: string;
  icon: string;
  progress: number;
  total: number;
  reward: string;
  expiresIn: string;
}

const userStats = {
  level: 12,
  currentXP: 3420,
  nextLevelXP: 4000,
  totalXP: 15420,
  currentStreak: 23,
  longestStreak: 45,
  totalSessions: 127,
  totalHours: 63.5,
  achievements: 24,
  totalAchievements: 50,
  rank: 42,
  weeklyXP: 850,
};

const achievements: Achievement[] = [
  {
    id: '1',
    title: 'First Steps',
    description: 'Complete your first language exchange session',
    icon: '🎯',
    category: 'sessions',
    progress: 1,
    total: 1,
    unlocked: true,
    reward: '+50 XP',
    rarity: 'common',
  },
  {
    id: '2',
    title: 'Fire Starter',
    description: 'Maintain a 7-day practice streak',
    icon: '🔥',
    category: 'streaks',
    progress: 7,
    total: 7,
    unlocked: true,
    reward: '+100 XP',
    rarity: 'rare',
  },
  {
    id: '3',
    title: 'Social Butterfly',
    description: 'Connect with 10 language partners',
    icon: '🦋',
    category: 'social',
    progress: 10,
    total: 10,
    unlocked: true,
    reward: '+150 XP',
    rarity: 'rare',
  },
  {
    id: '4',
    title: 'Triple Threat',
    description: 'Learn 3 different languages',
    icon: '🌍',
    category: 'learning',
    progress: 2,
    total: 3,
    unlocked: false,
    reward: '+200 XP',
    rarity: 'epic',
  },
];

const dailyChallenges: Challenge[] = [
  {
    id: '1',
    title: 'Daily Conversation',
    description: 'Complete a 30-minute session',
    icon: '💬',
    progress: 15,
    total: 30,
    reward: '+100 XP',
    expiresIn: '8h 23m',
  },
  {
    id: '2',
    title: 'Make a Friend',
    description: 'Send 3 connection requests',
    icon: '👋',
    progress: 2,
    total: 3,
    reward: '+75 XP',
    expiresIn: '8h 23m',
  },
];

const leaderboard = [
  { id: '1', name: 'Emma Chen', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100', points: 12450, rank: 1, badge: '👑' },
  { id: '2', name: 'Lucas Silva', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100', points: 11280, rank: 2, badge: '🥈' },
  { id: '3', name: 'Sophie Martin', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100', points: 10950, rank: 3, badge: '🥉' },
  { id: '4', name: 'You', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100', points: 9820, rank: 42 },
];

const rarityColors: Record<string, string[]> = {
  common: ['#6B7280', '#4B5563'],
  rare: ['#3B82F6', '#2563EB'],
  epic: ['#A855F7', '#7E22CE'],
  legendary: ['#F59E0B', '#D97706'],
};

export default function GamificationScreen() {
  const { colors } = useTheme();
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showConfetti, setShowConfetti] = useState(false);
  const [claimedChallenge, setClaimedChallenge] = useState<string | null>(null);

  const levelProgress = (userStats.currentXP / userStats.nextLevelXP) * 100;

  const filteredAchievements =
    selectedCategory === 'all'
      ? achievements
      : achievements.filter((a) => a.category === selectedCategory);

  const handleClaimReward = (challengeId: string) => {
    setClaimedChallenge(challengeId);
    setShowConfetti(true);
    setTimeout(() => {
      setShowConfetti(false);
      setClaimedChallenge(null);
    }, 3000);
  };

  const tabs = [
    { id: 'overview' as TabType, label: 'Overview', icon: 'trending-up' },
    { id: 'achievements' as TabType, label: 'Achievements', icon: 'trophy' },
    { id: 'challenges' as TabType, label: 'Challenges', icon: 'target' },
    { id: 'leaderboard' as TabType, label: 'Leaderboard', icon: 'medal' },
  ];

  const categories = [
    { id: 'all', label: 'All', icon: '🌟' },
    { id: 'sessions', label: 'Sessions', icon: '📚' },
    { id: 'streaks', label: 'Streaks', icon: '🔥' },
    { id: 'social', label: 'Social', icon: '👥' },
    { id: 'learning', label: 'Learning', icon: '🎓' },
    { id: 'special', label: 'Special', icon: '👑' },
  ];

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
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
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
                      <Text style={styles.levelValue}>{userStats.level}</Text>
                      <Text style={styles.trophyEmoji}>🏆</Text>
                    </View>
                  </View>
                </View>

                {/* XP Progress */}
                <View style={styles.xpSection}>
                  <View style={styles.xpHeader}>
                    <Text style={styles.xpText}>{userStats.currentXP.toLocaleString()} XP</Text>
                    <Text style={styles.xpText}>{userStats.nextLevelXP.toLocaleString()} XP</Text>
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
                    {userStats.nextLevelXP - userStats.currentXP} XP to Level {userStats.level + 1}
                  </Text>
                </View>
              </View>
            </LinearGradient>

            {/* Streak Card */}
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
                    <Text style={styles.streakValue}>{userStats.currentStreak}</Text>
                    <Text style={styles.streakUnit}>days</Text>
                  </View>
                </View>
                <Ionicons name="flame" size={64} color="#FFFFFF" />
              </View>
              <View style={styles.streakFooter}>
                <View>
                  <Text style={styles.streakFooterLabel}>Longest Streak</Text>
                  <Text style={styles.streakFooterValue}>{userStats.longestStreak} days 🎖️</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={styles.streakFooterLabel}>Keep it up!</Text>
                  <Text style={styles.streakFooterValue}>+5 XP/day</Text>
                </View>
              </View>
            </LinearGradient>

            {/* Quick Stats */}
            <View style={styles.statsGrid}>
              {[
                { label: 'Total Sessions', value: userStats.totalSessions, icon: '📚', color: ['#6366F1', '#4F46E5'] },
                { label: 'Practice Hours', value: `${userStats.totalHours}h`, icon: '⏱️', color: ['#EC4899', '#DB2777'] },
                { label: 'Global Rank', value: `#${userStats.rank}`, icon: '🌍', color: ['#14B8A6', '#0D9488'] },
                { label: 'Weekly XP', value: userStats.weeklyXP, icon: '⚡', color: ['#F59E0B', '#D97706'] },
              ].map((stat, index) => (
                <LinearGradient
                  key={index}
                  colors={stat.color}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.statCard}
                >
                  <Text style={styles.statIcon}>{stat.icon}</Text>
                  <Text style={styles.statValue}>{stat.value}</Text>
                  <Text style={styles.statLabel}>{stat.label}</Text>
                </LinearGradient>
              ))}
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
              {filteredAchievements.map((achievement) => (
                <LinearGradient
                  key={achievement.id}
                  colors={
                    achievement.unlocked
                      ? rarityColors[achievement.rarity] || ['#6B7280', '#4B5563']
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
                    <Text style={styles.achievementIcon}>{achievement.icon}</Text>
                    <View style={styles.achievementInfo}>
                      <Text
                        style={[
                          styles.achievementTitle,
                          {
                            color: achievement.unlocked ? '#FFFFFF' : colors.text.muted,
                          },
                        ]}
                      >
                        {achievement.title}
                      </Text>
                      <Text
                        style={[
                          styles.achievementDescription,
                          {
                            color: achievement.unlocked ? 'rgba(255,255,255,0.8)' : colors.text.muted,
                          },
                        ]}
                      >
                        {achievement.description}
                      </Text>
                      {!achievement.unlocked && (
                        <View style={styles.achievementProgress}>
                          <View style={styles.achievementProgressBar}>
                            <View
                              style={[
                                styles.achievementProgressFill,
                                {
                                  width: `${(achievement.progress / achievement.total) * 100}%`,
                                  backgroundColor: colors.primary,
                                },
                              ]}
                            />
                          </View>
                          <Text style={[styles.achievementProgressText, { color: colors.text.muted }]}>
                            {achievement.progress}/{achievement.total}
                          </Text>
                        </View>
                      )}
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
                          {achievement.reward}
                        </Text>
                      </View>
                    </View>
                    {achievement.unlocked && (
                      <Ionicons name="checkmark-circle" size={24} color="#FFFFFF" />
                    )}
                  </View>
                </LinearGradient>
              ))}
            </View>
          </View>
        )}

        {activeTab === 'challenges' && (
          <View style={styles.challengesContent}>
            {/* Timer Header */}
            <LinearGradient
              colors={[colors.primary, '#5FB3B3']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.challengeTimerCard}
            >
              <View>
                <Text style={styles.challengeTimerLabel}>Daily Challenges Reset In</Text>
                <Text style={styles.challengeTimerValue}>8h 23m</Text>
              </View>
              <Ionicons name="target" size={48} color="#FFFFFF" />
            </LinearGradient>

            {/* Challenges List */}
            <View style={styles.challengesList}>
              {dailyChallenges.map((challenge) => {
                const isCompleted = challenge.progress >= challenge.total;
                const isClaimed = claimedChallenge === challenge.id;

                return (
                  <View
                    key={challenge.id}
                    style={[
                      styles.challengeCard,
                      {
                        backgroundColor: colors.background.secondary,
                        borderColor: isCompleted && !isClaimed ? colors.primary : colors.border.default,
                        borderWidth: isCompleted && !isClaimed ? 2 : 1,
                      },
                    ]}
                  >
                    <Text style={styles.challengeIcon}>{challenge.icon}</Text>
                    <View style={styles.challengeInfo}>
                      <View style={styles.challengeHeader}>
                        <View>
                          <Text style={[styles.challengeTitle, { color: colors.text.primary }]}>
                            {challenge.title}
                          </Text>
                          <Text style={[styles.challengeDescription, { color: colors.text.muted }]}>
                            {challenge.description}
                          </Text>
                        </View>
                        <Text style={[styles.challengeExpires, { color: colors.text.muted }]}>
                          {challenge.expiresIn}
                        </Text>
                      </View>

                      <View style={styles.challengeProgress}>
                        <View style={styles.challengeProgressHeader}>
                          <Text style={[styles.challengeProgressText, { color: colors.text.muted }]}>
                            {challenge.progress}/{challenge.total}
                          </Text>
                          <Text style={[styles.challengeProgressPercent, { color: colors.primary }]}>
                            {Math.round((challenge.progress / challenge.total) * 100)}%
                          </Text>
                        </View>
                        <View style={[styles.challengeProgressBar, { backgroundColor: colors.background.primary }]}>
                          <View
                            style={[
                              styles.challengeProgressFill,
                              {
                                width: `${(challenge.progress / challenge.total) * 100}%`,
                                backgroundColor: colors.primary,
                              },
                            ]}
                          />
                        </View>
                      </View>

                      {isCompleted && !isClaimed && (
                        <TouchableOpacity
                          style={[styles.claimButton, { backgroundColor: colors.primary }]}
                          onPress={() => handleClaimReward(challenge.id)}
                        >
                          <Ionicons name="gift-outline" size={20} color="#FFFFFF" />
                          <Text style={styles.claimButtonText}>Claim {challenge.reward}</Text>
                        </TouchableOpacity>
                      )}

                      {isClaimed && (
                        <View style={[styles.claimedButton, { backgroundColor: colors.background.primary }]}>
                          <Ionicons name="checkmark-circle" size={20} color={colors.primary} />
                          <Text style={[styles.claimedButtonText, { color: colors.text.muted }]}>Claimed!</Text>
                        </View>
                      )}

                      {!isCompleted && (
                        <View style={styles.challengeReward}>
                          <Ionicons name="flash-outline" size={16} color="#F59E0B" />
                          <Text style={[styles.challengeRewardText, { color: colors.text.muted }]}>
                            Reward: {challenge.reward}
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {activeTab === 'leaderboard' && (
          <View style={styles.leaderboardContent}>
            {/* Top 3 Podium */}
            <View style={styles.podium}>
              {/* 2nd Place */}
              <View style={styles.podiumItem}>
                <Image source={{ uri: leaderboard[1].avatar }} style={styles.podiumAvatar} />
                <Text style={[styles.podiumName, { color: colors.text.primary }]}>
                  {leaderboard[1].name.split(' ')[0]}
                </Text>
                <Text style={[styles.podiumPoints, { color: colors.primary }]}>
                  {leaderboard[1].points.toLocaleString()}
                </Text>
                <View style={[styles.podiumBase, { backgroundColor: '#C0C0C0', height: 112 }]}>
                  <Text style={styles.podiumBadge}>{leaderboard[1].badge}</Text>
                </View>
              </View>

              {/* 1st Place */}
              <View style={styles.podiumItem}>
                <Image source={{ uri: leaderboard[0].avatar }} style={[styles.podiumAvatar, styles.podiumAvatarFirst]} />
                <Text style={[styles.podiumName, { color: colors.text.primary }]}>
                  {leaderboard[0].name.split(' ')[0]}
                </Text>
                <Text style={[styles.podiumPoints, { color: colors.primary }]}>
                  {leaderboard[0].points.toLocaleString()}
                </Text>
                <View style={[styles.podiumBase, { backgroundColor: '#FFD700', height: 144 }]}>
                  <Text style={styles.podiumBadge}>{leaderboard[0].badge}</Text>
                </View>
              </View>

              {/* 3rd Place */}
              <View style={styles.podiumItem}>
                <Image source={{ uri: leaderboard[2].avatar }} style={styles.podiumAvatar} />
                <Text style={[styles.podiumName, { color: colors.text.primary }]}>
                  {leaderboard[2].name.split(' ')[0]}
                </Text>
                <Text style={[styles.podiumPoints, { color: colors.primary }]}>
                  {leaderboard[2].points.toLocaleString()}
                </Text>
                <View style={[styles.podiumBase, { backgroundColor: '#CD7F32', height: 96 }]}>
                  <Text style={styles.podiumBadge}>{leaderboard[2].badge}</Text>
                </View>
              </View>
            </View>

            {/* Your Rank Card */}
            <LinearGradient
              colors={[colors.primary, '#5FB3B3']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.yourRankCard}
            >
              <Image source={{ uri: leaderboard[3].avatar }} style={styles.yourRankAvatar} />
              <View style={styles.yourRankInfo}>
                <Text style={styles.yourRankLabel}>Your Rank</Text>
                <Text style={styles.yourRankValue}>#{leaderboard[3].rank}</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={styles.yourRankLabel}>Total XP</Text>
                <Text style={styles.yourRankValue}>{leaderboard[3].points.toLocaleString()}</Text>
              </View>
            </LinearGradient>

            {/* Full Leaderboard */}
            <View style={styles.fullLeaderboard}>
              <Text style={[styles.leaderboardTitle, { color: colors.text.primary }]}>
                Top Language Learners
              </Text>
              {leaderboard.map((user) => (
                <View
                  key={user.id}
                  style={[
                    styles.leaderboardItem,
                    {
                      backgroundColor:
                        user.id === '4'
                          ? `${colors.primary}20`
                          : colors.background.secondary,
                      borderColor: user.id === '4' ? colors.primary : colors.border.default,
                      borderWidth: user.id === '4' ? 1 : 0,
                    },
                  ]}
                >
                  <Text style={[styles.leaderboardRank, { color: colors.text.muted }]}>
                    {user.badge || `#${user.rank}`}
                  </Text>
                  <Image source={{ uri: user.avatar }} style={styles.leaderboardAvatar} />
                  <View style={styles.leaderboardUserInfo}>
                    <Text style={[styles.leaderboardUserName, { color: colors.text.primary }]}>
                      {user.name}
                    </Text>
                    <Text style={[styles.leaderboardUserPoints, { color: colors.text.muted }]}>
                      {user.points.toLocaleString()} XP
                    </Text>
                  </View>
                  {user.badge && <Text style={styles.leaderboardBadge}>{user.badge}</Text>}
                </View>
              ))}
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
  achievementProgress: {
    gap: 4,
  },
  achievementProgressBar: {
    height: 8,
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  achievementProgressFill: {
    height: '100%',
    borderRadius: 4,
  },
  achievementProgressText: {
    fontSize: 12,
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
  challengesContent: {
    padding: 16,
    gap: 16,
  },
  challengeTimerCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
  },
  challengeTimerLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '500',
    marginBottom: 4,
  },
  challengeTimerValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  challengesList: {
    gap: 12,
  },
  challengeCard: {
    flexDirection: 'row',
    padding: 20,
    borderRadius: 16,
    gap: 16,
  },
  challengeIcon: {
    fontSize: 40,
  },
  challengeInfo: {
    flex: 1,
    gap: 12,
  },
  challengeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  challengeTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  challengeDescription: {
    fontSize: 13,
  },
  challengeExpires: {
    fontSize: 12,
    fontWeight: '500',
  },
  challengeProgress: {
    gap: 8,
  },
  challengeProgressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  challengeProgressText: {
    fontSize: 12,
  },
  challengeProgressPercent: {
    fontSize: 12,
    fontWeight: '600',
  },
  challengeProgressBar: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  challengeProgressFill: {
    height: '100%',
    borderRadius: 4,
  },
  claimButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  claimButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  claimedButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  claimedButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  challengeReward: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  challengeRewardText: {
    fontSize: 13,
  },
  leaderboardContent: {
    padding: 16,
    gap: 16,
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

