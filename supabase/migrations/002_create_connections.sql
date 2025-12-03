-- ============================================================================
-- Migration: Create connections table
-- ============================================================================

-- Enable UUID extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- CONNECTIONS TABLE
-- ============================================================================

-- Drop table if exists (for development)
DROP TABLE IF EXISTS connections CASCADE;

-- Create connections table
CREATE TABLE connections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  partner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CrASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'blocked')),
  match_score INTEGER DEFAULT 0 CHECK (match_score >= 0 AND match_score <= 100),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  accepted_at TIMESTAMPTZ,
  UNIQUE(user_id, partner_id)
);

-- Create indexes for performance
CREATE INDEX idx_connections_user_id ON connections(user_id);
CREATE INDEX idx_connections_partner_id ON connections(partner_id);
CREATE INDEX idx_connections_status ON connections(status);
CREATE INDEX idx_connections_user_status ON connections(user_id, status);
CREATE INDEX idx_connections_partner_status ON connections(partner_id, status);

-- Enable Row Level Security
ALTER TABLE connections ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can view connections where they are user_id or partner_id
CREATE POLICY "Users can view own connections"
  ON connections FOR SELECT
  USING (
    auth.uid() = user_id OR 
    auth.uid() = partner_id
  );

-- Users can create connections where they are the user_id
CREATE POLICY "Users can create connections"
  ON connections FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update connections where they are the partner_id (to accept/reject)
-- or where they are the user_id (to cancel)
CREATE POLICY "Users can update own connections"
  ON connections FOR UPDATE
  USING (
    auth.uid() = user_id OR 
    auth.uid() = partner_id
  );

-- Users can delete connections where they are the user_id
CREATE POLICY "Users can delete own connections"
  ON connections FOR DELETE
  USING (auth.uid() = user_id);

-- Trigger to auto-update updated_at timestamp
CREATE TRIGGER update_connections_updated_at
  BEFORE UPDATE ON connections
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger to set accepted_at when status changes to 'accepted'
CREATE OR REPLACE FUNCTION set_connection_accepted_at()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'accepted' AND OLD.status != 'accepted' THEN
    NEW.accepted_at = NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_connections_accepted_at
  BEFORE UPDATE ON connections
  FOR EACH ROW
  EXECUTE FUNCTION set_connection_accepted_at();

