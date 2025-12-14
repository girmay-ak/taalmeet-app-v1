# Mapbox Setup Guide for Expo

## ✅ Step 1: Fix Syntax Error (Already Fixed)

The syntax error in `map.tsx` has been fixed. The JSX comment was removed.

## 🔧 Step 2: Get Mapbox Tokens

You need **TWO** tokens from Mapbox:

1. **Public Access Token** (starts with `pk.`)
   - Used in your app code
   - Get from: https://account.mapbox.com/access-tokens/
   - Add to `.env` as: `EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN=pk.your-token`

2. **Secret Download Token** (starts with `sk.`)
   - Used to download Mapbox SDK during build
   - Get from: https://account.mapbox.com/access-tokens/
   - Must have `Downloads:Read` scope
   - Add to `app.json` plugin config (see Step 3)

## 📝 Step 3: Configure app.json

The Mapbox plugin has been added to `app.json`. Update the download token:

```json
[
  "@rnmapbox/maps",
  {
    "RNMapboxMapsDownloadToken": "sk.YOUR_DOWNLOAD_TOKEN_HERE"
  }
]
```

**Replace `sk.YOUR_DOWNLOAD_TOKEN_HERE` with your actual secret token.**

## 🔑 Step 4: Add Access Token to .env

Create or update your `.env` file:

```bash
EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN=pk.your-public-token-here
```

## 🏗️ Step 5: Rebuild Native Code

Since you're using Expo with custom native code, you need to rebuild:

### Option A: Using Expo Prebuild (Recommended)

```bash
# Clean previous build
npx expo prebuild --clean

# Install iOS pods
cd ios
export LANG=en_US.UTF-8
pod install
cd ..
```

### Option B: Using EAS Build

```bash
# Configure EAS (if not done)
eas build:configure

# Build for iOS
eas build --platform ios --profile development
```

## 📱 Step 6: Rebuild in Xcode

1. Open Xcode:
   ```bash
   open ios/TAALMEET.xcworkspace
   ```

2. In Xcode:
   - Select your iPhone as target device
   - Click **Product → Clean Build Folder** (Shift + Cmd + K)
   - Click **▶️ Play** or press `Cmd + R` to build and run

## ✅ Step 7: Verify Setup

After rebuilding, check the console logs:

- ✅ `[Mapbox] ✅ Native code is available` - Mapbox SDK loaded
- ✅ `[MapScreen] ✅ Using Mapbox map` - Mapbox is working
- ❌ `[Mapbox] ❌ Native code not available` - Need to rebuild

## 🐛 Troubleshooting

### Issue: "Native code not available"

**Solution:**
1. Make sure you ran `npx expo prebuild`
2. Make sure you ran `pod install` in `ios/` directory
3. Rebuild the app in Xcode (don't just reload)
4. Check that the plugin is in `app.json`

### Issue: "Download token invalid"

**Solution:**
1. Verify your secret token has `Downloads:Read` scope
2. Check the token in `app.json` plugin config
3. Regenerate token if needed

### Issue: "Access token missing"

**Solution:**
1. Add `EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN` to `.env`
2. Restart Metro bundler: `npx expo start --clear`

## 📁 File Structure Check

Your setup should have:

```
taalmeet-app-v1/
├── app.json (with @rnmapbox/maps plugin)
├── .env (with EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN)
├── package.json (with @rnmapbox/maps dependency)
├── services/
│   └── mapbox.ts (Mapbox service)
├── components/map/
│   ├── MapboxMap.tsx
│   └── NearbyUserMarkers.tsx
└── app/(tabs)/
    └── map.tsx (using MapboxMap)
```

## 🎯 Quick Checklist

- [ ] Get Mapbox public token (pk.*)
- [ ] Get Mapbox secret download token (sk.*)
- [ ] Add public token to `.env`
- [ ] Add secret token to `app.json` plugin config
- [ ] Run `npx expo prebuild --clean`
- [ ] Run `pod install` in `ios/` directory
- [ ] Rebuild app in Xcode
- [ ] Verify Mapbox loads in console

## 📚 Resources

- Mapbox Tokens: https://account.mapbox.com/access-tokens/
- Mapbox Docs: https://rnmapbox.github.io/docs/install
- Expo Prebuild: https://docs.expo.dev/workflow/prebuild/

