/**
 * Event Detail Screen
 * Comprehensive event detail view with RSVP, favorites, sharing
 */

import { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Linking,
  Share as RNShare,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/lib/theme/ThemeProvider';
import { useEvent, useRSVPToEvent, useToggleFavorite, useIsEventHost } from '@/hooks/useEvents';
import { EVENT_CATEGORIES, EVENT_LEVELS } from '@/types/events';
import { getLanguageFlag } from '@/utils/languageFlags';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const IMAGE_HEIGHT = 300;

export default function EventDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors } = useTheme();
  const [imageLoading, setImageLoading] = useState(true);

  // Fetch event data
  const { data: event, isLoading, error, refetch } = useEvent(id);
  const isHost = useIsEventHost(event);

  // Mutations
  const rsvpMutation = useRSVPToEvent();
  const favoriteMutation = useToggleFavorite();

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Format time
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Handle RSVP
  const handleRSVP = useCallback(async () => {
    if (!event) return;

    const isJoined = event.currentUserStatus === 'joined';
    const status = isJoined ? 'declined' : 'joined';
    const action = isJoined ? 'leave' : 'join';

    Alert.alert(
      `${action === 'join' ? 'Join' : 'Leave'} Event`,
      `Are you sure you want to ${action} this event?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: action === 'join' ? 'Join' : 'Leave',
          style: action === 'leave' ? 'destructive' : 'default',
          onPress: async () => {
            try {
              await rsvpMutation.mutateAsync({ eventId: event.id, status });
              Alert.alert(
                'Success',
                `You have ${action === 'join' ? 'joined' : 'left'} the event!`
              );
            } catch (error) {
              Alert.alert('Error', `Failed to ${action} event. Please try again.`);
            }
          },
        },
      ]
    );
  }, [event, rsvpMutation]);

  // Handle favorite toggle
  const handleToggleFavorite = useCallback(async () => {
    if (!event) return;

    try {
      const isFavorited = await favoriteMutation.mutateAsync(event.id);
      // Success feedback handled by mutation
    } catch (error) {
      Alert.alert('Error', 'Failed to update favorite. Please try again.');
    }
  }, [event, favoriteMutation]);

  // Handle share
  const handleShare = useCallback(async () => {
    if (!event) return;

    try {
      await RNShare.share({
        message: `Check out this event: ${event.title}\n\n${event.description}\n\nJoin me on Taalmeet!`,
        title: event.title,
      });
    } catch (error) {
      // User cancelled share
    }
  }, [event]);

  // Handle location press
  const handleLocationPress = useCallback(() => {
    if (!event) return;

    if (event.location.isOnline && event.location.meetingLink) {
      Linking.openURL(event.location.meetingLink);
    } else if (event.location.address) {
      const query = encodeURIComponent(event.location.address);
      Linking.openURL(`https://maps.google.com/?q=${query}`);
    }
  }, [event]);

  // Handle participant press
  const handleParticipantPress = useCallback((userId: string) => {
    router.push(`/partner/${userId}`);
  }, []);

  // Handle edit
  const handleEdit = useCallback(() => {
    if (!event) return;
    router.push(`/event/edit/${event.id}`);
  }, [event]);

  // Loading state
  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background.primary }]}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.text.muted }]}>Loading event...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Error state
  if (error || !event) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background.primary }]}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color={colors.semantic?.error || colors.text.muted} />
          <Text style={[styles.errorText, { color: colors.text.primary }]}>Event Not Found</Text>
          <Text style={[styles.errorSubtext, { color: colors.text.muted }]}>
            {error?.message || 'This event may have been deleted or is no longer available.'}
          </Text>
          <TouchableOpacity
            style={[styles.retryButton, { backgroundColor: colors.primary }]}
            onPress={() => router.back()}
          >
            <Text style={styles.retryButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const category = EVENT_CATEGORIES[event.category];
  const levelInfo = EVENT_LEVELS[event.level];
  const spotsRemaining = event.capacity - event.participantCount;
  const joinedPercentage = Math.round((event.participantCount / event.capacity) * 100);

  return (
    <View style={[styles.container, { backgroundColor: colors.background.primary }]}>
      <Stack.Screen options={{ headerShown: false }} />

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header Image */}
        <View style={styles.imageContainer}>
          {event.coverImageUrl ? (
            <>
              <Image
                source={{ uri: event.coverImageUrl }}
                style={styles.coverImage}
                onLoadEnd={() => setImageLoading(false)}
              />
              {imageLoading && (
                <ActivityIndicator
                  style={styles.imageLoader}
                  size="large"
                  color={colors.primary}
                />
              )}
            </>
          ) : (
            <LinearGradient
              colors={[category.color, `${category.color}99`]}
              style={styles.coverImage}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Ionicons name={category.icon as any} size={80} color="#FFFFFF" />
            </LinearGradient>
          )}

          {/* Overlay Gradient */}
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.7)']}
            style={styles.imageGradient}
          />

          {/* Header Actions */}
          <SafeAreaView edges={['top']} style={styles.headerActions}>
            <TouchableOpacity
              style={[styles.headerButton, { backgroundColor: 'rgba(0,0,0,0.5)' }]}
              onPress={() => router.back()}
            >
              <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
            </TouchableOpacity>

            <View style={styles.headerRightActions}>
              <TouchableOpacity
                style={[styles.headerButton, { backgroundColor: 'rgba(0,0,0,0.5)' }]}
                onPress={handleShare}
              >
                <Ionicons name="share-outline" size={24} color="#FFFFFF" />
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.headerButton, { backgroundColor: 'rgba(0,0,0,0.5)' }]}
                onPress={handleToggleFavorite}
                disabled={favoriteMutation.isPending}
              >
                <Ionicons
                  name={event.isFavorited ? 'heart' : 'heart-outline'}
                  size={24}
                  color={event.isFavorited ? '#FF0000' : '#FFFFFF'}
                />
              </TouchableOpacity>

              {isHost && (
                <TouchableOpacity
                  style={[styles.headerButton, { backgroundColor: 'rgba(0,0,0,0.5)' }]}
                  onPress={handleEdit}
                >
                  <Ionicons name="create-outline" size={24} color="#FFFFFF" />
                </TouchableOpacity>
              )}
            </View>
          </SafeAreaView>

          {/* Badges */}
          <View style={styles.imageBadges}>
            <View style={[styles.badge, { backgroundColor: category.color }]}>
              <Ionicons name={category.icon as any} size={14} color="#FFFFFF" />
              <Text style={styles.badgeText}>{category.label}</Text>
            </View>
            {!event.isFree && (
              <View style={[styles.badge, { backgroundColor: '#10B981' }]}>
                <Text style={styles.badgeText}>
                  {event.currency} {event.price}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Content */}
        <View style={styles.content}>
          {/* Title & Host */}
          <View style={styles.titleSection}>
            <Text style={[styles.title, { color: colors.text.primary }]}>{event.title}</Text>

            <TouchableOpacity
              style={styles.hostInfo}
              onPress={() => router.push(`/partner/${event.hostUserId}`)}
            >
              <Image
                source={{
                  uri: event.host.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
                }}
                style={[styles.hostAvatar, { borderColor: colors.border.default }]}
              />
              <View style={styles.hostDetails}>
                <Text style={[styles.hostLabel, { color: colors.text.muted }]}>Hosted by</Text>
                <View style={styles.hostNameRow}>
                  <Text style={[styles.hostName, { color: colors.text.primary }]}>
                    {event.host.displayName}
                  </Text>
                  {event.host.verified && (
                    <Ionicons name="checkmark-circle" size={16} color={colors.primary} />
                  )}
                </View>
              </View>
            </TouchableOpacity>
          </View>

          {/* Stats Row */}
          <View style={[styles.statsRow, { backgroundColor: colors.background.secondary, borderColor: colors.border.default }]}>
            <View style={styles.statItem}>
              <Ionicons name="people" size={20} color={colors.primary} />
              <Text style={[styles.statValue, { color: colors.text.primary }]}>
                {event.participantCount}/{event.capacity}
              </Text>
              <Text style={[styles.statLabel, { color: colors.text.muted }]}>Attending</Text>
            </View>

            <View style={[styles.statDivider, { backgroundColor: colors.border.default }]} />

            <View style={styles.statItem}>
              <Ionicons name="eye" size={20} color={colors.primary} />
              <Text style={[styles.statValue, { color: colors.text.primary }]}>
                {event.views || 0}
              </Text>
              <Text style={[styles.statLabel, { color: colors.text.muted }]}>Views</Text>
            </View>

            <View style={[styles.statDivider, { backgroundColor: colors.border.default }]} />

            <View style={styles.statItem}>
              <View style={[styles.levelBadge, { backgroundColor: `${levelInfo.color}20` }]}>
                <Text style={[styles.levelText, { color: levelInfo.color }]}>
                  {levelInfo.label}
                </Text>
              </View>
            </View>
          </View>

          {/* Date & Time */}
          <View style={[styles.infoSection, { backgroundColor: colors.background.secondary, borderColor: colors.border.default }]}>
            <View style={styles.infoRow}>
              <View style={[styles.iconCircle, { backgroundColor: `${colors.primary}20` }]}>
                <Ionicons name="calendar-outline" size={20} color={colors.primary} />
              </View>
              <View style={styles.infoText}>
                <Text style={[styles.infoLabel, { color: colors.text.muted }]}>Date</Text>
                <Text style={[styles.infoValue, { color: colors.text.primary }]}>
                  {formatDate(event.startsAt)}
                </Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <View style={[styles.iconCircle, { backgroundColor: `${colors.primary}20` }]}>
                <Ionicons name="time-outline" size={20} color={colors.primary} />
              </View>
              <View style={styles.infoText}>
                <Text style={[styles.infoLabel, { color: colors.text.muted }]}>Time</Text>
                <Text style={[styles.infoValue, { color: colors.text.primary }]}>
                  {formatTime(event.startsAt)} - {formatTime(event.endsAt)}
                </Text>
              </View>
            </View>

            <TouchableOpacity style={styles.infoRow} onPress={handleLocationPress}>
              <View style={[styles.iconCircle, { backgroundColor: `${colors.primary}20` }]}>
                <Ionicons
                  name={event.location.isOnline ? 'videocam-outline' : 'location-outline'}
                  size={20}
                  color={colors.primary}
                />
              </View>
              <View style={styles.infoText}>
                <Text style={[styles.infoLabel, { color: colors.text.muted }]}>Location</Text>
                <Text style={[styles.infoValue, { color: colors.text.primary }]}>
                  {event.location.isOnline
                    ? 'Online Event'
                    : event.location.venue || event.location.address || 'Location TBD'}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.text.muted} />
            </TouchableOpacity>

            <View style={styles.infoRow}>
              <View style={[styles.iconCircle, { backgroundColor: `${colors.primary}20` }]}>
                <Text style={{ fontSize: 20 }}>{getLanguageFlag(event.language)}</Text>
              </View>
              <View style={styles.infoText}>
                <Text style={[styles.infoLabel, { color: colors.text.muted }]}>Language</Text>
                <Text style={[styles.infoValue, { color: colors.text.primary }]}>
                  {event.language}
                </Text>
              </View>
            </View>
          </View>

          {/* Description */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>About This Event</Text>
            <Text style={[styles.description, { color: colors.text.secondary }]}>
              {event.description}
            </Text>
          </View>

          {/* Tags */}
          {event.tags && event.tags.length > 0 && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>Tags</Text>
              <View style={styles.tagsContainer}>
                {event.tags.map((tag) => (
                  <View key={tag.id} style={[styles.tag, { backgroundColor: colors.background.secondary, borderColor: colors.border.default }]}>
                    <Text style={[styles.tagText, { color: colors.text.primary }]}>#{tag.name}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Requirements */}
          {event.requirements && event.requirements.length > 0 && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>Requirements</Text>
              {event.requirements.map((req, index) => (
                <View key={index} style={styles.requirementRow}>
                  <Ionicons name="checkmark-circle" size={20} color={colors.primary} />
                  <Text style={[styles.requirementText, { color: colors.text.secondary }]}>
                    {req}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {/* Participants */}
          {event.participants && event.participants.length > 0 && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>
                Participants ({event.participantCount})
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {event.participants.map((participant) => (
                  <TouchableOpacity
                    key={participant.id}
                    style={styles.participantItem}
                    onPress={() => handleParticipantPress(participant.userId)}
                  >
                    <Image
                      source={{
                        uri: participant.user?.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
                      }}
                      style={[styles.participantAvatar, { borderColor: colors.border.default }]}
                    />
                    <Text
                      style={[styles.participantName, { color: colors.text.primary }]}
                      numberOfLines={1}
                    >
                      {participant.user?.display_name || 'User'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          {/* Capacity Warning */}
          {spotsRemaining > 0 && spotsRemaining <= 5 && !event.isFull && (
            <View style={[styles.warningBox, { backgroundColor: '#FEF3C7', borderColor: '#F59E0B' }]}>
              <Ionicons name="alert-circle" size={20} color="#F59E0B" />
              <Text style={[styles.warningText, { color: '#92400E' }]}>
                Only {spotsRemaining} spot{spotsRemaining !== 1 ? 's' : ''} remaining!
              </Text>
            </View>
          )}

          {/* Full Event Notice */}
          {event.isFull && !event.currentUserParticipating && (
            <View style={[styles.warningBox, { backgroundColor: '#FEE2E2', borderColor: '#EF4444' }]}>
              <Ionicons name="close-circle" size={20} color="#EF4444" />
              <Text style={[styles.warningText, { color: '#991B1B' }]}>
                This event is full. You can join the waitlist.
              </Text>
            </View>
          )}

          {/* Bottom Padding */}
          <View style={{ height: 100 }} />
        </View>
      </ScrollView>

      {/* Bottom Action Bar */}
      {!isHost && (
        <SafeAreaView edges={['bottom']} style={[styles.bottomBar, { backgroundColor: colors.background.secondary, borderColor: colors.border.default }]}>
          <View style={styles.bottomBarContent}>
            <View style={styles.priceSection}>
              {event.isFree ? (
                <Text style={[styles.priceText, { color: colors.primary }]}>Free</Text>
              ) : (
                <>
                  <Text style={[styles.priceAmount, { color: colors.text.primary }]}>
                    {event.currency} {event.price}
                  </Text>
                  <Text style={[styles.priceLabel, { color: colors.text.muted }]}>per person</Text>
                </>
              )}
            </View>

            <TouchableOpacity
              style={[
                styles.rsvpButton,
                {
                  backgroundColor: event.currentUserStatus === 'joined' ? colors.semantic?.error || '#EF4444' : colors.primary,
                },
                rsvpMutation.isPending && styles.rsvpButtonDisabled,
              ]}
              onPress={handleRSVP}
              disabled={rsvpMutation.isPending}
            >
              {rsvpMutation.isPending ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <Ionicons
                    name={event.currentUserStatus === 'joined' ? 'close' : event.isFull ? 'time' : 'checkmark'}
                    size={20}
                    color="#FFFFFF"
                  />
                  <Text style={styles.rsvpButtonText}>
                    {event.currentUserStatus === 'joined'
                      ? 'Leave Event'
                      : event.isFull
                      ? 'Join Waitlist'
                      : 'Join Event'}
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      )}
    </View>
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
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  errorText: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  errorSubtext: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 12,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  imageContainer: {
    height: IMAGE_HEIGHT,
    position: 'relative',
  },
  coverImage: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageLoader: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginLeft: -20,
    marginTop: -20,
  },
  imageGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 100,
  },
  headerActions: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  headerRightActions: {
    flexDirection: 'row',
    gap: 8,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageBadges: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    flexDirection: 'row',
    gap: 8,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  content: {
    padding: 20,
  },
  titleSection: {
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 16,
    lineHeight: 36,
  },
  hostInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  hostAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
  },
  hostDetails: {
    flex: 1,
  },
  hostLabel: {
    fontSize: 12,
    marginBottom: 2,
  },
  hostNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  hostName: {
    fontSize: 16,
    fontWeight: '600',
  },
  statsRow: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 20,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 12,
  },
  statDivider: {
    width: 1,
    marginVertical: 8,
  },
  levelBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  levelText: {
    fontSize: 12,
    fontWeight: '600',
  },
  infoSection: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 20,
    gap: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoText: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 15,
    fontWeight: '600',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  description: {
    fontSize: 15,
    lineHeight: 24,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '500',
  },
  requirementRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 8,
  },
  requirementText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  participantItem: {
    alignItems: 'center',
    marginRight: 16,
    width: 70,
  },
  participantAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    marginBottom: 6,
  },
  participantName: {
    fontSize: 12,
    textAlign: 'center',
  },
  warningBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 20,
  },
  warningText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
  },
  bottomBar: {
    borderTopWidth: 1,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  bottomBarContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  priceSection: {
    flex: 1,
  },
  priceText: {
    fontSize: 24,
    fontWeight: '700',
  },
  priceAmount: {
    fontSize: 24,
    fontWeight: '700',
  },
  priceLabel: {
    fontSize: 12,
  },
  rsvpButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
  },
  rsvpButtonDisabled: {
    opacity: 0.6,
  },
  rsvpButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

