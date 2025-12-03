/**
 * Button Component
 * 
 * Reusable button component matching Figma design
 * Supports primary, secondary, and outline variants
 */

import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/lib/theme/ThemeProvider';
import { spacing, textStyles } from '@/lib/theme';

export interface ButtonProps {
  title: string;
  onPress?: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  style,
  textStyle,
}: ButtonProps) {
  const { colors } = useTheme();

  const isDisabled = disabled || loading;

  const getButtonStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
    };

    // Size styles
    switch (size) {
      case 'sm':
        baseStyle.paddingVertical = spacing.sm;
        baseStyle.paddingHorizontal = spacing.md;
        break;
      case 'md':
        baseStyle.paddingVertical = spacing.md;
        baseStyle.paddingHorizontal = spacing.lg;
        break;
      case 'lg':
        baseStyle.paddingVertical = spacing.lg;
        baseStyle.paddingHorizontal = spacing.xl;
        break;
    }

    // Variant styles
    if (variant === 'outline') {
      baseStyle.borderWidth = 1;
      baseStyle.borderColor = colors.border.default;
      baseStyle.backgroundColor = 'transparent';
    } else if (variant === 'ghost') {
      baseStyle.backgroundColor = 'transparent';
    }

    return baseStyle;
  };

  const getTextStyle = (): TextStyle => {
    const baseStyle: TextStyle = {
      ...textStyles.button,
    };

    switch (variant) {
      case 'primary':
        baseStyle.color = '#FFFFFF';
        break;
      case 'secondary':
        baseStyle.color = colors.text.primary;
        break;
      case 'outline':
        baseStyle.color = colors.text.primary;
        break;
      case 'ghost':
        baseStyle.color = colors.primary;
        break;
    }

    if (isDisabled) {
      baseStyle.opacity = 0.5;
    }

    return baseStyle;
  };

  const content = (
    <>
      {loading && (
        <ActivityIndicator
          size="small"
          color={variant === 'primary' ? '#FFFFFF' : colors.primary}
          style={{ marginRight: spacing.sm }}
        />
      )}
      <Text style={[getTextStyle(), textStyle]}>{title}</Text>
    </>
  );

  if (variant === 'primary' && !isDisabled) {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={isDisabled}
        activeOpacity={0.8}
        style={[getButtonStyle(), style]}>
        <LinearGradient
          colors={[colors.primary, colors.primaryLight]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={StyleSheet.absoluteFill}
        />
        {content}
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.8}
      style={[
        getButtonStyle(),
        {
          backgroundColor:
            variant === 'secondary'
              ? colors.background.secondary
              : variant === 'outline' || variant === 'ghost'
              ? 'transparent'
              : colors.primary,
        },
        isDisabled && { opacity: 0.5 },
        style,
      ]}>
      {content}
    </TouchableOpacity>
  );
}

