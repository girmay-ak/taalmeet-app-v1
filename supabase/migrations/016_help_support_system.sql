-- ============================================================================
-- Migration: Help & Support System
-- ============================================================================
-- 
-- Description: Implements help & support system with FAQs, help articles,
--              and support tickets for user assistance.
--
-- Tables:
--   - help_articles: Knowledge base articles and guides
--   - faqs: Frequently asked questions
--   - support_tickets: User support requests
--   - support_ticket_messages: Messages within support tickets
--
-- ============================================================================

-- ============================================================================
-- 1. HELP_ARTICLES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS help_articles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    content TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN (
        'getting_started',
        'features',
        'troubleshooting',
        'account',
        'safety',
        'payments',
        'other'
    )),
    tags TEXT[], -- Array of tags for searching
    order_index INTEGER DEFAULT 0, -- For ordering within category
    is_published BOOLEAN DEFAULT true,
    view_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL -- Admin who created it
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_help_articles_category ON help_articles(category);
CREATE INDEX IF NOT EXISTS idx_help_articles_slug ON help_articles(slug);
CREATE INDEX IF NOT EXISTS idx_help_articles_published ON help_articles(is_published);
CREATE INDEX IF NOT EXISTS idx_help_articles_category_published ON help_articles(category, is_published) WHERE is_published = true;
CREATE INDEX IF NOT EXISTS idx_help_articles_tags ON help_articles USING GIN(tags);

-- ============================================================================
-- 2. FAQS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS faqs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN (
        'general',
        'account',
        'connections',
        'messages',
        'safety',
        'payments',
        'technical',
        'other'
    )),
    order_index INTEGER DEFAULT 0, -- For ordering within category
    is_published BOOLEAN DEFAULT true,
    view_count INTEGER DEFAULT 0,
    helpful_count INTEGER DEFAULT 0, -- How many users found it helpful
    not_helpful_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL -- Admin who created it
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_faqs_category ON faqs(category);
CREATE INDEX IF NOT EXISTS idx_faqs_published ON faqs(is_published);
CREATE INDEX IF NOT EXISTS idx_faqs_category_published ON faqs(category, is_published) WHERE is_published = true;

-- ============================================================================
-- 3. SUPPORT_TICKETS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS support_tickets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    subject TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN (
        'account',
        'technical',
        'billing',
        'safety',
        'feature_request',
        'bug_report',
        'other'
    )),
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'waiting_user', 'resolved', 'closed')),
    assigned_to UUID REFERENCES profiles(id) ON DELETE SET NULL, -- Support staff/admin
    first_message TEXT NOT NULL, -- The initial message from user
    last_message_at TIMESTAMPTZ DEFAULT NOW(),
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_support_tickets_user_id ON support_tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON support_tickets(status);
CREATE INDEX IF NOT EXISTS idx_support_tickets_category ON support_tickets(category);
CREATE INDEX IF NOT EXISTS idx_support_tickets_assigned_to ON support_tickets(assigned_to);
CREATE INDEX IF NOT EXISTS idx_support_tickets_user_status ON support_tickets(user_id, status);

-- ============================================================================
-- 4. SUPPORT_TICKET_MESSAGES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS support_ticket_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ticket_id UUID NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    is_internal BOOLEAN DEFAULT false, -- Internal notes visible only to support staff
    attachments JSONB, -- Array of attachment URLs/metadata
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_support_ticket_messages_ticket_id ON support_ticket_messages(ticket_id);
CREATE INDEX IF NOT EXISTS idx_support_ticket_messages_sender_id ON support_ticket_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_support_ticket_messages_created_at ON support_ticket_messages(created_at DESC);

-- ============================================================================
-- 5. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- HELP_ARTICLES RLS
ALTER TABLE help_articles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view published help articles"
    ON help_articles FOR SELECT
    USING (is_published = true OR auth.uid() IN (SELECT id FROM profiles WHERE is_admin = true));

CREATE POLICY "Admins can manage help articles"
    ON help_articles FOR ALL
    USING (auth.uid() IN (SELECT id FROM profiles WHERE is_admin = true))
    WITH CHECK (auth.uid() IN (SELECT id FROM profiles WHERE is_admin = true));

-- FAQS RLS
ALTER TABLE faqs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view published FAQs"
    ON faqs FOR SELECT
    USING (is_published = true OR auth.uid() IN (SELECT id FROM profiles WHERE is_admin = true));

CREATE POLICY "Admins can manage FAQs"
    ON faqs FOR ALL
    USING (auth.uid() IN (SELECT id FROM profiles WHERE is_admin = true))
    WITH CHECK (auth.uid() IN (SELECT id FROM profiles WHERE is_admin = true));

