'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { MapPin, Navigation, MessageCircle, Star, ZoomIn, ZoomOut, Locate } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleMap, LoadScript, Marker, InfoWindow, Circle } from '@react-google-maps/api';
import { MarkerClusterer } from '@googlemaps/markerclusterer';
import { GOOGLE_MAPS_API_KEY } from '@/lib/config';

interface Partner {
  id: string;
  name: string;
  avatar: string;
  distance: number;
  latitude: number;
  longitude: number;
  isOnline: boolean;
  languages: string[];
  rating?: number;
}

interface MapViewProps {
  partners: Partner[];
  onPartnerClick: (partnerId: string) => void;
  centerLat?: number;
  centerLng?: number;
  className?: string;
  userLocation?: { lat: number; lng: number };
}

const mapContainerStyle = {
  width: '100%',
  height: '100%',
};

const defaultCenter = {
  lat: 51.5074, // London
  lng: -0.1278,
};

const defaultZoom = 13;

export function MapView({ 
  partners, 
  onPartnerClick, 
  centerLat = defaultCenter.lat, 
  centerLng = defaultCenter.lng,
  className = '',
  userLocation,
}: MapViewProps) {
  const [selectedPartnerId, setSelectedPartnerId] = useState<string | null>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [currentCenter, setCurrentCenter] = useState({ lat: centerLat, lng: centerLng });
  const [zoom, setZoom] = useState(defaultZoom);
  const [isLoaded, setIsLoaded] = useState(false);
  const [userCurrentLocation, setUserCurrentLocation] = useState<{ lat: number; lng: number } | null>(
    userLocation || null
  );
  const clustererRef = useRef<MarkerClusterer | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);

  // Define handleMarkerClick before it's used in useEffect
  const handleMarkerClick = useCallback((partnerId: string) => {
    setSelectedPartnerId(partnerId);
    onPartnerClick(partnerId);
  }, [onPartnerClick]);

  // Update center when props change
  useEffect(() => {
    if (centerLat && centerLng) {
      setCurrentCenter({ lat: centerLat, lng: centerLng });
    }
  }, [centerLat, centerLng]);

  // Update markers when partners change
  useEffect(() => {
    if (!isLoaded || !map || !clustererRef.current || typeof window === 'undefined' || !window.google) {
      return;
    }

    // Clear existing markers
    clustererRef.current.clearMarkers();
    markersRef.current = [];

    // Create new markers
    const newMarkers = partners.map((partner) => {
      const marker = new window.google.maps.Marker({
        position: { lat: partner.latitude, lng: partner.longitude },
        icon: {
          url: partner.avatar || 'https://ui-avatars.com/api/?name=User&background=1DB954&color=fff',
          scaledSize: new window.google.maps.Size(48, 48),
          anchor: new window.google.maps.Point(24, 48),
        },
        zIndex: selectedPartnerId === partner.id ? 100 : 10,
      });

      // Add click listener
      marker.addListener('click', () => {
        handleMarkerClick(partner.id);
      });

      return marker;
    });

    markersRef.current = newMarkers;
    
    // Add markers to clusterer
    clustererRef.current.addMarkers(newMarkers);

    // Cleanup function
    return () => {
      if (clustererRef.current) {
        clustererRef.current.clearMarkers();
      }
      markersRef.current = [];
    };
  }, [partners, isLoaded, map, selectedPartnerId, handleMarkerClick]);

  // Get user's current location
  useEffect(() => {
    if (navigator.geolocation && !userLocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserCurrentLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          setCurrentCenter({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.warn('Error getting user location:', error);
        }
      );
    } else if (userLocation) {
      setUserCurrentLocation(userLocation);
    }
  }, [userLocation]);

  const selectedPartner = useMemo(() => {
    return partners.find(p => p.id === selectedPartnerId);
  }, [partners, selectedPartnerId]);

  const onLoad = useCallback((map: google.maps.Map) => {
    setMap(map);
    setIsLoaded(true);
    
    // Initialize clusterer
    if (typeof window !== 'undefined' && window.google) {
      clustererRef.current = new MarkerClusterer({
        map,
        markers: [],
        algorithmOptions: {
          radius: 80,
        },
      });
    }
  }, []);

  const onUnmount = useCallback(() => {
    // Clean up clusterer
    if (clustererRef.current) {
      clustererRef.current.clearMarkers();
      clustererRef.current = null;
    }
    markersRef.current = [];
    setMap(null);
    setIsLoaded(false);
  }, []);

  const handleZoomIn = useCallback(() => {
    if (map) {
      const currentZoom = map.getZoom() || defaultZoom;
      map.setZoom(Math.min(currentZoom + 1, 20));
      setZoom(map.getZoom() || defaultZoom);
    }
  }, [map]);

  const handleZoomOut = useCallback(() => {
    if (map) {
      const currentZoom = map.getZoom() || defaultZoom;
      map.setZoom(Math.max(currentZoom - 1, 1));
      setZoom(map.getZoom() || defaultZoom);
    }
  }, [map]);

  const handleCenterOnUser = useCallback(() => {
    if (map && userCurrentLocation) {
      map.panTo(userCurrentLocation);
      map.setZoom(15);
      setCurrentCenter(userCurrentLocation);
      setZoom(15);
    }
  }, [map, userCurrentLocation]);

  // Dark mode map styles
  const mapStyles = useMemo(() => [
    {
      featureType: 'all',
      elementType: 'geometry',
      stylers: [{ color: '#242424' }],
    },
    {
      featureType: 'all',
      elementType: 'labels.text.stroke',
      stylers: [{ color: '#242424' }],
    },
    {
      featureType: 'all',
      elementType: 'labels.text.fill',
      stylers: [{ color: '#9CA3AF' }],
    },
    {
      featureType: 'water',
      elementType: 'geometry',
      stylers: [{ color: '#1a1a1a' }],
    },
    {
      featureType: 'road',
      elementType: 'geometry',
      stylers: [{ color: '#2a2a2a' }],
    },
    {
      featureType: 'poi',
      elementType: 'geometry',
      stylers: [{ color: '#1a1a1a' }],
    },
  ], []);

  // Use Google Maps API key from config, fallback to environment variable
  const apiKey = GOOGLE_MAPS_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || 'AIzaSyCJlhCsal8nx2Gj3VRgrQ6zQ7JLNSJbpRA';

  if (!apiKey) {
    return (
      <div className={`relative w-full h-full flex items-center justify-center ${className}`} style={{ backgroundColor: 'var(--color-background)' }}>
        <div className="text-center">
          <MapPin className="w-12 h-12 mx-auto mb-4 text-[#9CA3AF]" />
          <p className="text-[#9CA3AF]">Google Maps API key is required to display the map</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative w-full h-full overflow-hidden rounded-2xl ${className}`}>
      <LoadScript googleMapsApiKey={apiKey}>
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={currentCenter}
          zoom={zoom}
          onLoad={onLoad}
          onUnmount={onUnmount}
          options={{
            styles: mapStyles,
            disableDefaultUI: false,
            zoomControl: false,
            mapTypeControl: false,
            scaleControl: false,
            streetViewControl: false,
            rotateControl: false,
            fullscreenControl: false,
          }}
        >
          {/* User location marker */}
          {userCurrentLocation && isLoaded && (
            <>
              <Marker
                position={userCurrentLocation}
                icon={{
                  path: google.maps.SymbolPath.CIRCLE,
                  scale: 8,
                  fillColor: '#1DB954',
                  fillOpacity: 1,
                  strokeColor: '#FFFFFF',
                  strokeWeight: 3,
                }}
                zIndex={1000}
              />
              {/* Pulse circle around user */}
              <Circle
                center={userCurrentLocation}
                radius={500}
                options={{
                  fillColor: '#1DB954',
                  fillOpacity: 0.1,
                  strokeColor: '#1DB954',
                  strokeOpacity: 0.3,
                  strokeWeight: 2,
                }}
              />
            </>
          )}

          {/* Partner markers are handled by clustering in useEffect */}

          {/* Info Windows - Render separately so they appear above clusters */}
          {isLoaded && selectedPartnerId && (() => {
            const partner = partners.find(p => p.id === selectedPartnerId);
            if (!partner) return null;

            return (
              <InfoWindow
                position={{ lat: partner.latitude, lng: partner.longitude }}
                onCloseClick={() => setSelectedPartnerId(null)}
              >
                <div className="p-2 min-w-[200px]">
                  <div className="flex items-center gap-2 mb-2">
                    <img
                      src={partner.avatar || 'https://ui-avatars.com/api/?name=User&background=1DB954&color=fff'}
                      alt={partner.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-sm truncate" style={{ color: 'var(--color-text)' }}>
                        {partner.name}
                      </h4>
                      {partner.rating && (
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 fill-[#F59E0B] text-[#F59E0B]" />
                          <span className="text-xs" style={{ color: 'var(--color-text)' }}>
                            {partner.rating}
                          </span>
                        </div>
                      )}
                    </div>
                    {partner.isOnline && (
                      <div className="w-3 h-3 bg-[#10B981] rounded-full" />
                    )}
                  </div>
                  <div className="flex flex-wrap gap-1 mb-2">
                    {partner.languages.slice(0, 2).map(lang => (
                      <span
                        key={lang}
                        className="px-2 py-0.5 rounded-full text-xs font-medium bg-gradient-primary text-white"
                      >
                        {lang}
                      </span>
                    ))}
                  </div>
                  <p className="text-xs text-[#9CA3AF] mb-2">
                    <MapPin className="w-3 h-3 inline mr-1" />
                    {partner.distance.toFixed(1)}km away
                  </p>
                  <button
                    onClick={() => {
                      onPartnerClick(partner.id);
                      setSelectedPartnerId(null);
                    }}
                    className="w-full py-1.5 rounded-lg bg-gradient-primary text-white text-xs font-semibold hover:opacity-90 transition-opacity"
                  >
                    View Profile
                  </button>
                </div>
              </InfoWindow>
            );
          })()}
        </GoogleMap>
      </LoadScript>

      {/* Selected partner detail card */}
      <AnimatePresence>
        {selectedPartner && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute bottom-6 left-6 right-6 z-40 rounded-2xl shadow-2xl p-4"
            style={{ backgroundColor: 'var(--color-card)', borderWidth: '1px', borderColor: 'var(--color-border)' }}
          >
            <div className="flex items-start gap-4">
              <img 
                src={selectedPartner.avatar || 'https://ui-avatars.com/api/?name=User&background=1DB954&color=fff'}
                alt={selectedPartner.name}
                className="w-16 h-16 rounded-2xl object-cover"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-bold text-lg" style={{ color: 'var(--color-text)' }}>
                    {selectedPartner.name}
                  </h3>
                  {selectedPartner.rating && (
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-[#F59E0B] text-[#F59E0B]" />
                      <span className="font-semibold text-sm" style={{ color: 'var(--color-text)' }}>
                        {selectedPartner.rating}
                      </span>
                    </div>
                  )}
                  {selectedPartner.isOnline && (
                    <div className="w-3 h-3 bg-[#10B981] rounded-full" />
                  )}
                </div>
                <p className="text-sm text-[#9CA3AF] mb-3">
                  <MapPin className="w-3 h-3 inline mr-1" />
                  {selectedPartner.distance.toFixed(1)}km away
                </p>
                <div className="flex flex-wrap gap-2 mb-3">
                  {selectedPartner.languages.map(lang => (
                    <span
                      key={lang}
                      className="px-3 py-1 rounded-full text-xs font-medium bg-gradient-primary text-white"
                    >
                      {lang}
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => {
                      onPartnerClick(selectedPartner.id);
                      setSelectedPartnerId(null);
                    }}
                    className="flex-1 py-2 rounded-xl bg-gradient-primary text-white font-semibold text-sm transition-transform active:scale-95"
                  >
                    View Profile
                  </button>
                  <button 
                    className="px-4 py-2 rounded-xl transition-transform active:scale-95"
                    style={{ backgroundColor: 'var(--color-background)', color: 'var(--color-text)' }}
                  >
                    <MessageCircle className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Map controls */}
      <div className="absolute top-6 right-6 flex flex-col gap-2 z-30">
        {userCurrentLocation && (
          <button
            onClick={handleCenterOnUser}
            className="w-10 h-10 rounded-xl shadow-lg flex items-center justify-center transition-transform active:scale-95"
            style={{ backgroundColor: 'var(--color-card)', color: 'var(--color-text)' }}
            title="Center on my location"
          >
            <Locate className="w-5 h-5" />
          </button>
        )}
        <button
          onClick={handleZoomIn}
          className="w-10 h-10 rounded-xl shadow-lg flex items-center justify-center transition-transform active:scale-95"
          style={{ backgroundColor: 'var(--color-card)', color: 'var(--color-text)' }}
          title="Zoom in"
        >
          <ZoomIn className="w-5 h-5" />
        </button>
        <button
          onClick={handleZoomOut}
          className="w-10 h-10 rounded-xl shadow-lg flex items-center justify-center transition-transform active:scale-95"
          style={{ backgroundColor: 'var(--color-card)', color: 'var(--color-text)' }}
          title="Zoom out"
        >
          <ZoomOut className="w-5 h-5" />
        </button>
      </div>

      {/* Legend */}
      <div className="absolute top-6 left-6 px-4 py-2 rounded-xl shadow-lg text-sm font-medium z-30" style={{ backgroundColor: 'var(--color-card)', color: 'var(--color-text)' }}>
        <span className="text-[#1DB954]">{partners.length}</span> partners nearby
      </div>
    </div>
  );
}
