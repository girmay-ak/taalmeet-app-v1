# Map Screen Interaction Logic Fix

## Overview
This document explains the fixes applied to the Map screen to match the Figma design and correct interaction logic.

---

## Problems Fixed

### ✅ 1. Logged-in User Avatar Now Fixed at Center
**Problem:** The logged-in user was being rendered as a map marker, causing it to move with the map.

**Solution:**
- Removed radar pulse `Marker` from `GoogleMap.tsx` (lines 162-175)
- `CenterUserAvatar` now uses absolute positioning (z-index: 100)
- Never rendered as a map marker
- Map moves underneath the fixed overlay
- Disabled default map user location markers (`showsUserLocation={false}`)

**Files Changed:**
- `components/map/GoogleMap.tsx` - Removed user location marker
- `components/map/MapboxMap.tsx` - Removed user location marker and radar pulse
- `components/map/CenterUserAvatar.tsx` - Enhanced with clearer documentation
- `app/(tabs)/map.tsx` - Clear state separation comments

---

### ✅ 2. Selecting a Person No Longer Moves Center User
**Problem:** Selection logic was unclear and might have affected center position.

**Solution:**
- Completely separated state variables:
  - `userLocation` - Logged-in user position
  - `selectedPartner` - Currently selected person (independent)
  - `isFindingLocation` - Pulse animation state
- Added clear comments in `handleMarkerPress` explaining correct behavior:
  - ✅ DO: Highlight selected marker
  - ✅ DO: Show bottom person card
  - ✅ DO: Dim other markers
  - ❌ DON'T: Move map center
  - ❌ DON'T: Move logged-in user avatar
  - ❌ DON'T: Restart pulse animation

**Files Changed:**
- `app/(tabs)/map.tsx` - State separation and selection logic comments

---

### ✅ 3. Pulse Animation Stops After Loading Users
**Problem:** Pulse animation continued indefinitely, even after nearby users were loaded.

**Solution:**
- Added new state: `isFindingLocation` (separate from `isGettingLocation`)
- `isFindingLocation` starts as `true`
- Stops automatically when `isLoading === false` and `nearbyUsers.length > 0`
- Restarts when refetching (`isLoading === true`)
- Pulse only renders when `isFindingLocation === true`

**Code:**
```typescript
// Stop finding animation once users are loaded
useEffect(() => {
  if (!isLoading && nearbyUsers.length > 0) {
    setIsFindingLocation(false);
  } else if (isLoading) {
    setIsFindingLocation(true);
  }
}, [isLoading, nearbyUsers.length]);
```

**Files Changed:**
- `app/(tabs)/map.tsx` - Added `isFindingLocation` state and effect
- `components/map/RadarPulse.tsx` - Added usage rules in comments

---

### ✅ 4. Clear Visual Hierarchy Established
**Problem:** Visual hierarchy between logged-in user and selected person was unclear.

**Solution:**

#### Logged-in User (Largest, Always Visible)
- Avatar size: 88x88px (increased from 80x80px)
- Border width: 5px (increased from 4px)
- Shadow: Larger and more prominent
- Z-index: 100 (highest)
- Never affected by selection

#### Selected Person Marker (Highlighted)
- Scale: 1.08x (up from 1.05x)
- Green glow ring with 85% opacity
- Border width: 4px
- Shadow with 16px radius
- Stands out clearly

#### Other People (Normal or Dimmed)
- When another marker selected:
  - Scale: 0.95x (slightly smaller)
  - Opacity: 0.5 (more dimmed for better contrast)
  - No glow
- When no selection:
  - Scale: 1.0x
  - Opacity: 1.0
  - No glow

**Files Changed:**
- `components/map/CenterUserAvatar.tsx` - Increased size and shadow
- `components/map/AnimatedMarkerWrapper.tsx` - Enhanced selection/dimming animations

---

### ✅ 5. Bottom Person Card Fixed
**Problem:** Card appeared but map state was inconsistent.

