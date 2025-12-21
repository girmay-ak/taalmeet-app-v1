/**
 * Map Screen
 * Find nearby language partners
 */

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Animated,
  Dimensions,
  Modal,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/lib/theme/ThemeProvider';
import Slider from '@react-native-community/slider';
import { router } from 'expo-router';
import { useAuth } from '@/providers';
import { useNearbyUsers, useUpdateUserLocation } from '@/hooks/useLocation';
import {
  useConnections,
  useSendConnectionRequest,
  useConnectionRequests,
  useAcceptRequest,
} from '@/hooks/useConnections';
import { NotificationContainer } from '@/components/notifications/NotificationContainer';
import { useMatchFound } from '@/providers/MatchFoundProvider';
import type { ConnectionWithProfile } from '@/services/connectionsService';
import * as Location from 'expo-location';
// Conditionally import Mapbox (only if native code is available)
let Mapbox: any = null;
let MapboxMap: any = null;
let MapPinMarkers: any = null;
let isMapboxAvailable = false;

try {
  // Import Mapbox service (sets access token)
  require('@/services/mapbox');
  Mapbox = require('@rnmapbox/maps').default;
  const mapComponents = require('@/components/map/MapboxMap');
  MapboxMap = mapComponents.MapboxMap;
  const markersComponents = require('@/components/map/MapPinMarkers');
  MapPinMarkers = markersComponents.MapPinMarkers;
  isMapboxAvailable = true;
} catch (error) {
  // Mapbox native code not available - will use Google Maps fallback
  console.warn('Mapbox not available, using Google Maps fallback:', error);
  isMapboxAvailable = false;
}

// Import Google Maps as fallback
let GoogleMap: any = null;
try {
  const googleMapComponents = require('@/components/map/GoogleMap');
  GoogleMap = googleMapComponents.GoogleMap;
} catch (error) {
  console.warn('Google Maps not available:', error);
}

import type { NearbyUser as NearbyUserMarker } from '@/components/map/NearbyUserMarkers';
import { LocationHeaderCard } from '@/components/map/LocationHeaderCard';
import { EventCardList } from '@/components/map/EventCardList';
import type { EventCardData } from '@/components/map/EventCard';
import { CenterUserAvatar } from '@/components/map/CenterUserAvatar';
import { RadarPulse } from '@/components/map/RadarPulse';
import { PersonCard } from '@/components/map/PersonCard';
import { getLanguageFlag } from '@/utils/languageFlags';
import type { NearbyUser } from '@/services/locationService';

const { width, height } = Dimensions.get('window');

interface Filters {
  maxDistance: number;
  availability: 'all' | 'now' | 'week';
  minMatchScore: number;
}