-- SUPPORT_TICKETS RLS
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own tickets"
    ON support_tickets FOR SELECT
    USING (auth.uid() = user_id OR auth.uid() IN (SELECT id FROM profiles WHERE is_admin = true));

CREATE POLICY "Users can create their own tickets"
    ON support_tickets FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own open tickets"
    ON support_tickets FOR UPDATE
    USING (auth.uid() = user_id AND status IN ('open', 'waiting_user'))
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage all tickets"
    ON support_tickets FOR ALL
    USING (auth.uid() IN (SELECT id FROM profiles WHERE is_admin = true))
    WITH CHECK (auth.uid() IN (SELECT id FROM profiles WHERE is_admin = true));

-- SUPPORT_TICKET_MESSAGES RLS
ALTER TABLE support_ticket_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view messages in their tickets"
    ON support_ticket_messages FOR SELECT
    USING (
        auth.uid() IN (SELECT user_id FROM support_tickets WHERE id = ticket_id)
        OR auth.uid() IN (SELECT id FROM profiles WHERE is_admin = true)
    );

CREATE POLICY "Users can create messages in their tickets"
    ON support_ticket_messages FOR INSERT
    WITH CHECK (
        auth.uid() = sender_id
        AND auth.uid() IN (SELECT user_id FROM support_tickets WHERE id = ticket_id)
    );

CREATE POLICY "Admins can create messages in any ticket"
    ON support_ticket_messages FOR INSERT
    WITH CHECK (auth.uid() IN (SELECT id FROM profiles WHERE is_admin = true));

-- ============================================================================
-- 6. HELPER FUNCTIONS
-- ============================================================================

-- Function: Update ticket last_message_at when new message is added
CREATE OR REPLACE FUNCTION update_ticket_last_message()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE support_tickets
    SET last_message_at = NOW(), updated_at = NOW()
    WHERE id = NEW.ticket_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_ticket_last_message_trigger
    AFTER INSERT ON support_ticket_messages
    FOR EACH ROW
    EXECUTE FUNCTION update_ticket_last_message();

-- Function: Increment article view count
CREATE OR REPLACE FUNCTION increment_article_views(article_id UUID)
RETURNS void AS $$
BEGIN
    UPDATE help_articles
    SET view_count = view_count + 1
    WHERE id = article_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Increment FAQ view count
CREATE OR REPLACE FUNCTION increment_faq_views(faq_id UUID)
RETURNS void AS $$
BEGIN
    UPDATE faqs
    SET view_count = view_count + 1
    WHERE id = faq_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Mark FAQ as helpful/not helpful
CREATE OR REPLACE FUNCTION rate_faq(faq_id UUID, is_helpful BOOLEAN)
RETURNS void AS $$
BEGIN
    IF is_helpful THEN
        UPDATE faqs
        SET helpful_count = helpful_count + 1
        WHERE id = faq_id;
    ELSE
        UPDATE faqs
        SET not_helpful_count = not_helpful_count + 1
        WHERE id = faq_id;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 7. TRIGGERS
-- ============================================================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_help_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_help_articles_updated_at
    BEFORE UPDATE ON help_articles
    FOR EACH ROW
    EXECUTE FUNCTION update_help_updated_at();

CREATE TRIGGER update_faqs_updated_at
    BEFORE UPDATE ON faqs
    FOR EACH ROW
    EXECUTE FUNCTION update_help_updated_at();

CREATE TRIGGER update_support_tickets_updated_at
    BEFORE UPDATE ON support_tickets
    FOR EACH ROW
    EXECUTE FUNCTION update_help_updated_at();

-- ============================================================================
-- 8. SEED DATA (Optional - can be added via admin panel later)
-- ============================================================================

-- Insert some default FAQs (these will be created by admins, but we can add a few examples)
-- Note: We'll skip seed data for now as it requires admin user IDs

-- ============================================================================
-- 9. COMMENTS
-- ============================================================================

COMMENT ON TABLE help_articles IS 'Knowledge base articles and help guides';
COMMENT ON TABLE faqs IS 'Frequently asked questions';
COMMENT ON TABLE support_tickets IS 'User support requests and tickets';
COMMENT ON TABLE support_ticket_messages IS 'Messages within support tickets';
COMMENT ON FUNCTION increment_article_views IS 'Increments the view count for a help article';
COMMENT ON FUNCTION increment_faq_views IS 'Increments the view count for an FAQ';
COMMENT ON FUNCTION rate_faq IS 'Records user feedback on FAQ helpfulness';

