/**
 * FlowingWaves - React Native Version
 * 
 * Simplified animated background for React Native
 */

import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/lib/theme/ThemeProvider';

const { width, height } = Dimensions.get('window');

export function FlowingWavesRN() {
  const { colors } = useTheme();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Fade in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();

    // Pulsing scale animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.1,
          duration: 3000,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  return (
    <View style={StyleSheet.absoluteFill}>
      {/* Background Gradient */}
      <LinearGradient
        colors={['#0A4D3C', colors.background.primary, colors.background.secondary]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      {/* Animated Glow Circles */}
      <Animated.View
        style={[
          styles.glowCircle,
          styles.glowLeft,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
            backgroundColor: colors.primary + '40', // 40 = 25% opacity in hex
          },
        ]}
      />
      <Animated.View
        style={[
          styles.glowCircle,
          styles.glowRight,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
            backgroundColor: colors.secondary + '40',
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  glowCircle: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
  },
  glowLeft: {
    top: height * 0.25,
    left: -50,
  },
  glowRight: {
    top: height * 0.5,
    right: -50,
  },
});

