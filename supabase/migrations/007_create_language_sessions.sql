-- ============================================================================
-- Migration: Create language_sessions and session_participants tables
-- ============================================================================

-- ============================================================================
-- LANGUAGE_SESSIONS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS language_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  language TEXT NOT NULL,
  host_user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ NOT NULL,
  location TEXT, -- Physical location or "Online" for virtual sessions
  is_online BOOLEAN DEFAULT false,
  capacity INTEGER NOT NULL DEFAULT 10 CHECK (capacity > 0),
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(), 
  
  -- Ensure ends_at is after starts_at
  CONSTRAINT valid_time_range CHECK (ends_at > starts_at)
);

-- ============================================================================
-- SESSION_PARTICIPANTS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS session_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES language_sessions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'joined' CHECK (status IN ('joined', 'waitlisted', 'left')),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Ensure user can only have one participation record per session
  UNIQUE(session_id, user_id)
);

-- ============================================================================
-- INDEXES
-- ============================================================================

-- Indexes for language_sessions
CREATE INDEX IF NOT EXISTS idx_sessions_host ON language_sessions(host_user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_language ON language_sessions(language);
CREATE INDEX IF NOT EXISTS idx_sessions_starts_at ON language_sessions(starts_at);
CREATE INDEX IF NOT EXISTS idx_sessions_time_range ON language_sessions(starts_at, ends_at);
CREATE INDEX IF NOT EXISTS idx_sessions_online ON language_sessions(is_online) WHERE is_online = true;

-- Indexes for session_participants
CREATE INDEX IF NOT EXISTS idx_participants_session ON session_participants(session_id);
CREATE INDEX IF NOT EXISTS idx_participants_user ON session_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_participants_status ON session_participants(status);
CREATE INDEX IF NOT EXISTS idx_participants_session_user ON session_participants(session_id, user_id);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

ALTER TABLE language_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_participants ENABLE ROW LEVEL SECURITY;

-- Language sessions: Anyone can read, only authenticated users can create/update their own
CREATE POLICY "Anyone can view sessions"
  ON language_sessions
  FOR SELECT
  USING (true);

CREATE POLICY "Users can create sessions"
  ON language_sessions
  FOR INSERT
  WITH CHECK (auth.uid() = host_user_id);

CREATE POLICY "Hosts can update their sessions"
  ON language_sessions
  FOR UPDATE
  USING (auth.uid() = host_user_id);

CREATE POLICY "Hosts can delete their sessions"
  ON language_sessions
  FOR DELETE
  USING (auth.uid() = host_user_id);

-- Session participants: Anyone can view, users can manage their own participation
CREATE POLICY "Anyone can view participants"
  ON session_participants
  FOR SELECT
  USING (true);

CREATE POLICY "Users can join sessions"
  ON session_participants
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their participation"
  ON session_participants
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can leave sessions"
  ON session_participants
  FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_sessions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_language_sessions_updated_at
  BEFORE UPDATE ON language_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_sessions_updated_at();

-- Function to get session participant count
CREATE OR REPLACE FUNCTION get_session_participant_count(session_uuid UUID)
RETURNS INTEGER AS $$
DECLARE
  participant_count INTEGER;
BEGIN
  SELECT COUNT(*)
  INTO participant_count
  FROM session_participants
  WHERE session_id = session_uuid
    AND status = 'joined';
  
  RETURN COALESCE(participant_count, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if session is full
CREATE OR REPLACE FUNCTION is_session_full(session_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE
  current_count INTEGER;
  max_capacity INTEGER;
BEGIN
  SELECT get_session_participant_count(session_uuid), capacity
  INTO current_count, max_capacity
  FROM language_sessions
  WHERE id = session_uuid;
  
  RETURN current_count >= max_capacity;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

