/**
 * Radar Pulse Component
 * Animated pulsing circle with rotating beam around user location marker
 * Based on reference web implementation
 */

import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

// ============================================================================
// TYPES
// ============================================================================

export interface RadarPulseProps {
  /**
   * Size of the pulse circle (default: 128)
   */
  size?: number;
  /**
   * Color of the pulse (default: primary green)
   */
  color?: string;
  /**
   * Number of pulse rings (default: 3)
   */
  rings?: number;
  /**
   * Show rotating radar beam (default: true)
   */
  showBeam?: boolean;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function RadarPulse({
  size = 128,
  color = '#1DB954',
  rings = 3,
  showBeam = true,
}: RadarPulseProps) {
  const pulseAnims = useRef<Animated.Value[]>(
    Array.from({ length: rings }, () => new Animated.Value(0))
  ).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Create staggered pulse animations for each ring (matching web version)
    const animations = pulseAnims.map((anim, index) => {
      return Animated.loop(
        Animated.sequence([
          Animated.delay(index * 600), // Stagger: 0ms, 600ms, 1200ms
          Animated.timing(anim, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          }),
        ])
      );
    });

    // Rotating radar beam animation (3 seconds per rotation)
    const rotateAnimation = Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 3000,
        useNativeDriver: true,
      })
    );

    // Start all animations
    animations.forEach((anim) => anim.start());
    if (showBeam) {
      rotateAnimation.start();
    }

    return () => {
      animations.forEach((anim) => anim.stop());
      rotateAnimation.stop();
    };
  }, [showBeam]);

  // Calculate rotation angle
  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={[styles.container, { width: size * 2.5, height: size * 2.5 }]}>
      {/* Expanding pulse rings */}
      {pulseAnims.map((anim, index) => {
        const scale = anim.interpolate({
          inputRange: [0, 1],
          outputRange: [1, 2.5], // Match web version: scale from 1 to 2.5
        });

        const opacity = anim.interpolate({
          inputRange: [0, 1],
          outputRange: [0.6, 0], // Match web version: opacity from 0.6 to 0
        });

        return (
          <Animated.View
            key={`ring-${index}`}
            style={[
              styles.pulseRing,
              {
                width: size,
                height: size,
                borderRadius: size / 2,
                borderColor: color,
                borderWidth: 2,
                transform: [{ scale }],
                opacity,
              },
            ]}
          />
        );
      })}

      {/* Rotating radar beam */}
      {showBeam && (
        <Animated.View
          style={[
            styles.beamContainer,
            {
              width: size * 1.25,
              height: size * 1.25,
              transform: [{ rotate }],
            },
          ]}
        >
          <View style={styles.beamWrapper}>
            <LinearGradient
              colors={[
                'transparent',
                `${color}40`, // 25% opacity
                `${color}4D`, // 30% opacity
                'transparent',
              ]}
              start={{ x: 0.5, y: 0 }}
              end={{ x: 0.5, y: 1 }}
              style={[
                styles.beamGradient,
                {
                  width: size * 0.3,
                  height: size * 1.25,
                },
              ]}
            />
          </View>
        </Animated.View>
      )}
    </View>
  );
}

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pulseRing: {
    position: 'absolute',
  },
  beamContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  beamWrapper: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  beamGradient: {
    position: 'absolute',
    borderRadius: 2,
  },
});

