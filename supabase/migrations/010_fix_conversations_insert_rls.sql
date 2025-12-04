-- ============================================================================
-- Migration: Fix RLS policy for conversations INSERT
-- ============================================================================
-- 
-- Problem: The INSERT policy for conversations is blocking inserts
-- Solution: Ensure the get_or_create_conversation function exists and policies allow it

-- Ensure the get_or_create_conversation function exists (it should from migration 003)
-- This function is SECURITY DEFINER and bypasses RLS, allowing conversation creation
CREATE OR REPLACE FUNCTION get_or_create_conversation(user1_id UUID, user2_id UUID)
RETURNS UUID AS $$
DECLARE
  conv_id UUID;
BEGIN
  -- Validate inputs
  IF user1_id = user2_id THEN
    RAISE EXCEPTION 'Cannot create conversation with yourself';
  END IF;

  -- Check if conversation already exists
  SELECT conversation_id INTO conv_id
  FROM conversation_participants
  WHERE user_id = user1_id
    AND conversation_id IN (
      SELECT conversation_id
      FROM conversation_participants
      WHERE user_id = user2_id
    )
  LIMIT 1;

  -- If conversation exists, return it
  IF conv_id IS NOT NULL THEN
    RETURN conv_id;
  END IF;

  -- Create new conversation (bypasses RLS due to SECURITY DEFINER)
  INSERT INTO conversations DEFAULT VALUES
  RETURNING id INTO conv_id;

  -- Add both users as participants (bypasses RLS due to SECURITY DEFINER)
  INSERT INTO conversation_participants (conversation_id, user_id)
  VALUES (conv_id, user1_id), (conv_id, user2_id);

  RETURN conv_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ensure the INSERT policy for conversations allows authenticated users
-- (The function will bypass this, but it's good to have for direct inserts)
DROP POLICY IF EXISTS "Users can create conversations" ON conversations;
CREATE POLICY "Users can create conversations"
  ON conversations FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

