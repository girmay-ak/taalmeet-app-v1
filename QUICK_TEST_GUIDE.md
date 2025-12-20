# Quick Test Guide - Discovery Map Features

## 🚀 How to Test Everything

### Step 1: Start the App
```bash
npm start
# or
npx expo start
```

### Step 2: Open Map Tab
- Navigate to the Map tab in your app
- Wait for location permission prompt (if first time)
- Allow location access

---

## ✅ What to Look For

### 1. 🎯 Radar Animation (At Your Location)
**Expected**:
- ✅ Green radar animation at your current location
- ✅ Rotating beam (completes 360° every 3 seconds)
- ✅ Three pulsing rings expanding outward
- ✅ Glowing center dot
- ✅ Smooth, professional animation

**How to verify**:
- Look at the map where your location is
- You should see a green animated radar
- The beam should rotate continuously
- Rings should pulse outward and fade

---

### 2. 🚩 Language Flags (On User Markers)
**Expected**:
- ✅ Each user marker has a pin shape (not circular)
- ✅ Small flag badge at top-right corner of each pin
- ✅ Flag shows teaching language emoji (🇺🇸 🇪🇸 🇫🇷 etc.)
- ✅ White circular badge with border
- ✅ Online status indicator (green dot) if user is online

**How to verify**:
- Look at nearby user markers on the map
- Check the top-right corner of each pin
- You should see a small flag emoji in a white circle
- Pin should have avatar inside (not circular)

---

### 3. 🎴 Swipeable Event Cards
**Expected**:
- ✅ Calendar button in top-right corner of map
- ✅ Tapping calendar opens full-screen events modal
- ✅ Three sample events displayed
- ✅ Each card shows: image, title, date, time, location, heart icon
- ✅ White card with rounded corners
- ✅ Swipe left/right dismisses card
- ✅ Partial swipe returns to center
- ✅ Fade animation while swiping
- ✅ Heart icon toggles favorite

**How to verify**:
1. **Find calendar button**:
   - Look at top-right corner of map
   - Should see a calendar icon button
   - It's next to the map type toggle button

2. **Open events**:
   - Tap the calendar button
   - Modal should slide up from bottom
   - Should see "Nearby Events" header
   - Should see 3 event cards

3. **Test swipe gestures**:
   - **Swipe left** on first card → card slides out left and disappears
   - **Swipe right** on second card → card slides out right and disappears
   - **Partial swipe** on third card → card returns to center
   - Card should fade while you're swiping

4. **Test favorite**:
   - Tap heart icon on a card
   - Heart should change color (outline ↔ filled)
   - Console should log "Toggle favorite: [eventId]"

5. **Test card press**:
   - Tap anywhere on card (not heart)
   - Console should log "Event pressed: [event object]"

6. **Close modal**:
   - Tap X button in top-left
   - Modal should close
   - Return to map view

---

## 📊 Sample Events

You should see these 3 events:

### 1. National Music Festival
- Image: Concert crowd
- Date: Mon, Dec 24
- Time: 18.00 - 23.00 PM
- Location: Grand Park, New York
- Favorite: No (outline heart)

### 2. Language Exchange Meetup
- Image: People talking
- Date: Tue, Dec 25
- Time: 14.00 - 16.00 PM
- Location: Central Library, NYC
- Favorite: Yes (filled heart)

### 3. International Food Fair
- Image: Food
- Date: Wed, Dec 26
- Time: 12.00 - 20.00 PM
- Location: Times Square, New York
- Favorite: No (outline heart)

---

## 🎨 Visual Checklist

### Event Card Design
- [ ] Card is white
- [ ] Rounded corners (28px)
- [ ] Event image is 120x120px, rounded
- [ ] Title is bold, 20px, black
- [ ] Date/time is purple (#584CF4)
- [ ] Location has purple location icon
- [ ] Heart icon is on the right
- [ ] Shadow effect visible
- [ ] Spacing matches Figma

### User Markers
- [ ] Pin shape (teardrop), not circular
- [ ] Avatar visible inside pin
- [ ] Flag badge at top-right
- [ ] Flag is in white circle
- [ ] Online indicator (green dot) if online
- [ ] Border color: green (online) or gray (offline)

### Radar Animation
- [ ] Green color (#07BD74)
- [ ] Rotating beam visible
- [ ] Beam completes full rotation
- [ ] Rings pulse outward
- [ ] Center dot glows
- [ ] Animation is smooth

---

## 🐛 Troubleshooting

### Issue: No radar animation
**Solution**: 
- Check if you have location permission
- Make sure you're zoomed in enough to see your location
- Radar is at your current GPS location

### Issue: No language flags on markers
**Solution**:
- Flags only show if users have teaching language set
- Check that user data includes languages array
- Fallback is 🌍 if no teaching language

### Issue: Calendar button not visible
**Solution**:
- Look at top-right corner of map
- It's next to the map type toggle button
- Should be a calendar icon

### Issue: Can't swipe cards
**Solution**:
- Make sure you're swiping on the card itself
- Swipe horizontally (left or right)
- Need to swipe at least 30% of screen width to dismiss

### Issue: Mapbox error in console
**Solution**:
- This is expected and handled
- App falls back to Google Maps automatically
- No impact on functionality

---

## 📱 Console Logs to Expect

When testing, you should see these logs:

```javascript
// When toggling favorite
"Toggle favorite: 1"
"Toggle favorite: 2"

// When pressing a card
"Event pressed: { id: '1', title: 'National Music Festival', ... }"

// When swiping (if you add logs)
"Card swiped left"
"Card swiped right"
```

---

## ✅ Success Criteria

Your implementation is working correctly if:

1. ✅ Radar animation plays smoothly at your location
2. ✅ All user markers have language flag badges
3. ✅ Calendar button opens events modal
4. ✅ Event cards match Figma design exactly
5. ✅ Swipe left/right dismisses cards
6. ✅ Partial swipe returns to center
7. ✅ Fade animation works while swiping
8. ✅ Favorite toggle changes heart icon
9. ✅ Card press logs to console
10. ✅ Close button returns to map

---

## 🎉 You're Done!

If all the above works, your discovery map is **fully functional** with:
- ✅ Radar scan animation
- ✅ Language flags on markers
- ✅ Swipeable event cards (Figma design)
- ✅ Professional animations
- ✅ Production-ready code

**Congratulations!** 🚀

