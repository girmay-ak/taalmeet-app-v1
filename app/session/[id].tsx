/**
 * Session Detail Screen - React Native
 * View details of a language exchange session
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
  Modal,
  Dimensions,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useTheme } from '@/lib/theme/ThemeProvider';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

export default function SessionDetailScreen() {
  const { colors } = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [isVisible, setIsVisible] = useState(true);
  const slideAnim = React.useRef(new Animated.Value(height)).current;

  React.useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: 0,
      useNativeDriver: true,
      tension: 65,
      friction: 11,
    }).start();
  }, []);

  const handleClose = () => {
    Animated.timing(slideAnim, {
      toValue: height,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setIsVisible(false);
      router.back();
    });
  };

  // Mock session data - replace with actual data fetching
  const session = {
    id: id || '1',
    title: 'English Conversation Practice',
    description: 'Join us for a fun and relaxed English conversation session. All levels welcome!',
    languageFlag: '🇬🇧',
    level: 'intermediate',
    date: 'March 15, 2024',
    time: '7:00 PM',
    duration: 60,
    location: 'Central Park Cafe',
    isVirtual: false,
    venue: {
      name: 'Central Park Cafe',
      address: '123 Main Street',
      city: 'Amsterdam',
      photos: [],
      amenities: ['WiFi', 'Parking', 'Wheelchair Accessible'],
    },
    organizer: {
      name: 'Sarah Johnson',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100',
      type: 'user',
      verified: true,
      hostingCount: 12,
    },
    totalAttendees: 8,
    maxAttendees: 15,
    price: 0,
    currency: '€',
    tags: ['conversation', 'beginner-friendly', 'social'],
    isUserJoined: false,
    externalSource: null,
  };

  const spotsLeft = session.maxAttendees - session.totalAttendees;

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'beginner':
        return { text: '#10B981', bg: 'rgba(16,185,129,0.1)' };
      case 'intermediate':
        return { text: '#F59E0B', bg: 'rgba(245,158,11,0.1)' };
      case 'advanced':
        return { text: '#EF4444', bg: 'rgba(239,68,68,0.1)' };
      default:
        return { text: colors.primary, bg: `${colors.primary}20` };
    }
  };

  const levelColors = getLevelColor(session.level);

  if (!isVisible) return null;

  return (
    <Modal visible={isVisible} transparent animationType="none" onRequestClose={handleClose}>
      <View style={styles.overlay}>
        <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={handleClose} />
        <Animated.View
          style={[
            styles.container,
            {
              backgroundColor: colors.background.secondary,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <SafeAreaView edges={['bottom']} style={styles.safeArea}>
            {/* Header Image/Banner */}
            <View style={[styles.headerImage, { backgroundColor: `${colors.primary}20` }]}>
              {session.venue?.photos?.[0] ? (
                <Image source={{ uri: session.venue.photos[0] }} style={styles.headerImageContent} />
              ) : (
                <View style={styles.headerImagePlaceholder}>
                  <Text style={styles.headerImageFlag}>{session.languageFlag}</Text>
                </View>
              )}

              {/* Top Bar */}
              <View style={styles.topBar}>
                <TouchableOpacity
                  onPress={handleClose}
                  style={[styles.topBarButton, { backgroundColor: 'rgba(0,0,0,0.6)' }]}
                >
                  <Ionicons name="close" size={20} color="#FFFFFF" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.topBarButton, { backgroundColor: 'rgba(0,0,0,0.6)' }]}
                >
                  <Ionicons name="share-outline" size={20} color="#FFFFFF" />
                </TouchableOpacity>
              </View>

              {/* External Source Badge */}
              {session.externalSource === 'evento' && (
                <View style={[styles.externalBadge, { backgroundColor: `${colors.primary}E6` }]}>
                  <Ionicons name="sparkles" size={14} color="#FFFFFF" />
                  <Text style={styles.externalBadgeText}>Via Evento</Text>
                </View>
              )}
            </View>

            {/* Scrollable Content */}
            <ScrollView
              style={styles.scrollContent}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.scrollContentContainer}
            >
              {/* Title & Language */}
              <View style={styles.titleSection}>
                <View style={styles.titleHeader}>
                  <Text style={styles.languageFlag}>{session.languageFlag}</Text>
                  <View style={[styles.levelBadge, { backgroundColor: levelColors.bg }]}>
                    <Text style={[styles.levelText, { color: levelColors.text }]}>
                      {session.level.charAt(0).toUpperCase() + session.level.slice(1)}
                    </Text>
                  </View>
                  {session.isVirtual && (
                    <View style={[styles.virtualBadge, { backgroundColor: 'rgba(168,85,247,0.1)' }]}>
                      <Text style={[styles.virtualText, { color: '#A855F7' }]}>Virtual</Text>
                    </View>
                  )}
                </View>
                <Text style={[styles.title, { color: colors.text.primary }]}>{session.title}</Text>
                <Text style={[styles.description, { color: colors.text.muted }]}>
                  {session.description}
                </Text>
              </View>

              {/* Quick Info Cards */}
              <View style={styles.infoGrid}>
                <View style={[styles.infoCard, { backgroundColor: colors.background.primary, borderColor: colors.border.default }]}>
                  <View style={styles.infoCardHeader}>
                    <Ionicons name="calendar-outline" size={16} color={colors.primary} />
                    <Text style={[styles.infoLabel, { color: colors.text.muted }]}>Date</Text>
                  </View>
                  <Text style={[styles.infoValue, { color: colors.text.primary }]}>{session.date}</Text>
                  <Text style={[styles.infoSubtext, { color: colors.text.muted }]}>{session.time}</Text>
                </View>

                <View style={[styles.infoCard, { backgroundColor: colors.background.primary, borderColor: colors.border.default }]}>
                  <View style={styles.infoCardHeader}>
                    <Ionicons name="time-outline" size={16} color="#5FB3B3" />
                    <Text style={[styles.infoLabel, { color: colors.text.muted }]}>Duration</Text>
                  </View>
                  <Text style={[styles.infoValue, { color: colors.text.primary }]}>
                    {session.duration} min
                  </Text>
                  <Text style={[styles.infoSubtext, { color: colors.text.muted }]}>
                    {Math.floor(session.duration / 60)}h {session.duration % 60}m
                  </Text>
                </View>
              </View>

              {/* Location/Meeting Link */}
              <View style={[styles.locationCard, { backgroundColor: colors.background.primary, borderColor: colors.border.default }]}>
                <View style={styles.locationHeader}>
                  {session.isVirtual ? (
                    <View style={[styles.locationIcon, { backgroundColor: 'rgba(168,85,247,0.1)' }]}>
                      <Ionicons name="videocam-outline" size={20} color="#A855F7" />
                    </View>
                  ) : (
                    <View style={[styles.locationIcon, { backgroundColor: `${colors.primary}20` }]}>
                      <Ionicons name="location-outline" size={20} color={colors.primary} />
                    </View>
                  )}
                  <View style={styles.locationContent}>
                    <Text style={[styles.locationLabel, { color: colors.text.muted }]}>
                      {session.isVirtual ? 'Meeting Link' : 'Location'}
                    </Text>
                    <Text style={[styles.locationValue, { color: colors.text.primary }]}>
                      {session.location}
                    </Text>
                    {session.venue && (
                      <Text style={[styles.locationAddress, { color: colors.text.muted }]}>
                        {session.venue.address}, {session.venue.city}
                      </Text>
                    )}
                  </View>
                  {session.isVirtual && session.isUserJoined && (
                    <TouchableOpacity
                      style={[styles.joinButton, { backgroundColor: colors.primary }]}
                    >
                      <Text style={styles.joinButtonText}>Join</Text>
                    </TouchableOpacity>
                  )}
                </View>

                {/* Venue Amenities */}
                {session.venue?.amenities && session.venue.amenities.length > 0 && (
                  <View style={[styles.amenitiesSection, { borderTopColor: colors.border.default }]}>
                    <View style={styles.amenitiesList}>
                      {session.venue.amenities.map((amenity, index) => (
                        <View
                          key={index}
                          style={[styles.amenityChip, { backgroundColor: colors.background.secondary }]}
                        >
                          <Text style={[styles.amenityText, { color: colors.text.muted }]}>
                            {amenity}
                          </Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}
              </View>

              {/* Organizer Card */}
              <View style={[styles.organizerCard, { backgroundColor: colors.background.primary, borderColor: colors.border.default }]}>
                <Text style={[styles.organizerLabel, { color: colors.text.muted }]}>
                  {session.organizer.type === 'business' ? 'Organized by' : 'Hosted by'}
                </Text>
                <View style={styles.organizerContent}>
                  <Image
                    source={{ uri: session.organizer.avatar }}
                    style={styles.organizerAvatar}
                  />
                  <View style={styles.organizerInfo}>
                    <View style={styles.organizerNameRow}>
                      <Text style={[styles.organizerName, { color: colors.text.primary }]}>
                        {session.organizer.name}
                      </Text>
                      {session.organizer.verified && (
                        <Ionicons name="checkmark-circle" size={16} color={colors.primary} />
                      )}
                    </View>
                    {session.organizer.type === 'business' ? (
                      <View style={styles.organizerMeta}>
                        <View style={styles.organizerMetaItem}>
                          <Ionicons name="star" size={14} color="#F59E0B" />
                          <Text style={[styles.organizerMetaText, { color: colors.text.muted }]}>
                            {session.organizer.rating || '4.8'}
                          </Text>
                        </View>
                        <Text style={[styles.organizerMetaText, { color: colors.text.muted }]}>
                          {session.organizer.totalEvents || 0} events
                        </Text>
                      </View>
                    ) : (
                      <Text style={[styles.organizerMetaText, { color: colors.text.muted }]}>
                        {session.organizer.hostingCount} sessions hosted
                      </Text>
                    )}
                  </View>
                  <TouchableOpacity
                    style={[styles.viewButton, { backgroundColor: colors.background.secondary, borderColor: colors.border.default }]}
                  >
                    <Text style={[styles.viewButtonText, { color: colors.text.primary }]}>View</Text>
                  </TouchableOpacity>
                </View>
                {session.organizer.bio && (
                  <Text style={[styles.organizerBio, { color: colors.text.muted }]}>
                    {session.organizer.bio}
                  </Text>
                )}
              </View>

              {/* Attendees */}
              <View style={[styles.attendeesCard, { backgroundColor: colors.background.primary, borderColor: colors.border.default }]}>
                <View style={styles.attendeesHeader}>
                  <View style={styles.attendeesHeaderLeft}>
                    <Ionicons name="people-outline" size={16} color="#5FB3B3" />
                    <Text style={[styles.attendeesCount, { color: colors.text.primary }]}>
                      {session.totalAttendees} / {session.maxAttendees} Attendees
                    </Text>
                  </View>
                  {spotsLeft > 0 && (
                    <Text style={[styles.spotsLeft, { color: colors.primary }]}>
                      {spotsLeft} spots left
                    </Text>
                  )}
                </View>

                <View style={styles.attendeesAvatars}>
                  {Array.from({ length: Math.min(8, session.totalAttendees) }).map((_, index) => (
                    <View
                      key={index}
                      style={[
                        styles.attendeeAvatar,
                        { borderColor: colors.background.secondary, marginLeft: index > 0 ? -8 : 0 },
                      ]}
                    >
                      <View style={[styles.attendeeAvatarPlaceholder, { backgroundColor: colors.primary }]}>
                        <Text style={styles.attendeeAvatarText}>
                          {String.fromCharCode(65 + index)}
                        </Text>
                      </View>
                    </View>
                  ))}
                  {session.totalAttendees - 8 > 0 && (
                    <View
                      style={[
                        styles.attendeeAvatar,
                        styles.attendeeAvatarMore,
                        { borderColor: colors.background.secondary, backgroundColor: colors.primary },
                        { marginLeft: -8 },
                      ]}
                    >
                      <Text style={styles.attendeeAvatarMoreText}>
                        +{session.totalAttendees - 8}
                      </Text>
                    </View>
                  )}
                </View>

                <TouchableOpacity
                  style={[styles.viewAllButton, { backgroundColor: colors.background.secondary, borderColor: colors.border.default }]}
                >
                  <Ionicons name="people-outline" size={16} color={colors.text.primary} />
                  <Text style={[styles.viewAllButtonText, { color: colors.text.primary }]}>
                    View All Attendees
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Tags */}
              {session.tags && session.tags.length > 0 && (
                <View style={styles.tagsSection}>
                  <Text style={[styles.tagsLabel, { color: colors.text.muted }]}>Tags</Text>
                  <View style={styles.tagsList}>
                    {session.tags.map((tag, index) => (
                      <View
                        key={index}
                        style={[styles.tagChip, { backgroundColor: colors.background.primary, borderColor: colors.border.default }]}
                      >
                        <Text style={[styles.tagText, { color: colors.text.primary }]}>#{tag}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              {/* Price */}
              <View style={[styles.priceCard, { backgroundColor: `${colors.primary}20`, borderColor: `${colors.primary}40` }]}>
                <View style={styles.priceContent}>
                  <View>
                    <Text style={[styles.priceLabel, { color: colors.text.muted }]}>Price</Text>
                    <Text style={[styles.priceValue, { color: colors.text.primary }]}>
                      {session.price === 0
                        ? 'Free'
                        : `${session.currency} ${session.price}`}
                    </Text>
                  </View>
                  {session.price === 0 && (
                    <View style={[styles.freeBadge, { backgroundColor: colors.primary }]}>
                      <Text style={styles.freeBadgeText}>Free Event</Text>
                    </View>
                  )}
                </View>
              </View>

              {/* Action Buttons */}
              <View style={styles.actionButtons}>
                <TouchableOpacity
                  style={[styles.joinSessionButton, { backgroundColor: colors.primary }]}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={[colors.primary, '#1ED760']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.joinSessionGradient}
                  >
                    <Text style={styles.joinSessionButtonText}>
                      {session.isUserJoined ? 'Joined ✓' : 'Join Session'}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.messageButton, { backgroundColor: colors.background.primary, borderColor: colors.border.default }]}
                >
                  <Ionicons name="chatbubble-outline" size={20} color={colors.text.primary} />
                </TouchableOpacity>
              </View>
            </ScrollView>
          </SafeAreaView>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
  },
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    maxHeight: height * 0.9,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
  },
  safeArea: {
    flex: 1,
  },
  headerImage: {
    height: 192,
    position: 'relative',
    overflow: 'hidden',
  },
  headerImageContent: {
    width: '100%',
    height: '100%',
    opacity: 0.6,
  },
  headerImagePlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerImageFlag: {
    fontSize: 64,
  },
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
  },
  topBarButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  externalBadge: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  externalBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  scrollContent: {
    flex: 1,
  },
  scrollContentContainer: {
    padding: 24,
    gap: 24,
    paddingBottom: 100,
  },
  titleSection: {
    gap: 8,
  },
  titleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  languageFlag: {
    fontSize: 24,
  },
  levelBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  levelText: {
    fontSize: 12,
    fontWeight: '600',
  },
  virtualBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  virtualText: {
    fontSize: 12,
    fontWeight: '600',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
  },
  infoGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  infoCard: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  infoCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  infoLabel: {
    fontSize: 12,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  infoSubtext: {
    fontSize: 12,
  },
  locationCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  locationHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  locationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  locationContent: {
    flex: 1,
  },
  locationLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  locationValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  locationAddress: {
    fontSize: 12,
    marginTop: 4,
  },
  joinButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  joinButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  amenitiesSection: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  amenitiesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  amenityChip: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  amenityText: {
    fontSize: 12,
  },
  organizerCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  organizerLabel: {
    fontSize: 12,
    marginBottom: 12,
  },
  organizerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  organizerAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  organizerInfo: {
    flex: 1,
  },
  organizerNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  organizerName: {
    fontSize: 14,
    fontWeight: '600',
  },
  organizerMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  organizerMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  organizerMetaText: {
    fontSize: 12,
  },
  organizerBio: {
    fontSize: 12,
    lineHeight: 18,
    marginTop: 12,
  },
  viewButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  viewButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },
  attendeesCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  attendeesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  attendeesHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  attendeesCount: {
    fontSize: 14,
    fontWeight: '600',
  },
  spotsLeft: {
    fontSize: 12,
  },
  attendeesAvatars: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  attendeeAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    overflow: 'hidden',
  },
  attendeeAvatarPlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  attendeeAvatarText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  attendeeAvatarMore: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  attendeeAvatarMoreText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  viewAllButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },
  tagsSection: {
    gap: 8,
  },
  tagsLabel: {
    fontSize: 12,
    marginBottom: 8,
  },
  tagsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tagChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  tagText: {
    fontSize: 12,
  },
  priceCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  priceContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  priceValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  freeBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  freeBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  joinSessionButton: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  joinSessionGradient: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  joinSessionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  messageButton: {
    width: 56,
    height: 56,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

