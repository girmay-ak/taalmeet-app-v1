/**
 * Splash Screen - React Native Version
 * 
 * Initial loading screen with logo animation
 */

import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { FlowingWavesRN, TaalMeetLogo } from '@/components';
import { useTheme } from '@/lib/theme/ThemeProvider';
import { spacing, textStyles } from '@/lib/theme';

// Logo brand colors
const LOGO_COLORS = {
  darkBlue: '#1E3A5F',
  goldenYellow: '#FFB800',
  teal: '#4FD1C5',
  tealDark: '#2A9D8F',
};

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
    <LinearGradient
      colors={[LOGO_COLORS.darkBlue, LOGO_COLORS.tealDark, LOGO_COLORS.darkBlue]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}>
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
        {/* Glow Effect with logo colors */}
        <View
          style={[
            styles.glowRing,
            {
              backgroundColor: LOGO_COLORS.teal + '66', // 40% opacity
            },
          ]}
        />
        <View
          style={[
            styles.glowRing2,
            {
              backgroundColor: LOGO_COLORS.goldenYellow + '33', // 20% opacity
            },
          ]}
        />

        {/* Logo Card */}
        <View style={[styles.logoCard, { backgroundColor: 'transparent' }]}>
          <TaalMeetLogo size={100} variant="icon" />
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
        <Text style={[styles.appName, { color: '#FFFFFF' }]}>
          TaalMeet
        </Text>
        <Text style={[styles.tagline, { color: LOGO_COLORS.teal }]}>
          Meet. Speak. Connect.
        </Text>
      </Animated.View>

      {/* Version */}
      <Text style={[styles.version, { color: LOGO_COLORS.teal + 'CC' }]}>
        Version 1.0.0
      </Text>
    </LinearGradient>
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
  glowRing2: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 50,
    opacity: 0.3,
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

