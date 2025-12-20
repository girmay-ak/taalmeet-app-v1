# Sample Events Setup Guide

## 🎯 Quick Setup

This guide will help you add sample events to your database so you can see the event system in action!

---

## 📝 Step-by-Step Instructions

### Method 1: Using Supabase Dashboard (Recommended)

1. **Go to your Supabase Dashboard**
2. **Navigate to SQL Editor**
3. **Copy and paste the SQL below**
4. **Replace `YOUR_USER_ID_HERE`** with your actual user ID
5. **Click "Run"**

---

## 🔍 Find Your User ID

First, get your user ID:

```sql
-- Run this to find your user ID
SELECT id, email, display_name FROM users LIMIT 5;
```

Copy your user ID from the results.

---

## 📦 Insert Sample Events

**Copy this entire block** and replace `YOUR_USER_ID_HERE` with your actual user ID:

```sql
-- ============================================
-- SAMPLE EVENTS FOR TAALMEET
-- ============================================

-- Event 1: Spanish Conversation (Online, Free)
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
  is_online,
  meeting_link,
  is_free,
  status,
  tags,
  cover_image_url
) VALUES (
  'YOUR_USER_ID_HERE',
  'Spanish Conversation Practice',
  'Join us for casual Spanish conversation! Perfect for intermediate learners.',
  'Spanish',
  'conversation_practice',
  'intermediate',
  NOW() + INTERVAL '2 days',
  NOW() + INTERVAL '2 days' + INTERVAL '1.5 hours',
  15,
  true,
  'https://meet.google.com/abc-defg-hij',
  true,
  'upcoming',
  ARRAY['conversation', 'intermediate', 'online'],
  'https://images.unsplash.com/photo-1543109740-4bdb38fda756?w=800'
);

-- Event 2: French Cultural Evening (In-Person, Paid)
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
  is_online,
  location_city,
  location_venue,
  is_free,
  price,
  currency,
  status,
  tags,
  cover_image_url
) VALUES (
  'YOUR_USER_ID_HERE',
  'French Cultural Evening & Wine',
  'Experience French culture with wine and conversation!',
  'French',
  'cultural_event',
  'all_levels',
  NOW() + INTERVAL '5 days',
  NOW() + INTERVAL '5 days' + INTERVAL '3 hours',
  20,
  false,
  'New York',
  'Le Petit Café',
  false,
  25.00,
  'USD',
  'upcoming',
  ARRAY['cultural', 'social', 'wine'],
  'https://images.unsplash.com/photo-1506452819137-0422416856b8?w=800'
);

-- Event 3: Japanese Study Group (Online, Free)
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
  is_online,
  meeting_link,
  is_free,
  status,
  tags,
  cover_image_url
) VALUES (
  'YOUR_USER_ID_HERE',
  'Japanese Kanji Study Group',
  'Learn Kanji together! Perfect for JLPT preparation.',
  'Japanese',
  'study_group',
  'beginner',
  NOW() + INTERVAL '3 days',
  NOW() + INTERVAL '3 days' + INTERVAL '2 hours',
  10,
  true,
  'https://zoom.us/j/123456789',
  true,
  'upcoming',
  ARRAY['kanji', 'jlpt', 'beginner'],
  'https://images.unsplash.com/photo-1528164344705-47542687000d?w=800'
);

-- Event 4: German Language Exchange (In-Person, Free)
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
  is_online,
  location_city,
  location_venue,
  is_free,
  status,
  tags,
  cover_image_url
) VALUES (
  'YOUR_USER_ID_HERE',
  'German-English Language Exchange',
  '30 minutes German, 30 minutes English. Coffee included!',
  'German',
  'language_exchange',
  'intermediate',
  NOW() + INTERVAL '1 day',
  NOW() + INTERVAL '1 day' + INTERVAL '1 hour',
  4,
  false,
  'Berlin',
  'Starbucks Mitte',
  true,
  'upcoming',
  ARRAY['tandem', 'english', 'german'],
  'https://images.unsplash.com/photo-1527866959252-deab85ef7d1b?w=800'
);

-- Event 5: Italian Cooking Workshop (In-Person, Paid)
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
  is_online,
  location_city,
  location_venue,
  is_free,
  price,
  currency,
  status,
  tags,
  cover_image_url
) VALUES (
  'YOUR_USER_ID_HERE',
  'Learn Italian While Making Pasta!',
  'Make homemade pasta while learning Italian. Delicious!',
  'Italian',
  'workshop',
  'all_levels',
  NOW() + INTERVAL '7 days',
  NOW() + INTERVAL '7 days' + INTERVAL '3 hours',
  12,
  false,
  'Rome',
  'Cucina Italiana',
  false,
  45.00,
  'EUR',
  'upcoming',
  ARRAY['cooking', 'pasta', 'cultural'],
  'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=800'
);

-- Event 6: Korean Drama Discussion (Online, Free)
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
  is_online,
  meeting_link,
  is_free,
  status,
  tags,
  cover_image_url
) VALUES (
  'YOUR_USER_ID_HERE',
  'K-Drama Discussion in Korean',
  'Discuss K-Dramas in Korean! This week: Crash Landing on You.',
  'Korean',
  'conversation_practice',
  'intermediate',
  NOW() + INTERVAL '4 days',
  NOW() + INTERVAL '4 days' + INTERVAL '1.5 hours',
  20,
  true,
  'https://meet.google.com/xyz-abcd-efg',
  true,
  'upcoming',
  ARRAY['kdrama', 'entertainment', 'culture'],
  'https://images.unsplash.com/photo-1602524206684-73a9e1a87c71?w=800'
);

-- Success message
SELECT 'Successfully created 6 sample events!' as message;
```

