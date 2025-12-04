-- ============================================================================
-- Migration: Account Deletion Function
-- ============================================================================
-- 
-- Description: Creates a function to safely delete user accounts and all
--              associated data. This function ensures proper cascade deletion
--              and can be called by authenticated users to delete their own account.
--
-- Security: Uses SECURITY DEFINER to bypass RLS for deletion operations
-- ============================================================================

-- ============================================================================
-- Function: Delete User Account
-- ============================================================================
-- 
-- This function deletes a user account and all associated data.
-- It can only be called by the user themselves (auth.uid() must match user_id).
-- 
-- What gets deleted (via CASCADE):
-- - Profile (profiles table)
-- - User languages (user_languages table)
-- - Locations (locations table)
-- - Connections (connections table)
-- - Conversations and messages (conversations, conversation_participants, messages)
-- - Availability data (availability_status, weekly_schedule)
-- - Language sessions (language_sessions, session_participants)
-- - Discovery preferences (discovery_preferences)
-- - Blocked users (blocked_users)
-- - Reports (reports - only reports where user is reporter, not target)
-- - Auth user (auth.users - via Supabase Auth API)
--
-- Note: The auth.users deletion must be done via Supabase Auth API,
--       but this function handles all database cleanup.
-- ============================================================================

CREATE OR REPLACE FUNCTION delete_user_account(user_id UUID)
RETURNS void AS $$
BEGIN
  -- Verify that the user is deleting their own account
  IF auth.uid() IS NULL OR auth.uid() != user_id THEN
    RAISE EXCEPTION 'You can only delete your own account';
  END IF;

  -- Delete profile - this will cascade delete all related data
  -- due to ON DELETE CASCADE constraints
  -- This includes: user_languages, locations, connections, conversations,
  -- messages, availability_status, weekly_schedule, language_sessions,
  -- session_participants, discovery_preferences, blocked_users, reports
  DELETE FROM profiles WHERE id = user_id;
  
  -- Also delete from legacy users table if it exists
  DELETE FROM users WHERE id = user_id;

  -- Note: The auth.users record should be deleted via Supabase Auth API
  -- This function handles all database cleanup. The client should call
  -- supabase.auth.admin.deleteUser() or use a server-side function for auth deletion.
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- Comment
-- ============================================================================

COMMENT ON FUNCTION delete_user_account IS 'Safely deletes a user account and all associated data. Can only be called by the user themselves.';

