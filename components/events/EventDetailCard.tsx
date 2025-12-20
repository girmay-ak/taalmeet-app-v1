/**
 * Event Detail Card Component
 * Enhanced event card for home/discovery screen
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/lib/theme/ThemeProvider';
import { Event, EVENT_CATEGORIES, EVENT_LEVELS } from '@/types/events';
import { getLanguageFlag } from '@/utils/languageFlags';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH - 32;

interface EventDetailCardProps {
  event: Event;
  onPress?: () => void;
  onFavoritePress?: () => void;
}

export function EventDetailCard({ event, onPress, onFavoritePress }: EventDetailCardProps) {
  const { colors } = useTheme();
  const category = EVENT_CATEGORIES[event.category];
  const levelInfo = EVENT_LEVELS[event.level];

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === now.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });
    }
  };

  // Format time
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const spotsRemaining = event.capacity - event.participantCount;
  const joinedPercentage = Math.round((event.participantCount / event.capacity) * 100);

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      router.push(`/event/${event.id}`);
    }
  };

  const handleFavorite = (e: any) => {
    e.stopPropagation();
    onFavoritePress?.();
  };

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.background.secondary, borderColor: colors.border.default }]}
      activeOpacity={0.8}
      onPress={handlePress}
    >
      {/* Cover Image or Gradient */}
      <View style={styles.imageContainer}>
        {event.coverImageUrl ? (
          <Image
            source={{ uri: event.coverImageUrl }}
            style={styles.coverImage}
            resizeMode="cover"
          />
        ) : (
          <LinearGradient
            colors={[category.color, `${category.color}99`]}
            style={styles.coverImage}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Ionicons name={category.icon as any} size={40} color="rgba(255,255,255,0.8)" />
          </LinearGradient>
        )}

        {/* Overlay Gradient */}
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.6)']}
          style={styles.imageOverlay}
        />

        {/* Top Badges */}
        <View style={styles.topBadges}>
          <View style={[styles.categoryBadge, { backgroundColor: category.color }]}>
            <Ionicons name={category.icon as any} size={12} color="#FFFFFF" />
            <Text style={styles.categoryText}>{category.label}</Text>
          </View>

          {!event.isFree && (
            <View style={[styles.priceBadge, { backgroundColor: '#10B981' }]}>
              <Text style={styles.priceText}>
                {event.currency} {event.price}
              </Text>
            </View>
          )}
        </View>

        {/* Date Badge */}
        <View style={styles.dateBadge}>
          <Text style={styles.dateMonth}>{formatDate(event.startsAt)}</Text>
        </View>

        {/* Favorite Button */}
        <TouchableOpacity
          style={styles.favoriteButton}
          onPress={handleFavorite}
        >
          <Ionicons
            name={event.isFavorited ? 'heart' : 'heart-outline'}
            size={20}
            color={event.isFavorited ? '#FF0000' : '#FFFFFF'}
          />
        </TouchableOpacity>
      </View>

      {/* Card Content */}
      <View style={styles.content}>
        {/* Title */}
        <Text style={[styles.title, { color: colors.text.primary }]} numberOfLines={2}>
          {event.title}
        </Text>

        {/* Meta Info */}
        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Ionicons name="time-outline" size={14} color={colors.text.muted} />
            <Text style={[styles.metaText, { color: colors.text.muted }]}>
              {formatTime(event.startsAt)}
            </Text>
          </View>

          <View style={styles.metaItem}>
            <Ionicons
              name={event.location.isOnline ? 'videocam-outline' : 'location-outline'}
              size={14}
              color={colors.text.muted}
            />
            <Text style={[styles.metaText, { color: colors.text.muted }]} numberOfLines={1}>
              {event.location.isOnline ? 'Online' : event.location.city || 'TBD'}
            </Text>
          </View>

          <View style={styles.metaItem}>
            <Text style={{ fontSize: 14 }}>{getLanguageFlag(event.language)}</Text>
            <Text style={[styles.metaText, { color: colors.text.muted }]}>
              {event.language}
            </Text>
          </View>
        </View>

        {/* Host */}
        <View style={styles.hostRow}>
          <Image
            source={{
              uri: event.host.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
            }}
            style={[styles.hostAvatar, { borderColor: colors.border.default }]}
          />
          <View style={styles.hostInfo}>
            <Text style={[styles.hostLabel, { color: colors.text.muted }]}>Hosted by</Text>
            <View style={styles.hostNameRow}>
              <Text style={[styles.hostName, { color: colors.text.primary }]} numberOfLines={1}>
                {event.host.displayName}
              </Text>
              {event.host.verified && (
                <Ionicons name="checkmark-circle" size={12} color={colors.primary} />
              )}
            </View>
          </View>

          {/* Level Badge */}
          <View style={[styles.levelBadge, { backgroundColor: `${levelInfo.color}20` }]}>
            <Text style={[styles.levelText, { color: levelInfo.color }]}>
              {levelInfo.label}
            </Text>
          </View>
        </View>

        {/* Participants & Capacity */}
        <View style={styles.footer}>
          {/* Participant Avatars */}
          <View style={styles.participantsRow}>
            {event.participants && event.participants.slice(0, 3).map((participant, index) => (
              <Image
                key={participant.id}
                source={{
                  uri: participant.user?.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
                }}
                style={[
                  styles.participantAvatar,
                  { borderColor: colors.background.secondary },
                  { marginLeft: index > 0 ? -12 : 0 },
                ]}
              />
            ))}
            {event.participantCount > 3 && (
              <View
                style={[
                  styles.participantAvatar,
                  styles.moreParticipants,
                  { backgroundColor: colors.primary, borderColor: colors.background.secondary, marginLeft: -12 },
                ]}
              >
                <Text style={styles.moreText}>+{event.participantCount - 3}</Text>
              </View>
            )}
          </View>

          {/* Capacity Info */}
          <View style={styles.capacityInfo}>
            <Text style={[styles.capacityText, { color: colors.text.muted }]}>
              {event.participantCount}/{event.capacity}
            </Text>
            {event.isFull ? (
              <View style={[styles.fullBadge, { backgroundColor: '#FEE2E2' }]}>
                <Text style={[styles.fullText, { color: '#DC2626' }]}>Full</Text>
              </View>
            ) : spotsRemaining <= 5 ? (
              <View style={[styles.almostFullBadge, { backgroundColor: '#FEF3C7' }]}>
                <Text style={[styles.almostFullText, { color: '#D97706' }]}>
                  {spotsRemaining} left
                </Text>
              </View>
            ) : null}
          </View>
        </View>

        {/* Progress Bar */}
        <View style={[styles.progressContainer, { backgroundColor: colors.border.default }]}>
          <View
            style={[
              styles.progressBar,
              {
                backgroundColor: event.isFull ? '#DC2626' : colors.primary,
                width: `${Math.min(joinedPercentage, 100)}%`,
              },
            ]}
          />
        </View>

        {/* Status Indicators */}
        {event.currentUserParticipating && (
          <View style={[styles.statusBadge, { backgroundColor: `${colors.primary}20` }]}>
            <Ionicons name="checkmark-circle" size={14} color={colors.primary} />
            <Text style={[styles.statusText, { color: colors.primary }]}>
              You're attending
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    marginBottom: 20,
    overflow: 'hidden',
    borderWidth: 1,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  imageContainer: {
    height: 180,
    position: 'relative',
  },
  coverImage: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
  },
  topBadges: {
    position: 'absolute',
    top: 12,
    left: 12,
    flexDirection: 'row',
    gap: 8,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
    gap: 4,
  },
  categoryText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
  },
  priceBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
  },
  priceText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  dateBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  dateMonth: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  favoriteButton: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
    lineHeight: 24,
  },
  metaRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flex: 1,
  },
  metaText: {
    fontSize: 12,
    flex: 1,
  },
  hostRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 10,
  },
  hostAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
  },
  hostInfo: {
    flex: 1,
  },
  hostLabel: {
    fontSize: 10,
    marginBottom: 2,
  },
  hostNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  hostName: {
    fontSize: 13,
    fontWeight: '600',
  },
  levelBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  levelText: {
    fontSize: 10,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  participantsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  participantAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
  },
  moreParticipants: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  moreText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  capacityInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  capacityText: {
    fontSize: 13,
    fontWeight: '600',
  },
  fullBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  fullText: {
    fontSize: 10,
    fontWeight: '700',
  },
  almostFullBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  almostFullText: {
    fontSize: 10,
    fontWeight: '700',
  },
  progressContainer: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressBar: {
    height: '100%',
    borderRadius: 2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
});

