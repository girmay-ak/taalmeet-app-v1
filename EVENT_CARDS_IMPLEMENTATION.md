# Event Cards Implementation - Complete Guide

## ✅ Features Implemented

### 1. 🎴 Swipeable Event Cards
**Design**: Exact match with Figma design (node-id: 1451:23484)

**Features**:
- ✅ White card with rounded corners (28px)
- ✅ Event image (120x120px, rounded 20px)
- ✅ Event title (Urbanist Bold, 20px)
- ✅ Date & time (Urbanist SemiBold, 14px, Purple #584CF4)
- ✅ Location with icon (Urbanist Regular, 14px, Gray #616161)
- ✅ Heart icon for favorites
- ✅ Swipe left/right to dismiss
- ✅ Smooth animations
- ✅ Shadow effects matching Figma

### 2. 📋 Event Card List
**Features**:
- ✅ Scrollable list of event cards
- ✅ Swipe gestures on each card
- ✅ Empty state handling
- ✅ Header with title
- ✅ Favorite toggle functionality

### 3. 🗺️ Map Integration
**Features**:
- ✅ Calendar button in top-right corner
- ✅ Opens events modal
- ✅ Full-screen event list
- ✅ Close button to return to map

## 📁 New Files Created

### 1. EventCard.tsx
**Location**: `components/map/EventCard.tsx`

**Purpose**: Individual swipeable event card component

**Key Features**:
- Gesture-based swiping (Pan gesture)
- Swipe threshold: 30% of screen width
- Fade out animation while swiping
- Spring animation back to center if not dismissed
- Callbacks for swipe left/right

**Props**:
```typescript
interface EventCardProps {
  event: EventCardData;
  onPress?: () => void;
  onFavoriteToggle?: () => void;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
}
```

### 2. EventCardList.tsx
**Location**: `components/map/EventCardList.tsx`

**Purpose**: Scrollable list container for event cards

**Key Features**:
- FlatList for performance
- Header with title
- Empty state
- Auto-remove cards on swipe
- Theme support

**Props**:
```typescript
interface EventCardListProps {
  events: EventCardData[];
  onEventPress?: (event: EventCardData) => void;
  onFavoriteToggle?: (eventId: string) => void;
  showHeader?: boolean;
  headerTitle?: string;
}
```

### 3. Updated Files
- ✅ `components/map/index.ts` - Added exports
- ✅ `app/(tabs)/map.tsx` - Integrated event cards

## 🎨 Design Specifications (From Figma)

### Card Container
```
Background: #FFFFFF
Border Radius: 28px
Padding: 14px (left), 18px (right), 14px (vertical)
Shadow: 0px 4px 60px rgba(4, 6, 15, 0.05)
Margin: 24px (horizontal), 16px (bottom)
```

### Event Image
```
Size: 120x120px
Border Radius: 20px
Margin Right: 16px
Object Fit: Cover
```

### Title
```
Font: Urbanist Bold
Size: 20px
Weight: 700
Color: #212121
Line Height: 24px (1.2)
```

### Date & Time
```
Font: Urbanist SemiBold
Size: 14px
Weight: 600
Color: #584CF4 (Primary Purple)
Line Height: 20px (1.4)
Letter Spacing: 0.2px
```

### Location
```
Font: Urbanist Regular
Size: 14px
Weight: 400
Color: #616161 (Gray)
Line Height: 20px (1.4)
Letter Spacing: 0.2px
Icon: Ionicons "location" (16px, #584CF4)
```

### Favorite Icon
```
Icon: Ionicons "heart" / "heart-outline"
Size: 24px
Color: #FF4D67 (filled) / #9E9E9E (outline)
```

## 🎯 How to Use

### 1. Display Event Cards in Modal
```typescript
import { EventCardList, EventCardData } from '@/components/map';

const events: EventCardData[] = [
  {
    id: '1',
    title: 'National Music Festival',
    imageUrl: 'https://example.com/image.jpg',
    date: 'Mon, Dec 24',
    time: '18.00 - 23.00 PM',
    location: 'Grand Park, New York',
    isFavorite: false,
  },
];

<EventCardList
  events={events}
  onEventPress={(event) => console.log('Pressed:', event)}
  onFavoriteToggle={(id) => console.log('Toggle:', id)}
  showHeader={true}
  headerTitle="Nearby Events"
/>
```

### 2. Single Event Card
```typescript
import { EventCard, EventCardData } from '@/components/map';

<EventCard
  event={eventData}
  onPress={() => navigateToEventDetails()}
  onFavoriteToggle={() => toggleFavorite()}
  onSwipeLeft={() => console.log('Swiped left')}
  onSwipeRight={() => console.log('Swiped right')}
/>
```

### 3. In Map Screen
The calendar button in the top-right corner opens the events modal:

```typescript
// Button in map screen
<TouchableOpacity onPress={() => setShowEvents(true)}>
  <Ionicons name="calendar" size={18} color={colors.primary} />
</TouchableOpacity>

// Modal with event cards
<Modal visible={showEvents}>
  <EventCardList events={mockEvents} />
</Modal>
```

## 🎬 Swipe Gestures

### How It Works
1. **Pan Gesture**: User drags card left or right
2. **Visual Feedback**: Card translates and fades as user drags
3. **Threshold**: 30% of screen width triggers dismiss
4. **Animation**: Spring animation for smooth return or dismiss
5. **Callback**: `onSwipeLeft` or `onSwipeRight` called on dismiss

### Swipe Behavior
- **Swipe Left**: Card slides out left, removed from list
- **Swipe Right**: Card slides out right, removed from list
- **Partial Swipe**: Card springs back to center
- **Opacity**: Fades from 1 to 0 based on swipe distance

## 📊 Data Structure

### EventCardData Interface
```typescript
interface EventCardData {
  id: string;              // Unique identifier
  title: string;           // Event name
  imageUrl: string;        // Event image URL
  date: string;            // Formatted date (e.g., "Mon, Dec 24")
  time: string;            // Time range (e.g., "18.00 - 23.00 PM")
  location: string;        // Venue name
  isFavorite?: boolean;    // Favorite status (optional)
}
```

## 🔧 Integration with Backend

### Fetching Events
Replace mock data with real API calls:

```typescript
// Create a hook for fetching nearby events
const { data: events, isLoading } = useNearbyEvents({
  latitude: userLocation.latitude,
  longitude: userLocation.longitude,
  radiusKm: 10,
});

// Use in EventCardList
<EventCardList
  events={events || []}
  onEventPress={handleEventPress}
  onFavoriteToggle={handleFavoriteToggle}
/>
```

### Favorite Toggle
```typescript
const handleFavoriteToggle = async (eventId: string) => {
  try {
    await toggleEventFavorite(eventId);
    // Update local state or refetch
  } catch (error) {
    console.error('Failed to toggle favorite:', error);
  }
};
```

## 🎨 Styling Notes

### Theme Support
Both components support light/dark mode through `useTheme()`:
- Background colors adapt to theme
- Text colors adapt to theme
- Card background is always white (as per Figma)

### Custom Fonts
Requires Urbanist font family:
- Urbanist-Bold (700)
- Urbanist-SemiBold (600)
- Urbanist-Regular (400)

Make sure fonts are loaded in your app.

## ✅ Testing Checklist

- [x] Event cards display correctly
- [x] Card matches Figma design exactly
- [x] Swipe left dismisses card
- [x] Swipe right dismisses card
- [x] Partial swipe returns to center
- [x] Fade animation works
- [x] Favorite toggle works
- [x] Card press navigation works
- [x] Empty state displays
- [x] Scrolling works smoothly
- [x] Calendar button opens modal
- [x] Close button closes modal
- [x] No linter errors
- [x] Theme support works

## 🚀 Result

The event cards are now fully implemented with:
1. ✅ **Exact Figma design** - Pixel-perfect match
2. ✅ **Swipe gestures** - Smooth left/right dismissal
3. ✅ **Map integration** - Calendar button opens events
4. ✅ **Full functionality** - Press, favorite, swipe
5. ✅ **Professional animations** - Spring and fade effects

The discovery map now shows nearby events with beautiful, swipeable cards! 🎉

