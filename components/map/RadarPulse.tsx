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
  const glowAnim = useRef(new Animated.Value(0.5)).current;
  const centerScaleAnim = useRef(new Animated.Value(1)).current;
  const rippleAnims = useRef<Animated.Value[]>(
    Array.from({ length: 2 }, () => new Animated.Value(0))
  ).current;

  useEffect(() => {
    // Create staggered pulse animations for each ring with smoother easing
    const animations = pulseAnims.map((anim, index) => {
      return Animated.loop(
        Animated.sequence([
          Animated.delay(index * 700), // Stagger: 0ms, 700ms, 1400ms
          Animated.timing(anim, {
            toValue: 1,
            duration: 2500,
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

    // Glowing center dot animation
    const glowAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true, // opacity can use native driver
        }),
        Animated.timing(glowAnim, {
          toValue: 0.5,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    );

    // Center scale pulse animation
    const centerScaleAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(centerScaleAnim, {
          toValue: 1.15,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(centerScaleAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    );

    // Ripple animations for extra depth
    const rippleAnimations = rippleAnims.map((anim, index) => {
      return Animated.loop(
        Animated.sequence([
          Animated.delay(index * 1000),
          Animated.timing(anim, {
            toValue: 1,
            duration: 3000,
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

    // Start all animations
    animations.forEach((anim) => anim.start());
    glowAnimation.start();
    centerScaleAnimation.start();
    rippleAnimations.forEach((anim) => anim.start());
    if (showBeam) {
      rotateAnimation.start();
    }

    return () => {
      animations.forEach((anim) => anim.stop());
      rotateAnimation.stop();
      glowAnimation.stop();
      centerScaleAnimation.stop();
      rippleAnimations.forEach((anim) => anim.stop());
    };
  }, [showBeam]);

  // Calculate rotation angle
  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  // Glow opacity interpolation
  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.3, 0.7, 0.3],
  });

  return (
    <View style={[styles.container, { width: size * 2.5, height: size * 2.5 }]}>
      {/* Expanding ripple effects (behind pulse rings) */}
      {rippleAnims.map((anim, index) => {
        const rippleScale = anim.interpolate({
          inputRange: [0, 1],
          outputRange: [1, 3],
        });

        const rippleOpacity = anim.interpolate({
          inputRange: [0, 0.5, 1],
          outputRange: [0, 0.2, 0],
        });

        return (
          <Animated.View
            key={`ripple-${index}`}
            style={[
              styles.ripple,
              {
                width: size,
                height: size,
                borderRadius: size / 2,
                backgroundColor: color,
                transform: [{ scale: rippleScale }],
                opacity: rippleOpacity,
              },
            ]}
          />
        );
      })}

      {/* Expanding pulse rings */}
      {pulseAnims.map((anim, index) => {
        const scale = anim.interpolate({
          inputRange: [0, 1],
          outputRange: [1, 2.8], // Increased scale for more dramatic effect
        });

        const opacity = anim.interpolate({
          inputRange: [0, 0.3, 1],
          outputRange: [0.8, 0.5, 0], // Smoother fade
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
                borderWidth: 3, // Thicker borders
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
                `${color}30`, // Gradient colors
                `${color}60`,
                `${color}40`,
                'transparent',
              ]}
              start={{ x: 0.5, y: 0 }}
              end={{ x: 0.5, y: 1 }}
              style={[
                styles.beamGradient,
                {
                  width: size * 0.35,
                  height: size * 1.25,
                },
              ]}
            />
          </View>
        </Animated.View>
      )}

      {/* Glowing center dot */}
      <Animated.View
        style={[
          styles.centerGlow,
          {
            width: size * 0.4,
            height: size * 0.4,
            borderRadius: (size * 0.4) / 2,
            backgroundColor: color,
            opacity: glowOpacity,
            transform: [{ scale: centerScaleAnim }],
          },
        ]}
      />

      {/* Center dot */}
      <View
        style={[
          styles.centerDot,
          {
            width: size * 0.3,
            height: size * 0.3,
            borderRadius: (size * 0.3) / 2,
            backgroundColor: color,
            borderColor: '#FFFFFF',
            borderWidth: 3,
          },
        ]}
      />
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
    shadowColor: '#1DB954',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 8,
  },
  ripple: {
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
  centerGlow: {
    position: 'absolute',
    shadowColor: '#1DB954',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 20,
    elevation: 10,
  },
  centerDot: {
    position: 'absolute',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
});

