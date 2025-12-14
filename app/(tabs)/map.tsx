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
  useSentConnectionRequests,
  useAcceptRequest,
} from '@/hooks/useConnections';
import { NotificationContainer } from '@/components/notifications/NotificationContainer';
import { useMatchFound } from '@/providers/MatchFoundProvider';
import type { ConnectionWithProfile } from '@/services/connectionsService';
import * as Location from 'expo-location';
import { MapErrorBoundary } from '@/components/map/MapErrorBoundary';
// Conditionally import Mapbox (only if native code is available)
let Mapbox: any = null;
let MapboxMap: any = null;
let NearbyUserMarkers: any = null;
let isMapboxAvailable = false;

try {
  // Import Mapbox service (sets access token)
  require('@/services/mapbox');
  Mapbox = require('@rnmapbox/maps').default;
  const mapComponents = require('@/components/map/MapboxMap');
  MapboxMap = mapComponents.MapboxMap;
  const markersComponents = require('@/components/map/NearbyUserMarkers');
  NearbyUserMarkers = markersComponents.NearbyUserMarkers;
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
import { getLanguageFlag } from '@/utils/languageFlags';
import type { NearbyUser } from '@/services/locationService';

const { width, height } = Dimensions.get('window');

interface Filters {
  maxDistance: number;
  availability: 'all' | 'now' | 'week';
  minMatchScore: number;
  languages?: string[]; // Optional language filter
}

export default function MapScreen() {
  const { colors } = useTheme();
  const { profile, user } = useAuth();
  const [selectedPartner, setSelectedPartner] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  // Initialize with default location (The Hague) so map shows immediately
  const [userLocation, setUserLocation] = useState<[number, number] | null>([4.3007, 52.0705]);
  const [mapType, setMapType] = useState<'standard' | 'satellite' | 'hybrid'>('standard');
  const [locationPermission, setLocationPermission] = useState<Location.PermissionStatus | null>(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const locationWatchSubscription = useRef<Location.LocationSubscription | null>(null);
  const [filters, setFilters] = useState<Filters>({
    maxDistance: 50,
    availability: 'all',
    minMatchScore: 0,
    languages: [], // Initialize as empty array
  });

  const bottomSheetHeight = useRef(new Animated.Value(140)).current;
  const updateLocationMutation = useUpdateUserLocation();

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
      // Only apply language filter if user has specified languages in UI filters
      // Otherwise show all users (language matching is optional, not required)
      // Backend expects:
      // - learning: languages user wants to learn → finds partners who TEACH these
      // - teaching: languages user teaches → finds partners who LEARN these
      languages: filters.languages && filters.languages.length > 0 
        ? {
            // Languages user selected that they're learning → find partners who teach these
            learning: filters.languages.filter(lang => currentUserLanguages.learning.includes(lang)),
            // Languages user selected that they're teaching → find partners who learn these
            teaching: filters.languages.filter(lang => currentUserLanguages.teaching.includes(lang)),
          }
        : undefined, // Don't filter by language if no languages selected in UI
    };
  }, [filters, currentUserLanguages]);

  // Fetch nearby users
  const { data: nearbyUsers = [], isLoading, error, refetch } = useNearbyUsers(backendFilters);
  
  // Nearby users loaded
  
  // Fetch connections to check connection status
  const { connections, requests: receivedRequests } = useConnections(user?.id);
  const { data: sentRequests = [] } = useSentConnectionRequests(user?.id);
  const sendConnectionRequestMutation = useSendConnectionRequest();
  const acceptRequestMutation = useAcceptRequest();
  const { showMatch } = useMatchFound();
  

  // Transform backend data to UI format
  const transformedPartners = useMemo(() => {
    // First, exclude current user from nearby users (backend should already exclude, but safety check)
    const otherUsers = nearbyUsers.filter((u: NearbyUser) => u.id !== user?.id);
    
    return otherUsers.map((user: NearbyUser) => {
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
  }, [nearbyUsers, currentUserLanguages, user?.id]);

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
  const selectedConnectionStatus = useMemo(() => {
    if (!selected || !user?.id) return null;
    
    // Check if already connected (accepted)
    const acceptedConnection = connections.find(
      (conn) => conn.partner.id === selected.id
    );
    
    if (acceptedConnection && acceptedConnection.status === 'accepted') {
      return { status: 'connected' as const, connection: acceptedConnection };
    }
    
    // Check received requests (request sent by selected partner to current user)
    const receivedRequest = receivedRequests.find(
      (req) => req.user_id === selected.id
    );
    
    if (receivedRequest && receivedRequest.status === 'pending') {
      return { status: 'request_received' as const, connection: receivedRequest };
    }
    
    // Check sent requests (request sent by current user to selected partner)
    const sentRequest = sentRequests.find(
      (req) => req.partner.id === selected.id
    );
    
    if (sentRequest && sentRequest.status === 'pending') {
      return { status: 'request_sent' as const, connection: sentRequest };
    }
    
    // Not connected
    return { status: 'not_connected' as const, connection: null };
  }, [selected, user?.id, connections, receivedRequests, sentRequests]);

  // Transform for markers component
  const markerUsers: NearbyUserMarker[] = useMemo(() => {
    // First, filter and validate partners
    const validPartners = filteredPartners
      .filter(partner => {
        // CRITICAL: Exclude current user from markers (should already be filtered, but safety check)
        if (partner.id === user?.id) {
          return false;
        }

        // Validate that partner has valid coordinates
        if (!partner.lat || !partner.lng) {
          console.warn('[MapScreen] Partner missing coordinates:', partner.id, partner.name);
          return false;
        }
        // Validate coordinates are valid numbers
        if (isNaN(partner.lat) || isNaN(partner.lng)) {
          console.warn('[MapScreen] Partner has invalid coordinates:', partner.id, partner.name, { lat: partner.lat, lng: partner.lng });
          return false;
        }
        // Validate coordinates are within valid ranges
        if (partner.lat < -90 || partner.lat > 90 || partner.lng < -180 || partner.lng > 180) {
          console.warn('[MapScreen] Partner coordinates out of range:', partner.id, partner.name, { lat: partner.lat, lng: partner.lng });
          return false;
        }
        return true;
      });

    // Remove duplicates by ID
    const seenIds = new Set<string>();
    const uniquePartners = validPartners.filter(partner => {
      if (seenIds.has(partner.id)) {
        return false;
      }
      seenIds.add(partner.id);
      return true;
    });

    // Transform to marker format
    const markers = uniquePartners.map(partner => {
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
    
    return markers;
  }, [filteredPartners, nearbyUsers, user?.id]);

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

      // Get fresh location
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
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

        // Get current location
        setIsGettingLocation(true);
        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });

        if (isMounted) {
          const { latitude, longitude } = location.coords;
          setUserLocation([longitude, latitude]);
          
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

        // Start watching location changes (update every 20 seconds)
        if (isMounted) {
          locationWatchSubscription.current = await Location.watchPositionAsync(
            {
              accuracy: Location.Accuracy.High,
              timeInterval: 20000, // Update every 20 seconds
              distanceInterval: 100, // Update every 100 meters
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
    filters.minMatchScore > 0 ||
    (filters.languages && filters.languages.length > 0);

  const toggleExpanded = () => {
    const toValue = isExpanded ? 140 : height * 0.55;
    Animated.spring(bottomSheetHeight, {
      toValue,
      useNativeDriver: false,
      friction: 10,
    }).start();
    setIsExpanded(!isExpanded);
  };


  // Handle marker press
  const handleMarkerPress = useCallback((user: NearbyUserMarker) => {
    setSelectedPartner(user.id);
  }, []);

  // Track retry attempts for network errors
  const [retryCount, setRetryCount] = useState(0);
  const [lastError, setLastError] = useState<Error | null>(null);

  // Show error alert with better messaging
  useEffect(() => {
    if (error) {
      setLastError(error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      // Don't show alert if it's a network error we're handling
      if (errorMessage.includes('network') || errorMessage.includes('Network')) {
        // Network errors are handled by inline error banner
        return;
      }
      
      Alert.alert(
        'Error Loading Map',
        'Failed to load nearby partners. Please check your connection and try again.',
        [
          { text: 'Retry', onPress: () => { setRetryCount(prev => prev + 1); refetch(); } },
          { text: 'OK', style: 'cancel' },
        ]
      );
    } else {
      setLastError(null);
      setRetryCount(0);
    }
  }, [error, refetch]);

  // Get location display name
  const locationDisplayName = profile?.city || profile?.country || 'Unknown Location';

  return (
    <MapErrorBoundary>
      <View style={[styles.container, { backgroundColor: colors.background.primary }]}>
        {/* Notifications Container */}
        <NotificationContainer />
        
        {/* Map Area */}
        <View style={styles.mapContainer}>
        {/* Mapbox Map, Google Maps fallback, or Loading UI */}
        {isMapboxAvailable && userLocation ? (
          <MapboxMap
            userLocation={{
              latitude: userLocation[1],
              longitude: userLocation[0],
            }}
            showUserLocation={true}
            onUserLocationUpdate={handleUserLocationUpdate}
            styleURL={Mapbox.StyleURL.Dark}
            zoomLevel={12}
          >
            {/* Nearby User Markers */}
            <NearbyUserMarkers
              users={markerUsers}
              onMarkerPress={handleMarkerPress}
              markerSize={56}
              showOnlineStatus={true}
            />
          </MapboxMap>
        ) : GoogleMap && userLocation ? (
          <GoogleMap
            userLocation={{
              latitude: userLocation[1],
              longitude: userLocation[0],
            }}
            users={markerUsers}
            onUserPress={handleMarkerPress}
            onUserLocationUpdate={handleUserLocationUpdate}
            zoomLevel={12}
            mapType={mapType}
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
          />
        ) : (
          <View style={[styles.mapContainer, styles.loadingContainer, { backgroundColor: colors.background.primary }]}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={[styles.loadingText, { color: colors.text.muted }]}>
              Loading map...
            </Text>
            {!locationPermission && (
              <View style={styles.locationPermissionPrompt}>
                <Ionicons name="location-outline" size={24} color={colors.text.muted} />
                <Text style={[styles.locationPermissionText, { color: colors.text.muted }]}>
                  Location permission required to find nearby partners
                </Text>
                <TouchableOpacity
                  onPress={handleCenterOnLocation}
                  style={[styles.locationPermissionButton, { backgroundColor: colors.primary }]}
                >
                  <Text style={styles.locationPermissionButtonText}>Enable Location</Text>
                </TouchableOpacity>
              </View>
            )}
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

        {/* Error Banner - Network Errors */}
        {error && (error instanceof Error && (error.message.includes('network') || error.message.includes('Network'))) && (
          <View style={[styles.errorBanner, { backgroundColor: colors.semantic.error, borderColor: colors.semantic.error }]}>
            <Ionicons name="warning" size={20} color="#FFFFFF" />
            <Text style={styles.errorBannerText}>
              Network error. Check your connection.
            </Text>
            <TouchableOpacity
              onPress={() => {
                setRetryCount(prev => prev + 1);
                refetch();
              }}
              style={styles.errorRetryButton}
            >
              <Text style={styles.errorRetryText}>Retry</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Loading Overlay */}
        {(isLoading || isGettingLocation) && (
          <View style={[styles.loadingOverlay, { backgroundColor: `${colors.background.primary}CC` }]}>
            <ActivityIndicator size="small" color={colors.primary} />
            <Text style={[styles.loadingText, { color: colors.text.muted }]}>
              {isGettingLocation ? 'Getting your location...' : 'Finding nearby partners...'}
            </Text>
          </View>
        )}

        {/* Empty State - No Nearby Users */}
        {!isLoading && !error && filteredPartners.length === 0 && nearbyUsers.length === 0 && (
          <View style={[styles.emptyState, { backgroundColor: `${colors.background.secondary}E6` }]}>
            <Ionicons name="people-outline" size={64} color={colors.text.muted} />
            <Text style={[styles.emptyStateTitle, { color: colors.text.primary }]}>
              No Partners Nearby
            </Text>
            <Text style={[styles.emptyStateMessage, { color: colors.text.muted }]}>
              {hasActiveFilters
                ? 'Try adjusting your filters or expanding your search distance.'
                : 'There are no language partners nearby. Check back later or expand your search radius.'}
            </Text>
            {hasActiveFilters && (
              <TouchableOpacity
                onPress={() => {
                  setFilters({ maxDistance: 50, availability: 'all', minMatchScore: 0, languages: [] });
                  setShowFilters(false);
                }}
                style={[styles.emptyStateButton, { backgroundColor: colors.primary }]}
              >
                <Text style={styles.emptyStateButtonText}>Clear Filters</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              onPress={() => refetch()}
              style={[styles.emptyStateButton, styles.emptyStateButtonSecondary, { borderColor: colors.border.default }]}
            >
              <Ionicons name="refresh" size={16} color={colors.text.primary} />
              <Text style={[styles.emptyStateButtonText, { color: colors.text.primary }]}>
                Refresh
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Empty State - Filtered Out All Users */}
        {!isLoading && !error && nearbyUsers.length > 0 && filteredPartners.length === 0 && (
          <View style={[styles.emptyState, styles.emptyStateSmall, { backgroundColor: `${colors.background.secondary}E6` }]}>
            <Ionicons name="funnel-outline" size={48} color={colors.text.muted} />
            <Text style={[styles.emptyStateTitle, styles.emptyStateTitleSmall, { color: colors.text.primary }]}>
              No Matches with Current Filters
            </Text>
            <Text style={[styles.emptyStateMessage, { color: colors.text.muted }]}>
              We found {nearbyUsers.length} partner{nearbyUsers.length !== 1 ? 's' : ''} nearby, but none match your filters.
            </Text>
            <TouchableOpacity
              onPress={() => {
                setFilters({ maxDistance: 50, availability: 'all', minMatchScore: 0, languages: [] });
                setShowFilters(false);
              }}
              style={[styles.emptyStateButton, { backgroundColor: colors.primary }]}
            >
              <Text style={styles.emptyStateButtonText}>Adjust Filters</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Top Bar */}
        <SafeAreaView style={styles.topBar} edges={['top']}>
          <View style={styles.topBarContent}>
            <View style={[styles.locationButton, { backgroundColor: `${colors.background.primary}CC` }]}>
              <Ionicons name="location" size={16} color={colors.primary} />
              <Text style={[styles.locationText, { color: colors.text.primary }]}>
                {locationDisplayName}
              </Text>
            </View>

            <View style={styles.topBarRight}>
              {/* Map Type Toggle */}
              <TouchableOpacity
                onPress={() => {
                  const types: Array<'standard' | 'satellite' | 'hybrid'> = ['standard', 'satellite', 'hybrid'];
                  const currentIndex = types.indexOf(mapType);
                  const nextIndex = (currentIndex + 1) % types.length;
                  setMapType(types[nextIndex]);
                }}
                style={[styles.mapControlButton, { backgroundColor: `${colors.background.primary}CC` }]}
              >
                <Ionicons 
                  name={mapType === 'satellite' ? 'globe' : mapType === 'hybrid' ? 'layers' : 'map'} 
                  size={18} 
                  color={colors.text.primary} 
                />
              </TouchableOpacity>

              {/* Filter Button */}
              <TouchableOpacity
                onPress={() => setShowFilters(true)}
                style={styles.filterButton}
              >
                <Ionicons name="options" size={20} color={colors.background.primary} />
                {hasActiveFilters && (
                  <View style={[styles.filterBadge, { backgroundColor: colors.primary }]}>
                    <Text style={styles.filterBadgeText}>
                      {(filters.maxDistance < 50 ? 1 : 0) +
                        (filters.availability !== 'all' ? 1 : 0) +
                        (filters.minMatchScore > 0 ? 1 : 0) +
                        (filters.languages && filters.languages.length > 0 ? 1 : 0)}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>
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

      {/* Bottom Sheet */}
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
                          // Alert is now shown in the hook's onSuccess callback
                        } catch (error) {
                          // Error handling is done in the hook's onError callback
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
          ) : (
            <View style={styles.headerInfo}>
              {filteredPartners.length > 0 ? (
                <>
                  <Text style={[styles.partnerCount, { color: colors.text.primary }]}>
                    {filteredPartners.length} partner{filteredPartners.length !== 1 ? 's' : ''} nearby
                  </Text>
                  {nearbyUsers.length > filteredPartners.length && (
                    <Text style={[styles.partnerHint, { color: colors.text.muted }]}>
                      {nearbyUsers.length - filteredPartners.length} hidden by filters
                    </Text>
                  )}
                  <Text style={[styles.partnerHint, { color: colors.text.muted }]}>
                    Tap markers to see details
                  </Text>
                </>
              ) : (
                <Text style={[styles.partnerHint, { color: colors.text.muted }]}>
                  No partners match your filters
                </Text>
              )}
            </View>
          )}

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

              {/* Language Filter */}
              <View style={styles.filterSection}>
                <View style={styles.filterLabelRow}>
                  <Text style={[styles.filterLabel, { color: colors.text.primary }]}>
                    Languages
                  </Text>
                  {filters.languages && filters.languages.length > 0 && (
                    <TouchableOpacity
                      onPress={() =>
                        setFilters((prev) => ({ ...prev, languages: [] }))
                      }
                    >
                      <Text style={[styles.clearText, { color: colors.primary }]}>
                        Clear
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
                <Text style={[styles.filterHint, { color: colors.text.muted }]}>
                  Filter by languages you want to learn or teach
                </Text>
                <View style={styles.languageChipsContainer}>
                  {currentUserLanguages.learning.length > 0 && (
                    <>
                      <Text style={[styles.languageSectionLabel, { color: colors.text.muted }]}>
                        I'm Learning:
                      </Text>
                      <View style={styles.languageChipsRow}>
                        {currentUserLanguages.learning.map((lang) => {
                          const isSelected = filters.languages?.includes(lang) || false;
                          return (
                            <TouchableOpacity
                              key={`learning-${lang}`}
                              style={[
                                styles.languageChip,
                                {
                                  backgroundColor: isSelected
                                    ? colors.primary
                                    : colors.background.tertiary,
                                  borderColor: isSelected ? colors.primary : colors.border.default,
                                },
                              ]}
                              onPress={() => {
                                setFilters((prev) => {
                                  const currentLangs = prev.languages || [];
                                  if (currentLangs.includes(lang)) {
                                    return {
                                      ...prev,
                                      languages: currentLangs.filter((l) => l !== lang),
                                    };
                                  } else {
                                    return {
                                      ...prev,
                                      languages: [...currentLangs, lang],
                                    };
                                  }
                                });
                              }}
                            >
                              <Text
                                style={[
                                  styles.languageChipText,
                                  {
                                    color: isSelected ? '#FFFFFF' : colors.text.primary,
                                  },
                                ]}
                              >
                                {getLanguageFlag(lang)} {lang}
                              </Text>
                            </TouchableOpacity>
                          );
                        })}
                      </View>
                    </>
                  )}
                  {currentUserLanguages.teaching.length > 0 && (
                    <>
                      <Text style={[styles.languageSectionLabel, { color: colors.text.muted }]}>
                        I'm Teaching:
                      </Text>
                      <View style={styles.languageChipsRow}>
                        {currentUserLanguages.teaching.map((lang) => {
                          const isSelected = filters.languages?.includes(lang) || false;
                          return (
                            <TouchableOpacity
                              key={`teaching-${lang}`}
                              style={[
                                styles.languageChip,
                                {
                                  backgroundColor: isSelected
                                    ? colors.primary
                                    : colors.background.tertiary,
                                  borderColor: isSelected ? colors.primary : colors.border.default,
                                },
                              ]}
                              onPress={() => {
                                setFilters((prev) => {
                                  const currentLangs = prev.languages || [];
                                  if (currentLangs.includes(lang)) {
                                    return {
                                      ...prev,
                                      languages: currentLangs.filter((l) => l !== lang),
                                    };
                                  } else {
                                    return {
                                      ...prev,
                                      languages: [...currentLangs, lang],
                                    };
                                  }
                                });
                              }}
                            >
                              <Text
                                style={[
                                  styles.languageChipText,
                                  {
                                    color: isSelected ? '#FFFFFF' : colors.text.primary,
                                  },
                                ]}
                              >
                                {getLanguageFlag(lang)} {lang}
                              </Text>
                            </TouchableOpacity>
                          );
                        })}
                      </View>
                    </>
                  )}
                  {(!currentUserLanguages.learning.length && !currentUserLanguages.teaching.length) && (
                    <Text style={[styles.filterHint, { color: colors.text.muted, fontStyle: 'italic' }]}>
                      Add languages to your profile to filter by them
                    </Text>
                  )}
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
                  setFilters({ maxDistance: 50, availability: 'all', minMatchScore: 0, languages: [] })
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

        {/* Match Found Popup is now handled globally via GlobalMatchFoundPopup */}
      </View>
    </MapErrorBoundary>
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
  loadingText: {
    marginTop: 8,
    fontSize: 14,
  },
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  topBarContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  locationText: {
    fontSize: 14,
    fontWeight: '500',
  },
  topBarRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  mapControlButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapControls: {
    position: 'absolute',
    right: 16,
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
  filterButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  handleContainer: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  handle: {
    width: 48,
    height: 4,
    borderRadius: 2,
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
    marginBottom: 16,
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
  errorBanner: {
    position: 'absolute',
    top: 80,
    left: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
    zIndex: 1000,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  errorBannerText: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  errorRetryButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#FFFFFF20',
  },
  errorRetryText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyState: {
    position: 'absolute',
    top: '30%',
    left: 16,
    right: 16,
    alignItems: 'center',
    padding: 24,
    borderRadius: 24,
    gap: 12,
    zIndex: 100,
  },
  emptyStateSmall: {
    top: '40%',
    padding: 20,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 8,
    textAlign: 'center',
  },
  emptyStateTitleSmall: {
    fontSize: 18,
  },
  emptyStateMessage: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 8,
  },
  emptyStateButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 8,
    minWidth: 120,
    alignItems: 'center',
  },
  emptyStateButtonSecondary: {
    flexDirection: 'row',
    gap: 8,
    backgroundColor: 'transparent',
    borderWidth: 1,
    marginTop: 8,
  },
  emptyStateButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  locationPermissionPrompt: {
    marginTop: 32,
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 32,
  },
  locationPermissionText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  locationPermissionButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 8,
  },
  locationPermissionButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  languageChipsContainer: {
    marginTop: 12,
    gap: 12,
  },
  languageSectionLabel: {
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 8,
  },
  languageChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 4,
  },
  languageChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  languageChipText: {
    fontSize: 13,
    fontWeight: '500',
  },
  clearText: {
    fontSize: 14,
    fontWeight: '500',
  },
  filterHint: {
    fontSize: 12,
    marginTop: 4,
    marginBottom: 8,
  },
});
