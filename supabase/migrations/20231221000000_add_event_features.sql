/**
 * Migration: Add Event Features
 * Adds enhanced event fields to language_sessions table and creates event_favorites table
 */

-- Add new columns to language_sessions table for enhanced event features
ALTER TABLE language_sessions
ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'language_exchange' CHECK (category IN (
  'language_exchange',
  'conversation_practice',
  'cultural_event',
  'study_group',
  'social_meetup',
  'workshop',
  'online_session',
  'conference',
  'networking'
)),
ADD COLUMN IF NOT EXISTS level TEXT DEFAULT 'all_levels' CHECK (level IN (
  'beginner',
  'intermediate',
  'advanced',
  'all_levels'
)),
ADD COLUMN IF NOT EXISTS cover_image_url TEXT,
ADD COLUMN IF NOT EXISTS image_urls TEXT[],
ADD COLUMN IF NOT EXISTS tags TEXT[],
ADD COLUMN IF NOT EXISTS requirements TEXT[],
ADD COLUMN IF NOT EXISTS is_free BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS price DECIMAL(10, 2),
ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'USD',
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'upcoming' CHECK (status IN (
  'upcoming',
  'ongoing',
  'completed',
  'cancelled'
)),
ADD COLUMN IF NOT EXISTS visibility TEXT DEFAULT 'public' CHECK (visibility IN (
  'public',
  'private',
  'friends_only'
)),
ADD COLUMN IF NOT EXISTS views INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS is_recurring BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS recurrence_rule TEXT,
ADD COLUMN IF NOT EXISTS external_url TEXT,
ADD COLUMN IF NOT EXISTS external_id TEXT,
ADD COLUMN IF NOT EXISTS min_participants INTEGER,
ADD COLUMN IF NOT EXISTS location_address TEXT,
ADD COLUMN IF NOT EXISTS location_city TEXT,
ADD COLUMN IF NOT EXISTS location_country TEXT,
ADD COLUMN IF NOT EXISTS location_venue TEXT,
ADD COLUMN IF NOT EXISTS location_lat DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS location_lng DOUBLE PRECISION;

-- Create event_favorites table
CREATE TABLE IF NOT EXISTS event_favorites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  event_id UUID NOT NULL REFERENCES language_sessions(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, event_id)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_language_sessions_category ON language_sessions(category);
CREATE INDEX IF NOT EXISTS idx_language_sessions_level ON language_sessions(level);
CREATE INDEX IF NOT EXISTS idx_language_sessions_status ON language_sessions(status);
CREATE INDEX IF NOT EXISTS idx_language_sessions_visibility ON language_sessions(visibility);
CREATE INDEX IF NOT EXISTS idx_language_sessions_starts_at ON language_sessions(starts_at);
CREATE INDEX IF NOT EXISTS idx_language_sessions_is_free ON language_sessions(is_free);
CREATE INDEX IF NOT EXISTS idx_language_sessions_views ON language_sessions(views DESC);
CREATE INDEX IF NOT EXISTS idx_event_favorites_user_id ON event_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_event_favorites_event_id ON event_favorites(event_id);

-- Enable RLS on event_favorites
ALTER TABLE event_favorites ENABLE ROW LEVEL SECURITY;

-- RLS policies for event_favorites
CREATE POLICY "Users can view all favorites"
ON event_favorites FOR SELECT TO authenticated
USING (true);

CREATE POLICY "Users can manage their own favorites"
ON event_favorites FOR ALL TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Create event_reviews table for ratings and reviews
CREATE TABLE IF NOT EXISTS event_reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID NOT NULL REFERENCES language_sessions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, event_id)
);

-- Create indexes for reviews
CREATE INDEX IF NOT EXISTS idx_event_reviews_event_id ON event_reviews(event_id);
CREATE INDEX IF NOT EXISTS idx_event_reviews_user_id ON event_reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_event_reviews_rating ON event_reviews(rating);

-- Enable RLS on event_reviews
ALTER TABLE event_reviews ENABLE ROW LEVEL SECURITY;

-- RLS policies for event_reviews
CREATE POLICY "Users can view all reviews"
ON event_reviews FOR SELECT TO authenticated
USING (true);

CREATE POLICY "Users can create reviews for events they attended"
ON event_reviews FOR INSERT TO authenticated
WITH CHECK (
  auth.uid() = user_id
  AND EXISTS (
    SELECT 1 FROM session_participants
    WHERE session_id = event_id
    AND user_id = auth.uid()
    AND status = 'joined'
  )
);

CREATE POLICY "Users can update their own reviews"
ON event_reviews FOR UPDATE TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their own reviews"
ON event_reviews FOR DELETE TO authenticated
USING (user_id = auth.uid());

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_event_reviews_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for updating event_reviews updated_at
CREATE TRIGGER event_reviews_updated_at
BEFORE UPDATE ON event_reviews
FOR EACH ROW
EXECUTE FUNCTION update_event_reviews_updated_at();

-- Add comment to tables
COMMENT ON TABLE event_favorites IS 'User favorites for language exchange events';
COMMENT ON TABLE event_reviews IS 'User reviews and ratings for language exchange events';

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON event_favorites TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON event_reviews TO authenticated;

