/**
 * Location Header Card Component
 * Displays current location with change button (Figma design)
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/lib/theme/ThemeProvider';

export interface LocationHeaderCardProps {
  /**
   * Location display text (e.g., "New York, United States")
   */
  location: string;
  /**
   * Distance radius in km
   */
  radiusKm?: number;
  /**
   * Callback when change button is pressed
   */
  onChangePress?: () => void;
}

export function LocationHeaderCard({
  location,
  radiusKm = 10,
  onChangePress,
}: LocationHeaderCardProps) {
  return (
    <View style={styles.container}>
      <View style={styles.leftContent}>
        <View style={styles.labelRow}>
          <Ionicons name="location" size={16} color="#584CF4" />
          <Text style={styles.label}>
            Location (within {radiusKm} km)
          </Text>
        </View>
        <Text style={styles.locationText} numberOfLines={1}>
          {location}
        </Text>
      </View>

      <TouchableOpacity
        style={styles.changeButton}
        onPress={onChangePress}
        activeOpacity={0.8}
      >
        <Ionicons name="create" size={12} color="#FFFFFF" />
        <Text style={styles.changeButtonText}>Change</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 24,
    borderRadius: 24,
    marginHorizontal: 24,
    backgroundColor: '#FFFFFF',
    shadowColor: '#04060F',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 60,
    elevation: 4,
  },
  leftContent: {
    flex: 1,
    gap: 8,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    letterSpacing: 0.2,
    color: '#212121',
  },
  locationText: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.2,
    lineHeight: 22.4,
    color: '#212121',
  },
  changeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#584CF4',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 100,
    marginLeft: 12,
  },
  changeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: 0.2,
    lineHeight: 19.6,
  },
});

