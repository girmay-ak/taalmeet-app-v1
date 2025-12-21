/**
 * Verification Processing Screen
 * Shows processing animation while verifying identity
 */

import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withRepeat,
  withTiming,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import { useTheme } from '@/lib/theme/ThemeProvider';

export default function VerificationProcessingScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const params = useLocalSearchParams<{ sessionId?: string }>();

  // Animation values
  const rotation = useSharedValue(0);
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0.5);

  useEffect(() => {
    // Spinner rotation
    rotation.value = withRepeat(
      withTiming(360, {
        duration: 2000,
        easing: Easing.linear,
      }),
      -1,
      false
    );

    // Pulse animation
    scale.value = withRepeat(
      withSequence(
        withTiming(1.1, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );

    opacity.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.5, { duration: 1000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );

    // Simulate processing time (2-3 seconds)
    const timer = setTimeout(() => {
      router.replace({
        pathname: '/verification/success',
        params: { sessionId: params.sessionId },
      });
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  const spinnerStyle = useAnimatedStyle(() => ({
    transform: [
      { rotate: `${rotation.value}deg` },
      { scale: scale.value },
    ],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background.primary }]} edges={['top', 'bottom']}>
      <View style={styles.content}>
        {/* Animated Spinner */}
        <View style={styles.spinnerContainer}>
          {/* Glow effect */}
          <Animated.View 
            style={[
              styles.glow,
              { backgroundColor: `${colors.primary}30` },
              glowStyle,
            ]} 
          />
          
          {/* Spinner */}
          <Animated.View style={spinnerStyle}>
            <View 
              style={[
                styles.spinner,
                { 
                  borderColor: `${colors.primary}20`,
                  borderTopColor: colors.primary,
                }
              ]} 
            />
          </Animated.View>
        </View>

        {/* Title */}
        <Text style={[styles.title, { color: colors.text.primary }]}>
          Verifying Your Identity
        </Text>

        {/* Subtitle */}
        <Text style={[styles.subtitle, { color: colors.text.muted }]}>
          This usually takes 1-2 minutes...
        </Text>

        {/* Status Messages */}
        <View style={styles.statusContainer}>
          <View style={styles.statusItem}>
            <View style={[styles.statusDot, { backgroundColor: '#1DB954' }]} />
            <Text style={[styles.statusText, { color: colors.text.muted }]}>
              Analyzing document
            </Text>
          </View>
          <View style={styles.statusItem}>
            <View style={[styles.statusDot, { backgroundColor: '#1DB954' }]} />
            <Text style={[styles.statusText, { color: colors.text.muted }]}>
              Verifying authenticity
            </Text>
          </View>
          <View style={styles.statusItem}>
            <View style={[styles.statusDot, { backgroundColor: `${colors.primary}40` }]} />
            <Text style={[styles.statusText, { color: colors.text.muted }]}>
              Matching biometrics
            </Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  spinnerContainer: {
    width: 120,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  glow: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  spinner: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 40,
  },
  statusContainer: {
    width: '100%',
    gap: 16,
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 14,
  },
});

