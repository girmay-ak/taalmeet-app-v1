/**
 * Radar Pulse Component
 * 
 * Animated pulsing circles with rotating beam around logged-in user avatar.
 * 
 * USAGE RULES:
 * - Only shown when isFindingLocation === true
 * - Stops immediately once nearby users are loaded
 * - Attached to fixed center overlay (not a map marker)
 * - Does NOT restart during person selection
 * 
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
    Array.from({ length: 3 }, () => new Animated.Value(0))
  ).current;
  const scanLineAnim = useRef(new Animated.Value(0)).current;

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

    // Rotating radar beam animation (3 seconds per rotation - smoother)
    const rotateAnimation = Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 3000,
        useNativeDriver: true,
        easing: (t) => t, // Linear for consistent rotation
      })
    );

    // Scanning line animation (synced with rotation)
    const scanLineAnimation = Animated.loop(
      Animated.timing(scanLineAnim, {
        toValue: 1,
        duration: 3000,
        useNativeDriver: true,
        easing: (t) => t, // Linear
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

    // Ripple animations for extra depth (more frequent)
    const rippleAnimations = rippleAnims.map((anim, index) => {
      return Animated.loop(
        Animated.sequence([
          Animated.delay(index * 800), // Faster ripples
          Animated.timing(anim, {
            toValue: 1,
            duration: 2400, // Faster animation
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
      scanLineAnimation.start();
    }

    return () => {
      animations.forEach((anim) => anim.stop());
      rotateAnimation.stop();
      scanLineAnimation.stop();
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

  // Scan line opacity (fades in/out as it rotates)
  const scanOpacity = scanLineAnim.interpolate({
    inputRange: [0, 0.1, 0.5, 0.9, 1],
    outputRange: [0, 1, 1, 1, 0],
  });

  return (
    <View style={[styles.container, { width: size * 3.2, height: size * 3.2 }]}>
      {/* Inner solid circle */}
      <View
        style={[
          styles.innerCircle,
          {
            width: size * 0.8,
            height: size * 0.8,
            borderRadius: size * 0.4,
            backgroundColor: `${color}40`,
          },
        ]}
      />

      {/* Middle semi-transparent circle */}
      <View
        style={[
          styles.middleCircle,
          {
            width: size * 1.6,
            height: size * 1.6,
            borderRadius: size * 0.8,
            backgroundColor: `${color}20`,
            borderWidth: 2,
            borderColor: `${color}30`,
          },
        ]}
      />

      {/* Outer thin ring */}
      <View
        style={[
          styles.outerRing,
          {
            width: size * 2.4,
            height: size * 2.4,
            borderRadius: size * 1.2,
            borderColor: `${color}40`,
            borderWidth: 2,
          },
        ]}
      />
      
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

      {/* Rotating radar beam - Enhanced scanning animation */}
      {showBeam && (
        <>
          {/* Main rotating beam with gradient sweep */}
          <Animated.View
            style={[
              styles.beamContainer,
              {
                width: size * 2.8,
                height: size * 2.8,
                transform: [{ rotate }],
              },
            ]}
          >
            {/* Solid scan line from center */}
            <Animated.View style={[styles.beamLine, { 
              width: 2, 
              height: size * 1.4,
              backgroundColor: color,
              opacity: scanOpacity,
              shadowColor: color,
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: 0.8,
              shadowRadius: 8,
            }]} />
            
            {/* Wide gradient sweep area (cone shape) */}
            <View style={styles.beamWrapper}>
              <LinearGradient
                colors={[
                  `${color}00`, // Transparent at edges
                  `${color}10`,
                  `${color}30`,
                  `${color}50`,
                  `${color}70`, // Brightest at scan line
                  `${color}50`,
                  `${color}30`,
                  `${color}10`,
                  `${color}00`, // Transparent at edges
                ]}
                start={{ x: 0, y: 0.5 }}
                end={{ x: 1, y: 0.5 }}
                style={[
                  styles.beamGradient,
                  {
                    width: size * 1.4,
                    height: size * 1.4,
                  },
                ]}
              />
            </View>

            {/* Secondary faint sweep for depth */}
            <View style={styles.beamWrapper}>
              <LinearGradient
                colors={[
                  `${color}00`,
                  `${color}05`,
                  `${color}15`,
                  `${color}25`,
                  `${color}15`,
                  `${color}05`,
                  `${color}00`,
                ]}
                start={{ x: 0, y: 0.5 }}
                end={{ x: 1, y: 0.5 }}
                style={[
                  styles.beamGradient,
                  {
                    width: size * 1.6,
                    height: size * 1.6,
                  },
                ]}
              />
            </View>
          </Animated.View>
        </>
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
  innerCircle: {
    position: 'absolute',
    opacity: 0.6,
  },
  middleCircle: {
    position: 'absolute',
    opacity: 0.4,
  },
  outerRing: {
    position: 'absolute',
    opacity: 0.3,
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
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  beamLine: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginLeft: -1,
    transformOrigin: 'top center',
    elevation: 5,
  },
  beamWrapper: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  beamGradient: {
    position: 'absolute',
    opacity: 0.6,
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

