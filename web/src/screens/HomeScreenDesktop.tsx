import { useState, useMemo, useEffect } from 'react';
import { Calendar, TrendingUp, MessageCircle, Users, MapPin, Clock, Star, Zap, Heart, Award, ChevronRight, Play, Loader2, LogIn } from 'lucide-react';
import { motion } from 'motion/react';
import { useAuth } from '../providers/AuthProvider';
import { useProfile } from '../hooks/useProfile';
import { useSessions } from '../hooks/useSessions';
import { useConnections } from '../hooks/useConnections';
import { useConversations } from '../hooks/useMessages';
import { useUserStreaks } from '../hooks/useGamification';
import { useDiscoverFeed } from '../hooks/useDiscover';
import { getLanguageFlag } from '@/utils/languageFlags';

interface HomeScreenDesktopProps {
  onPartnerClick: (partnerId: string) => void;
  onNavigateToDiscover: () => void;
  onNavigateToMessages: () => void;
  onNavigateToLogin?: () => void;
}

export function HomeScreenDesktop({ 
  onPartnerClick, 
  onNavigateToDiscover, 
  onNavigateToMessages,
  onNavigateToLogin 
}: HomeScreenDesktopProps) {
  const { user, profile, loading: authLoading } = useAuth();
  const { data: profileData } = useProfile();
  const currentProfile = profile || profileData;

  // Fetch data from backend (only if authenticated)
  const { data: sessions = [], isLoading: sessionsLoading } = useSessions(
    { status: 'upcoming', limit: 3 },
    !!user?.id
  );
  const { connections, suggested, isLoading: connectionsLoading } = useConnections(user?.id);
  const { data: conversations = [], isLoading: conversationsLoading } = useConversations();
  const { data: streaks = [], isLoading: streaksLoading } = useUserStreaks(user?.id);
  const { data: discoverFeed, isLoading: discoverLoading } = useDiscoverFeed({ limit: 4 });

  // Check if user is authenticated
  const isAuthenticated = !!user && !authLoading;

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user && onNavigateToLogin) {
      onNavigateToLogin();
    }
  }, [user, authLoading, onNavigateToLogin]);

  // Show loading state while checking authentication
  if (authLoading) {
    return (
      <div className="h-full flex items-center justify-center" style={{ backgroundColor: 'var(--color-background)' }}>
        <Loader2 className="w-8 h-8 animate-spin text-[#1DB954]" />
        <p className="mt-4 text-[#9CA3AF]">Loading...</p>
      </div>
    );
  }

  // Show login prompt if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="h-full flex flex-col items-center justify-center px-6" style={{ backgroundColor: 'var(--color-background)' }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md"
        >
          <div className="w-20 h-20 rounded-full bg-gradient-primary mx-auto mb-6 flex items-center justify-center">
            <LogIn className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold mb-3" style={{ color: 'var(--color-text)' }}>
            Welcome to TaalMeet!
          </h2>
          <p className="text-[#9CA3AF] mb-8">
            Please sign in to access your personalized language exchange dashboard and connect with partners around the world.
          </p>
          {onNavigateToLogin && (
            <button
              onClick={onNavigateToLogin}
              className="px-6 py-3 bg-gradient-primary text-white rounded-xl font-medium hover:opacity-90 transition-opacity"
            >
              Sign In
            </button>
          )}
        </motion.div>
      </div>
    );
  }

  // Calculate stats
  const currentStreak = useMemo(() => {
    if (!streaks || streaks.length === 0) return 0;
    // Get the highest streak from all languages
    return Math.max(...streaks.map((s: any) => s.current_streak || 0), 0);
  }, [streaks]);

  // Get sessions this week
  const sessionsThisWeek = useMemo(() => {
    const now = new Date();
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
    startOfWeek.setHours(0, 0, 0, 0);
    // TODO: Filter sessions by date when date field is available
    return sessions.length;
  }, [sessions]);

  // Get new connections (this week)
  const newConnections = useMemo(() => {
    if (!connections || connections.length === 0) return 0;
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    // TODO: Filter by created_at when available
    return connections.filter((conn: any) => {
      if (!conn.created_at) return false;
      return new Date(conn.created_at) > weekAgo;
    }).length;
  }, [connections]);

  // Get unread messages count
  const activeChatsCount = useMemo(() => {
    return conversations.filter((conv: any) => conv.unreadCount > 0).length;
  }, [conversations]);

  // Format upcoming sessions for display
  const upcomingSessions = useMemo(() => {
    return sessions.slice(0, 3).map((session: any) => ({
      id: session.id,
      title: session.title || session.name || 'Language Exchange Session',
      hostName: session.host?.display_name || session.host_name || 'Host',
      hostAvatar: session.host?.avatar_url || 'https://ui-avatars.com/api/?name=Host&background=1DB954&color=fff',
      time: session.scheduled_at 
        ? new Date(session.scheduled_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
        : 'TBD',
      location: session.location || session.address || 'Online',
      attendees: session.participant_count || session.current_participants || 0,
      maxAttendees: session.capacity || session.max_participants || 10,
    }));
  }, [sessions]);

  // Get recommended partners from discover feed
  const recommendedPartners = useMemo(() => {
    const users = discoverFeed?.recommendedUsers || discoverFeed?.activeUsers || [];
    return users.slice(0, 4).map((user: any) => {
      const teachingLang = user.languages?.find((l: any) => l.role === 'teaching');
      const learningLang = user.languages?.find((l: any) => l.role === 'learning');
      
      return {
        id: user.id,
        name: user.display_name || 'User',
        avatar: user.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.display_name || 'User')}&background=1DB954&color=fff`,
        isOnline: user.is_online || false,
        rating: 4.8, // TODO: Calculate from reviews
        languages: {
          native: teachingLang?.language || 'Not set',
          learning: learningLang?.language || 'Not set',
        },
      };
    });
  }, [discoverFeed]);

  // Get learning progress from user languages
  const learningProgress = useMemo(() => {
    if (!currentProfile?.languages?.learning) return [];
    
    return currentProfile.languages.learning.map((lang: any) => ({
      language: lang.language || 'Unknown',
      level: lang.level || 'beginner',
      progress: lang.level === 'native' ? 100 : lang.level === 'advanced' ? 75 : lang.level === 'intermediate' ? 50 : 25,
    }));
  }, [currentProfile]);

  const userName = currentProfile?.displayName || 'User';
  const firstName = userName.split(' ')[0];

  // Quick stats
  const quickStats = [
    { 
      icon: Calendar, 
      label: 'Sessions This Week', 
      value: sessionsThisWeek.toString(), 
      change: sessionsThisWeek > 0 ? '+0' : '0', 
      color: '#1DB954' 
    },
    { 
      icon: MessageCircle, 
      label: 'Active Chats', 
      value: activeChatsCount.toString(), 
      change: activeChatsCount > 0 ? `+${activeChatsCount}` : '0', 
      color: '#5FB3B3' 
    },
    { 
      icon: Users, 
      label: 'New Connections', 
      value: newConnections.toString(), 
      change: newConnections > 0 ? `+${newConnections}` : '0', 
      color: '#E91E8C' 
    },
    { 
      icon: Zap, 
      label: 'Day Streak', 
      value: currentStreak.toString(), 
      change: currentStreak > 0 ? 'Keep going!' : 'Start today!', 
      color: '#F59E0B' 
    },
  ];

  // Recent activity (simplified for now - TODO: Get from backend)
  const recentActivity: any[] = [];

  const isLoading = sessionsLoading || connectionsLoading || conversationsLoading || streaksLoading || discoverLoading;

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center" style={{ backgroundColor: 'var(--color-background)' }}>
        <Loader2 className="w-8 h-8 animate-spin text-[#1DB954]" />
        <p className="mt-4 text-[#9CA3AF]">Loading your dashboard...</p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto w-full" style={{ backgroundColor: 'var(--color-background)' }}>
      {/* Hero Section */}
      <div className="px-6 py-8 border-b w-full" style={{ borderColor: 'var(--color-border)' }}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl mb-2" style={{ color: 'var(--color-text)' }}>
              Welcome back, {firstName}! 👋
            </h1>
            <p className="text-[#9CA3AF]">Here's what's happening with your language journey</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="px-6 py-3 rounded-xl bg-gradient-primary text-white">
              <div className="flex items-center gap-2 mb-1">
                <Zap className="w-5 h-5" />
                <span className="text-2xl">{currentStreak}</span>
              </div>
              <div className="text-xs opacity-90">Day Streak</div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="px-6 py-6 max-w-[1920px] mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {quickStats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="rounded-xl p-5 border"
                style={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)' }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${stat.color}20` }}>
                    <Icon className="w-6 h-6" style={{ color: stat.color }} />
                  </div>
                  <span className="text-xs font-semibold px-2 py-1 rounded-full" style={{ backgroundColor: `${stat.color}20`, color: stat.color }}>
                    {stat.change}
                  </span>
                </div>
                <div className="text-3xl mb-1" style={{ color: 'var(--color-text)' }}>{stat.value}</div>
                <div className="text-sm text-[#9CA3AF]">{stat.label}</div>
              </motion.div>
            );
          })}
        </div>

        {/* Three Column Layout - Full Width */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full">
          {/* Left Column - Upcoming & Recent */}
          <div className="col-span-2 space-y-6">
            {/* Upcoming Sessions */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold" style={{ color: 'var(--color-text)' }}>Upcoming Sessions</h2>
                <button 
                  onClick={onNavigateToDiscover}
                  className="text-sm text-[#1DB954] hover:underline font-medium"
                >
                  View All
                  <ChevronRight className="w-4 h-4 inline" />
                </button>
              </div>
              {upcomingSessions.length > 0 ? (
                <div className="space-y-3">
                  {upcomingSessions.map((session, index) => (
                    <motion.div
                      key={session.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="rounded-xl p-4 border cursor-pointer hover:scale-[1.02] transition-all"
                      style={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)' }}
                    >
                      <div className="flex gap-4">
                        <img 
                          src={session.hostAvatar}
                          alt={session.hostName}
                          className="w-16 h-16 rounded-xl object-cover"
                        />
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h3 className="font-semibold mb-1" style={{ color: 'var(--color-text)' }}>{session.title}</h3>
                              <p className="text-sm text-[#9CA3AF]">{session.hostName}</p>
                            </div>
                            <button className="px-3 py-1.5 rounded-lg bg-gradient-primary text-white text-sm font-medium">
                              Join
                            </button>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-[#9CA3AF]">
                            <span className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {session.time}
                            </span>
                            <span className="flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              {session.location}
                            </span>
                            <span className="flex items-center gap-1">
                              <Users className="w-4 h-4" />
                              {session.attendees}/{session.maxAttendees}
                            </span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="rounded-xl p-8 border text-center" style={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)' }}>
                  <p className="text-[#9CA3AF] mb-4">No upcoming sessions</p>
                  <button 
                    onClick={onNavigateToDiscover}
                    className="px-4 py-2 rounded-lg bg-gradient-primary text-white text-sm font-medium"
                  >
                    Find Sessions
                  </button>
                </div>
              )}
            </div>

            {/* Recent Activity */}
            {recentActivity.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold" style={{ color: 'var(--color-text)' }}>Recent Activity</h2>
                </div>
                <div className="rounded-xl border overflow-hidden" style={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)' }}>
                  {recentActivity.map((activity, index) => {
                    const Icon = activity.icon;
                    return (
                      <motion.div
                        key={activity.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="flex items-center gap-4 p-4 border-b last:border-b-0 cursor-pointer hover:bg-opacity-50 transition-colors"
                        style={{ borderColor: 'var(--color-border)' }}
                      >
                        <div className="relative">
                          {activity.avatar ? (
                            <img 
                              src={activity.avatar}
                              alt={activity.title}
                              className="w-12 h-12 rounded-xl object-cover"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${activity.color}20` }}>
                              <Icon className="w-6 h-6" style={{ color: activity.color }} />
                            </div>
                          )}
                          {activity.avatar && (
                            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--color-card)' }}>
                              <Icon className="w-4 h-4" style={{ color: activity.color }} />
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium mb-0.5" style={{ color: 'var(--color-text)' }}>{activity.title}</h4>
                          <p className="text-sm text-[#9CA3AF]">{activity.subtitle}</p>
                        </div>
                        <span className="text-xs text-[#9CA3AF]">{activity.time}</span>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Recommendations */}
          <div className="space-y-6">
            {/* Learning Progress */}
            {learningProgress.length > 0 && (
              <div className="rounded-xl p-5 border" style={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)' }}>
                <h3 className="font-semibold mb-4" style={{ color: 'var(--color-text)' }}>Learning Progress</h3>
                <div className="space-y-4">
                  {learningProgress.map((lang, index) => (
                    <div key={index}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm" style={{ color: 'var(--color-text)' }}>{lang.language}</span>
                        <span className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>{lang.progress}%</span>
                      </div>
                      <div className="h-2 rounded-full" style={{ backgroundColor: 'var(--color-background)' }}>
                        <div className="h-full rounded-full bg-gradient-primary" style={{ width: `${lang.progress}%` }} />
                      </div>
                      <p className="text-xs text-[#9CA3AF] mt-1 capitalize">{lang.level} level</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recommended Partners */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold" style={{ color: 'var(--color-text)' }}>Recommended For You</h3>
              </div>
              {recommendedPartners.length > 0 ? (
                <div className="space-y-3">
                  {recommendedPartners.map((partner, index) => (
                    <motion.div
                      key={partner.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                      onClick={() => onPartnerClick(partner.id)}
                      className="rounded-xl p-3 border cursor-pointer hover:scale-105 transition-all"
                      style={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)' }}
                    >
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <img 
                            src={partner.avatar}
                            alt={partner.name}
                            className="w-12 h-12 rounded-xl object-cover"
                          />
                          {partner.isOnline && (
                            <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-[#10B981] border-2 rounded-full" style={{ borderColor: 'var(--color-card)' }} />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <h4 className="font-semibold text-sm truncate" style={{ color: 'var(--color-text)' }}>{partner.name}</h4>
                            <Star className="w-3 h-3 fill-[#F59E0B] text-[#F59E0B]" />
                            <span className="text-xs" style={{ color: 'var(--color-text)' }}>{partner.rating}</span>
                          </div>
                          <p className="text-xs text-[#9CA3AF] truncate">
                            {partner.languages.native} • {partner.languages.learning}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                  <button 
                    onClick={onNavigateToDiscover}
                    className="w-full py-2.5 rounded-xl text-sm font-medium transition-colors hover:bg-opacity-80"
                    style={{ backgroundColor: 'var(--color-background)', color: 'var(--color-text)' }}
                  >
                    Discover More
                    <ChevronRight className="w-4 h-4 inline ml-1" />
                  </button>
                </div>
              ) : (
                <div className="rounded-xl p-4 border text-center" style={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)' }}>
                  <p className="text-sm text-[#9CA3AF] mb-3">No recommendations yet</p>
                  <button 
                    onClick={onNavigateToDiscover}
                    className="px-4 py-2 rounded-lg bg-gradient-primary text-white text-sm font-medium"
                  >
                    Find Partners
                  </button>
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="rounded-xl p-5 border space-y-2" style={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)' }}>
              <h3 className="font-semibold mb-3" style={{ color: 'var(--color-text)' }}>Quick Actions</h3>
              <button 
                onClick={onNavigateToDiscover}
                className="w-full px-4 py-3 rounded-xl text-sm font-medium transition-colors hover:opacity-80 flex items-center justify-between bg-gradient-primary text-white"
              >
                <span>Find Partners</span>
                <Users className="w-4 h-4" />
              </button>
              <button 
                onClick={onNavigateToMessages}
                className="w-full px-4 py-3 rounded-xl text-sm font-medium transition-colors hover:bg-opacity-80 flex items-center justify-between"
                style={{ backgroundColor: 'var(--color-background)', color: 'var(--color-text)' }}
              >
                <span>Messages</span>
                <MessageCircle className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
