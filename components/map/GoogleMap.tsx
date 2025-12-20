/**
 * Google Maps Component
 * Fallback map implementation using react-native-maps
 */

import React, { useRef, useEffect, useMemo, useImperativeHandle, forwardRef } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE, Region } from 'react-native-maps';
import { GOOGLE_MAPS_API_KEY } from '@/lib/config';
import type { NearbyUser } from '@/services/locationService';
import { getLanguageFlag } from '@/utils/languageFlags';
import { GoogleMapPinMarker } from './GoogleMapPinMarker';
import { AnimatedMarkerWrapper } from './AnimatedMarkerWrapper';

// ============================================================================
// TYPES
// ============================================================================

export interface GoogleMapProps {
  /**
   * User location { latitude, longitude }
   */
  userLocation?: { latitude: number; longitude: number };
  /**
   * Array of nearby users to display as markers
   */
  users?: Array<{
    id: string;
    displayName: string;
    avatarUrl: string | null;
    lat: number;
    lng: number;
    languages: any[];
    isOnline?: boolean;
  }>;
  /**
   * ID of the currently active partner (for highlighting)
   */
  activePartnerId?: string | null;
  /**
   * Callback when a user marker is pressed
   */
  onUserPress?: (user: any) => void;
  /**
   * Callback when user location updates
   */
  onUserLocationUpdate?: (location: { latitude: number; longitude: number }) => void;
  /**
   * Initial zoom level (default: 13)
   */
  zoomLevel?: number;
  /**
   * Map type: standard, satellite, or hybrid
   */
  mapType?: 'standard' | 'satellite' | 'hybrid';
  /**
   * Currently selected user ID
   */
  selectedUserId?: string | null;
}

export interface GoogleMapRef {
  centerOnPartner: (lat: number, lng: number) => void;
}

// ============================================================================
// COMPONENT
// ============================================================================

export const GoogleMap = forwardRef<GoogleMapRef, GoogleMapProps>(({
  userLocation,
  users = [],
  activePartnerId,
  onUserPress,
  onUserLocationUpdate,
  zoomLevel = 13,
  mapType = 'standard',
  selectedUserId = null,
}: GoogleMapProps) {
  const mapRef = useRef<MapView>(null);

  // Expose method to center on partner
  useImperativeHandle(ref, () => ({
    centerOnPartner: (lat: number, lng: number) => {
      if (mapRef.current) {
        mapRef.current.animateToRegion(
          {
            latitude: lat,
            longitude: lng,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          },
          500
        );
      }
    },
  }));

  // Center on active partner
  useEffect(() => {
    if (activePartnerId && mapRef.current) {
      const activeUser = users.find(u => u.id === activePartnerId);
      if (activeUser && activeUser.lat && activeUser.lng) {
        mapRef.current.animateToRegion(
          {
            latitude: activeUser.lat,
            longitude: activeUser.lng,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          },
          500
        );
      }
    }
  }, [activePartnerId, users]);

  // Default location (The Hague)
  const defaultLocation = {
    latitude: 52.0705,
    longitude: 4.3007,
  };

  // Determine center coordinates
  const center = userLocation || defaultLocation;

  // Initial region
  const initialRegion: Region = {
    latitude: center.latitude,
    longitude: center.longitude,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  };

  // Update map region when user location changes
  useEffect(() => {
    if (userLocation && mapRef.current) {
      mapRef.current.animateToRegion(
        {
          latitude: userLocation.latitude,
          longitude: userLocation.longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        },
        1000
      );
    }
  }, [userLocation?.latitude, userLocation?.longitude]);

  // Get teaching language for marker
  const getTeachingLanguage = (user: any) => {
    const teachingLang = user.languages?.find((l: any) => l.role === 'teaching');
    return teachingLang ? getLanguageFlag(teachingLang.language) : '🌍';
  };

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={initialRegion}
        showsUserLocation={false}
        showsMyLocationButton={false}
        showsCompass={true}
        mapType={mapType}
        onUserLocationChange={(e) => {
          if (e.nativeEvent.coordinate && onUserLocationUpdate) {
            onUserLocationUpdate({
              latitude: e.nativeEvent.coordinate.latitude,
              longitude: e.nativeEvent.coordinate.longitude,
            });
          }
        }}
        customMapStyle={[
          {
            elementType: 'geometry',
            stylers: [{ color: '#1d2c4d' }],
          },
          {
            elementType: 'labels.text.fill',
            stylers: [{ color: '#8ec3b9' }],
          },
          {
            elementType: 'labels.text.stroke',
            stylers: [{ color: '#1a3646' }],
          },
          {
            featureType: 'administrative.country',
            elementType: 'geometry.stroke',
            stylers: [{ color: '#4b6878' }],
          },
          {
            featureType: 'water',
            elementType: 'geometry',
            stylers: [{ color: '#0e1626' }],
          },
          {
            featureType: 'water',
            elementType: 'labels.text.fill',
            stylers: [{ color: '#4e6d70' }],
          },
        ]}
      >
        {/* User markers - Pin style with flags and selection animations */}
        {users.map((user) => {
          const isOnline = user.isOnline ?? false;
          const teachingLang = getTeachingLanguage(user);
          
          // Determine border color based on status
          const borderColor = isOnline ? '#07BD74' : '#9E9E9E';
          
          const isSelected = selectedUserId === user.id;
          const isDimmed = selectedUserId !== null && selectedUserId !== user.id;

          return (
            <Marker
              key={user.id}
              coordinate={{
                latitude: user.lat,
                longitude: user.lng,
              }}
              onPress={() => onUserPress?.(user)}
              anchor={{ x: 0.5, y: 1 }}
              tracksViewChanges={false}
            >
              <AnimatedMarkerWrapper isSelected={isSelected} isDimmed={isDimmed}>
                <GoogleMapPinMarker
                  avatarUrl={user.avatarUrl}
                  size={56}
                  isOnline={isOnline}
                  borderColor={borderColor}
                  displayName={user.displayName}
                  languageFlag={teachingLang}
                />
              </AnimatedMarkerWrapper>
            </Marker>
            );
            });
        }, [users])}
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
  markerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  marker: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  avatarImage: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  avatarPlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitial: {
    fontSize: 18,
    fontWeight: 'bold',
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
    borderColor: '#1e293b',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  flagText: {
    fontSize: 12,
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#10B981',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
});

