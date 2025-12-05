import { useState, useEffect } from 'react';
import { MapPin, Navigation, User, MessageCircle, Star, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

interface Partner {
  id: string;
  name: string;
  avatar: string;
  distance: number;
  latitude: number;
  longitude: number;
  isOnline: boolean;
  languages: string[];
  rating: number;
}

interface MapViewProps {
  partners: Partner[];
  onPartnerClick: (partnerId: string) => void;
  centerLat?: number;
  centerLng?: number;
  className?: string;
}

export function MapView({ 
  partners, 
  onPartnerClick, 
  centerLat = 51.5074, 
  centerLng = -0.1278,
  className = '' 
}: MapViewProps) {
  const [selectedPartnerId, setSelectedPartnerId] = useState<string | null>(null);
  const [hoveredPartnerId, setHoveredPartnerId] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState({ lat: centerLat, lng: centerLng });

  // Simulate getting user location
  useEffect(() => {
    setUserLocation({ lat: centerLat, lng: centerLng });
  }, [centerLat, centerLng]);

  // Convert lat/lng to pixel positions (simplified mock implementation)
  const getMarkerPosition = (lat: number, lng: number) => {
    // Mock conversion - in real app would use proper projection
    const x = ((lng - centerLng + 0.05) / 0.1) * 100;
    const y = ((centerLat - lat + 0.05) / 0.1) * 100;
    return { x: `${50 + x}%`, y: `${50 + y}%` };
  };

  const selectedPartner = partners.find(p => p.id === selectedPartnerId);

  return (
    <div className={`relative w-full h-full overflow-hidden rounded-2xl ${className}`}>
      {/* Map Background - Simulated with gradient and grid */}
      <div 
        className="absolute inset-0"
        style={{
          background: `
            linear-gradient(to bottom, 
              var(--color-background) 0%, 
              var(--color-card) 50%,
              var(--color-background) 100%
            )
          `
        }}
      >
        {/* Grid overlay for map feel */}
        <svg className="absolute inset-0 w-full h-full opacity-10">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>

        {/* Stylized streets */}
        <svg className="absolute inset-0 w-full h-full opacity-20">
          <line x1="0%" y1="30%" x2="100%" y2="35%" stroke="currentColor" strokeWidth="2" />
          <line x1="0%" y1="60%" x2="100%" y2="58%" stroke="currentColor" strokeWidth="2" />
          <line x1="25%" y1="0%" x2="28%" y2="100%" stroke="currentColor" strokeWidth="2" />
          <line x1="65%" y1="0%" x2="62%" y2="100%" stroke="currentColor" strokeWidth="2" />
        </svg>
      </div>

      {/* User location marker (center) */}
      <div 
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="relative"
        >
          {/* Pulsing ring */}
          <motion.div
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.5, 0, 0.5],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute inset-0 w-16 h-16 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-primary"
          />
          {/* User marker */}
          <div className="relative w-12 h-12 bg-gradient-primary rounded-full border-4 border-white shadow-lg flex items-center justify-center">
            <Navigation className="w-6 h-6 text-white" />
          </div>
        </motion.div>
      </div>

      {/* Partner markers */}
      {partners.map((partner) => {
        const position = getMarkerPosition(partner.latitude, partner.longitude);
        const isSelected = selectedPartnerId === partner.id;
        const isHovered = hoveredPartnerId === partner.id;

        return (
          <motion.div
            key={partner.id}
            className="absolute z-10"
            style={{
              left: position.x,
              top: position.y,
              transform: 'translate(-50%, -50%)'
            }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ 
              scale: isSelected ? 1.2 : 1, 
              opacity: 1,
              zIndex: isSelected || isHovered ? 30 : 10
            }}
            transition={{ type: 'spring', damping: 20 }}
          >
            <button
              onClick={() => {
                setSelectedPartnerId(partner.id);
                onPartnerClick(partner.id);
              }}
              onMouseEnter={() => setHoveredPartnerId(partner.id)}
              onMouseLeave={() => setHoveredPartnerId(null)}
              className="relative group"
            >
              {/* Distance label */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: isHovered || isSelected ? 1 : 0, y: isHovered || isSelected ? -50 : -40 }}
                className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 whitespace-nowrap"
              >
                <div className="px-3 py-1.5 rounded-lg shadow-lg text-xs font-semibold" style={{ backgroundColor: 'var(--color-card)', color: 'var(--color-text)' }}>
                  {partner.distance}km away
                </div>
              </motion.div>

              {/* Marker */}
              <div className={`relative w-12 h-12 rounded-full border-3 shadow-xl transition-all ${
                isSelected ? 'border-[#1DB954] ring-4 ring-[#1DB954]/30' : 'border-white'
              }`}>
                <img 
                  src={partner.avatar} 
                  alt={partner.name}
                  className="w-full h-full rounded-full object-cover"
                />
                {partner.isOnline && (
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-[#10B981] border-2 border-white rounded-full" />
                )}
              </div>

              {/* Hover card */}
              {isHovered && !isSelected && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-48 p-3 rounded-xl shadow-2xl"
                  style={{ backgroundColor: 'var(--color-card)', borderWidth: '1px', borderColor: 'var(--color-border)' }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-semibold text-sm" style={{ color: 'var(--color-text)' }}>{partner.name}</h4>
                    <div className="flex items-center gap-0.5">
                      <Star className="w-3 h-3 fill-[#F59E0B] text-[#F59E0B]" />
                      <span className="text-xs" style={{ color: 'var(--color-text)' }}>{partner.rating}</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1 mb-2">
                    {partner.languages.slice(0, 2).map(lang => (
                      <span key={lang} className="px-2 py-0.5 rounded-full text-xs font-medium bg-gradient-primary text-white">
                        {lang}
                      </span>
                    ))}
                  </div>
                  <p className="text-xs text-[#9CA3AF]">{partner.distance}km away</p>
                </motion.div>
              )}
            </button>
          </motion.div>
        );
      })}

      {/* Selected partner detail card */}
      {selectedPartner && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute bottom-6 left-6 right-6 z-40 rounded-2xl shadow-2xl p-4"
          style={{ backgroundColor: 'var(--color-card)', borderWidth: '1px', borderColor: 'var(--color-border)' }}
        >
          <div className="flex items-start gap-4">
            <img 
              src={selectedPartner.avatar}
              alt={selectedPartner.name}
              className="w-16 h-16 rounded-2xl object-cover"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-bold text-lg" style={{ color: 'var(--color-text)' }}>{selectedPartner.name}</h3>
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-[#F59E0B] text-[#F59E0B]" />
                  <span className="font-semibold text-sm" style={{ color: 'var(--color-text)' }}>{selectedPartner.rating}</span>
                </div>
              </div>
              <p className="text-sm text-[#9CA3AF] mb-3">
                <MapPin className="w-3 h-3 inline mr-1" />
                {selectedPartner.distance}km away
              </p>
              <div className="flex flex-wrap gap-2 mb-3">
                {selectedPartner.languages.map(lang => (
                  <span key={lang} className="px-3 py-1 rounded-full text-xs font-medium bg-gradient-primary text-white">
                    {lang}
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => onPartnerClick(selectedPartner.id)}
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

      {/* Map controls */}
      <div className="absolute top-6 right-6 flex flex-col gap-2 z-30">
        <button 
          className="w-10 h-10 rounded-xl shadow-lg flex items-center justify-center transition-transform active:scale-95"
          style={{ backgroundColor: 'var(--color-card)', color: 'var(--color-text)' }}
        >
          <Navigation className="w-5 h-5" />
        </button>
        <button 
          className="w-10 h-10 rounded-xl shadow-lg flex items-center justify-center transition-transform active:scale-95"
          style={{ backgroundColor: 'var(--color-card)', color: 'var(--color-text)' }}
        >
          <Zap className="w-5 h-5" />
        </button>
      </div>

      {/* Legend */}
      <div className="absolute top-6 left-6 px-4 py-2 rounded-xl shadow-lg text-sm font-medium z-30" style={{ backgroundColor: 'var(--color-card)', color: 'var(--color-text)' }}>
        <span className="text-[#1DB954]">{partners.length}</span> partners nearby
      </div>
    </div>
  );
}