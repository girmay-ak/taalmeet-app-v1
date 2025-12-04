# Web Architecture Guide for TaalMeet

## 🎯 Recommendation: **SAME REPOSITORY** (Monorepo Approach)

**Best Practice:** Use the same repository with Expo's built-in web support. This allows:
- ✅ Code sharing (90%+ shared code)
- ✅ Single codebase maintenance
- ✅ Consistent features across platforms
- ✅ Easier deployment and updates

---

## 📐 Architecture Overview

### Current Setup (Already Configured!)

Your app already has web support:
- ✅ `react-native-web` installed
- ✅ `react-dom` installed  
- ✅ Web config in `app.json`
- ✅ Script: `npm run web` or `make web`

### How It Works

```
┌─────────────────────────────────────┐
│     Shared Code (90%+)              │
│  - Services (Supabase, API calls)   │
│  - Hooks (React Query)              │
│  - Business Logic                   │
│  - Types & Utils                    │
└─────────────────────────────────────┘
           │              │
           ▼              ▼
    ┌──────────┐    ┌──────────┐
    │  Mobile  │    │   Web    │
    │ (iOS/    │    │ (Browser)│
    │ Android) │    │          │
    └──────────┘    └──────────┘
```

---

## 🔧 Platform-Specific Code Strategy

### 1. Use Platform Detection

```tsx
import { Platform } from 'react-native';

// Platform-specific components
if (Platform.OS === 'web') {
  // Web-specific code
} else {
  // Mobile-specific code
}
```

### 2. Platform-Specific Files

Create platform-specific files:
- `MapView.web.tsx` - Web map implementation
- `MapView.tsx` - Mobile map implementation
- `Notifications.web.tsx` - Web notifications
- `Notifications.tsx` - Mobile notifications

Expo automatically picks the right file based on platform!

---

## 🌐 Web-Specific Considerations

### Maps
- **Mobile:** Use `react-native-maps` or `@rnmapbox/maps`
- **Web:** Use Google Maps JavaScript API or Mapbox GL JS

### Notifications
- **Mobile:** Use `expo-notifications`
- **Web:** Use Web Push API or browser notifications

### Location
- **Mobile:** Use `expo-location`
- **Web:** Use browser Geolocation API

### Storage
- **Mobile:** Use `@react-native-async-storage/async-storage`
- **Web:** Use `localStorage` or `sessionStorage`

### Image Picker
- **Mobile:** Use `expo-image-picker`
- **Web:** Use HTML5 file input

---

## 📁 Recommended File Structure

```
app/
  (tabs)/
    index.tsx          # Shared
    map.tsx            # Platform-specific maps
components/
  map/
    GoogleMap.tsx      # Mobile
    GoogleMap.web.tsx  # Web (uses Google Maps JS API)
  notifications/
    PushNotifications.tsx      # Mobile
    PushNotifications.web.tsx  # Web (uses Web Push)
utils/
  platform/
    storage.ts         # Platform-agnostic storage wrapper
    location.ts        # Platform-agnostic location wrapper
```

---

## 🚀 Implementation Steps

### Step 1: Test Current Web Build

```bash
npm run web
# or
make web
```

This will start the web version. Check what works and what needs fixes.

### Step 2: Create Platform-Specific Components

For components that don't work on web, create `.web.tsx` versions:

**Example: Maps**

```tsx
// components/map/GoogleMap.web.tsx
import { useEffect, useRef } from 'react';
import { View, StyleSheet } from 'react-native';

export function GoogleMap({ users, userLocation }) {
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mapRef.current) return;

    // Initialize Google Maps JavaScript API
    const map = new google.maps.Map(mapRef.current, {
      center: { lat: userLocation.latitude, lng: userLocation.longitude },
      zoom: 13,
    });

    // Add markers
    users.forEach(user => {
      new google.maps.Marker({
        position: { lat: user.lat, lng: user.lng },
        map,
        title: user.displayName,
      });
    });
  }, [users, userLocation]);

  return <View ref={mapRef} style={StyleSheet.absoluteFill} />;
}
```

### Step 3: Platform Utilities

Create platform-agnostic utilities:

