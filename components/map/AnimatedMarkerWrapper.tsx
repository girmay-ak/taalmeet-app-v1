/**
 * Animated Marker Wrapper
 * 
 * Provides visual feedback for marker selection:
 * - Selected: Slight scale up (1.05x) + green glow ring
 * - Dimmed: Reduced opacity (0.6) when another marker is selected
 * - Normal: Full opacity, no glow, normal scale
 * 
 * IMPORTANT: Selection does NOT move map or center user
 */

import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useTheme } from '@/lib/theme/ThemeProvider';

export interface AnimatedMarkerWrapperProps {
  /**
   * Is this marker selected?
   */
  isSelected: boolean;
  /**
   * Is this marker dimmed (another marker is selected)?
   */
  isDimmed: boolean;
  /**
   * Children (marker content)
   */
  children: React.ReactNode;
}

export function AnimatedMarkerWrapper({
  isSelected,
  isDimmed,
  children,
}: AnimatedMarkerWrapperProps) {
  const { colors } = useTheme();
  
  // Animation values
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);
  const glowOpacity = useSharedValue(0);

  // Update animations when selection state changes
  useEffect(() => {
    if (isSelected) {
      // Scale up slightly
      scale.value = withSpring(1.08, {
        damping: 15,
        stiffness: 200,
      });
      // Show prominent glow
      glowOpacity.value = withTiming(0.85, { duration: 200 });
      // Full opacity
      opacity.value = withTiming(1, { duration: 200 });
    } else if (isDimmed) {
      // Slightly smaller
      scale.value = withSpring(0.95, {
        damping: 15,
        stiffness: 200,
      });
      // More dimmed for better contrast
      opacity.value = withTiming(0.5, { duration: 200 });
      // No glow
      glowOpacity.value = withTiming(0, { duration: 200 });
    } else {
      // Reset to normal
      scale.value = withSpring(1, {
        damping: 15,
        stiffness: 200,
      });
      opacity.value = withTiming(1, { duration: 200 });
      glowOpacity.value = withTiming(0, { duration: 200 });
    }
  }, [isSelected, isDimmed]);

  // Animated styles
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  return (
    <View style={styles.container}>
      {/* Glow ring (behind marker) */}
      {isSelected && (
        <Animated.View
          style={[
            styles.glowRing,
            {
              backgroundColor: colors.primary || '#07BD74',
              borderColor: colors.primary || '#07BD74',
            },
            glowStyle,
          ]}
        />
      )}

      {/* Marker */}
      <Animated.View style={animatedStyle}>{children}</Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  glowRing: {
    position: 'absolute',
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 4,
    shadowColor: '#07BD74',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 16,
    elevation: 10,
  },
});

