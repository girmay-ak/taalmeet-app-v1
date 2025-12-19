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
    <View style={StyleSheet.absoluteFill} pointerEvents="none">

      {/* Animated Glow Circles - Logo colors */}
      <Animated.View
        style={[
          styles.glowCircle,
          styles.glowLeft,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
            backgroundColor: '#4FD1C540', // Teal with 25% opacity
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
            backgroundColor: '#FFB80040', // Golden yellow with 25% opacity
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

