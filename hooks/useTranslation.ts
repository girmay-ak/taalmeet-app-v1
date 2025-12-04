/**
 * Translation Hooks
 * React Query hooks for translation features
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Alert } from 'react-native';
import * as translationService from '@/services/translationService';
import { getUserFriendlyMessage } from '@/utils/errors';
import { useAuth } from '@/providers';

// ============================================================================
// QUERY KEYS
// ============================================================================

export const translationKeys = {
  all: ['translation'] as const,
  preferences: (userId: string) => [...translationKeys.all, 'preferences', userId] as const,
  history: (userId: string) => [...translationKeys.all, 'history', userId] as const,
  vocabulary: (userId: string) => [...translationKeys.all, 'vocabulary', userId] as const,
  supportedLanguages: () => [...translationKeys.all, 'supportedLanguages'] as const,
};

// ============================================================================
// QUERIES
// ============================================================================

/**
 * Get user's translation preferences
 */
export function useTranslationPreferences(userId: string | undefined) {
  return useQuery({
    queryKey: translationKeys.preferences(userId || ''),
    queryFn: () => (userId ? translationService.getTranslationPreferences(userId) : null),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Get supported languages
 */
export function useSupportedLanguages() {
  return useQuery({
    queryKey: translationKeys.supportedLanguages(),
    queryFn: () => translationService.getSupportedLanguages(),
    staleTime: 24 * 60 * 60 * 1000, // 24 hours - languages don't change often
  });
}

/**
 * Get translation history
 */
export function useTranslationHistory(userId: string | undefined, limit: number = 50) {
  return useQuery({
    queryKey: [...translationKeys.history(userId || ''), limit],
    queryFn: () => (userId ? translationService.getTranslationHistory(userId, limit) : []),
    enabled: !!userId,
    staleTime: 1 * 60 * 1000, // 1 minute
  });
}

/**
 * Get user's vocabulary
 */
export function useVocabulary(
  userId: string | undefined,
  filters?: {
    source_language?: string;
    target_language?: string;
    min_mastery?: number;
    max_mastery?: number;
  }
) {
  return useQuery({
    queryKey: [...translationKeys.vocabulary(userId || ''), filters],
    queryFn: () => (userId ? translationService.getVocabulary(userId, filters) : []),
    enabled: !!userId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

// ============================================================================
// MUTATIONS
// ============================================================================

/**
 * Translate text mutation
 */
export function useTranslateText() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      text,
      targetLanguage,
      sourceLanguage,
      saveToHistory = true,
      context,
      messageId,
    }: {
      text: string;
      targetLanguage: string;
      sourceLanguage?: string;
      saveToHistory?: boolean;
      context?: string;
      messageId?: string;
    }) => {
      const result = await translationService.translateText(text, targetLanguage, sourceLanguage);

      // Save to history if enabled
      if (saveToHistory && user?.id) {
        try {
          await translationService.saveTranslationHistory(user.id, {
            original_text: text,
            translated_text: result.translatedText,
            source_language: sourceLanguage || result.detectedLanguage || 'auto',
            target_language: targetLanguage,
            detected_language: result.detectedLanguage,
            context: context || 'chat_message',
            message_id: messageId,
          });

          // Invalidate history query
          queryClient.invalidateQueries({ queryKey: translationKeys.history(user.id) });
        } catch (error) {
          // Don't fail translation if history save fails
          console.warn('Failed to save translation history:', error);
        }
      }

      return result;
    },
    onError: (error) => {
      console.error('Translation error:', error);
      // Don't show alert - let UI handle it gracefully
    },
  });
}

/**
 * Detect language mutation
 */
export function useDetectLanguage() {
  return useMutation({
    mutationFn: (text: string) => translationService.detectLanguage(text),
    onError: (error) => {
      console.error('Language detection error:', error);
    },
  });
}

/**
 * Update translation preferences mutation
 */
export function useUpdateTranslationPreferences() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (preferences: {
      auto_translate_enabled?: boolean;
      default_target_language?: string;
      show_original_text?: boolean;
      translation_provider?: 'libretranslate' | 'google' | 'microsoft';
    }) => {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }
      return translationService.upsertTranslationPreferences(user.id, preferences);
    },
    onSuccess: () => {
      if (user?.id) {
        queryClient.invalidateQueries({ queryKey: translationKeys.preferences(user.id) });
      }
    },
    onError: (error) => {
      const message = getUserFriendlyMessage(error);
      Alert.alert('Error', message);
    },
  });
}

/**
 * Add to vocabulary mutation
 */
export function useAddToVocabulary() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (word: {
      word: string;
      translation: string;
      source_language: string;
      target_language: string;
      example_sentence?: string;
      difficulty_level?: number;
      tags?: string[];
    }) => {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }
      return translationService.addToVocabulary(user.id, word);
    },
    onSuccess: () => {
      if (user?.id) {
        queryClient.invalidateQueries({ queryKey: translationKeys.vocabulary(user.id) });
      }
    },
    onError: (error) => {
      const message = getUserFriendlyMessage(error);
      Alert.alert('Error', message);
    },
  });
}

/**
 * Update vocabulary mastery mutation
 */
export function useUpdateVocabularyMastery() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ vocabularyId, isCorrect }: { vocabularyId: string; isCorrect: boolean }) => {
      return translationService.updateVocabularyMastery(vocabularyId, isCorrect);
    },
    onSuccess: () => {
      if (user?.id) {
        queryClient.invalidateQueries({ queryKey: translationKeys.vocabulary(user.id) });
      }
    },
    onError: (error) => {
      console.error('Failed to update vocabulary mastery:', error);
    },
  });
}

/**
 * Delete vocabulary mutation
 */
export function useDeleteVocabulary() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (vocabularyId: string) => {
      return translationService.deleteVocabulary(vocabularyId);
    },
    onSuccess: () => {
      if (user?.id) {
        queryClient.invalidateQueries({ queryKey: translationKeys.vocabulary(user.id) });
      }
    },
    onError: (error) => {
      const message = getUserFriendlyMessage(error);
      Alert.alert('Error', message);
    },
  });
}

