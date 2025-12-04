-- ============================================================================
-- Migration: Gamification System
-- ============================================================================
-- 
-- Description: Implements gamification system with points, achievements,
--              and leaderboards to encourage user engagement.
--
-- Tables:
--   - user_points: Tracks user points and point history
--   - achievements: Defines available achievements
--   - user_achievements: Tracks which users have earned which achievements
--   - leaderboard_entries: Cached leaderboard data for performance
--
-- ============================================================================

-- ============================================================================
-- 1. USER_POINTS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS user_points (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    points INTEGER NOT NULL DEFAULT 0,
    total_earned INTEGER NOT NULL DEFAULT 0,
    last_updated TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_user_points_user_id ON user_points(user_id);
CREATE INDEX IF NOT EXISTS idx_user_points_points ON user_points(points DESC);
CREATE INDEX IF NOT EXISTS idx_user_points_total_earned ON user_points(total_earned DESC);

-- ============================================================================
-- 2. POINT_HISTORY TABLE (Track point transactions)
-- ============================================================================

CREATE TABLE IF NOT EXISTS point_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    points INTEGER NOT NULL,
    reason TEXT NOT NULL,
    source_type TEXT NOT NULL CHECK (source_type IN (
        'session_completed',
        'conversation_started',
        'conversation_message',
        'connection_made',
        'profile_completed',
        'daily_login',
        'streak_bonus',
        'achievement_unlocked',
        'helping_others',
        'admin_adjustment'
    )),
    source_id UUID, -- Reference to the source (session_id, conversation_id, etc.)
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_point_history_user_id ON point_history(user_id);
CREATE INDEX IF NOT EXISTS idx_point_history_created_at ON point_history(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_point_history_source ON point_history(source_type, source_id);

-- ============================================================================
-- 3. ACHIEVEMENTS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS achievements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT UNIQUE NOT NULL, -- e.g., 'first_conversation', '10_conversations'
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    icon TEXT, -- Icon name or emoji
    points_reward INTEGER DEFAULT 0,
    category TEXT CHECK (category IN ('conversation', 'session', 'streak', 'social', 'profile', 'special')),
    requirement_value INTEGER, -- e.g., 10 for "10 conversations"
    requirement_type TEXT CHECK (requirement_type IN ('count', 'streak', 'boolean', 'custom')),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_achievements_code ON achievements(code);
CREATE INDEX IF NOT EXISTS idx_achievements_category ON achievements(category);
CREATE INDEX IF NOT EXISTS idx_achievements_is_active ON achievements(is_active);

-- ============================================================================
-- 4. USER_ACHIEVEMENTS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS user_achievements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    achievement_id UUID NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
    unlocked_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, achievement_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_achievement_id ON user_achievements(achievement_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_unlocked_at ON user_achievements(unlocked_at DESC);

-- ============================================================================
-- 5. USER_STREAKS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS user_streaks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    streak_type TEXT NOT NULL CHECK (streak_type IN ('daily_login', 'daily_conversation', 'daily_session')),
    current_streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    last_activity_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, streak_type)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_user_streaks_user_id ON user_streaks(user_id);
CREATE INDEX IF NOT EXISTS idx_user_streaks_streak_type ON user_streaks(streak_type);
CREATE INDEX IF NOT EXISTS idx_user_streaks_current_streak ON user_streaks(current_streak DESC);

-- ============================================================================
-- 6. LEADERBOARD_ENTRIES TABLE (Cached for performance)
-- ============================================================================

CREATE TABLE IF NOT EXISTS leaderboard_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    period_type TEXT NOT NULL CHECK (period_type IN ('weekly', 'monthly', 'all_time', 'language')),
    period_start DATE NOT NULL,
    period_end DATE,
    language_code TEXT, -- For language-specific leaderboards
    points INTEGER NOT NULL DEFAULT 0,
    rank INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, period_type, period_start, language_code)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_leaderboard_entries_period ON leaderboard_entries(period_type, period_start, language_code);
CREATE INDEX IF NOT EXISTS idx_leaderboard_entries_points ON leaderboard_entries(period_type, period_start, points DESC);
CREATE INDEX IF NOT EXISTS idx_leaderboard_entries_rank ON leaderboard_entries(period_type, period_start, rank);

-- ============================================================================
-- 7. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- USER_POINTS RLS
ALTER TABLE user_points ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all points"
    ON user_points FOR SELECT
    USING (true);

CREATE POLICY "Users can update their own points"
    ON user_points FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- POINT_HISTORY RLS
ALTER TABLE point_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own point history"
    ON point_history FOR SELECT
    USING (auth.uid() = user_id);

-- ACHIEVEMENTS RLS
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active achievements"
    ON achievements FOR SELECT
    USING (is_active = true);

-- USER_ACHIEVEMENTS RLS
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all user achievements"
    ON user_achievements FOR SELECT
    USING (true);

-- USER_STREAKS RLS
ALTER TABLE user_streaks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all streaks"
    ON user_streaks FOR SELECT
    USING (true);

CREATE POLICY "Users can update their own streaks"
    ON user_streaks FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- LEADERBOARD_ENTRIES RLS
ALTER TABLE leaderboard_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view leaderboard entries"
    ON leaderboard_entries FOR SELECT
    USING (true);

-- ============================================================================
-- 8. HELPER FUNCTIONS
-- ============================================================================

-- Function: Add points to user
CREATE OR REPLACE FUNCTION add_user_points(
    p_user_id UUID,
    p_points INTEGER,
    p_reason TEXT,
    p_source_type TEXT,
    p_source_id UUID DEFAULT NULL
)
RETURNS void AS $$
BEGIN
    -- Insert into point history
    INSERT INTO point_history (user_id, points, reason, source_type, source_id)
    VALUES (p_user_id, p_points, p_reason, p_source_type, p_source_id);

    -- Update or insert user_points
    INSERT INTO user_points (user_id, points, total_earned)
    VALUES (p_user_id, p_points, p_points)
    ON CONFLICT (user_id) DO UPDATE
    SET 
        points = user_points.points + p_points,
        total_earned = user_points.total_earned + p_points,
        last_updated = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Get user points
CREATE OR REPLACE FUNCTION get_user_points(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
    user_points INTEGER;
BEGIN
    SELECT COALESCE(points, 0) INTO user_points
    FROM user_points
    WHERE user_id = p_user_id;
    
    RETURN COALESCE(user_points, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Update streak
CREATE OR REPLACE FUNCTION update_user_streak(
    p_user_id UUID,
    p_streak_type TEXT
)
RETURNS INTEGER AS $$
DECLARE
    current_date DATE := CURRENT_DATE;
    last_date DATE;
    new_streak INTEGER;
BEGIN
    -- Get last activity date
    SELECT last_activity_date INTO last_date
    FROM user_streaks
    WHERE user_id = p_user_id AND streak_type = p_streak_type;

    -- Calculate new streak
    IF last_date IS NULL THEN
        -- First time
        new_streak := 1;
    ELSIF last_date = current_date THEN
        -- Already updated today, return current streak
        SELECT current_streak INTO new_streak
        FROM user_streaks
        WHERE user_id = p_user_id AND streak_type = p_streak_type;
        RETURN new_streak;
    ELSIF last_date = current_date - INTERVAL '1 day' THEN
        -- Consecutive day
        SELECT current_streak + 1 INTO new_streak
        FROM user_streaks
        WHERE user_id = p_user_id AND streak_type = p_streak_type;
    ELSE
        -- Streak broken, reset to 1
        new_streak := 1;
    END IF;

    -- Update or insert streak
    INSERT INTO user_streaks (user_id, streak_type, current_streak, longest_streak, last_activity_date)
    VALUES (p_user_id, p_streak_type, new_streak, new_streak, current_date)
    ON CONFLICT (user_id, streak_type) DO UPDATE
    SET 
        current_streak = new_streak,
        longest_streak = GREATEST(user_streaks.longest_streak, new_streak),
        last_activity_date = current_date,
        updated_at = NOW();

    RETURN new_streak;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 9. INITIAL ACHIEVEMENTS DATA
-- ============================================================================

INSERT INTO achievements (code, name, description, icon, points_reward, category, requirement_type, requirement_value) VALUES
('first_conversation', 'First Conversation', 'Start your first conversation', '💬', 50, 'conversation', 'count', 1),
('10_conversations', 'Chatterbox', 'Start 10 conversations', '💭', 200, 'conversation', 'count', 10),
('50_conversations', 'Social Butterfly', 'Start 50 conversations', '🦋', 500, 'conversation', 'count', 50),
('first_session', 'First Session', 'Complete your first language session', '🎯', 100, 'session', 'count', 1),
('10_sessions', 'Dedicated Learner', 'Complete 10 language sessions', '📚', 300, 'session', 'count', 10),
('50_sessions', 'Language Master', 'Complete 50 language sessions', '👑', 1000, 'session', 'count', 50),
('first_connection', 'Making Friends', 'Make your first connection', '🤝', 75, 'social', 'count', 1),
('10_connections', 'Popular', 'Make 10 connections', '⭐', 250, 'social', 'count', 10),
('profile_complete', 'Profile Complete', 'Complete your profile', '✅', 50, 'profile', 'boolean', NULL),
('daily_login_7', 'Week Warrior', 'Login 7 days in a row', '🔥', 150, 'streak', 'streak', 7),
('daily_login_30', 'Month Master', 'Login 30 days in a row', '💪', 500, 'streak', 'streak', 30),
('daily_conversation_7', 'Daily Chatter', 'Have conversations 7 days in a row', '💬', 200, 'streak', 'streak', 7),
('helping_others', 'Helper', 'Help 5 other users', '🤗', 300, 'social', 'count', 5)
ON CONFLICT (code) DO NOTHING;

-- ============================================================================
-- 10. COMMENTS
-- ============================================================================

COMMENT ON TABLE user_points IS 'Tracks user points and total earned';
COMMENT ON TABLE point_history IS 'History of all point transactions';
COMMENT ON TABLE achievements IS 'Available achievements users can earn';
COMMENT ON TABLE user_achievements IS 'Achievements unlocked by users';
COMMENT ON TABLE user_streaks IS 'Tracks user streaks (daily login, conversations, etc.)';
COMMENT ON TABLE leaderboard_entries IS 'Cached leaderboard data for performance';
COMMENT ON FUNCTION add_user_points IS 'Adds points to a user and records in history';
COMMENT ON FUNCTION get_user_points IS 'Gets current points for a user';
COMMENT ON FUNCTION update_user_streak IS 'Updates user streak for daily activities';

