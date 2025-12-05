import { useState } from 'react';
import { Calendar, TrendingUp, MessageCircle, Users, MapPin, Clock, Star, Zap, Heart, Award, ChevronRight, Play } from 'lucide-react';
import { motion } from 'motion/react';
import { mockPartners } from '../data/mockData';
import { mockSessions } from '../data/mockSessions';

interface HomeScreenDesktopProps {
  onPartnerClick: (partnerId: string) => void;
  onNavigateToDiscover: () => void;
  onNavigateToMessages: () => void;
}

export function HomeScreenDesktop({ onPartnerClick, onNavigateToDiscover, onNavigateToMessages }: HomeScreenDesktopProps) {
  const currentUser = {
    name: 'Sarah Chen',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    streak: 12,
    totalSessions: 48,
    hoursLearned: 124,
    level: 'Intermediate'
  };

  // Quick stats
  const quickStats = [
    { icon: Calendar, label: 'Sessions This Week', value: '8', change: '+2', color: '#1DB954' },
    { icon: MessageCircle, label: 'Active Chats', value: '12', change: '+3', color: '#5FB3B3' },
    { icon: Users, label: 'New Connections', value: '5', change: '+5', color: '#E91E8C' },
    { icon: Zap, label: 'Day Streak', value: currentUser.streak.toString(), change: 'Record!', color: '#F59E0B' },
  ];

  // Recent activity
  const recentActivity = [
    {
      id: '1',
      type: 'session',
      title: 'Completed Spanish practice',
      subtitle: 'with Miguel Rodriguez',
      time: '2 hours ago',
      avatar: mockPartners[0].avatar,
      icon: Calendar,
      color: '#1DB954'
    },
    {
      id: '2',
      type: 'match',
      title: 'New match found!',
      subtitle: 'Emma Thompson wants to connect',
      time: '5 hours ago',
      avatar: mockPartners[1].avatar,
      icon: Heart,
      color: '#E91E8C'
    },
    {
      id: '3',
      type: 'achievement',
      title: 'Achievement unlocked',
      subtitle: '10 sessions completed milestone',
      time: 'Yesterday',
      avatar: null,
      icon: Award,
      color: '#F59E0B'
    },
    {
      id: '4',
      type: 'message',
      title: 'New message from Yuki',
      subtitle: 'Looking forward to our session!',
      time: 'Yesterday',
      avatar: mockPartners[2].avatar,
      icon: MessageCircle,
      color: '#5FB3B3'
    },
  ];

  // Upcoming sessions
  const upcomingSessions = mockSessions.slice(0, 3);

  // Recommended partners
  const recommendedPartners = mockPartners.filter(p => p.isOnline).slice(0, 4);

  return (
    <div className="h-full overflow-y-auto" style={{ backgroundColor: 'var(--color-background)' }}>
      {/* Hero Section */}
      <div className="px-6 py-8 border-b" style={{ borderColor: 'var(--color-border)' }}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl mb-2" style={{ color: 'var(--color-text)' }}>
              Welcome back, {currentUser.name.split(' ')[0]}! 👋
            </h1>
            <p className="text-[#9CA3AF]">Here's what's happening with your language journey</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="px-6 py-3 rounded-xl bg-gradient-primary text-white">
              <div className="flex items-center gap-2 mb-1">
                <Zap className="w-5 h-5" />
                <span className="text-2xl">{currentUser.streak}</span>
              </div>
              <div className="text-xs opacity-90">Day Streak</div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="px-6 py-6">
        <div className="grid grid-cols-4 gap-4 mb-8">
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

        {/* Two Column Layout */}
        <div className="grid grid-cols-3 gap-6">
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
            </div>

            {/* Recent Activity */}
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
          </div>

          {/* Right Column - Recommendations */}
          <div className="space-y-6">
            {/* Learning Progress */}
            <div className="rounded-xl p-5 border" style={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)' }}>
              <h3 className="font-semibold mb-4" style={{ color: 'var(--color-text)' }}>Learning Progress</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm" style={{ color: 'var(--color-text)' }}>Spanish</span>
                    <span className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>78%</span>
                  </div>
                  <div className="h-2 rounded-full" style={{ backgroundColor: 'var(--color-background)' }}>
                    <div className="h-full rounded-full bg-gradient-primary" style={{ width: '78%' }} />
                  </div>
                  <p className="text-xs text-[#9CA3AF] mt-1">Intermediate • 24h this month</p>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm" style={{ color: 'var(--color-text)' }}>French</span>
                    <span className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>45%</span>
                  </div>
                  <div className="h-2 rounded-full" style={{ backgroundColor: 'var(--color-background)' }}>
                    <div className="h-full rounded-full bg-[#5FB3B3]" style={{ width: '45%' }} />
                  </div>
                  <p className="text-xs text-[#9CA3AF] mt-1">Beginner • 12h this month</p>
                </div>
              </div>
            </div>

            {/* Recommended Partners */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold" style={{ color: 'var(--color-text)' }}>Recommended For You</h3>
              </div>
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
                          {typeof partner.languages === 'string' 
                            ? partner.languages 
                            : `${partner.languages.native} • ${partner.languages.learning}`}
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