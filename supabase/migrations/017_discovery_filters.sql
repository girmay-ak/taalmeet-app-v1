-- ============================================================================
-- Migration: Discovery Filter Preferences
-- ============================================================================
-- 
-- Description: Implements user preferences for discovery filters
--
-- Tables:
--   - discovery_filter_preferences: User's saved filter preferences
--
-- ============================================================================

-- ============================================================================
-- 1. DISCOVERY_FILTER_PREFERENCES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS discovery_filter_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
    max_distance INTEGER DEFAULT 50, -- Max distance in km
    preferred_languages TEXT[], -- Array of preferred language codes
    gender_preference TEXT CHECK (gender_preference IN ('all', 'male', 'female', 'other', 'prefer_not_to_say')),
    availability_filter BOOLEAN DEFAULT false, -- Filter by availability status
    timezone_match BOOLEAN DEFAULT false, -- Prefer users in similar timezone
    min_match_score INTEGER DEFAULT 0, -- Minimum language match score (0-100)
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_discovery_filter_preferences_user_id ON discovery_filter_preferences(user_id);

-- ============================================================================
-- 2. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

ALTER TABLE discovery_filter_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own filter preferences"
    ON discovery_filter_preferences FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own filter preferences"
    ON discovery_filter_preferences FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own filter preferences"
    ON discovery_filter_preferences FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- 3. TRIGGERS
-- ============================================================================

-- Auto-update updated_at timestamp
CREATE TRIGGER update_discovery_filter_preferences_updated_at
    BEFORE UPDATE ON discovery_filter_preferences
    FOR EACH ROW
    EXECUTE FUNCTION update_help_updated_at();

-- ============================================================================
-- 4. COMMENTS
-- ============================================================================

COMMENT ON TABLE discovery_filter_preferences IS 'User preferences for discovery feed filters';
COMMENT ON COLUMN discovery_filter_preferences.max_distance IS 'Maximum distance in kilometers for discovery';
COMMENT ON COLUMN discovery_filter_preferences.preferred_languages IS 'Array of preferred language codes for filtering';
COMMENT ON COLUMN discovery_filter_preferences.gender_preference IS 'Gender preference filter (all, male, female, other, prefer_not_to_say)';
COMMENT ON COLUMN discovery_filter_preferences.availability_filter IS 'Filter by user availability status';
COMMENT ON COLUMN discovery_filter_preferences.timezone_match IS 'Prefer users in similar timezone';
COMMENT ON COLUMN discovery_filter_preferences.min_match_score IS 'Minimum language match score (0-100)';

