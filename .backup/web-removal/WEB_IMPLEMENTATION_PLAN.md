# Web Implementation Plan for TaalMeet

## 🎯 Strategy: Same Repository (Recommended)

**Decision:** Use the same repository with Expo's web support. This is the best approach because:
- ✅ 90%+ code sharing
- ✅ Single codebase maintenance
- ✅ Consistent features
- ✅ Easier deployment

---

## 📋 Implementation Checklist

### Phase 1: Foundation (Week 1)

- [ ] **Test current web build**
  ```bash
  npm run web
  ```
  - Identify what works
  - List components that need fixes

- [ ] **Create platform utilities**
  - [ ] `utils/platform/storage.ts` - Unified storage API
  - [ ] `utils/platform/location.ts` - Unified location API
  - [ ] `utils/platform/notifications.ts` - Unified notifications API

- [ ] **Set up web-specific config**
  - [ ] Add Google Maps JS API key to web config
  - [ ] Configure web build settings in `app.json`
  - [ ] Set up web-specific environment variables

### Phase 2: Platform-Specific Components (Week 2-3)

- [ ] **Maps**
  - [ ] Create `components/map/GoogleMap.web.tsx`
  - [ ] Use Google Maps JavaScript API
  - [ ] Implement markers and user location
  - [ ] Add map controls (zoom, pan)

- [ ] **Location Services**
  - [ ] Create `utils/platform/location.web.ts`
  - [ ] Use browser Geolocation API
  - [ ] Handle permissions
  - [ ] Add location accuracy settings

- [ ] **Notifications**
  - [ ] Create `components/notifications/PushNotifications.web.tsx`
  - [ ] Implement Web Push API
  - [ ] Request notification permissions
  - [ ] Handle notification clicks

- [ ] **Image Upload**
  - [ ] Create `components/image/ImagePicker.web.tsx`
  - [ ] Use HTML5 file input
  - [ ] Add drag & drop support
  - [ ] Image preview and cropping

### Phase 3: UI/UX Adjustments (Week 3-4)

- [ ] **Responsive Design**
  - [ ] Add breakpoints for tablet/desktop
  - [ ] Adjust layouts for larger screens
  - [ ] Optimize touch vs mouse interactions

- [ ] **Web-Specific Features**
  - [ ] Keyboard shortcuts
  - [ ] Right-click context menus
  - [ ] Browser back/forward navigation
  - [ ] Copy/paste support

- [ ] **Performance**
  - [ ] Code splitting for web
  - [ ] Lazy loading components
  - [ ] Optimize bundle size
  - [ ] Add service worker for offline support

### Phase 4: Testing & Deployment (Week 4-5)

- [ ] **Testing**
  - [ ] Test on Chrome, Firefox, Safari, Edge
  - [ ] Test responsive design (mobile, tablet, desktop)
  - [ ] Test all features work on web
  - [ ] Cross-browser compatibility

- [ ] **Deployment**
  - [ ] Set up Vercel/Netlify deployment
  - [ ] Configure custom domain
  - [ ] Set up CI/CD for web builds
  - [ ] Add analytics

---

## 🔧 Technical Implementation Details

### 1. Platform Detection Pattern

```tsx
// utils/platform/index.ts
import { Platform } from 'react-native';

export const isWeb = Platform.OS === 'web';
export const isIOS = Platform.OS === 'ios';
export const isAndroid = Platform.OS === 'android';
export const isMobile = !isWeb;
```

### 2. Conditional Imports

```tsx
// components/MapView.tsx
import { Platform } from 'react-native';

let MapComponent;
if (Platform.OS === 'web') {
  MapComponent = require('./MapView.web').MapView;
} else {
  MapComponent = require('./MapView.native').MapView;
}

export { MapComponent as MapView };
```

### 3. Web-Specific Config

```json
// app.json
{
  "expo": {
    "web": {
      "favicon": "./assets/favicon.png",
      "bundler": "metro",
      "build": {
        "babel": {
          "include": ["react-native-reanimated/plugin"]
        }
      }
    }
  }
}
```

---

## 📦 Required Web Dependencies

Most are already installed! Just need to add:

