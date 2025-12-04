/**
 * Translation Service
 * Backend service for translation features using LibreTranslate API
 * Note: For production, you may want to use Google Translate API or Microsoft Translator
 */

import { supabase } from '@/lib/supabase';
import { parseSupabaseError } from '@/utils/errors';
import type {
  TranslationPreferences,
  TranslationHistory,
  Vocabulary,
} from '@/types/database';

// ============================================================================
// TYPES
// ============================================================================

export interface TranslationResult {
  translatedText: string;
  detectedLanguage?: string;
  confidence?: number;
}

export interface LanguageDetectionResult {
  language: string;
  confidence: number;
}

// ============================================================================
// TRANSLATION API
// ============================================================================

/**
 * Translate text using LibreTranslate API (free, open-source)
 * For production, consider using Google Translate API or Microsoft Translator
 */
export async function translateText(
  text: string,
  targetLanguage: string,
  sourceLanguage?: string
): Promise<TranslationResult> {
  try {
    // Using LibreTranslate public API (free tier)
    // For production, set up your own LibreTranslate instance or use paid APIs
    const response = await fetch('https://libretranslate.de/translate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        q: text,
        source: sourceLanguage || 'auto',
        target: targetLanguage,
        format: 'text',
      }),
    });

    if (!response.ok) {
      throw new Error(`Translation API error: ${response.statusText}`);
    }

    // Check if response is actually JSON
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      throw new Error('API returned non-JSON response');
    }

    const textResponse = await response.text();
    let data;
    
    try {
      data = JSON.parse(textResponse);
    } catch (parseError) {
      // If JSON parse fails, the API might have returned HTML or an error page
      throw new Error('Failed to parse JSON response');
    }

    return {
      translatedText: data.translatedText || text,
      detectedLanguage: data.detectedLanguage?.language,
      confidence: data.detectedLanguage?.confidence,
    };
  } catch (error) {
    if (__DEV__) {
      console.warn('Translation error (returning original text):', error);
    }
    // Fallback: return original text if translation fails
    return {
      translatedText: text,
    };
  }
}

/**
 * Detect language of text
 */
export async function detectLanguage(text: string): Promise<LanguageDetectionResult> {
  try {
    const response = await fetch('https://libretranslate.de/detect', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        q: text,
      }),
    });

    if (!response.ok) {
      throw new Error(`Language detection API error: ${response.statusText}`);
    }

    // Check if response is actually JSON
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      throw new Error('API returned non-JSON response');
    }

    const textResponse = await response.text();
    let data;
    
    try {
      data = JSON.parse(textResponse);
    } catch (parseError) {
      // If JSON parse fails, the API might have returned HTML or an error page
      throw new Error('Failed to parse JSON response');
    }

    const detection = Array.isArray(data) ? data[0] : data;

    return {
      language: detection.language || 'en',
      confidence: detection.confidence || 0,
    };
  } catch (error) {
    if (__DEV__) {
      console.warn('Language detection error (assuming English):', error);
    }
    // Fallback: assume English
    return {
      language: 'en',
      confidence: 0,
    };
  }
}

/**
 * Get supported languages
 */
