/**
 * Event Card Component
 * Displays Eventbrite event information
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/lib/theme/ThemeProvider';
import type { EventbriteEvent } from '@/services/eventbriteService';

interface EventCardProps {
  event: EventbriteEvent;
  onPress?: () => void;
}

export function EventCard({ event, onPress }: EventCardProps) {
  const { colors } = useTheme();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    };
    return date.toLocaleDateString('en-US', options);
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  };

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      // Open event URL in browser
      Linking.openURL(event.url);
    }
  };

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.background.secondary, borderColor: colors.border.default }]}
      activeOpacity={0.8}
      onPress={handlePress}
    >
      {/* Event Image */}
      {event.logo?.url && (
        <Image source={{ uri: event.logo.url }} style={styles.eventImage} resizeMode="cover" />
      )}

      {/* Content */}
      <View style={styles.content}>
        {/* Title */}
        <Text style={[styles.title, { color: colors.text.primary }]} numberOfLines={2}>
          {event.name.text}
        </Text>

        {/* Date & Time */}
        <View style={styles.dateRow}>
          <Ionicons name="calendar-outline" size={16} color={colors.text.muted} />
          <Text style={[styles.dateText, { color: colors.text.muted }]}>
            {formatDate(event.start.local)}
          </Text>
        </View>

        <View style={styles.dateRow}>
          <Ionicons name="time-outline" size={16} color={colors.text.muted} />
          <Text style={[styles.dateText, { color: colors.text.muted }]}>
            {formatTime(event.start.local)}
          </Text>
        </View>

        {/* Location */}
        {event.online_event ? (
          <View style={styles.dateRow}>
            <Ionicons name="videocam-outline" size={16} color={colors.primary} />
            <Text style={[styles.dateText, { color: colors.primary }]}>Online Event</Text>
          </View>
        ) : event.venue?.name ? (
          <View style={styles.dateRow}>
            <Ionicons name="location-outline" size={16} color={colors.text.muted} />
            <Text style={[styles.dateText, { color: colors.text.muted }]} numberOfLines={1}>
              {event.venue.name}
              {event.venue.address?.city && `, ${event.venue.address.city}`}
            </Text>
          </View>
        ) : null}

        {/* Price */}
        {event.is_free && (
          <View style={styles.freeBadge}>
            <Text style={styles.freeText}>FREE</Text>
          </View>
        )}

        {/* Action Button */}
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: colors.primary }]}
          onPress={handlePress}
        >
          <Text style={styles.actionText}>View Event</Text>
          <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 12,
    overflow: 'hidden',
  },
  eventImage: {
    width: '100%',
    height: 180,
    backgroundColor: '#1A1A1A',
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    lineHeight: 22,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  dateText: {
    fontSize: 13,
    flex: 1,
  },
  freeBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#10B981',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginTop: 8,
    marginBottom: 12,
  },
  freeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
    marginTop: 8,
  },
  actionText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});

