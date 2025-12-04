/**
 * Discovery Filters Modal
 * Bottom sheet for filtering discovery feed
 */

import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
  Switch,
} from 'react-native';
import { Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/lib/theme/ThemeProvider';
import { useState, useEffect } from 'react';
import type { DiscoverFilters } from '@/services/discoverService';
import { useUpdateDiscoveryFilterPreferences, useDiscoveryFilterPreferences } from '@/hooks/useDiscoveryFilters';
import { useAuth } from '@/providers';

interface DiscoveryFiltersModalProps {
  visible: boolean;
  onClose: () => void;
  currentFilters: DiscoverFilters;
  onApplyFilters: (filters: DiscoverFilters) => void;
}

const distanceOptions = [10, 25, 50, 100, 200, 500];
const matchScoreOptions = [0, 20, 40, 60, 80, 100];

export function DiscoveryFiltersModal({
  visible,
  onClose,
  currentFilters,
  onApplyFilters,
}: DiscoveryFiltersModalProps) {
  const { colors } = useTheme();
  const { user } = useAuth();
  const { data: savedPreferences } = useDiscoveryFilterPreferences(user?.id);
  const updatePreferencesMutation = useUpdateDiscoveryFilterPreferences();

  const [filters, setFilters] = useState<DiscoverFilters>(currentFilters);
  const [savePreferences, setSavePreferences] = useState(false);

  useEffect(() => {
    if (visible) {
      setFilters(currentFilters);
      // Load saved preferences if available
      if (savedPreferences) {
        setFilters({
          maxDistance: savedPreferences.max_distance,
          gender: savedPreferences.gender_preference,
          availabilityOnly: savedPreferences.availability_filter,
          minMatchScore: savedPreferences.min_match_score,
          preferredLanguages: savedPreferences.preferred_languages || undefined,
        });
      }
    }
  }, [visible, currentFilters, savedPreferences]);

  const handleApply = () => {
    onApplyFilters(filters);
    
    // Save preferences if enabled
    if (savePreferences && user?.id) {
      updatePreferencesMutation.mutate({
        max_distance: filters.maxDistance || 50,
        gender_preference: filters.gender || 'all',
        availability_filter: filters.availabilityOnly || false,
        min_match_score: filters.minMatchScore || 0,
        preferred_languages: filters.preferredLanguages || null,
      });
    }
    
    onClose();
  };

  const handleReset = () => {
    setFilters({
      maxDistance: 50,
      gender: 'all',
      availabilityOnly: false,
      minMatchScore: 0,
    });
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.container, { backgroundColor: colors.background.primary }]}>
          {/* Header */}
          <View style={[styles.header, { borderBottomColor: colors.border.default }]}>
            <Text style={[styles.headerTitle, { color: colors.text.primary }]}>Filters</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={colors.text.primary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Distance Filter */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>Maximum Distance</Text>
              <Text style={[styles.sectionSubtitle, { color: colors.text.muted }]}>
                {filters.maxDistance || 50} km
              </Text>
              <View style={styles.optionsRow}>
                {distanceOptions.map((distance) => (
                  <TouchableOpacity
                    key={distance}
                    style={[
                      styles.optionChip,
                      {
                        backgroundColor:
                          (filters.maxDistance || 50) === distance
                            ? colors.primary
                            : colors.background.secondary,
                        borderColor: colors.border.default,
                      },
                    ]}
                    onPress={() => setFilters({ ...filters, maxDistance: distance })}
                  >
                    <Text
                      style={[
                        styles.optionChipText,
                        {
                          color:
                            (filters.maxDistance || 50) === distance
                              ? '#fff'
                              : colors.text.primary,
                        },
                      ]}
                    >
                      {distance} km
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Gender Filter */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>Gender</Text>
              <View style={styles.optionsRow}>
                {[
                  { value: 'all', label: 'All' },
                  { value: 'male', label: 'Male' },
                  { value: 'female', label: 'Female' },
                  { value: 'other', label: 'Other' },
                  { value: 'prefer_not_to_say', label: 'Prefer not to say' },
                ].map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.optionChip,
                      {
                        backgroundColor:
                          (filters.gender || 'all') === option.value
                            ? colors.primary
                            : colors.background.secondary,
                        borderColor: colors.border.default,
                      },
                    ]}
                    onPress={() =>
                      setFilters({
                        ...filters,
                        gender: option.value as DiscoverFilters['gender'],
                      })
                    }
                  >
                    <Text
                      style={[
                        styles.optionChipText,
                        {
                          color:
                            (filters.gender || 'all') === option.value
                              ? '#fff'
                              : colors.text.primary,
                        },
                      ]}
                    >
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Minimum Match Score */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>
                Minimum Match Score
              </Text>
              <Text style={[styles.sectionSubtitle, { color: colors.text.muted }]}>
                {filters.minMatchScore || 0}%
              </Text>
              <View style={styles.optionsRow}>
                {matchScoreOptions.map((score) => (
                  <TouchableOpacity
                    key={score}
                    style={[
                      styles.optionChip,
                      {
                        backgroundColor:
                          (filters.minMatchScore || 0) === score
                            ? colors.primary
                            : colors.background.secondary,
                        borderColor: colors.border.default,
                      },
                    ]}
                    onPress={() => setFilters({ ...filters, minMatchScore: score })}
                  >
                    <Text
                      style={[
                        styles.optionChipText,
                        {
                          color:
                            (filters.minMatchScore || 0) === score
                              ? '#fff'
                              : colors.text.primary,
                        },
                      ]}
                    >
                      {score}%
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Availability Filter */}
            <View style={[styles.section, styles.switchSection]}>
              <View style={styles.switchRow}>
                <View>
                  <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>
                    Available Only
                  </Text>
                  <Text style={[styles.sectionSubtitle, { color: colors.text.muted }]}>
                    Show only users who are currently available
                  </Text>
                </View>
                <Switch
                  value={filters.availabilityOnly || false}
                  onValueChange={(value) =>
                    setFilters({ ...filters, availabilityOnly: value })
                  }
                  trackColor={{ false: colors.border.default, true: colors.primary }}
                  thumbColor="#fff"
                />
              </View>
            </View>

            {/* Save Preferences */}
            <View style={[styles.section, styles.switchSection]}>
              <View style={styles.switchRow}>
                <View>
                  <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>
                    Save Preferences
                  </Text>
                  <Text style={[styles.sectionSubtitle, { color: colors.text.muted }]}>
                    Remember these filters for next time
                  </Text>
                </View>
                <Switch
                  value={savePreferences}
                  onValueChange={setSavePreferences}
                  trackColor={{ false: colors.border.default, true: colors.primary }}
                  thumbColor="#fff"
                />
              </View>
            </View>
          </ScrollView>

          {/* Footer */}
          <View style={[styles.footer, { borderTopColor: colors.border.default }]}>
            <TouchableOpacity
              style={[styles.resetButton, { borderColor: colors.border.default }]}
              onPress={handleReset}
            >
              <Text style={[styles.resetButtonText, { color: colors.text.primary }]}>Reset</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.applyButton, { backgroundColor: colors.primary }]}
              onPress={handleApply}
            >
              <Text style={styles.applyButtonText}>Apply Filters</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    maxHeight: '90%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    marginBottom: 12,
  },
  optionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  optionChipText: {
    fontSize: 14,
    fontWeight: '500',
  },
  switchSection: {
    marginBottom: 16,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footer: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    gap: 12,
  },
  resetButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  resetButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  applyButton: {
    flex: 2,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  applyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

