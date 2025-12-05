import { useState } from 'react';
import { ArrowLeft, SlidersHorizontal, MapPin, Plus, Minus, Locate, X, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { mockPartners } from '../data/mockData';

interface MapScreenProps {
  onPartnerClick: (partnerId: string) => void;
}

interface Filters {
  languages: string[];
  maxDistance: number;
  availability: 'all' | 'now' | 'week';
  minMatchScore: number;
  meetingType: 'all' | 'in-person' | 'virtual';
}

export function MapScreen({ onPartnerClick }: MapScreenProps) {
  const [selectedPartner, setSelectedPartner] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<Filters>({
    languages: [],
    maxDistance: 50,
    availability: 'all',
    minMatchScore: 0,
    meetingType: 'all'
  });

  // Available languages from partners
  const availableLanguages = Array.from(new Set(mockPartners.map(p => p.teaching.language)));

  // Apply filters
  const filteredPartners = mockPartners.filter(partner => {
    if (partner.distance > filters.maxDistance) return false;
    if (filters.languages.length > 0 && !filters.languages.includes(partner.teaching.language)) return false;
    if (filters.availability === 'now' && !partner.availableNow) return false;
    if (filters.minMatchScore > 0 && partner.matchScore < filters.minMatchScore) return false;
    if (filters.meetingType === 'in-person' && !partner.availability.preferences.includes('in-person')) return false;
    if (filters.meetingType === 'virtual' && !partner.availability.preferences.includes('video')) return false;
    return true;
  });

  const nearbyPartners = filteredPartners.filter(p => p.distance < 5);
  const selected = selectedPartner ? mockPartners.find(p => p.id === selectedPartner) : null;

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
  };

  const toggleLanguage = (lang: string) => {
    setFilters(prev => ({
      ...prev,
      languages: prev.languages.includes(lang)
        ? prev.languages.filter(l => l !== lang)
        : [...prev.languages, lang]
    }));
  };

  return (
    <div className="flex flex-col h-full bg-[#0F0F0F] relative">
      {/* Map Area */}
      <div className="flex-1 relative bg-[#1A1A1A]">
        {/* Map Placeholder - In real app, would use Mapbox */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0F0F0F] via-[#1A1A1A] to-[#0F0F0F]">
          {/* Grid pattern overlay for map effect */}
          <div className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: `
                linear-gradient(#2A2A2A 1px, transparent 1px),
                linear-gradient(90deg, #2A2A2A 1px, transparent 1px)
              `,
              backgroundSize: '50px 50px'
            }}
          />

          {/* Partner Markers */}
          {nearbyPartners.map((partner, index) => (
            <motion.div
              key={partner.id}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className="absolute cursor-pointer active:scale-90 transition-transform"
              style={{
                left: `${20 + index * 15}%`,
                top: `${30 + (index % 3) * 20}%`
              }}
              onClick={() => setSelectedPartner(partner.id)}
            >
              <div className="relative flex flex-col items-center">
                {/* Pulse effect for available partners */}
                {partner.availableNow && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-14 h-14 bg-[#4FD1C5] rounded-full animate-pulse-ring" />
                )}
                
                {/* Pin Shape */}
                <div className="relative">
                  {/* Pin body - teardrop shape */}
                  <div className={`relative w-14 h-14 rounded-full border-3 ${
                    selectedPartner === partner.id 
                      ? 'border-[#E91E8C] ring-4 ring-[#E91E8C]/30' 
                      : 'border-white'
                  } overflow-hidden shadow-xl bg-white`}>
                    <img
                      src={partner.avatar}
                      alt={partner.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  {/* Pin point/tail */}
                  <div className={`absolute left-1/2 -translate-x-1/2 -bottom-2 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[12px] ${
                    selectedPartner === partner.id 
                      ? 'border-t-[#E91E8C]' 
                      : 'border-t-white'
                  } drop-shadow-lg`} />
                  
                  {/* Flag badge with wave animation */}
                  <motion.div
                    animate={{ 
                      rotate: [0, -10, 10, -10, 0],
                    }}
                    transition={{ 
                      duration: 2, 
                      repeat: Infinity,
                      repeatDelay: 3 
                    }}
                    className="absolute -top-1 -right-1 text-lg bg-white rounded-full w-6 h-6 flex items-center justify-center shadow-lg border-2 border-[#0F0F0F]"
                  >
                    {partner.teaching.flag}
                  </motion.div>

                  {/* Online indicator */}
                  {partner.isOnline && (
                    <div className="absolute bottom-0 right-0 w-4 h-4 bg-[#4FD1C5] border-2 border-[#0F0F0F] rounded-full z-10" />
                  )}
                </div>

                {/* Distance label */}
                <div className="mt-1 px-2 py-0.5 bg-white/95 backdrop-blur-sm rounded-full shadow-md">
                  <span className="text-xs font-semibold text-[#0F0F0F]">{partner.distance}km</span>
                </div>
              </div>
            </motion.div>
          ))}

          {/* Current location marker */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <div className="relative">
              {/* Radar Scan Animation - Multiple expanding rings */}
              <div className="absolute inset-0 flex items-center justify-center">
                {/* Ring 1 */}
                <motion.div
                  className="absolute w-32 h-32 border-2 border-[#1DB954]/40 rounded-full"
                  animate={{
                    scale: [1, 2.5],
                    opacity: [0.6, 0]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeOut"
                  }}
                />
                {/* Ring 2 */}
                <motion.div
                  className="absolute w-32 h-32 border-2 border-[#1DB954]/40 rounded-full"
                  animate={{
                    scale: [1, 2.5],
                    opacity: [0.6, 0]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeOut",
                    delay: 0.6
                  }}
                />
                {/* Ring 3 */}
                <motion.div
                  className="absolute w-32 h-32 border-2 border-[#1DB954]/40 rounded-full"
                  animate={{
                    scale: [1, 2.5],
                    opacity: [0.6, 0]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeOut",
                    delay: 1.2
                  }}
                />
                
                {/* Rotating Radar Beam */}
                <motion.div
                  className="absolute w-40 h-40"
                  animate={{
                    rotate: 360
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "linear"
                  }}
                >
                  <div 
                    className="absolute top-1/2 left-1/2 w-40 h-40 -translate-x-1/2 -translate-y-1/2"
                    style={{
                      background: 'conic-gradient(from 0deg, transparent 0deg, rgba(29, 185, 84, 0.3) 30deg, transparent 60deg)',
                    }}
                  />
                </motion.div>
              </div>

              {/* Center dot */}
              <div className="relative z-10 w-4 h-4 bg-[#5FB3B3] rounded-full shadow-lg" />
              <div className="absolute inset-0 bg-[#5FB3B3] rounded-full animate-pulse-ring z-0" />
            </div>
          </div>
        </div>

        {/* Top Bar */}
        <div className="absolute top-0 left-0 right-0 safe-top">
          <div className="flex items-center justify-between px-4 py-3">
            <button className="flex items-center gap-2 px-3 py-2 bg-white/95 backdrop-blur-sm rounded-full shadow-lg">
              <MapPin className="w-4 h-4 text-[#E91E8C]" />
              <span className="text-sm font-medium text-[#0F0F0F]">Den Haag</span>
            </button>
            
            <button 
              onClick={() => setShowFilters(true)}
              className="relative p-2 bg-white/95 backdrop-blur-sm rounded-full shadow-lg active:scale-95 transition-transform"
            >
              <SlidersHorizontal className="w-5 h-5 text-[#0F0F0F]" />
              {hasActiveFilters && (
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-primary rounded-full border-2 border-white flex items-center justify-center">
                  <span className="text-[10px] text-white font-bold">{
                    filters.languages.length + 
                    (filters.maxDistance < 50 ? 1 : 0) + 
                    (filters.availability !== 'all' ? 1 : 0) + 
                    (filters.minMatchScore > 0 ? 1 : 0) + 
                    (filters.meetingType !== 'all' ? 1 : 0)
                  }</span>
                </div>
              )}
            </button>
          </div>
        </div>

        {/* Map Controls */}
        <div className="absolute right-4 bottom-32 flex flex-col gap-2">
          <button className="w-10 h-10 bg-white/95 backdrop-blur-sm rounded-full shadow-lg flex items-center justify-center active:scale-95 transition-transform">
            <Plus className="w-5 h-5 text-[#0F0F0F]" />
          </button>
          <button className="w-10 h-10 bg-white/95 backdrop-blur-sm rounded-full shadow-lg flex items-center justify-center active:scale-95 transition-transform">
            <Minus className="w-5 h-5 text-[#0F0F0F]" />
          </button>
          <button className="w-10 h-10 bg-gradient-primary rounded-full shadow-lg flex items-center justify-center active:scale-95 transition-transform">
            <Locate className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>

      {/* Bottom Sheet */}
      <motion.div
        initial={false}
        animate={{ 
          height: isExpanded ? '65%' : selected ? '200px' : '140px'
        }}
        className="absolute bottom-0 left-0 right-0 bg-[#1A1A1A] rounded-t-3xl border-t border-[#2A2A2A] shadow-2xl safe-bottom"
      >
        {/* Handle */}
        <div className="flex justify-center pt-2 pb-3">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-12 h-1 bg-[#2A2A2A] rounded-full active:scale-95 transition-transform"
          />
        </div>

        {/* Content */}
        <div className="px-4 pb-4 overflow-y-auto" style={{ height: 'calc(100% - 32px)' }}>
          {selected ? (
            // Selected Partner Card
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[#0F0F0F] rounded-xl p-4 border border-[#2A2A2A] mb-4"
            >
              <div className="flex gap-3">
                <img
                  src={selected.avatar}
                  alt={selected.name}
                  className="w-16 h-16 rounded-full object-cover flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-white mb-1">
                    {selected.name}, {selected.age}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-[#9CA3AF] mb-2">
                    <span>{selected.distance}km away</span>
                    <span>•</span>
                    <span className="text-gradient-primary">{selected.matchScore}% match</span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => onPartnerClick(selected.id)}
                      className="flex-1 py-2 bg-gradient-primary text-white rounded-lg text-sm font-medium active:scale-95 transition-transform"
                    >
                      View Profile
                    </button>
                    <button className="px-4 py-2 border border-[#2A2A2A] rounded-lg text-white text-sm font-medium active:scale-95 transition-transform">
                      Chat
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            // Partner count header
            <div className="mb-4">
              <h2 className="font-semibold text-white">
                {nearbyPartners.length} partners nearby
              </h2>
              <p className="text-sm text-[#9CA3AF]">Tap markers to see details</p>
            </div>
          )}

          {/* Partner List */}
          {isExpanded && (
            <div className="space-y-2">
              {nearbyPartners.map((partner) => (
                <motion.div
                  key={partner.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-3 p-3 bg-[#0F0F0F] rounded-xl border border-[#2A2A2A] cursor-pointer active:scale-[0.98] transition-transform"
                  onClick={() => {
                    setSelectedPartner(partner.id);
                    setIsExpanded(false);
                  }}
                >
                  <div className="relative">
                    <img
                      src={partner.avatar}
                      alt={partner.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    {partner.isOnline && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-[#4FD1C5] border-2 border-[#0F0F0F] rounded-full" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-white truncate">
                      {partner.name}, {partner.age}
                    </h4>
                    <p className="text-xs text-[#9CA3AF]">
                      {partner.distance}km • {partner.matchScore}% match
                    </p>
                  </div>
                  <div className="text-sm text-gradient-primary font-medium">
                    {partner.teaching.flag}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </motion.div>

      {/* Filters Modal */}
      <AnimatePresence>
        {showFilters && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowFilters(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm z-40"
            />
            
            {/* Filter Sheet */}
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
                  <h3 className="text-xl font-semibold text-white">Filters</h3>
                  <button
                    onClick={() => setShowFilters(false)}
                    className="p-2 bg-[#2A2A2A] rounded-full active:scale-95 transition-transform"
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
              <div className="px-4 py-4 overflow-y-auto max-h-[calc(85vh-160px)]">
                {/* Language Filter */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-white">Languages</h4>
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
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                          filters.languages.includes(lang) 
                            ? 'bg-gradient-primary text-white shadow-lg' 
                            : 'bg-[#2A2A2A] text-[#9CA3AF] active:bg-[#3A3A3A]'
                        }`}
                      >
                        {filters.languages.includes(lang) && <Check className="w-3 h-3 inline mr-1" />}
                        {lang}
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Distance Filter */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-white">Max Distance</h4>
                    <span className="text-sm text-gradient-primary font-semibold">
                      {filters.maxDistance}km
                    </span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="50"
                    value={filters.maxDistance}
                    onChange={(e) => setFilters(prev => ({ ...prev, maxDistance: parseInt(e.target.value) }))}
                    className="w-full h-2 bg-[#2A2A2A] rounded-full appearance-none cursor-pointer"
                    style={{
                      background: `linear-gradient(to right, #1DB954 0%, #1DB954 ${(filters.maxDistance / 50) * 100}%, #2A2A2A ${(filters.maxDistance / 50) * 100}%, #2A2A2A 100%)`
                    }}
                  />
                  <div className="flex justify-between text-xs text-[#6B7280] mt-2">
                    <span>1km</span>
                    <span>25km</span>
                    <span>50km</span>
                  </div>
                </div>

                {/* Availability Filter */}
                <div className="mb-6">
                  <h4 className="font-medium text-white mb-3">Availability</h4>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { value: 'all' as const, label: 'All', icon: '🌍' },
                      { value: 'now' as const, label: 'Available Now', icon: '⚡' },
                      { value: 'week' as const, label: 'This Week', icon: '📅' }
                    ].map(option => (
                      <motion.button
                        key={option.value}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setFilters(prev => ({ ...prev, availability: option.value }))}
                        className={`p-3 rounded-xl text-sm font-medium transition-all ${
                          filters.availability === option.value
                            ? 'bg-gradient-primary text-white shadow-lg'
                            : 'bg-[#2A2A2A] text-[#9CA3AF]'
                        }`}
                      >
                        <div className="text-lg mb-1">{option.icon}</div>
                        {option.label}
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Match Score Filter */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-white">Minimum Match</h4>
                    <span className="text-sm text-gradient-primary font-semibold">
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
                    className="w-full h-2 bg-[#2A2A2A] rounded-full appearance-none cursor-pointer"
                    style={{
                      background: `linear-gradient(to right, #1DB954 0%, #1DB954 ${filters.minMatchScore}%, #2A2A2A ${filters.minMatchScore}%, #2A2A2A 100%)`
                    }}
                  />
                  <div className="flex justify-between text-xs text-[#6B7280] mt-2">
                    <span>Any</span>
                    <span>50%</span>
                    <span>Perfect</span>
                  </div>
                </div>

                {/* Meeting Type Filter */}
                <div className="mb-4">
                  <h4 className="font-medium text-white mb-3">Meeting Type</h4>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { value: 'all' as const, label: 'All Types', icon: '🌐' },
                      { value: 'in-person' as const, label: 'In-Person', icon: '☕' },
                      { value: 'virtual' as const, label: 'Virtual', icon: '💻' }
                    ].map(option => (
                      <motion.button
                        key={option.value}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setFilters(prev => ({ ...prev, meetingType: option.value }))}
                        className={`p-3 rounded-xl text-sm font-medium transition-all ${
                          filters.meetingType === option.value
                            ? 'bg-gradient-primary text-white shadow-lg'
                            : 'bg-[#2A2A2A] text-[#9CA3AF]'
                        }`}
                      >
                        <div className="text-lg mb-1">{option.icon}</div>
                        {option.label}
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
                  className={`flex-1 py-3 rounded-xl font-medium transition-all ${
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
                  className="flex-1 py-3 bg-gradient-primary text-white rounded-xl font-medium shadow-lg"
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