/**
 * Event Marker Card Component
 * Bottom card showing event details when event marker is selected
 */

import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/lib/theme/ThemeProvider';
import type { Event } from '@/types/events';

export interface EventMarkerCardProps {
  /**
   * Event data
   */
  event: Event;
  /**
   * Callback when card is pressed
   */
  onPress?: () => void;
  /**
   * Callback when favorite is toggled
   */
  onToggleFavorite?: (eventId: string, isFavorite: boolean) => void;
  /**
   * Is event favorited
   */
  isFavorite?: boolean;
}

export function EventMarkerCard({
  event,
  onPress,
  onToggleFavorite,
  isFavorite = false,
}: EventMarkerCardProps) {
  const { colors } = useTheme();

  // Format date and time
  const formatDateTime = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    const dateStr = start.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
    
    const startTime = start.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false
    });
    
    const endTime = end.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false
    });
    
    return `${dateStr} • ${startTime} - ${endTime}`;
  };

  return (
    <TouchableOpacity
      style={[
        styles.container,
        {
          backgroundColor: colors.background.primary,
          shadowColor: colors.mode === 'dark' ? '#000' : '#04060F',
        },
      ]}
      onPress={onPress}
      activeOpacity={0.9}
    >
      <View style={styles.content}>
        {/* Event Image */}
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: event.imageUrl }}
            style={styles.image}
            resizeMode="cover"
          />
        </View>

        {/* Event Info */}
        <View style={styles.infoContainer}>
          <Text
            style={[
              styles.title,
              { color: colors.text.primary },
            ]}
            numberOfLines={1}
          >
            {event.title}
          </Text>
          
          <Text
            style={[
              styles.dateTime,
              { color: '#584CF4' },
            ]}
            numberOfLines={1}
          >
            {formatDateTime(event.startDate, event.endDate)}
          </Text>
          
          <View style={styles.locationRow}>
            <Ionicons name="location" size={16} color="#584CF4" />
            <Text
              style={[
                styles.location,
                { color: colors.text.muted },
              ]}
              numberOfLines={1}
            >
              {event.locationName}
            </Text>
            
            {/* Favorite Button */}
            <TouchableOpacity
              style={styles.favoriteButton}
              onPress={(e) => {
                e.stopPropagation();
                onToggleFavorite?.(event.id, !isFavorite);
              }}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons
                name={isFavorite ? 'heart' : 'heart-outline'}
                size={24}
                color={isFavorite ? '#FF4D67' : colors.text.muted}
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 28,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 60,
    elevation: 4,
    overflow: 'hidden',
  },
  content: {
    flexDirection: 'row',
    padding: 14,
    gap: 16,
  },
  imageContainer: {
    width: 120,
    height: 120,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#E0E0E0',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  infoContainer: {
    flex: 1,
    justifyContent: 'center',
    gap: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    lineHeight: 24,
    letterSpacing: 0,
  },
  dateTime: {
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 19.6,
    letterSpacing: 0.2,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  location: {
    flex: 1,
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 19.6,
    letterSpacing: 0.2,
  },
  favoriteButton: {
    padding: 4,
  },
});

