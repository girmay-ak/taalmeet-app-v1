# Map Components

Enhanced map components for the TAALMEET discovery feature, following Figma design specifications.

## Components

### LocationHeaderCard
White card header showing current location with "Change" button.

```tsx
import { LocationHeaderCard } from '@/components/map';

<LocationHeaderCard
  location="New York, United States"
  radiusKm={10}
  onChangePress={() => setShowFilters(true)}
/>
```

### MapPinMarker
Pin-style marker with avatar for displaying users on map.

```tsx
import { MapPinMarker } from '@/components/map';

<MapPinMarker
  avatarUrl="https://example.com/avatar.jpg"
  size={56}
  isOnline={true}
  borderColor="#07BD74"
  displayName="John Doe"
/>
```

### MapPinMarkers
Wrapper component for rendering multiple pin markers on Mapbox.

```tsx
import { MapPinMarkers } from '@/components/map';

<MapPinMarkers
  users={nearbyUsers}
  onMarkerPress={handleMarkerPress}
  markerSize={56}
  showOnlineStatus={true}
/>
```

### EventMarkerCard
Bottom card showing event details when event marker is selected.

```tsx
import { EventMarkerCard } from '@/components/map';

<EventMarkerCard
  event={selectedEvent}
  onPress={() => router.push(`/event/${event.id}`)}
  onToggleFavorite={handleToggleFavorite}
  isFavorite={true}
/>
```

### RadiusCircles
Concentric circles showing distance zones on map.

```tsx
import { RadiusCircles } from '@/components/map';

<RadiusCircles
  center={[lng, lat]}
  radiusKm={[5, 10, 15]}
  colors={['#07BD74', '#07BD74', '#07BD74']}
  opacity={0.1}
/>
```

### MapboxMap
Wrapper around @rnmapbox/maps with user location and camera controls.

```tsx
import { MapboxMap } from '@/components/map';

<MapboxMap
  userLocation={{ latitude: 52.0705, longitude: 4.3007 }}
  showUserLocation={true}
  onUserLocationUpdate={handleLocationUpdate}
  styleURL={Mapbox.StyleURL.Light}
  zoomLevel={13}
>
  {/* Add custom markers here */}
</MapboxMap>
```

### GoogleMap
Fallback map component using react-native-maps.

```tsx
import { GoogleMap } from '@/components/map';

<GoogleMap
  userLocation={{ latitude: 52.0705, longitude: 4.3007 }}
  users={nearbyUsers}
  onUserPress={handleUserPress}
  onUserLocationUpdate={handleLocationUpdate}
  zoomLevel={13}
  mapType="standard"
/>
```

## Design System

### Colors
- **Primary Purple**: `#584CF4`
- **Success Green**: `#07BD74`
- **Greyscale 900**: `#212121`
- **Greyscale 500**: `#9E9E9E`
- **White**: `#FFFFFF`

### Typography
- **Body Large Bold**: 16px, weight 700, line height 1.4
- **Body Medium Semibold**: 14px, weight 600, line height 1.4
- **H5 Bold**: 20px, weight 700, line height 1.2

### Spacing
- Card padding: 24px
- Card border radius: 24px
- Button border radius: 100px
- Shadow: `0px 4px 60px rgba(4, 6, 15, 0.05)`

## Architecture

All map components follow the TAALMEET architecture:
1. **TypeScript** - Fully typed with interfaces
2. **React Native** - Native components for performance
3. **Theme Support** - Dark/Light mode via ThemeProvider
4. **Modular** - Each component is self-contained
5. **Documented** - JSDoc comments for all props

## Performance

- Memoized transformations to prevent re-renders
- Animated values for smooth interactions
- Lazy loading of map libraries
- Optimized marker rendering

## Accessibility

- Minimum touch target: 44x44
- WCAG AA color contrast
- Semantic icon usage
- Screen reader support

