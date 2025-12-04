-- ============================================================================
-- Migration: Push Notifications System
-- ============================================================================
-- 
-- Description: Implements push notification system with device token management
--              and notification preferences for Expo Push Notifications.
--
-- Tables:
--   - device_tokens: Stores Expo push notification tokens for devices
--   - notification_preferences: User preferences for different notification types
--
-- ============================================================================

-- ============================================================================
-- 1. DEVICE_TOKENS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS device_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    token TEXT NOT NULL,
    device_id TEXT, -- Unique device identifier
    platform TEXT NOT NULL CHECK (platform IN ('ios', 'android', 'web')),
    app_version TEXT,
    device_info JSONB, -- Additional device information
    is_active BOOLEAN DEFAULT true,
    last_used_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, token)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_device_tokens_user_id ON device_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_device_tokens_token ON device_tokens(token);
CREATE INDEX IF NOT EXISTS idx_device_tokens_is_active ON device_tokens(is_active);
CREATE INDEX IF NOT EXISTS idx_device_tokens_user_active ON device_tokens(user_id, is_active) WHERE is_active = true;

-- ============================================================================
-- 2. NOTIFICATION_PREFERENCES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS notification_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
    push_enabled BOOLEAN DEFAULT true,
    new_message_enabled BOOLEAN DEFAULT true,
    connection_request_enabled BOOLEAN DEFAULT true,
    connection_accepted_enabled BOOLEAN DEFAULT true,
    match_found_enabled BOOLEAN DEFAULT true,
    session_reminder_enabled BOOLEAN DEFAULT true,
    session_starting_soon_enabled BOOLEAN DEFAULT true,
    achievement_unlocked_enabled BOOLEAN DEFAULT true,
    weekly_summary_enabled BOOLEAN DEFAULT true,
    marketing_enabled BOOLEAN DEFAULT false,
    quiet_hours_start TIME, -- e.g., '22:00:00'
    quiet_hours_end TIME,   -- e.g., '08:00:00'
    timezone TEXT DEFAULT 'UTC',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_notification_preferences_user_id ON notification_preferences(user_id);

-- ============================================================================
-- 3. NOTIFICATION_LOG TABLE (Optional - for tracking sent notifications)
-- ============================================================================

CREATE TABLE IF NOT EXISTS notification_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    device_token_id UUID REFERENCES device_tokens(id) ON DELETE SET NULL,
    notification_type TEXT NOT NULL CHECK (notification_type IN (
        'new_message',
        'connection_request',
        'connection_accepted',
        'match_found',
        'session_reminder',
        'session_starting_soon',
        'achievement_unlocked',
        'weekly_summary',
        'marketing'
    )),
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    data JSONB, -- Additional notification data
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed', 'delivered')),
    error_message TEXT,
    sent_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_notification_log_user_id ON notification_log(user_id);
CREATE INDEX IF NOT EXISTS idx_notification_log_type ON notification_log(notification_type);
CREATE INDEX IF NOT EXISTS idx_notification_log_status ON notification_log(status);
CREATE INDEX IF NOT EXISTS idx_notification_log_created_at ON notification_log(created_at DESC);

-- ============================================================================
-- 4. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- DEVICE_TOKENS RLS
ALTER TABLE device_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own device tokens"
    ON device_tokens FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own device tokens"
    ON device_tokens FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own device tokens"
    ON device_tokens FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own device tokens"
    ON device_tokens FOR DELETE
    USING (auth.uid() = user_id);

-- NOTIFICATION_PREFERENCES RLS
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own preferences"
    ON notification_preferences FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own preferences"
    ON notification_preferences FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own preferences"
    ON notification_preferences FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- NOTIFICATION_LOG RLS
ALTER TABLE notification_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own notification log"
    ON notification_log FOR SELECT
    USING (auth.uid() = user_id);

-- ============================================================================
-- 5. HELPER FUNCTIONS
-- ============================================================================

-- Function: Get active device tokens for a user
CREATE OR REPLACE FUNCTION get_user_active_tokens(p_user_id UUID)
RETURNS TABLE (
    id UUID,
    token TEXT,
    platform TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        dt.id,
        dt.token,
        dt.platform
    FROM device_tokens dt
    WHERE dt.user_id = p_user_id
    AND dt.is_active = true
    ORDER BY dt.last_used_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Update device token last used timestamp
CREATE OR REPLACE FUNCTION update_device_token_usage(p_token TEXT)
RETURNS void AS $$
BEGIN
    UPDATE device_tokens
    SET last_used_at = NOW(), updated_at = NOW()
    WHERE token = p_token;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Deactivate old device tokens (keep only latest N per user)
CREATE OR REPLACE FUNCTION cleanup_old_device_tokens(p_user_id UUID, p_keep_count INTEGER DEFAULT 5)
RETURNS void AS $$
BEGIN
    -- Deactivate tokens beyond the keep count, keeping the most recently used ones
    UPDATE device_tokens
    SET is_active = false, updated_at = NOW()
    WHERE user_id = p_user_id
    AND id NOT IN (
        SELECT id
        FROM device_tokens
        WHERE user_id = p_user_id
        ORDER BY last_used_at DESC
        LIMIT p_keep_count
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 6. TRIGGERS
-- ============================================================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_notification_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_device_tokens_updated_at
    BEFORE UPDATE ON device_tokens
    FOR EACH ROW
    EXECUTE FUNCTION update_notification_updated_at();

CREATE TRIGGER update_notification_preferences_updated_at
    BEFORE UPDATE ON notification_preferences
    FOR EACH ROW
    EXECUTE FUNCTION update_notification_updated_at();

-- ============================================================================
-- 7. COMMENTS
-- ============================================================================

COMMENT ON TABLE device_tokens IS 'Stores Expo push notification tokens for user devices';
COMMENT ON TABLE notification_preferences IS 'User preferences for different notification types';
COMMENT ON TABLE notification_log IS 'Log of sent push notifications for tracking and debugging';
COMMENT ON FUNCTION get_user_active_tokens IS 'Gets all active device tokens for a user';
COMMENT ON FUNCTION update_device_token_usage IS 'Updates the last used timestamp for a device token';
COMMENT ON FUNCTION cleanup_old_device_tokens IS 'Deactivates old device tokens, keeping only the most recent ones';

