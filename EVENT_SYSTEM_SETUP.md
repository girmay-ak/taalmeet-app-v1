# Event System - Quick Setup Guide

## 🚀 Quick Start

This guide will help you set up and use the new comprehensive event system.

---

## 📦 What Was Implemented

### ✅ Complete Feature List

1. **Types & Interfaces** (`types/events.ts`)
   - 9 event categories
   - 4 skill levels
   - Event filters, search, and recommendations
   - Complete TypeScript type safety

2. **Service Layer** (`services/eventService.ts`)
   - Event discovery and search
   - RSVP management
   - Favorites system
   - Event CRUD operations
   - Analytics and trending

3. **React Query Hooks** (`hooks/useEvents.ts`)
   - Query hooks for data fetching
   - Mutation hooks for actions
   - Helper hooks for UI state

4. **UI Components**
   - `EventDetailCard` - Enhanced event card with all features
   - `EventCategoryFilter` - Category selection component

5. **Screens**
   - `/event/[id]` - Full event detail screen
   - Enhanced home screen with event integration

6. **Database**
   - Migration for enhanced event fields
   - event_favorites table
   - event_reviews table
   - RLS policies

---

## 🔧 Setup Instructions

### Step 1: Install Dependencies

The event system uses existing dependencies:
- ✅ `expo-router` - Navigation
- ✅ `@tanstack/react-query` - Data fetching
- ✅ `@supabase/supabase-js` - Database
- ✅ `expo-linear-gradient` - UI gradients

All dependencies should already be installed.

### Step 2: Run Database Migration

**Option A: Supabase CLI**
```bash
cd /Users/girmaybaraki/Documents/APP-2026/taalmeet-app-v1
supabase db push
```

**Option B: Supabase Dashboard**
1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Open `/supabase/migrations/20231221000000_add_event_features.sql`
4. Copy and paste the entire migration
5. Click "Run"

**Verify Migration:**
```sql
-- Check if columns were added
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'language_sessions'
AND column_name IN ('category', 'level', 'tags', 'is_free');

-- Check if tables were created
SELECT * FROM event_favorites LIMIT 0;
SELECT * FROM event_reviews LIMIT 0;
```

### Step 3: Verify Exports

Check that all modules are properly exported:

**types/index.ts:**
```typescript
export * from './events';  // ✅ Already added
```

**services/index.ts:**
```typescript
export * from './eventService';  // ✅ Already added
```

**hooks/index.ts:**
```typescript
export * from './useEvents';  // ✅ Already added
```

### Step 4: Test the Implementation

1. **Start the development server:**
```bash
npm start
# or
npx expo start
```

2. **Navigate to the home screen:**
   - You should see the enhanced home screen
   - Events should load (if any exist in your database)
   - Try the category filter
   - Try the language filter

3. **Create a test event** (via Supabase or API):
```sql
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
  is_free,
  status
) VALUES (
  'YOUR_USER_ID',
  'Spanish Conversation Practice',
  'Join us for a friendly Spanish conversation session!',
  'es',
  'conversation_practice',
  'intermediate',
  NOW() + INTERVAL '1 day',
  NOW() + INTERVAL '1 day' + INTERVAL '2 hours',
  10,
  true,
  true,
  'upcoming'
);
```

4. **Test event interactions:**
   - [ ] Tap on an event to view details
   - [ ] Tap the heart icon to favorite
   - [ ] Tap "Join Event" to RSVP
   - [ ] Share an event
   - [ ] Filter by category
   - [ ] Filter by language

---

## 📱 Using the Event System

### Displaying Events

```tsx
import { useEvents } from '@/hooks/useEvents';
import { EventDetailCard } from '@/components/events/EventDetailCard';

function MyEventsScreen() {
  const { data, isLoading } = useEvents({
    language: 'Spanish',
    category: 'conversation_practice',
  });

  if (isLoading) return <ActivityIndicator />;

  return (
    <ScrollView>
      {data?.events.map(event => (
        <EventDetailCard
          key={event.id}
          event={event}
          onFavoritePress={() => handleFavorite(event.id)}
        />
      ))}
    </ScrollView>
  );
}
```

### Viewing Event Details

Navigation is automatic with expo-router:
```tsx
import { router } from 'expo-router';

// Navigate to event detail
router.push(`/event/${eventId}`);
```

### RSVP to Event

```tsx
import { useRSVPToEvent } from '@/hooks/useEvents';

function EventRSVP({ eventId }: { eventId: string }) {
  const rsvp = useRSVPToEvent();

  const handleJoin = async () => {
    await rsvp.mutateAsync({
      eventId,
      status: 'joined',
    });
  };

  return (
    <Button onPress={handleJoin}>
      Join Event
    </Button>
  );
}
```

