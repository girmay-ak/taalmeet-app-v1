/**
 * Swipeable Card Stack Component
 * Manages a stack of swipeable partner cards with navigation
 */

import React, { useState, useCallback, useMemo } from 'react';
import { View, StyleSheet, Text, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/lib/theme/ThemeProvider';
import { SwipeablePartnerCard, type PartnerCardData } from './SwipeablePartnerCard';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const MAX_VISIBLE_CARDS = 2; // Show only 2 cards for lighter feel

interface SwipeableCardStackProps {
  partners: PartnerCardData[];
  onSwipeLeft?: (partnerId: string) => void; // Optional: for skip action
  onSwipeRight?: (partnerId: string) => void; // Optional: for interested action
  onViewProfile?: (partnerId: string) => void;
  onChat?: (partnerId: string) => void;
  onCardChange?: (partnerId: string | null) => void;
  activePartnerId?: string | null;
  emptyMessage?: string;
  emptySubmessage?: string;
}

export function SwipeableCardStack({
  partners,
  onSwipeLeft,
  onSwipeRight,
  onViewProfile,
  onChat,
  onCardChange,
  activePartnerId,
  emptyMessage = 'No Partners Nearby',
  emptySubmessage,
}: SwipeableCardStackProps) {
  const { colors } = useTheme();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [prevIndex, setPrevIndex] = useState(0);

  // Get visible cards (top 2)
  const visibleCards = useMemo(() => {
    return partners.slice(currentIndex, currentIndex + MAX_VISIBLE_CARDS);
  }, [partners, currentIndex]);

  // Sync with activePartnerId from outside (e.g., when marker is tapped)
  React.useEffect(() => {
    if (activePartnerId) {
      const index = partners.findIndex((p) => p.id === activePartnerId);
      if (index !== -1 && index !== currentIndex) {
        setCurrentIndex(index);
      }
    }
  }, [activePartnerId, partners, currentIndex]);

  // Notify parent when active card changes
  React.useEffect(() => {
    const activeCard = visibleCards[0];
    onCardChange?.(activeCard?.id || null);
  }, [visibleCards, onCardChange]);

  // Navigate to next partner (swipe left)
  const handleSwipeLeft = useCallback(() => {
    const nextIndex = Math.min(currentIndex + 1, partners.length - 1);
    if (nextIndex !== currentIndex) {
      setPrevIndex(currentIndex);
      setIsTransitioning(true);
      setCurrentIndex(nextIndex);
      const nextPartner = partners[nextIndex];
      onSwipeLeft?.(nextPartner.id);
      // Reset transition after animation
      setTimeout(() => setIsTransitioning(false), 300);
    }
  }, [currentIndex, partners, onSwipeLeft]);

  // Navigate to previous partner or mark as interested (swipe right)
  const handleSwipeRight = useCallback(() => {
    if (currentIndex > 0) {
      // Go to previous
      const prevIndex = currentIndex - 1;
      setPrevIndex(currentIndex);
      setIsTransitioning(true);
      setCurrentIndex(prevIndex);
      // Reset transition after animation
      setTimeout(() => setIsTransitioning(false), 300);
    } else {
      // Mark current as interested
      const currentPartner = partners[currentIndex];
      onSwipeRight?.(currentPartner.id);
    }
  }, [currentIndex, partners, onSwipeRight]);

  // Empty state
  if (partners.length === 0) {
    return (
      <View style={[styles.emptyContainer, { backgroundColor: `${colors.background.secondary}E6` }]}>
        <Ionicons name="people-outline" size={48} color={colors.text.muted} />
        <Text style={[styles.emptyTitle, { color: colors.text.primary }]}>{emptyMessage}</Text>
        {emptySubmessage && (
          <Text style={[styles.emptySubtitle, { color: colors.text.muted }]}>
            {emptySubmessage}
          </Text>
        )}
      </View>
    );
  }

  // All cards viewed
  if (currentIndex >= partners.length) {
    return (
      <View style={[styles.emptyContainer, { backgroundColor: `${colors.background.secondary}E6` }]}>
        <Ionicons name="checkmark-circle-outline" size={48} color={colors.primary} />
        <Text style={[styles.emptyTitle, { color: colors.text.primary }]}>
          You've seen everyone!
        </Text>
        <Text style={[styles.emptySubtitle, { color: colors.text.muted }]}>
          Check back later for new partners nearby.
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.stackContainer}>
        {visibleCards.map((partner, stackIndex) => {
          const isActive = stackIndex === 0;
          const actualIndex = currentIndex + stackIndex;
          // Card is entering if it's the new active card after a transition
          const isEntering = isTransitioning && isActive && actualIndex === currentIndex && currentIndex !== prevIndex;
          // Card is exiting if it was the previous active card
          const isExiting = false; // Exit handled by swipe animation

          return (
            <SwipeablePartnerCard
              key={`${partner.id}-${actualIndex}`}
              partner={partner}
              index={stackIndex}
              onSwipeLeft={handleSwipeLeft}
              onSwipeRight={handleSwipeRight}
              onViewProfile={onViewProfile}
              onChat={onChat}
              isActive={isActive}
              totalCards={Math.min(visibleCards.length, MAX_VISIBLE_CARDS)}
              isEntering={isEntering}
              isExiting={isExiting}
            />
          );
        })}
      </View>

      {/* Card counter */}
      {partners.length > 1 && (
        <View style={styles.counter}>
          <Text style={[styles.counterText, { color: colors.text.muted }]}>
            {currentIndex + 1} / {partners.length}
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'flex-end',
    pointerEvents: 'box-none',
    paddingBottom: 8,
  },
  stackContainer: {
    width: SCREEN_WIDTH * 0.88,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 140,
  },
  emptyContainer: {
    position: 'absolute',
    bottom: 0,
    left: '6%',
    right: '6%',
    minHeight: 120,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 12,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 13,
    marginTop: 6,
    textAlign: 'center',
  },
  counter: {
    marginTop: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  counterText: {
    fontSize: 11,
    fontWeight: '500',
  },
});
