/**
 * Google Map Pin Marker View
 * Pin-style marker view for react-native-maps
 */

import React from 'react';
import { View, Image, StyleSheet, Text } from 'react-native';

export interface GoogleMapPinMarkerProps {
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
   * Border color
   */
  borderColor?: string;
  /**
   * Display name for fallback initial
   */
  displayName?: string;
  /**
   * Language flag emoji (e.g., "🇺🇸")
   */
  languageFlag?: string;
}

export function GoogleMapPinMarker({
  avatarUrl,
  size = 56,
  isOnline = false,
  borderColor,
  displayName = 'U',
  languageFlag,
}: GoogleMapPinMarkerProps) {
  const pinBorderColor = borderColor || (isOnline ? '#07BD74' : '#9E9E9E');
  const avatarSize = size - 8;

  return (
    <View style={[styles.container, { width: size * 1.2, height: size * 1.8 }]}>
      {/* Pin Shape Background using View */}
      <View
        style={[
          styles.pinShape,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderColor: pinBorderColor,
            top: 0,
          },
        ]}
      >
        {/* Avatar */}
        <View
          style={[
            styles.avatarCircle,
            {
              width: avatarSize,
              height: avatarSize,
              borderRadius: avatarSize / 2,
            },
          ]}
        >
          {avatarUrl ? (
            <Image
              source={{ uri: avatarUrl }}
              style={[
                styles.avatar,
                {
                  width: avatarSize,
                  height: avatarSize,
                  borderRadius: avatarSize / 2,
                },
              ]}
              resizeMode="cover"
            />
          ) : (
            <View
              style={[
                styles.avatarPlaceholder,
                {
                  width: avatarSize,
                  height: avatarSize,
                  borderRadius: avatarSize / 2,
                },
              ]}
            />
          )}
        </View>

        {/* Language Flag Badge */}
        {languageFlag && (
          <View style={styles.flagBadge}>
            <Text style={styles.flagText}>{languageFlag}</Text>
          </View>
        )}

        {/* Online Status Indicator */}
        {isOnline && (
          <View
            style={[
              styles.onlineIndicator,
              {
                backgroundColor: '#07BD74',
              },
            ]}
          />
        )}
      </View>

      {/* Pin Point */}
      <View
        style={[
          styles.pinPoint,
          {
            borderLeftWidth: size * 0.2,
            borderRightWidth: size * 0.2,
            borderTopWidth: size * 0.3,
            borderTopColor: pinBorderColor,
            top: size - 2,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  pinShape: {
    position: 'absolute',
    backgroundColor: '#FFFFFF',
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  avatarCircle: {
    overflow: 'hidden',
  },
  avatar: {
    // Styles applied dynamically
  },
  avatarPlaceholder: {
    backgroundColor: '#584CF4',
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
    borderColor: '#FFFFFF',
  },
  pinPoint: {
    position: 'absolute',
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
  },
});

