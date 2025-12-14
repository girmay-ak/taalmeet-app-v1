/**
 * Swipeable Partner Card Component
 * Compact floating card with swipe navigation
 */

import React from 'react';
import { View, Text, Image, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';
// BlurView is optional - use fallback if not available
let BlurView: any = null;
try {
  BlurView = require('expo-blur').BlurView;
} catch {
  // Fallback will be used
}
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/lib/theme/ThemeProvider';
import { getLanguageFlag } from '@/utils/languageFlags';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.2;
const CARD_WIDTH = SCREEN_WIDTH * 0.88; // 88% of screen width

export interface PartnerCardData {
  id: string;
  name: string;
  age?: number;
  avatar: string;
  distance: number;
  matchScore: number;
  languages: Array<{
    language: string;
    role: 'teaching' | 'learning';
  }>;
  isOnline?: boolean;
  availableNow?: boolean;
}

interface SwipeablePartnerCardProps {
  partner: PartnerCardData;
  index: number;
  onSwipeLeft: () => void; // Navigate to next
  onSwipeRight: () => void; // Navigate to previous/interested
  onViewProfile?: (partnerId: string) => void;
  onChat?: (partnerId: string) => void;
  isActive: boolean;
  totalCards: number;
  isEntering?: boolean; // Card is entering from side
  isExiting?: boolean; // Card is exiting
}

export function SwipeablePartnerCard({
  partner,
  index,
  onSwipeLeft,
  onSwipeRight,
  onViewProfile,
  onChat,
  isActive,
  totalCards,
  isEntering = false,
  isExiting = false,
}: SwipeablePartnerCardProps) {
  const { colors } = useTheme();
  
  const translateX = useSharedValue(isEntering ? SCREEN_WIDTH : 0);
  const scale = useSharedValue(1);
  const opacity = useSharedValue(isExiting ? 1 : 1);

  // Animate entry from right when card becomes active
  React.useEffect(() => {
    if (isEntering && isActive) {
      translateX.value = SCREEN_WIDTH;
      opacity.value = 1;
      translateX.value = withSpring(0, {
        damping: 25,
        stiffness: 100,
      });
    }
  }, [isEntering, isActive]);

  // Animate exit
  React.useEffect(() => {
    if (isExiting) {
      opacity.value = withSpring(0, { damping: 20, stiffness: 90 });
    }
  }, [isExiting]);

  // Calculate card position in stack (minimal offset for depth)
  const cardOffset = (totalCards - index - 1) * 4;
  const cardScale = 1 - (totalCards - index - 1) * 0.03;
  const cardOpacity = index === 0 ? 1 : 0.85 - (totalCards - index - 1) * 0.1;

  const panGesture = Gesture.Pan()
    .enabled(isActive)
    .onUpdate((event) => {
      translateX.value = event.translationX;
      
      // Subtle scale feedback
      const dragDistance = Math.abs(event.translationX);
      scale.value = 1 - Math.min(dragDistance / 400, 0.05);
    })
    .onEnd((event) => {
      const absX = Math.abs(event.translationX);
      const velocityX = Math.abs(event.velocityX);

      // Swipe left (next partner) - animate off to left
      if (event.translationX < -SWIPE_THRESHOLD || (absX > 40 && velocityX > 400 && event.translationX < 0)) {
        translateX.value = withSpring(-SCREEN_WIDTH * 1.5, {
          damping: 20,
          stiffness: 90,
        }, () => {
          runOnJS(onSwipeLeft)();
        });
        return;
      }

      // Swipe right (previous/interested) - animate off to right
      if (event.translationX > SWIPE_THRESHOLD || (absX > 40 && velocityX > 400 && event.translationX > 0)) {
        translateX.value = withSpring(SCREEN_WIDTH * 1.5, {
          damping: 20,
          stiffness: 90,
        }, () => {
          runOnJS(onSwipeRight)();
        });
        return;
      }

      // Snap back to center
      translateX.value = withSpring(0, { damping: 20, stiffness: 90 });
      scale.value = withSpring(1, { damping: 20, stiffness: 90 });
    });

  const animatedCardStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: translateX.value },
        { translateY: cardOffset },
        { scale: scale.value * cardScale },
      ],
      opacity: opacity.value * cardOpacity,
    };
  });

  // Get teaching languages for display
  const teachingLanguages = partner.languages
    .filter((l) => l.role === 'teaching')
    .map((l) => getLanguageFlag(l.language))
    .join(' ');

  const learningLanguages = partner.languages
    .filter((l) => l.role === 'learning')
    .map((l) => l.language)
    .join(', ');

  // Format distance (approximate, privacy-safe)
  const formatDistance = (distance: number) => {
    if (distance < 1) return '<1 km';
    return `${Math.round(distance)} km`;
  };

  const CardWrapper = BlurView || View;
  const wrapperProps = BlurView 
    ? { intensity: 80, tint: 'dark' as const, style: styles.blurContainer }
    : { style: [styles.blurContainer, { backgroundColor: `${colors.background.primary}E8` }] };
  const contentBgColor = BlurView ? `${colors.background.primary}E0` : 'transparent';

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View
        style={[
          styles.card,
          animatedCardStyle,
        ]}
      >
        {/* Semi-transparent blurred background */}
        <CardWrapper {...wrapperProps}>
          <View style={[styles.cardContent, { backgroundColor: contentBgColor }]}>
            {/* Compact header row */}
            <View style={styles.headerRow}>
              {/* Avatar */}
              <View style={styles.avatarContainer}>
                <Image source={{ uri: partner.avatar }} style={styles.avatar} />
                {partner.isOnline && (
                  <View style={[styles.onlineIndicator, { backgroundColor: colors.primary }]} />
                )}
              </View>

              {/* Name and info */}
              <View style={styles.infoSection}>
                <View style={styles.nameRow}>
                  <Text style={[styles.name, { color: colors.text.primary }]} numberOfLines={1}>
                    {partner.name}
                    {partner.age && `, ${partner.age}`}
                  </Text>
                  {partner.availableNow && (
                    <View style={[styles.availableBadge, { backgroundColor: colors.semantic.success }]}>
                      <Text style={styles.availableText}>Available</Text>
                    </View>
                  )}
                </View>

                {/* Distance and match */}
                <View style={styles.metaRow}>
                  <View style={styles.metaItem}>
                    <Ionicons name="location" size={12} color={colors.text.muted} />
                    <Text style={[styles.metaText, { color: colors.text.muted }]}>
                      {formatDistance(partner.distance)}
                    </Text>
                  </View>
                  <View style={styles.metaItem}>
                    <Ionicons name="star" size={12} color={colors.primary} />
                    <Text style={[styles.metaText, { color: colors.text.primary }]}>
                      {partner.matchScore}%
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Languages - compact */}
            <View style={styles.languagesRow}>
              <View style={styles.languageItem}>
                <Text style={[styles.languageLabel, { color: colors.text.muted }]}>Teaching:</Text>
                <Text style={[styles.languageValue, { color: colors.text.primary }]} numberOfLines={1}>
                  {teachingLanguages || '—'}
                </Text>
              </View>
              {learningLanguages && (
                <View style={styles.languageItem}>
                  <Text style={[styles.languageLabel, { color: colors.text.muted }]}>Learning:</Text>
                  <Text style={[styles.languageValue, { color: colors.text.primary }]} numberOfLines={1}>
                    {learningLanguages}
                  </Text>
                </View>
              )}
            </View>

            {/* Action buttons */}
            <View style={styles.actionsRow}>
              <TouchableOpacity
                style={[styles.actionButton, styles.viewButton, { borderColor: colors.border.default }]}
                onPress={() => onViewProfile?.(partner.id)}
              >
                <Ionicons name="person-outline" size={16} color={colors.text.primary} />
                <Text style={[styles.actionButtonText, { color: colors.text.primary }]}>View</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, styles.chatButton, { backgroundColor: colors.primary }]}
                onPress={() => onChat?.(partner.id)}
              >
                <Ionicons name="chatbubble-outline" size={16} color="#FFFFFF" />
                <Text style={styles.actionButtonTextWhite}>Chat</Text>
              </TouchableOpacity>
            </View>
          </View>
        </CardWrapper>
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  card: {
    position: 'absolute',
    width: CARD_WIDTH,
    borderRadius: 16,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  blurContainer: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  cardContent: {
    padding: 12,
    borderRadius: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  infoSection: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 8,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  availableBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  availableText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '600',
  },
  metaRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 11,
  },
  languagesRow: {
    marginBottom: 10,
    gap: 4,
  },
  languageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  languageLabel: {
    fontSize: 10,
    minWidth: 60,
  },
  languageValue: {
    fontSize: 11,
    flex: 1,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  viewButton: {
    borderWidth: 1,
  },
  chatButton: {
    // backgroundColor set via style prop
  },
  actionButtonText: {
    fontSize: 13,
    fontWeight: '500',
  },
  actionButtonTextWhite: {
    fontSize: 13,
    fontWeight: '500',
    color: '#FFFFFF',
  },
});
