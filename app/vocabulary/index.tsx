/**
 * Vocabulary Builder Screen
 * Language learning tool for managing vocabulary
 */

import { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/lib/theme/ThemeProvider';
import { useVocabulary, useAddToVocabulary, useDeleteVocabulary, useUpdateVocabularyMastery } from '@/hooks/useTranslation';
import { useAuth } from '@/providers';
import { useSupportedLanguages } from '@/hooks/useTranslation';

export default function VocabularyScreen() {
  const { colors } = useTheme();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newWord, setNewWord] = useState('');
  const [newTranslation, setNewTranslation] = useState('');
  const [newSourceLang, setNewSourceLang] = useState('en');
  const [newTargetLang, setNewTargetLang] = useState('es');

  const { data: vocabulary = [], isLoading } = useVocabulary(user?.id, {
    source_language: selectedLanguage !== 'all' ? selectedLanguage : undefined,
  });
  const { data: supportedLanguages = [] } = useSupportedLanguages();
  const addToVocabularyMutation = useAddToVocabulary();
  const deleteVocabularyMutation = useDeleteVocabulary();
  const updateMasteryMutation = useUpdateVocabularyMastery();

  const filteredVocabulary = searchQuery
    ? vocabulary.filter(
        (v) =>
          v.word.toLowerCase().includes(searchQuery.toLowerCase()) ||
          v.translation.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : vocabulary;

  const handleAddWord = async () => {
    if (!newWord.trim() || !newTranslation.trim()) {
      Alert.alert('Error', 'Please enter both word and translation');
      return;
    }

    try {
      await addToVocabularyMutation.mutateAsync({
        word: newWord.trim(),
        translation: newTranslation.trim(),
        source_language: newSourceLang,
        target_language: newTargetLang,
      });

      setNewWord('');
      setNewTranslation('');
      setShowAddForm(false);
      Alert.alert('Success', 'Word added to vocabulary!');
    } catch (error) {
      // Error handled by hook
    }
  };

  const handleDeleteWord = (vocabId: string) => {
    Alert.alert('Delete Word', 'Are you sure you want to delete this word?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => deleteVocabularyMutation.mutate(vocabId),
      },
    ]);
  };

  const handleReviewWord = async (vocabId: string, isCorrect: boolean) => {
    await updateMasteryMutation.mutateAsync({ vocabularyId: vocabId, isCorrect });
  };

  const getMasteryColor = (mastery: number) => {
    if (mastery >= 80) return '#4FD1C5'; // Green
    if (mastery >= 50) return '#F59E0B'; // Yellow
    return '#EF4444'; // Red
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background.primary }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.background.secondary, borderColor: colors.border.default }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text.primary }]}>Vocabulary Builder</Text>
        <TouchableOpacity onPress={() => setShowAddForm(!showAddForm)}>
          <Ionicons name="add" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Search */}
        <View style={styles.section}>
          <View style={[styles.searchContainer, { backgroundColor: colors.background.secondary, borderColor: colors.border.default }]}>
            <Ionicons name="search" size={20} color={colors.text.muted} style={styles.searchIcon} />
            <TextInput
              style={[styles.searchInput, { color: colors.text.primary }]}
              placeholder="Search vocabulary..."
              placeholderTextColor={colors.text.muted}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>

        {/* Add Word Form */}
        {showAddForm && (
          <View style={[styles.addForm, { backgroundColor: colors.background.secondary, borderColor: colors.border.default }]}>
            <Text style={[styles.formTitle, { color: colors.text.primary }]}>Add New Word</Text>
            
            <View style={styles.formRow}>
              <View style={styles.formGroup}>
                <Text style={[styles.label, { color: colors.text.primary }]}>Word</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.background.primary, borderColor: colors.border.default, color: colors.text.primary }]}
                  placeholder="Enter word"
                  placeholderTextColor={colors.text.muted}
                  value={newWord}
                  onChangeText={setNewWord}
                />
              </View>
              <View style={styles.formGroup}>
                <Text style={[styles.label, { color: colors.text.primary }]}>Translation</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.background.primary, borderColor: colors.border.default, color: colors.text.primary }]}
                  placeholder="Enter translation"
                  placeholderTextColor={colors.text.muted}
                  value={newTranslation}
                  onChangeText={setNewTranslation}
                />
              </View>
            </View>

            <TouchableOpacity
              style={[styles.addButton, { backgroundColor: colors.primary }]}
              onPress={handleAddWord}
              disabled={addToVocabularyMutation.isPending}
            >
              {addToVocabularyMutation.isPending ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.addButtonText}>Add Word</Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* Vocabulary List */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text.muted }]}>
            MY VOCABULARY ({filteredVocabulary.length})
          </Text>

          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
          ) : filteredVocabulary.length === 0 ? (
            <View style={[styles.emptyState, { backgroundColor: colors.background.secondary, borderColor: colors.border.default }]}>
              <Ionicons name="book-outline" size={48} color={colors.text.muted} />
              <Text style={[styles.emptyStateText, { color: colors.text.muted }]}>
                {searchQuery ? 'No words found' : 'No vocabulary words yet. Start adding words!'}
              </Text>
            </View>
          ) : (
            <View style={styles.vocabularyList}>
              {filteredVocabulary.map((vocab) => (
                <View
                  key={vocab.id}
                  style={[styles.vocabCard, { backgroundColor: colors.background.secondary, borderColor: colors.border.default }]}
                >
                  <View style={styles.vocabHeader}>
                    <View style={styles.vocabMain}>
                      <Text style={[styles.vocabWord, { color: colors.text.primary }]}>{vocab.word}</Text>
                      <Text style={[styles.vocabTranslation, { color: colors.text.muted }]}>
                        {vocab.translation}
                      </Text>
                      {vocab.example_sentence && (
                        <Text style={[styles.vocabExample, { color: colors.text.muted }]}>
                          "{vocab.example_sentence}"
                        </Text>
                      )}
                    </View>
                    <TouchableOpacity onPress={() => handleDeleteWord(vocab.id)}>
                      <Ionicons name="trash-outline" size={20} color={colors.semantic.error} />
                    </TouchableOpacity>
                  </View>

                  <View style={styles.vocabFooter}>
                    <View style={styles.masteryContainer}>
                      <View style={[styles.masteryBar, { backgroundColor: colors.background.primary }]}>
                        <View
                          style={[
                            styles.masteryFill,
                            {
                              width: `${vocab.mastery_level}%`,
                              backgroundColor: getMasteryColor(vocab.mastery_level),
                            },
                          ]}
                        />
                      </View>
                      <Text style={[styles.masteryText, { color: colors.text.muted }]}>
                        {vocab.mastery_level}% mastery
                      </Text>
                    </View>

                    <View style={styles.reviewButtons}>
                      <TouchableOpacity
                        style={[styles.reviewButton, { backgroundColor: '#EF444420' }]}
                        onPress={() => handleReviewWord(vocab.id, false)}
                      >
                        <Ionicons name="close" size={16} color="#EF4444" />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.reviewButton, { backgroundColor: '#4FD1C520' }]}
                        onPress={() => handleReviewWord(vocab.id, true)}
                      >
                        <Ionicons name="checkmark" size={16} color="#4FD1C5" />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          )}
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
  },
  addForm: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
  },
  formTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  formRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  formGroup: {
    flex: 1,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  input: {
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
  },
  addButton: {
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  loadingContainer: {
    padding: 32,
    alignItems: 'center',
  },
  emptyState: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 32,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 14,
    marginTop: 12,
    textAlign: 'center',
  },
  vocabularyList: {
    gap: 12,
  },
  vocabCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
  },
  vocabHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  vocabMain: {
    flex: 1,
  },
  vocabWord: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  vocabTranslation: {
    fontSize: 14,
    marginBottom: 4,
  },
  vocabExample: {
    fontSize: 12,
    fontStyle: 'italic',
    marginTop: 4,
  },
  vocabFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  masteryContainer: {
    flex: 1,
    marginRight: 12,
  },
  masteryBar: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 4,
  },
  masteryFill: {
    height: '100%',
    borderRadius: 3,
  },
  masteryText: {
    fontSize: 11,
  },
  reviewButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  reviewButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

