import { useState, useEffect } from 'react';
import { Bell, Search, MapPin, Calendar, TrendingUp, Users, Sparkles, Filter, ChevronRight, Star } from 'lucide-react';
import { motion } from 'motion/react';
import { SessionCard } from '../components/SessionCard';
import { mockSessions, languageCategories } from '../data/mockSessions';
import { mockPartners } from '../data/mockData';
import { mockNotifications } from '../data/mockNotifications';
import { MapView } from '../components/MapView';
import { LanguageSession } from '../data/mockSessions';

interface DiscoverScreenDesktopProps {
  onPartnerClick: (partnerId: string) => void;
  onNavigateToChat?: (partnerId: string) => void;
  onSessionClick: (session: LanguageSession) => void;
}

export function DiscoverScreenDesktop({ onPartnerClick, onNavigateToChat, onSessionClick }: DiscoverScreenDesktopProps) {
  const [selectedLanguage, setSelectedLanguage] = useState('All');
  const [showNotifications, setShowNotifications] = useState(false);
  const [viewMode, setViewMode] = useState<'map' | 'grid'>('map');
  const [searchQuery, setSearchQuery] = useState('');

  const onlineNearby = mockPartners.filter(p => p.isOnline && p.distance < 2);
  const unreadCount = mockNotifications.filter(n => !n.isRead).length;

  // Filter sessions
  const filteredSessions = selectedLanguage === 'All'
    ? mockSessions
    : mockSessions.filter(s => s.language === selectedLanguage);

  // Quick stats
  const stats = [
    { icon: Users, label: 'Online Nearby', value: onlineNearby.length, color: '#1DB954' },
    { icon: Calendar, label: 'Today\'s Events', value: filteredSessions.length, color: '#5FB3B3' },
    { icon: TrendingUp, label: 'Active Now', value: '2.4K', color: '#F59E0B' },
    { icon: Sparkles, label: 'New Matches', value: 12, color: '#E91E8C' },
  ];

  // Convert partners for map
  const mapPartners = mockPartners.slice(0, 15).map((partner, index) => ({
    id: partner.id,
    name: partner.name,
    avatar: partner.avatar,
    distance: partner.distance,
    latitude: 51.5074 + (Math.random() - 0.5) * 0.08,
    longitude: -0.1278 + (Math.random() - 0.5) * 0.08,
    isOnline: partner.isOnline,
    languages: typeof partner.languages === 'string' 
      ? partner.languages.split(' • ') 
      : [partner.languages.native, partner.languages.learning].filter(Boolean),
    rating: partner.rating,
  }));

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
              {filteredSessions.slice(0, 6).map((session, index) => (
                <motion.div
                  key={session.id}
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
                  centerLat={51.5074}
                  centerLng={-0.1278}
                />
              </div>
            </>
          ) : (
            <>
              {/* Grid Header */}
              <div className="px-6 py-4 border-b" style={{ borderColor: 'var(--color-border)' }}>
                <h3 className="font-semibold" style={{ color: 'var(--color-text)' }}>All Partners</h3>
              </div>
              
              {/* Grid */}
              <div className="flex-1 overflow-y-auto p-6">
                <div className="grid grid-cols-2 gap-4">
                  {mockPartners.slice(0, 12).map((partner, index) => (
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
                          src={partner.avatar}
                          alt={partner.name}
                          className="w-full aspect-square object-cover rounded-xl"
                        />
                        {partner.isOnline && (
                          <div className="absolute top-2 right-2 px-2 py-1 rounded-full bg-[#10B981] text-white text-xs font-semibold">
                            Online
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-sm" style={{ color: 'var(--color-text)' }}>{partner.name}</h4>
                        <div className="flex items-center gap-0.5">
                          <Star className="w-3 h-3 fill-[#F59E0B] text-[#F59E0B]" />
                          <span className="text-xs" style={{ color: 'var(--color-text)' }}>{partner.rating}</span>
                        </div>
                      </div>
                      <p className="text-xs text-[#9CA3AF] mb-2">
                        <MapPin className="w-3 h-3 inline mr-1" />
                        {partner.distance}km away
                      </p>
                      <div className="flex gap-1">
                        {(typeof partner.languages === 'string' 
                          ? partner.languages.split(' • ') 
                          : [partner.languages.native, partner.languages.learning].filter(Boolean)
                        ).slice(0, 2).map(lang => (
                          <span key={lang} className="px-2 py-0.5 rounded-full text-xs font-medium bg-gradient-primary text-white">
                            {lang}
                          </span>
                        ))}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}