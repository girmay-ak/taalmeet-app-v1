-- ============================================================================
-- Migration: Create discovery_preferences table
-- ============================================================================

CREATE TABLE IF NOT EXISTS discovery_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  only_my_languages BOOLEAN DEFAULT false,
  show_nearby_first BOOLEAN DEFAULT true,
  max_distance_km INTEGER DEFAULT 50 CHECK (max_distance_km > 0 AND max_distance_km <= 1000),
  min_match_score INTEGER DEFAULT 0 CHECK (min_match_score >= 0 AND min_match_score <= 100),
  meeting_type TEXT[] DEFAULT ARRAY['in-person', 'video', 'call', 'chat']::TEXT[],
  preferred_levels TEXT[] DEFAULT ARRAY['Beginner (A1-A2)', 'Intermediate (B1-B2)', 'Advanced (C1-C2)', 'Native']::TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_discovery_preferences_user ON discovery_preferences(user_id);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

ALTER TABLE discovery_preferences ENABLE ROW LEVEL SECURITY;

-- Users can view their own preferences
CREATE POLICY "Users can view their own preferences"
  ON discovery_preferences
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own preferences
CREATE POLICY "Users can create their own preferences"
  ON discovery_preferences
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own preferences
CREATE POLICY "Users can update their own preferences"
  ON discovery_preferences
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own preferences
CREATE POLICY "Users can delete their own preferences"
  ON discovery_preferences
  FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_discovery_preferences_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_discovery_preferences_updated_at
  BEFORE UPDATE ON discovery_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_discovery_preferences_updated_at();

