import { useState, useEffect } from 'react';
import { Bell, X, MessageCircle, Calendar, Heart, Eye } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { SessionCard } from '../components/SessionCard';
import { mockSessions, languageCategories } from '../data/mockSessions';
import { mockPartners } from '../data/mockData';
import { mockNotifications } from '../data/mockNotifications';
import { SessionDetailScreen } from './SessionDetailScreen';
import { LanguageSession } from '../data/mockSessions';
import { MatchFoundPopup } from '../components/MatchFoundPopup';

interface DiscoverScreenProps {
  onPartnerClick: (partnerId: string) => void;
  onNavigateToChat?: (partnerId: string) => void;
}

export function DiscoverScreen({ onPartnerClick, onNavigateToChat }: DiscoverScreenProps) {
  const [selectedLanguage, setSelectedLanguage] = useState('All');
  const [showNotifications, setShowNotifications] = useState(false);
  const [selectedSession, setSelectedSession] = useState<LanguageSession | null>(null);
  const [showMatchPopup, setShowMatchPopup] = useState(false);
  const [matchedPartner, setMatchedPartner] = useState<any>(null);
  
  const onlineNearby = mockPartners.filter(p => p.isOnline && p.distance < 2);
  
  // Count unread notifications
  const unreadCount = mockNotifications.filter(n => !n.isRead).length;

  // Current user data
  const currentUser = {
    name: 'Sarah Chen',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    languages: ['Spanish', 'English']
  };

  // Simulate finding a match nearby after 3 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      // Find a very close partner (distance < 0.5km)
      const veryClosePartner = mockPartners.find(p => p.distance < 0.5);
      if (veryClosePartner && !showMatchPopup) {
        setMatchedPartner(veryClosePartner);
        // setShowMatchPopup(true); // Disabled auto-trigger for demo
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  // Handle notification bell click - triggers match popup for demo
  const handleNotificationClick = () => {
    // Find a very close partner for demo
    const veryClosePartner = mockPartners.find(p => p.distance < 0.5);
    if (veryClosePartner) {
      setMatchedPartner(veryClosePartner);
      setShowMatchPopup(true);
    }
  };

  // Filter sessions by language
  const filteredSessions = selectedLanguage === 'All' 
    ? mockSessions 
    : mockSessions.filter(s => s.language === selectedLanguage);

  // Group sessions by language
  const sessionsByLanguage = filteredSessions.reduce((acc, session) => {
    if (!acc[session.language]) {
      acc[session.language] = [];
    }
    acc[session.language].push(session);
    return acc;
  }, {} as Record<string, typeof mockSessions>);

  // Get notification icon
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'match':
        return <Heart className="w-5 h-5 text-[#E91E8C]" />;
      case 'message':
        return <MessageCircle className="w-5 h-5 text-[#5FB3B3]" />;
      case 'session':
        return <Calendar className="w-5 h-5 text-[#1DB954]" />;
      case 'like':
        return <Heart className="w-5 h-5 text-[#E91E8C]" />;
      case 'view':
        return <Eye className="w-5 h-5 text-[#9CA3AF]" />;
      default:
        return <Bell className="w-5 h-5 text-white" />;
    }
  };

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: 'var(--color-background)' }}>
      {/* Header */}
      <div className="border-b safe-top" style={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)' }}>
        <div className="px-4 pt-4 pb-4">
          {/* Top Bar with Avatar and Notification */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <img
                src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150"
                alt="Profile"
                className="w-12 h-12 rounded-full object-cover border-2 border-[#1DB954]"
              />
              <div>
                <div className="text-sm text-[#9CA3AF]">Welcome 👋</div>
                <div className="font-semibold text-white">Sarah Chen</div>
              </div>
            </div>
            
            <button className="relative p-2 hover:bg-[#2A2A2A] rounded-full transition-colors" onClick={handleNotificationClick}>
              <Bell className="w-6 h-6 text-white" />
              {unreadCount > 0 && <div className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#1DB954] rounded-full" />}
            </button>
          </div>

          {/* Section Title */}
          <div className="mb-1">
            <p className="text-sm text-[#9CA3AF]">Language Exchange Sessions</p>
          </div>
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-white">Happening Today</h1>
            <div className="w-10 h-10 rounded-full bg-[#0F0F0F] flex items-center justify-center">
              <span className="text-sm font-semibold text-white">({filteredSessions.length})</span>
            </div>
          </div>

          {/* Language Filter Pills */}
          <div className="flex gap-2 overflow-x-auto no-scrollbar">
            {languageCategories.map((lang) => (
              <button
                key={lang}
                onClick={() => setSelectedLanguage(lang)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all active:scale-95 ${
                  selectedLanguage === lang
                    ? 'bg-white text-[#0F0F0F]'
                    : 'bg-[#0F0F0F] text-[#9CA3AF] border border-[#2A2A2A]'
                }`}
              >
                {lang}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto pb-20">
        {/* Online Nearby - Keep this section */}
        <div className="px-4 py-4 bg-[#1A1A1A] border-b border-[#2A2A2A]">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-white">
              Online Nearby <span className="text-[#9CA3AF]">({onlineNearby.length})</span>
            </h2>
          </div>
          
          <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
            {onlineNearby.map((partner, index) => (
              <motion.div
                key={partner.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className="flex-shrink-0 cursor-pointer active:scale-95 transition-transform"
                onClick={() => onPartnerClick(partner.id)}
              >
                <div className="relative">
                  <img
                    src={partner.avatar}
                    alt={partner.name}
                    className="w-16 h-16 rounded-full object-cover border-2 border-[#2A2A2A]"
                  />
                  <div className="absolute bottom-0 right-0 w-4 h-4 bg-[#1DB954] border-2 border-[#1A1A1A] rounded-full" />
                </div>
                <p className="text-xs text-white text-center mt-1 max-w-[64px] truncate">
                  {partner.name.split(' ')[0]}
                </p>
                <p className="text-xs text-[#9CA3AF] text-center">
                  {partner.distance}km
                </p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Sessions by Language */}
        <div className="px-4 py-4">
          {selectedLanguage === 'All' ? (
            // Show grouped by language
            Object.entries(sessionsByLanguage).map(([language, sessions]) => (
              <div key={language} className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-lg font-semibold text-white">
                    {language} Sessions
                  </h2>
                  <button className="text-sm text-[#1DB954] hover:text-[#1ED760] transition-colors">
                    See More
                  </button>
                </div>
                
                <div className="space-y-3">
                  {sessions.map((session, index) => (
                    <motion.div
                      key={session.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <SessionCard 
                        session={session} 
                        onClick={() => {
                          // Handle session click
                          setSelectedSession(session);
                        }}
                      />
                    </motion.div>
                  ))}
                </div>
              </div>
            ))
          ) : (
            // Show only selected language
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold text-white">
                  {selectedLanguage} Sessions
                </h2>
                <button className="text-sm text-[#1DB954] hover:text-[#1ED760] transition-colors">
                  See More
                </button>
              </div>
              
              <div className="space-y-3">
                {filteredSessions.map((session, index) => (
                  <motion.div
                    key={session.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <SessionCard 
                      session={session} 
                      onClick={() => {
                        // Handle session click
                        setSelectedSession(session);
                      }}
                    />
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Notifications Panel */}
      <AnimatePresence>
        {showNotifications && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowNotifications(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm z-40"
            />
            
            {/* Notification Sheet */}
            <motion.div
              initial={{ y: '-100%' }}
              animate={{ y: 0 }}
              exit={{ y: '-100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="absolute top-0 left-0 right-0 bg-[#1A1A1A] rounded-b-3xl shadow-2xl z-50 max-h-[80vh] overflow-hidden safe-top"
            >
              {/* Header */}
              <div className="sticky top-0 bg-[#1A1A1A] border-b border-[#2A2A2A] px-4 py-4 z-10">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-semibold text-white">Notifications</h3>
                    {unreadCount > 0 && (
                      <p className="text-sm text-[#1DB954]">{unreadCount} new</p>
                    )}
                  </div>
                  <button
                    onClick={() => setShowNotifications(false)}
                    className="p-2 bg-[#2A2A2A] rounded-full active:scale-95 transition-transform"
                  >
                    <X className="w-5 h-5 text-white" />
                  </button>
                </div>
              </div>

              {/* Scrollable Content */}
              <div className="overflow-y-auto max-h-[calc(80vh-80px)]">
                {mockNotifications.map((notification, index) => (
                  <motion.div
                    key={notification.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`px-4 py-4 border-b border-[#2A2A2A] cursor-pointer active:bg-[#0F0F0F] transition-colors ${
                      !notification.isRead ? 'bg-[#1DB954]/5' : ''
                    }`}
                  >
                    <div className="flex gap-3">
                      {/* Avatar or Icon */}
                      {notification.avatar ? (
                        <div className="relative flex-shrink-0">
                          <img
                            src={notification.avatar}
                            alt={notification.title}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                          <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-[#1A1A1A] rounded-full flex items-center justify-center">
                            {getNotificationIcon(notification.type)}
                          </div>
                        </div>
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-[#2A2A2A] flex items-center justify-center flex-shrink-0">
                          {getNotificationIcon(notification.type)}
                        </div>
                      )}

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <p className="font-medium text-white text-sm">{notification.title}</p>
                          {!notification.isRead && (
                            <div className="w-2 h-2 bg-[#1DB954] rounded-full flex-shrink-0 mt-1" />
                          )}
                        </div>
                        <p className="text-sm text-[#9CA3AF] mb-1">{notification.message}</p>
                        <p className="text-xs text-[#6B7280]">{notification.timestamp}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Footer */}
              <div className="sticky bottom-0 bg-[#1A1A1A] border-t border-[#2A2A2A] px-4 py-3">
                <button className="w-full py-2 text-sm text-[#1DB954] font-medium hover:bg-[#2A2A2A] rounded-lg transition-colors">
                  Mark all as read
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Session Detail Screen */}
      {selectedSession && (
        <SessionDetailScreen
          session={selectedSession}
          onClose={() => setSelectedSession(null)}
        />
      )}

      {/* Match Found Popup */}
      {showMatchPopup && (
        <MatchFoundPopup
          partner={matchedPartner}
          onClose={() => setShowMatchPopup(false)}
          onNavigateToChat={onNavigateToChat}
        />
      )}
    </div>
  );
}