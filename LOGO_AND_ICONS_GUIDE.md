# Logo and Icons Guide

## 🎨 Logo Files Created

### 1. `assets/logo.svg`
Full logo with text "TaalMeet" below the icon
- Size: 200x240px
- Use for: Marketing materials, landing pages, headers

### 2. `assets/logo-icon.svg`
Icon-only version (square, 1024x1024)
- Size: 1024x1024px
- Use for: App icons, favicons, small displays

### 3. Logo Component
`components/logo/TaalMeetLogo.tsx`
- React Native component
- Can be used anywhere in the app
- Props: `size`, `showText`, `variant`

---

## 📱 Generating App Icons

### Quick Method: Online Tool (Recommended)

1. **Go to:** https://www.appicon.co/
2. **Upload:** `assets/logo-icon.svg`
3. **Download** generated icons
4. **Replace** files in `assets/`:
   - `icon.png` (1024x1024)
   - `adaptive-icon.png` (1024x1024)
   - `favicon.png` (48x48)

### Alternative: ImageMagick

```bash
# Install ImageMagick
brew install imagemagick

# Generate icons
convert -background none -resize 1024x1024 assets/logo-icon.svg assets/icon.png
convert -background none -resize 1024x1024 assets/logo-icon.svg assets/adaptive-icon.png
convert -background none -resize 48x48 assets/logo-icon.svg assets/favicon.png
```

### Using Expo

```bash
# Expo can generate icons automatically
npx expo prebuild

# Or use expo-optimize
npx expo-optimize
```

---

## 🎯 Required Icon Sizes

| File | Size | Platform | Purpose |
|------|------|----------|---------|
| `icon.png` | 1024x1024 | iOS/Android | Main app icon |
| `adaptive-icon.png` | 1024x1024 | Android | Adaptive icon foreground |
| `favicon.png` | 48x48 | Web | Browser favicon |

---

## 🎨 Logo Design Details

### Colors Used:
- **Teal Pin:** #4FD1C5 (primary brand color)
- **Dark Blue Profiles:** #1E3A5F (text/people)
- **White Speech Bubble:** #FFFFFF
- **Orange Dots:** #FFA500 (conversation indicator)
- **Text:** #1E3A5F (dark blue)

### Logo Elements:
1. **Location Pin** - Teal gradient, represents location-based matching
2. **Speech Bubble** - White, represents communication
3. **Two People Profiles** - Dark blue, facing each other, represents connection
4. **Three Dots** - Orange, represents conversation/chat
5. **Text "TaalMeet"** - Dark blue, brand name

---

## 📝 Using the Logo Component

### Basic Usage

```tsx
import { TaalMeetLogo, TaalMeetIcon } from '@/components';

// Full logo with text
<TaalMeetLogo size={120} showText={true} variant="full" />

// Icon only (no text)
<TaalMeetLogo size={80} variant="icon" />

// Small icon
<TaalMeetIcon size={48} />
```

### Props

**TaalMeetLogo:**
- `size?: number` - Logo size (default: 120)
- `showText?: boolean` - Show "TaalMeet" text (default: false)
- `variant?: 'full' | 'icon'` - Logo variant (default: 'full')
- `style?: ViewStyle` - Additional styles

**TaalMeetIcon:**
- `size?: number` - Icon size (default: 48)
- `style?: ViewStyle` - Additional styles

---

## 🔄 Next Steps

1. ✅ Logo SVG files created
2. ✅ Logo component created
3. ✅ Integrated into splash screen
4. ⏳ Generate PNG icons from SVG
5. ⏳ Update app.json if needed
6. ⏳ Test on devices

---

## 🚀 Quick Icon Generation

Run the helper script:

```bash
node scripts/generate-icons.js
```

This will show you all the options for generating icons.

