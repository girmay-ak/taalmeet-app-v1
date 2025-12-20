# Map Screen Testing Checklist

Use this checklist to verify all fixes are working correctly.

---

## ✅ Test 1: Logged-in User Avatar (Fixed Center)

### Expected Behavior
- [ ] Avatar appears at exact center of screen
- [ ] Avatar size is 88x88px (larger than other markers)
- [ ] Avatar has white border (5px)
- [ ] Avatar has prominent shadow
- [ ] Avatar displays profile photo or initial

### Test Steps
1. Open the Map screen
2. **Pan the map in all directions** (up, down, left, right)
3. **Zoom in and out**
4. **Select a person marker**

### ✅ Pass Criteria
- Center avatar NEVER moves during any of the above actions
- Avatar stays perfectly centered at all times
- Map slides underneath the fixed avatar

---

## ✅ Test 2: Pulse Animation Lifecycle

### Expected Behavior
- [ ] Pulse animation shows on screen load
- [ ] Pulse has 3 rings expanding outward
- [ ] Pulse has rotating radar beam
- [ ] Pulse stops when nearby users load
- [ ] Pulse does NOT restart when selecting a person

### Test Steps
1. Open the Map screen
2. **Observe the pulse animation** (should be active)
3. **Wait for nearby users to load** (markers appear)
4. **Tap a person marker**
5. **Open filters and change distance**

### ✅ Pass Criteria
- Pulse shows while loading: ✅
- Pulse stops once users appear: ✅
- Pulse does NOT restart on marker selection: ✅
- Pulse restarts when changing filters (refetching): ✅

---

## ✅ Test 3: Person Marker Selection

### Expected Behavior
- [ ] Tapping marker highlights it
- [ ] Selected marker scales up (1.08x)
- [ ] Selected marker has green glow ring
- [ ] Other markers dim (0.5 opacity, 0.95x scale)
- [ ] Bottom card slides up smoothly

### Test Steps
1. **Tap a person marker**
2. **Observe the visual changes**
3. **Tap a different marker**

### ✅ Pass Criteria
- Selected marker has visible green glow: ✅
- Selected marker is slightly larger: ✅
- Other markers are clearly dimmed: ✅
- Bottom card appears with 300ms animation: ✅
- Map does NOT move/recenter: ✅
- Center avatar does NOT move: ✅

---

## ✅ Test 4: Visual Hierarchy

### Expected Behavior
Clear size and prominence order:
1. **Logged-in user** (largest, 88x88px, always visible)
2. **Selected person** (highlighted, 1.08x scale, green glow)
3. **Other people** (normal or dimmed)

### Test Steps
1. **Look at the map with no selection**
2. **Select a person marker**
3. **Compare sizes visually**

### ✅ Pass Criteria
- Center user is clearly largest: ✅
- Selected marker stands out: ✅
- Dimmed markers are obviously less prominent: ✅
- No confusion about which is "me": ✅

---

## ✅ Test 5: Bottom Person Card

### Expected Behavior
- [ ] Card shows profile photo
- [ ] Card shows name + age
- [ ] Card shows distance (km)
- [ ] Card shows match percentage
- [ ] "View Profile" button works
- [ ] "Message" button shows (if connected)
- [ ] Card dismisses smoothly

### Test Steps
1. **Tap a person marker**
2. **Check card content**
3. **Tap "View Profile"** (should navigate)
4. **Go back to map**
5. **Select marker again**
6. **Tap outside the card** (on map)

### ✅ Pass Criteria
- Card slides up smoothly: ✅
- All info displays correctly: ✅
- Buttons are functional: ✅
- Tapping outside dismisses card: ✅
- Selection state resets after dismiss: ✅

---

## ✅ Test 6: Map Panning & Zooming

### Expected Behavior
- [ ] Map pans smoothly
- [ ] Map zooms smoothly
- [ ] Person markers move with map
- [ ] Center avatar NEVER moves
- [ ] Pulse (when active) stays centered

### Test Steps
1. **Pan the map** (drag with finger)
2. **Zoom in** (pinch to zoom)
3. **Zoom out**
4. **Select a marker and then pan**

### ✅ Pass Criteria
- Map responds to touch gestures: ✅
- Person markers are positioned on map (move with it): ✅
- Center avatar stays fixed: ✅
- Pulse stays centered on avatar (if active): ✅

---

## ✅ Test 7: No Unwanted Recentering

### Expected Behavior
Map should NOT recenter when:
- [ ] Selecting a person marker
- [ ] Dismissing the person card
- [ ] Changing selection to different marker

### Test Steps
1. **Pan the map to show off-center area**
2. **Select a person marker** (not at center)
3. **Dismiss the card**
4. **Select another marker**

### ✅ Pass Criteria
- Map stays where user panned it: ✅
- No automatic recentering occurs: ✅
- Only "My Location" button recenters map: ✅

---

## ✅ Test 8: Filter Changes

### Expected Behavior
- [ ] Opening filters works
- [ ] Changing distance updates markers
- [ ] Pulse restarts briefly during refetch
- [ ] Pulse stops when new results load

### Test Steps
1. **Open filters** (tap location card)
2. **Change max distance slider**
3. **Tap "Show Results"**
4. **Observe pulse animation**

### ✅ Pass Criteria
- Filters modal opens: ✅
- Changing filters refetches users: ✅
- Pulse shows during refetch: ✅
- Pulse stops when complete: ✅
- Center avatar never moves: ✅

---

## ✅ Test 9: Edge Cases

### Test Case 9.1: No Nearby Users
**Expected:** Pulse should eventually stop even if no users found

### Test Case 9.2: Location Permission Denied
**Expected:** Map shows default location, no crashes

### Test Case 9.3: Rapid Marker Selection
**Expected:** Smooth transitions, no animation glitches

### Test Case 9.4: Map Type Changes
**Expected:** Switching map types preserves all behavior

---

## 🎯 Overall Success Criteria

### Must Pass (Critical)
- ✅ Center avatar NEVER moves
- ✅ Pulse stops after loading users
- ✅ Selection doesn't recenter map
- ✅ Visual hierarchy is clear

### Should Pass (Important)
- ✅ Animations are smooth (60fps)
- ✅ No console errors or warnings
- ✅ All buttons/actions work
- ✅ Cards dismiss properly

### Nice to Have (Polish)
- ✅ Haptic feedback on selection
- ✅ Smooth transitions between states
- ✅ Proper dark mode support

---

## Common Issues & Solutions

### Issue: Avatar still moves with map
**Solution:** Check that `CenterUserAvatar` is not inside `MapView` component. It should be a sibling with absolute positioning.

### Issue: Pulse never stops
**Solution:** Verify `isFindingLocation` state is being updated in the useEffect when users load.

### Issue: Selection doesn't show glow
**Solution:** Check `AnimatedMarkerWrapper` is receiving `isSelected` prop correctly.

### Issue: Multiple avatars appear
**Solution:** Ensure GoogleMap/MapboxMap don't render user location markers.

---

## Report Issues

If any test fails:
1. Note which test failed
2. Describe the incorrect behavior
3. Check console for errors
4. Take a screenshot if visual issue
5. Refer to `MAP_INTERACTION_FIX.md` for architecture details

---

**All tests passing?** 🎉  
The Map screen is now correctly implemented per Figma design!

