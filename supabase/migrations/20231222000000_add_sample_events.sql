/**
 * Sample Events Data
 * Creates sample language exchange events for testing and demonstration
 * Fixed to use only existing columns
 */

-- Insert sample language exchange events
-- Make sure to replace the host_user_id with your actual user ID

-- Event 1: Spanish Conversation Practice (Online)
INSERT INTO language_sessions (
  host_user_id,
  title,
  description,
  language,
  category,
  level,
  starts_at,
  ends_at,
  capacity,
  min_participants,
  is_online,
  location,
  is_free,
  status,
  visibility,
  tags,
  requirements,
  cover_image_url
) VALUES (
  (SELECT id FROM users LIMIT 1), -- Uses first user as host
  'Spanish Conversation Practice',
  'Join us for a casual Spanish conversation session! Perfect for intermediate learners who want to practice speaking in a relaxed environment. We will discuss everyday topics and help each other improve our fluency. ¡Nos vemos!',
  'Spanish',
  'conversation_practice',
  'intermediate',
  NOW() + INTERVAL '2 days',
  NOW() + INTERVAL '2 days' + INTERVAL '1.5 hours',
  15,
  3,
  true,
  'Online - Link will be shared',
  true,
  'upcoming',
  'public',
  ARRAY['conversation', 'intermediate', 'online', 'casual'],
  ARRAY['Intermediate Spanish level (A2-B1)', 'Stable internet connection', 'Microphone and camera'],
  'https://images.unsplash.com/photo-1543109740-4bdb38fda756?w=800'
);

-- Event 2: French Cultural Evening (In-Person)
INSERT INTO language_sessions (
  host_user_id,
  title,
  description,
  language,
  category,
  level,
  starts_at,
  ends_at,
  capacity,
  min_participants,
  is_online,
  location,
  location_address,
  location_city,
  location_country,
  location_venue,
  is_free,
  price,
  currency,
  status,
  visibility,
  tags,
  requirements,
  cover_image_url
) VALUES (
  (SELECT id FROM users LIMIT 1),
  'French Cultural Evening & Wine Tasting',
  'Experience authentic French culture! Join us for an evening of French conversation, delicious wine, and cheese. We will practice French while learning about French traditions and customs. A perfect blend of learning and socializing!',
  'French',
  'cultural_event',
  'all_levels',
  NOW() + INTERVAL '5 days',
  NOW() + INTERVAL '5 days' + INTERVAL '3 hours',
  20,
  5,
  false,
  'Le Petit Café, Downtown',
  '123 Main Street, Downtown',
  'New York',
  'United States',
  'Le Petit Café',
  false,
  25.00,
  'USD',
  'upcoming',
  'public',
  ARRAY['cultural', 'social', 'wine', 'food', 'all-levels'],
  ARRAY['21+ years old', 'Basic French knowledge helpful but not required', 'Enthusiasm for French culture'],
  'https://images.unsplash.com/photo-1506452819137-0422416856b8?w=800'
);

-- Event 3: Japanese Study Group (Online)
INSERT INTO language_sessions (
  host_user_id,
  title,
  description,
  language,
  category,
  level,
  starts_at,
  ends_at,
  capacity,
  min_participants,
  is_online,
  location,
  is_free,
  status,
  visibility,
  tags,
  requirements,
  cover_image_url
) VALUES (
  (SELECT id FROM users LIMIT 1),
  'Japanese Kanji Study Group',
  'Struggling with Kanji? Join our supportive study group! We will review N5-N4 level Kanji, share mnemonics, and practice writing together. Perfect for JLPT preparation or general improvement.',
  'Japanese',
  'study_group',
  'beginner',
  NOW() + INTERVAL '3 days',
  NOW() + INTERVAL '3 days' + INTERVAL '2 hours',
  10,
  3,
  true,
  'Online - Zoom link provided',
  true,
  'upcoming',
  'public',
  ARRAY['kanji', 'jlpt', 'beginner', 'study', 'writing'],
  ARRAY['Basic Hiragana and Katakana knowledge', 'Notebook for practice', 'JLPT N5 level or above'],
  'https://images.unsplash.com/photo-1528164344705-47542687000d?w=800'
);

