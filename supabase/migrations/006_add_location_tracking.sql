-- ============================================================================
-- Migration: Add location tracking to profiles
-- Extends profiles table with last_location_update_at
-- ============================================================================

-- Add last_location_update_at column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' 
    AND column_name = 'last_location_update_at'
  ) THEN
    ALTER TABLE profiles 
    ADD COLUMN last_location_update_at TIMESTAMPTZ;
  END IF;
END $$;

-- Create index for location queries
CREATE INDEX IF NOT EXISTS idx_profiles_location_update 
ON profiles(last_location_update_at DESC) 
WHERE lat IS NOT NULL AND lng IS NOT NULL;

-- Create index for location-based queries (spatial index)
-- Note: We filter by recent updates in queries, not in the index predicate
-- because NOW() is not immutable and cannot be used in index predicates
CREATE INDEX IF NOT EXISTS idx_profiles_location_spatial 
ON profiles(lat, lng) 
WHERE lat IS NOT NULL AND lng IS NOT NULL;

