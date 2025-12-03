-- =====================================================
-- TAALMEET Database Functions
-- Version: 1.0.0
-- Description: Helper functions for common queries
-- =====================================================

-- =====================================================
-- Function: Get Nearby Users
-- Description: Find users within a certain radius
-- =====================================================

CREATE OR REPLACE FUNCTION get_nearby_users(
    user_lat DOUBLE PRECISION,
    user_lon DOUBLE PRECISION,
    radius_km DOUBLE PRECISION DEFAULT 10,
    max_results INTEGER DEFAULT 50
)
RETURNS TABLE (
    user_id UUID,
    distance_km DOUBLE PRECISION
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        l.user_id,
        (
            6371 * acos(
                cos(radians(user_lat)) * 
                cos(radians(l.latitude)) * 
                cos(radians(l.longitude) - radians(user_lon)) + 
                sin(radians(user_lat)) * 
                sin(radians(l.latitude))
            )
        ) AS distance_km
    FROM locations l
    WHERE l.user_id != auth.uid() -- Exclude current user
    AND (
        6371 * acos(
            cos(radians(user_lat)) * 
            cos(radians(l.latitude)) * 
            cos(radians(l.longitude) - radians(user_lon)) + 
            sin(radians(user_lat)) * 
            sin(radians(l.latitude))
        )
    ) <= radius_km
    ORDER BY distance_km ASC
    LIMIT max_results;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- Function: Get Unread Message Count
-- Description: Get count of unread messages for a user
-- =====================================================

CREATE OR REPLACE FUNCTION get_unread_message_count(for_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
    unread_count INTEGER;
BEGIN
    SELECT COUNT(*)
    INTO unread_count
    FROM messages
    WHERE receiver_id = for_user_id
    AND is_read = false;
    
    RETURN COALESCE(unread_count, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- Function: Get Conversation Messages
-- Description: Get messages between two users
-- =====================================================

CREATE OR REPLACE FUNCTION get_conversation_messages(
    user1_id UUID,
    user2_id UUID,
    message_limit INTEGER DEFAULT 50,
    message_offset INTEGER DEFAULT 0
)
RETURNS SETOF messages AS $$
BEGIN
    RETURN QUERY
    SELECT *
    FROM messages
    WHERE (sender_id = user1_id AND receiver_id = user2_id)
       OR (sender_id = user2_id AND receiver_id = user1_id)
    ORDER BY created_at DESC
    LIMIT message_limit
    OFFSET message_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- Function: Create User Profile (Auth Trigger)
-- Description: Automatically create user profile on signup
-- =====================================================

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO users (id, email, full_name, username)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'),
        COALESCE(NEW.raw_user_meta_data->>'username', 'user_' || substr(NEW.id::text, 1, 8))
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION handle_new_user();