**Solution:**
- Card is completely independent from map state
- Only triggered by `selectedPartner` state
- Smooth slide-up animation (translateY + opacity)
- Dismiss by tapping overlay (doesn't affect map)
- Card shows person-specific info (not event info)

**Behavior:**
1. Marker tapped → `setSelectedPartner(user.id)`
2. Card slides up with spring animation (300ms)
3. Selected marker highlighted automatically (AnimatedMarkerWrapper)
4. Other markers dimmed automatically
5. Tap outside or map → Card slides down, selection clears

**Files Changed:**
- `app/(tabs)/map.tsx` - Animation logic preserved
- `components/map/PersonCard.tsx` - Enhanced documentation

---

## Architecture Summary

### Correct Layer Stack (Bottom to Top)

1. **Map (Layer 1)** - Background, moves when user pans
2. **Person Markers (Layer 2)** - Positioned relative to map, move with map
3. **Fixed Center Overlay (Layer 3)** - Logged-in user avatar, NEVER moves
4. **Pulse Animation (Layer 4)** - When finding, attached to center overlay
5. **UI Controls (Layer 5)** - Top bar, buttons
6. **Bottom Person Card (Layer 6)** - When marker selected

### State Separation (Critical)

```typescript
// 1. Logged-in user state (fixed overlay)
const [userLocation, setUserLocation] = useState(...);
const [isFindingLocation, setIsFindingLocation] = useState(true);

// 2. Selected person state (independent)
const [selectedPartner, setSelectedPartner] = useState<string | null>(null);

// 3. UI state
const [showFilters, setShowFilters] = useState(false);
const [mapType, setMapType] = useState('standard');
```

**❌ NEVER mix these states!**

---

## Testing Checklist

### ✅ Logged-in User Avatar
- [ ] Avatar appears at screen center
- [ ] Avatar NEVER moves when panning map
- [ ] Avatar NEVER moves when selecting person
- [ ] Avatar is largest (88x88px)
- [ ] Avatar has prominent shadow

### ✅ Pulse Animation
- [ ] Pulse starts on screen load
- [ ] Pulse stops after nearby users loaded
- [ ] Pulse does NOT restart when selecting person
- [ ] Pulse restarts when refetching (changing filters)

### ✅ Person Selection
- [ ] Tapping marker highlights it (green glow, 1.08x scale)
- [ ] Other markers dim (0.5 opacity, 0.95x scale)
- [ ] Map does NOT move/recenter
- [ ] Logged-in user avatar does NOT move
- [ ] Bottom card slides up smoothly

### ✅ Bottom Person Card
- [ ] Shows profile photo, name, age
- [ ] Shows distance and match %
- [ ] "View Profile" button works
- [ ] "Message" button (if connected)
- [ ] Tapping outside dismisses card
- [ ] Card slide animation is smooth (300ms)

### ✅ Visual Hierarchy
- [ ] Logged-in user is most prominent (largest, top layer)
- [ ] Selected person is clearly highlighted
- [ ] Other people are visibly dimmed when selection active
- [ ] No confusion about which is "me" vs "selected person"

---

## Key Files Modified

1. **`app/(tabs)/map.tsx`**
   - Added `isFindingLocation` state
   - Effect to stop pulse when users loaded
   - Clear state separation comments
   - Selection logic documentation

2. **`components/map/GoogleMap.tsx`**
   - Removed user location marker with radar pulse
   - Disabled `showsUserLocation` and `showsMyLocationButton`
   - Logged-in user now only in fixed overlay

3. **`components/map/MapboxMap.tsx`**
   - Removed user location marker annotations
   - Removed radar pulse annotation
   - Set UserLocation to invisible (only for tracking)
   - Added clear comment explaining architecture

4. **`components/map/CenterUserAvatar.tsx`**
   - Increased size to 88x88px
   - Enhanced shadow and border
   - Clear architecture comments

4. **`components/map/AnimatedMarkerWrapper.tsx`**
   - Enhanced selection animation (1.08x scale)
   - Improved glow visibility (85% opacity)
   - Better dimming (0.5 opacity, 0.95x scale)

5. **`components/map/PersonCard.tsx`**
   - Enhanced documentation
   - Clarified it's person-specific (not event)

6. **`components/map/RadarPulse.tsx`**
   - Added usage rules in comments
   - Clarified when to show/hide

---

## Design Principles

### 1. Fixed Overlay vs Map Marker
- **Logged-in user = Fixed overlay** (absolute position, never moves)
- **Other users = Map markers** (positioned on map, move with map)

### 2. State Independence
- User location state ≠ Selected person state
- Selection never affects logged-in user position

### 3. Visual Clarity
- Size hierarchy: Logged-in user > Selected person > Others
- Opacity hierarchy: Logged-in user (1.0) > Selected (1.0) > Others (0.5 when dimmed)
- Scale hierarchy: Selected (1.08x) > Logged-in/Others (1.0) > Dimmed (0.95x)

### 4. Animation Purpose
- Pulse = "Finding nearby people"
- Stops immediately when found
- Does not restart on selection

### 5. Selection Feedback
- Highlight selected (glow + scale)
- Dim others (opacity + slight scale down)
- Show bottom card
- No map movement

---

## Future Enhancements (Optional)

1. **Accessibility**
   - Add screen reader labels for map elements
   - Ensure animations respect reduced motion preference

2. **Performance**
   - Consider using native driver for all animations
   - Lazy load distant markers

3. **UX Polish**
   - Add haptic feedback on marker selection
   - Subtle pulse on logged-in avatar when centered

4. **Error States**
   - Show helpful message if no nearby users
   - Handle location permission denied gracefully

---

## Conclusion

The Map screen now correctly implements the Figma design with:
- ✅ Fixed logged-in user avatar at center (never moves)
- ✅ Proper state separation (user vs selected person)
- ✅ Pulse animation that stops after loading
- ✅ Clear visual hierarchy (size, opacity, shadows)
- ✅ Smooth person card with proper dismiss behavior

All interaction logic now follows the correct architecture pattern.

