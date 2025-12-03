/**
 * Language Preferences Screen - React Native
 */

import { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Switch,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import { useTheme } from '@/lib/theme/ThemeProvider';

const proficiencyLevels = [
  'Beginner (A1-A2)',
  'Intermediate (B1-B2)',
  'Advanced (C1-C2)',
  'Native',
];

export default function LanguagePreferencesScreen() {
  const { colors } = useTheme();
  const [showOnlyMyLanguages, setShowOnlyMyLanguages] = useState(false);
  const [showNearby, setShowNearby] = useState(true);
  const [maxDistance, setMaxDistance] = useState(10);
  const [selectedLevels, setSelectedLevels] = useState<string[]>(proficiencyLevels);

  const toggleLevel = (level: string) => {
    if (selectedLevels.includes(level)) {
      setSelectedLevels(selectedLevels.filter(l => l !== level));
    } else {
      setSelectedLevels([...selectedLevels, level]);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background.primary }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.background.secondary, borderColor: colors.border.default }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text.primary }]}>Language Preferences</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Discovery Settings */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text.muted }]}>DISCOVERY</Text>
          <View style={[styles.sectionContent, { backgroundColor: colors.background.secondary, borderColor: colors.border.default }]}>
            <View style={styles.settingRow}>
              <View style={[styles.iconContainer, { backgroundColor: `${colors.primary}20` }]}>
                <Ionicons name="globe" size={20} color={colors.primary} />
              </View>
              <View style={styles.settingContent}>
                <Text style={[styles.settingTitle, { color: colors.text.primary }]}>Only My Languages</Text>
                <Text style={[styles.settingSubtitle, { color: colors.text.muted }]}>Show partners for my languages only</Text>
              </View>
              <Switch
                value={showOnlyMyLanguages}
                onValueChange={setShowOnlyMyLanguages}
                trackColor={{ false: colors.border.default, true: colors.primary }}
                thumbColor="#FFFFFF"
              />
            </View>
            <View style={[styles.divider, { backgroundColor: colors.border.default }]} />
            <View style={styles.settingRow}>
              <View style={[styles.iconContainer, { backgroundColor: '#5FB3B320' }]}>
                <Ionicons name="location" size={20} color="#5FB3B3" />
              </View>
              <View style={styles.settingContent}>
                <Text style={[styles.settingTitle, { color: colors.text.primary }]}>Show Nearby First</Text>
                <Text style={[styles.settingSubtitle, { color: colors.text.muted }]}>Prioritize nearby partners</Text>
              </View>
              <Switch
                value={showNearby}
                onValueChange={setShowNearby}
                trackColor={{ false: colors.border.default, true: colors.primary }}
                thumbColor="#FFFFFF"
              />
            </View>
          </View>
        </View>

        {/* Distance Settings */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text.muted }]}>DISTANCE</Text>
          <View style={[styles.sectionContent, { backgroundColor: colors.background.secondary, borderColor: colors.border.default }]}>
            <View style={styles.distanceSection}>
              <View style={styles.distanceHeader}>
                <View style={[styles.iconContainer, { backgroundColor: '#E91E8C20' }]}>
                  <Ionicons name="people" size={20} color="#E91E8C" />
                </View>
                <View style={styles.settingContent}>
                  <Text style={[styles.settingTitle, { color: colors.text.primary }]}>Maximum Distance</Text>
                  <Text style={[styles.settingSubtitle, { color: colors.text.muted }]}>Show partners within {maxDistance}km</Text>
                </View>
              </View>
              <Slider
                style={styles.slider}
                minimumValue={1}
                maximumValue={50}
                step={1}
                value={maxDistance}
                onValueChange={setMaxDistance}
                minimumTrackTintColor={colors.primary}
                maximumTrackTintColor={colors.border.default}
                thumbTintColor={colors.primary}
              />
              <View style={styles.sliderLabels}>
                <Text style={[styles.sliderLabel, { color: colors.text.muted }]}>1km</Text>
                <Text style={[styles.sliderValue, { color: colors.primary }]}>{maxDistance}km</Text>
                <Text style={[styles.sliderLabel, { color: colors.text.muted }]}>50km</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Preferred Levels */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text.muted }]}>PREFERRED LEVELS</Text>
          <View style={[styles.sectionContent, { backgroundColor: colors.background.secondary, borderColor: colors.border.default }]}>
            <View style={styles.levelSection}>
              <Text style={[styles.levelHint, { color: colors.text.muted }]}>
                Select which levels you'd like to practice with:
              </Text>
              <View style={styles.levelsList}>
                {proficiencyLevels.map((level) => (
                  <TouchableOpacity
                    key={level}
                    style={[styles.levelItem, { backgroundColor: colors.background.primary }]}
                    onPress={() => toggleLevel(level)}
                  >
                    <View style={[
                      styles.checkbox,
                      { borderColor: colors.border.default },
                      selectedLevels.includes(level) && { backgroundColor: colors.primary, borderColor: colors.primary }
                    ]}>
                      {selectedLevels.includes(level) && (
                        <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                      )}
                    </View>
                    <Text style={[styles.levelText, { color: colors.text.primary }]}>{level}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        </View>
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  section: {
    padding: 16,
    paddingBottom: 0,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  sectionContent: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 15,
    fontWeight: '500',
  },
  settingSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  divider: {
    height: 1,
    marginLeft: 68,
  },
  distanceSection: {
    padding: 16,
  },
  distanceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sliderLabel: {
    fontSize: 12,
  },
  sliderValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  levelSection: {
    padding: 16,
  },
  levelHint: {
    fontSize: 14,
    marginBottom: 12,
  },
  levelsList: {
    gap: 8,
  },
  levelItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    gap: 12,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  levelText: {
    fontSize: 15,
  },
});

