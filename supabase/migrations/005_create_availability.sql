-- ============================================================================
-- Migration: Create availability tables
-- ============================================================================

-- Enable UUID extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- AVAILABILITY_STATUS TABLE
-- ============================================================================

-- Drop table if exists (for development)
DROP TABLE IF EXISTS availability_status CASCADE;

-- Create availability_status table
CREATE TABLE availability_status (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('available', 'soon', 'busy', 'offline')) DEFAULT 'offline',
  duration_minutes INTEGER, -- Duration in minutes (null for 'offline' or 'busy')
  until TIMESTAMPTZ, -- When availability expires (calculated from duration)
  preferences JSONB DEFAULT '[]'::jsonb, -- Array of preference strings: ['in-person', 'video', 'voice', 'chat']
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id) -- One status per user
);

-- Create indexes
CREATE INDEX idx_availability_status_user_id ON availability_status(user_id);
CREATE INDEX idx_availability_status_status ON availability_status(status) WHERE status = 'available';
CREATE INDEX idx_availability_status_until ON availability_status(until) WHERE until IS NOT NULL;

-- Enable Row Level Security
ALTER TABLE availability_status ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can view all availability statuses
CREATE POLICY "Availability statuses are viewable by everyone"
  ON availability_status FOR SELECT
  USING (true);

-- Users can insert their own status
CREATE POLICY "Users can insert own availability status"
  ON availability_status FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own status
CREATE POLICY "Users can update own availability status"
  ON availability_status FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own status
CREATE POLICY "Users can delete own availability status"
  ON availability_status FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- WEEKLY_SCHEDULE TABLE
-- ============================================================================

-- Drop table if exists (for development)
DROP TABLE IF EXISTS weekly_schedule CASCADE;

-- Create weekly_schedule table
CREATE TABLE weekly_schedule (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6), -- 0=Sunday, 1=Monday, ..., 6=Saturday
  start_time TIME NOT NULL, -- Format: HH:MM:SS
  end_time TIME NOT NULL, -- Format: HH:MM:SS
  repeat_weekly BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CHECK (end_time > start_time) -- End time must be after start time
);

-- Create indexes
CREATE INDEX idx_weekly_schedule_user_id ON weekly_schedule(user_id);
CREATE INDEX idx_weekly_schedule_day ON weekly_schedule(user_id, day_of_week);
CREATE INDEX idx_weekly_schedule_repeat ON weekly_schedule(user_id, repeat_weekly) WHERE repeat_weekly = true;

-- Enable Row Level Security
ALTER TABLE weekly_schedule ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can view all schedules
CREATE POLICY "Schedules are viewable by everyone"
  ON weekly_schedule FOR SELECT
  USING (true);

-- Users can insert their own schedule
CREATE POLICY "Users can insert own schedule"
  ON weekly_schedule FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own schedule
CREATE POLICY "Users can update own schedule"
  ON weekly_schedule FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own schedule
CREATE POLICY "Users can delete own schedule"
  ON weekly_schedule FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Trigger to auto-update updated_at
CREATE TRIGGER update_availability_status_updated_at
  BEFORE UPDATE ON availability_status
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_weekly_schedule_updated_at
  BEFORE UPDATE ON weekly_schedule
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger to calculate 'until' timestamp when status is set
CREATE OR REPLACE FUNCTION calculate_availability_until()
RETURNS TRIGGER AS $$
BEGIN
  -- If status is 'available' or 'soon' and duration is set, calculate until
  IF NEW.status IN ('available', 'soon') AND NEW.duration_minutes IS NOT NULL THEN
    NEW.until = NOW() + (NEW.duration_minutes || ' minutes')::INTERVAL;
  ELSE
    NEW.until = NULL;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER calculate_availability_until_trigger
  BEFORE INSERT OR UPDATE ON availability_status
  FOR EACH ROW
  EXECUTE FUNCTION calculate_availability_until();