```bash
# For Google Maps on web (if not using Mapbox)
# Already have react-native-web ✅
# Already have react-dom ✅

# Optional: Web-specific optimizations
npm install --save-dev @expo/webpack-config
```

---

## 🗺️ Map Implementation Strategy

### Option 1: Google Maps JavaScript API (Recommended for Web)

```tsx
// components/map/GoogleMap.web.tsx
import { useEffect, useRef } from 'react';
import { View, StyleSheet } from 'react-native';

const GOOGLE_MAPS_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;

export function GoogleMap({ userLocation, users }) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);

  useEffect(() => {
    if (!mapRef.current) return;

    // Load Google Maps script
    if (!window.google) {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places`;
      script.async = true;
      document.head.appendChild(script);

      script.onload = initMap;
    } else {
      initMap();
    }

    function initMap() {
      if (!mapRef.current || !window.google) return;

      mapInstanceRef.current = new google.maps.Map(mapRef.current, {
        center: {
          lat: userLocation?.latitude || 52.0705,
          lng: userLocation?.longitude || 4.3007,
        },
        zoom: 13,
        styles: [
          // Dark theme styles
          { elementType: 'geometry', stylers: [{ color: '#1d2c4d' }] },
          // ... more styles
        ],
      });

      // Add user location marker
      if (userLocation) {
        new google.maps.Marker({
          position: { lat: userLocation.latitude, lng: userLocation.longitude },
          map: mapInstanceRef.current,
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 8,
            fillColor: '#10B981',
            fillOpacity: 1,
            strokeColor: '#FFFFFF',
            strokeWeight: 2,
          },
        });
      }

      // Add user markers
      users?.forEach(user => {
        new google.maps.Marker({
          position: { lat: user.lat, lng: user.lng },
          map: mapInstanceRef.current,
          title: user.displayName,
        });
      });
    }

    return () => {
      // Cleanup
    };
  }, [userLocation, users]);

  return <View ref={mapRef} style={StyleSheet.absoluteFill} />;
}
```

### Option 2: Mapbox GL JS (If using Mapbox)

```tsx
// components/map/MapboxMap.web.tsx
import { useEffect, useRef } from 'react';
import { View, StyleSheet } from 'react-native';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

export function MapboxMap({ userLocation, users }) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<mapboxgl.Map | null>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    mapboxgl.accessToken = process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN!;

    mapInstanceRef.current = new mapboxgl.Map({
      container: mapRef.current,
      style: 'mapbox://styles/mapbox/dark-v10',
      center: [userLocation?.longitude || 4.3007, userLocation?.latitude || 52.0705],
      zoom: 13,
    });

    // Add markers
    // ...

    return () => {
      mapInstanceRef.current?.remove();
    };
  }, []);

  return <View ref={mapRef} style={StyleSheet.absoluteFill} />;
}
```

---

## 🔔 Web Notifications Implementation

```tsx
// components/notifications/PushNotifications.web.tsx
import { useEffect } from 'react';

export function PushNotificationsSetup() {
  useEffect(() => {
    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    // Register service worker for push notifications
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then(registration => {
          // Subscribe to push notifications
          return registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: VAPID_PUBLIC_KEY,
          });
        })
        .then(subscription => {
          // Send subscription to server
          // ...
        });
    }
  }, []);

  return null;
}
```

---

## 📱 Responsive Design Breakpoints

```tsx
// utils/responsive.ts
import { useWindowDimensions } from 'react-native';

export function useResponsive() {
  const { width, height } = useWindowDimensions();

  return {
    isMobile: width < 768,
    isTablet: width >= 768 && width < 1024,
    isDesktop: width >= 1024,
    width,
    height,
  };
}
```

---

## 🚀 Deployment Commands

```bash
# Build for web
npx expo export:web

# Output will be in: web-build/

# Deploy to Vercel
vercel deploy

# Deploy to Netlify
netlify deploy --prod --dir=web-build

# Deploy to Expo Hosting
npx expo publish:web
```

---

## ✅ Summary

**Architecture:** Same Repository (Monorepo)
**Approach:** Platform-specific files (`.web.tsx`)
**Benefits:** 90%+ code sharing, single codebase
**Timeline:** 4-5 weeks for full web implementation

**Next Step:** Test current web build with `npm run web` and identify what needs to be fixed!

