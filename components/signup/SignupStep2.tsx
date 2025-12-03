/**
 * Signup Step 2 - Language Selection
 * Select languages to learn and teach
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/lib/theme/ThemeProvider';

interface Language {
  code: string;
  name: string;
  flag: string;
}

interface SignupStep2Props {
  onNext: (data: { learning: Language[]; teaching: Language & { level: string } }) => void;
  onBack: () => void;
}

const LANGUAGES: Language[] = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'nl', name: 'Dutch', flag: '🇳🇱' },
  { code: 'de', name: 'German', flag: '🇩🇪' },
  { code: 'fr', name: 'French', flag: '🇫🇷' },
  { code: 'es', name: 'Spanish', flag: '🇪🇸' },
  { code: 'it', name: 'Italian', flag: '🇮🇹' },
  { code: 'pt', name: 'Portuguese', flag: '🇵🇹' },
  { code: 'ja', name: 'Japanese', flag: '🇯🇵' },
  { code: 'ko', name: 'Korean', flag: '🇰🇷' },
  { code: 'zh', name: 'Chinese', flag: '🇨🇳' },
  { code: 'ar', name: 'Arabic', flag: '🇸🇦' },
  { code: 'ru', name: 'Russian', flag: '🇷🇺' },
];

const LEVELS = [
  { id: 'native', label: 'Native', color: '#F59E0B' },
  { id: 'advanced', label: 'Advanced (C1-C2)', color: '#3B82F6' },
  { id: 'intermediate', label: 'Intermediate (B1-B2)', color: '#10B981' },
  { id: 'beginner', label: 'Beginner (A1-A2)', color: '#6B7280' },
];

export function SignupStep2({ onNext, onBack }: SignupStep2Props) {
  const { colors } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [learningLanguages, setLearningLanguages] = useState<Language[]>([]);
  const [teachingLanguage, setTeachingLanguage] = useState<Language | null>(null);
  const [teachingLevel, setTeachingLevel] = useState('native');
  const [showTeachingPicker, setShowTeachingPicker] = useState(false);

  const filteredLanguages = LANGUAGES.filter((lang) =>
    lang.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleLearning = (lang: Language) => {
    if (learningLanguages.find((l) => l.code === lang.code)) {
      setLearningLanguages(learningLanguages.filter((l) => l.code !== lang.code));
    } else {
      setLearningLanguages([...learningLanguages, lang]);
    }
  };

  const canProceed = learningLanguages.length > 0 && teachingLanguage && teachingLevel;

  const handleSubmit = () => {
    if (canProceed && teachingLanguage) {
      onNext({
        learning: learningLanguages,
        teaching: { ...teachingLanguage, level: teachingLevel },
      });
    }
  };

  const renderLanguageItem = ({ item }: { item: Language }) => {
    const isSelected = learningLanguages.find((l) => l.code === item.code);
    return (
      <TouchableOpacity
        onPress={() => toggleLearning(item)}
        style={[
          styles.languageItem,
          { borderBottomColor: colors.border.default },
        ]}
      >
        <View style={styles.languageInfo}>
          <Text style={styles.flag}>{item.flag}</Text>
          <Text style={[styles.languageName, { color: colors.text.primary }]}>
            {item.name}
          </Text>
        </View>
        <View
          style={[
            styles.checkbox,
            isSelected
              ? { backgroundColor: colors.primary }
              : { borderColor: colors.border.default, borderWidth: 2 },
          ]}
        >
          {isSelected && <Ionicons name="checkmark" size={16} color="#FFFFFF" />}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background.primary }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.headerButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={[styles.stepIndicator, { color: colors.text.muted }]}>2/4</Text>
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
          Your Languages 🌍
        </Text>
        <Text style={[styles.subtitle, { color: colors.text.muted }]}>
          What brings you here?
        </Text>

        {/* I want to learn */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>
            I want to learn
          </Text>

          {/* Search */}
          <View
            style={[
              styles.searchContainer,
              {
                backgroundColor: colors.background.secondary,
                borderColor: colors.border.default,
              },
            ]}
          >
            <Ionicons name="search" size={20} color={colors.text.muted} />
            <TextInput
              style={[styles.searchInput, { color: colors.text.primary }]}
              placeholder="Search languages..."
              placeholderTextColor={colors.text.muted}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          {/* Language List */}
          <View
            style={[
              styles.languageList,
              {
                backgroundColor: colors.background.secondary,
                borderColor: colors.border.default,
              },
            ]}
          >
            <FlatList
              data={filteredLanguages}
              renderItem={renderLanguageItem}
              keyExtractor={(item) => item.code}
              scrollEnabled={false}
            />
          </View>
        </View>

        {/* I can teach */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>
            I can teach
          </Text>

          <View
            style={[
              styles.teachingCard,
              {
                backgroundColor: colors.background.secondary,
                borderColor: colors.border.default,
              },
            ]}
          >
            {/* Language Picker */}
            <View style={styles.pickerSection}>
              <Text style={[styles.pickerLabel, { color: colors.text.muted }]}>
                Language
              </Text>
              <TouchableOpacity
                onPress={() => setShowTeachingPicker(!showTeachingPicker)}
                style={[
                  styles.pickerButton,
                  {
                    backgroundColor: colors.background.primary,
                    borderColor: colors.border.default,
                  },
                ]}
              >
                <Text style={[styles.pickerText, { color: colors.text.primary }]}>
                  {teachingLanguage
                    ? `${teachingLanguage.flag} ${teachingLanguage.name}`
                    : 'Select language...'}
                </Text>
                <Ionicons
                  name={showTeachingPicker ? 'chevron-up' : 'chevron-down'}
                  size={20}
                  color={colors.text.muted}
                />
              </TouchableOpacity>

              {showTeachingPicker && (
                <View
                  style={[
                    styles.pickerDropdown,
                    {
                      backgroundColor: colors.background.primary,
                      borderColor: colors.border.default,
                    },
                  ]}
                >
                  {LANGUAGES.map((lang) => (
                    <TouchableOpacity
                      key={lang.code}
                      onPress={() => {
                        setTeachingLanguage(lang);
                        setShowTeachingPicker(false);
                      }}
                      style={[
                        styles.pickerOption,
                        { borderBottomColor: colors.border.default },
                      ]}
                    >
                      <Text style={styles.flag}>{lang.flag}</Text>
                      <Text style={[styles.pickerOptionText, { color: colors.text.primary }]}>
                        {lang.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            {/* Level Selection */}
            {teachingLanguage && (
              <View style={styles.levelSection}>
                <Text style={[styles.pickerLabel, { color: colors.text.muted }]}>
                  Level
                </Text>
                {LEVELS.map((level) => (
                  <TouchableOpacity
                    key={level.id}
                    onPress={() => setTeachingLevel(level.id)}
                    style={[
                      styles.levelOption,
                      {
                        backgroundColor: colors.background.primary,
                        borderColor:
                          teachingLevel === level.id ? colors.primary : colors.border.default,
                        borderWidth: teachingLevel === level.id ? 2 : 1,
                      },
                    ]}
                  >
                    <Text style={[styles.levelText, { color: colors.text.primary }]}>
                      {level.label}
                    </Text>
                    {teachingLevel === level.id && (
                      <Ionicons name="checkmark" size={20} color={colors.primary} />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        </View>

        {/* Selected Summary */}
        {(learningLanguages.length > 0 || teachingLanguage) && (
          <View
            style={[
              styles.summaryCard,
              {
                backgroundColor: colors.background.secondary,
                borderColor: colors.border.default,
              },
            ]}
          >
            <Text style={[styles.summaryLabel, { color: colors.text.muted }]}>
              Selected:
            </Text>
            <View style={styles.summaryTags}>
              {learningLanguages.map((lang) => (
                <View
                  key={lang.code}
                  style={[
                    styles.tag,
                    {
                      backgroundColor: colors.background.primary,
                      borderColor: colors.border.default,
                    },
                  ]}
                >
                  <Text style={styles.tagFlag}>{lang.flag}</Text>
                  <Text style={[styles.tagText, { color: colors.text.primary }]}>
                    Learning {lang.name}
                  </Text>
                </View>
              ))}
              {teachingLanguage && (
                <View style={[styles.tag, { backgroundColor: colors.primary }]}>
                  <Text style={styles.tagFlag}>{teachingLanguage.flag}</Text>
                  <Text style={[styles.tagText, { color: '#FFFFFF' }]}>
                    Teaching {teachingLanguage.name}
                  </Text>
                </View>
              )}
            </View>
          </View>
        )}

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
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  languageList: {
    borderRadius: 12,
    borderWidth: 1,
    maxHeight: 256,
    overflow: 'hidden',
  },
  languageItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  languageInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  flag: {
    fontSize: 24,
  },
  languageName: {
    fontSize: 16,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  teachingCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
  },
  pickerSection: {
    marginBottom: 16,
  },
  pickerLabel: {
    fontSize: 14,
    marginBottom: 8,
  },
  pickerButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  pickerText: {
    fontSize: 16,
  },
  pickerDropdown: {
    marginTop: 8,
    borderRadius: 8,
    borderWidth: 1,
    maxHeight: 200,
    overflow: 'hidden',
  },
  pickerOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    gap: 12,
  },
  pickerOptionText: {
    fontSize: 16,
  },
  levelSection: {
    gap: 8,
  },
  levelOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
  },
  levelText: {
    fontSize: 16,
  },
  summaryCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    marginBottom: 24,
  },
  summaryLabel: {
    fontSize: 14,
    marginBottom: 8,
  },
  summaryTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    gap: 6,
  },
  tagFlag: {
    fontSize: 14,
  },
  tagText: {
    fontSize: 14,
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

