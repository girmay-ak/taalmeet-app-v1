import { useState, useMemo } from 'react';
import { Bell, X, MessageCircle, Calendar, Heart, Eye, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { SessionCard } from '../components/SessionCard';
import { SessionDetailScreen } from './SessionDetailScreen';
import { MatchFoundPopup } from '../components/MatchFoundPopup';
import { useAuth } from '../providers/AuthProvider';
import { useProfile } from '../hooks/useProfile';
import { useDiscoverFeed } from '../hooks/useDiscover';
import { useSessions } from '../hooks/useSessions';
import { useConversations } from '../hooks/useMessages';

interface DiscoverScreenProps {
  onPartnerClick: (partnerId: string) => void;
  onNavigateToChat?: (partnerId: string) => void;
}

// Language categories - can be extracted from user's languages or use common ones
const languageCategories = ['All', 'Spanish', 'French', 'German', 'Italian', 'Portuguese', 'Japanese', 'Korean', 'Chinese', 'Arabic', 'Hindi', 'Russian'];

export function DiscoverScreen({ onPartnerClick, onNavigateToChat }: DiscoverScreenProps) {
  const { user } = useAuth();
  const { data: profile } = useProfile();
  const [selectedLanguage, setSelectedLanguage] = useState('All');
  const [showNotifications, setShowNotifications] = useState(false);
  const [selectedSession, setSelectedSession] = useState<any>(null);
  const [showMatchPopup, setShowMatchPopup] = useState(false);
  const [matchedPartner, setMatchedPartner] = useState<any>(null);

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

  // Get online nearby partners (within 2km)
  const onlineNearby = useMemo(() => {
    return allPartners.filter((partner: any) => {
      const distance = partner.distance_km || partner.distance || 999;
      return (partner.is_online || partner.availability_status === 'available') && distance < 2;
    });
  }, [allPartners]);

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

  // Transform sessions to match SessionCard format
  const transformedSessions = useMemo(() => {
    return filteredSessions.map((session: any) => {
      const participantCount = session.participantCount || session.participants?.length || 0;
      const maxAttendees = session.max_participants || session.maxParticipants || 10;
      const joinedPercentage = Math.round((participantCount / maxAttendees) * 100);

      // Get attendee avatars
      const attendeeAvatars = session.participants?.map((p: any) => 
        p.avatar_url || p.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(p.display_name || 'User')}&background=1DB954&color=fff`
      ) || [];

      return {
        id: session.id,
        title: session.title || session.name || 'Language Exchange Session',
        description: session.description || '',
        language: session.language || session.languages?.[0] || 'Unknown',
        languageFlag: session.languageFlag || '🌐',
        level: session.level || 'all',
        date: session.start_time 
          ? new Date(session.start_time).toLocaleDateString()
          : session.date || 'TBD',
        time: session.start_time
          ? new Date(session.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          : session.time || 'TBD',
        duration: session.duration || 60,
        attendees: attendeeAvatars,
        totalAttendees: participantCount,
        maxAttendees: maxAttendees,
        joinedPercentage: joinedPercentage,
        type: session.location_type === 'online' ? 'online' : 'coffee',
        isVirtual: session.location_type === 'online',
        meetingLink: session.location_type === 'online' ? session.location_details : undefined,
        location: session.location_type === 'in-person' ? session.location_details : undefined,
        organizer: {
          id: session.host?.id || session.host_user_id,
          type: 'user' as const,
          name: session.host?.display_name || session.host_profile?.display_name || 'Host',
          avatar: session.host?.avatar_url || session.host_profile?.avatar_url || `https://ui-avatars.com/api/?name=Host&background=1DB954&color=fff`,
        },
      };
    });
  }, [filteredSessions]);

  // Group sessions by language
  const sessionsByLanguage = useMemo(() => {
    return transformedSessions.reduce((acc, session) => {
      if (!acc[session.language]) {
        acc[session.language] = [];
      }
      acc[session.language].push(session);
      return acc;
    }, {} as Record<string, typeof transformedSessions>);
  }, [transformedSessions]);

  // Current user data
  const currentUser = useMemo(() => {
    if (!profile) return null;
    return {
      name: profile.displayName || 'User',
      avatar: profile.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.displayName || 'User')}&background=1DB954&color=fff`,
      languages: profile.languages?.learning?.map((l: any) => l.language) || [],
    };
  }, [profile]);

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
                src={currentUser?.avatar || 'https://ui-avatars.com/api/?name=User&background=1DB954&color=fff'}
                alt="Profile"
                className="w-12 h-12 rounded-full object-cover border-2 border-[#1DB954]"
              />
              <div>
                <div className="text-sm text-[#9CA3AF]">Welcome 👋</div>
                <div className="font-semibold text-white">{currentUser?.name || 'User'}</div>
              </div>
            </div>
            
            <button 
              className="relative p-2 hover:bg-[#2A2A2A] rounded-full transition-colors" 
              onClick={() => setShowNotifications(!showNotifications)}
            >
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
              <span className="text-sm font-semibold text-white">({transformedSessions.length})</span>
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
        {/* Online Nearby */}
        <div className="px-4 py-4 bg-[#1A1A1A] border-b border-[#2A2A2A]">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-white">
              Online Nearby <span className="text-[#9CA3AF]">({onlineNearby.length})</span>
            </h2>
          </div>
          
          {onlineNearby.length > 0 ? (
            <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
              {onlineNearby.map((partner: any, index: number) => (
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
                      src={partner.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(partner.display_name || 'User')}&background=1DB954&color=fff`}
                      alt={partner.display_name || 'User'}
                      className="w-16 h-16 rounded-full object-cover border-2 border-[#2A2A2A]"
                    />
                    <div className="absolute bottom-0 right-0 w-4 h-4 bg-[#1DB954] border-2 border-[#1A1A1A] rounded-full" />
                  </div>
                  <p className="text-xs text-white text-center mt-1 max-w-[64px] truncate">
                    {partner.display_name?.split(' ')[0] || 'User'}
                  </p>
                  {(partner.distance_km || partner.distance) && (
                    <p className="text-xs text-[#9CA3AF] text-center">
                      {(partner.distance_km || partner.distance).toFixed(1)}km
                    </p>
                  )}
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4 text-[#9CA3AF]">
              <p className="text-sm">No partners online nearby</p>
            </div>
          )}
        </div>

        {/* Sessions by Language */}
        <div className="px-4 py-4">
          {selectedLanguage === 'All' ? (
            // Show grouped by language
            Object.entries(sessionsByLanguage).length > 0 ? (
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
                            setSelectedSession(session);
                          }}
                        />
                      </motion.div>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 text-[#9CA3AF]">
                <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No sessions scheduled</p>
              </div>
            )
          ) : (
            // Show only selected language
            transformedSessions.length > 0 ? (
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
                  {transformedSessions.map((session, index) => (
                    <motion.div
                      key={session.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <SessionCard 
                        session={session} 
                        onClick={() => {
                          setSelectedSession(session);
                        }}
                      />
                    </motion.div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-[#9CA3AF]">
                <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No {selectedLanguage} sessions scheduled</p>
              </div>
            )
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
                {conversations.length > 0 ? (
                  conversations.filter((conv: any) => conv.unreadCount > 0).map((conv: any, index: number) => (
                    <motion.div
                      key={conv.id || index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="px-4 py-4 border-b border-[#2A2A2A] cursor-pointer active:bg-[#0F0F0F] transition-colors"
                    >
                      <div className="flex gap-3">
                        <div className="relative flex-shrink-0">
                          <img
                            src={conv.otherUser?.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(conv.otherUser?.displayName || 'User')}&background=1DB954&color=fff`}
                            alt={conv.otherUser?.displayName || 'User'}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                          <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-[#1A1A1A] rounded-full flex items-center justify-center">
                            {getNotificationIcon('message')}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <p className="font-medium text-white text-sm">New message from {conv.otherUser?.displayName || 'User'}</p>
                            {conv.unreadCount > 0 && (
                              <div className="w-2 h-2 bg-[#1DB954] rounded-full flex-shrink-0 mt-1" />
                            )}
                          </div>
                          <p className="text-sm text-[#9CA3AF] mb-1">{conv.lastMessage || 'New message'}</p>
                          {conv.lastMessageAt && (
                            <p className="text-xs text-[#6B7280]">
                              {new Date(conv.lastMessageAt).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="text-center py-12 text-[#9CA3AF]">
                    <Bell className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No notifications</p>
                  </div>
                )}
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
      {showMatchPopup && matchedPartner && (
        <MatchFoundPopup
          partner={matchedPartner}
          onClose={() => setShowMatchPopup(false)}
          onNavigateToChat={onNavigateToChat}
        />
      )}
    </div>
  );
}

