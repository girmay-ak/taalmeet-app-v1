/**
 * Language to Flag Emoji Mapping
 * Maps language names to their corresponding flag emojis
 */

const LANGUAGE_FLAGS: Record<string, string> = {
  // Common languages
  'english': '🇬🇧',
  'spanish': '🇪🇸',
  'french': '🇫🇷',
  'german': '🇩🇪',
  'italian': '🇮🇹',
  'portuguese': '🇵🇹',
  'dutch': '🇳🇱',
  'russian': '🇷🇺',
  'polish': '🇵🇱',
  'ukrainian': '🇺🇦',
  'czech': '🇨🇿',
  'slovak': '🇸🇰',
  'greek': '🇬🇷',
  'romanian': '🇷🇴',
  'bulgarian': '🇧🇬',
  'hungarian': '🇭🇺',
  'swedish': '🇸🇪',
  'norwegian': '🇳🇴',
  'danish': '🇩🇰',
  'finnish': '🇫🇮',
  'icelandic': '🇮🇸',
  'croatian': '🇭🇷',
  'serbian': '🇷🇸',
  'slovenian': '🇸🇮',
  'lithuanian': '🇱🇹',
  'latvian': '🇱🇻',
  'estonian': '🇪🇪',
  'maltese': '🇲🇹',
  'irish': '🇮🇪',
  'welsh': '🇬🇧',
  'catalan': '🇪🇸',
  'basque': '🇪🇸',
  'galician': '🇪🇸',
  
  // Asian languages
  'chinese': '🇨🇳',
  'mandarin': '🇨🇳',
  'cantonese': '🇭🇰',
  'japanese': '🇯🇵',
  'korean': '🇰🇷',
  'hindi': '🇮🇳',
  'bengali': '🇧🇩',
  'urdu': '🇵🇰',
  'arabic': '🇸🇦',
  'hebrew': '🇮🇱',
  'turkish': '🇹🇷',
  'persian': '🇮🇷',
  'farsi': '🇮🇷',
  'thai': '🇹🇭',
  'vietnamese': '🇻🇳',
  'indonesian': '🇮🇩',
  'malay': '🇲🇾',
  'tagalog': '🇵🇭',
  'filipino': '🇵🇭',
  
  // African languages
  'swahili': '🇰🇪',
  'afrikaans': '🇿🇦',
  'amharic': '🇪🇹',
  'yoruba': '🇳🇬',
  'hausa': '🇳🇬',
  'zulu': '🇿🇦',
  
  // Americas
  'portuguese (brazil)': '🇧🇷',
  'spanish (mexico)': '🇲🇽',
  'spanish (argentina)': '🇦🇷',
  'spanish (colombia)': '🇨🇴',
  'spanish (chile)': '🇨🇱',
  'spanish (peru)': '🇵🇪',
  
  // Other
  'esperanto': '🌍',
  'latin': '🏛️',
};

/**
 * Get flag emoji for a language name
 * @param languageName - The name of the language (case-insensitive)
 * @returns Flag emoji or 🌍 as fallback
 */
export function getLanguageFlag(languageName: string | null | undefined): string {
  if (!languageName) {
    return '🌍';
  }

  const normalized = languageName.toLowerCase().trim();
  
  // Direct match
  if (LANGUAGE_FLAGS[normalized]) {
    return LANGUAGE_FLAGS[normalized];
  }

  // Partial match (e.g., "English (US)" -> "english")
  for (const [key, flag] of Object.entries(LANGUAGE_FLAGS)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return flag;
    }
  }

  // Check for common variations
  if (normalized.includes('english') || normalized.includes('inglés')) {
    return '🇬🇧';
  }
  if (normalized.includes('spanish') || normalized.includes('español')) {
    return '🇪🇸';
  }
  if (normalized.includes('french') || normalized.includes('français')) {
    return '🇫🇷';
  }
  if (normalized.includes('german') || normalized.includes('deutsch')) {
    return '🇩🇪';
  }
  if (normalized.includes('italian') || normalized.includes('italiano')) {
    return '🇮🇹';
  }
  if (normalized.includes('portuguese') || normalized.includes('português')) {
    return '🇵🇹';
  }
  if (normalized.includes('dutch') || normalized.includes('nederlands')) {
    return '🇳🇱';
  }
  if (normalized.includes('chinese') || normalized.includes('中文')) {
    return '🇨🇳';
  }
  if (normalized.includes('japanese') || normalized.includes('日本語')) {
    return '🇯🇵';
  }
  if (normalized.includes('korean') || normalized.includes('한국어')) {
    return '🇰🇷';
  }

  // Default fallback
  return '🌍';
}