-- Event 4: German Language Exchange (In-Person)
INSERT INTO language_sessions (
  host_user_id,
  title,
  description,
  language,
  category,
  level,
  starts_at,
  ends_at,
  capacity,
  min_participants,
  is_online,
  location,
  location_city,
  location_country,
  location_venue,
  is_free,
  status,
  visibility,
  tags,
  requirements,
  cover_image_url
) VALUES (
  (SELECT id FROM users LIMIT 1),
  'German-English Language Exchange',
  'Native German speaker looking for English practice! We will spend 30 minutes in German, 30 minutes in English. Great for mutual learning and making friends. Coffee and good conversation guaranteed!',
  'German',
  'language_exchange',
  'intermediate',
  NOW() + INTERVAL '1 day',
  NOW() + INTERVAL '1 day' + INTERVAL '1 hour',
  4,
  2,
  false,
  'Starbucks Mitte, Berlin',
  'Berlin',
  'Germany',
  'Starbucks Mitte',
  true,
  'upcoming',
  'public',
  ARRAY['tandem', 'english', 'german', 'coffee', '1-on-1'],
  ARRAY['Intermediate German or English', 'Commitment to equal time in both languages', 'Buy your own coffee'],
  'https://images.unsplash.com/photo-1527866959252-deab85ef7d1b?w=800'
);

-- Event 5: Italian Cooking & Language Workshop (In-Person)
INSERT INTO language_sessions (
  host_user_id,
  title,
  description,
  language,
  category,
  level,
  starts_at,
  ends_at,
  capacity,
  min_participants,
  is_online,
  location,
  location_city,
  location_country,
  location_venue,
  is_free,
  price,
  currency,
  status,
  visibility,
  tags,
  requirements,
  cover_image_url
) VALUES (
  (SELECT id FROM users LIMIT 1),
  'Learn Italian While Making Pasta!',
  'Learn Italian the delicious way! Join our cooking workshop where we will make homemade pasta from scratch while speaking Italian. All instructions in Italian with English support. Leave with new language skills and a full stomach!',
  'Italian',
  'workshop',
  'all_levels',
  NOW() + INTERVAL '7 days',
  NOW() + INTERVAL '7 days' + INTERVAL '3 hours',
  12,
  6,
  false,
  'Cucina Italiana Cooking School, Rome',
  'Rome',
  'Italy',
  'Cucina Italiana Cooking School',
  false,
  45.00,
  'EUR',
  'upcoming',
  'public',
  ARRAY['cooking', 'pasta', 'cultural', 'hands-on', 'food'],
  ARRAY['Apron provided', 'Some Italian knowledge helpful', 'Willingness to get flour on your hands!'],
  'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=800'
);

-- Event 6: Korean Drama Discussion Club (Online)
INSERT INTO language_sessions (
  host_user_id,
  title,
  description,
  language,
  category,
  level,
  starts_at,
  ends_at,
  capacity,
  min_participants,
  is_online,
  location,
  is_free,
  status,
  visibility,
  tags,
  requirements,
  cover_image_url
) VALUES (
  (SELECT id FROM users LIMIT 1),
  'K-Drama Discussion in Korean',
  'Love K-Dramas? Let us discuss them in Korean! This week: Crash Landing on You. We will analyze scenes, discuss cultural elements, and practice natural Korean expressions. Perfect for drama fans wanting to improve their Korean!',
  'Korean',
  'conversation_practice',
  'intermediate',
  NOW() + INTERVAL '4 days',
  NOW() + INTERVAL '4 days' + INTERVAL '1.5 hours',
  20,
  5,
  true,
  'Online - Google Meet',
  true,
  'upcoming',
  'public',
  ARRAY['kdrama', 'entertainment', 'culture', 'conversation', 'fun'],
  ARRAY['Watch the assigned episode before meeting', 'Intermediate Korean level', 'Love for K-Dramas!'],
  'https://images.unsplash.com/photo-1602524206684-73a9e1a87c71?w=800'
);

-- Add some participants to make events look active
INSERT INTO session_participants (session_id, user_id, status, joined_at)
SELECT 
  id,
  (SELECT id FROM users LIMIT 1),
  'joined',
  NOW() - INTERVAL '1 day'
FROM language_sessions
WHERE title IN (
  'Spanish Conversation Practice',
  'Japanese Kanji Study Group',
  'K-Drama Discussion in Korean'
)
AND NOT EXISTS (
  SELECT 1 FROM session_participants sp 
  WHERE sp.session_id = language_sessions.id 
  AND sp.user_id = (SELECT id FROM users LIMIT 1)
);

-- Update view counts to make events look popular
UPDATE language_sessions
SET views = FLOOR(RANDOM() * 100) + 20
WHERE status = 'upcoming';

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Successfully created 6 sample events!';
  RAISE NOTICE '📍 Events include: Spanish, French, Japanese, German, Italian, and Korean';
  RAISE NOTICE '🌐 Mix of online and in-person events across different categories';
  RAISE NOTICE '💡 View them in your app home screen!';
END $$;