---

## ✅ Verify Events Were Created

Run this to see your events:

```sql
SELECT 
  id,
  title,
  language,
  category,
  level,
  capacity,
  is_online,
  is_free,
  price,
  starts_at
FROM language_sessions
ORDER BY created_at DESC
LIMIT 10;
```

---

## 🎨 What You'll See

After running the SQL, you'll have **6 sample events**:

1. ✅ **Spanish Conversation** - Online, Free, Intermediate
2. ✅ **French Cultural Evening** - In-Person, $25, All Levels
3. ✅ **Japanese Kanji Study** - Online, Free, Beginner
4. ✅ **German Language Exchange** - In-Person, Free, Intermediate
5. ✅ **Italian Cooking Workshop** - In-Person, €45, All Levels
6. ✅ **K-Drama Discussion** - Online, Free, Intermediate

---

## 📱 View on Home Screen

1. **Start your app**: `npm start`
2. **Navigate to Home tab**
3. **Scroll down** to see events
4. **Tap on an event** to see details
5. **Try filtering** by language or category

---

## 🎯 Categories Included

- ✅ Conversation Practice
- ✅ Cultural Event
- ✅ Study Group
- ✅ Language Exchange
- ✅ Workshop

---

## 🌍 Languages Included

- 🇪🇸 Spanish
- 🇫🇷 French
- 🇯🇵 Japanese
- 🇩🇪 German
- 🇮🇹 Italian
- 🇰🇷 Korean

---

## 🔄 Add More Events

Want more events? Just copy any INSERT statement and:
1. Change the title
2. Change the language
3. Change the dates
4. Change the category
5. Run it!

---

## 🗑️ Delete Sample Events

If you want to remove all sample events:

```sql
-- Delete all events (be careful!)
DELETE FROM language_sessions 
WHERE host_user_id = 'YOUR_USER_ID_HERE';
```

Or delete specific events:

```sql
-- Delete by title
DELETE FROM language_sessions 
WHERE title = 'Spanish Conversation Practice';
```

---

## 🐛 Troubleshooting

### Error: "column does not exist"
**Solution:** Make sure you ran the event features migration first:
```bash
supabase db push
```

### Error: "host_user_id does not exist"
**Solution:** Replace `YOUR_USER_ID_HERE` with your actual user ID.

### Events not showing in app?
**Solution:** 
1. Check the `starts_at` date is in the future
2. Check `status` is 'upcoming'
3. Try pull-to-refresh on the home screen

---

## 📊 Event Statistics

After creating events, you can check stats:

```sql
-- Count events by language
SELECT language, COUNT(*) as count
FROM language_sessions
GROUP BY language
ORDER BY count DESC;

-- Count events by category
SELECT category, COUNT(*) as count
FROM language_sessions
GROUP BY category
ORDER BY count DESC;

-- Free vs Paid events
SELECT 
  CASE WHEN is_free THEN 'Free' ELSE 'Paid' END as type,
  COUNT(*) as count
FROM language_sessions
GROUP BY is_free;

-- Online vs In-Person
SELECT 
  CASE WHEN is_online THEN 'Online' ELSE 'In-Person' END as type,
  COUNT(*) as count
FROM language_sessions
GROUP BY is_online;
```

---

## 🎉 Done!

You now have sample events to showcase your event system! 

**Next steps:**
- Test filtering by language
- Test filtering by category
- Try RSVPing to events
- Test favorites feature
- Create your own real events!

---

## 💡 Pro Tips

1. **Mix it up:** Include both free and paid events
2. **Vary times:** Spread events across different days
3. **Update regularly:** Keep events fresh and relevant
4. **Real images:** Use actual photos for production
5. **Test features:** RSVP, favorite, share, etc.

**Happy testing! 🚀**

