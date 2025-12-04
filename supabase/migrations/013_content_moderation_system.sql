-- ============================================================================
-- Migration: Content Moderation System
-- ============================================================================
-- 
-- Description: Implements content moderation system for App Store compliance
--              including user actions (warnings, suspensions, bans) and
--              report status tracking.
--
-- Tables:
--   - user_actions: Tracks moderation actions taken against users
--   - report_status: Tracks the status of user reports
--
-- Security: All tables have RLS enabled with admin-only access policies
-- ============================================================================

-- ============================================================================
-- 1. USER_ACTIONS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS user_actions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    action_type TEXT NOT NULL CHECK (action_type IN ('warning', 'suspension', 'ban')),
    reason TEXT NOT NULL,
    details TEXT,
    duration_days INTEGER, -- For suspensions (NULL = permanent ban)
    expires_at TIMESTAMPTZ, -- When suspension/ban expires (NULL = permanent)
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES profiles(id), -- Admin who took the action
    created_at TIMESTAMPTZ DEFAULT NOW(),
    resolved_at TIMESTAMPTZ, -- When action was resolved/appealed
    resolved_by UUID REFERENCES profiles(id) -- Admin who resolved it
);

-- Indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_user_actions_user_id ON user_actions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_actions_action_type ON user_actions(action_type);
CREATE INDEX IF NOT EXISTS idx_user_actions_is_active ON user_actions(is_active);
CREATE INDEX IF NOT EXISTS idx_user_actions_expires_at ON user_actions(expires_at);
CREATE INDEX IF NOT EXISTS idx_user_actions_created_at ON user_actions(created_at DESC);

-- ============================================================================
-- 2. UPDATE REPORTS TABLE
-- ============================================================================

-- Add status and admin notes to reports table if they don't exist
DO $$ 
BEGIN
    -- Add status column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'reports' AND column_name = 'status'
    ) THEN
        ALTER TABLE reports ADD COLUMN status TEXT DEFAULT 'pending' 
            CHECK (status IN ('pending', 'reviewing', 'resolved', 'dismissed', 'action_taken'));
    END IF;

    -- Add admin_notes column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'reports' AND column_name = 'admin_notes'
    ) THEN
        ALTER TABLE reports ADD COLUMN admin_notes TEXT;
    END IF;

    -- Add reviewed_by column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'reports' AND column_name = 'reviewed_by'
    ) THEN
        ALTER TABLE reports ADD COLUMN reviewed_by UUID REFERENCES profiles(id);
    END IF;

    -- Add reviewed_at column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'reports' AND column_name = 'reviewed_at'
    ) THEN
        ALTER TABLE reports ADD COLUMN reviewed_at TIMESTAMPTZ;
    END IF;

    -- Add action_taken_id column if it doesn't exist (links to user_actions)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'reports' AND column_name = 'action_taken_id'
    ) THEN
        ALTER TABLE reports ADD COLUMN action_taken_id UUID REFERENCES user_actions(id);
    END IF;
END $$;

-- Index for report status queries
CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status);
CREATE INDEX IF NOT EXISTS idx_reports_created_at ON reports(created_at DESC);

-- ============================================================================
-- 3. ADMIN_USERS TABLE (Simple admin flag)
-- ============================================================================

-- Add is_admin flag to profiles table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'is_admin'
    ) THEN
        ALTER TABLE profiles ADD COLUMN is_admin BOOLEAN DEFAULT false;
    END IF;
END $$;

-- Index for admin queries
CREATE INDEX IF NOT EXISTS idx_profiles_is_admin ON profiles(is_admin) WHERE is_admin = true;

-- ============================================================================
-- 4. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- USER_ACTIONS RLS
ALTER TABLE user_actions ENABLE ROW LEVEL SECURITY;

-- Users can view their own actions
CREATE POLICY "Users can view their own actions"
    ON user_actions FOR SELECT
    USING (auth.uid() = user_id);

-- Only admins can insert/update/delete actions
-- Note: This requires checking is_admin flag - we'll use a function for this
CREATE POLICY "Admins can manage user actions"
    ON user_actions FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND is_admin = true
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND is_admin = true
        )
    );

-- REPORTS RLS (Update existing policies)
-- Users can view their own reports
DROP POLICY IF EXISTS "Users can view their own reports" ON reports;
CREATE POLICY "Users can view their own reports"
    ON reports FOR SELECT
    USING (auth.uid() = reporter_id);

-- Admins can view all reports
CREATE POLICY "Admins can view all reports"
    ON reports FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND is_admin = true
        )
    );

-- Users can create reports (existing policy should work)
-- Admins can update reports
CREATE POLICY "Admins can update reports"
    ON reports FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND is_admin = true
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND is_admin = true
        )
    );

-- ============================================================================
-- 5. HELPER FUNCTIONS
-- ============================================================================

-- Function: Check if user is admin
CREATE OR REPLACE FUNCTION is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = user_id AND is_admin = true
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Check if user is banned or suspended
CREATE OR REPLACE FUNCTION is_user_banned_or_suspended(check_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM user_actions
        WHERE user_id = check_user_id
        AND is_active = true
        AND action_type IN ('ban', 'suspension')
        AND (expires_at IS NULL OR expires_at > NOW())
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Get active actions for a user
CREATE OR REPLACE FUNCTION get_user_active_actions(check_user_id UUID)
RETURNS TABLE (
    id UUID,
    action_type TEXT,
    reason TEXT,
    expires_at TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ua.id,
        ua.action_type,
        ua.reason,
        ua.expires_at
    FROM user_actions ua
    WHERE ua.user_id = check_user_id
    AND ua.is_active = true
    AND (ua.expires_at IS NULL OR ua.expires_at > NOW())
    ORDER BY ua.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 6. TRIGGERS
-- ============================================================================

-- Function: Auto-expire suspensions/bans
CREATE OR REPLACE FUNCTION expire_user_actions()
RETURNS TRIGGER AS $$
BEGIN
    -- Mark expired actions as inactive
    UPDATE user_actions
    SET is_active = false, resolved_at = NOW()
    WHERE expires_at IS NOT NULL
    AND expires_at <= NOW()
    AND is_active = true;
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Check for expired actions on report insert/update
-- (This is a simple approach - in production, use a scheduled job)
CREATE TRIGGER check_expired_actions_on_report
    AFTER INSERT OR UPDATE ON reports
    FOR EACH STATEMENT
    EXECUTE FUNCTION expire_user_actions();

-- ============================================================================
-- 7. COMMENTS (Documentation)
-- ============================================================================

COMMENT ON TABLE user_actions IS 'Tracks moderation actions (warnings, suspensions, bans) taken against users';
COMMENT ON TABLE reports IS 'User reports with status tracking for moderation';
COMMENT ON FUNCTION is_admin IS 'Checks if a user is an admin';
COMMENT ON FUNCTION is_user_banned_or_suspended IS 'Checks if a user is currently banned or suspended';
COMMENT ON FUNCTION get_user_active_actions IS 'Returns all active moderation actions for a user';

