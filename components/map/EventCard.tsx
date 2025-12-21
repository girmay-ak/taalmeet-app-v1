/**
 * Event Card Component
 * Swipeable card displaying event details (Figma design)
 */

import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

// ============================================================================
// TYPES
// ============================================================================

export interface EventCardData {
  id: string;
  title: string;
  imageUrl: string;
  date: string;
  time: string;
  location: string;
  isFavorite?: boolean;
}

export interface EventCardProps {
  event: EventCardData;
  onPress?: () => void;
  onFavoriteToggle?: () => void;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
}

// ============================================================================
// COMPONENT
// ============================================================================

const SCREEN_WIDTH = Dimensions.get('window').width;
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.3;

export function EventCard({
  event,
  onPress,
  onFavoriteToggle,
  onSwipeLeft,
  onSwipeRight,
}: EventCardProps) {
  const translateX = useSharedValue(0);
  const opacity = useSharedValue(1);

  // Pan gesture for swiping
  const panGesture = Gesture.Pan()
    .onUpdate((e) => {
      translateX.value = e.translationX;
      // Fade out as user swipes
      opacity.value = 1 - Math.abs(e.translationX) / SCREEN_WIDTH;
    })
    .onEnd((e) => {
      const shouldSwipeLeft = e.translationX < -SWIPE_THRESHOLD;
      const shouldSwipeRight = e.translationX > SWIPE_THRESHOLD;

      if (shouldSwipeLeft) {
        // Swipe left - dismiss
        translateX.value = withSpring(-SCREEN_WIDTH, {}, () => {
          onSwipeLeft?.();
        });
        opacity.value = withSpring(0);
      } else if (shouldSwipeRight) {
        // Swipe right - dismiss
        translateX.value = withSpring(SCREEN_WIDTH, {}, () => {
          onSwipeRight?.();
        });
        opacity.value = withSpring(0);
      } else {
        // Return to center
        translateX.value = withSpring(0);
        opacity.value = withSpring(1);
      }
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
    opacity: opacity.value,
  }));

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View style={[styles.wrapper, animatedStyle]}>
        <TouchableOpacity
          style={styles.container}
          onPress={onPress}
          activeOpacity={0.95}
        >
          {/* Event Image */}
          <View style={styles.imageContainer}>
            <Image
              source={{ uri: event.imageUrl }}
              style={styles.eventImage}
              resizeMode="cover"
            />
          </View>

          {/* Event Content */}
          <View style={styles.contentContainer}>
            <View style={styles.textContainer}>
              {/* Title */}
              <Text style={styles.title} numberOfLines={1}>
                {event.title}
              </Text>

              {/* Date & Time */}
              <Text style={styles.dateTime}>
                {event.date} • {event.time}
              </Text>

              {/* Location */}
              <View style={styles.locationRow}>
                <View style={styles.locationLeft}>
                  <Ionicons name="location" size={16} color="#584CF4" />
                  <Text style={styles.locationText} numberOfLines={1}>
                    {event.location}
                  </Text>
                </View>

                {/* Favorite Button */}
                <TouchableOpacity
                  onPress={onFavoriteToggle}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={event.isFavorite ? 'heart' : 'heart-outline'}
                    size={24}
                    color={event.isFavorite ? '#FF4D67' : '#9E9E9E'}
                  />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>
    </GestureDetector>
  );
}

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
  },
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 14,
    paddingRight: 18,
    paddingVertical: 14,
    shadowColor: '#04060F',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 60,
    elevation: 4,
    marginHorizontal: 24,
    marginBottom: 16,
  },
  imageContainer: {
    width: 120,
    height: 120,
    borderRadius: 20,
    overflow: 'hidden',
    marginRight: 16,
  },
  eventImage: {
    width: '100%',
    height: '100%',
  },
  contentContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
    gap: 10,
    justifyContent: 'center',
  },
  title: {
    fontFamily: 'Urbanist-Bold',
    fontSize: 20,
    fontWeight: '700',
    color: '#212121',
    lineHeight: 24,
  },
  dateTime: {
    fontFamily: 'Urbanist-SemiBold',
    fontSize: 14,
    fontWeight: '600',
    color: '#584CF4',
    lineHeight: 20,
    letterSpacing: 0.2,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  locationLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  locationText: {
    flex: 1,
    fontFamily: 'Urbanist-Regular',
    fontSize: 14,
    fontWeight: '400',
    color: '#616161',
    lineHeight: 20,
    letterSpacing: 0.2,
  },
});

