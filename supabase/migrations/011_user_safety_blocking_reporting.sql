-- ============================================================================
-- Migration: User Safety - Blocking and Reporting System
-- ============================================================================
-- 
-- Description: Implements user blocking and reporting features for App Store
--              compliance with safety and harassment prevention requirements.
--
-- Tables:
--   - blocked_users: Tracks which users have blocked which other users
--   - reports: Stores user reports for moderation review
--
-- Security: All tables have RLS enabled with strict policies
-- ============================================================================

-- ============================================================================
-- 1. BLOCKED_USERS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS blocked_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    blocker_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    blocked_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Prevent duplicate blocks
    UNIQUE(blocker_id, blocked_id),
    
    -- Prevent self-blocking
    CHECK (blocker_id != blocked_id)
);

-- Indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_blocked_users_blocker_id ON blocked_users(blocker_id);
CREATE INDEX IF NOT EXISTS idx_blocked_users_blocked_id ON blocked_users(blocked_id);
CREATE INDEX IF NOT EXISTS idx_blocked_users_created_at ON blocked_users(created_at DESC);

-- ============================================================================
-- 2. REPORTS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reporter_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    target_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    reason TEXT NOT NULL,
    message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Prevent self-reporting
    CHECK (reporter_id != target_id)
);

-- Indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_reports_reporter_id ON reports(reporter_id);
CREATE INDEX IF NOT EXISTS idx_reports_target_id ON reports(target_id);
CREATE INDEX IF NOT EXISTS idx_reports_created_at ON reports(created_at DESC);

-- ============================================================================
-- 3. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- BLOCKED_USERS RLS
ALTER TABLE blocked_users ENABLE ROW LEVEL SECURITY;

-- Users can view their own blocks (both directions for mutual visibility)
CREATE POLICY "Users can view their own blocks"
    ON blocked_users FOR SELECT
    USING (auth.uid() = blocker_id OR auth.uid() = blocked_id);

-- Users can only block others (insert)
CREATE POLICY "Users can block others"
    ON blocked_users FOR INSERT
    WITH CHECK (auth.uid() = blocker_id);

-- Users can only unblock users they blocked (delete)
CREATE POLICY "Users can unblock users they blocked"
    ON blocked_users FOR DELETE
    USING (auth.uid() = blocker_id);

-- Users cannot update blocks (no UPDATE policy = no updates allowed)

-- REPORTS RLS
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- Users can view their own reports
CREATE POLICY "Users can view their own reports"
    ON reports FOR SELECT
    USING (auth.uid() = reporter_id);

-- Users can create reports
CREATE POLICY "Users can create reports"
    ON reports FOR INSERT
    WITH CHECK (auth.uid() = reporter_id);

-- Users cannot update or delete reports (no UPDATE/DELETE policies)

-- ============================================================================
-- 4. HELPER FUNCTIONS
-- ============================================================================

-- Function: Check if a user is blocked (bidirectional check)
-- Returns true if either user has blocked the other
CREATE OR REPLACE FUNCTION is_user_blocked(user1_id UUID, user2_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1
        FROM blocked_users
        WHERE (blocker_id = user1_id AND blocked_id = user2_id)
           OR (blocker_id = user2_id AND blocked_id = user1_id)
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Get all blocked user IDs for a given user (bidirectional)
-- Returns IDs of users who have blocked this user OR users this user has blocked
CREATE OR REPLACE FUNCTION get_blocked_user_ids(for_user_id UUID)
RETURNS TABLE(blocked_user_id UUID) AS $$
BEGIN
    RETURN QUERY
    SELECT DISTINCT
        CASE 
            WHEN blocker_id = for_user_id THEN blocked_id
            ELSE blocker_id
        END AS blocked_user_id
    FROM blocked_users
    WHERE blocker_id = for_user_id OR blocked_id = for_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 5. COMMENTS (Documentation)
-- ============================================================================

COMMENT ON TABLE blocked_users IS 'Tracks user blocks for safety and harassment prevention';
COMMENT ON TABLE reports IS 'Stores user reports for moderation review';
COMMENT ON FUNCTION is_user_blocked IS 'Checks if two users have blocked each other (bidirectional)';
COMMENT ON FUNCTION get_blocked_user_ids IS 'Returns all user IDs that are blocked in relation to the given user (bidirectional)';

