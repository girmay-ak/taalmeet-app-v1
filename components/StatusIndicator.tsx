/**
 * Status Indicator Component - React Native
 * 
 * Shows user availability status
 */

import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '@/lib/theme/ThemeProvider';
import { spacing, textStyles } from '@/lib/theme';

interface StatusIndicatorProps {
  status: 'available' | 'soon' | 'busy' | 'offline';
  size?: 'small' | 'medium' | 'large';
  showLabel?: boolean;
  timeLeft?: number; // minutes
  lastActive?: string;
}

const sizeMap = {
  small: 12,
  medium: 16,
  large: 24,
};

const emojis = {
  available: '🟢',
  soon: '🟡',
  busy: '🔴',
  offline: '⚫',
};

export function StatusIndicator({
  status,
  size = 'small',
  showLabel = false,
  timeLeft,
  lastActive,
}: StatusIndicatorProps) {
  const { colors } = useTheme();

  const statusColors = {
    available: colors.semantic.success,
    soon: colors.semantic.warning,
    busy: colors.semantic.error,
    offline: colors.text.muted,
  };

  const statusBgColors = {
    available: colors.semantic.success + '33', // 20% opacity
    soon: colors.semantic.warning + '33',
    busy: colors.semantic.error + '33',
    offline: colors.text.muted + '33',
  };

  const labels = {
    available: 'Available now',
    soon: timeLeft ? `Available in ${timeLeft}m` : 'Available soon',
    busy: 'Busy',
    offline: lastActive || 'Offline',
  };

  if (!showLabel) {
    return (
      <View
        style={[
          styles.dot,
          {
            width: sizeMap[size],
            height: sizeMap[size],
            backgroundColor: statusColors[status],
            borderRadius: sizeMap[size] / 2,
          },
        ]}
      />
    );
  }

  return (
    <View
      style={[
        styles.labelContainer,
        {
          backgroundColor: statusBgColors[status],
        },
      ]}>
      <Text style={styles.emoji}>{emojis[status]}</Text>
      <Text
        style={[
          textStyles.caption,
          {
            color: statusColors[status],
            fontWeight: '600',
          },
        ]}>
        {labels[status]}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  dot: {
    borderWidth: 2,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    gap: spacing.xs,
  },
  emoji: {
    fontSize: 14,
  },
});
