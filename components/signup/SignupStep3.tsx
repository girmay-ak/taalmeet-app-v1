/**
 * Signup Step 3 - Location Setup
 * City and country selection with GPS option
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useTheme } from '@/lib/theme/ThemeProvider';

interface SignupStep3Props {
  onNext: (data: { city: string; country: string }) => void;
  onBack: () => void;
}

interface Country {
  code: string;
  name: string;
  flag: string;
}

const COUNTRIES: Country[] = [
  { code: 'NL', name: 'Netherlands', flag: '🇳🇱' },
  { code: 'BE', name: 'Belgium', flag: '🇧🇪' },
  { code: 'DE', name: 'Germany', flag: '🇩🇪' },
  { code: 'FR', name: 'France', flag: '🇫🇷' },
  { code: 'ES', name: 'Spain', flag: '🇪🇸' },
  { code: 'GB', name: 'United Kingdom', flag: '🇬🇧' },
  { code: 'US', name: 'United States', flag: '🇺🇸' },
  { code: 'IT', name: 'Italy', flag: '🇮🇹' },
];

export function SignupStep3({ onNext, onBack }: SignupStep3Props) {
  const { colors } = useTheme();
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('NL');
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);

  const selectedCountry = COUNTRIES.find((c) => c.code === country);
  const canProceed = city.trim() !== '' && country;

  const handleEnableGPS = async () => {
    setIsLoadingLocation(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Denied',
          'Please enable location services to auto-detect your location.'
        );
        setIsLoadingLocation(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const [address] = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      if (address) {
        if (address.city) setCity(address.city);
        const countryMatch = COUNTRIES.find((c) => c.code === address.isoCountryCode);
        if (countryMatch) setCountry(countryMatch.code);
      }
    } catch (error) {
      Alert.alert('Error', 'Could not get your location. Please enter manually.');
    } finally {
      setIsLoadingLocation(false);
    }
  };

  const handleSubmit = () => {
    if (canProceed) {
      onNext({
        city,
        country: selectedCountry?.name || 'Netherlands',
      });
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background.primary }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.headerButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={[styles.stepIndicator, { color: colors.text.muted }]}>3/4</Text>
        <TouchableOpacity onPress={onBack} style={styles.headerButton}>
          <Ionicons name="close" size={24} color={colors.text.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Title */}
        <Text style={[styles.title, { color: colors.text.primary }]}>
          Your Location 📍
        </Text>
        <Text style={[styles.subtitle, { color: colors.text.muted }]}>
          Find partners nearby
        </Text>

        {/* City Input */}
        <View style={styles.inputSection}>
          <Text style={[styles.label, { color: colors.text.primary }]}>City</Text>
          <View
            style={[
              styles.inputContainer,
              {
                backgroundColor: colors.background.secondary,
                borderColor: colors.border.default,
              },
            ]}
          >
            <Ionicons
              name="location-outline"
              size={20}
              color={colors.text.muted}
              style={styles.inputIcon}
            />
            <TextInput
              style={[styles.input, { color: colors.text.primary }]}
              placeholder="Den Haag"
              placeholderTextColor={colors.text.muted}
              value={city}
              onChangeText={setCity}
            />
          </View>
        </View>

        {/* Country Picker */}
        <View style={styles.inputSection}>
          <Text style={[styles.label, { color: colors.text.primary }]}>Country</Text>
          <TouchableOpacity
            onPress={() => setShowCountryPicker(!showCountryPicker)}
            style={[
              styles.inputContainer,
              {
                backgroundColor: colors.background.secondary,
                borderColor: colors.border.default,
              },
            ]}
          >
            <Ionicons
              name="globe-outline"
              size={20}
              color={colors.text.muted}
              style={styles.inputIcon}
            />
            <Text style={[styles.pickerText, { color: colors.text.primary }]}>
              {selectedCountry?.flag} {selectedCountry?.name}
            </Text>
            <Ionicons
              name={showCountryPicker ? 'chevron-up' : 'chevron-down'}
              size={20}
              color={colors.text.muted}
            />
          </TouchableOpacity>

          {showCountryPicker && (
            <View
              style={[
                styles.dropdown,
                {
                  backgroundColor: colors.background.secondary,
                  borderColor: colors.border.default,
                },
              ]}
            >
              {COUNTRIES.map((c) => (
                <TouchableOpacity
                  key={c.code}
                  onPress={() => {
                    setCountry(c.code);
                    setShowCountryPicker(false);
                  }}
                  style={[
                    styles.dropdownItem,
                    { borderBottomColor: colors.border.default },
                  ]}
                >
                  <Text style={styles.dropdownFlag}>{c.flag}</Text>
                  <Text style={[styles.dropdownText, { color: colors.text.primary }]}>
                    {c.name}
                  </Text>
                  {country === c.code && (
                    <Ionicons name="checkmark" size={20} color={colors.primary} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Map Preview */}
        <View
          style={[
            styles.mapPreview,
            {
              backgroundColor: colors.background.secondary,
              borderColor: colors.border.default,
            },
          ]}
        >
          <View style={[styles.mapPlaceholder, { backgroundColor: colors.background.primary }]}>
            {/* Grid Pattern */}
            <View style={styles.gridPattern} />
            {/* Pin */}
            <View style={styles.pinContainer}>
              <Ionicons name="location" size={32} color={colors.primary} />
              <View style={[styles.pingAnimation, { borderColor: colors.primary }]} />
            </View>
          </View>
          <Text style={[styles.mapText, { color: colors.text.muted }]}>
            Approximate location: {city || 'Select city'}, {selectedCountry?.flag}
          </Text>
        </View>

        {/* Enable GPS Button */}
        <TouchableOpacity
          onPress={handleEnableGPS}
          disabled={isLoadingLocation}
          style={[
            styles.gpsButton,
            { borderColor: colors.border.default },
          ]}
        >
          <Ionicons
            name={isLoadingLocation ? 'sync' : 'navigate'}
            size={20}
            color={colors.primary}
          />
          <Text style={[styles.gpsButtonText, { color: colors.text.primary }]}>
            {isLoadingLocation ? 'Getting Location...' : 'Enable GPS'}
          </Text>
        </TouchableOpacity>
        <Text style={[styles.gpsHint, { color: colors.text.muted }]}>
          Auto-detect location
        </Text>

        {/* Privacy Note */}
        <View
          style={[
            styles.privacyCard,
            {
              backgroundColor: colors.background.secondary,
              borderColor: colors.border.default,
            },
          ]}
        >
          <View style={[styles.privacyIcon, { backgroundColor: colors.background.primary }]}>
            <Text style={styles.privacyEmoji}>🛡️</Text>
          </View>
          <View style={styles.privacyContent}>
            <Text style={[styles.privacyTitle, { color: colors.text.primary }]}>
              Privacy Protected
            </Text>
            <Text style={[styles.privacyText, { color: colors.text.muted }]}>
              Your exact location is never shared. We only show approximate distance to partners.
            </Text>
          </View>
        </View>

        {/* Next Button */}
        <TouchableOpacity
          style={[
            styles.nextButton,
            { backgroundColor: colors.primary, opacity: canProceed ? 1 : 0.5 },
          ]}
          onPress={handleSubmit}
          disabled={!canProceed}
        >
          <Text style={styles.nextButtonText}>Next →</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  headerButton: {
    padding: 8,
  },
  stepIndicator: {
    fontSize: 14,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 24,
  },
  inputSection: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 16,
    height: 56,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
  },
  pickerText: {
    flex: 1,
    fontSize: 16,
  },
  dropdown: {
    marginTop: 8,
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    gap: 12,
  },
  dropdownFlag: {
    fontSize: 20,
  },
  dropdownText: {
    flex: 1,
    fontSize: 16,
  },
  mapPreview: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    marginBottom: 24,
  },
  mapPlaceholder: {
    height: 128,
    borderRadius: 8,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  gridPattern: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.2,
  },
  pinContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  pingAnimation: {
    position: 'absolute',
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    opacity: 0.3,
  },
  mapText: {
    fontSize: 14,
    textAlign: 'center',
  },
  gpsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
    borderRadius: 16,
    borderWidth: 1,
    gap: 8,
    marginBottom: 8,
  },
  gpsButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  gpsHint: {
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 24,
  },
  privacyCard: {
    flexDirection: 'row',
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    marginBottom: 24,
    gap: 12,
  },
  privacyIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  privacyEmoji: {
    fontSize: 20,
  },
  privacyContent: {
    flex: 1,
  },
  privacyTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  privacyText: {
    fontSize: 12,
    lineHeight: 18,
  },
  nextButton: {
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

