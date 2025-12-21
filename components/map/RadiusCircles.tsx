/**
 * Radius Circles Component
 * Displays concentric circles showing distance zones on map
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '@/lib/theme/ThemeProvider';

export interface RadiusCirclesProps {
  /**
   * Center coordinate [lng, lat]
   */
  center: [number, number];
  /**
   * Radius distances in km
   */
  radiusKm?: number[];
  /**
   * Circle colors (from inner to outer)
   */
  colors?: string[];
  /**
   * Opacity for circles
   */
  opacity?: number;
}

export function RadiusCircles({
  center,
  radiusKm = [5, 10, 15],
  colors: circleColors,
  opacity = 0.1,
}: RadiusCirclesProps) {
  const { colors } = useTheme();
  
  const defaultColors = [
    '#07BD74',
    '#07BD74',
    '#07BD74',
  ];
  
  const finalColors = circleColors || defaultColors;

  // Calculate pixel radius from km
  // This is a rough approximation - actual implementation would need
  // proper map projection calculations
  const kmToPixels = (km: number) => {
    // At zoom level ~12, 1km ≈ 30 pixels (rough estimate)
    return km * 30;
  };

  return (
    <View style={styles.container} pointerEvents="none">
      {radiusKm.map((radius, index) => {
        const pixelRadius = kmToPixels(radius);
        return (
          <View
            key={`radius-${index}`}
            style={[
              styles.circle,
              {
                width: pixelRadius * 2,
                height: pixelRadius * 2,
                borderRadius: pixelRadius,
                borderColor: finalColors[index] || finalColors[0],
                borderWidth: 2,
                opacity: opacity * (1 - (index * 0.2)), // Fade outer circles
              },
            ]}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    pointerEvents: 'none',
  },
  circle: {
    position: 'absolute',
    borderStyle: 'solid',
  },
});

