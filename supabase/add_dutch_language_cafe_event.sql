/**
 * Add Dutch Language Exchange Cafe Event
 * Recurring weekly event every Wednesday at 1:00 PM
 */

-- Dutch Language Exchange at Cafe (Recurring Weekly)
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
  status,
  visibility,
  is_recurring,
  recurrence_rule,
  tags,
  requirements,
  cover_image_url
) VALUES (
  (SELECT id FROM users LIMIT 1), -- Replace with your user ID
  'Dutch Language Exchange Cafe',
  'Join us every Wednesday for Dutch conversation practice at our favorite cafe! Whether you''re a beginner or advanced speaker, everyone is welcome. We meet for 2 hours of relaxed conversation, coffee, and making new friends. Practice your Dutch in a comfortable, supportive environment while enjoying delicious Dutch treats!',
  'Dutch',
  'language_exchange',
  'all_levels',
  -- Next Wednesday at 1:00 PM
  DATE_TRUNC('week', NOW()) + INTERVAL '2 days' + INTERVAL '13 hours',
  -- Ends at 3:00 PM (2 hours later)
  DATE_TRUNC('week', NOW()) + INTERVAL '2 days' + INTERVAL '15 hours',
  20,
  5,
  false,
  'Dutch Language Cafe, Amsterdam',
  'Prinsengracht 123, Amsterdam',
  'Amsterdam',
  'Netherlands',
  'Dutch Language Cafe',
  true,
  'upcoming',
  'public',
  true,
  'weekly',
  ARRAY['dutch', 'conversation', 'cafe', 'recurring', 'amsterdam', 'social', 'all-levels'],
  ARRAY['Any level of Dutch welcome', 'Buy your own coffee/snacks', 'Open mind and friendly attitude'],
  'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800'
);

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Successfully created Dutch Language Exchange Cafe event!';
  RAISE NOTICE '📅 Recurring: Every Wednesday at 1:00 PM';
  RAISE NOTICE '📍 Location: Dutch Language Cafe, Amsterdam';
  RAISE NOTICE '🇳🇱 Language: Dutch (All levels welcome)';
  RAISE NOTICE '☕ Free event - just buy your own coffee!';
END $$;