### Toggle Favorite

```tsx
import { useToggleFavorite } from '@/hooks/useEvents';

function FavoriteButton({ eventId }: { eventId: string }) {
  const toggleFavorite = useToggleFavorite();

  return (
    <TouchableOpacity
      onPress={() => toggleFavorite.mutate(eventId)}
    >
      <Ionicons name="heart" />
    </TouchableOpacity>
  );
}
```

---

## 🎨 Customization

### Event Categories

Add or modify categories in `types/events.ts`:

```typescript
export const EVENT_CATEGORIES: Record<EventCategory, { label: string; icon: string; color: string }> = {
  your_category: {
    label: 'Your Category',
    icon: 'your-icon',
    color: '#HEX_COLOR',
  },
  // ... existing categories
};
```

### Event Card Styling

Customize `EventDetailCard` in `components/events/EventDetailCard.tsx`:
- Modify `styles` object
- Change card dimensions
- Update color schemes
- Adjust layout

### Category Filter

Customize `EventCategoryFilter` in `components/events/EventCategoryFilter.tsx`:
- Change pill styles
- Modify colors
- Adjust spacing

---

## 🔍 Troubleshooting

### Events Not Showing

1. **Check database:**
```sql
SELECT * FROM language_sessions 
WHERE status = 'upcoming'
ORDER BY starts_at ASC;
```

2. **Check filters:**
   - Try selecting "All" language
   - Clear category filter
   - Check console for errors

3. **Verify RLS policies:**
```sql
SELECT * FROM pg_policies 
WHERE tablename = 'language_sessions';
```

### RSVP Not Working

1. **Check session_participants table exists:**
```sql
SELECT * FROM session_participants LIMIT 1;
```

2. **Verify user is authenticated:**
```typescript
const { user } = useAuth();
console.log('User:', user);
```

3. **Check event capacity:**
```typescript
const event = await getEventById(eventId);
console.log('Is full:', event.isFull);
console.log('Capacity:', event.capacity);
console.log('Participants:', event.participantCount);
```

### Favorites Not Working

1. **Check table exists:**
```sql
SELECT * FROM event_favorites LIMIT 1;
```

2. **Verify RLS policies:**
```sql
SELECT * FROM pg_policies 
WHERE tablename = 'event_favorites';
```

### Images Not Loading

1. **Check image URLs:**
```typescript
console.log('Cover URL:', event.coverImageUrl);
```

2. **Verify image permissions:**
   - Images must be publicly accessible
   - Or use signed URLs for private storage

---

## 📊 Database Schema Reference

### Key Tables

**language_sessions** (enhanced)
- Now includes: category, level, tags, is_free, views, etc.

**event_favorites**
- Links users to their favorite events
- Unique constraint on (user_id, event_id)

**event_reviews**
- User ratings and reviews for events
- Rating constraint: 1-5
- Unique constraint on (user_id, event_id)

### Indexes

Performance indexes on:
- `category`, `level`, `status`, `visibility`
- `starts_at` (for date filtering)
- `is_free` (for price filtering)
- `views` (for trending)

---

## 🎯 Next Steps

### Immediate Actions

1. ✅ Run the database migration
2. ✅ Test the home screen
3. ✅ Create a test event
4. ✅ Test RSVP and favorites

### Future Enhancements

Consider implementing:
- [ ] Event creation form
- [ ] Event editing
- [ ] Calendar integration
- [ ] Push notifications for events
- [ ] Event analytics for hosts
- [ ] Advanced search
- [ ] Map view

---

## 📚 Documentation

- **Full Documentation:** `EVENT_SYSTEM_DOCUMENTATION.md`
- **Types Reference:** `types/events.ts`
- **Service API:** `services/eventService.ts`
- **React Hooks:** `hooks/useEvents.ts`
- **Migration:** `supabase/migrations/20231221000000_add_event_features.sql`

---

## ✅ Checklist

Before deploying to production:

- [ ] Database migration completed
- [ ] All exports verified
- [ ] RLS policies tested
- [ ] Event creation tested
- [ ] RSVP functionality tested
- [ ] Favorites tested
- [ ] Navigation tested
- [ ] Error states handled
- [ ] Loading states displayed
- [ ] Images loading correctly
- [ ] Performance acceptable
- [ ] Mobile responsive
- [ ] Dark mode compatible

---

## 🎉 Success!

You now have a **fully-featured event system** with:

✨ Event discovery and filtering
✨ Beautiful UI components
✨ Comprehensive RSVP system
✨ Favorites and trending
✨ Type-safe APIs
✨ Optimized database schema
✨ Production-ready code

**Happy coding! 🚀**

