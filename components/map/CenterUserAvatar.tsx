/**
 * Center User Avatar Component
 * 
 * ARCHITECTURE: Fixed Overlay (Not a Map Marker)
 * - Positioned with absolute positioning at screen center
 * - NEVER moves, regardless of map pan/zoom
 * - NEVER replaced or affected by marker selection
 * - Largest avatar to establish visual hierarchy
 * - Map moves underneath this fixed overlay
 * 
 * This represents the logged-in user (ME)
 */

import React from 'react';
import { View, Image, StyleSheet, Text } from 'react-native';
import Animated, { 
  useAnimatedStyle, 
  withSpring,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

// ============================================================================
// TYPES
// ============================================================================

export interface CenterUserAvatarProps {
  /**
   * User's avatar URL
   */
  avatarUrl: string | null;
  /**
   * User's display name (for fallback)
   */
  displayName: string;
  /**
   * Show finding animation
   */
  isSearching?: boolean;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function CenterUserAvatar({
  avatarUrl,
  displayName,
  isSearching = false,
}: CenterUserAvatarProps) {
  return (
    <View style={styles.container}>
      {/* Fixed Center Avatar - Perfectly centered */}
      <View style={styles.centerWrapper}>
        <View style={styles.avatarContainer}>
          {/* Avatar with white border and shadow */}
          <View style={styles.avatarWrapper}>
            {avatarUrl ? (
              <Image
                source={{ uri: avatarUrl }}
                style={styles.avatar}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarInitial}>
                  {displayName.charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
          </View>

          {/* Finding text (when searching) */}
          {isSearching && (
            <View style={styles.searchingTextContainer}>
              <Text style={styles.searchingText}>Getting your location...</Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
}

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
    pointerEvents: 'none',
  },
  centerWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarWrapper: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: '#FFFFFF',
    borderWidth: 5,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 10,
    overflow: 'hidden',
  },
  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: 39,
  },
  avatarPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#07BD74',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  searchingTextContainer: {
    position: 'absolute',
    top: 100,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#FFFFFFEE',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  searchingText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#212121',
  },
});

