-- ============================================================================
-- Migration: Fix infinite recursion in conversation_participants RLS policy
-- ============================================================================
-- 
-- Problem: The original policy queries conversation_participants from within
-- a policy on conversation_participants, causing infinite recursion.
--
-- Solution: Use a SECURITY DEFINER function that bypasses RLS to check
-- if a user is a participant in a conversation.

-- Drop the problematic policy
DROP POLICY IF EXISTS "Users can view own conversation participants" ON conversation_participants;

-- Create a SECURITY DEFINER function to check participation
-- This function bypasses RLS, so it won't cause recursion
CREATE OR REPLACE FUNCTION user_is_participant(conv_id UUID, check_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM conversation_participants
    WHERE conversation_id = conv_id
      AND user_id = check_user_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Now create the policy using the function
-- This allows users to see all participants in conversations they're part of
CREATE POLICY "Users can view own conversation participants"
  ON conversation_participants FOR SELECT
  USING (user_is_participant(conversation_id, auth.uid()));

