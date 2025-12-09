import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  MapPin, 
  SlidersHorizontal, 
  Plus, 
  Minus, 
  Locate, 
  X, 
  Check,
  Layers,
  Navigation,
  Users,
  Calendar,
  Search,
  TrendingUp,
  Coffee,
  Video,
  Star,
  Zap,
  Filter,
  ChevronDown,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../providers/AuthProvider';
import { useNearbyUsers, useUpdateUserLocation, useUserLocation } from '../hooks/useLocation';
import { GoogleMap, LoadScript, Marker as GoogleMarker } from '@react-google-maps/api';
import { GOOGLE_MAPS_API_KEY, MAPBOX_ACCESS_TOKEN } from '@/lib/config';
import { Map, Marker, NavigationControl, GeolocateControl, FullscreenControl } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';

interface EnhancedMapScreenProps {
  onPartnerClick: (partnerId: string) => void;
  onBack: () => void;
}

interface Filters {
  languages: string[];
  maxDistance: number;
  availability: 'all' | 'now' | 'week';
  minMatchScore: number;
  meetingType: 'all' | 'in-person' | 'virtual';
}

type MapStyle = 'standard' | 'heat' | 'cluster';
type ViewMode = 'markers' | 'list';

export function EnhancedMapScreen({ onPartnerClick, onBack }: EnhancedMapScreenProps) {
  const { user } = useAuth();
  const [selectedPartner, setSelectedPartner] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [showLayerMenu, setShowLayerMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [mapStyle, setMapStyle] = useState<MapStyle>('standard');
  const [viewMode, setViewMode] = useState<ViewMode>('markers');
  const [zoomLevel, setZoomLevel] = useState(50);
  const [filters, setFilters] = useState<Filters>({
    languages: [],
    maxDistance: 50,
    availability: 'all',
    minMatchScore: 0,
    meetingType: 'all'
  });
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [mapCenter, setMapCenter] = useState({ lat: 52.0705, lng: 4.3007 }); // Den Haag default
  const [mapZoom, setMapZoom] = useState(13);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>({ lat: 52.0705, lng: 4.3007 }); // Default to Den Haag

  // Get current user location from database
  const { data: dbUserLocation } = useUserLocation(user?.id);
  
  // Mutation for updating user location
  const updateLocationMutation = useUpdateUserLocation();

  // Fetch nearby users from database (same as mobile app)
  const { data: nearbyUsersData, isLoading, refetch } = useNearbyUsers({
    maxDistance: filters.maxDistance,
    languages: filters.languages.length > 0 ? filters.languages : undefined,
    availability: filters.availability === 'now' ? 'available' : filters.availability === 'week' ? 'this_week' : undefined,
  });

  // Get all partners from nearby users
  const allPartners = nearbyUsersData || [];
  
  // Available languages from partners
  const availableLanguages = Array.from(new Set(
    allPartners.flatMap((p: any) => 
      p.languages?.map((l: any) => l.language).filter(Boolean) || []
    )
  ));

  // Apply filters to partners
  const filteredPartners = allPartners.filter((partner: any) => {
    const distance = partner.distance_km || partner.distance || 999;
    if (distance > filters.maxDistance) return false;
    
    const partnerLanguages = partner.languages?.map((l: any) => l.language) || [];
    if (filters.languages.length > 0 && !filters.languages.some(lang => partnerLanguages.includes(lang))) return false;
    
    if (filters.availability === 'now' && !(partner.is_online || partner.availability_status === 'available')) return false;
    
    const matchScore = partner.matchScore || partner.match_score || 0;
    if (filters.minMatchScore > 0 && matchScore < filters.minMatchScore) return false;
    
    if (searchQuery && !(partner.display_name || partner.name || '').toLowerCase().includes(searchQuery.toLowerCase())) return false;
    
    return true;
  });

  // Filter partners within 5km radius (same as "Partners Near You" section)
  const [radius, setRadius] = useState(5); // Default 5km radius
  
  const nearbyPartners = filteredPartners.filter((p: any) => {
    const distance = p.distance_km || p.distance || 999;
    // Use radius filter instead of zoom-based filter
    return distance <= radius;
  });
  
  const selected = selectedPartner ? filteredPartners.find((p: any) => p.id === selectedPartner) : null;
  
  // Get current partner index for swipe navigation
  const currentPartnerIndex = selectedPartner ? nearbyPartners.findIndex(p => p.id === selectedPartner) : -1;
  const canSwipeLeft = currentPartnerIndex > 0;
  const canSwipeRight = currentPartnerIndex < nearbyPartners.length - 1;

  const hasActiveFilters = filters.languages.length > 0 || 
                          filters.maxDistance < 50 || 
                          filters.availability !== 'all' || 
                          filters.minMatchScore > 0 || 
                          filters.meetingType !== 'all';

  const resetFilters = () => {
    setFilters({
      languages: [],
      maxDistance: 50,
      availability: 'all',
      minMatchScore: 0,
      meetingType: 'all'
    });
    setSearchQuery('');
  };

  const toggleLanguage = (lang: string) => {
    setFilters(prev => ({
      ...prev,
      languages: prev.languages.includes(lang)
        ? prev.languages.filter(l => l !== lang)
        : [...prev.languages, lang]
    }));
  };

  // Stats - matching "Partners Near You" logic
  const onlineNearby = nearbyPartners.filter((p: any) => 
    (p.is_online || p.availability_status === 'available')
  );
  
  const stats = {
    total: nearbyPartners.length,
    online: onlineNearby.length,
    availableNow: onlineNearby.length,
    highMatch: nearbyPartners.filter((p: any) => (p.matchScore || p.match_score || 0) >= 80).length
  };

  // Cluster partners by proximity for cluster view
  const clusters = mapStyle === 'cluster' ? generateClusters(nearbyPartners) : [];

  // Get user's current location and update in database
  useEffect(() => {
    // First, try to get location from database
    if (dbUserLocation) {
      const location = {
        lat: dbUserLocation.latitude,
        lng: dbUserLocation.longitude,
      };
      setUserLocation(location);
      setMapCenter(location);
    }

    // Then get current GPS location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setUserLocation(location);
          setMapCenter(location);
          
          // Update location in database (same as mobile app)
          updateLocationMutation.mutate({
            lat: location.lat,
            lng: location.lng,
          });
        },
        (error) => {
          console.warn('Error getting user location:', error);
        }
      );

      // Update location every 20 seconds (same as mobile app)
      const locationInterval = setInterval(() => {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const location = {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            };
            setUserLocation(location);
            
            // Update in database
            updateLocationMutation.mutate({
              lat: location.lat,
              lng: location.lng,
            });
          },
          (error) => {
            console.warn('Error updating location:', error);
          }
        );
      }, 20000); // Every 20 seconds

      return () => clearInterval(locationInterval);
    }
  }, [dbUserLocation]);

  // Convert partners to map format - EXACT same as DiscoverScreenDesktop
  const mapPartners = nearbyPartners.map((partner: any, index: number) => {
    // Get coordinates - match DiscoverScreenDesktop format
    // Use partner.lat/lng (from database) with fallback to generate nearby points
    const baseLat = userLocation?.lat || mapCenter.lat;
    const baseLng = userLocation?.lng || mapCenter.lng;
    
    const lat = partner.lat || (baseLat + (Math.random() - 0.5) * 0.05);
    const lng = partner.lng || (baseLng + (Math.random() - 0.5) * 0.05);
    
    // Validate coordinates before using
    const validLat = (typeof lat === 'number' && !isNaN(lat)) ? lat : baseLat;
    const validLng = (typeof lng === 'number' && !isNaN(lng)) ? lng : baseLng;
    
    const teachingLang = partner.languages?.find((l: any) => l.role === 'teaching');
    const learningLang = partner.languages?.find((l: any) => l.role === 'learning');
    
    return {
      id: partner.id,
      name: partner.display_name || partner.name || 'User',
      avatar: partner.avatar_url || partner.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(partner.display_name || partner.name || 'User')}&background=1DB954&color=fff`,
      latitude: validLat,
      longitude: validLng,
      isOnline: partner.is_online || partner.availability_status === 'available',
      distance: partner.distance_km || partner.distance || 0,
      matchScore: partner.matchScore || partner.match_score || 0,
      languages: [
        teachingLang?.language,
        learningLang?.language
      ].filter(Boolean),
    };
  }).filter(p => !isNaN(p.latitude) && !isNaN(p.longitude)); // Filter out invalid coordinates

  // Use real partners from database (same as mobile app)
  const displayPartners = mapPartners;

  // Debug: Log map data from database
  useEffect(() => {
    console.log('🗺️ Map Debug (Real Data):', {
      totalPartners: mapPartners.length,
      nearbyInRadius: nearbyPartners.length,
      filteredCount: filteredPartners.length,
      allPartnersFromDB: allPartners.length,
      radius: `${radius}km`,
      mapCenter,
      userLocation,
      dbUserLocation,
      filters: {
        languages: filters.languages,
        maxDistance: filters.maxDistance,
        availability: filters.availability
      },
      samplePartner: allPartners[0] ? {
        id: allPartners[0].id,
        name: allPartners[0].display_name,
        lat: allPartners[0].lat,
        lng: allPartners[0].lng,
        hasValidCoords: !isNaN(allPartners[0].lat) && !isNaN(allPartners[0].lng)
      } : null
    });
  }, [mapPartners.length, radius, allPartners.length]);

  // Log when nearby users data changes
  useEffect(() => {
    if (nearbyUsersData) {
      console.log('📍 Nearby Users from Database:', {
        count: nearbyUsersData.length,
        users: nearbyUsersData.slice(0, 3).map((u: any) => ({
          name: u.display_name || u.name,
          lat: u.lat,
          lng: u.lng,
          distance: u.distance_km || u.distance
        }))
      });
    }
  }, [nearbyUsersData]);

  // Handle map load
  const onMapLoad = useCallback((mapInstance: google.maps.Map) => {
    setMap(mapInstance);
    setIsMapLoaded(true);
  }, []);

  // Handle zoom change
  const handleZoomChange = useCallback(() => {
    if (map) {
      const newZoom = map.getZoom() || 13;
      setMapZoom(newZoom);
      setZoomLevel(Math.min(100, (newZoom / 20) * 100));
    }
  }, [map]);

  // Handle center change
  const handleCenterChange = useCallback(() => {
    if (map) {
      const center = map.getCenter();
      if (center) {
        setMapCenter({ lat: center.lat(), lng: center.lng() });
      }
    }
  }, [map]);

  // Center on user location
  const handleCenterOnUser = useCallback(() => {
    if (userLocation && map) {
      map.setCenter(userLocation);
      map.setZoom(15);
    } else if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setUserLocation(location);
          if (map) {
            map.setCenter(location);
            map.setZoom(15);
          }
        },
        (error) => {
          console.warn('Error getting user location:', error);
        }
      );
    }
  }, [userLocation, map]);

  // Loading state
  if (isLoading) {
    return (
      <div className="flex flex-col h-full bg-[#0F0F0F] relative overflow-hidden items-center justify-center">
        <div className="text-white">Loading map data...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[#0F0F0F] relative overflow-hidden">
      {/* Animated Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0F0F0F] via-[#1A1A1A] to-[#0F0F0F]">
        <motion.div
          className="absolute inset-0 opacity-20"
          animate={{
            background: [
              'radial-gradient(circle at 20% 50%, rgba(29, 185, 84, 0.15) 0%, transparent 50%)',
              'radial-gradient(circle at 80% 50%, rgba(95, 179, 179, 0.15) 0%, transparent 50%)',
              'radial-gradient(circle at 50% 80%, rgba(30, 215, 96, 0.15) 0%, transparent 50%)',
              'radial-gradient(circle at 20% 50%, rgba(29, 185, 84, 0.15) 0%, transparent 50%)',
            ]
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "linear"
          }}
        />
      </div>

      {/* Compact Modern Header - Glass Style */}
      <div className="absolute top-0 left-0 right-0 z-10 pointer-events-none">
        <div className="px-3 pt-2.5 pb-2 pointer-events-auto">
          {/* Single compact row with all controls */}
          <div className="flex items-center gap-2 mb-2">
            {/* Back button - smaller */}
            <button 
              onClick={onBack}
              className="p-1.5 bg-black/50 backdrop-blur-xl rounded-lg border border-white/10 shadow-xl active:scale-95 transition-all"
            >
              <X className="w-4 h-4 text-white" />
            </button>
            
            {/* Location - compact */}
            <motion.button 
              className="flex items-center gap-1.5 px-2.5 py-1.5 bg-black/50 backdrop-blur-xl rounded-lg border border-white/10 shadow-xl"
              whileTap={{ scale: 0.95 }}
            >
              <MapPin className="w-3.5 h-3.5 text-[#1DB954]" />
              <span className="text-xs font-medium text-white">Den Haag</span>
            </motion.button>
            
            {/* Radius selector - pill buttons */}
            <div className="flex items-center gap-0.5 bg-black/50 backdrop-blur-xl rounded-lg border border-white/10 p-0.5 shadow-xl">
              {[5, 10, 25, 50].map((km) => (
                <button
                  key={km}
                  onClick={() => setRadius(km)}
                  className={`px-2 py-1 rounded-md text-[10px] font-semibold transition-all ${
                    radius === km
                      ? 'bg-[#1DB954] text-white shadow-md'
                      : 'text-white/50 hover:text-white/80'
                  }`}
                >
                  {km}km
                </button>
              ))}
            </div>

            {/* Layer toggle - smaller */}
            <button 
              onClick={() => setShowLayerMenu(!showLayerMenu)}
              className="ml-auto p-1.5 bg-black/50 backdrop-blur-xl rounded-lg border border-white/10 shadow-xl active:scale-95 transition-all relative"
            >
              <Layers className="w-4 h-4 text-white" />
              {mapStyle !== 'standard' && (
                <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-[#1DB954] rounded-full border border-black/50" />
              )}
            </button>
          </div>

          {/* Compact stats bar - single glass container */}
          <motion.div 
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 px-3 py-2 bg-black/50 backdrop-blur-xl rounded-lg border border-white/10 shadow-xl"
          >
            {/* Total */}
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 bg-white/40 rounded-full" />
              <span className="text-[10px] text-white/60">Total</span>
              <span className="text-xs font-bold text-white">{stats.total}</span>
            </div>
            
            <div className="w-px h-3 bg-white/10" />
            
            {/* Online */}
            <div className="flex items-center gap-1.5">
              <motion.div 
                className="w-1.5 h-1.5 bg-[#1DB954] rounded-full"
                animate={{ opacity: [1, 0.5, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <span className="text-[10px] text-[#1DB954]">Online</span>
              <span className="text-xs font-bold text-white">{stats.online}</span>
            </div>
            
            <div className="w-px h-3 bg-white/10" />
            
            {/* High Match */}
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full" />
              <span className="text-[10px] text-yellow-400">High</span>
              <span className="text-xs font-bold text-white">{stats.highMatch}</span>
            </div>
            
            {/* Count summary */}
            <div className="ml-auto text-[10px] text-white/60">
              {mapPartners.length} within {radius}km
            </div>
          </motion.div>
        </div>
      </div>

      {/* Map Area */}
      <div className="flex-1 relative">
        {/* Mapbox Map */}
        {MAPBOX_ACCESS_TOKEN ? (
          <Map
            mapboxAccessToken={MAPBOX_ACCESS_TOKEN}
            initialViewState={{
              longitude: mapCenter.lng,
              latitude: mapCenter.lat,
              zoom: mapZoom
            }}
            style={{ width: '100%', height: '100%' }}
            mapStyle="mapbox://styles/mapbox/dark-v11"
            onMove={(evt) => {
              setMapCenter({ lat: evt.viewState.latitude, lng: evt.viewState.longitude });
              setMapZoom(evt.viewState.zoom);
            }}
          >
            {/* Controls */}
            <NavigationControl position="top-right" style={{ display: 'none' }} />
            <GeolocateControl
              position="bottom-right"
              trackUserLocation={false}
              showUserHeading={false}
              onGeolocate={(e) => {
                setUserLocation({
                  lat: e.coords.latitude,
                  lng: e.coords.longitude
                });
              }}
              style={{ display: 'none' }}
            />
            <FullscreenControl position="top-right" style={{ display: 'none' }} />

            {/* User location marker with compact radar */}
            {userLocation && !isNaN(userLocation.lat) && !isNaN(userLocation.lng) && (
              <Marker
                longitude={userLocation.lng}
                latitude={userLocation.lat}
                anchor="center"
              >
                <div className="relative w-32 h-32 flex items-center justify-center">
                  {/* Subtle scanning rings - smaller */}
                  {[0, 0.5, 1].map((delay, idx) => (
                    <motion.div
                      key={`ring-${idx}`}
                      className="absolute w-20 h-20 border border-[#1DB954]/60 rounded-full"
                      animate={{
                        scale: [1, 2.5],
                        opacity: [0.5, 0],
                        borderWidth: ['1px', '0px']
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeOut",
                        delay: delay
                      }}
                    />
                  ))}
                  
                  {/* Subtle rotating radar beam */}
                  <motion.div
                    className="absolute w-32 h-32"
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "linear"
                    }}
                  >
                    <div 
                      className="absolute top-1/2 left-1/2 w-32 h-32 -translate-x-1/2 -translate-y-1/2"
                      style={{
                        background: 'conic-gradient(from 0deg, transparent 0deg, rgba(29, 185, 84, 0.25) 20deg, rgba(30, 215, 96, 0.15) 40deg, transparent 60deg)',
                      }}
                    />
                  </motion.div>

                  {/* Modern center marker - glass effect */}
                  <motion.div
                    className="absolute w-5 h-5 bg-white/20 backdrop-blur-sm rounded-full border-2 border-[#1DB954] shadow-lg z-10"
                    animate={{
                      boxShadow: [
                        '0 0 10px rgba(29, 185, 84, 0.4)',
                        '0 0 20px rgba(29, 185, 84, 0.6)',
                        '0 0 10px rgba(29, 185, 84, 0.4)'
                      ]
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    <div className="absolute inset-0.5 bg-gradient-to-br from-[#1DB954] to-[#1ED760] rounded-full" />
                  </motion.div>
                </div>
              </Marker>
            )}

            {/* Partner markers */}
            {mapStyle !== 'cluster' && displayPartners.map((partner) => (
              <Marker
                key={partner.id}
                longitude={partner.longitude}
                latitude={partner.latitude}
                anchor="bottom"
                onClick={(e) => {
                  e.originalEvent.stopPropagation();
                  setSelectedPartner(partner.id);
                }}
              >
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  whileHover={{ scale: 1.15, z: 10 }}
                  whileTap={{ scale: 0.95 }}
                  className="cursor-pointer"
                >
                  <div className="relative flex flex-col items-center">
                    {/* Subtle pulse for online partners */}
                    {partner.isOnline && (
                      <motion.div
                        className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-12 bg-[#1DB954]/30 rounded-full blur-sm"
                        animate={{
                          scale: [1, 1.4, 1],
                          opacity: [0.4, 0, 0.4]
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                      />
                    )}
                    
                    {/* Modern glass pin - smaller and transparent */}
                    <div className={`relative w-12 h-12 rounded-full ${
                      selectedPartner === partner.id 
                        ? 'border-2 border-[#1DB954] ring-2 ring-[#1DB954]/30 shadow-xl shadow-[#1DB954]/30' 
                        : 'border-2 border-white/60 shadow-lg'
                    } overflow-hidden bg-white/10 backdrop-blur-md`}>
                      {/* Glass overlay */}
                      <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />
                      
                      <img
                        src={partner.avatar}
                        alt={partner.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    
                    {/* Small language badge - transparent */}
                    <motion.div
                      whileHover={{ rotate: [0, -10, 10, 0] }}
                      transition={{ duration: 0.3 }}
                      className="absolute -top-0.5 -right-0.5 text-sm bg-white/90 backdrop-blur-sm rounded-full w-5 h-5 flex items-center justify-center shadow-md border border-white/40"
                    >
                      {partner.languages[0] ? getLanguageFlag(partner.languages[0]) : '🌍'}
                    </motion.div>

                    {/* Online indicator - smaller */}
                    {partner.isOnline && (
                      <motion.div
                        animate={{
                          boxShadow: [
                            '0 0 0 0 rgba(29, 185, 84, 0.6)',
                            '0 0 0 4px rgba(29, 185, 84, 0)',
                            '0 0 0 0 rgba(29, 185, 84, 0)'
                          ]
                        }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-[#1DB954] border-2 border-white/80 rounded-full z-10"
                      />
                    )}

                    {/* Match score badge - compact */}
                    {partner.matchScore >= 90 && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-1 -left-1 w-5 h-5 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full shadow-md flex items-center justify-center border border-white/40"
                      >
                        <Star className="w-2.5 h-2.5 text-white fill-white" />
                      </motion.div>
                    )}

                    {/* Distance label - transparent and compact */}
                    <motion.div 
                      initial={{ opacity: 0, y: 3 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-1 px-2 py-0.5 bg-black/60 backdrop-blur-md rounded-full shadow-lg border border-white/20"
                    >
                      <span className="text-[10px] font-semibold text-white">{partner.distance.toFixed(1)}km</span>
                    </motion.div>
                  </div>
                </motion.div>
              </Marker>
            ))}
          </Map>
        ) : GOOGLE_MAPS_API_KEY ? (
          <LoadScript googleMapsApiKey={GOOGLE_MAPS_API_KEY}>
            <GoogleMap
              mapContainerStyle={{ width: '100%', height: '100%' }}
              center={mapCenter}
              zoom={mapZoom}
              onLoad={onMapLoad}
              onZoomChanged={handleZoomChange}
              onCenterChanged={handleCenterChange}
              options={{
                styles: [
                  {
                    featureType: 'all',
                    elementType: 'geometry',
                    stylers: [{ color: '#1a1a1a' }],
                  },
                  {
                    featureType: 'all',
                    elementType: 'labels.text.fill',
                    stylers: [{ color: '#9ca3af' }],
                  },
                  {
                    featureType: 'water',
                    elementType: 'geometry',
                    stylers: [{ color: '#0f0f0f' }],
                  },
                  {
                    featureType: 'road',
                    elementType: 'geometry',
                    stylers: [{ color: '#2a2a2a' }],
                  },
                ],
                disableDefaultUI: false,
                zoomControl: false,
                mapTypeControl: false,
                streetViewControl: false,
                fullscreenControl: false,
              }}
            >
              {/* User location marker */}
              {userLocation && typeof window !== 'undefined' && window.google && (
                <GoogleMarker
                  position={userLocation}
                  icon={{
                    path: window.google.maps.SymbolPath.CIRCLE,
                    scale: 8,
                    fillColor: '#1DB954',
                    fillOpacity: 1,
                    strokeColor: '#fff',
                    strokeWeight: 2,
                  }}
                />
              )}

              {/* Partner markers */}
              {mapStyle !== 'cluster' && typeof window !== 'undefined' && window.google && mapPartners.map((partner) => (
                <GoogleMarker
                  key={partner.id}
                  position={{ lat: partner.latitude, lng: partner.longitude }}
                  icon={{
                    url: partner.avatar,
                    scaledSize: new window.google.maps.Size(48, 48),
                    anchor: new window.google.maps.Point(24, 48),
                  }}
                  onClick={() => setSelectedPartner(partner.id)}
                />
              ))}
            </GoogleMap>
          </LoadScript>
        ) : (
          /* Fallback to mock map if no API key */
          <div className="absolute inset-0">
            {/* Grid pattern */}
            <div 
              className="absolute inset-0 opacity-10"
              style={{
                backgroundImage: `
                  linear-gradient(rgba(95, 179, 179, 0.3) 1px, transparent 1px),
                  linear-gradient(90deg, rgba(95, 179, 179, 0.3) 1px, transparent 1px)
                `,
                backgroundSize: `${50 * (zoomLevel / 50)}px ${50 * (zoomLevel / 50)}px`
              }}
            />

            {/* Heat map overlay */}
            {mapStyle === 'heat' && (
            <div className="absolute inset-0">
              {nearbyPartners.map((partner: any, idx: number) => {
                const matchScore = partner.matchScore || partner.match_score || 0;
                return (
                  <motion.div
                    key={partner.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.4 }}
                    className="absolute rounded-full blur-3xl"
                    style={{
                      left: `${20 + idx * 15}%`,
                      top: `${30 + (idx % 3) * 20}%`,
                      width: '150px',
                      height: '150px',
                      background: matchScore > 80 
                        ? 'radial-gradient(circle, rgba(29, 185, 84, 0.6) 0%, transparent 70%)'
                        : 'radial-gradient(circle, rgba(95, 179, 179, 0.4) 0%, transparent 70%)'
                    }}
                  />
                );
              })}
            </div>
          )}

          {/* Partner Markers or Clusters */}
          {viewMode === 'markers' && (
            <>
              {mapStyle === 'cluster' ? (
                // Cluster view
                clusters.map((cluster, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.05 }}
                    className="absolute cursor-pointer"
                    style={{
                      left: cluster.position.x,
                      top: cluster.position.y
                    }}
                    onClick={() => {
                      if (cluster.count === 1 && cluster.partners[0]) {
                        setSelectedPartner(cluster.partners[0].id);
                      }
                    }}
                  >
                    {cluster.count > 1 ? (
                      <div className="relative">
                        <motion.div
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="w-16 h-16 rounded-full bg-gradient-to-br from-[#1DB954] to-[#1ED760] flex items-center justify-center shadow-2xl border-4 border-white/20"
                        >
                          <span className="font-bold text-white text-xl">{cluster.count}</span>
                        </motion.div>
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-br from-[#1DB954] to-[#1ED760] rounded-full"
                          animate={{
                            scale: [1, 1.3, 1],
                            opacity: [0.5, 0, 0.5]
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeInOut"
                          }}
                        />
                      </div>
                    ) : (
                      renderMarker(cluster.partners[0], false)
                    )}
                  </motion.div>
                ))
              ) : (
                // Standard marker view
                nearbyPartners.map((partner: any, index: number) => (
                  <motion.div
                    key={partner.id}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className="absolute cursor-pointer"
                    style={{
                      left: `${20 + index * 15}%`,
                      top: `${30 + (index % 3) * 20}%`
                    }}
                    onClick={() => setSelectedPartner(partner.id)}
                  >
                    {renderMarker(partner, selectedPartner === partner.id)}
                  </motion.div>
                ))
              )}
            </>
          )}

            {/* Current location with advanced radar (only for fallback) */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
              <div className="relative">
                {/* Multiple scanning rings */}
                {[0, 0.4, 0.8, 1.2].map((delay, idx) => (
                  <motion.div
                    key={idx}
                    className="absolute w-40 h-40 border-2 border-[#1DB954] rounded-full -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2"
                    animate={{
                      scale: [1, 3],
                      opacity: [0.6, 0],
                      borderWidth: ['2px', '0px']
                    }}
                    transition={{
                      duration: 2.5,
                      repeat: Infinity,
                      ease: "easeOut",
                      delay: delay
                    }}
                  />
                ))}
                
                {/* Rotating radar beam with gradient */}
                <motion.div
                  className="absolute w-48 h-48 -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2"
                  animate={{ rotate: 360 }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "linear"
                  }}
                >
                  <div 
                    className="absolute top-1/2 left-1/2 w-48 h-48 -translate-x-1/2 -translate-y-1/2"
                    style={{
                      background: 'conic-gradient(from 0deg, transparent 0deg, rgba(29, 185, 84, 0.4) 20deg, rgba(30, 215, 96, 0.2) 40deg, transparent 60deg)',
                    }}
                  />
                </motion.div>

                {/* Center glow */}
                <motion.div
                  className="absolute w-6 h-6 bg-gradient-to-r from-[#1DB954] to-[#1ED760] rounded-full -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2 shadow-lg shadow-[#1DB954]/50"
                  animate={{
                    boxShadow: [
                      '0 0 20px rgba(29, 185, 84, 0.5)',
                      '0 0 40px rgba(29, 185, 84, 0.8)',
                      '0 0 20px rgba(29, 185, 84, 0.5)'
                    ]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Partner count indicator - Real database data */}
        <div className="absolute top-24 left-4 z-20">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-[#1DB954]/90 backdrop-blur-md px-4 py-2 rounded-full shadow-lg border border-white/20"
          >
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-white" />
              <span className="text-white font-bold text-sm">
                {displayPartners.length} nearby
              </span>
              {isLoading && (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="w-3 h-3 border-2 border-white border-t-transparent rounded-full"
                />
              )}
            </div>
          </motion.div>
        </div>

        {/* Floating action buttons */}
        <div className="absolute right-4 bottom-4 flex flex-col gap-2 z-20">
          {/* View toggle */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setViewMode(viewMode === 'markers' ? 'list' : 'markers')}
            className="w-12 h-12 bg-white/10 backdrop-blur-md border border-white/20 rounded-full shadow-lg flex items-center justify-center"
          >
            {viewMode === 'markers' ? (
              <Users className="w-5 h-5 text-white" />
            ) : (
              <MapPin className="w-5 h-5 text-white" />
            )}
          </motion.button>

          {/* Filter */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setShowFilters(true)}
            className="relative w-12 h-12 bg-white/10 backdrop-blur-md border border-white/20 rounded-full shadow-lg flex items-center justify-center"
          >
            <Filter className="w-5 h-5 text-white" />
            {hasActiveFilters && (
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-[#1DB954] to-[#1ED760] rounded-full border-2 border-[#0F0F0F] flex items-center justify-center">
                <span className="text-[10px] text-white font-bold">
                  {filters.languages.length + 
                   (filters.maxDistance < 50 ? 1 : 0) + 
                   (filters.availability !== 'all' ? 1 : 0) + 
                   (filters.minMatchScore > 0 ? 1 : 0) + 
                   (filters.meetingType !== 'all' ? 1 : 0)}
                </span>
              </div>
            )}
          </motion.button>

          {/* Zoom controls */}
          <div className="flex flex-col gap-1 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-1">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => {
                setMapZoom(Math.min(20, mapZoom + 1));
              }}
              className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center"
            >
              <Plus className="w-5 h-5 text-white" />
            </motion.button>
            <div className="w-10 h-px bg-white/20" />
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => {
                setMapZoom(Math.max(1, mapZoom - 1));
              }}
              className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center"
            >
              <Minus className="w-5 h-5 text-white" />
            </motion.button>
          </div>

          {/* Re-center */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={handleCenterOnUser}
            className="w-12 h-12 bg-gradient-to-r from-[#1DB954] to-[#1ED760] rounded-full shadow-lg shadow-[#1DB954]/30 flex items-center justify-center"
          >
            <Locate className="w-5 h-5 text-white" />
          </motion.button>
        </div>

        {/* Selected partner card */}
        <AnimatePresence mode="wait">
          {selected && viewMode === 'markers' && (
            <motion.div
              key={selected.id}
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="absolute bottom-4 left-4 right-4 z-30"
            >
              <motion.div
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.2}
                onDragEnd={(e, info) => {
                  if (info.offset.x > 100 && canSwipeRight) {
                    // Swipe right - next partner
                    setSelectedPartner(nearbyPartners[currentPartnerIndex + 1].id);
                  } else if (info.offset.x < -100 && canSwipeLeft) {
                    // Swipe left - previous partner
                    setSelectedPartner(nearbyPartners[currentPartnerIndex - 1].id);
                  }
                }}
                className="bg-white/10 backdrop-blur-xl rounded-2xl p-4 border border-white/20 shadow-2xl cursor-grab active:cursor-grabbing"
              >
                <button
                  onClick={() => setSelectedPartner(null)}
                  className="absolute -top-2 -right-2 w-8 h-8 bg-[#2A2A2A] rounded-full flex items-center justify-center border-2 border-[#0F0F0F] shadow-lg z-10"
                >
                  <X className="w-4 h-4 text-white" />
                </button>

                {/* Navigation arrows */}
                {canSwipeLeft && (
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setSelectedPartner(nearbyPartners[currentPartnerIndex - 1].id)}
                    className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 w-10 h-10 bg-gradient-to-r from-[#1DB954] to-[#1ED760] rounded-full flex items-center justify-center shadow-lg shadow-[#1DB954]/30 border-2 border-[#0F0F0F] z-10"
                  >
                    <ChevronLeft className="w-5 h-5 text-white" />
                  </motion.button>
                )}
                
                {canSwipeRight && (
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setSelectedPartner(nearbyPartners[currentPartnerIndex + 1].id)}
                    className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-10 h-10 bg-gradient-to-r from-[#1DB954] to-[#1ED760] rounded-full flex items-center justify-center shadow-lg shadow-[#1DB954]/30 border-2 border-[#0F0F0F] z-10"
                  >
                    <ChevronRight className="w-5 h-5 text-white" />
                  </motion.button>
                )}

                {/* Counter indicator */}
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-[#2A2A2A] rounded-full border border-white/20 shadow-lg">
                  <span className="text-xs font-semibold text-white">
                    {currentPartnerIndex + 1} / {nearbyPartners.length}
                  </span>
                </div>

                <div className="flex gap-3">
                  <div className="relative flex-shrink-0">
                    <img
                      src={selected.avatar_url || selected.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(selected.display_name || selected.name || 'User')}&background=1DB954&color=fff`}
                      alt={selected.display_name || selected.name || 'User'}
                      className="w-20 h-20 rounded-2xl object-cover"
                    />
                    {(selected.is_online || selected.availability_status === 'available') && (
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-gradient-to-r from-[#1DB954] to-[#1ED760] border-3 border-[#0F0F0F] rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-bold text-white text-lg">
                          {selected.display_name || selected.name || 'User'}, {selected.age || ''}
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-white/60">
                          <MapPin className="w-3.5 h-3.5" />
                          <span>{(selected.distance_km || selected.distance || 0).toFixed(1)}km away</span>
                          <span>•</span>
                          <span className="text-[#1ED760] font-semibold">{selected.matchScore || selected.match_score || 0}% match</span>
                        </div>
                      </div>
                      <div className="text-2xl">
                        {selected.languages?.find((l: any) => l.role === 'teaching')?.flag || '🌍'}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={() => onPartnerClick(selected.id)}
                        className="flex-1 py-2.5 bg-gradient-to-r from-[#1DB954] to-[#1ED760] text-white rounded-xl font-medium shadow-lg shadow-[#1DB954]/30"
                      >
                        View Profile
                      </motion.button>
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        className="px-4 py-2.5 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white font-medium"
                      >
                        Chat
                      </motion.button>
                    </div>
                  </div>
                </div>

                {/* Swipe indicator */}
                <div className="flex items-center justify-center gap-1.5 mt-3 pt-3 border-t border-white/10">
                  <div className="flex items-center gap-1 text-white/40 text-xs">
                    <ChevronLeft className="w-3 h-3" />
                    <span>Swipe</span>
                    <ChevronRight className="w-3 h-3" />
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* List view overlay */}
        <AnimatePresence>
          {viewMode === 'list' && (
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="absolute inset-0 bg-[#0F0F0F]/95 backdrop-blur-xl z-20"
            >
              <div className="h-full overflow-y-auto p-4 space-y-2">
                <div className="flex items-center justify-between mb-4 sticky top-0 bg-[#0F0F0F] py-2 z-10">
                  <h3 className="font-bold text-white text-xl">
                    {nearbyPartners.length} Partners
                  </h3>
                  <button
                    onClick={() => setViewMode('markers')}
                    className="p-2 bg-white/10 rounded-xl"
                  >
                    <X className="w-5 h-5 text-white" />
                  </button>
                </div>

                {nearbyPartners.map((partner, idx) => (
                  <motion.div
                    key={partner.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    onClick={() => {
                      setSelectedPartner(partner.id);
                      setViewMode('markers');
                    }}
                    className="flex items-center gap-3 p-3 bg-white/5 backdrop-blur-md rounded-xl border border-white/10 cursor-pointer active:scale-[0.98] transition-transform"
                  >
                    <div className="relative">
                      <img
                        src={partner.avatar_url || partner.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(partner.display_name || partner.name || 'User')}&background=1DB954&color=fff`}
                        alt={partner.display_name || partner.name || 'User'}
                        className="w-14 h-14 rounded-xl object-cover"
                      />
                      {(partner.is_online || partner.availability_status === 'available') && (
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-gradient-to-r from-[#1DB954] to-[#1ED760] border-2 border-[#0F0F0F] rounded-full" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-white truncate">
                        {partner.display_name || partner.name || 'User'}, {partner.age || ''}
                      </h4>
                      <div className="flex items-center gap-2 text-xs text-white/60">
                        <span>{(partner.distance_km || partner.distance || 0).toFixed(1)}km</span>
                        <span>•</span>
                        <span className="text-[#1ED760]">{partner.matchScore || partner.match_score || 0}%</span>
                        {(partner.is_online || partner.availability_status === 'available') && (
                          <>
                            <span>•</span>
                            <span className="flex items-center gap-1 text-[#4FD1C5]">
                              <Zap className="w-3 h-3" />
                              Now
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1">
                      <div className="text-xl">
                        {partner.languages?.find((l: any) => l.role === 'teaching')?.flag || '🌍'}
                      </div>
                      {(partner.matchScore || partner.match_score || 0) >= 80 && (
                        <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Layer Menu */}
      <AnimatePresence>
        {showLayerMenu && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowLayerMenu(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm z-30"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -20 }}
              className="absolute top-20 right-4 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 shadow-2xl z-40 overflow-hidden"
            >
              <div className="p-3 space-y-1">
                {[
                  { value: 'standard' as MapStyle, label: 'Standard', icon: MapPin },
                  { value: 'heat' as MapStyle, label: 'Heat Map', icon: TrendingUp },
                  { value: 'cluster' as MapStyle, label: 'Clusters', icon: Users }
                ].map(option => (
                  <motion.button
                    key={option.value}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setMapStyle(option.value);
                      setShowLayerMenu(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                      mapStyle === option.value
                        ? 'bg-gradient-to-r from-[#1DB954] to-[#1ED760] text-white shadow-lg'
                        : 'bg-white/5 text-white/80 hover:bg-white/10'
                    }`}
                  >
                    <option.icon className="w-5 h-5" />
                    <span>{option.label}</span>
                    {mapStyle === option.value && <Check className="w-4 h-4 ml-auto" />}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Filters Modal */}
      <AnimatePresence>
        {showFilters && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowFilters(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm z-40"
            />
            
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="absolute bottom-0 left-0 right-0 bg-[#1A1A1A] rounded-t-3xl shadow-2xl z-50 max-h-[85vh] overflow-hidden"
            >
              {/* Header */}
              <div className="sticky top-0 bg-[#1A1A1A] border-b border-[#2A2A2A] px-4 py-4 z-10">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-xl font-bold text-white">Advanced Filters</h3>
                  <button
                    onClick={() => setShowFilters(false)}
                    className="p-2 bg-[#2A2A2A] rounded-xl active:scale-95 transition-transform"
                  >
                    <X className="w-5 h-5 text-white" />
                  </button>
                </div>
                {hasActiveFilters && (
                  <p className="text-sm text-[#1DB954]">
                    {filteredPartners.length} partners match your filters
                  </p>
                )}
              </div>

              {/* Scrollable Content */}
              <div className="px-4 py-4 overflow-y-auto max-h-[calc(85vh-160px)] space-y-6">
                {/* Language Filter */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-white">Languages</h4>
                    {filters.languages.length > 0 && (
                      <span className="text-xs text-[#1DB954] font-medium">
                        {filters.languages.length} selected
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {availableLanguages.map(lang => (
                      <motion.button
                        key={lang}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => toggleLanguage(lang)}
                        className={`px-4 py-2.5 rounded-xl font-medium transition-all ${
                          filters.languages.includes(lang) 
                            ? 'bg-gradient-to-r from-[#1DB954] to-[#1ED760] text-white shadow-lg shadow-[#1DB954]/30' 
                            : 'bg-[#2A2A2A] text-[#9CA3AF]'
                        }`}
                      >
                        {filters.languages.includes(lang) && <Check className="w-3.5 h-3.5 inline mr-1.5" />}
                        {lang}
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Distance Filter */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-white">Max Distance</h4>
                    <span className="text-sm font-bold bg-gradient-to-r from-[#1DB954] to-[#1ED760] bg-clip-text text-transparent">
                      {filters.maxDistance}km
                    </span>
                  </div>
                  <div className="relative">
                    <input
                      type="range"
                      min="1"
                      max="50"
                      value={filters.maxDistance}
                      onChange={(e) => setFilters(prev => ({ ...prev, maxDistance: parseInt(e.target.value) }))}
                      className="w-full h-3 bg-[#2A2A2A] rounded-full appearance-none cursor-pointer"
                      style={{
                        background: `linear-gradient(to right, #1DB954 0%, #1ED760 ${(filters.maxDistance / 50) * 100}%, #2A2A2A ${(filters.maxDistance / 50) * 100}%, #2A2A2A 100%)`
                      }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-[#6B7280] mt-2">
                    <span>1km</span>
                    <span>25km</span>
                    <span>50km</span>
                  </div>
                </div>

                {/* Availability Filter */}
                <div>
                  <h4 className="font-semibold text-white mb-3">Availability</h4>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { value: 'all' as const, label: 'All', icon: '🌍' },
                      { value: 'now' as const, label: 'Now', icon: '⚡' },
                      { value: 'week' as const, label: 'Week', icon: '📅' }
                    ].map(option => (
                      <motion.button
                        key={option.value}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setFilters(prev => ({ ...prev, availability: option.value }))}
                        className={`p-3 rounded-xl font-medium transition-all ${
                          filters.availability === option.value
                            ? 'bg-gradient-to-r from-[#1DB954] to-[#1ED760] text-white shadow-lg shadow-[#1DB954]/30'
                            : 'bg-[#2A2A2A] text-[#9CA3AF]'
                        }`}
                      >
                        <div className="text-2xl mb-1">{option.icon}</div>
                        <div className="text-sm">{option.label}</div>
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Match Score Filter */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-white">Minimum Match</h4>
                    <span className="text-sm font-bold bg-gradient-to-r from-[#1DB954] to-[#1ED760] bg-clip-text text-transparent">
                      {filters.minMatchScore}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="10"
                    value={filters.minMatchScore}
                    onChange={(e) => setFilters(prev => ({ ...prev, minMatchScore: parseInt(e.target.value) }))}
                    className="w-full h-3 bg-[#2A2A2A] rounded-full appearance-none cursor-pointer"
                    style={{
                      background: `linear-gradient(to right, #1DB954 0%, #1ED760 ${filters.minMatchScore}%, #2A2A2A ${filters.minMatchScore}%, #2A2A2A 100%)`
                    }}
                  />
                  <div className="flex justify-between text-xs text-[#6B7280] mt-2">
                    <span>Any</span>
                    <span>50%</span>
                    <span>Perfect</span>
                  </div>
                </div>

                {/* Meeting Type Filter */}
                <div>
                  <h4 className="font-semibold text-white mb-3">Meeting Type</h4>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { value: 'all' as const, label: 'All', icon: '🌐' },
                      { value: 'in-person' as const, label: 'In-Person', icon: '☕' },
                      { value: 'virtual' as const, label: 'Virtual', icon: '💻' }
                    ].map(option => (
                      <motion.button
                        key={option.value}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setFilters(prev => ({ ...prev, meetingType: option.value }))}
                        className={`p-3 rounded-xl font-medium transition-all ${
                          filters.meetingType === option.value
                            ? 'bg-gradient-to-r from-[#1DB954] to-[#1ED760] text-white shadow-lg shadow-[#1DB954]/30'
                            : 'bg-[#2A2A2A] text-[#9CA3AF]'
                        }`}
                      >
                        <div className="text-2xl mb-1">{option.icon}</div>
                        <div className="text-sm">{option.label}</div>
                      </motion.button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Footer Buttons */}
              <div className="sticky bottom-0 bg-[#1A1A1A] border-t border-[#2A2A2A] px-4 py-4 flex gap-3">
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={resetFilters}
                  disabled={!hasActiveFilters}
                  className={`flex-1 py-3.5 rounded-xl font-semibold transition-all ${
                    hasActiveFilters
                      ? 'bg-[#2A2A2A] text-white active:bg-[#3A3A3A]'
                      : 'bg-[#1A1A1A] text-[#6B7280] cursor-not-allowed'
                  }`}
                >
                  Reset All
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowFilters(false)}
                  className="flex-1 py-3.5 bg-gradient-to-r from-[#1DB954] to-[#1ED760] text-white rounded-xl font-semibold shadow-lg shadow-[#1DB954]/30"
                >
                  Show {filteredPartners.length} Results
                </motion.button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

// Helper function to render a marker
function renderMarker(partner: any, isSelected: boolean) {
  const isOnline = partner.is_online || partner.availability_status === 'available';
  const avatar = partner.avatar_url || partner.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(partner.display_name || partner.name || 'User')}&background=1DB954&color=fff`;
  const name = partner.display_name || partner.name || 'User';
  const distance = partner.distance_km || partner.distance || 0;
  const flag = partner.languages?.find((l: any) => l.role === 'teaching')?.flag || '🌍';
  
  return (
    <div className="relative flex flex-col items-center">
      {/* Pulse effect for available partners */}
      {isOnline && (
        <motion.div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-16 h-16 bg-[#4FD1C5] rounded-full"
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.5, 0, 0.5]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      )}
      
      {/* Pin Shape */}
      <motion.div 
        className="relative"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        {/* Pin body */}
        <div className={`relative w-16 h-16 rounded-full border-4 ${
          isSelected 
            ? 'border-[#E91E8C] ring-4 ring-[#E91E8C]/40' 
            : 'border-white shadow-xl'
        } overflow-hidden bg-white`}>
          <img
            src={avatar}
            alt={name}
            className="w-full h-full object-cover"
          />
        </div>
        
        {/* Pin point */}
        <div className={`absolute left-1/2 -translate-x-1/2 -bottom-2.5 w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[15px] ${
          isSelected 
            ? 'border-t-[#E91E8C]' 
            : 'border-t-white'
        } drop-shadow-lg`} />
        
        {/* Flag badge */}
        <motion.div
          animate={{ rotate: [0, -8, 8, -8, 0] }}
          transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
          className="absolute -top-1 -right-1 text-lg bg-white rounded-full w-7 h-7 flex items-center justify-center shadow-lg border-3 border-[#0F0F0F]"
        >
          {flag}
        </motion.div>

        {/* Online indicator */}
        {isOnline && (
          <motion.div
            animate={{
              boxShadow: [
                '0 0 0 0 rgba(79, 209, 197, 0.7)',
                '0 0 0 6px rgba(79, 209, 197, 0)',
                '0 0 0 0 rgba(79, 209, 197, 0)'
              ]
            }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute bottom-0 right-0 w-5 h-5 bg-gradient-to-r from-[#4FD1C5] to-[#5FB3B3] border-3 border-[#0F0F0F] rounded-full z-10"
          />
        )}

        {/* Match score badge */}
        {(partner.matchScore || partner.match_score || 0) >= 90 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -bottom-1 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full shadow-lg"
          >
            <Star className="w-3 h-3 text-white fill-white" />
          </motion.div>
        )}
      </motion.div>

      {/* Distance label */}
      <motion.div 
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-1.5 px-2.5 py-1 bg-white backdrop-blur-sm rounded-full shadow-md"
      >
        <span className="text-xs font-bold text-[#0F0F0F]">{distance.toFixed(1)}km</span>
      </motion.div>
    </div>
  );
}

// Helper function to generate clusters
function generateClusters(partners: any[]) {
  const clusters: Array<{
    position: { x: string; y: string };
    count: number;
    partners: any[];
  }> = [];

  // Simple clustering logic - group partners by proximity
  const gridSize = 20; // percentage
  const grid: { [key: string]: any[] } = {};

  partners.forEach((partner, index) => {
    const x = 20 + index * 15;
    const y = 30 + (index % 3) * 20;
    const gridX = Math.floor(x / gridSize);
    const gridY = Math.floor(y / gridSize);
    const key = `${gridX},${gridY}`;

    if (!grid[key]) {
      grid[key] = [];
    }
    grid[key].push({ partner, x, y });
  });

  // Create clusters
  Object.entries(grid).forEach(([key, items]) => {
    if (items.length > 0) {
      const avgX = items.reduce((sum, item) => sum + item.x, 0) / items.length;
      const avgY = items.reduce((sum, item) => sum + item.y, 0) / items.length;
      
      clusters.push({
        position: { x: `${avgX}%`, y: `${avgY}%` },
        count: items.length,
        partners: items.map(item => item.partner)
      });
    }
  });

  return clusters;
}

// Helper function to get language flag
function getLanguageFlag(language: string): string {
  const flags: { [key: string]: string } = {
    'English': '🇬🇧',
    'Spanish': '🇪🇸',
    'French': '🇫🇷',
    'German': '🇩🇪',
    'Italian': '🇮🇹',
    'Portuguese': '🇵🇹',
    'Chinese': '🇨🇳',
    'Japanese': '🇯🇵',
    'Korean': '🇰🇷',
    'Russian': '🇷🇺',
    'Arabic': '🇦🇪',
    'Hindi': '🇮🇳',
    'Dutch': '🇳🇱'
  };
  return flags[language] || '🌍';
}