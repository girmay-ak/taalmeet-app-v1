-- ============================================================================
-- Migration: Groups & Communities System
-- ============================================================================
-- 
-- Description: Implements groups and communities system for language exchange
--
-- Tables:
--   - groups: Language exchange groups/communities
--   - group_members: Group membership and roles
--   - group_posts: Posts within groups
--   - group_events: Events organized by groups
--
-- ============================================================================

-- ============================================================================
-- 1. GROUPS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS groups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    cover_image_url TEXT,
    language TEXT NOT NULL, -- Primary language of the group
    location TEXT, -- City or region
    lat DECIMAL(10, 8),
    lng DECIMAL(11, 8),
    is_public BOOLEAN DEFAULT true, -- Public or private group
    is_verified BOOLEAN DEFAULT false, -- Verified by admins
    member_count INTEGER DEFAULT 0,
    post_count INTEGER DEFAULT 0,
    event_count INTEGER DEFAULT 0,
    created_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_groups_language ON groups(language);
CREATE INDEX IF NOT EXISTS idx_groups_location ON groups(location);
CREATE INDEX IF NOT EXISTS idx_groups_is_public ON groups(is_public);
CREATE INDEX IF NOT EXISTS idx_groups_created_by ON groups(created_by);
CREATE INDEX IF NOT EXISTS idx_groups_created_at ON groups(created_at DESC);

