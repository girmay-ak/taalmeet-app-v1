/**
 * Splash Screen - React Native Version
 * Matches Eveno design: Clean white background, logo, loading animation
 */

import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { router } from 'expo-router';
import { TaalMeetLogo } from '@/components';
import { useTheme } from '@/lib/theme/ThemeProvider';

export default function SplashScreen() {
  const { colors } = useTheme();
  const dotAnimations = useRef(
    Array.from({ length: 8 }, () => ({
      scale: new Animated.Value(0.3),
      opacity: new Animated.Value(0.3),
    }))
  ).current;

  useEffect(() => {
    // Animate loading dots in sequence
    const animateDots = () => {
      const animations = dotAnimations.map((dot, index) => {
        return Animated.sequence([
          Animated.delay(index * 100),
          Animated.parallel([
            Animated.spring(dot.scale, {
              toValue: 1,
              tension: 50,
              friction: 7,
              useNativeDriver: true,
            }),
            Animated.timing(dot.opacity, {
              toValue: 1,
              duration: 300,
              useNativeDriver: true,
            }),
          ]),
          Animated.delay(200),
          Animated.parallel([
            Animated.spring(dot.scale, {
              toValue: 0.3,
              tension: 50,
              friction: 7,
              useNativeDriver: true,
            }),
            Animated.timing(dot.opacity, {
              toValue: 0.3,
              duration: 300,
              useNativeDriver: true,
            }),
          ]),
        ]);
      });

      // Loop animation
      Animated.loop(
        Animated.sequence(animations)
      ).start();
    };

    animateDots();

    // Auto-redirect after 2.5 seconds
    const timer = setTimeout(() => {
      router.replace('/');
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: '#FFFFFF' }]}>
      {/* Logo */}
      <View style={styles.logoContainer}>
        <View style={[styles.logoWrapper, { backgroundColor: colors.primary }]}>
          <TaalMeetLogo size={60} />
        </View>
        <Text style={[styles.logoText, { color: colors.primary }]}>TAALMEET</Text>
      </View>

      {/* Loading Animation - Circular dots */}
      <View style={styles.loadingContainer}>
        {dotAnimations.map((dot, index) => {
          const angle = (index * 360) / 8;
          const radius = 30;
          const x = Math.cos((angle * Math.PI) / 180) * radius;
          const y = Math.sin((angle * Math.PI) / 180) * radius;

          return (
            <Animated.View
              key={index}
              style={[
                styles.loadingDot,
                {
                  backgroundColor: colors.primary,
                  transform: [
                    { translateX: x },
                    { translateY: y },
                    { scale: dot.scale },
                  ],
                  opacity: dot.opacity,
                },
              ]}
            />
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 60,
  },
  logoWrapper: {
    width: 100,
    height: 100,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  logoText: {
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: 1,
  },
  loadingContainer: {
    width: 100,
    height: 100,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingDot: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});

