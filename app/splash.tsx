/**
 * Splash Screen - React Native Version
 * 
 * Initial loading screen with logo animation
 * Converted from ux-template/src/screens/SplashScreen.tsx
 * Design matches ux-template with enhanced animations and glow effects
 */

import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { FlowingWavesRN, TaalMeetLogo } from '@/components';

export default function SplashScreen() {
  const scaleAnim = useRef(new Animated.Value(0.3)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const textOpacityAnim = useRef(new Animated.Value(0)).current;
  const textTranslateAnim = useRef(new Animated.Value(20)).current;
  const versionOpacityAnim = useRef(new Animated.Value(0)).current;
  
  // Glow ring animations - pulsing effect matching ux-template
  const glowScaleAnim = useRef(new Animated.Value(1)).current;
  const glowOpacityAnim = useRef(new Animated.Value(0.4)).current;
  const shadowOpacityAnim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    // Logo animation - matching ux-template spring parameters (damping: 12, stiffness: 100)
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        damping: 12,
        stiffness: 100,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: true,
      }),
    ]).start();

    // Pulsing glow ring animation - 2 second cycle
    Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(glowScaleAnim, {
            toValue: 1.2,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(glowOpacityAnim, {
            toValue: 0.6,
            duration: 2000,
            useNativeDriver: true, // Changed to true - opacity supports native driver
          }),
          Animated.timing(shadowOpacityAnim, {
            toValue: 0.5,
            duration: 2000,
            useNativeDriver: false, // Must stay false - shadow properties don't support native driver
          }),
        ]),
        Animated.parallel([
          Animated.timing(glowScaleAnim, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(glowOpacityAnim, {
            toValue: 0.4,
            duration: 2000,
            useNativeDriver: true, // Changed to true - opacity supports native driver
          }),
          Animated.timing(shadowOpacityAnim, {
            toValue: 0.3,
            duration: 2000,
            useNativeDriver: false, // Must stay false - shadow properties don't support native driver
          }),
        ]),
      ])
    ).start();

    // Text animation - delay 300ms, duration 500ms
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

    // Version fade in - delay 1000ms
    Animated.timing(versionOpacityAnim, {
      toValue: 0.5,
      duration: 500,
      delay: 1000,
      useNativeDriver: true,
    }).start();

    // Auto-redirect after 2.5 seconds (matching ux-template)
    const timer = setTimeout(() => {
      router.replace('/(onboarding)/welcome');
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      {/* Flowing Wave Background - matches ux-template */}
      <View style={styles.backgroundWaves}>
        <FlowingWavesRN />
      </View>

      {/* Logo Container with glow ring */}
      <Animated.View
        style={[
          styles.logoContainer,
          {
            transform: [{ scale: scaleAnim }],
            opacity: opacityAnim,
          },
        ]}>
        {/* Outer Glow Ring - Animated pulsing gradient (matching ux-template blur effect) */}
        <Animated.View
          style={[
            styles.glowRing,
            {
              transform: [{ scale: glowScaleAnim }],
              opacity: glowOpacityAnim,
            },
          ]}
        >
          <LinearGradient
            colors={['#1DB954', '#5FB3B3', '#1ED760']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
        </Animated.View>

        {/* Logo Card - White background with pulsing shadow */}
        <Animated.View
          style={[
            styles.logoCard,
            {
              shadowOpacity: shadowOpacityAnim,
            },
          ]}>
          <View style={styles.logoInner}>
            <TaalMeetLogo size={96} variant="icon" />
          </View>
        </Animated.View>
      </Animated.View>

      {/* App Name and Tagline */}
      <Animated.View
        style={[
          styles.textContainer,
          {
            opacity: textOpacityAnim,
            transform: [{ translateY: textTranslateAnim }],
          },
        ]}>
        <Text style={styles.appName}>TaalMeet</Text>
        <Text style={styles.tagline}>Meet. Speak. Connect.</Text>
      </Animated.View>

      {/* Version */}
      <Animated.View
        style={[
          styles.versionContainer,
          {
            opacity: versionOpacityAnim,
          },
        ]}>
        <Text style={styles.version}>Version 1.0.0</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    backgroundColor: '#0F0F0F', // Dark background matching ux-template
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
    marginBottom: 16,
    position: 'relative',
  },
  glowRing: {
    position: 'absolute',
    width: 160, // Logo card width (136) + 24px padding for glow
    height: 160,
    borderRadius: 40, // Matches ux-template rounded-[2.5rem] = 40px
    padding: 20,
    overflow: 'hidden',
  },
  logoCard: {
    width: 136, // 96px logo + 40px padding (20px each side) - matches ux-template p-8
    height: 136,
    borderRadius: 32, // Matches ux-template rounded-[2rem] = 32px
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#1DB954',
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 40, // Large shadow for glow effect
    elevation: 12,
  },
  logoInner: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20, // Matches ux-template p-8
  },
  textContainer: {
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 8, // Matches ux-template mb-2
  },
  appName: {
    fontSize: 36, // Matches ux-template text-4xl
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  tagline: {
    fontSize: 16,
    color: '#9CA3AF', // Gray-400 matching ux-template
  },
  versionContainer: {
    position: 'absolute',
    bottom: 32, // Matches ux-template bottom-8
  },
  version: {
    fontSize: 12, // Matches ux-template text-xs
    color: '#9CA3AF',
  },
});

