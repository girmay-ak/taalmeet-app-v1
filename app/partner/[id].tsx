/**
 * Partner Profile Screen - React Native
 * Shows detailed profile of a language partner
 */

import { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/lib/theme/ThemeProvider';
import { useUserProfile } from '@/hooks/useProfile';
import { useAvailability } from '@/hooks/useAvailability';
import { useCreateConversation } from '@/hooks/useMessages';
import { getLanguageFlag } from '@/utils/languageFlags';
import { ActivityIndicator } from 'react-native';

export default function PartnerProfileScreen() {
  const { id: partnerId } = useLocalSearchParams<{ id: string }>();
  const { colors } = useTheme();
  const [isLiked, setIsLiked] = useState(false);

  // Fetch partner profile from backend
  const { data: partnerProfile, isLoading, error } = useUserProfile(partnerId);
  const { data: availability } = useAvailability(partnerId);
  const createConversationMutation = useCreateConversation();

  // Show loading state
  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background.primary }]} edges={['top']}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={{ color: colors.text.muted, marginTop: 16 }}>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Show error state
  if (error || !partnerProfile) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background.primary }]} edges={['top']}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 }}>
          <Ionicons name="alert-circle-outline" size={48} color={colors.text.muted} />
          <Text style={{ color: colors.text.primary, marginTop: 16, fontSize: 16, fontWeight: '600' }}>
            Profile not found
          </Text>
          <Text style={{ color: colors.text.muted, marginTop: 8, textAlign: 'center' }}>
            This user profile could not be loaded.
          </Text>
          <TouchableOpacity
            style={{ marginTop: 24, padding: 12, backgroundColor: colors.primary, borderRadius: 12 }}
            onPress={() => router.back()}
          >
            <Text style={{ color: '#FFFFFF', fontWeight: '600' }}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Extract data from profile
  const teachingLang = partnerProfile.languages?.find(l => l.role === 'teaching');
  const learningLang = partnerProfile.languages?.find(l => l.role === 'learning');
  const isOnline = partnerProfile.is_online || false;
  const availableNow = availability?.status === 'available';

  const handleMessage = async () => {
    if (!partnerId) return;
    
    try {
      // Get or create conversation with this partner
      const conversationId = await createConversationMutation.mutateAsync(partnerId);
      // Navigate to chat with conversation ID
      router.push(`/chat/${conversationId}`);
    } catch (error) {
      // Error is handled by the hook
    }
  };

  const handleVideoCall = () => {
    Alert.alert('Video Call', 'Video calling feature coming soon!');
  };

  const handleShare = () => {
    Alert.alert('Share', 'Share profile feature coming soon!');
  };

  const handleReport = () => {
    Alert.alert(
      'Report User',
      'Are you sure you want to report this user?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Report', style: 'destructive', onPress: () => Alert.alert('Reported', 'Thank you for your report.') },
      ]
    );
  };

  const renderStars = (rating: number) => {
    return (
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Ionicons
            key={star}
            name={star <= rating ? 'star' : 'star-outline'}
            size={14}
            color={star <= rating ? '#F59E0B' : colors.border.default}
          />
        ))}
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background.primary }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.background.secondary, borderColor: colors.border.default }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={handleShare} style={styles.headerButton}>
            <Ionicons name="share-outline" size={24} color={colors.text.primary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton}>
            <Ionicons name="ellipsis-vertical" size={24} color={colors.text.primary} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <View style={[styles.profileHeader, { backgroundColor: colors.background.secondary }]}>
          {/* Avatar */}
          <View style={styles.avatarContainer}>
            <Image 
              source={{ 
                uri: partnerProfile.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=300' 
              }} 
              style={[styles.avatar, { borderColor: colors.border.default }]} 
            />
            {isOnline && (
              <View style={[styles.onlineIndicator, { borderColor: colors.background.primary }]} />
            )}
          </View>

          {/* Name & Badges */}
          <View style={styles.nameRow}>
            <Text style={[styles.name, { color: colors.text.primary }]}>
              {partnerProfile.display_name}
            </Text>
          </View>

          {/* Location */}
          <View style={styles.locationRow}>
            <Ionicons name="location-outline" size={16} color={colors.text.muted} />
            <Text style={[styles.locationText, { color: colors.text.muted }]}>
              {partnerProfile.city && partnerProfile.country
                ? `${partnerProfile.city}, ${partnerProfile.country}`
                : partnerProfile.city || partnerProfile.country || 'Location not set'}
            </Text>
          </View>

          {/* Available Now */}
          {availableNow && (
            <View style={styles.availableRow}>
              <View style={styles.availableDot} />
              <Text style={styles.availableText}>Available now</Text>
            </View>
          )}

          {/* Stats - Placeholder for future implementation */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <View style={styles.statValue}>
                <Ionicons name="star" size={20} color="#F59E0B" />
                <Text style={[styles.statNumber, { color: colors.text.primary }]}>0</Text>
              </View>
              <Text style={[styles.statLabel, { color: colors.text.muted }]}>0 reviews</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: colors.text.primary }]}>0</Text>
              <Text style={[styles.statLabel, { color: colors.text.muted }]}>Exchanges</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: colors.primary }]}>0%</Text>
              <Text style={[styles.statLabel, { color: colors.text.muted }]}>Match</Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity
              onPress={handleMessage}
              style={[styles.chatButton, { backgroundColor: colors.primary }]}
            >
              <Ionicons name="chatbubble" size={20} color="#FFFFFF" />
              <Text style={styles.chatButtonText}>Chat Now</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setIsLiked(!isLiked)}
              style={[styles.iconButton, { borderColor: colors.border.default }]}
            >
              <Ionicons
                name={isLiked ? 'heart' : 'heart-outline'}
                size={24}
                color={isLiked ? '#E91E8C' : colors.text.primary}
              />
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            onPress={handleVideoCall}
            style={[styles.videoButton, { borderColor: colors.border.default }]}
          >
            <Ionicons name="videocam" size={20} color={colors.text.primary} />
            <Text style={[styles.videoButtonText, { color: colors.text.primary }]}>Video Call</Text>
          </TouchableOpacity>
        </View>

        {/* About Section */}
        <View style={[styles.section, { backgroundColor: colors.background.secondary, borderColor: colors.border.default }]}>
          <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>About</Text>
          <Text style={[styles.bioText, { color: colors.text.muted }]}>
            {partnerProfile.bio || 'No bio available'}
          </Text>
        </View>

        {/* Languages Section */}
        <View style={[styles.section, { backgroundColor: colors.background.secondary, borderColor: colors.border.default }]}>
          <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>Languages</Text>

          {/* Teaching */}
          <View style={styles.languageGroup}>
            <Text style={[styles.languageLabel, { color: colors.text.muted }]}>Teaching</Text>
            {teachingLang ? (
              <View style={[styles.languageCard, { backgroundColor: colors.background.primary }]}>
                <Text style={styles.languageFlag}>{getLanguageFlag(teachingLang.language)}</Text>
                <View style={styles.languageInfo}>
                  <Text style={[styles.languageName, { color: colors.text.primary }]}>{teachingLang.language}</Text>
                  <Text style={[styles.languageLevel, { color: '#4FD1C5' }]}>
                    {teachingLang.level || 'Native'}
                  </Text>
                </View>
                <View style={[styles.progressBar, { backgroundColor: colors.border.default }]}>
                  <View style={[styles.progressFill, { width: '100%', backgroundColor: '#4FD1C5' }]} />
                </View>
              </View>
            ) : (
              <Text style={[styles.emptyLanguageText, { color: colors.text.muted }]}>No teaching languages</Text>
            )}
          </View>

          {/* Learning */}
          <View style={styles.languageGroup}>
            <Text style={[styles.languageLabel, { color: colors.text.muted }]}>Learning</Text>
            {learningLang ? (
              <View style={[styles.languageCard, { backgroundColor: colors.background.primary }]}>
                <Text style={styles.languageFlag}>{getLanguageFlag(learningLang.language)}</Text>
                <View style={styles.languageInfo}>
                  <Text style={[styles.languageName, { color: colors.text.primary }]}>{learningLang.language}</Text>
                  <Text style={[styles.languageLevel, { color: '#5FB3B3' }]}>
                    {learningLang.level || 'Beginner'}
                  </Text>
                </View>
                <View style={[styles.progressBar, { backgroundColor: colors.border.default }]}>
                  <View style={[styles.progressFill, { width: '70%', backgroundColor: '#5FB3B3' }]} />
                </View>
              </View>
            ) : (
              <Text style={[styles.emptyLanguageText, { color: colors.text.muted }]}>No learning languages</Text>
            )}
          </View>
        </View>

        {/* Interests Section */}
        {partnerProfile.interests && partnerProfile.interests.length > 0 && (
          <View style={[styles.section, { backgroundColor: colors.background.secondary, borderColor: colors.border.default }]}>
            <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>Interests</Text>
            <View style={styles.interestsContainer}>
              {partnerProfile.interests.map((interest, index) => (
                <View
                  key={index}
                  style={[styles.interestTag, { backgroundColor: colors.background.primary, borderColor: colors.border.default }]}
                >
                  <Text style={[styles.interestText, { color: colors.text.muted }]}>{interest}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Reviews Section - Placeholder for future implementation */}
        <View style={[styles.section, { backgroundColor: colors.background.secondary, borderColor: colors.border.default }]}>
          <View style={styles.reviewsHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>
              Reviews (0)
            </Text>
            <View style={styles.ratingBadge}>
              <Ionicons name="star" size={16} color="#F59E0B" />
              <Text style={[styles.ratingText, { color: colors.text.primary }]}>0</Text>
            </View>
          </View>
          <Text style={[styles.emptyReviewsText, { color: colors.text.muted }]}>
            No reviews yet
          </Text>
        </View>

        {/* Report Button */}
        <TouchableOpacity onPress={handleReport} style={styles.reportButton}>
          <Text style={styles.reportText}>Report User</Text>
        </TouchableOpacity>
      </ScrollView>
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
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  headerButton: {
    padding: 8,
  },
  headerActions: {
    flexDirection: 'row',
  },
  content: {
    flex: 1,
  },
  profileHeader: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 24,
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
  onlineIndicator: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#4FD1C5',
    borderWidth: 4,
  },
  nameRow: {
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
    marginBottom: 4,
  },
  locationText: {
    fontSize: 14,
  },
  availableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  availableDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4FD1C5',
  },
  availableText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#4FD1C5',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 32,
    marginTop: 8,
    marginBottom: 24,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 12,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
    marginBottom: 12,
  },
  chatButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
  },
  chatButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  iconButton: {
    width: 52,
    height: 52,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  videoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    width: '100%',
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  videoButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  section: {
    marginHorizontal: 16,
    marginTop: 16,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  bioText: {
    fontSize: 14,
    lineHeight: 22,
  },
  languageGroup: {
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
    fontSize: 15,
    fontWeight: '500',
  },
  languageLevel: {
    fontSize: 12,
    marginTop: 2,
  },
  progressBar: {
    width: 80,
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  interestsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  interestTag: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  interestText: {
    fontSize: 14,
  },
  reviewsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 16,
    fontWeight: '600',
  },
  reviewItem: {
    paddingBottom: 16,
    marginBottom: 16,
  },
  reviewHeader: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 8,
  },
  reviewerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  reviewerInfo: {
    flex: 1,
  },
  reviewerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  reviewerName: {
    fontSize: 14,
    fontWeight: '500',
  },
  reviewDate: {
    fontSize: 12,
  },
  starsContainer: {
    flexDirection: 'row',
    gap: 2,
  },
  reviewComment: {
    fontSize: 14,
    lineHeight: 20,
  },
  seeAllButton: {
    paddingVertical: 8,
    alignItems: 'center',
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: '500',
  },
  reportButton: {
    paddingVertical: 16,
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 32,
    alignItems: 'center',
  },
  reportText: {
    fontSize: 14,
    color: '#EF4444',
  },
  emptyLanguageText: {
    fontSize: 14,
    fontStyle: 'italic',
    textAlign: 'center',
    padding: 8,
  },
  emptyReviewsText: {
    fontSize: 14,
    fontStyle: 'italic',
    textAlign: 'center',
    padding: 16,
  },
});