export default function MapScreen() {
  const { colors } = useTheme();
  const { profile, user } = useAuth();
  
  // ============================================================================
  // STATE SEPARATION (VERY IMPORTANT - DO NOT MIX)
  // ============================================================================
  // 1. Logged-in user state (fixed overlay, never moves)
  const [userLocation, setUserLocation] = useState<[number, number] | null>([4.3007, 52.0705]);
  const [isGettingLocation, setIsGettingLocation] = useState(false); // For "My Location" button
  const [isFindingLocation, setIsFindingLocation] = useState(true); // Pulse animation - stops when users loaded
  const [peopleLoaded, setPeopleLoaded] = useState(false); // True when nearby users are fetched
  
  // 2. Selected person state (independent from center user)
  const [selectedPartner, setSelectedPartner] = useState<string | null>(null);
  
  // 3. UI state
  const [showFilters, setShowFilters] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [mapType, setMapType] = useState<'standard' | 'satellite' | 'hybrid'>('standard');
  const [locationPermission, setLocationPermission] = useState<Location.PermissionStatus | null>(null);
  const locationWatchSubscription = useRef<Location.LocationSubscription | null>(null);
  const [filters, setFilters] = useState<Filters>({
    maxDistance: 50,
    availability: 'all',
    minMatchScore: 0,
  });

  const bottomSheetHeight = useRef(new Animated.Value(0)).current; // Start hidden
  const eventSlideAnim = useRef(new Animated.Value(height)).current;
  const [showEvents, setShowEvents] = useState(false);
  const cardSlideAnim = useRef(new Animated.Value(40)).current; // Start slightly below
  const cardOpacity = useRef(new Animated.Value(0)).current;
  const updateLocationMutation = useUpdateUserLocation();

  // Mock event data (replace with real data from your backend)
  const mockEvents: EventCardData[] = [
    {
      id: '1',
      title: 'National Music Festival',
      imageUrl: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=400',
      date: 'Mon, Dec 24',
      time: '18.00 - 23.00 PM',
      location: 'Grand Park, New York',
      isFavorite: false,
    },
    {
      id: '2',
      title: 'Language Exchange Meetup',
      imageUrl: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=400',
      date: 'Tue, Dec 25',
      time: '14.00 - 16.00 PM',
      location: 'Central Library, NYC',
      isFavorite: true,
    },
    {
      id: '3',
      title: 'International Food Fair',
      imageUrl: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400',
      date: 'Wed, Dec 26',
      time: '12.00 - 20.00 PM',
      location: 'Times Square, New York',
      isFavorite: false,
    },
  ];

  // Get current user's languages for filtering
  const currentUserLanguages = useMemo(() => {
    if (!profile?.languages) return { learning: [], teaching: [] };
    return {
      learning: profile.languages.learning.map(l => l.language),
      teaching: profile.languages.teaching.map(l => l.language),
    };
  }, [profile]);

  // Map UI filters to backend filters
  const backendFilters = useMemo(() => {
    const availabilityMap: Record<string, 'all' | 'now' | 'soon' | 'offline'> = {
      all: 'all',
      now: 'now',
      week: 'all', // 'week' is not directly supported, use 'all' for now
    };

    return {
      maxDistanceKm: filters.maxDistance,
      availability: availabilityMap[filters.availability] || 'all',
      languages: currentUserLanguages,
    };
  }, [filters, currentUserLanguages]);

  // Fetch nearby users
  const { data: nearbyUsers = [], isLoading, error, refetch } = useNearbyUsers(backendFilters);

  // ============================================================================
  // LOADING FLOW (CORRECT)
  // ============================================================================
  // 1. Screen mounts → isFindingLocation = true
  // 2. Get user location
  // 3. Fetch nearby people
  // 4. Set peopleLoaded = true
  // 5. Set isFindingLocation = false
  // 6. Stop pulse animation
  // 7. Render nearby people markers
  useEffect(() => {
    if (!isLoading && nearbyUsers.length > 0) {
      // People successfully loaded
      setPeopleLoaded(true);
      setIsFindingLocation(false);
    } else if (isLoading) {
      // Refetching (e.g., filter change)
      setPeopleLoaded(false);
      setIsFindingLocation(true);
    }
  }, [isLoading, nearbyUsers.length]);
  
  // Fetch connections to check connection status
  const { connections, requests: receivedRequests } = useConnections(user?.id);
  const sendConnectionRequestMutation = useSendConnectionRequest();
  const acceptRequestMutation = useAcceptRequest();
  const { showMatch } = useMatchFound();
  

  // Transform backend data to UI format
  const transformedPartners = useMemo(() => {
    return nearbyUsers.map((user: NearbyUser) => {
      const teachingLang = user.languages.find(l => l.role === 'teaching');
      const learningLang = user.languages.find(l => l.role === 'learning');
      
      // Calculate match score (simplified - can be enhanced)
      let matchScore = 50;
      if (currentUserLanguages.teaching.length > 0 && currentUserLanguages.learning.length > 0) {
        const teachingMatch = currentUserLanguages.teaching.some(lang => 
          user.languages.some(l => l.role === 'learning' && l.language.toLowerCase() === lang.toLowerCase())
        );
        const learningMatch = currentUserLanguages.learning.some(lang => 
          user.languages.some(l => l.role === 'teaching' && l.language.toLowerCase() === lang.toLowerCase())
        );
        if (teachingMatch && learningMatch) matchScore = 90;
        else if (teachingMatch || learningMatch) matchScore = 70;
      }

      return {
        id: user.id,
        name: user.displayName,
        age: 0, // Age not available in backend
        avatar: (user.avatarUrl && user.avatarUrl.trim() !== '') 
          ? user.avatarUrl 
          : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
        distance: Math.round(user.distanceKm * 10) / 10,
        matchScore: Math.round(matchScore),
        teaching: {
          language: teachingLang?.language || 'Unknown',
          flag: getLanguageFlag(teachingLang?.language || ''),
          level: teachingLang?.level || 'Native',
        },
        learning: {
          language: learningLang?.language || 'Unknown',
          flag: getLanguageFlag(learningLang?.language || ''),
          level: learningLang?.level || 'Beginner',
        },
        isOnline: user.availability?.status === 'available' || user.availability?.status === 'soon',
        availableNow: user.availability?.status === 'available',
        // Backend data
        lat: user.lat,
        lng: user.lng,
        languages: user.languages,
        distanceKm: user.distanceKm,
      };
    });
  }, [nearbyUsers, currentUserLanguages]);

  // Filter partners by UI filters
  const filteredPartners = useMemo(() => {
    return transformedPartners.filter((partner) => {
      if (partner.distance > filters.maxDistance) return false;
      if (filters.availability === 'now' && !partner.availableNow) return false;
      if (filters.minMatchScore > 0 && partner.matchScore < filters.minMatchScore) return false;
      return true;
    });
  }, [transformedPartners, filters]);

  const selected = selectedPartner
    ? filteredPartners.find((p) => p.id === selectedPartner)
    : null;

  // Check connection status for selected partner
  // Note: getConnectionRequests only returns received requests (where user is partner_id)
  // So we need to check connections differently for sent requests
  const selectedConnectionStatus = useMemo(() => {
    if (!selected || !user?.id) return null;
    
    // Check all connections (accepted + pending) where user is either user_id or partner_id
    // We'll need to query all connections to find sent requests
    // For now, check received requests first
    const receivedRequest = receivedRequests.find(
      (req) => req.user_id === selected.id // Request sent by selected partner to current user
    );
    
    if (receivedRequest && receivedRequest.status === 'pending') {
      return { status: 'request_received' as const, connection: receivedRequest };
    }
    
    // Check if already connected (accepted)
    const acceptedConnection = connections.find(
      (conn) => conn.partner.id === selected.id
    );
    
    if (acceptedConnection && acceptedConnection.status === 'accepted') {
      return { status: 'connected' as const, connection: acceptedConnection };
    }
    
    // For sent requests, we'd need to query connections where user_id = current user
    // For now, assume not connected if not in received requests or accepted connections
    // TODO: Add query for sent pending requests
    return { status: 'not_connected' as const, connection: null };
  }, [selected, user?.id, connections, receivedRequests]);

  // Transform for markers component
  const markerUsers: NearbyUserMarker[] = useMemo(() => {
    return filteredPartners.map(partner => {
      // Find the original user data to get avatarUrl
      const originalUser = nearbyUsers.find(u => u.id === partner.id);
      return {
        id: partner.id,
        displayName: partner.name,
        avatarUrl: (originalUser?.avatarUrl && originalUser.avatarUrl.trim() !== '') 
          ? originalUser.avatarUrl 
          : (partner.avatar && partner.avatar.trim() !== '') 
            ? partner.avatar 
            : null,
        lat: partner.lat,
        lng: partner.lng,
        languages: partner.languages,
        distanceKm: partner.distanceKm,
        isOnline: partner.isOnline || false,
        matchScore: partner.matchScore,
      };
    });
  }, [filteredPartners, nearbyUsers]);

  // Handle user location update
  const handleUserLocationUpdate = useCallback(async (location: { latitude: number; longitude: number }) => {
    setUserLocation([location.longitude, location.latitude]);
    
    // Update location in backend (debounced)
    try {
      await updateLocationMutation.mutateAsync({
        lat: location.latitude,
        lng: location.longitude,
      });
    } catch (error) {
      // Silently fail - location update is not critical
      console.warn('Failed to update location:', error);
    }
  }, [updateLocationMutation]);

  // Handle center on my location
  const handleCenterOnLocation = useCallback(async () => {
    try {
      setIsGettingLocation(true);
      
      // Check permission first
      const { status } = await Location.getForegroundPermissionsAsync();
      if (status !== 'granted') {
        const { status: newStatus } = await Location.requestForegroundPermissionsAsync();
        if (newStatus !== 'granted') {
          Alert.alert(
            'Permission Required',
            'Location permission is required to center on your location.',
            [{ text: 'OK' }]
          );
          setIsGettingLocation(false);
          return;
        }
      }

      // Get fresh location (balanced for speed)
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
        timeInterval: 5000,
      });

      const { latitude, longitude } = location.coords;
      setUserLocation([longitude, latitude]);
      
      // Update in backend
      await updateLocationMutation.mutateAsync({
        lat: latitude,
        lng: longitude,
      });
    } catch (error) {
      console.error('Error centering on location:', error);
      Alert.alert(
        'Error',
        'Failed to get your current location. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsGettingLocation(false);
    }
  }, [updateLocationMutation]);

  // Request location permissions and get current location on mount
  useEffect(() => {
    let isMounted = true;

    const requestLocationPermission = async () => {
      try {
        // Check if location services are enabled
        const servicesEnabled = await Location.hasServicesEnabledAsync();
        if (!servicesEnabled) {
          Alert.alert(
            'Location Services Disabled',
            'Please enable location services in your device settings to find nearby partners.',
            [{ text: 'OK' }]
          );
          return;
        }

        // Request permission
        const { status } = await Location.requestForegroundPermissionsAsync();
        setLocationPermission(status);

        if (status !== 'granted') {
          Alert.alert(
            'Permission Denied',
            'Location permission is required to find nearby language partners. You can enable it in your device settings.',
            [{ text: 'OK' }]
          );
          return;
        }

        // OPTIMIZED: Get last known location first (instant)
        setIsGettingLocation(true);
        const lastLocation = await Location.getLastKnownPositionAsync({});
        if (lastLocation && isMounted) {
          const { latitude, longitude } = lastLocation.coords;
          setUserLocation([longitude, latitude]);
          setIsGettingLocation(false); // Stop loading immediately
        }

        // Then get current accurate location in background
        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced, // Faster than High
          timeInterval: 5000, // 5 second timeout
        });

        if (isMounted) {
          const { latitude, longitude } = location.coords;
          setUserLocation([longitude, latitude]);
          setIsGettingLocation(false);
          
          // Update location in backend
          try {
            await updateLocationMutation.mutateAsync({
              lat: latitude,
              lng: longitude,
            });
          } catch (error) {
            console.warn('Failed to update location:', error);
          }
        }

        // Start watching location changes (optimized for battery)
        if (isMounted) {
          locationWatchSubscription.current = await Location.watchPositionAsync(
            {
              accuracy: Location.Accuracy.Balanced, // Better battery life
              timeInterval: 30000, // Update every 30 seconds
              distanceInterval: 150, // Update every 150 meters
            },
            (location) => {
              if (isMounted) {
                const { latitude, longitude } = location.coords;
                setUserLocation([longitude, latitude]);
                
                // Update location in backend (debounced in mutation)
                updateLocationMutation.mutate({
                  lat: latitude,
                  lng: longitude,
                });
              }
            }
          );
        }
      } catch (error) {
        console.error('Error getting location:', error);
        Alert.alert(
          'Location Error',
          'Failed to get your location. Please check your device settings.',
          [{ text: 'OK' }]
        );
      } finally {
        if (isMounted) {
          setIsGettingLocation(false);
        }
      }
    };

    requestLocationPermission();

    // Cleanup
    return () => {
      isMounted = false;
      if (locationWatchSubscription.current) {
        locationWatchSubscription.current.remove();
        locationWatchSubscription.current = null;
      }
    };
  }, []);

  // Update location from profile when available (fallback)
  useEffect(() => {
    if (profile?.lat && profile?.lng && !userLocation) {
      setUserLocation([profile.lng, profile.lat]);
    }
  }, [profile?.lat, profile?.lng, userLocation]);

  const hasActiveFilters =
    filters.maxDistance < 50 ||
    filters.availability !== 'all' ||
    filters.minMatchScore > 0;

  const toggleExpanded = () => {
    const toValue = isExpanded ? 140 : height * 0.55;
    Animated.spring(bottomSheetHeight, {
      toValue,
      useNativeDriver: false,
      friction: 10,
    }).start();
    setIsExpanded(!isExpanded);
  };


  // ============================================================================
  // MARKER SELECTION LOGIC (CORRECT BEHAVIOR)
  // ============================================================================
  // When a person marker is tapped:
  // ✅ DO: Highlight selected marker (AnimatedMarkerWrapper handles this)
  // ✅ DO: Show bottom person card
  // ✅ DO: Dim other markers
  // ❌ DON'T: Move map center
  // ❌ DON'T: Move logged-in user avatar
  // ❌ DON'T: Restart pulse animation
  const handleMarkerPress = useCallback((user: NearbyUserMarker) => {
    setSelectedPartner(user.id);
    
    // Animate card slide up with spring
    Animated.parallel([
      Animated.spring(cardSlideAnim, {
        toValue: 0, // Slide to position
        useNativeDriver: true,
        tension: 100,
        friction: 10,
      }),
      Animated.timing(cardOpacity, {
        toValue: 1,
        duration: 300, // 250-300ms as per requirement
        useNativeDriver: true,
      }),
    ]).start();
  }, [cardSlideAnim, cardOpacity]);

  // Dismiss card with slide down animation
  const dismissCard = useCallback(() => {
    Animated.parallel([
      Animated.timing(cardSlideAnim, {
        toValue: 40, // Slide down
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(cardOpacity, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setSelectedPartner(null);
    });
  }, [cardSlideAnim, cardOpacity]);

  // Show error alert
  useEffect(() => {
    if (error) {
      Alert.alert(
        'Error Loading Map',
        'Failed to load nearby partners. Please try again.',
        [
          { text: 'Retry', onPress: () => refetch() },
          { text: 'OK', style: 'cancel' },
        ]
      );
    }
  }, [error, refetch]);

  // Get location display name
  const locationDisplayName = profile?.city || profile?.country || 'Unknown Location';

  return (
    <View style={[styles.container, { backgroundColor: colors.background.primary }]}>
      {/* Notifications Container */}
      <NotificationContainer />
      
      {/* ============================================================================
          MAP AREA - CORRECT ARCHITECTURE
          ============================================================================
          LAYER 1: Map (background) - moves when user pans
          LAYER 2: Person markers - positioned relative to map, move with map
          LAYER 3: Fixed center overlay (logged-in user) - NEVER moves
          LAYER 4: Pulse animation (when finding) - attached to center overlay
          LAYER 5: UI controls (top bar, buttons)
          LAYER 6: Bottom person card (when marker selected)
          ============================================================================ */}
      <View style={styles.mapContainer}>
        {/* Mapbox Map, Google Maps fallback, or Loading UI */}
        {isMapboxAvailable && userLocation ? (
          <MapboxMap
            userLocation={{
              latitude: userLocation[1],
              longitude: userLocation[0],
            }}
            showUserLocation={false} // Don't show default marker
            onUserLocationUpdate={handleUserLocationUpdate}
            styleURL={colors.mode === 'dark' ? Mapbox.StyleURL.Dark : Mapbox.StyleURL.Light}
            zoomLevel={13}
          >
            {/* ============================================================
                MARKER RULES (OTHER PEOPLE ONLY)
                ============================================================
                - Only OTHER USERS appear as map markers
                - Logged-in user is NEVER a marker (fixed overlay above)
                - Marker press:
                  * Sets selectedPartner
                  * Does NOT affect: user center, pulse, or map center
                ============================================================ */}
            <MapPinMarkers
              users={markerUsers}
              onMarkerPress={handleMarkerPress}
              markerSize={56}
              showOnlineStatus={true}
              selectedUserId={selectedPartner}
            />
          </MapboxMap>
        ) : GoogleMap && userLocation ? (
          <GoogleMap
            userLocation={{
              latitude: userLocation[1],
              longitude: userLocation[0],
            }}
            users={markerUsers} // Only OTHER users, not logged-in user
            onUserPress={handleMarkerPress}
            onUserLocationUpdate={handleUserLocationUpdate}
            zoomLevel={12}
            mapType={mapType}
            showUserMarker={false} // Logged-in user is fixed overlay above, not a map marker
            selectedUserId={selectedPartner}
          />
        ) : GoogleMap ? (
          // Show Google Maps with default location even if userLocation not ready
          <GoogleMap
            userLocation={{
              latitude: 52.0705, // The Hague default
              longitude: 4.3007,
            }}
            users={markerUsers}
            onUserPress={handleMarkerPress}
            onUserLocationUpdate={handleUserLocationUpdate}
            zoomLevel={12}
            mapType={mapType}
            selectedUserId={selectedPartner}
          />
        ) : (
          <View style={[styles.mapContainer, styles.loadingContainer, { backgroundColor: colors.background.primary }]}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={[styles.loadingText, { color: colors.text.muted }]}>
              Loading map...
            </Text>
          </View>
        )}

        {/* Fallback: Show partner markers as list overlay when no map is available */}
        {!isMapboxAvailable && !GoogleMap && filteredPartners.length > 0 && (
          <View style={[styles.fallbackMarkersContainer, { backgroundColor: `${colors.background.secondary}E6` }]}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.fallbackMarkersList}>
              {filteredPartners.map((partner) => (
                <TouchableOpacity
                  key={partner.id}
                  style={[styles.fallbackMarker, { backgroundColor: colors.background.primary }]}
                  onPress={() => setSelectedPartner(partner.id)}
                >
                  <Image source={{ uri: partner.avatar }} style={styles.fallbackMarkerAvatar} />
                  {partner.isOnline && <View style={[styles.fallbackOnlineDot, { backgroundColor: colors.primary }]} />}
                  <Text style={[styles.fallbackMarkerName, { color: colors.text.primary }]} numberOfLines={1}>
                    {partner.name}
                  </Text>
                  <Text style={[styles.fallbackMarkerDistance, { color: colors.text.muted }]}>
                    {partner.distance}km
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* ============================================================
            LOGGED-IN USER (ME) — NOT A MAP MARKER
            ============================================================
            - Rendered as FIXED OVERLAY component
            - Uses position: absolute and centered on screen
            - NEVER moves, regardless of map pan/zoom/selection
            - NEVER participates in map clustering
            - NEVER changes on person selection
            - This is the user's "anchor point" on the map
            ============================================================ */}
        <CenterUserAvatar
          avatarUrl={profile?.avatarUrl || null}
          displayName={profile?.displayName || 'User'}
          isSearching={isFindingLocation}
        />

        {/* ============================================================
            RADAR / PULSE ANIMATION — OVERLAY ONLY
            ============================================================
            - Visually centered on logged-in user avatar
            - Implemented as OVERLAY animation, NOT a map marker
            - NEVER attached to GoogleMap/MapboxMap markers
            - Shows only when: isFindingLocation === true
            - Stops immediately when: peopleLoaded === true
            - Does NOT restart during person selection
            ============================================================ */}
        {isFindingLocation && userLocation && (
          <View style={styles.radarCenter}>
            <RadarPulse size={140} color="#07BD74" rings={3} showBeam={true} />
          </View>
        )}

        {/* Top Bar - Location Header Card */}
        <SafeAreaView style={styles.topBar} edges={['top']}>
          <LocationHeaderCard
            location={locationDisplayName}
            radiusKm={filters.maxDistance}
            onChangePress={() => setShowFilters(true)}
          />
          
          {/* Map Type Toggle & Events Button - Top Right */}
          <View style={styles.topRightControls}>
            <TouchableOpacity
              onPress={() => setShowEvents(true)}
              style={[styles.mapControlButton, { backgroundColor: `${colors.background.primary}E6`, marginRight: 8 }]}
            >
              <Ionicons 
                name="calendar" 
                size={18} 
                color={colors.primary} 
              />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                const types: Array<'standard' | 'satellite' | 'hybrid'> = ['standard', 'satellite', 'hybrid'];
                const currentIndex = types.indexOf(mapType);
                const nextIndex = (currentIndex + 1) % types.length;
                setMapType(types[nextIndex]);
              }}
              style={[styles.mapControlButton, { backgroundColor: `${colors.background.primary}E6` }]}
            >
              <Ionicons 
                name={mapType === 'satellite' ? 'globe' : mapType === 'hybrid' ? 'layers' : 'map'} 
                size={18} 
                color={colors.text.primary} 
              />
            </TouchableOpacity>
          </View>
        </SafeAreaView>

        {/* Map Controls */}
        <View style={styles.mapControls}>
          {/* My Location Button */}
          <TouchableOpacity
            onPress={handleCenterOnLocation}
            style={[styles.mapControlButton, styles.myLocationButton, { backgroundColor: `${colors.background.primary}CC` }]}
          >
            <Ionicons name="locate" size={20} color={colors.primary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* ============================================================
          BOTTOM PERSON CARD
          ============================================================
          - Appears only when selectedPartner !== null
          - Slides up from bottom (translateY + opacity)
          - Dismiss resets selectedPartner to null
          - Does NOT affect radar, pulse, or center user
          ============================================================ */}
      {selected && (
        <Animated.View
          style={[
            styles.personCardContainer,
            {
              transform: [{ translateY: cardSlideAnim }],
              opacity: cardOpacity,
            },
          ]}
        >
          <TouchableOpacity
            activeOpacity={1}
            onPress={(e) => {
              e.stopPropagation();
            }}
          >
            <PersonCard
              id={selected.id}
              name={selected.name}
              age={selected.age}
              avatarUrl={selected.avatar}
              distance={selected.distance}
              matchScore={selected.matchScore}
              connectionStatus={
                selectedConnectionStatus?.status === 'connected'
                  ? 'connected'
                  : selectedConnectionStatus?.status === 'request_received' ||
                    selectedConnectionStatus?.status === 'request_sent'
                  ? 'pending'
                  : 'none'
              }
              onViewProfile={() => {
                router.push(`/partner/${selected.id}`);
              }}
              onMessage={() => {
                if (selectedConnectionStatus?.status === 'connected') {
                  router.push(`/chat/${selected.id}`);
                }
              }}
            />
          </TouchableOpacity>
          {/* Dismiss by tapping outside */}
          <TouchableOpacity
            style={styles.dismissOverlay}
            activeOpacity={1}
            onPress={dismissCard}
          />
        </Animated.View>
      )}

      {/* Bottom Sheet (for expanded list - kept for compatibility) */}
      <Animated.View
        style={[
          styles.bottomSheet,
          {
            backgroundColor: colors.background.secondary,
            height: bottomSheetHeight,
          },
        ]}
      >
        {/* Handle */}
        <TouchableOpacity onPress={toggleExpanded} style={styles.handleContainer}>
          <View style={[styles.handle, { backgroundColor: colors.border.default }]} />
        </TouchableOpacity>

        {/* Content */}
        <ScrollView
          style={styles.sheetContent}
          showsVerticalScrollIndicator={false}
        >
          {selected ? (
            // Selected Partner Card
            <View
              style={[
                styles.selectedCard,
                {
                  backgroundColor: colors.background.primary,
                  borderColor: colors.border.default,
                },
              ]}
            >
              <Image source={{ uri: selected.avatar }} style={styles.selectedAvatar} />
              <View style={styles.selectedInfo}>
                <Text style={[styles.selectedName, { color: colors.text.primary }]}>
                  {selected.name}, {selected.age}
                </Text>
                <Text style={[styles.selectedMeta, { color: colors.text.muted }]}>
                  {selected.distance}km away • {selected.matchScore}% match
                </Text>
                <View style={styles.selectedActions}>
                  <TouchableOpacity
                    style={[styles.viewProfileBtn, { backgroundColor: colors.primary }]}
                    onPress={() => {
                      router.push(`/partner/${selected.id}`);
                    }}
                  >
                    <Text style={styles.viewProfileText}>View Profile</Text>
                  </TouchableOpacity>
                  {selectedConnectionStatus?.status === 'connected' ? (
                    // Connected - show Message button
                    <TouchableOpacity
                      style={[styles.chatBtn, { borderColor: colors.border.default }]}
                      onPress={() => {
                        router.push(`/chat/${selected.id}`);
                      }}
                    >
                      <Ionicons name="chatbubble" size={18} color={colors.text.primary} />
                      <Text style={[styles.chatBtnText, { color: colors.text.primary }]}>
                        Message
                      </Text>
                    </TouchableOpacity>
                  ) : selectedConnectionStatus?.status === 'request_sent' ? (
                    // Request sent - show pending state
                    <TouchableOpacity
                      style={[styles.chatBtn, { borderColor: colors.border.default, opacity: 0.6 }]}
                      disabled
                    >
                      <Ionicons name="time" size={18} color={colors.text.muted} />
                      <Text style={[styles.chatBtnText, { color: colors.text.muted }]}>
                        Pending
                      </Text>
                    </TouchableOpacity>
                  ) : selectedConnectionStatus?.status === 'request_received' ? (
                    // Request received - show Accept button
                    <TouchableOpacity
                      style={[styles.connectBtn, { backgroundColor: colors.primary }]}
                      onPress={async () => {
                        if (selectedConnectionStatus.connection) {
                          try {
                            // Accept the connection request
                            await acceptRequestMutation.mutateAsync(
                              selectedConnectionStatus.connection.id
                            );
                            // Show match popup - use the connection we already have which includes profile
                            // Update status to accepted for display
                            const connectionToShow = {
                              ...selectedConnectionStatus.connection,
                              status: 'accepted' as const,
                            };
                            showMatch(connectionToShow);
                          } catch (error) {
                            console.error('Failed to accept connection:', error);
                          }
                        }
                      }}
                    >
                      <Ionicons name="checkmark-circle" size={18} color="#FFFFFF" />
                      <Text style={styles.connectBtnText}>Accept</Text>
                    </TouchableOpacity>
                  ) : (
                    // Not connected - show Connect button
                    <TouchableOpacity
                      style={[styles.connectBtn, { backgroundColor: colors.primary }]}
                      onPress={async () => {
                        if (!user?.id) return;
                        try {
                          await sendConnectionRequestMutation.mutateAsync(selected.id);
                          Alert.alert(
                            'Connection Request Sent!',
                            'You will be notified when they accept your request.',
                            [{ text: 'OK' }]
                          );
                        } catch (error) {
                          console.error('Failed to send connection request:', error);
                        }
                      }}
                    >
                      <Ionicons name="heart" size={18} color="#FFFFFF" />
                      <Text style={styles.connectBtnText}>Connect</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </View>
          ) : null}

          {/* Partner List (when expanded) */}
          {isExpanded && (
            <View style={styles.partnerList}>
              {filteredPartners.map((partner) => (
                <TouchableOpacity
                  key={partner.id}
                  style={[
                    styles.partnerItem,
                    {
                      backgroundColor: colors.background.primary,
                      borderColor: colors.border.default,
                    },
                  ]}
                  onPress={() => {
                    setSelectedPartner(partner.id);
                    toggleExpanded();
                  }}
                >
                  <View style={styles.partnerItemLeft}>
                    <Image
                      source={{ uri: partner.avatar }}
                      style={styles.partnerItemAvatar}
                    />
                    {partner.isOnline && (
                      <View style={styles.partnerItemOnline} />
                    )}
                  </View>
                  <View style={styles.partnerItemInfo}>
                    <Text style={[styles.partnerItemName, { color: colors.text.primary }]}>
                      {partner.name}, {partner.age}
                    </Text>
                    <Text style={[styles.partnerItemMeta, { color: colors.text.muted }]}>
                      {partner.distance}km • {partner.matchScore}% match
                    </Text>
                  </View>
                  <Text style={styles.partnerItemFlag}>{partner.teaching.flag}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </ScrollView>
      </Animated.View>

      {/* Filters Modal */}
      <Modal visible={showFilters} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.filterModal,
              { backgroundColor: colors.background.secondary },
            ]}
          >
            {/* Header */}
            <View style={[styles.filterHeader, { borderBottomColor: colors.border.default }]}>
              <Text style={[styles.filterTitle, { color: colors.text.primary }]}>
                Filters
              </Text>
              <TouchableOpacity
                onPress={() => setShowFilters(false)}
                style={[styles.closeButton, { backgroundColor: colors.background.tertiary }]}
              >
                <Ionicons name="close" size={20} color={colors.text.primary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.filterContent}>
              {/* Distance Filter */}
              <View style={styles.filterSection}>
                <View style={styles.filterLabelRow}>
                  <Text style={[styles.filterLabel, { color: colors.text.primary }]}>
                    Max Distance
                  </Text>
                  <Text style={[styles.filterValue, { color: colors.primary }]}>
                    {filters.maxDistance}km
                  </Text>
                </View>
                <Slider
                  style={styles.slider}
                  minimumValue={1}
                  maximumValue={50}
                  value={filters.maxDistance}
                  onValueChange={(value) =>
                    setFilters((prev) => ({ ...prev, maxDistance: Math.round(value) }))
                  }
                  minimumTrackTintColor={colors.primary}
                  maximumTrackTintColor={colors.border.default}
                  thumbTintColor={colors.primary}
                />
              </View>

              {/* Availability Filter */}
              <View style={styles.filterSection}>
                <Text style={[styles.filterLabel, { color: colors.text.primary }]}>
                  Availability
                </Text>
                <View style={styles.optionsRow}>
                  {[
                    { value: 'all', label: 'All', icon: '🌍' },
                    { value: 'now', label: 'Now', icon: '⚡' },
                    { value: 'week', label: 'This Week', icon: '📅' },
                  ].map((option) => (
                    <TouchableOpacity
                      key={option.value}
                      style={[
                        styles.optionButton,
                        {
                          backgroundColor:
                            filters.availability === option.value
                              ? colors.primary
                              : colors.background.tertiary,
                        },
                      ]}
                      onPress={() =>
                        setFilters((prev) => ({
                          ...prev,
                          availability: option.value as Filters['availability'],
                        }))
                      }
                    >
                      <Text style={styles.optionIcon}>{option.icon}</Text>
                      <Text
                        style={[
                          styles.optionLabel,
                          {
                            color:
                              filters.availability === option.value
                                ? '#FFFFFF'
                                : colors.text.muted,
                          },
                        ]}
                      >
                        {option.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Match Score Filter */}
              <View style={styles.filterSection}>
                <View style={styles.filterLabelRow}>
                  <Text style={[styles.filterLabel, { color: colors.text.primary }]}>
                    Minimum Match
                  </Text>
                  <Text style={[styles.filterValue, { color: colors.primary }]}>
                    {filters.minMatchScore}%
                  </Text>
                </View>
                <Slider
                  style={styles.slider}
                  minimumValue={0}
                  maximumValue={100}
                  step={10}
                  value={filters.minMatchScore}
                  onValueChange={(value) =>
                    setFilters((prev) => ({ ...prev, minMatchScore: value }))
                  }
                  minimumTrackTintColor={colors.primary}
                  maximumTrackTintColor={colors.border.default}
                  thumbTintColor={colors.primary}
                />
              </View>
            </ScrollView>

            {/* Footer */}
            <View style={[styles.filterFooter, { borderTopColor: colors.border.default }]}>
              <TouchableOpacity
                style={[styles.resetButton, { backgroundColor: colors.background.tertiary }]}
                onPress={() =>
                  setFilters({ maxDistance: 50, availability: 'all', minMatchScore: 0 })
                }
              >
                <Text style={[styles.resetText, { color: colors.text.primary }]}>
                  Reset All
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.applyButton, { backgroundColor: colors.primary }]}
                onPress={() => setShowFilters(false)}
              >
                <Text style={styles.applyText}>
                  Show {filteredPartners.length} Results
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Events Modal */}
      <Modal
        visible={showEvents}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setShowEvents(false)}
      >
        <SafeAreaView style={[styles.modalContainer, { backgroundColor: colors.background.primary }]}>
          {/* Header */}
          <View style={[styles.modalHeader, { borderBottomColor: colors.border.default }]}>
            <TouchableOpacity onPress={() => setShowEvents(false)}>
              <Ionicons name="close" size={28} color={colors.text.primary} />
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: colors.text.primary }]}>
              Nearby Events
            </Text>
            <View style={{ width: 28 }} />
          </View>

          {/* Event Cards List */}
          <EventCardList
            events={mockEvents}
            onEventPress={(event) => {
              console.log('Event pressed:', event);
              // Navigate to event details or handle event press
            }}
            onFavoriteToggle={(eventId) => {
              console.log('Toggle favorite:', eventId);
              // Handle favorite toggle
            }}
            showHeader={false}
          />
        </SafeAreaView>
      </Modal>

      {/* Match Found Popup is now handled globally via GlobalMatchFoundPopup */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  mapContainer: {
    flex: 1,
    position: 'relative',
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  loadingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    minWidth: 200,
  },
  loadingTitle: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: '600',
  },
  loadingText: {
    marginTop: 8,
    fontSize: 14,
    textAlign: 'center',
  },
  radarCenter: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 99, // Below center avatar (100)
    pointerEvents: 'none',
  },
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    paddingTop: 12,
  },
  topRightControls: {
    position: 'absolute',
    top: 60,
    right: 24,
    flexDirection: 'row',
    gap: 8,
  },
  mapControlButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  mapControls: {
    position: 'absolute',
    right: 24,
    bottom: 200,
    gap: 12,
    zIndex: 10,
  },
  myLocationButton: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 10,
    paddingBottom: 24, // Add space at bottom
  },
  handleContainer: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  handle: {
    width: 48,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#E0E0E0',
  },
  sheetContent: {
    flex: 1,
    paddingHorizontal: 16,
  },
  headerInfo: {
    marginBottom: 16,
  },
  partnerCount: {
    fontSize: 18,
    fontWeight: '600',
  },
  partnerHint: {
    fontSize: 14,
    marginTop: 4,
  },
  selectedCard: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 24, // Increased bottom spacing
    gap: 12,
  },
  selectedAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  selectedInfo: {
    flex: 1,
  },
  selectedName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  selectedMeta: {
    fontSize: 12,
    marginBottom: 12,
  },
  selectedActions: {
    flexDirection: 'row',
    gap: 8,
  },
  viewProfileBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  viewProfileText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  chatBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    gap: 6,
  },
  chatBtnText: {
    fontSize: 14,
    fontWeight: '500',
  },
  connectBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  connectBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  partnerList: {
    gap: 8,
    paddingBottom: 100,
  },
  partnerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
  },
  partnerItemLeft: {
    position: 'relative',
  },
  partnerItemAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  partnerItemOnline: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#10B981',
    borderWidth: 2,
    borderColor: '#0F0F0F',
  },
  partnerItemInfo: {
    flex: 1,
  },
  partnerItemName: {
    fontSize: 15,
    fontWeight: '500',
  },
  partnerItemMeta: {
    fontSize: 12,
    marginTop: 2,
  },
  partnerItemFlag: {
    fontSize: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  filterModal: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
  },
  filterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  filterTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterContent: {
    padding: 16,
  },
  filterSection: {
    marginBottom: 24,
  },
  filterLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  filterValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  slider: {
    width: '100%',
    height: 40,
  },
  optionsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  optionButton: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  optionIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  optionLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  filterFooter: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    borderTopWidth: 1,
  },
  resetButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  resetText: {
    fontSize: 16,
    fontWeight: '500',
  },
  applyButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  applyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  fallbackMarkersContainer: {
    position: 'absolute',
    top: 100,
    left: 0,
    right: 0,
    paddingVertical: 12,
    paddingHorizontal: 16,
    zIndex: 100,
  },
  fallbackMarkersList: {
    gap: 12,
  },
  fallbackMarker: {
    width: 80,
    alignItems: 'center',
    padding: 8,
    borderRadius: 12,
    marginRight: 12,
  },
  fallbackMarkerAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginBottom: 4,
  },
  fallbackOnlineDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  fallbackMarkerName: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 4,
    textAlign: 'center',
  },
  fallbackMarkerDistance: {
    fontSize: 10,
    marginTop: 2,
  },
  personCardContainer: {
    position: 'absolute',
    bottom: 24,
    left: 16,
    right: 16,
    zIndex: 50,
    // Card shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 12,
  },
  dismissOverlay: {
    position: 'absolute',
    top: -height, // Cover entire screen above card
    left: -16,
    right: -16,
    height: height,
    zIndex: -1,
  },
});
