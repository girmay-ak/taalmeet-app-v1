/**
 * Mapbox Map Component
 * Wrapper around @rnmapbox/maps MapView with user location and camera
 */

import React, { useRef, useImperativeHandle, forwardRef, useEffect } from 'react';
import { View, StyleSheet, Image, Text } from 'react-native';
import { Mapbox } from '@/services/mapbox';
import MapboxLib, { Camera, MapView, UserLocation, PointAnnotation } from '@rnmapbox/maps';
import { RadarPulse } from './RadarPulse';
import { initializeMapbox } from '@/utils/mapboxConfig';

// ============================================================================
// TYPES
// ============================================================================

export interface MapboxMapProps {
  /**
   * User location { latitude, longitude }
   */
  userLocation?: { latitude: number; longitude: number };
  /**
   * Array of users to display as markers
   */
  users?: Array<{
    id: string;
    name: string;
    latitude: number;
    longitude: number;
    image?: string;
  }>;
  /**
   * Callback when a user marker is pressed
   */
  onUserPress?: (user: any) => void;
  /**
   * Callback when user location updates
   */
  onUserLocationUpdate?: (location: { latitude: number; longitude: number }) => void;
  /**
   * Map style URL (default: Dark)
   */
  styleURL?: string;
  /**
   * Initial zoom level (default: 13)
   */
  zoomLevel?: number;
  /**
   * Show user location indicator
   */
  showUserLocation?: boolean;
  /**
   * Children components (e.g., custom markers)
   */
  children?: React.ReactNode;
}

export interface MapboxMapRef {
  centerOnPartner: (lat: number, lng: number) => void;
}

// ============================================================================
// COMPONENT
// ============================================================================

export const MapboxMap = forwardRef<MapboxMapRef, MapboxMapProps>(({
  userLocation,
  users = [],
  onUserPress,
  onUserLocationUpdate,
  styleURL = 'mapbox://styles/mapbox/dark-v11',
  zoomLevel = 13,
  showUserLocation = true,
  children,
}, ref) => {
  const cameraRef = useRef<Camera>(null);

  // Ensure Mapbox is initialized before rendering
  useEffect(() => {
    if (Mapbox && typeof Mapbox.setAccessToken === 'function') {
      const initialized = initializeMapbox();
      if (!initialized) {
        console.warn('[MapboxMap] Failed to initialize Mapbox. Map may not load correctly.');
      }
    }
  }, []);

  // Expose method to center on partner
  useImperativeHandle(ref, () => ({
    centerOnPartner: (lat: number, lng: number) => {
      if (cameraRef.current) {
        cameraRef.current.setCamera({
          centerCoordinate: [lng, lat],
          zoomLevel: 14,
          animationDuration: 500,
        });
      }
    },
  }));

  // Default location (The Hague)
  const defaultLocation = [4.3007, 52.0705];

  // Validate userLocation coordinates
  const isValidLocation = userLocation &&
    typeof userLocation.latitude === 'number' &&
    typeof userLocation.longitude === 'number' &&
    !isNaN(userLocation.latitude) &&
    !isNaN(userLocation.longitude) &&
    isFinite(userLocation.latitude) &&
    isFinite(userLocation.longitude);

  // Determine center coordinates
  const centerCoordinate = isValidLocation
    ? [userLocation.longitude, userLocation.latitude]
    : defaultLocation;

  // Initial camera settings
  const initialCamera = {
    centerCoordinate: centerCoordinate as [number, number],
    zoomLevel,
    animationDuration: 1000,
  };

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        styleURL={styleURL}
        zoomEnabled={true}
        scrollEnabled={true}
        pitchEnabled={true}
        rotateEnabled={false}
        logoEnabled={false}
        attributionEnabled={true}
        attributionPosition={{ bottom: 8, right: 8 }}
      >
        {/* Camera - Controls map view */}
        <Camera
          ref={cameraRef}
          defaultSettings={initialCamera}
          centerCoordinate={
            isValidLocation
              ? ([userLocation.longitude, userLocation.latitude] as [number, number])
              : undefined
          }
        />

        {/* User Location Indicator */}
        {showUserLocation && (
          <UserLocation
            visible={true}
            showsUserHeadingIndicator={true}
            androidRenderMode="normal"
            onUpdate={(location) => {
              if (location.coords && onUserLocationUpdate) {
                onUserLocationUpdate({
                  latitude: location.coords.latitude,
                  longitude: location.coords.longitude,
                });
              }
            }}
          />
        )}

        {/* Current user location marker with radar pulse (if userLocation provided) */}
        {isValidLocation && userLocation && (
          <>
            {/* Radar pulse */}
            <PointAnnotation
              id="current-user-radar"
              coordinate={[userLocation.longitude, userLocation.latitude]}
              anchor={{ x: 0.5, y: 0.5 }}
            >
              <View style={styles.radarContainer}>
                <RadarPulse size={120} color="#ffd93d" rings={3} />
              </View>
            </PointAnnotation>
            {/* User location marker */}
            <PointAnnotation
              id="current-user"
              coordinate={[userLocation.longitude, userLocation.latitude]}
            >
              <View style={styles.currentUserMarker}>
                <View style={styles.currentUserDot} />
              </View>
            </PointAnnotation>
          </>
        )}

        {/* Other users (if provided via users prop) */}
        {users.map((user) => (
          <PointAnnotation
            key={user.id}
            id={`user-${user.id}`}
            coordinate={[user.longitude, user.latitude]}
            onSelected={() => onUserPress?.(user)}
          >
            <View style={styles.userMarker}>
              {user.image ? (
                <Image source={{ uri: user.image }} style={styles.avatar} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Text style={styles.avatarInitial}>
                    {user.name[0].toUpperCase()}
                  </Text>
                </View>
              )}
              <View style={styles.flagBadge}>
                <Text>🇬🇧</Text>
              </View>
            </View>
          </PointAnnotation>
        ))}

        {/* Custom children (e.g., NearbyUserMarkers) */}
        {children}
      </MapView>
    </View>
  );
});

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  currentUserMarker: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#ffd93d',
    borderWidth: 3,
    borderColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  currentUserDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#ffffff',
  },
  radarContainer: {
    width: 120,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userMarker: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 3,
    borderColor: '#ffffff',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    position: 'relative',
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  avatarPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#6366f1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitial: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  flagBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: '#1e293b',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
