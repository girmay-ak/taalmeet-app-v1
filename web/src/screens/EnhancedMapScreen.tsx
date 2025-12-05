import { useState, useEffect } from 'react';
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
  ChevronDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { mockPartners } from '../data/mockData';

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
    if (searchQuery && !partner.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const nearbyPartners = filteredPartners.filter(p => p.distance < (50 * zoomLevel / 100));
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

  // Stats
  const stats = {
    total: nearbyPartners.length,
    online: nearbyPartners.filter(p => p.isOnline).length,
    availableNow: nearbyPartners.filter(p => p.availableNow).length,
    highMatch: nearbyPartners.filter(p => p.matchScore >= 80).length
  };

  // Cluster partners by proximity for cluster view
  const clusters = mapStyle === 'cluster' ? generateClusters(nearbyPartners) : [];

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

      {/* Header */}
      <div className="relative z-10 safe-top">
        <div className="px-4 pt-3 pb-4">
          {/* Top row - Back button, Location, Layer selector */}
          <div className="flex items-center justify-between mb-3">
            <button 
              onClick={onBack}
              className="p-2.5 bg-white/10 backdrop-blur-md rounded-full border border-white/20 shadow-lg active:scale-95 transition-transform"
            >
              <X className="w-5 h-5 text-white" />
            </button>
            
            <motion.button 
              className="flex items-center gap-2 px-4 py-2.5 bg-white/10 backdrop-blur-md rounded-full border border-white/20 shadow-lg"
              whileTap={{ scale: 0.95 }}
            >
              <MapPin className="w-4 h-4 text-[#1ED760]" />
              <span className="font-medium text-white">Den Haag</span>
              <ChevronDown className="w-4 h-4 text-white/60" />
            </motion.button>

            <button 
              onClick={() => setShowLayerMenu(!showLayerMenu)}
              className="p-2.5 bg-white/10 backdrop-blur-md rounded-full border border-white/20 shadow-lg active:scale-95 transition-transform relative"
            >
              <Layers className="w-5 h-5 text-white" />
              {mapStyle !== 'standard' && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-[#1DB954] to-[#1ED760] rounded-full border-2 border-[#0F0F0F]" />
              )}
            </button>
          </div>

          {/* Search bar */}
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative mb-3"
          >
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
            <input
              type="text"
              placeholder="Search partners..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-12 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[#1DB954]/50"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-1 bg-white/20 rounded-full"
              >
                <X className="w-4 h-4 text-white" />
              </button>
            )}
          </motion.div>

          {/* Stats row */}
          <div className="grid grid-cols-4 gap-2">
            <motion.div 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-white/10 backdrop-blur-md rounded-xl p-2.5 border border-white/20"
            >
              <div className="text-xs text-white/60 mb-0.5">Total</div>
              <div className="text-lg font-bold text-white">{stats.total}</div>
            </motion.div>
            <motion.div 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-gradient-to-br from-[#1DB954]/20 to-[#1ED760]/20 backdrop-blur-md rounded-xl p-2.5 border border-[#1DB954]/30"
            >
              <div className="text-xs text-[#1ED760] mb-0.5">Online</div>
              <div className="text-lg font-bold text-white">{stats.online}</div>
            </motion.div>
            <motion.div 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-gradient-to-br from-[#5FB3B3]/20 to-[#4FD1C5]/20 backdrop-blur-md rounded-xl p-2.5 border border-[#5FB3B3]/30"
            >
              <div className="text-xs text-[#4FD1C5] mb-0.5">Now</div>
              <div className="text-lg font-bold text-white">{stats.availableNow}</div>
            </motion.div>
            <motion.div 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 backdrop-blur-md rounded-xl p-2.5 border border-yellow-500/30"
            >
              <div className="text-xs text-yellow-400 mb-0.5">High</div>
              <div className="text-lg font-bold text-white">{stats.highMatch}</div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Map Area */}
      <div className="flex-1 relative">
        {/* Map Background with patterns */}
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
              {nearbyPartners.map((partner, idx) => (
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
                    background: partner.matchScore > 80 
                      ? 'radial-gradient(circle, rgba(29, 185, 84, 0.6) 0%, transparent 70%)'
                      : 'radial-gradient(circle, rgba(95, 179, 179, 0.4) 0%, transparent 70%)'
                  }}
                />
              ))}
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
                nearbyPartners.map((partner, index) => (
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

          {/* Current location with advanced radar */}
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
              onClick={() => setZoomLevel(Math.min(100, zoomLevel + 10))}
              className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center"
            >
              <Plus className="w-5 h-5 text-white" />
            </motion.button>
            <div className="w-10 h-px bg-white/20" />
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setZoomLevel(Math.max(20, zoomLevel - 10))}
              className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center"
            >
              <Minus className="w-5 h-5 text-white" />
            </motion.button>
          </div>

          {/* Re-center */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            className="w-12 h-12 bg-gradient-to-r from-[#1DB954] to-[#1ED760] rounded-full shadow-lg shadow-[#1DB954]/30 flex items-center justify-center"
          >
            <Locate className="w-5 h-5 text-white" />
          </motion.button>
        </div>

        {/* Selected partner card */}
        <AnimatePresence>
          {selected && viewMode === 'markers' && (
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="absolute bottom-4 left-4 right-4 z-30"
            >
              <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-4 border border-white/20 shadow-2xl">
                <button
                  onClick={() => setSelectedPartner(null)}
                  className="absolute -top-2 -right-2 w-8 h-8 bg-[#2A2A2A] rounded-full flex items-center justify-center border-2 border-[#0F0F0F] shadow-lg"
                >
                  <X className="w-4 h-4 text-white" />
                </button>

                <div className="flex gap-3">
                  <div className="relative flex-shrink-0">
                    <img
                      src={selected.avatar}
                      alt={selected.name}
                      className="w-20 h-20 rounded-2xl object-cover"
                    />
                    {selected.isOnline && (
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-gradient-to-r from-[#1DB954] to-[#1ED760] border-3 border-[#0F0F0F] rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-bold text-white text-lg">
                          {selected.name}, {selected.age}
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-white/60">
                          <MapPin className="w-3.5 h-3.5" />
                          <span>{selected.distance}km away</span>
                          <span>•</span>
                          <span className="text-[#1ED760] font-semibold">{selected.matchScore}% match</span>
                        </div>
                      </div>
                      <div className="text-2xl">{selected.teaching.flag}</div>
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
              </div>
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
                        src={partner.avatar}
                        alt={partner.name}
                        className="w-14 h-14 rounded-xl object-cover"
                      />
                      {partner.isOnline && (
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-gradient-to-r from-[#1DB954] to-[#1ED760] border-2 border-[#0F0F0F] rounded-full" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-white truncate">
                        {partner.name}, {partner.age}
                      </h4>
                      <div className="flex items-center gap-2 text-xs text-white/60">
                        <span>{partner.distance}km</span>
                        <span>•</span>
                        <span className="text-[#1ED760]">{partner.matchScore}%</span>
                        {partner.availableNow && (
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
                      <div className="text-xl">{partner.teaching.flag}</div>
                      {partner.matchScore >= 80 && (
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
  return (
    <div className="relative flex flex-col items-center">
      {/* Pulse effect for available partners */}
      {partner.availableNow && (
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
            src={partner.avatar}
            alt={partner.name}
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
          {partner.teaching.flag}
        </motion.div>

        {/* Online indicator */}
        {partner.isOnline && (
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
        {partner.matchScore >= 90 && (
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
        <span className="text-xs font-bold text-[#0F0F0F]">{partner.distance}km</span>
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