```tsx
// utils/platform/storage.ts
import * as AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

export const storage = {
  async getItem(key: string) {
    if (Platform.OS === 'web') {
      return localStorage.getItem(key);
    }
    return AsyncStorage.getItem(key);
  },
  
  async setItem(key: string, value: string) {
    if (Platform.OS === 'web') {
      localStorage.setItem(key, value);
    } else {
      await AsyncStorage.setItem(key, value);
    }
  },
};
```

---

## 🎨 Web-Specific UI Considerations

### Responsive Design

```tsx
import { useWindowDimensions } from 'react-native';

export function ResponsiveComponent() {
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;
  const isDesktop = width >= 1024;

  return (
    <View style={isDesktop ? styles.desktop : styles.mobile}>
      {/* Content */}
    </View>
  );
}
```

### Web Navigation

Expo Router works on web! It uses:
- Browser history API
- URL-based routing
- Deep linking support

### Web-Specific Features

- **Keyboard shortcuts** (Ctrl+K for search, etc.)
- **Right-click context menus**
- **Drag and drop**
- **Copy/paste**
- **Browser back/forward buttons**

---

## 📦 Deployment Options

### Option 1: Expo Hosting (Easiest)

```bash
# Install Expo CLI
npm install -g expo-cli

# Build for web
npx expo export:web

# Deploy to Expo hosting
npx expo publish:web
```

### Option 2: Vercel/Netlify

```bash
# Build static export
npx expo export:web

# Deploy to Vercel
vercel deploy

# Or Netlify
netlify deploy --prod
```

### Option 3: Custom Server

```bash
# Build
npx expo export:web

# Serve with any static server
cd web-build
python -m http.server 8000
```

---

## 🔍 What Needs Web-Specific Implementation

### High Priority
1. **Maps** - Use Google Maps JS API or Mapbox GL JS
2. **Location** - Browser Geolocation API
3. **Notifications** - Web Push API
4. **Image Upload** - HTML5 file input
5. **Storage** - localStorage wrapper

### Medium Priority
6. **Camera** - WebRTC getUserMedia
7. **File System** - File API
8. **Share** - Web Share API

### Low Priority
9. **Biometrics** - Not available on web
10. **Haptic Feedback** - Not available on web

---

## 📝 Example: Platform-Specific Map Component

```tsx
// components/map/MapView.tsx (Mobile)
import MapView from 'react-native-maps';

export function MapViewComponent(props) {
  return <MapView {...props} />;
}

// components/map/MapView.web.tsx (Web)
import { useEffect, useRef } from 'react';
import { View } from 'react-native';

export function MapViewComponent({ userLocation, users }) {
  const mapRef = useRef(null);

  useEffect(() => {
    // Load Google Maps JS API
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}`;
    script.async = true;
    document.head.appendChild(script);

    script.onload = () => {
      const map = new google.maps.Map(mapRef.current, {
        center: { lat: userLocation.latitude, lng: userLocation.longitude },
        zoom: 13,
      });

      users.forEach(user => {
        new google.maps.Marker({
          position: { lat: user.lat, lng: user.lng },
          map,
        });
      });
    };
  }, []);

  return <View ref={mapRef} style={{ flex: 1 }} />;
}
```

---

## ✅ Advantages of Same Repository

1. **Code Reuse:** 90%+ code shared
2. **Consistency:** Same features across platforms
3. **Maintenance:** One codebase to maintain
4. **Testing:** Test once, works everywhere
5. **Deployment:** Single CI/CD pipeline
6. **Team:** One team, one codebase

---

## ❌ When to Use Separate Repository

Only consider separate repo if:
- Web and mobile have completely different features
- Different teams working on each
- Different release cycles
- Web needs completely different tech stack

**For TaalMeet:** Same repository is the best choice! ✅

---

## 🚀 Quick Start: Test Web Version

```bash
# Start web development server
npm run web

# Or with Makefile
make web
```

Then open: `http://localhost:8081` (or the URL shown in terminal)

---

## 📚 Resources

- [Expo Web Documentation](https://docs.expo.dev/workflow/web/)
- [React Native Web](https://necolas.github.io/react-native-web/)
- [Platform-Specific Code](https://reactnative.dev/docs/platform-specific-code)

---

## 🎯 Next Steps

1. ✅ Test current web build: `npm run web`
2. ✅ Identify components that need web versions
3. ✅ Create `.web.tsx` files for platform-specific code
4. ✅ Test on different screen sizes
5. ✅ Deploy to hosting (Vercel/Netlify/Expo)

