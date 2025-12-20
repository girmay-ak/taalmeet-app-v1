/**
 * FlowingWaves - React Native Version
 * 
 * Enhanced animated background matching ux-template design
 * Features flowing wave patterns, animated SVG paths, and dynamic glows
 */

import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { Svg, Path, Line, Defs, Pattern, Rect } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  withSequence,
  interpolate,
  Easing,
  SharedValue,
} from 'react-native-reanimated';
import { useTheme } from '@/lib/theme/ThemeProvider';

const AnimatedPath = Animated.createAnimatedComponent(Path);
const AnimatedSvg = Animated.createAnimatedComponent(Svg);

const { width, height } = Dimensions.get('window');

// Bottom Wave Path Component
function BottomWavePath({ 
  index, 
  bottomWaveAnim 
}: { 
  index: number; 
  bottomWaveAnim: SharedValue<number> 
}) {
  const pathProps = useAnimatedProps(() => {
    const waveY = interpolate(bottomWaveAnim.value, [0, 1], [180 - index * 10, 220 - index * 10]);
    return {
      d: `M0 ${200 - index * 10} Q ${width / 4} ${waveY}, ${width / 2} ${200 - index * 10} T ${width} ${200 - index * 10}`,
    };
  });
  
  return (
    <AnimatedPath
      animatedProps={pathProps}
      stroke={index % 2 === 0 ? '#1DB954' : '#5FB3B3'}
      strokeWidth="1"
      fill="none"
      opacity={0.2 - index * 0.01}
    />
  );
}