-- ============================================================================
-- 2. GROUP_MEMBERS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS group_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    role TEXT DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'moderator', 'member')),
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'pending', 'banned', 'left')),
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    last_active_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(group_id, user_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_group_members_group_id ON group_members(group_id);
CREATE INDEX IF NOT EXISTS idx_group_members_user_id ON group_members(user_id);
CREATE INDEX IF NOT EXISTS idx_group_members_role ON group_members(role);
CREATE INDEX IF NOT EXISTS idx_group_members_status ON group_members(status);
CREATE INDEX IF NOT EXISTS idx_group_members_group_status ON group_members(group_id, status) WHERE status = 'active';

-- ============================================================================
-- 3. GROUP_POSTS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS group_posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    image_urls TEXT[], -- Array of image URLs
    like_count INTEGER DEFAULT 0,
    comment_count INTEGER DEFAULT 0,
    is_pinned BOOLEAN DEFAULT false,
    is_edited BOOLEAN DEFAULT false,
    edited_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_group_posts_group_id ON group_posts(group_id);
CREATE INDEX IF NOT EXISTS idx_group_posts_author_id ON group_posts(author_id);
CREATE INDEX IF NOT EXISTS idx_group_posts_created_at ON group_posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_group_posts_is_pinned ON group_posts(is_pinned);
CREATE INDEX IF NOT EXISTS idx_group_posts_group_pinned ON group_posts(group_id, is_pinned, created_at DESC);

-- ============================================================================
-- 4. GROUP_POST_LIKES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS group_post_likes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID NOT NULL REFERENCES group_posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(post_id, user_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_group_post_likes_post_id ON group_post_likes(post_id);
CREATE INDEX IF NOT EXISTS idx_group_post_likes_user_id ON group_post_likes(user_id);

-- ============================================================================
-- 5. GROUP_POST_COMMENTS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS group_post_comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID NOT NULL REFERENCES group_posts(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    parent_comment_id UUID REFERENCES group_post_comments(id) ON DELETE CASCADE, -- For nested comments
    like_count INTEGER DEFAULT 0,
    is_edited BOOLEAN DEFAULT false,
    edited_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_group_post_comments_post_id ON group_post_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_group_post_comments_author_id ON group_post_comments(author_id);
CREATE INDEX IF NOT EXISTS idx_group_post_comments_parent_id ON group_post_comments(parent_comment_id);
CREATE INDEX IF NOT EXISTS idx_group_post_comments_created_at ON group_post_comments(created_at ASC);

-- ============================================================================
-- 6. GROUP_EVENTS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS group_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
    created_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    event_type TEXT DEFAULT 'meetup' CHECK (event_type IN ('meetup', 'online', 'workshop', 'social')),
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ,
    location TEXT,
    lat DECIMAL(10, 8),
    lng DECIMAL(11, 8),
    max_participants INTEGER,
    participant_count INTEGER DEFAULT 0,
    is_online BOOLEAN DEFAULT false,
    online_link TEXT, -- For online events
    cover_image_url TEXT,
    status TEXT DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'ongoing', 'completed', 'cancelled')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_group_events_group_id ON group_events(group_id);
CREATE INDEX IF NOT EXISTS idx_group_events_created_by ON group_events(created_by);
CREATE INDEX IF NOT EXISTS idx_group_events_start_time ON group_events(start_time);
CREATE INDEX IF NOT EXISTS idx_group_events_status ON group_events(status);
CREATE INDEX IF NOT EXISTS idx_group_events_group_status ON group_events(group_id, status, start_time);

-- ============================================================================
-- 7. GROUP_EVENT_PARTICIPANTS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS group_event_participants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID NOT NULL REFERENCES group_events(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'going' CHECK (status IN ('going', 'interested', 'not_going')),
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(event_id, user_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_group_event_participants_event_id ON group_event_participants(event_id);
CREATE INDEX IF NOT EXISTS idx_group_event_participants_user_id ON group_event_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_group_event_participants_status ON group_event_participants(status);

-- ============================================================================
-- 8. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- GROUPS RLS
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view public groups"
    ON groups FOR SELECT
    USING (is_public = true OR auth.uid() IN (SELECT user_id FROM group_members WHERE group_id = groups.id));

CREATE POLICY "Authenticated users can create groups"
    ON groups FOR INSERT
    WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Group owners and admins can update groups"
    ON groups FOR UPDATE
    USING (
        auth.uid() = created_by
        OR auth.uid() IN (
            SELECT user_id FROM group_members
            WHERE group_id = groups.id
            AND role IN ('owner', 'admin')
            AND status = 'active'
        )
    );

-- GROUP_MEMBERS RLS
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view members of groups they belong to"
    ON group_members FOR SELECT
    USING (
        auth.uid() = user_id
        OR auth.uid() IN (SELECT user_id FROM group_members WHERE group_id = group_members.group_id AND status = 'active')
    );

CREATE POLICY "Users can join public groups"
    ON group_members FOR INSERT
    WITH CHECK (
        auth.uid() = user_id
        AND EXISTS (SELECT 1 FROM groups WHERE id = group_id AND is_public = true)
    );

CREATE POLICY "Users can update their own membership"
    ON group_members FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Group owners and admins can manage members"
    ON group_members FOR ALL
    USING (
        auth.uid() IN (
            SELECT user_id FROM group_members
            WHERE group_id = group_members.group_id
            AND role IN ('owner', 'admin')
            AND status = 'active'
        )
    );

-- GROUP_POSTS RLS
ALTER TABLE group_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view posts in their groups"
    ON group_posts FOR SELECT
    USING (
        auth.uid() IN (
            SELECT user_id FROM group_members
            WHERE group_id = group_posts.group_id
            AND status = 'active'
        )
    );

CREATE POLICY "Members can create posts"
    ON group_posts FOR INSERT
    WITH CHECK (
        auth.uid() = author_id
        AND auth.uid() IN (
            SELECT user_id FROM group_members
            WHERE group_id = group_posts.group_id
            AND status = 'active'
        )
    );

CREATE POLICY "Authors and moderators can update posts"
    ON group_posts FOR UPDATE
    USING (
        auth.uid() = author_id
        OR auth.uid() IN (
            SELECT user_id FROM group_members
            WHERE group_id = group_posts.group_id
            AND role IN ('owner', 'admin', 'moderator')
            AND status = 'active'
        )
    );

CREATE POLICY "Authors and moderators can delete posts"
    ON group_posts FOR DELETE
    USING (
        auth.uid() = author_id
        OR auth.uid() IN (
            SELECT user_id FROM group_members
            WHERE group_id = group_posts.group_id
            AND role IN ('owner', 'admin', 'moderator')
            AND status = 'active'
        )
    );

-- GROUP_POST_LIKES RLS
ALTER TABLE group_post_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view likes"
    ON group_post_likes FOR SELECT
    USING (
        auth.uid() IN (
            SELECT user_id FROM group_members
            WHERE group_id = (SELECT group_id FROM group_posts WHERE id = group_post_likes.post_id)
            AND status = 'active'
        )
    );

CREATE POLICY "Members can like posts"
    ON group_post_likes FOR INSERT
    WITH CHECK (
        auth.uid() = user_id
        AND auth.uid() IN (
            SELECT user_id FROM group_members
            WHERE group_id = (SELECT group_id FROM group_posts WHERE id = group_post_likes.post_id)
            AND status = 'active'
        )
    );

CREATE POLICY "Users can unlike their own likes"
    ON group_post_likes FOR DELETE
    USING (auth.uid() = user_id);

-- GROUP_POST_COMMENTS RLS
ALTER TABLE group_post_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view comments"
    ON group_post_comments FOR SELECT
    USING (
        auth.uid() IN (
            SELECT user_id FROM group_members
            WHERE group_id = (SELECT group_id FROM group_posts WHERE id = group_post_comments.post_id)
            AND status = 'active'
        )
    );

CREATE POLICY "Members can create comments"
    ON group_post_comments FOR INSERT
    WITH CHECK (
        auth.uid() = author_id
        AND auth.uid() IN (
            SELECT user_id FROM group_members
            WHERE group_id = (SELECT group_id FROM group_posts WHERE id = group_post_comments.post_id)
            AND status = 'active'
        )
    );

CREATE POLICY "Authors and moderators can update comments"
    ON group_post_comments FOR UPDATE
    USING (
        auth.uid() = author_id
        OR auth.uid() IN (
            SELECT user_id FROM group_members
            WHERE group_id = (SELECT group_id FROM group_posts WHERE id = group_post_comments.post_id)
            AND role IN ('owner', 'admin', 'moderator')
            AND status = 'active'
        )
    );

CREATE POLICY "Authors and moderators can delete comments"
    ON group_post_comments FOR DELETE
    USING (
        auth.uid() = author_id
        OR auth.uid() IN (
            SELECT user_id FROM group_members
            WHERE group_id = (SELECT group_id FROM group_posts WHERE id = group_post_comments.post_id)
            AND role IN ('owner', 'admin', 'moderator')
            AND status = 'active'
        )
    );

-- GROUP_EVENTS RLS
ALTER TABLE group_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view events in their groups"
    ON group_events FOR SELECT
    USING (
        auth.uid() IN (
            SELECT user_id FROM group_members
            WHERE group_id = group_events.group_id
            AND status = 'active'
        )
    );

CREATE POLICY "Members can create events"
    ON group_events FOR INSERT
    WITH CHECK (
        auth.uid() = created_by
        AND auth.uid() IN (
            SELECT user_id FROM group_members
            WHERE group_id = group_events.group_id
            AND status = 'active'
        )
    );

CREATE POLICY "Event creators and moderators can update events"
    ON group_events FOR UPDATE
    USING (
        auth.uid() = created_by
        OR auth.uid() IN (
            SELECT user_id FROM group_members
            WHERE group_id = group_events.group_id
            AND role IN ('owner', 'admin', 'moderator')
            AND status = 'active'
        )
    );

-- GROUP_EVENT_PARTICIPANTS RLS
ALTER TABLE group_event_participants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view event participants"
    ON group_event_participants FOR SELECT
    USING (
        auth.uid() IN (
            SELECT user_id FROM group_members
            WHERE group_id = (SELECT group_id FROM group_events WHERE id = group_event_participants.event_id)
            AND status = 'active'
        )
    );

CREATE POLICY "Members can join events"
    ON group_event_participants FOR INSERT
    WITH CHECK (
        auth.uid() = user_id
        AND auth.uid() IN (
            SELECT user_id FROM group_members
            WHERE group_id = (SELECT group_id FROM group_events WHERE id = group_event_participants.event_id)
            AND status = 'active'
        )
    );

CREATE POLICY "Users can update their own participation"
    ON group_event_participants FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- 9. TRIGGERS
-- ============================================================================

-- Update group member_count when members join/leave
CREATE OR REPLACE FUNCTION update_group_member_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' AND NEW.status = 'active' THEN
        UPDATE groups SET member_count = member_count + 1 WHERE id = NEW.group_id;
    ELSIF TG_OP = 'UPDATE' THEN
        IF OLD.status = 'active' AND NEW.status != 'active' THEN
            UPDATE groups SET member_count = member_count - 1 WHERE id = NEW.group_id;
        ELSIF OLD.status != 'active' AND NEW.status = 'active' THEN
            UPDATE groups SET member_count = member_count + 1 WHERE id = NEW.group_id;
        END IF;
    ELSIF TG_OP = 'DELETE' AND OLD.status = 'active' THEN
        UPDATE groups SET member_count = member_count - 1 WHERE id = OLD.group_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_group_member_count_trigger
    AFTER INSERT OR UPDATE OR DELETE ON group_members
    FOR EACH ROW
    EXECUTE FUNCTION update_group_member_count();

-- Update group post_count when posts are created/deleted
CREATE OR REPLACE FUNCTION update_group_post_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE groups SET post_count = post_count + 1 WHERE id = NEW.group_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE groups SET post_count = post_count - 1 WHERE id = OLD.group_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_group_post_count_trigger
    AFTER INSERT OR DELETE ON group_posts
    FOR EACH ROW
    EXECUTE FUNCTION update_group_post_count();

-- Update post like_count when likes are added/removed
CREATE OR REPLACE FUNCTION update_post_like_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE group_posts SET like_count = like_count + 1 WHERE id = NEW.post_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE group_posts SET like_count = like_count - 1 WHERE id = OLD.post_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_post_like_count_trigger
    AFTER INSERT OR DELETE ON group_post_likes
    FOR EACH ROW
    EXECUTE FUNCTION update_post_like_count();

-- Update post comment_count when comments are added/deleted
CREATE OR REPLACE FUNCTION update_post_comment_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE group_posts SET comment_count = comment_count + 1 WHERE id = NEW.post_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE group_posts SET comment_count = comment_count - 1 WHERE id = OLD.post_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_post_comment_count_trigger
    AFTER INSERT OR DELETE ON group_post_comments
    FOR EACH ROW
    EXECUTE FUNCTION update_post_comment_count();

-- Update event participant_count
CREATE OR REPLACE FUNCTION update_event_participant_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' AND NEW.status = 'going' THEN
        UPDATE group_events SET participant_count = participant_count + 1 WHERE id = NEW.event_id;
    ELSIF TG_OP = 'UPDATE' THEN
        IF OLD.status = 'going' AND NEW.status != 'going' THEN
            UPDATE group_events SET participant_count = participant_count - 1 WHERE id = NEW.event_id;
        ELSIF OLD.status != 'going' AND NEW.status = 'going' THEN
            UPDATE group_events SET participant_count = participant_count + 1 WHERE id = NEW.event_id;
        END IF;
    ELSIF TG_OP = 'DELETE' AND OLD.status = 'going' THEN
        UPDATE group_events SET participant_count = participant_count - 1 WHERE id = OLD.event_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_event_participant_count_trigger
    AFTER INSERT OR UPDATE OR DELETE ON group_event_participants
    FOR EACH ROW
    EXECUTE FUNCTION update_event_participant_count();

-- Update group event_count
CREATE OR REPLACE FUNCTION update_group_event_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE groups SET event_count = event_count + 1 WHERE id = NEW.group_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE groups SET event_count = event_count - 1 WHERE id = OLD.group_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_group_event_count_trigger
    AFTER INSERT OR DELETE ON group_events
    FOR EACH ROW
    EXECUTE FUNCTION update_group_event_count();

-- Auto-update updated_at timestamp
CREATE TRIGGER update_groups_updated_at
    BEFORE UPDATE ON groups
    FOR EACH ROW
    EXECUTE FUNCTION update_help_updated_at();

CREATE TRIGGER update_group_posts_updated_at
    BEFORE UPDATE ON group_posts
    FOR EACH ROW
    EXECUTE FUNCTION update_help_updated_at();

CREATE TRIGGER update_group_post_comments_updated_at
    BEFORE UPDATE ON group_post_comments
    FOR EACH ROW
    EXECUTE FUNCTION update_help_updated_at();

CREATE TRIGGER update_group_events_updated_at
    BEFORE UPDATE ON group_events
    FOR EACH ROW
    EXECUTE FUNCTION update_help_updated_at();

-- ============================================================================
-- 10. COMMENTS
-- ============================================================================

COMMENT ON TABLE groups IS 'Language exchange groups and communities';
COMMENT ON TABLE group_members IS 'Group membership and roles';
COMMENT ON TABLE group_posts IS 'Posts within groups';
COMMENT ON TABLE group_post_likes IS 'Likes on group posts';
COMMENT ON TABLE group_post_comments IS 'Comments on group posts';
COMMENT ON TABLE group_events IS 'Events organized by groups';
COMMENT ON TABLE group_event_participants IS 'Event participants';

