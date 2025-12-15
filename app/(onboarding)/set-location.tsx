/**
 * Set Your Location Screen
 * Step 2 of profile setup - Location selection
 */

import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useTheme } from '@/lib/theme/ThemeProvider';
import MapView, { Marker } from 'react-native-maps';

const { width, height } = Dimensions.get('window');

export default function SetLocationScreen() {
  const { colors } = useTheme();
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [address, setAddress] = useState('Times Square NYC, Manhattan');
  const [region, setRegion] = useState({
    latitude: 40.7580,
    longitude: -73.9855,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });

  useEffect(() => {
    getCurrentLocation();
  }, []);

  const getCurrentLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      return;
    }

    const currentLocation = await Location.getCurrentPositionAsync({});
    const newRegion = {
      latitude: currentLocation.coords.latitude,
      longitude: currentLocation.coords.longitude,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    };
    setRegion(newRegion);
    setLocation({
      latitude: currentLocation.coords.latitude,
      longitude: currentLocation.coords.longitude,
    });

    // Reverse geocode to get address
    const reverseGeocode = await Location.reverseGeocodeAsync({
      latitude: currentLocation.coords.latitude,
      longitude: currentLocation.coords.longitude,
    });
    if (reverseGeocode.length > 0) {
      const addr = reverseGeocode[0];
      setAddress(`${addr.name || ''} ${addr.street || ''}, ${addr.city || ''}`.trim());
    }
  };

  const handleContinue = () => {
    // TODO: Save location data
    router.push('/(onboarding)/create-pin');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background.primary }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text.primary }]}>
          Set Your Location
        </Text>
        <View style={styles.placeholder} />
      </View>

      {/* Map */}
      {MapView ? (
        <View style={styles.mapContainer}>
          <MapView
            style={styles.map}
            region={region}
            onRegionChangeComplete={setRegion}
            onPress={(e: any) => {
              const newLocation = e.nativeEvent.coordinate;
              setLocation(newLocation);
              setRegion({
                ...region,
                latitude: newLocation.latitude,
                longitude: newLocation.longitude,
              });
            }}
          >
            {location && Marker && (
              <Marker
                coordinate={location}
                title="Your Location"
              >
                <View style={[styles.markerContainer, { backgroundColor: colors.primary }]}>
                  <Ionicons name="person" size={24} color="#FFFFFF" />
                </View>
              </Marker>
            )}
          </MapView>
        </View>
      ) : (
        <View style={[styles.mapContainer, { backgroundColor: colors.background.secondary, alignItems: 'center', justifyContent: 'center' }]}>
          <Ionicons name="map-outline" size={64} color={colors.text.muted} />
          <Text style={[styles.mapPlaceholder, { color: colors.text.muted }]}>
            Map will be displayed here
          </Text>
        </View>
      )}

      {/* Location Info */}
      <View style={[styles.locationInfo, { backgroundColor: colors.background.secondary, borderColor: colors.border.default }]}>
        <Ionicons name="location" size={20} color={colors.primary} />
        <Text style={[styles.locationText, { color: colors.text.primary }]} numberOfLines={1}>
          {address}
        </Text>
      </View>

      {/* Continue Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.continueButton, { backgroundColor: colors.primary }]}
          onPress={handleContinue}
        >
          <Text style={styles.continueButtonText}>Continue</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  placeholder: {
    width: 40,
  },
  mapContainer: {
    flex: 1,
    margin: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  map: {
    flex: 1,
  },
  markerContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 16,
    borderWidth: 1,
    gap: 12,
  },
  locationText: {
    flex: 1,
    fontSize: 16,
  },
  footer: {
    padding: 24,
    paddingBottom: 32,
  },
  continueButton: {
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  mapPlaceholder: {
    marginTop: 16,
    fontSize: 16,
  },
});

