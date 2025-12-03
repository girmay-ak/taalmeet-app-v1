/**
 * Splash Screen - React Native Version
 * 
 * Initial loading screen with logo animation
 */

import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { router } from 'expo-router';
import { FlowingWavesRN } from '@/components';
import { useTheme } from '@/lib/theme/ThemeProvider';
import { spacing, textStyles } from '@/lib/theme';

export default function SplashScreen() {
  const { colors } = useTheme();
  const scaleAnim = useRef(new Animated.Value(0.3)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const textOpacityAnim = useRef(new Animated.Value(0)).current;
  const textTranslateAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    // Logo animation
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();

    // Text animation
    Animated.parallel([
      Animated.timing(textOpacityAnim, {
        toValue: 1,
        duration: 500,
        delay: 300,
        useNativeDriver: true,
      }),
      Animated.timing(textTranslateAnim, {
        toValue: 0,
        duration: 500,
        delay: 300,
        useNativeDriver: true,
      }),
    ]).start();

    // Auto-redirect after 2.5 seconds
    const timer = setTimeout(() => {
      router.replace('/');
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: colors.background.primary }]}>
      {/* Animated Background */}
      <View style={styles.backgroundWaves}>
        <FlowingWavesRN />
      </View>

      {/* Logo Container */}
      <Animated.View
        style={[
          styles.logoContainer,
          {
            transform: [{ scale: scaleAnim }],
            opacity: opacityAnim,
          },
        ]}>
        {/* Glow Effect */}
        <View
          style={[
            styles.glowRing,
            {
              backgroundColor: colors.primary + '66', // 40% opacity
            },
          ]}
        />

        {/* Logo Card */}
        <View style={[styles.logoCard, { backgroundColor: colors.primary }]}>
          <View style={styles.logoPlaceholder}>
            <Text style={[styles.logoText, { color: '#FFFFFF' }]}>💬</Text>
          </View>
        </View>
      </Animated.View>

      {/* App Name */}
      <Animated.View
        style={[
          styles.textContainer,
          {
            opacity: textOpacityAnim,
            transform: [{ translateY: textTranslateAnim }],
          },
        ]}>
        <Text style={[styles.appName, { color: colors.text.primary }]}>
          TaalMeet
        </Text>
        <Text style={[styles.tagline, { color: colors.text.muted }]}>
          Meet. Speak. Connect.
        </Text>
      </Animated.View>

      {/* Version */}
      <Text style={[styles.version, { color: colors.text.muted }]}>
        Version 1.0.0
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backgroundWaves: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 48,
  },
  glowRing: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 40,
    opacity: 0.4,
  },
  logoCard: {
    width: 100,
    height: 100,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  logoPlaceholder: {
    width: 80,
    height: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    fontSize: 48,
  },
  textContainer: {
    alignItems: 'center',
  },
  appName: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  tagline: {
    fontSize: 16,
  },
  version: {
    fontSize: 12,
    position: 'absolute',
    bottom: 48,
  },
});

