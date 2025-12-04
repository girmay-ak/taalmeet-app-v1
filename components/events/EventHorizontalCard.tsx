/**
 * Event Horizontal Card Component
 * Compact event card for horizontal lists
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/lib/theme/ThemeProvider';
import type { EventbriteEvent } from '@/services/eventbriteService';
import { getLanguageFlag } from '@/utils/languageFlags';

interface EventHorizontalCardProps {
  event: EventbriteEvent;
  onPress?: () => void;
}

export function EventHorizontalCard({ event, onPress }: EventHorizontalCardProps) {
  const { colors } = useTheme();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.toLocaleString('default', { month: 'short' });
    return `${day} ${month}`;
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  };

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      Linking.openURL(event.url);
    }
  };

  // Extract language from event name/description (basic extraction)
  const extractLanguage = () => {
    const name = event.name.text.toLowerCase();
    const languages = ['spanish', 'french', 'german', 'italian', 'japanese', 'english', 'dutch', 'portuguese'];
    for (const lang of languages) {
      if (name.includes(lang)) {
        return lang.charAt(0).toUpperCase() + lang.slice(1);
      }
    }
    return null;
  };

  const eventLanguage = extractLanguage();

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.background.secondary, borderColor: colors.border.default }]}
      activeOpacity={0.8}
      onPress={handlePress}
    >
      {/* Event Image */}
      {event.logo?.url ? (
        <Image source={{ uri: event.logo.url }} style={styles.eventImage} resizeMode="cover" />
      ) : (
        <View style={[styles.eventImagePlaceholder, { backgroundColor: colors.background.primary }]}>
          <Ionicons name="calendar" size={32} color={colors.text.muted} />
        </View>
      )}

      {/* Content */}
      <View style={styles.content}>
        <Text style={[styles.title, { color: colors.text.primary }]} numberOfLines={2}>
          {event.name.text}
        </Text>
        
        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Ionicons name="calendar-outline" size={12} color={colors.text.muted} />
            <Text style={[styles.metaText, { color: colors.text.muted }]} numberOfLines={1}>
              {formatDate(event.start.local)}
            </Text>
          </View>
        </View>

        <View style={styles.metaRow}>
          {event.online_event ? (
            <View style={styles.metaItem}>
              <Ionicons name="videocam-outline" size={12} color={colors.primary} />
              <Text style={[styles.metaText, { color: colors.primary }]}>Online</Text>
            </View>
          ) : event.venue?.address?.city ? (
            <View style={styles.metaItem}>
              <Ionicons name="location-outline" size={12} color={colors.text.muted} />
              <Text style={[styles.metaText, { color: colors.text.muted }]} numberOfLines={1}>
                {event.venue.address.city}
              </Text>
            </View>
          ) : null}
        </View>

        {eventLanguage && (
          <View style={styles.languageRow}>
            <Text style={styles.languageFlag}>{getLanguageFlag(eventLanguage)}</Text>
            <Text style={[styles.languageText, { color: colors.text.muted }]}>{eventLanguage}</Text>
          </View>
        )}

        {event.is_free && (
          <View style={styles.freeBadge}>
            <Text style={styles.freeText}>FREE</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 160,
    borderRadius: 12,
    borderWidth: 1,
    marginRight: 12,
    overflow: 'hidden',
  },
  eventImage: {
    width: '100%',
    height: 100,
    backgroundColor: '#1A1A1A',
  },
  eventImagePlaceholder: {
    width: '100%',
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: 10,
  },
  title: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
    lineHeight: 18,
    minHeight: 36,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 4,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flex: 1,
  },
  metaText: {
    fontSize: 11,
    flex: 1,
  },
  languageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  languageFlag: {
    fontSize: 12,
  },
  languageText: {
    fontSize: 11,
    fontWeight: '500',
  },
  freeBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#10B981',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 6,
  },
  freeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '700',
  },
});

