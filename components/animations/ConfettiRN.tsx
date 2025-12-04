/**
 * Confetti Animation - React Native Version
 */

import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

interface ConfettiProps {
  active: boolean;
  duration?: number;
}

interface ConfettiPiece {
  id: number;
  x: number;
  color: string;
  delay: number;
  rotation: number;
  size: number;
  isCircle: boolean;
}

export function ConfettiRN({ active, duration = 3000 }: ConfettiProps) {
  const [pieces, setPieces] = useState<ConfettiPiece[]>([]);

  useEffect(() => {
    if (active) {
      const colors = ['#1DB954', '#1ED760', '#5FB3B3', '#E91E8C', '#8B5CF6', '#F59E0B', '#10B981', '#EC4899'];
      const newPieces: ConfettiPiece[] = Array.from({ length: 50 }, (_, i) => ({
        id: i,
        x: Math.random() * width,
        color: colors[Math.floor(Math.random() * colors.length)],
        delay: Math.random() * 0.3,
        rotation: Math.random() * 360,
        size: Math.random() * 10 + 5,
        isCircle: Math.random() > 0.5,
      }));
      setPieces(newPieces);

      const timer = setTimeout(() => {
        setPieces([]);
      }, duration);

      return () => clearTimeout(timer);
    } else {
      setPieces([]);
    }
  }, [active, duration]);

  if (!active || pieces.length === 0) return null;

  return (
    <View style={styles.container} pointerEvents="none">
      {pieces.map((piece) => (
        <ConfettiPieceComponent key={piece.id} piece={piece} />
      ))}
    </View>
  );
}

function ConfettiPieceComponent({ piece }: { piece: ConfettiPiece }) {
  const translateY = React.useRef(new Animated.Value(-20)).current;
  const rotate = React.useRef(new Animated.Value(piece.rotation)).current;
  const opacity = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: height + 20,
        duration: 2500,
        delay: piece.delay * 1000,
        useNativeDriver: true,
      }),
      Animated.timing(rotate, {
        toValue: piece.rotation + 720,
        duration: 2500,
        delay: piece.delay * 1000,
        useNativeDriver: true,
      }),
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 200,
          delay: piece.delay * 1000,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 300,
          delay: 2000,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, []);

  const rotation = rotate.interpolate({
    inputRange: [0, 360],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <Animated.View
      style={[
        styles.piece,
        {
          left: piece.x,
          width: piece.size,
          height: piece.size,
          borderRadius: piece.isCircle ? piece.size / 2 : 2,
          backgroundColor: piece.color,
          transform: [{ translateY }, { rotate: rotation }],
          opacity,
        },
      ]}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  piece: {
    position: 'absolute',
  },
});

