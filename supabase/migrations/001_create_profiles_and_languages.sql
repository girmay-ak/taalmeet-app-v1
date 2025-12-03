-- ============================================================================
-- Migration: Create profiles and user_languages tables
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- PROFILES TABLE
-- ============================================================================

-- Drop table if exists (for development)
DROP TABLE IF EXISTS profiles CASCADE;

-- Create profiles table
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  avatar_url TEXT,
  bio TEXT,
  city TEXT,
  country TEXT,
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  is_online BOOLEAN DEFAULT false,
  last_active_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for location queries
CREATE INDEX idx_profiles_location ON profiles(lat, lng) WHERE lat IS NOT NULL AND lng IS NOT NULL;

-- Create index for online status
CREATE INDEX idx_profiles_online ON profiles(is_online) WHERE is_online = true;

-- Create index for last_active_at
CREATE INDEX idx_profiles_last_active ON profiles(last_active_at DESC);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can read all profiles
CREATE POLICY "Profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Users can insert their own profile
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- USER_LANGUAGES TABLE
-- ============================================================================

-- Drop table if exists (for development)
DROP TABLE IF EXISTS user_languages CASCADE;

-- Create user_languages table
CREATE TABLE user_languages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  language TEXT NOT NULL,
  level TEXT CHECK (level IN ('native', 'advanced', 'intermediate', 'beginner')),
  role TEXT NOT NULL CHECK (role IN ('teaching', 'learning')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, language, role)
);

-- Create indexes
CREATE INDEX idx_user_languages_user_id ON user_languages(user_id);
CREATE INDEX idx_user_languages_language ON user_languages(language);
CREATE INDEX idx_user_languages_role ON user_languages(role);

-- Enable Row Level Security
ALTER TABLE user_languages ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can read all languages
CREATE POLICY "Languages are viewable by everyone"
  ON user_languages FOR SELECT
  USING (true);

-- Users can update their own languages
CREATE POLICY "Users can update own languages"
  ON user_languages FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can insert their own languages
CREATE POLICY "Users can insert own languages"
  ON user_languages FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own languages
CREATE POLICY "Users can delete own languages"
  ON user_languages FOR DELETE
  USING (auth.uid() = user_id);

-- Trigger to auto-update updated_at
CREATE TRIGGER update_user_languages_updated_at
  BEFORE UPDATE ON user_languages
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- FUNCTION: Create profile on user signup
-- ============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.email
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile when user signs up
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

