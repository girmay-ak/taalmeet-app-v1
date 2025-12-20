/**
 * Event Card List Component
 * Scrollable list of swipeable event cards
 */

import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  ListRenderItem,
  Text,
} from 'react-native';
import { EventCard, EventCardData } from './EventCard';
import { useTheme } from '@/lib/theme/ThemeProvider';

// ============================================================================
// TYPES
// ============================================================================

export interface EventCardListProps {
  /**
   * Array of events to display
   */
  events: EventCardData[];
  /**
   * Callback when an event card is pressed
   */
  onEventPress?: (event: EventCardData) => void;
  /**
   * Callback when favorite is toggled
   */
  onFavoriteToggle?: (eventId: string) => void;
  /**
   * Show header with title
   */
  showHeader?: boolean;
  /**
   * Header title
   */
  headerTitle?: string;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function EventCardList({
  events: initialEvents,
  onEventPress,
  onFavoriteToggle,
  showHeader = true,
  headerTitle = 'Nearby Events',
}: EventCardListProps) {
  const { colors } = useTheme();
  const [events, setEvents] = useState(initialEvents);

  // Handle swipe left/right - remove from list
  const handleSwipe = (eventId: string) => {
    setEvents((prev) => prev.filter((e) => e.id !== eventId));
  };

  // Render event card
  const renderEventCard: ListRenderItem<EventCardData> = ({ item }) => (
    <EventCard
      event={item}
      onPress={() => onEventPress?.(item)}
      onFavoriteToggle={() => onFavoriteToggle?.(item.id)}
      onSwipeLeft={() => handleSwipe(item.id)}
      onSwipeRight={() => handleSwipe(item.id)}
    />
  );

  // Render header
  const renderHeader = () => {
    if (!showHeader) return null;

    return (
      <View style={styles.header}>
        <Text
          style={[
            styles.headerTitle,
            { color: colors.text.primary },
          ]}
        >
          {headerTitle}
        </Text>
        <Text
          style={[
            styles.headerSubtitle,
            { color: colors.text.secondary },
          ]}
        >
          Swipe left or right to dismiss
        </Text>
      </View>
    );
  };

  // Render empty state
  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text
        style={[
          styles.emptyText,
          { color: colors.text.secondary },
        ]}
      >
        No events found nearby
      </Text>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background.primary }]}>
      <FlatList
        data={events}
        renderItem={renderEventCard}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    paddingVertical: 16,
  },
  header: {
    paddingHorizontal: 24,
    paddingBottom: 16,
    gap: 4,
  },
  headerTitle: {
    fontFamily: 'Urbanist-Bold',
    fontSize: 24,
    fontWeight: '700',
    lineHeight: 29,
  },
  headerSubtitle: {
    fontFamily: 'Urbanist-Regular',
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    fontFamily: 'Urbanist-Regular',
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 22,
  },
});

