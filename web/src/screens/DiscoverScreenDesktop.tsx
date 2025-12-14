import { useState, useMemo } from 'react';
import { Bell, Search, MapPin, Calendar, TrendingUp, Users, Sparkles, Filter, ChevronRight, Star, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';
import { SessionCard } from '../components/SessionCard';
import { MapView } from '../components/MapView';
import { useAuth } from '../providers/AuthProvider';
import { useDiscoverFeed } from '../hooks/useDiscover';
import { useSessions } from '../hooks/useSessions';
import { useConversations } from '../hooks/useMessages';
import { useProfile } from '../hooks/useProfile';

interface DiscoverScreenDesktopProps {
  onPartnerClick: (partnerId: string) => void;
  onNavigateToChat?: (partnerId: string) => void;
  onSessionClick: (session: any) => void;
}

// Language categories - can be extracted from user's languages or use common ones
const languageCategories = ['All', 'Spanish', 'French', 'German', 'Italian', 'Portuguese', 'Japanese', 'Korean', 'Chinese', 'Arabic', 'Hindi', 'Russian'];

export function DiscoverScreenDesktop({ onPartnerClick, onNavigateToChat, onSessionClick }: DiscoverScreenDesktopProps) {
  const { user } = useAuth();
  const { data: profile } = useProfile();
  const [selectedLanguage, setSelectedLanguage] = useState('All');
  const [showNotifications, setShowNotifications] = useState(false);
  const [viewMode, setViewMode] = useState<'map' | 'grid'>('map');
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch data from backend
  const { data: discoverFeed, isLoading: discoverLoading } = useDiscoverFeed({
    language: selectedLanguage !== 'All' ? selectedLanguage : undefined,
    availabilityOnly: false,
    limit: 50,
  });

  const { data: sessionsData, isLoading: sessionsLoading } = useSessions({
    language: selectedLanguage !== 'All' ? selectedLanguage : undefined,
  }, !!user?.id);

  const { data: conversations = [], isLoading: conversationsLoading } = useConversations();

  // Get unread messages count
  const unreadCount = useMemo(() => {
    return conversations.filter((conv: any) => conv.unreadCount > 0).length;
  }, [conversations]);

  // Get recommended/active users from discover feed
  const allPartners = useMemo(() => {
    const users = discoverFeed?.recommendedUsers || [];
    const active = discoverFeed?.activeUsers || [];
    const newUsers = discoverFeed?.newUsers || [];
    
    // Combine and deduplicate by id
    const userMap = new Map();
    [...users, ...active, ...newUsers].forEach((user: any) => {
      if (!userMap.has(user.id)) {
        userMap.set(user.id, user);
      }
    });
    
    return Array.from(userMap.values());
  }, [discoverFeed]);

  // Filter partners by search query
  const filteredPartners = useMemo(() => {
    if (!searchQuery.trim()) return allPartners;
    
    const query = searchQuery.toLowerCase();
    return allPartners.filter((partner: any) => {
      const name = partner.display_name?.toLowerCase() || '';
      const languages = partner.languages?.map((l: any) => l.language?.toLowerCase()).join(' ') || '';
      return name.includes(query) || languages.includes(query);
    });
  }, [allPartners, searchQuery]);

  // Get online nearby partners (within 2km)
  const onlineNearby = useMemo(() => {
    return filteredPartners.filter((partner: any) => {
      const distance = partner.distance_km || partner.distance || 999;
      return (partner.is_online || partner.availability_status === 'available') && distance < 2;
    });
  }, [filteredPartners]);

  // Get sessions from discover feed or sessions hook
  const sessions = useMemo(() => {
    const discoverSessions = discoverFeed?.sessions || [];
    const hookSessions = sessionsData?.sessions || sessionsData || [];
    return discoverSessions.length > 0 ? discoverSessions : hookSessions;
  }, [discoverFeed, sessionsData]);

  // Filter sessions by selected language
  const filteredSessions = useMemo(() => {
    if (selectedLanguage === 'All') return sessions;
    return sessions.filter((session: any) => {
      return session.language?.toLowerCase() === selectedLanguage.toLowerCase() ||
             session.languages?.some((l: any) => l.toLowerCase() === selectedLanguage.toLowerCase());
    });
  }, [sessions, selectedLanguage]);

  // Convert partners for map display
  const mapPartners = useMemo(() => {
    return filteredPartners.slice(0, 15).map((partner: any) => {
      const teachingLang = partner.languages?.find((l: any) => l.role === 'teaching');
      const learningLang = partner.languages?.find((l: any) => l.role === 'learning');
      
      return {
        id: partner.id,
        name: partner.display_name || 'User',
        avatar: partner.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(partner.display_name || 'User')}&background=1DB954&color=fff`,
        distance: partner.distance_km || partner.distance || 0,
        latitude: partner.lat || 51.5074 + (Math.random() - 0.5) * 0.08,
        longitude: partner.lng || -0.1278 + (Math.random() - 0.5) * 0.08,
        isOnline: partner.is_online || partner.availability_status === 'available',
        languages: [
          teachingLang?.language,
          learningLang?.language
        ].filter(Boolean),
        rating: partner.matchScore || 4.8,
      };
    });
  }, [filteredPartners]);

  // Quick stats
  const stats = useMemo(() => [
    { icon: Users, label: 'Online Nearby', value: onlineNearby.length, color: '#1DB954' },
    { icon: Calendar, label: "Today's Events", value: filteredSessions.length, color: '#5FB3B3' },
    { icon: TrendingUp, label: 'Active Now', value: allPartners.length, color: '#F59E0B' },
    { icon: Sparkles, label: 'New Matches', value: discoverFeed?.newUsers?.length || 0, color: '#E91E8C' },
  ], [onlineNearby.length, filteredSessions.length, allPartners.length, discoverFeed]);

  const isLoading = discoverLoading || sessionsLoading || conversationsLoading;

  // Loading state
  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center" style={{ backgroundColor: 'var(--color-background)' }}>
        <Loader2 className="w-8 h-8 animate-spin text-[#1DB954]" />
        <p className="mt-4 text-[#9CA3AF]">Loading discover feed...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-hidden" style={{ backgroundColor: 'var(--color-background)' }}>
      {/* Top Header Bar */}
      <div className="border-b px-6 py-4" style={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)' }}>
        <div className="flex items-center justify-between">
          {/* Left: Welcome & Search */}
          <div className="flex-1 max-w-2xl">
            <div className="flex items-center gap-4 mb-3">
              <div>
                <h1 className="text-2xl mb-1" style={{ color: 'var(--color-text)' }}>
                  Discover Language Partners
                </h1>
                <p className="text-sm text-[#9CA3AF]">Find people nearby to practice languages with</p>
              </div>
            </div>
            
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9CA3AF]" />
              <input
                type="text"
                placeholder="Search by name, language, or interest..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl placeholder-[#9CA3AF] focus:outline-none transition-colors"
                style={{ 
                  backgroundColor: 'var(--color-background)',
                  borderWidth: '1px',
                  borderColor: 'var(--color-border)',
                  color: 'var(--color-text)'
                }}
              />
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-3">
            {/* View Toggle */}
            <div className="flex gap-1 p-1 rounded-lg" style={{ backgroundColor: 'var(--color-background)' }}>
              <button
                onClick={() => setViewMode('map')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  viewMode === 'map' ? 'bg-gradient-primary text-white' : 'text-[#9CA3AF]'
                }`}
              >
                <MapPin className="w-4 h-4 inline mr-1" />
                Map
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  viewMode === 'grid' ? 'bg-gradient-primary text-white' : 'text-[#9CA3AF]'
                }`}
              >
                Grid
              </button>
            </div>

            {/* Filter Button */}
            <button className="px-4 py-2 rounded-xl transition-transform active:scale-95 flex items-center gap-2" style={{ backgroundColor: 'var(--color-background)', color: 'var(--color-text)' }}>
              <Filter className="w-4 h-4" />
              <span className="text-sm font-medium">Filters</span>
            </button>

            {/* Notifications */}
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative w-10 h-10 rounded-xl flex items-center justify-center transition-transform active:scale-95"
              style={{ backgroundColor: 'var(--color-background)' }}
            >
              <Bell className="w-5 h-5" style={{ color: 'var(--color-text)' }} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#EF4444] text-white text-xs font-semibold rounded-full flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex gap-6 p-6 overflow-hidden">
        {/* Left Column - Stats & Sessions */}
        <div className="w-96 flex flex-col gap-6 overflow-y-auto">
          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 gap-3">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="rounded-xl p-4 border cursor-pointer hover:scale-105 transition-transform"
                  style={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)' }}
                >
                  <div className="w-10 h-10 rounded-lg mb-3 flex items-center justify-center" style={{ backgroundColor: `${stat.color}20` }}>
                    <Icon className="w-5 h-5" style={{ color: stat.color }} />
                  </div>
                  <div className="text-2xl mb-1" style={{ color: 'var(--color-text)' }}>{stat.value}</div>
                  <div className="text-xs text-[#9CA3AF]">{stat.label}</div>
                </motion.div>
              );
            })}
          </div>

          {/* Language Categories */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold" style={{ color: 'var(--color-text)' }}>Languages</h3>
              <button className="text-sm text-[#1DB954] hover:underline">View All</button>
            </div>
            <div className="flex flex-wrap gap-2">
              {languageCategories.slice(0, 9).map((lang) => (
                <button
                  key={lang}
                  onClick={() => setSelectedLanguage(lang)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all active:scale-95 ${
                    selectedLanguage === lang
                      ? 'bg-gradient-primary text-white'
                      : 'text-[#9CA3AF] border'
                  }`}
                  style={selectedLanguage !== lang ? { 
                    backgroundColor: 'var(--color-background)',
                    borderColor: 'var(--color-border)'
                  } : {}}
                >
                  {lang}
                </button>
              ))}
            </div>
          </div>

          {/* Happening Today Section */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold" style={{ color: 'var(--color-text)' }}>
                Happening Today
                <span className="ml-2 text-sm text-[#9CA3AF]">({filteredSessions.length})</span>
              </h3>
            </div>
            <div className="space-y-3">
              {filteredSessions.length > 0 ? (
                <>
                  {filteredSessions.slice(0, 6).map((session: any, index: number) => (
                    <motion.div
                      key={session.id || index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <SessionCard session={session} onClick={() => onSessionClick(session)} />
                    </motion.div>
                  ))}
                  {filteredSessions.length > 6 && (
                    <button className="w-full py-3 rounded-xl text-sm font-medium transition-colors hover:bg-opacity-80" style={{ backgroundColor: 'var(--color-card)', color: 'var(--color-text)' }}>
                      View All {filteredSessions.length} Events
                      <ChevronRight className="w-4 h-4 inline ml-1" />
                    </button>
                  )}
                </>
              ) : (
                <div className="text-center py-8 text-[#9CA3AF]">
                  <p>No sessions scheduled for today</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Map/Grid View */}
        <div className="flex-1 flex flex-col rounded-2xl overflow-hidden" style={{ backgroundColor: 'var(--color-card)' }}>
          {viewMode === 'map' ? (
            <>
              {/* Map Header */}
              <div className="px-6 py-4 border-b" style={{ borderColor: 'var(--color-border)' }}>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold mb-1" style={{ color: 'var(--color-text)' }}>Partners Near You</h3>
                    <p className="text-sm text-[#9CA3AF]">{mapPartners.length} people online within 5km</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-[#9CA3AF]">Radius:</span>
                    <select className="px-3 py-1.5 rounded-lg text-sm font-medium" style={{ backgroundColor: 'var(--color-background)', color: 'var(--color-text)', borderWidth: '1px', borderColor: 'var(--color-border)' }}>
                      <option>5 km</option>
                      <option>10 km</option>
                      <option>25 km</option>
                      <option>50 km</option>
                    </select>
                  </div>
                </div>
              </div>
              
              {/* Map */}
              <div className="flex-1">
                <MapView 
                  partners={mapPartners}
                  onPartnerClick={onPartnerClick}
                  centerLat={mapPartners[0]?.latitude || 51.5074}
                  centerLng={mapPartners[0]?.longitude || -0.1278}
                />
              </div>
            </>
          ) : (
            <>
              {/* Grid Header */}
              <div className="px-6 py-4 border-b" style={{ borderColor: 'var(--color-border)' }}>
                <h3 className="font-semibold" style={{ color: 'var(--color-text)' }}>All Partners ({filteredPartners.length})</h3>
              </div>
              
              {/* Grid */}
              <div className="flex-1 overflow-y-auto p-6">
                {filteredPartners.length > 0 ? (
                  <div className="grid grid-cols-2 gap-4">
                    {filteredPartners.slice(0, 12).map((partner: any, index: number) => {
                      const teachingLang = partner.languages?.find((l: any) => l.role === 'teaching');
                      const learningLang = partner.languages?.find((l: any) => l.role === 'learning');
                      
                      return (
                        <motion.div
                          key={partner.id}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: index * 0.05 }}
                          onClick={() => onPartnerClick(partner.id)}
                          className="rounded-xl p-4 border cursor-pointer hover:scale-105 transition-all"
                          style={{ backgroundColor: 'var(--color-background)', borderColor: 'var(--color-border)' }}
                        >
                          <div className="relative mb-3">
                            <img 
                              src={partner.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(partner.display_name || 'User')}&background=1DB954&color=fff`}
                              alt={partner.display_name || 'User'}
                              className="w-full aspect-square object-cover rounded-xl"
                            />
                            {(partner.is_online || partner.availability_status === 'available') && (
                              <div className="absolute top-2 right-2 px-2 py-1 rounded-full bg-[#10B981] text-white text-xs font-semibold">
                                Online
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold text-sm" style={{ color: 'var(--color-text)' }}>
                              {partner.display_name || 'User'}
                            </h4>
                            {partner.matchScore && (
                              <div className="flex items-center gap-0.5">
                                <Star className="w-3 h-3 fill-[#F59E0B] text-[#F59E0B]" />
                                <span className="text-xs" style={{ color: 'var(--color-text)' }}>{partner.matchScore.toFixed(1)}</span>
                              </div>
                            )}
                          </div>
                          {(partner.distance_km || partner.distance) && (
                            <p className="text-xs text-[#9CA3AF] mb-2">
                              <MapPin className="w-3 h-3 inline mr-1" />
                              {(partner.distance_km || partner.distance).toFixed(1)}km away
                            </p>
                          )}
                          <div className="flex gap-1">
                            {[teachingLang?.language, learningLang?.language].filter(Boolean).slice(0, 2).map(lang => (
                              <span key={lang} className="px-2 py-0.5 rounded-full text-xs font-medium bg-gradient-primary text-white">
                                {lang}
                              </span>
                            ))}
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12 text-[#9CA3AF]">
                    <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No partners found</p>
                    {searchQuery && (
                      <p className="text-sm mt-2">Try adjusting your search or filters</p>
                    )}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