export async function getSupportedLanguages(): Promise<Array<{ code: string; name: string }>> {
  try {
    const response = await fetch('https://libretranslate.de/languages', {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Languages API error: ${response.statusText}`);
    }

    // Check if response is actually JSON
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      throw new Error('API returned non-JSON response');
    }

    const text = await response.text();
    let data;
    
    try {
      data = JSON.parse(text);
    } catch (parseError) {
      // If JSON parse fails, the API might have returned HTML or an error page
      throw new Error('Failed to parse JSON response');
    }

    // Validate the response is an array
    if (Array.isArray(data)) {
      return data;
    }

    // If not an array, return fallback
    throw new Error('Invalid response format');
  } catch (error) {
    // Log error but don't throw - return fallback instead
    if (__DEV__) {
      console.warn('Get languages error (using fallback):', error);
    }
    
    // Fallback: return common languages
    return [
      { code: 'en', name: 'English' },
      { code: 'es', name: 'Spanish' },
      { code: 'fr', name: 'French' },
      { code: 'de', name: 'German' },
      { code: 'it', name: 'Italian' },
      { code: 'pt', name: 'Portuguese' },
      { code: 'nl', name: 'Dutch' },
      { code: 'ja', name: 'Japanese' },
      { code: 'zh', name: 'Chinese' },
      { code: 'ko', name: 'Korean' },
      { code: 'ru', name: 'Russian' },
      { code: 'ar', name: 'Arabic' },
      { code: 'hi', name: 'Hindi' },
      { code: 'tr', name: 'Turkish' },
      { code: 'pl', name: 'Polish' },
    ];
  }
}

// ============================================================================
// TRANSLATION PREFERENCES
// ============================================================================

/**
 * Get user's translation preferences
 */
export async function getTranslationPreferences(
  userId: string
): Promise<TranslationPreferences | null> {
  const { data, error } = await supabase
    .from('translation_preferences')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    throw parseSupabaseError(error);
  }

  return data as TranslationPreferences;
}

/**
 * Create or update translation preferences
 */
export async function upsertTranslationPreferences(
  userId: string,
  preferences: {
    auto_translate_enabled?: boolean;
    default_target_language?: string;
    show_original_text?: boolean;
    translation_provider?: 'libretranslate' | 'google' | 'microsoft';
  }
): Promise<TranslationPreferences> {
  const existing = await getTranslationPreferences(userId);

  if (existing) {
    const { data, error } = await supabase
      .from('translation_preferences')
      .update(preferences)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      throw parseSupabaseError(error);
    }

    return data as TranslationPreferences;
  } else {
    const { data, error } = await supabase
      .from('translation_preferences')
      .insert({
        user_id: userId,
        ...preferences,
      })
      .select()
      .single();

    if (error) {
      throw parseSupabaseError(error);
    }

    return data as TranslationPreferences;
  }
}

// ============================================================================
// TRANSLATION HISTORY
// ============================================================================

/**
 * Save translation to history
 */
export async function saveTranslationHistory(
  userId: string,
  translation: {
    original_text: string;
    translated_text: string;
    source_language: string;
    target_language: string;
    detected_language?: string;
    context?: string;
    message_id?: string;
  }
): Promise<TranslationHistory> {
  const { data, error } = await supabase
    .from('translation_history')
    .insert({
      user_id: userId,
      ...translation,
    })
    .select()
    .single();

  if (error) {
    throw parseSupabaseError(error);
  }

  return data as TranslationHistory;
}

/**
 * Get user's translation history
 */
export async function getTranslationHistory(
  userId: string,
  limit: number = 50
): Promise<TranslationHistory[]> {
  const { data, error } = await supabase
    .from('translation_history')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    throw parseSupabaseError(error);
  }

  return (data || []) as TranslationHistory[];
}

// ============================================================================
// VOCABULARY
// ============================================================================

/**
 * Add word to vocabulary
 */
export async function addToVocabulary(
  userId: string,
  word: {
    word: string;
    translation: string;
    source_language: string;
    target_language: string;
    example_sentence?: string;
    difficulty_level?: number;
    tags?: string[];
  }
): Promise<Vocabulary> {
  const { data, error } = await supabase
    .from('vocabulary')
    .upsert(
      {
        user_id: userId,
        ...word,
      },
      {
        onConflict: 'user_id,word,source_language,target_language',
      }
    )
    .select()
    .single();

  if (error) {
    throw parseSupabaseError(error);
  }

  return data as Vocabulary;
}

/**
 * Get user's vocabulary
 */
export async function getVocabulary(
  userId: string,
  filters?: {
    source_language?: string;
    target_language?: string;
    min_mastery?: number;
    max_mastery?: number;
  }
): Promise<Vocabulary[]> {
  let query = supabase
    .from('vocabulary')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (filters?.source_language) {
    query = query.eq('source_language', filters.source_language);
  }

  if (filters?.target_language) {
    query = query.eq('target_language', filters.target_language);
  }

  if (filters?.min_mastery !== undefined) {
    query = query.gte('mastery_level', filters.min_mastery);
  }

  if (filters?.max_mastery !== undefined) {
    query = query.lte('mastery_level', filters.max_mastery);
  }

  const { data, error } = await query;

  if (error) {
    throw parseSupabaseError(error);
  }

  return (data || []) as Vocabulary[];
}

/**
 * Update vocabulary mastery after review
 */
export async function updateVocabularyMastery(
  vocabularyId: string,
  isCorrect: boolean
): Promise<void> {
  const { error } = await supabase.rpc('update_vocabulary_mastery', {
    vocab_id: vocabularyId,
    is_correct: isCorrect,
  });

  if (error) {
    throw parseSupabaseError(error);
  }
}

/**
 * Delete vocabulary word
 */
export async function deleteVocabulary(vocabularyId: string): Promise<void> {
  const { error } = await supabase
    .from('vocabulary')
    .delete()
    .eq('id', vocabularyId);

  if (error) {
    throw parseSupabaseError(error);
  }
}

