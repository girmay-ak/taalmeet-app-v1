-- ============================================================================
-- Migration: Fix profile creation trigger
-- This ensures new users are created in the profiles table, not users table
-- ============================================================================

-- Drop the old trigger that creates users in the users table
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user();

-- ============================================================================
-- NEW FUNCTION: Create profile on user signup
-- ============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Create profile in profiles table (not users table)
  INSERT INTO public.profiles (id, display_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
  )
  ON CONFLICT (id) DO NOTHING; -- Don't error if profile already exists
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to create profile when user signs up
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- MIGRATE EXISTING USER FROM users TO profiles
-- ============================================================================

-- Migrate existing user from users table to profiles table
INSERT INTO profiles (id, display_name, created_at, updated_at)
SELECT 
  u.id,
  COALESCE(u.name, u.email, 'User') as display_name,
  COALESCE(u.created_at, NOW()) as created_at,
  COALESCE(u.updated_at, NOW()) as updated_at
FROM users u
WHERE NOT EXISTS (
  SELECT 1 FROM profiles p WHERE p.id = u.id
)
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- VERIFICATION QUERIES (Run these to check)
-- ============================================================================

-- Check how many users in auth.users
-- SELECT COUNT(*) as auth_users FROM auth.users;

-- Check how many profiles in profiles table
-- SELECT COUNT(*) as profiles FROM profiles;

-- Check how many users in users table (legacy)
-- SELECT COUNT(*) as legacy_users FROM users;

-- View all profiles
-- SELECT id, display_name, created_at FROM profiles ORDER BY created_at DESC;

