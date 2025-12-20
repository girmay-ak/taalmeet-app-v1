# Person Selection Animations - Quick Test Guide

## 🚀 Quick Start Testing

### 1. Run the App
```bash
cd /Users/girmaybaraki/Documents/APP-2026/taalmeet-app-v1
npm start
# Or
expo start
```

### 2. Navigate to Map Tab
- Open the app in Expo Go
- Tap the "Map" tab at the bottom
- Wait for map to load and show nearby users

---

## ✅ Test Scenarios

### **Test 1: Marker Selection**
**Action**: Tap on any person marker on the map

**Expected Results**:
1. ✅ Selected marker **scales up** from 1.0 → 1.05 (150-200ms)
2. ✅ A **soft green glow ring** appears around the marker
3. ✅ All **other markers dim** to 60% opacity
4. ✅ Animation is **smooth** (no stuttering)

---

### **Test 2: Person Card Appearance**
**Action**: After tapping a marker

**Expected Results**:
1. ✅ A **compact card** slides up from the bottom (translateY: 40 → 0)
2. ✅ Card **fades in** from 0 → 1 opacity (250-300ms)
3. ✅ Card shows:
   - Circular profile photo (56px)
   - Name + age (bold, 16px)
   - Distance + match % (13px, muted)
   - **View Profile** button (green, primary)
   - **Message** button (secondary, grey)
4. ✅ Card height is **compact** (~100px)
5. ✅ Card has **dark/blurred background** style

---

### **Test 3: Dismiss Animation**
**Action**: Tap anywhere on the map (outside the card)

**Expected Results**:
1. ✅ Card **slides down** (translateY: 0 → 40) over 250ms
2. ✅ Card **fades out** (opacity: 1 → 0)
3. ✅ Selected marker **returns to normal scale** (1.05 → 1.0)
4. ✅ All markers **restore full opacity** (0.6 → 1.0)
5. ✅ Animations are synchronized

---

### **Test 4: Multiple Markers**
**Action**: Tap different person markers in sequence

**Expected Results**:
1. ✅ Previous marker returns to normal
2. ✅ New marker gets selected with glow
3. ✅ Card updates with new person info
4. ✅ Smooth transitions between selections
5. ✅ No animation glitches

---

### **Test 5: Button Interactions**
**Action**: Tap the buttons in the person card

**Expected Results**:
1. ✅ **View Profile** button:
   - Navigates to `/partner/{id}`
   - Profile screen opens
2. ✅ **Message** button:
   - If **connected**: navigates to `/chat/{id}`
   - If **not connected**: button is greyed out/disabled
3. ✅ Card remains visible during navigation prep

---

### **Test 6: Connection Status**
**Action**: Select users with different connection statuses

**Expected Results**:
1. ✅ **Connected user**:
   - Message button is **enabled** (green/primary style)
   - Tap opens chat
2. ✅ **Not connected user**:
   - Message button is **disabled** (grey, muted)
   - Tap does nothing
3. ✅ **Pending request**:
   - Message button shows as disabled

---

### **Test 7: Performance**
**Action**: Rapidly tap multiple markers

**Expected Results**:
1. ✅ Animations remain **smooth at 60fps**
2. ✅ No dropped frames or jank
3. ✅ UI stays responsive
4. ✅ No memory leaks (check with React DevTools)

---

### **Test 8: Dark Mode**
**Action**: Toggle device dark mode on/off

**Expected Results**:
1. ✅ Card background adapts to theme
2. ✅ Text colors remain readable
3. ✅ Glow ring stays green (#07BD74)
4. ✅ Buttons maintain proper contrast

---

### **Test 9: Map Providers**
**Action**: Test on both Mapbox and Google Maps

**Expected Results**:
1. ✅ **Mapbox**: All animations work correctly
2. ✅ **Google Maps**: All animations work correctly
3. ✅ Consistent behavior across providers
4. ✅ Glow ring appears correctly on both

---

### **Test 10: Edge Cases**
**Action**: Try unusual interactions

**Expected Results**:
1. ✅ **Tap same marker twice**: No issues
2. ✅ **Dismiss during animation**: Graceful handling
3. ✅ **Rotate device**: Card repositions correctly
4. ✅ **Background app**: Animations pause/resume properly

---

## 🐛 Known Issues to Watch For

### Potential Issues (should NOT happen):
- ❌ Markers don't scale smoothly
- ❌ Glow ring doesn't appear
- ❌ Card slides too fast/slow
- ❌ Other markers don't dim
- ❌ Dismiss doesn't restore markers
- ❌ Animation stutters or drops frames
- ❌ Card overlaps map controls
- ❌ Buttons don't respond to taps

---

## 📊 Performance Benchmarks

### Target Performance:
- **Marker animation**: 150-200ms (spring)
- **Card slide**: 250-300ms (spring)
- **Fade in/out**: 250-300ms (linear)
- **Frame rate**: Locked 60fps
- **Memory**: No leaks, stable heap

### Check Performance:
```bash
# Enable React DevTools
# Tap "Performance" tab
# Monitor frame rate during animations
```

---

## 🎨 Visual Checklist

### Marker Selection:
- [x] Marker scales visibly (but not too much)
- [x] Green glow is soft and subtle
- [x] Other markers dim noticeably
- [x] Animations feel natural (spring physics)

### Person Card:
- [x] Card is compact (not too tall)
- [x] Slide-up feels snappy but smooth
- [x] Profile photo loads correctly
- [x] Text is readable and well-spaced
- [x] Buttons are clearly actionable
- [x] Card shadow is visible

### Interactions:
- [x] Tap targets are large enough
- [x] Feedback is immediate
- [x] Dismiss is intuitive
- [x] No accidental dismissals

---

## 📱 Device Testing

### Test On:
- **iOS Simulator** (Xcode)
- **Android Emulator** (Android Studio)
- **Physical iOS Device** (iPhone)
- **Physical Android Device** (Pixel, Samsung, etc.)

### Screen Sizes:
- Small phones (iPhone SE, 4.7")
- Regular phones (iPhone 15, 6.1")
- Large phones (iPhone 15 Pro Max, 6.7")
- Tablets (iPad)

---

## 🔧 Debugging

### If animations are not working:

1. **Check react-native-reanimated setup**:
   ```bash
   # Verify in babel.config.js
   # Should have: plugins: ['react-native-reanimated/plugin']
   ```

2. **Clear cache and rebuild**:
   ```bash
   npm start -- --clear
   ```

3. **Check console for errors**:
   - Open React DevTools
   - Look for animation warnings
   - Check for "useNativeDriver" errors

4. **Verify imports**:
   ```typescript
   import Animated, { useSharedValue, withSpring } from 'react-native-reanimated';
   ```

---

## 🎯 Success Criteria

### All Tests Pass When:
1. ✅ Markers scale and glow on selection
2. ✅ Other markers dim appropriately
3. ✅ Person card slides up smoothly
4. ✅ Card displays all info correctly
5. ✅ Dismiss animation restores everything
6. ✅ Buttons work as expected
7. ✅ 60fps throughout all interactions
8. ✅ Works in both dark and light mode
9. ✅ Compatible with Expo Go
10. ✅ No console errors or warnings

---

## 📞 Support

### If Issues Occur:
1. Check `PERSON_SELECTION_ANIMATIONS.md` for details
2. Review component code in `components/map/`
3. Test on different devices
4. Check React Native version compatibility
5. Verify reanimated configuration

---

**Last Updated**: December 19, 2025  
**Implementation Status**: ✅ Complete and Ready for Testing

