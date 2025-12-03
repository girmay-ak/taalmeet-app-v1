-- =====================================================
-- TAALMEET Row Level Security (RLS) Policies
-- Version: 1.0.0
-- Description: Secure access control for all tables
-- =====================================================

-- =====================================================
-- 1. USERS TABLE RLS
-- =====================================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Users can view all profiles
CREATE POLICY "Users can view all profiles"
    ON users FOR SELECT
    USING (true);

-- Users can insert their own profile
CREATE POLICY "Users can insert their own profile"
    ON users FOR INSERT
    WITH CHECK (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update their own profile"
    ON users FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Users cannot delete their profile (handled by auth cascade)
CREATE POLICY "Users cannot delete profiles"
    ON users FOR DELETE
    USING (false);

-- =====================================================
-- 2. USER LANGUAGES TABLE RLS
-- =====================================================

ALTER TABLE user_languages ENABLE ROW LEVEL SECURITY;

-- Anyone can view user languages
CREATE POLICY "Anyone can view user languages"
    ON user_languages FOR SELECT
    USING (true);

-- Users can insert their own languages
CREATE POLICY "Users can insert their own languages"
    ON user_languages FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can update their own languages
CREATE POLICY "Users can update their own languages"
    ON user_languages FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Users can delete their own languages
CREATE POLICY "Users can delete their own languages"
    ON user_languages FOR DELETE
    USING (auth.uid() = user_id);

-- =====================================================
-- 3. LOCATIONS TABLE RLS
-- =====================================================

ALTER TABLE locations ENABLE ROW LEVEL SECURITY;

-- Users can view all locations (needed for map)
CREATE POLICY "Users can view all locations"
    ON locations FOR SELECT
    USING (true);

-- Users can insert their own location
CREATE POLICY "Users can insert their own location"
    ON locations FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can update their own location
CREATE POLICY "Users can update their own location"
    ON locations FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Users can delete their own location
CREATE POLICY "Users can delete their own location"
    ON locations FOR DELETE
    USING (auth.uid() = user_id);

-- =====================================================
-- 4. MESSAGES TABLE RLS
-- =====================================================

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Users can view messages they sent or received
CREATE POLICY "Users can view their own messages"
    ON messages FOR SELECT
    USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

-- Users can send messages
CREATE POLICY "Users can send messages"
    ON messages FOR INSERT
    WITH CHECK (auth.uid() = sender_id);

-- Users can update messages they received (mark as read)
CREATE POLICY "Users can update received messages"
    ON messages FOR UPDATE
    USING (auth.uid() = receiver_id)
    WITH CHECK (auth.uid() = receiver_id);

-- Users cannot delete messages
CREATE POLICY "Users cannot delete messages"
    ON messages FOR DELETE
    USING (false);

-- =====================================================
-- 5. MATCHES TABLE RLS
-- =====================================================

ALTER TABLE matches ENABLE ROW LEVEL SECURITY;

-- Users can view matches they are part of
CREATE POLICY "Users can view their own matches"
    ON matches FOR SELECT
    USING (auth.uid() = user_id_1 OR auth.uid() = user_id_2);

-- Users can create match requests
CREATE POLICY "Users can create matches"
    ON matches FOR INSERT
    WITH CHECK (auth.uid() = user_id_1 OR auth.uid() = user_id_2);

-- Users can update matches they are part of (accept/reject)
CREATE POLICY "Users can update their matches"
    ON matches FOR UPDATE
    USING (auth.uid() = user_id_1 OR auth.uid() = user_id_2)
    WITH CHECK (auth.uid() = user_id_1 OR auth.uid() = user_id_2);

-- Users can delete matches they created
CREATE POLICY "Users can delete their matches"
    ON matches FOR DELETE
    USING (auth.uid() = user_id_1 OR auth.uid() = user_id_2);

