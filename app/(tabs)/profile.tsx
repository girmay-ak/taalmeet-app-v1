/**
 * Profile Screen
 * User profile with stats, languages, and settings
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Switch,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useTheme } from '@/lib/theme/ThemeProvider';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '@/providers';
import { useSignOut } from '@/hooks/useAuth';
import { getLanguageFlag } from '@/utils/languageFlags';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useAvailability } from '@/hooks/useAvailability';
import { EditProfileModal } from '@/components/profile/EditProfileModal';
import { ChangePasswordModal } from '@/components/profile/ChangePasswordModal';
import { useUpdateProfile } from '@/hooks/useProfile';
import { useChangePassword } from '@/hooks/usePassword';

export default function ProfileScreen() {
  const { colors } = useTheme();
  const { profile, loading } = useAuth();
  const { data: currentUser } = useCurrentUser();
  const signOutMutation = useSignOut();
  const updateProfileMutation = useUpdateProfile();
  const changePasswordMutation = useChangePassword();

  // Modal states
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);

  // Get availability status
  const userId = currentUser?.id;
  const { data: availability } = useAvailability(userId);
  const isAvailable = availability?.status === 'available' || availability?.status === 'soon';

  // Show loading state while profile is being fetched
  if (loading || !profile) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background.primary }]}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.text.muted, marginTop: 16 }]}>
            Loading profile...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: () => signOutMutation.mutate(),
        },
      ]
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background.primary }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: colors.background.secondary }]}>
          <Text style={[styles.headerTitle, { color: colors.text.primary }]}>Profile</Text>
          <TouchableOpacity
            style={styles.settingsButton}
            onPress={() => router.push('/settings')}
          >
            <Ionicons name="settings-outline" size={24} color={colors.text.primary} />
          </TouchableOpacity>
        </View>

        {/* Profile Header */}
        <LinearGradient
          colors={[colors.background.secondary, colors.background.primary]}
          style={styles.profileHeader}
        >
          {/* Avatar */}
          <View style={styles.avatarContainer}>
            <Image
              source={{ 
                uri: (profile.avatarUrl && profile.avatarUrl.trim() !== '') 
                  ? profile.avatarUrl 
                  : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400'
              }}
              style={[styles.avatar, { borderColor: colors.border.default }]}
            />
            <TouchableOpacity style={[styles.editAvatarButton, { backgroundColor: colors.primary }]}>
              <Ionicons name="pencil" size={16} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          {/* Name & Badges */}
          <View style={styles.nameContainer}>
            <Text style={[styles.name, { color: colors.text.primary }]}>
              {profile.displayName}
            </Text>
          </View>

          {/* Location */}
          <View style={styles.locationRow}>
            <Ionicons name="location-outline" size={16} color={colors.text.muted} />
            <Text style={[styles.location, { color: colors.text.muted }]}>
              {profile.city && profile.country
                ? `${profile.city}, ${profile.country}`
                : profile.city || profile.country || 'Location not set'}
            </Text>
          </View>

          {/* Stats - Placeholder for future implementation */}
          <View style={styles.statsRow}>
            <TouchableOpacity
              style={styles.statItem}
              onPress={() => router.push('/connections')}
            >
              <Text style={[styles.statValue, { color: colors.text.primary }]}>0</Text>
              <Text style={[styles.statLabel, { color: colors.text.muted }]}>
                Connections
              </Text>
            </TouchableOpacity>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.text.primary }]}>0</Text>
              <Text style={[styles.statLabel, { color: colors.text.muted }]}>
                Exchanges
              </Text>
            </View>
            <View style={styles.statItem}>
              <View style={styles.ratingRow}>
                <Ionicons name="star" size={18} color="#F59E0B" />
                <Text style={[styles.statValue, { color: colors.text.primary }]}>0</Text>
              </View>
              <Text style={[styles.statLabel, { color: colors.text.muted }]}>
                Rating
              </Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.editButton, { backgroundColor: colors.primary }]}
              onPress={() => setShowEditProfileModal(true)}
            >
              <Ionicons name="pencil" size={18} color="#FFFFFF" />
              <Text style={styles.editButtonText}>Edit Profile</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.shareButton, { borderColor: colors.border.default }]}>
              <Ionicons name="share-outline" size={18} color={colors.text.primary} />
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {/* Gamification Card */}
        <TouchableOpacity
          style={styles.gamificationCard}
          activeOpacity={0.9}
          onPress={() => router.push('/gamification')}
        >
          <LinearGradient
            colors={[colors.primary, '#1ED760', '#5FB3B3']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.gamificationGradient}
          >
            <View style={styles.gamificationHeader}>
              <View style={styles.gamificationTitleRow}>
                <Ionicons name="trophy" size={24} color="#FFFFFF" />
                <Text style={styles.gamificationTitle}>Your Progress</Text>
              </View>
              <Ionicons name="trending-up" size={20} color="#FFFFFF" />
            </View>

            <View style={styles.progressStats}>
              <View style={styles.progressItem}>
                <View style={styles.progressItemHeader}>
                  <Ionicons name="flash" size={16} color="#FFFFFF" />
                  <Text style={styles.progressLabel}>Level</Text>
                </View>
                <Text style={styles.progressValue}>12</Text>
                <Text style={styles.progressSubtext}>3,420 / 4,000 XP</Text>
              </View>

              <View style={styles.progressItem}>
                <View style={styles.progressItemHeader}>
                  <Ionicons name="flame" size={16} color="#FFFFFF" />
                  <Text style={styles.progressLabel}>Streak</Text>
                </View>
                <Text style={styles.progressValue}>23</Text>
                <Text style={styles.progressSubtext}>🔥 On fire!</Text>
              </View>
            </View>
          </LinearGradient>
        </TouchableOpacity>

        {/* Verification Banner */}
        {!(profile as any).verified && (
          <View style={[styles.verificationBanner, { backgroundColor: `${colors.primary}20`, borderColor: colors.primary }]}>
            <View style={styles.verificationBannerContent}>
              <View style={[styles.verificationIcon, { backgroundColor: `${colors.primary}20` }]}>
                <Ionicons name="shield-checkmark" size={24} color={colors.primary} />
              </View>
              <View style={styles.verificationText}>
                <Text style={[styles.verificationTitle, { color: colors.text.primary }]}>
                  Verify Your Profile
                </Text>
                <Text style={[styles.verificationSubtitle, { color: colors.text.muted }]}>
                  Get verified badge and build trust with partners
                </Text>
              </View>
              <TouchableOpacity
                style={[styles.verificationButton, { backgroundColor: colors.primary }]}
                onPress={() => router.push('/profile/verification')}
              >
                <Text style={styles.verificationButtonText}>Verify</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* About Section */}
        <View style={[styles.section, { backgroundColor: colors.background.secondary, borderColor: colors.border.default }]}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>About</Text>
            <TouchableOpacity onPress={() => setShowEditProfileModal(true)}>
              <Text style={[styles.editLink, { color: colors.primary }]}>Edit</Text>
            </TouchableOpacity>
          </View>
          <Text style={[styles.bioText, { color: colors.text.muted }]}>
            {profile.bio || 'No bio yet. Add one to tell others about yourself!'}
          </Text>
        </View>

        {/* Languages Section */}
        <View style={[styles.section, { backgroundColor: colors.background.secondary, borderColor: colors.border.default }]}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>Languages</Text>
            <TouchableOpacity>
              <Text style={[styles.editLink, { color: colors.primary }]}>Edit</Text>
            </TouchableOpacity>
          </View>

          {/* Teaching */}
          <View style={styles.languageSection}>
            <Text style={[styles.languageLabel, { color: colors.text.muted }]}>Teaching</Text>
            {profile?.languages?.teaching && profile.languages.teaching.length > 0 ? (
              profile.languages.teaching.map((lang, index) => (
                <View key={index} style={[styles.languageCard, { backgroundColor: colors.background.primary }]}>
                  <Text style={styles.languageFlag}>{getLanguageFlag(lang.language)}</Text>
                  <View style={styles.languageInfo}>
                    <Text style={[styles.languageName, { color: colors.text.primary }]}>
                      {lang.language}
                    </Text>
                    <Text style={[styles.languageLevel, { color: colors.primary }]}>
                      {lang.level || 'Native'}
                    </Text>
                  </View>
                  <View style={[styles.progressBar, { backgroundColor: colors.border.default }]}>
                    <View style={[styles.progressFill, { backgroundColor: colors.primary, width: '100%' }]} />
                  </View>
                </View>
              ))
            ) : (
              <View style={[styles.languageCard, { backgroundColor: colors.background.primary }]}>
                <Text style={[styles.emptyLanguageText, { color: colors.text.muted }]}>
                  No teaching languages set
                  </Text>
              </View>
            )}
          </View>

          {/* Learning */}
          <View style={styles.languageSection}>
            <Text style={[styles.languageLabel, { color: colors.text.muted }]}>Learning</Text>
            {profile?.languages?.learning && profile.languages.learning.length > 0 ? (
              profile.languages.learning.map((lang, index) => (
                <View key={index} style={[styles.languageCard, { backgroundColor: colors.background.primary }]}>
                  <Text style={styles.languageFlag}>{getLanguageFlag(lang.language)}</Text>
                  <View style={styles.languageInfo}>
                    <Text style={[styles.languageName, { color: colors.text.primary }]}>
                      {lang.language}
                    </Text>
                    <Text style={[styles.languageLevel, { color: '#5FB3B3' }]}>
                      {lang.level || 'Beginner'}
                    </Text>
                  </View>
                  <View style={[styles.progressBar, { backgroundColor: colors.border.default }]}>
                    <View style={[styles.progressFill, { backgroundColor: '#5FB3B3', width: '60%' }]} />
                  </View>
                </View>
              ))
            ) : (
              <View style={[styles.languageCard, { backgroundColor: colors.background.primary }]}>
                <Text style={[styles.emptyLanguageText, { color: colors.text.muted }]}>
                  No learning languages set
                  </Text>
              </View>
            )}
          </View>
        </View>

        {/* Interests Section */}
        <View style={[styles.section, { backgroundColor: colors.background.secondary, borderColor: colors.border.default }]}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>Interests</Text>
            <TouchableOpacity>
              <Text style={[styles.editLink, { color: colors.primary }]}>Edit</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.interestsGrid}>
            {profile.interests && profile.interests.length > 0 ? (
              profile.interests.map((interest, index) => (
              <View
                key={index}
                style={[styles.interestChip, { backgroundColor: colors.background.primary, borderColor: colors.border.default }]}
              >
                <Text style={[styles.interestText, { color: colors.text.muted }]}>
                  {interest}
                </Text>
              </View>
              ))
            ) : (
              <Text style={[styles.emptyInterestsText, { color: colors.text.muted }]}>
                No interests set
              </Text>
            )}
          </View>
        </View>

        {/* Availability Section */}
        <View style={[styles.section, { backgroundColor: colors.background.secondary, borderColor: colors.border.default }]}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>Availability</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/available')}>
              <Text style={[styles.editLink, { color: colors.primary }]}>Manage</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.availabilityInfo}>
            <View style={styles.availabilityRow}>
              <View style={[styles.availableDot, { backgroundColor: isAvailable ? '#10B981' : colors.text.muted }]} />
              <Text style={[styles.availabilityText, { color: isAvailable ? '#10B981' : colors.text.muted }]}>
                {availability?.status === 'available' ? 'Available now' : 
                 availability?.status === 'soon' ? 'Available soon' :
                 availability?.status === 'busy' ? 'Busy' : 'Offline'}
              </Text>
            </View>
            {availability?.weeklySchedule && availability.weeklySchedule.length > 0 && (
            <View style={styles.scheduleRow}>
              <Ionicons name="calendar-outline" size={16} color={colors.text.muted} />
              <Text style={[styles.scheduleText, { color: colors.text.muted }]}>
                  {availability.weeklySchedule.length} schedule slot{availability.weeklySchedule.length !== 1 ? 's' : ''} set
              </Text>
            </View>
            )}
          </View>
        </View>

        {/* Account Actions */}
        <View style={[styles.section, { backgroundColor: colors.background.secondary, borderColor: colors.border.default }]}>
          <TouchableOpacity
            style={[styles.menuItem, { borderBottomColor: colors.border.default }]}
            onPress={() => router.push('/language-preferences')}
          >
            <Text style={[styles.menuText, { color: colors.text.primary }]}>Language Preferences</Text>
            <Ionicons name="chevron-forward" size={20} color={colors.text.muted} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.menuItem, { borderBottomColor: colors.border.default }]}
            onPress={() => router.push('/vocabulary')}
          >
            <Text style={[styles.menuText, { color: colors.text.primary }]}>Vocabulary Builder</Text>
            <Ionicons name="chevron-forward" size={20} color={colors.text.muted} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.menuItem, { borderBottomColor: colors.border.default }]}
            onPress={() => router.push('/groups')}
          >
            <Text style={[styles.menuText, { color: colors.text.primary }]}>Groups & Communities</Text>
            <Ionicons name="chevron-forward" size={20} color={colors.text.muted} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.menuItem, { borderBottomColor: colors.border.default }]}
            onPress={() => setShowChangePasswordModal(true)}
          >
            <Text style={[styles.menuText, { color: colors.text.primary }]}>Change Password</Text>
            <Ionicons name="chevron-forward" size={20} color={colors.text.muted} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.menuItem, { borderBottomColor: colors.border.default }]}
            onPress={() => router.push('/privacy')}
          >
            <Text style={[styles.menuText, { color: colors.text.primary }]}>Privacy & Safety</Text>
            <Ionicons name="chevron-forward" size={20} color={colors.text.muted} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.menuItem, { borderBottomColor: colors.border.default }]}
            onPress={() => router.push('/help')}
          >
            <Text style={[styles.menuText, { color: colors.text.primary }]}>Help & Support</Text>
            <Ionicons name="chevron-forward" size={20} color={colors.text.muted} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem} onPress={handleSignOut}>
            <Text style={[styles.menuText, { color: '#EF4444' }]}>Log Out</Text>
            <Ionicons name="chevron-forward" size={20} color={colors.text.muted} />
          </TouchableOpacity>
        </View>

        {/* Bottom Padding */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Edit Profile Modal */}
      {profile && (
        <EditProfileModal
          isVisible={showEditProfileModal}
          onClose={() => setShowEditProfileModal(false)}
          profile={{
            id: profile.id,
            display_name: profile.displayName,
            avatar_url: profile.avatarUrl,
            bio: profile.bio || null,
            city: profile.city || null,
            country: profile.country || null,
          }}
          onSave={async (data) => {
            await updateProfileMutation.mutateAsync(data);
          }}
        />
      )}

      {/* Change Password Modal */}
      <ChangePasswordModal
        isVisible={showChangePasswordModal}
        onClose={() => setShowChangePasswordModal(false)}
        onSave={async (data) => {
          await changePasswordMutation.mutateAsync(data.newPassword);
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  settingsButton: {
    padding: 8,
  },
  profileHeader: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 32,
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 112,
    height: 112,
    borderRadius: 56,
    borderWidth: 4,
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#0F0F0F',
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 24,
  },
  location: {
    fontSize: 14,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 48,
    marginBottom: 24,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  editButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
  },
  editButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  shareButton: {
    width: 52,
    height: 52,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gamificationCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 24,
    overflow: 'hidden',
  },
  gamificationGradient: {
    padding: 20,
  },
  gamificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  gamificationTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  gamificationTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  progressStats: {
    flexDirection: 'row',
    gap: 16,
  },
  progressItem: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 16,
    padding: 12,
  },
  progressItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  progressLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '500',
  },
  progressValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  progressSubtext: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 2,
  },
  section: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  editLink: {
    fontSize: 14,
  },
  bioText: {
    fontSize: 14,
    lineHeight: 22,
  },
  languageSection: {
    marginBottom: 16,
  },
  languageLabel: {
    fontSize: 12,
    marginBottom: 8,
  },
  languageCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    gap: 12,
  },
  languageFlag: {
    fontSize: 28,
  },
  languageInfo: {
    flex: 1,
  },
  languageName: {
    fontSize: 16,
    fontWeight: '500',
  },
  languageLevel: {
    fontSize: 12,
  },
  progressBar: {
    width: 80,
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  interestsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  interestChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  interestText: {
    fontSize: 14,
  },
  availabilityInfo: {
    gap: 8,
  },
  availabilityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  availableDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  availabilityText: {
    fontSize: 14,
    fontWeight: '500',
  },
  scheduleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  scheduleText: {
    fontSize: 14,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  menuText: {
    fontSize: 16,
  },
  loadingText: {
    fontSize: 14,
  },
  emptyLanguageText: {
    fontSize: 14,
    fontStyle: 'italic',
    textAlign: 'center',
    padding: 8,
  },
  emptyInterestsText: {
    fontSize: 14,
    fontStyle: 'italic',
    textAlign: 'center',
    padding: 8,
  },
  verificationBanner: {
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  verificationBannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  verificationIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  verificationText: {
    flex: 1,
  },
  verificationTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  verificationSubtitle: {
    fontSize: 13,
    lineHeight: 18,
  },
  verificationButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  verificationButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
