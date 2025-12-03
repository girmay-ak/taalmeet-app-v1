/**
 * Nearby User Markers Component
 * Renders user markers on the map with avatars and smooth animations
 */

import React, { useEffect, useRef } from 'react';
import { View, Image, StyleSheet, Animated } from 'react-native';
import Mapbox, { PointAnnotation } from '@rnmapbox/maps';
import { useTheme } from '@/lib/theme/ThemeProvider';
import { getLanguageFlag } from '@/utils/languageFlags';
import type { UserLanguage } from '@/types/database';

// ============================================================================
// TYPES
// ============================================================================

export interface NearbyUser {
  id: string;
  displayName: string;
  avatarUrl: string | null;
  lat: number;
  lng: number;
  languages: UserLanguage[];
  distanceKm?: number;
  isOnline?: boolean;
  matchScore?: number;
}

export interface NearbyUserMarkersProps {
  /**
   * Array of nearby users to display as markers
   */
  users: NearbyUser[];
  /**
   * Callback when a marker is pressed
   */
  onMarkerPress?: (user: NearbyUser) => void;
  /**
   * Size of marker avatar (default: 48)
   */
  markerSize?: number;
  /**
   * Show online status indicator
   */
  showOnlineStatus?: boolean;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function NearbyUserMarkers({
  users,
  onMarkerPress,
  markerSize = 48,
  showOnlineStatus = true,
}: NearbyUserMarkersProps) {
  const { colors } = useTheme();
  const scaleAnims = useRef<Map<string, Animated.Value>>(new Map());
  const pulseAnims = useRef<Map<string, Animated.Value>>(new Map());

  // Initialize scale and pulse animations for each user
  useEffect(() => {
    users.forEach((user) => {
      if (!scaleAnims.current.has(user.id)) {
        scaleAnims.current.set(user.id, new Animated.Value(1));
      }
      if (user.isOnline && !pulseAnims.current.has(user.id)) {
        const pulseAnim = new Animated.Value(1);
        pulseAnims.current.set(user.id, pulseAnim);

        // Start pulse animation
        Animated.loop(
          Animated.sequence([
            Animated.timing(pulseAnim, {
              toValue: 1.3,
              duration: 1000,
              useNativeDriver: true,
            }),
            Animated.timing(pulseAnim, {
              toValue: 1,
              duration: 1000,
              useNativeDriver: true,
            }),
          ])
        ).start();
      }
    });
  }, [users]);

  // Animate marker on press
  const handleMarkerPress = (user: NearbyUser) => {
    const anim = scaleAnims.current.get(user.id);
    if (anim) {
      Animated.sequence([
        Animated.timing(anim, {
          toValue: 1.2,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(anim, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    }

    if (onMarkerPress) {
      onMarkerPress(user);
    }
  };

  // Get teaching language for marker badge
  const getTeachingLanguage = (user: NearbyUser) => {
    const teachingLang = user.languages.find((l) => l.role === 'teaching');
    return teachingLang ? getLanguageFlag(teachingLang.language) : '🌍';
  };

  return (
    <>
      {users.map((user) => {
        const scaleAnim = scaleAnims.current.get(user.id) || new Animated.Value(1);
        const isOnline = user.isOnline ?? false;

        return (
          <PointAnnotation
            key={user.id}
            id={user.id}
            coordinate={[user.lng, user.lat]}
            onSelected={() => handleMarkerPress(user)}
          >
            <Animated.View
              style={[
                styles.markerContainer,
                {
                  transform: [{ scale: scaleAnim }],
                },
              ]}
            >
              {/* Avatar Circle */}
              <View
                style={[
                  styles.avatarContainer,
                  {
                    width: markerSize,
                    height: markerSize,
                    borderRadius: markerSize / 2,
                    borderColor: isOnline ? colors.primary : colors.border.default,
                    borderWidth: isOnline ? 3 : 2,
                    backgroundColor: colors.background.secondary,
                  },
                ]}
              >
                {user.avatarUrl ? (
                  <Image
                    source={{ uri: user.avatarUrl }}
                    style={[
                      styles.avatar,
                      {
                        width: markerSize - 4,
                        height: markerSize - 4,
                        borderRadius: (markerSize - 4) / 2,
                      },
                    ]}
                    resizeMode="cover"
                  />
                ) : (
                  <View
                    style={[
                      styles.avatarPlaceholder,
                      {
                        width: markerSize - 4,
                        height: markerSize - 4,
                        borderRadius: (markerSize - 4) / 2,
                        backgroundColor: colors.primary,
                      },
                    ]}
                  >
                    <Animated.Text
                      style={[
                        styles.avatarInitial,
                        { color: '#FFFFFF', fontSize: markerSize * 0.4 },
                      ]}
                    >
                      {user.displayName.charAt(0).toUpperCase()}
                    </Animated.Text>
                  </View>
                )}

                {/* Online Status Indicator */}
                {showOnlineStatus && isOnline && (
                  <View
                    style={[
                      styles.onlineIndicator,
                      {
                        backgroundColor: colors.primary,
                        borderColor: colors.background.secondary,
                      },
                    ]}
                  />
                )}

                {/* Language Badge */}
                <View
                  style={[
                    styles.languageBadge,
                    {
                      backgroundColor: colors.background.secondary,
                      borderColor: colors.border.default,
                    },
                  ]}
                >
                  <Animated.Text style={styles.languageFlag}>
                    {getTeachingLanguage(user)}
                  </Animated.Text>
                </View>
              </View>

              {/* Pulse Animation for Online Users */}
              {isOnline && (() => {
                const pulseAnim = pulseAnims.current.get(user.id);
                if (!pulseAnim) return null;

                return (
                  <Animated.View
                    style={[
                      styles.pulseRing,
                      {
                        width: markerSize + 8,
                        height: markerSize + 8,
                        borderRadius: (markerSize + 8) / 2,
                        borderColor: colors.primary,
                        transform: [{ scale: pulseAnim }],
                        opacity: pulseAnim.interpolate({
                          inputRange: [1, 1.3],
                          outputRange: [0.3, 0],
                        }),
                      },
                    ]}
                  />
                );
              })()}
            </Animated.View>
          </PointAnnotation>
        );
      })}
    </>
  );
}

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  markerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  avatar: {
    position: 'absolute',
  },
  avatarPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    fontWeight: '600',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
  },
  languageBadge: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  languageFlag: {
    fontSize: 14,
  },
  pulseRing: {
    position: 'absolute',
    borderWidth: 2,
    opacity: 0.3,
  },
});

