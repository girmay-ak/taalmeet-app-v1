/**
 * Map Pin Marker Component
 * Pin-style marker with avatar for map (Figma design)
 */

import React from 'react';
import { View, Image, StyleSheet, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/lib/theme/ThemeProvider';
import Svg, { Path, Defs, LinearGradient as SvgLinearGradient, Stop } from 'react-native-svg';

export interface MapPinMarkerProps {
  /**
   * Avatar URL
   */
  avatarUrl: string | null;
  /**
   * Size of the pin (default: 56)
   */
  size?: number;
  /**
   * Is user online
   */
  isOnline?: boolean;
  /**
   * Color for pin border (primary, success, or custom hex)
   */
  borderColor?: string;
  /**
   * Display name for fallback initial
   */
  displayName?: string;
  /**
   * Use gradient for special markers (e.g., events)
   */
  useGradient?: boolean;
  /**
   * Gradient colors [start, end]
   */
  gradientColors?: [string, string];
  /**
   * Language flag emoji (e.g., "🇺🇸")
   */
  languageFlag?: string;
}

export function MapPinMarker({
  avatarUrl,
  size = 56,
  isOnline = false,
  borderColor,
  displayName = 'U',
  useGradient = false,
  gradientColors = ['#FF4D67', '#FF8A9B'],
  languageFlag,
}: MapPinMarkerProps) {
  const { colors } = useTheme();
  
  // Determine border color
  const pinBorderColor = borderColor || 
    (isOnline ? '#07BD74' : (useGradient ? 'transparent' : colors.border.default));
  
  const avatarSize = size - 8; // Avatar is smaller than pin
  
  return (
    <View style={[styles.container, { width: size * 1.2, height: size * 1.6 }]}>
      {/* Pin Shape Background */}
      <View style={styles.pinContainer}>
        <Svg 
          width={size * 1.2} 
          height={size * 1.6} 
          viewBox="0 0 68 81"
          style={styles.pinSvg}
        >
          <Defs>
            {useGradient && (
              <SvgLinearGradient id="pinGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <Stop offset="0%" stopColor={gradientColors[0]} stopOpacity="1" />
                <Stop offset="100%" stopColor={gradientColors[1]} stopOpacity="1" />
              </SvgLinearGradient>
            )}
          </Defs>
          <Path
            d="M34 0C15.5 0 0.5 15 0.5 33.5C0.5 52 20 70.5 34 80.5C48 70.5 67.5 52 67.5 33.5C67.5 15 52.5 0 34 0Z"
            fill={useGradient ? 'url(#pinGradient)' : pinBorderColor}
          />
          {/* Inner white circle for avatar */}
          <Path
            d="M34 8C20.2 8 9 19.2 9 33C9 46.8 20.2 58 34 58C47.8 58 59 46.8 59 33C59 19.2 47.8 8 34 8Z"
            fill={colors.background.primary}
          />
        </Svg>
      </View>

      {/* Avatar */}
      <View style={[styles.avatarContainer, { top: size * 0.15 }]}>
        <View
          style={[
            styles.avatarCircle,
            {
              width: avatarSize,
              height: avatarSize,
              borderRadius: avatarSize / 2,
              borderColor: useGradient ? 'transparent' : pinBorderColor,
              borderWidth: useGradient ? 0 : 3,
            },
          ]}
        >
          {avatarUrl ? (
            <Image
              source={{ uri: avatarUrl }}
              style={[
                styles.avatar,
                {
                  width: avatarSize - (useGradient ? 0 : 6),
                  height: avatarSize - (useGradient ? 0 : 6),
                  borderRadius: (avatarSize - (useGradient ? 0 : 6)) / 2,
                },
              ]}
              resizeMode="cover"
            />
          ) : (
            <View
              style={[
                styles.avatarPlaceholder,
                {
                  width: avatarSize - 6,
                  height: avatarSize - 6,
                  borderRadius: (avatarSize - 6) / 2,
                  backgroundColor: '#584CF4',
                },
              ]}
            >
              <View style={styles.initialsContainer}>
                <View style={styles.initialsText}>
                  {/* Use text as gradient isn't supported here */}
                </View>
              </View>
            </View>
          )}
        </View>

        {/* Language Flag Badge */}
        {languageFlag && !useGradient && (
          <View style={styles.flagBadge}>
            <Text style={styles.flagText}>{languageFlag}</Text>
          </View>
        )}

        {/* Online Status Indicator */}
        {isOnline && !useGradient && (
          <View
            style={[
              styles.onlineIndicator,
              {
                backgroundColor: '#07BD74',
                borderColor: colors.background.primary,
              },
            ]}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  pinContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  pinSvg: {
    position: 'absolute',
    top: 0,
  },
  avatarContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarCircle: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  avatar: {
    // Styles applied dynamically
  },
  avatarPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  initialsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  initialsText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  flagBadge: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#E0E0E0',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  flagText: {
    fontSize: 14,
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 3,
  },
});

