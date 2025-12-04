/**
 * Translation Button Component
 * Button to translate messages in chat
 */

import { useState } from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/lib/theme/ThemeProvider';
import { useTranslateText, useTranslationPreferences, useAddToVocabulary } from '@/hooks/useTranslation';
import { useAuth } from '@/providers';
import { Alert } from 'react-native';

interface TranslationButtonProps {
  messageId: string;
  text: string;
  sourceLanguage?: string;
  targetLanguage?: string;
  onTranslationComplete?: (translatedText: string) => void;
}

export function TranslationButton({
  messageId,
  text,
  sourceLanguage,
  targetLanguage,
  onTranslationComplete,
}: TranslationButtonProps) {
  const { colors } = useTheme();
  const { user } = useAuth();
  const [translatedText, setTranslatedText] = useState<string | null>(null);
  const [showTranslation, setShowTranslation] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);

  const { data: preferences } = useTranslationPreferences(user?.id);
  const translateMutation = useTranslateText();

  // Get target language from preferences or use provided
  const finalTargetLanguage = targetLanguage || preferences?.default_target_language || 'en';

  const handleTranslate = async () => {
    if (translatedText) {
      // Toggle between original and translation
      setShowTranslation(!showTranslation);
      return;
    }

    setIsTranslating(true);
    try {
      const result = await translateMutation.mutateAsync({
        text,
        targetLanguage: finalTargetLanguage,
        sourceLanguage,
        saveToHistory: true,
        context: 'chat_message',
        messageId,
      });

      setTranslatedText(result.translatedText);
      setShowTranslation(true);
      onTranslationComplete?.(result.translatedText);
    } catch (error) {
      console.error('Translation failed:', error);
    } finally {
      setIsTranslating(false);
    }
  };

  return (
    <TouchableOpacity
      style={[styles.button, { backgroundColor: colors.background.primary }]}
      onPress={handleTranslate}
      disabled={isTranslating}
    >
      {isTranslating ? (
        <ActivityIndicator size="small" color={colors.primary} />
      ) : (
        <>
          <Ionicons
            name={showTranslation ? 'eye-off-outline' : 'language'}
            size={14}
            color={colors.text.muted}
          />
          <Text style={[styles.buttonText, { color: colors.text.muted }]}>
            {showTranslation ? 'Original' : 'Translate'}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
}

/**
 * Message Translation Display
 * Shows original and translated text
 */
interface MessageTranslationProps {
  originalText: string;
  translatedText: string | null;
  showTranslation: boolean;
  onToggle: () => void;
  isTranslating: boolean;
  sourceLanguage?: string;
  targetLanguage?: string;
}

export function MessageTranslation({
  originalText,
  translatedText,
  showTranslation,
  onToggle,
  isTranslating,
  sourceLanguage,
  targetLanguage,
}: MessageTranslationProps) {
  const { colors } = useTheme();
  const { user } = useAuth();
  const addToVocabularyMutation = useAddToVocabulary();

  const handleSaveToVocabulary = async () => {
    if (!translatedText || !sourceLanguage || !targetLanguage) return;

    try {
      await addToVocabularyMutation.mutateAsync({
        word: originalText,
        translation: translatedText,
        source_language: sourceLanguage,
        target_language: targetLanguage,
      });
      Alert.alert('Success', 'Word saved to vocabulary!');
    } catch (error) {
      // Error handled by hook
    }
  };

  if (isTranslating) {
    return (
      <View style={styles.translatingContainer}>
        <ActivityIndicator size="small" color={colors.primary} />
        <Text style={[styles.translatingText, { color: colors.text.muted }]}>Translating...</Text>
      </View>
    );
  }

  if (!translatedText) {
    return null;
  }

  return (
    <View style={styles.translationContainer}>
      <Text style={[styles.translationText, { color: colors.text.muted }]}>
        {showTranslation ? translatedText : originalText}
      </Text>
      <View style={styles.translationActions}>
        <TouchableOpacity onPress={onToggle} style={styles.toggleButton}>
          <Text style={[styles.toggleText, { color: colors.primary }]}>
            {showTranslation ? 'Show original' : 'Show translation'}
          </Text>
        </TouchableOpacity>
        {sourceLanguage && targetLanguage && (
          <TouchableOpacity
            onPress={handleSaveToVocabulary}
            style={[styles.saveButton, { backgroundColor: colors.background.primary }]}
            disabled={addToVocabularyMutation.isPending}
          >
            <Ionicons name="bookmark-outline" size={14} color={colors.primary} />
            <Text style={[styles.saveText, { color: colors.primary }]}>Save</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  buttonText: {
    fontSize: 12,
    fontWeight: '500',
  },
  translationContainer: {
    marginTop: 4,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
  },
  translationText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
    fontStyle: 'italic',
  },
  translationActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  toggleButton: {
    alignSelf: 'flex-start',
  },
  toggleText: {
    fontSize: 12,
    fontWeight: '500',
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  saveText: {
    fontSize: 12,
    fontWeight: '500',
  },
  translatingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
    paddingTop: 8,
  },
  translatingText: {
    fontSize: 12,
  },
});

