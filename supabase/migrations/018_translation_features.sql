-- ============================================================================
-- Migration: Translation Features
-- ============================================================================
-- 
-- Description: Implements translation features for in-chat translation and
--              language learning tools.
--
-- Tables:
--   - translation_preferences: User preferences for translation
--   - translation_history: History of translations for learning
--   - vocabulary: User's saved vocabulary words
--
-- ============================================================================

-- ============================================================================
-- 1. TRANSLATION_PREFERENCES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS translation_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
    auto_translate_enabled BOOLEAN DEFAULT false,
    default_target_language TEXT, -- Language code (e.g., 'en', 'es')
    show_original_text BOOLEAN DEFAULT true, -- Show original text alongside translation
    translation_provider TEXT DEFAULT 'libretranslate' CHECK (translation_provider IN ('libretranslate', 'google', 'microsoft')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_translation_preferences_user_id ON translation_preferences(user_id);

-- ============================================================================
-- 2. TRANSLATION_HISTORY TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS translation_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    original_text TEXT NOT NULL,
    translated_text TEXT NOT NULL,
    source_language TEXT NOT NULL, -- Language code
    target_language TEXT NOT NULL, -- Language code
    detected_language TEXT, -- Detected language if auto-detected
    context TEXT, -- Context (e.g., 'chat_message', 'vocabulary')
    message_id UUID REFERENCES messages(id) ON DELETE SET NULL, -- If translated from a message
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_translation_history_user_id ON translation_history(user_id);
CREATE INDEX IF NOT EXISTS idx_translation_history_message_id ON translation_history(message_id);
CREATE INDEX IF NOT EXISTS idx_translation_history_created_at ON translation_history(created_at DESC);

-- ============================================================================
-- 3. VOCABULARY TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS vocabulary (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    word TEXT NOT NULL,
    translation TEXT NOT NULL,
    source_language TEXT NOT NULL,
    target_language TEXT NOT NULL,
    example_sentence TEXT, -- Example sentence using the word
    difficulty_level INTEGER DEFAULT 1 CHECK (difficulty_level BETWEEN 1 AND 5),
    times_reviewed INTEGER DEFAULT 0,
    last_reviewed_at TIMESTAMPTZ,
    mastery_level INTEGER DEFAULT 0 CHECK (mastery_level BETWEEN 0 AND 100), -- 0-100%
    tags TEXT[], -- Tags for categorization
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, word, source_language, target_language)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_vocabulary_user_id ON vocabulary(user_id);
CREATE INDEX IF NOT EXISTS idx_vocabulary_source_language ON vocabulary(source_language);
CREATE INDEX IF NOT EXISTS idx_vocabulary_target_language ON vocabulary(target_language);
CREATE INDEX IF NOT EXISTS idx_vocabulary_mastery_level ON vocabulary(mastery_level);
CREATE INDEX IF NOT EXISTS idx_vocabulary_tags ON vocabulary USING GIN(tags);

-- ============================================================================
-- 4. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- TRANSLATION_PREFERENCES RLS
ALTER TABLE translation_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own translation preferences"
    ON translation_preferences FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own translation preferences"
    ON translation_preferences FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own translation preferences"
    ON translation_preferences FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- TRANSLATION_HISTORY RLS
ALTER TABLE translation_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own translation history"
    ON translation_history FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own translation history"
    ON translation_history FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own translation history"
    ON translation_history FOR DELETE
    USING (auth.uid() = user_id);

-- VOCABULARY RLS
ALTER TABLE vocabulary ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own vocabulary"
    ON vocabulary FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own vocabulary"
    ON vocabulary FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own vocabulary"
    ON vocabulary FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own vocabulary"
    ON vocabulary FOR DELETE
    USING (auth.uid() = user_id);

-- ============================================================================
-- 5. TRIGGERS
-- ============================================================================

-- Auto-update updated_at timestamp
CREATE TRIGGER update_translation_preferences_updated_at
    BEFORE UPDATE ON translation_preferences
    FOR EACH ROW
    EXECUTE FUNCTION update_help_updated_at();

CREATE TRIGGER update_vocabulary_updated_at
    BEFORE UPDATE ON vocabulary
    FOR EACH ROW
    EXECUTE FUNCTION update_help_updated_at();

-- ============================================================================
-- 6. HELPER FUNCTIONS
-- ============================================================================

-- Function: Update vocabulary mastery level after review
CREATE OR REPLACE FUNCTION update_vocabulary_mastery(
    vocab_id UUID,
    is_correct BOOLEAN
)
RETURNS void AS $$
DECLARE
    current_mastery INTEGER;
    new_mastery INTEGER;
BEGIN
    SELECT mastery_level INTO current_mastery
    FROM vocabulary
    WHERE id = vocab_id;

    IF is_correct THEN
        new_mastery := LEAST(100, current_mastery + 5);
    ELSE
        new_mastery := GREATEST(0, current_mastery - 10);
    END IF;

    UPDATE vocabulary
    SET 
        mastery_level = new_mastery,
        times_reviewed = times_reviewed + 1,
        last_reviewed_at = NOW(),
        updated_at = NOW()
    WHERE id = vocab_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 7. COMMENTS
-- ============================================================================

COMMENT ON TABLE translation_preferences IS 'User preferences for translation features';
COMMENT ON TABLE translation_history IS 'History of translations for learning and review';
COMMENT ON TABLE vocabulary IS 'User saved vocabulary words for language learning';
COMMENT ON FUNCTION update_vocabulary_mastery IS 'Updates vocabulary mastery level after review';

