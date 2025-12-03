/**
 * Availability Bottom Sheet Component
 * Bottom sheet for setting availability with status, duration, preferences, and location
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  Animated,
  Dimensions,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/lib/theme/ThemeProvider';
import * as Location from 'expo-location';

// ============================================================================
// TYPES
// ============================================================================

export interface AvailabilityBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  currentStatus: 'available' | 'soon' | 'busy' | 'offline';
  onStatusChange: (
    status: 'available' | 'soon' | 'busy' | 'offline',
    duration: number,
    preferences: string[],
    location?: { latitude: number; longitude: number; address?: string }
  ) => void;
}

interface StatusOption {
  id: 'available' | 'soon' | 'busy' | 'offline';
  emoji: string;
  title: string;
  subtitle: string;
  color: string;
}

interface DurationOption {
  id: string;
  label: string;
  minutes: number;
}

interface PreferenceOption {
  id: string;
  label: string;
  emoji: string;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function AvailabilityBottomSheet({
  isOpen,
  onClose,
  currentStatus,
  onStatusChange,
}: AvailabilityBottomSheetProps) {
  const { colors } = useTheme();
  const [selectedStatus, setSelectedStatus] = useState(currentStatus);
  const [selectedDuration, setSelectedDuration] = useState('1h');
  const [selectedPreferences, setSelectedPreferences] = useState<string[]>(['in-person', 'video']);
  const [locationType, setLocationType] = useState<'current' | 'custom' | 'none'>('current');
  const [currentLocation, setCurrentLocation] = useState<{ latitude: number; longitude: number; address?: string } | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const slideAnim = useRef(new Animated.Value(Dimensions.get('window').height)).current;

  const statuses: StatusOption[] = [
    {
      id: 'available',
      emoji: '🟢',
      title: 'Available',
      subtitle: 'Right now!',
      color: '#10B981',
    },
    {
      id: 'soon',
      emoji: '🟡',
      title: 'Available Soon',
      subtitle: 'Soon (1-2h)',
      color: '#F59E0B',
    },
    {
      id: 'busy',
      emoji: '🔴',
      title: 'Busy',
      subtitle: 'Not now',
      color: '#EF4444',
    },
    {
      id: 'offline',
      emoji: '⚫',
      title: 'Offline',
      subtitle: 'Invisible',
      color: '#6B7280',
    },
  ];

  const durations: DurationOption[] = [
    { id: '30m', label: '30m', minutes: 30 },
    { id: '1h', label: '1h', minutes: 60 },
    { id: '2h', label: '2h', minutes: 120 },
    { id: 'all-day', label: 'All day', minutes: 1440 },
  ];

  const preferences: PreferenceOption[] = [
    { id: 'in-person', label: 'In person', emoji: '☕' },
    { id: 'video', label: 'Video', emoji: '📹' },
    { id: 'voice', label: 'Call', emoji: '📞' },
    { id: 'chat', label: 'Chat only', emoji: '💬' },
  ];

  // Get current location
  const handleGetCurrentLocation = async () => {
    setIsLoadingLocation(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Denied',
          'Location permission is required to use your current location.'
        );
        setLocationType('none');
        setIsLoadingLocation(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      // Reverse geocode to get address
      let address: string | undefined;
      try {
        const [result] = await Location.reverseGeocodeAsync({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });
        if (result) {
          const parts = [];
          if (result.street) parts.push(result.street);
          if (result.city) parts.push(result.city);
          if (result.country) parts.push(result.country);
          address = parts.join(', ') || undefined;
        }
      } catch (error) {
        // Address lookup failed, continue without it
      }

      setCurrentLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        address,
      });
    } catch (error) {
      console.error('Error getting location:', error);
      setLocationType('none');
    } finally {
      setIsLoadingLocation(false);
    }
  };

  // Animate bottom sheet
  useEffect(() => {
    if (isOpen) {
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 65,
        friction: 11,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: Dimensions.get('window').height,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
  }, [isOpen, slideAnim]);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      // If current status is offline, default to 'available' when opening
      // Otherwise, use the current status
      setSelectedStatus(currentStatus === 'offline' ? 'available' : currentStatus);
      setSelectedDuration('1h');
      setSelectedPreferences(['in-person', 'video']);
      setLocationType('current');
      setCurrentLocation(null); // Reset location
      // Get current location when opening
      handleGetCurrentLocation();
    }
  }, [isOpen, currentStatus]);

  const togglePreference = (prefId: string) => {
    if (selectedPreferences.includes(prefId)) {
      setSelectedPreferences(selectedPreferences.filter((p) => p !== prefId));
    } else {
      setSelectedPreferences([...selectedPreferences, prefId]);
    }
  };

  const handleSave = () => {
    const duration = durations.find((d) => d.id === selectedDuration)?.minutes || 60;
    const location = locationType === 'current' && currentLocation ? currentLocation : undefined;
    onStatusChange(selectedStatus, duration, selectedPreferences, location);
    onClose();
  };

  const getStatusColor = (statusId: string) => {
    const status = statuses.find((s) => s.id === statusId);
    return status?.color || colors.primary;
  };

  if (!isOpen) return null;

  return (
    <Modal
      visible={isOpen}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        {/* Backdrop */}
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={onClose}
        />

        {/* Bottom Sheet */}
        <Animated.View
          style={[
            styles.bottomSheet,
            {
              backgroundColor: colors.background.secondary,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <SafeAreaView edges={['bottom']} style={styles.safeArea}>
            {/* Handle Bar */}
            <View style={styles.handleContainer}>
              <View style={[styles.handle, { backgroundColor: colors.border.default }]} />
            </View>

            <ScrollView
              style={styles.content}
              showsVerticalScrollIndicator={false}
              bounces={false}
            >
              {/* Header */}
              <View style={styles.header}>
                <Text style={[styles.title, { color: colors.text.primary }]}>
                  Set Availability
                </Text>
                <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                  <Ionicons name="close" size={24} color={colors.text.muted} />
                </TouchableOpacity>
              </View>

              <Text style={[styles.subtitle, { color: colors.text.muted }]}>
                Right now I'm...
              </Text>

              {/* Status Selection */}
              <View style={styles.statusContainer}>
                {statuses.map((status) => {
                  const isSelected = selectedStatus === status.id;
                  return (
                    <TouchableOpacity
                      key={status.id}
                      onPress={() => setSelectedStatus(status.id)}
                      style={[
                        styles.statusOption,
                        {
                          backgroundColor: isSelected
                            ? `${status.color}20`
                            : colors.background.primary,
                          borderColor: isSelected ? status.color : colors.border.default,
                          borderWidth: isSelected ? 2 : 1,
                        },
                      ]}
                    >
                      <Text style={styles.statusEmoji}>{status.emoji}</Text>
                      <View style={styles.statusTextContainer}>
                        <Text style={[styles.statusTitle, { color: colors.text.primary }]}>
                          {status.title}
                        </Text>
                        <Text style={[styles.statusSubtitle, { color: colors.text.muted }]}>
                          {status.subtitle}
                        </Text>
                      </View>
                      {isSelected && (
                        <Ionicons name="checkmark-circle" size={24} color={status.color} />
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Duration Selection (only for available/soon) */}
              {(selectedStatus === 'available' || selectedStatus === 'soon') && (
                <>
                  <View style={styles.divider} />
                  <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>
                    Quick time limit:
                  </Text>
                  <View style={styles.durationContainer}>
                    {durations.map((duration) => {
                      const isSelected = selectedDuration === duration.id;
                      return (
                        <TouchableOpacity
                          key={duration.id}
                          onPress={() => setSelectedDuration(duration.id)}
                          style={[
                            styles.durationButton,
                            {
                              backgroundColor: isSelected
                                ? colors.primary
                                : colors.background.primary,
                              borderColor: isSelected
                                ? colors.primary
                                : colors.border.default,
                            },
                          ]}
                        >
                          <Text
                            style={[
                              styles.durationText,
                              {
                                color: isSelected ? '#FFFFFF' : colors.text.muted,
                              },
                            ]}
                          >
                            {duration.label}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </>
              )}

              {/* Location Selection (only for available/soon) */}
              {(selectedStatus === 'available' || selectedStatus === 'soon') && (
                <>
                  <View style={styles.divider} />
                  <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>
                    Location:
                  </Text>
                  <View style={styles.locationContainer}>
                    {/* Use Current Location */}
                    <TouchableOpacity
                      onPress={() => {
                        setLocationType('current');
                        handleGetCurrentLocation();
                      }}
                      style={[
                        styles.locationOption,
                        {
                          backgroundColor:
                            locationType === 'current'
                              ? `${colors.primary}20`
                              : colors.background.primary,
                          borderColor:
                            locationType === 'current' ? colors.primary : colors.border.default,
                          borderWidth: locationType === 'current' ? 2 : 1,
                        },
                      ]}
                    >
                      <Ionicons
                        name="locate"
                        size={20}
                        color={locationType === 'current' ? colors.primary : colors.text.muted}
                      />
                      <View style={styles.locationTextContainer}>
                        <Text style={[styles.locationTitle, { color: colors.text.primary }]}>
                          Use my current location
                        </Text>
                        {isLoadingLocation ? (
                          <Text style={[styles.locationSubtitle, { color: colors.text.muted }]}>
                            Getting location...
                          </Text>
                        ) : currentLocation?.address ? (
                          <Text
                            style={[styles.locationSubtitle, { color: colors.text.muted }]}
                            numberOfLines={1}
                          >
                            {currentLocation.address}
                          </Text>
                        ) : currentLocation ? (
                          <Text style={[styles.locationSubtitle, { color: colors.text.muted }]}>
                            {currentLocation.latitude.toFixed(4)}, {currentLocation.longitude.toFixed(4)}
                          </Text>
                        ) : (
                          <Text style={[styles.locationSubtitle, { color: colors.text.muted }]}>
                            Tap to get location
                          </Text>
                        )}
                      </View>
                      {locationType === 'current' && (
                        <Ionicons name="checkmark-circle" size={20} color={colors.primary} />
                      )}
                    </TouchableOpacity>

                    {/* Choose Location */}
                    <TouchableOpacity
                      onPress={() => setLocationType('custom')}
                      style={[
                        styles.locationOption,
                        {
                          backgroundColor:
                            locationType === 'custom'
                              ? `${colors.primary}20`
                              : colors.background.primary,
                          borderColor:
                            locationType === 'custom' ? colors.primary : colors.border.default,
                          borderWidth: locationType === 'custom' ? 2 : 1,
                        },
                      ]}
                    >
                      <Ionicons
                        name="map-outline"
                        size={20}
                        color={locationType === 'custom' ? colors.primary : colors.text.muted}
                      />
                      <View style={styles.locationTextContainer}>
                        <Text style={[styles.locationTitle, { color: colors.text.primary }]}>
                          Choose location
                        </Text>
                        <Text style={[styles.locationSubtitle, { color: colors.text.muted }]}>
                          Select on map
                        </Text>
                      </View>
                      {locationType === 'custom' && (
                        <Ionicons name="checkmark-circle" size={20} color={colors.primary} />
                      )}
                    </TouchableOpacity>

                    {/* No Location */}
                    <TouchableOpacity
                      onPress={() => setLocationType('none')}
                      style={[
                        styles.locationOption,
                        {
                          backgroundColor:
                            locationType === 'none'
                              ? `${colors.primary}20`
                              : colors.background.primary,
                          borderColor:
                            locationType === 'none' ? colors.primary : colors.border.default,
                          borderWidth: locationType === 'none' ? 2 : 1,
                        },
                      ]}
                    >
                      <Ionicons
                        name="location-outline"
                        size={20}
                        color={locationType === 'none' ? colors.primary : colors.text.muted}
                      />
                      <View style={styles.locationTextContainer}>
                        <Text style={[styles.locationTitle, { color: colors.text.primary }]}>
                          Don't share location
                        </Text>
                        <Text style={[styles.locationSubtitle, { color: colors.text.muted }]}>
                          Hide my location
                        </Text>
                      </View>
                      {locationType === 'none' && (
                        <Ionicons name="checkmark-circle" size={20} color={colors.primary} />
                      )}
                    </TouchableOpacity>
                  </View>
                </>
              )}

              {/* Preferences (only for available/soon) */}
              {(selectedStatus === 'available' || selectedStatus === 'soon') && (
                <>
                  <View style={styles.divider} />
                  <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>
                    Preferred meeting:
                  </Text>
                  <View style={styles.preferencesContainer}>
                    {preferences.map((pref) => {
                      const isSelected = selectedPreferences.includes(pref.id);
                      return (
                        <TouchableOpacity
                          key={pref.id}
                          onPress={() => togglePreference(pref.id)}
                          style={[
                            styles.preferenceButton,
                            {
                              backgroundColor: isSelected
                                ? colors.primary
                                : colors.background.primary,
                              borderColor: isSelected ? colors.primary : colors.border.default,
                            },
                          ]}
                        >
                          <Text style={styles.preferenceEmoji}>{pref.emoji}</Text>
                          <Text
                            style={[
                              styles.preferenceText,
                              {
                                color: isSelected ? '#FFFFFF' : colors.text.muted,
                              },
                            ]}
                          >
                            {pref.label}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </>
              )}

              {/* Action Buttons */}
              <View style={styles.actionsContainer}>
                <TouchableOpacity
                  style={[styles.saveButton, { backgroundColor: colors.primary }]}
                  onPress={handleSave}
                >
                  <Text style={styles.saveButtonText}>Set Availability</Text>
                </TouchableOpacity>

                <View style={styles.cancelRow}>
                  <TouchableOpacity onPress={onClose}>
                    <Text style={[styles.cancelText, { color: colors.primary }]}>
                      Set Schedule
                    </Text>
                  </TouchableOpacity>
                  <Text style={[styles.cancelText, { color: colors.text.muted }]}> • </Text>
                  <TouchableOpacity onPress={onClose}>
                    <Text style={[styles.cancelText, { color: colors.text.muted }]}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>
          </SafeAreaView>
        </Animated.View>
      </View>
    </Modal>
  );
}

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  bottomSheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
  },
  safeArea: {
    flex: 1,
  },
  handleContainer: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  handle: {
    width: 48,
    height: 4,
    borderRadius: 2,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 4,
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 16,
  },
  statusContainer: {
    gap: 12,
    marginBottom: 16,
  },
  statusOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  statusEmoji: {
    fontSize: 24,
  },
  statusTextContainer: {
    flex: 1,
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  statusSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: '#2A2A2A',
    marginVertical: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
  },
  durationContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  durationButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
  },
  durationText: {
    fontSize: 14,
    fontWeight: '500',
  },
  locationContainer: {
    gap: 12,
    marginBottom: 16,
  },
  locationOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
  },
  locationTextContainer: {
    flex: 1,
  },
  locationTitle: {
    fontSize: 14,
    fontWeight: '500',
  },
  locationSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  preferencesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  preferenceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    gap: 6,
  },
  preferenceEmoji: {
    fontSize: 16,
  },
  preferenceText: {
    fontSize: 14,
    fontWeight: '500',
  },
  actionsContainer: {
    marginTop: 8,
    marginBottom: 20,
  },
  saveButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
  },
  cancelText: {
    fontSize: 14,
    fontWeight: '500',
  },
});