export function FlowingWavesRN() {
  const { colors } = useTheme();
  
  // Animation values using Reanimated
  const fadeAnim = useSharedValue(0);
  const wave1Anim = useSharedValue(0);
  const wave2Anim = useSharedValue(0);
  const leftGlowX = useSharedValue(0);
  const leftGlowY = useSharedValue(0);
  const leftGlowScale = useSharedValue(1);
  const rightGlowX = useSharedValue(0);
  const rightGlowY = useSharedValue(0);
  const rightGlowScale = useSharedValue(1);
  const hexagonScale = useSharedValue(1);
  const hexagonOpacity = useSharedValue(0.3);
  const bottomWaveAnim = useSharedValue(0);

  useEffect(() => {
    // Fade in
    fadeAnim.value = withTiming(1, { duration: 1000 });

    // Wave animations
    wave1Anim.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 8000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 8000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );

    wave2Anim.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 8000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 8000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );

    // Left glow animation
    leftGlowX.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 15000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 15000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );
    leftGlowY.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 15000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 15000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );
    leftGlowScale.value = withRepeat(
      withSequence(
        withTiming(1.2, { duration: 15000, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 15000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );

    // Right glow animation
    rightGlowX.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 18000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 18000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );
    rightGlowY.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 18000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 18000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );
    rightGlowScale.value = withRepeat(
      withSequence(
        withTiming(1.3, { duration: 18000, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 18000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );

    // Hexagon glow animation
    hexagonScale.value = withRepeat(
      withSequence(
        withTiming(1.2, { duration: 4000, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 4000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );
    hexagonOpacity.value = withRepeat(
      withSequence(
        withTiming(0.5, { duration: 4000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.3, { duration: 4000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );

    // Bottom wave animation
    bottomWaveAnim.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 5000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 5000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );
  }, []);

  // Animated props for wave paths
  const wave1PathProps = useAnimatedProps(() => {
    const yOffset = interpolate(wave1Anim.value, [0, 1], [100, 120]);
    return {
      d: `M-50 ${yOffset} Q 100 ${yOffset - 20}, 200 ${yOffset} T ${width + 50} ${yOffset}`,
    };
  });

  const wave2PathProps = useAnimatedProps(() => {
    const yOffset = interpolate(wave2Anim.value, [0, 1], [120, 100]);
    return {
      d: `M-50 ${yOffset} Q 100 ${yOffset - 50}, 200 ${yOffset} T ${width + 50} ${yOffset}`,
    };
  });

  // Animated styles
  const topWavesOpacity = useAnimatedStyle(() => ({
    opacity: interpolate(fadeAnim.value, [0, 1], [0, 0.3]),
  }));

  const leftGlowStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateX: interpolate(leftGlowX.value, [0, 1], [-50, 50]),
      },
      {
        translateY: interpolate(leftGlowY.value, [0, 1], [0, 100]),
      },
      { scale: leftGlowScale.value },
    ],
    opacity: fadeAnim.value,
  }));

  const rightGlowStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateX: interpolate(rightGlowX.value, [0, 1], [50, -50]),
      },
      {
        translateY: interpolate(rightGlowY.value, [0, 1], [0, -100]),
      },
      { scale: rightGlowScale.value },
    ],
    opacity: fadeAnim.value,
  }));

  const hexagonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: hexagonScale.value }],
    opacity: hexagonOpacity.value,
  }));

  const bottomWavesOpacity = useAnimatedStyle(() => ({
    opacity: interpolate(fadeAnim.value, [0, 1], [0, 0.2]),
  }));

  const diagonalLinesOpacity = useAnimatedStyle(() => ({
    opacity: interpolate(fadeAnim.value, [0, 1], [0, 0.1]),
  }));

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {/* Background Gradient */}
      <LinearGradient
        colors={['#0A4D3C', '#0F0F0F', '#1A1A1A']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      
      {/* Flowing Wave Pattern - Top */}
      <Animated.View style={[StyleSheet.absoluteFill, topWavesOpacity]}>
        <Svg width={width} height={height} style={StyleSheet.absoluteFill}>
          <AnimatedPath
            animatedProps={wave1PathProps}
            stroke="#1DB954"
            strokeWidth="1.5"
            fill="none"
            opacity={0.3}
          />
          <AnimatedPath
            animatedProps={wave2PathProps}
            stroke="#1ED760"
            strokeWidth="1.5"
            fill="none"
            opacity={0.3}
          />
        </Svg>
      </Animated.View>

      {/* Geometric Flowing Pattern - Left */}
      <Animated.View style={[styles.glowPattern, styles.glowLeft, leftGlowStyle]}>
        <View style={[styles.glowGradient, { backgroundColor: 'rgba(29, 185, 84, 0.2)' }]} />
      </Animated.View>

      {/* Geometric Flowing Pattern - Right */}
      <Animated.View style={[styles.glowPattern, styles.glowRight, rightGlowStyle]}>
        <View style={[styles.glowGradient, { backgroundColor: 'rgba(95, 179, 179, 0.2)' }]} />
      </Animated.View>

      {/* Wave Lines - Bottom */}
      <Animated.View style={[styles.bottomWaves, bottomWavesOpacity]}>
        <Svg width={width} height={256} style={styles.bottomWavesSvg}>
          {Array.from({ length: 12 }).map((_, i) => (
            <BottomWavePath key={i} index={i} bottomWaveAnim={bottomWaveAnim} />
          ))}
        </Svg>
      </Animated.View>

      {/* Diagonal Lines Pattern */}
      <Animated.View style={[StyleSheet.absoluteFill, diagonalLinesOpacity]}>
        <Svg width={width} height={height} style={StyleSheet.absoluteFill}>
          <Defs>
            <Pattern id="diagonal-lines" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
              <Line x1="0" y1="0" x2="20" y2="20" stroke="#1DB954" strokeWidth="0.5" />
            </Pattern>
          </Defs>
          <Rect width={width} height={height} fill="url(#diagonal-lines)" />
        </Svg>
      </Animated.View>

      {/* Center Hexagon Glow */}
      <Animated.View style={[styles.hexagonGlow, hexagonStyle]}>
        <View style={styles.hexagonGradient} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  glowPattern: {
    position: 'absolute',
    width: 256,
    height: 256,
    borderRadius: 128,
    overflow: 'hidden',
  },
  glowLeft: {
    top: height * 0.25,
    left: -128,
  },
  glowRight: {
    top: height * 0.5,
    right: -128,
  },
  glowGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 128,
  },
  bottomWaves: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 256,
  },
  bottomWavesSvg: {
    position: 'absolute',
  },
  hexagonGlow: {
    position: 'absolute',
    left: width / 2 - 150,
    top: height / 2 - 150,
    width: 300,
    height: 300,
    overflow: 'hidden',
  },
  hexagonGradient: {
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(29, 185, 84, 0.15)',
    borderRadius: 150,
  },
});
