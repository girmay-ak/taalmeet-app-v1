/**
 * Nearby User Markers Component
 * Renders user markers on the map with avatars and smooth animations
 */

import React, { useEffect, useRef, useMemo } from 'react';
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
   * ID of the currently active partner (for highlighting)
   */
  activePartnerId?: string | null;
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
  activePartnerId,
  markerSize = 48,
  showOnlineStatus = true,
}: NearbyUserMarkersProps) {
  const { colors } = useTheme();
  const scaleAnims = useRef<Map<string, Animated.Value>>(new Map());
  const pulseAnims = useRef<Map<string, Animated.Value>>(new Map());
  const highlightAnims = useRef<Map<string, Animated.Value>>(new Map());

  // Debug logging
  useEffect(() => {
    console.log('[NearbyUserMarkers] Rendering markers:', {
      totalUsers: users.length,
      usersWithValidCoords: users.filter(u => u.lat && u.lng && !isNaN(u.lat) && !isNaN(u.lng)).length,
      users: users.map(u => ({
        id: u.id,
        name: u.displayName,
        lat: u.lat,
        lng: u.lng,
        hasValidCoords: !!(u.lat && u.lng && !isNaN(u.lat) && !isNaN(u.lng))
      }))
    });
  }, [users]);

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

  // Remove duplicate users by ID to prevent duplicate markers
  const uniqueUsers = useMemo(() => {
    const seen = new Set<string>();
    return users.filter(user => {
      if (seen.has(user.id)) {
        console.warn('[NearbyUserMarkers] Duplicate user detected, skipping:', user.id, user.displayName);
        return false;
      }
      seen.add(user.id);
      return true;
    });
  }, [users]);

  return (
    <>
      {uniqueUsers
        .filter(user => {
          // Validate coordinates before rendering
          if (!user.lat || !user.lng) {
            console.warn('[NearbyUserMarkers] User missing coordinates:', user.id, user.displayName);
            return false;
          }
          if (isNaN(user.lat) || isNaN(user.lng)) {
            console.warn('[NearbyUserMarkers] User has invalid coordinates:', user.id, user.displayName);
            return false;
          }
          return true;
        })
        .map((user, index) => {
          const scaleAnim = scaleAnims.current.get(user.id) || new Animated.Value(1);
          const highlightAnim = highlightAnims.current.get(user.id) || new Animated.Value(0);
          const isOnline = user.isOnline ?? false;
          const isActive = user.id === activePartnerId;

          // Ensure coordinates are valid numbers
          const lat = typeof user.lat === 'number' ? user.lat : parseFloat(String(user.lat));
          const lng = typeof user.lng === 'number' ? user.lng : parseFloat(String(user.lng));

          if (isNaN(lat) || isNaN(lng)) {
            console.warn('[NearbyUserMarkers] Invalid coordinate conversion:', user.id, { lat: user.lat, lng: user.lng });
            return null;
          }

          // Check if there are other markers with very close coordinates (within ~10 meters)
          const hasOverlappingMarkers = uniqueUsers.some((otherUser, otherIndex) => {
            if (otherIndex === index || otherUser.id === user.id) return false;
            const otherLat = typeof otherUser.lat === 'number' ? otherUser.lat : parseFloat(String(otherUser.lat));
            const otherLng = typeof otherUser.lng === 'number' ? otherUser.lng : parseFloat(String(otherUser.lng));
            if (isNaN(otherLat) || isNaN(otherLng)) return false;
            const latDiff = Math.abs(lat - otherLat);
            const lngDiff = Math.abs(lng - otherLng);
            // If coordinates are within ~0.0001 degrees (~10 meters), they're overlapping
            return latDiff < 0.0001 && lngDiff < 0.0001;
          });

          let finalLat = lat;
          let finalLng = lng;
          
          // Only apply offset if markers are overlapping
          if (hasOverlappingMarkers) {
            // Use larger offset (~5-10 meters) with spiral pattern to spread markers out
            const offsetDistance = 0.00008 * ((index % 6) + 1); // About 8 meters per step, max 6 markers
            const angle = (index * 60) * (Math.PI / 180); // 60 degrees between markers (hexagonal spiral)
            finalLat = lat + (offsetDistance * Math.cos(angle));
            finalLng = lng + (offsetDistance * Math.sin(angle));
          }

          // Ensure unique ID for each marker
          const markerId = `marker-${user.id}`;

          // Get pulse animation value
          const pulseAnim = isOnline ? pulseAnims.current.get(user.id) : null;

          return (
            <PointAnnotation
              key={markerId}
              id={markerId}
              coordinate={[finalLng, finalLat]}
              onSelected={() => handleMarkerPress(user)}
            >
              {/* Single wrapper View - Mapbox only allows 1 child */}
              <Animated.View
                style={[
                  styles.markerContainer,
                  {
                    transform: [{ scale: scaleAnim }],
                  },
                ]}
              >
                {/* Highlight ring for active marker */}
                {isActive && (
                  <Animated.View
                    style={[
                      styles.highlightRing,
                      {
                        width: markerSize + 16,
                        height: markerSize + 16,
                        borderRadius: (markerSize + 16) / 2,
                        borderColor: colors.primary,
                        opacity: highlightAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0, 0.6],
                        }),
                        transform: [
                          {
                            scale: highlightAnim.interpolate({
                              inputRange: [0, 1],
                              outputRange: [0.8, 1.2],
                            }),
                          },
                        ],
                      },
                    ]}
                  />
                )}

                {/* Pulse Animation for Online Users */}
                {isOnline && pulseAnim && (
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
                )}

                {/* Avatar Circle */}
                <View
                  style={[
                    styles.avatarContainer,
                    {
                      width: markerSize,
                      height: markerSize,
                      borderRadius: markerSize / 2,
                      borderColor: isActive
                        ? colors.primary
                        : isOnline
                        ? colors.primary
                        : colors.border.default,
                      borderWidth: isActive ? 4 : isOnline ? 3 : 2,
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
              </Animated.View>
            </PointAnnotation>
          );
      })
      .filter((marker) => marker !== null) // Remove any null entries from invalid coordinates
    }
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
  highlightRing: {
    position: 'absolute',
    borderWidth: 3,
    backgroundColor: 'transparent',
  },
});

