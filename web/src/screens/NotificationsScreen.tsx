import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Bell, 
  X, 
  Check, 
  Heart, 
  MessageCircle, 
  UserPlus, 
  Calendar, 
  MapPin, 
  Star,
  Sparkles,
  ChevronLeft,
  Settings,
  Filter,
  CheckCheck
} from 'lucide-react';

interface Notification {
  id: string;
  type: 'match' | 'message' | 'connection' | 'session' | 'achievement' | 'reminder';
  title: string;
  message: string;
  time: string;
  read: boolean;
  avatar?: string;
  icon?: 'heart' | 'message' | 'user' | 'calendar' | 'star' | 'sparkles';
}

const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'match',
    title: 'New Match!',
    message: 'You matched with Sophie Martin (95% match)',
    time: '2 min ago',
    read: false,
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    icon: 'heart'
  },
  {
    id: '2',
    type: 'message',
    title: 'New Message',
    message: 'Emma: "Looking forward to our session tomorrow!"',
    time: '15 min ago',
    read: false,
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
    icon: 'message'
  },
  {
    id: '3',
    type: 'connection',
    title: 'Connection Accepted',
    message: 'Marco Silva accepted your connection request',
    time: '1 hour ago',
    read: false,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    icon: 'user'
  },
  {
    id: '4',
    type: 'session',
    title: 'Session Reminder',
    message: 'Your Spanish practice session with Emma starts in 30 minutes',
    time: '2 hours ago',
    read: true,
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
    icon: 'calendar'
  },
  {
    id: '5',
    type: 'achievement',
    title: 'Achievement Unlocked! 🎉',
    message: 'You completed 10 language sessions!',
    time: '3 hours ago',
    read: true,
    icon: 'star'
  },
  {
    id: '6',
    type: 'match',
    title: 'New Match Nearby',
    message: 'Alex Chen (88% match) is 2.5km away',
    time: '5 hours ago',
    read: true,
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    icon: 'heart'
  },
  {
    id: '7',
    type: 'reminder',
    title: 'Update Your Availability',
    message: 'Let partners know when you\'re free this week',
    time: '1 day ago',
    read: true,
    icon: 'calendar'
  },
  {
    id: '8',
    type: 'achievement',
    title: 'Premium Feature Available',
    message: 'Upgrade to unlock unlimited swipes and advanced filters',
    time: '2 days ago',
    read: true,
    icon: 'sparkles'
  }
];

interface NotificationsScreenProps {
  onBack?: () => void;
  onNotificationClick?: (id: string) => void;
}

export function NotificationsScreen({ onBack, onNotificationClick }: NotificationsScreenProps) {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const unreadCount = notifications.filter(n => !n.read).length;

  const filteredNotifications = filter === 'unread' 
    ? notifications.filter(n => !n.read)
    : notifications;

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const getIcon = (type: Notification['icon']) => {
    switch (type) {
      case 'heart':
        return Heart;
      case 'message':
        return MessageCircle;
      case 'user':
        return UserPlus;
      case 'calendar':
        return Calendar;
      case 'star':
        return Star;
      case 'sparkles':
        return Sparkles;
      default:
        return Bell;
    }
  };

  const getIconColor = (type: Notification['type']) => {
    switch (type) {
      case 'match':
        return 'from-[#EF4444] to-[#F87171]';
      case 'message':
        return 'from-[#1DB954] to-[#1ED760]';
      case 'connection':
        return 'from-[#5FB3B3] to-[#4FD1C5]';
      case 'session':
        return 'from-[#F59E0B] to-[#FCD34D]';
      case 'achievement':
        return 'from-[#8B5CF6] to-[#A78BFA]';
      case 'reminder':
        return 'from-[#3B82F6] to-[#60A5FA]';
      default:
        return 'from-[#1DB954] to-[#1ED760]';
    }
  };

  return (
    <div className="h-full flex flex-col" style={{ backgroundColor: 'var(--color-background)' }}>
      {/* Header */}
      <div 
        className="px-6 py-4 border-b"
        style={{ 
          backgroundColor: 'var(--color-card)', 
          borderColor: 'var(--color-border)' 
        }}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            {/* Back Button - Mobile Only */}
            <button 
              onClick={onBack}
              className="lg:hidden w-10 h-10 rounded-xl flex items-center justify-center transition-all active:scale-95"
              style={{ backgroundColor: 'var(--color-background)' }}
            >
              <ChevronLeft className="w-5 h-5" style={{ color: 'var(--color-text)' }} />
            </button>
            
            <div>
              <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>
                Notifications
              </h1>
              {unreadCount > 0 && (
                <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                  {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Mark all as read */}
            {unreadCount > 0 && (
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={markAllAsRead}
                className="px-4 py-2 rounded-xl flex items-center gap-2 transition-all"
                style={{ 
                  backgroundColor: 'var(--color-background)',
                  color: 'var(--color-text-muted)'
                }}
              >
                <CheckCheck className="w-4 h-4" />
                <span className="text-sm font-medium hidden sm:inline">Mark all read</span>
              </motion.button>
            )}

            {/* Settings */}
            <motion.button
              whileTap={{ scale: 0.95 }}
              className="w-10 h-10 rounded-xl flex items-center justify-center transition-all"
              style={{ backgroundColor: 'var(--color-background)' }}
            >
              <Settings className="w-5 h-5" style={{ color: 'var(--color-text)' }} />
            </motion.button>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              filter === 'all' ? 'bg-gradient-primary text-white' : ''
            }`}
            style={filter === 'all' ? {} : { 
              backgroundColor: 'var(--color-background)', 
              color: 'var(--color-text-muted)' 
            }}
          >
            All ({notifications.length})
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              filter === 'unread' ? 'bg-gradient-primary text-white' : ''
            }`}
            style={filter === 'unread' ? {} : { 
              backgroundColor: 'var(--color-background)', 
              color: 'var(--color-text-muted)' 
            }}
          >
            Unread ({unreadCount})
          </button>
        </div>
      </div>

      {/* Notifications List */}
      <div className="flex-1 overflow-y-auto">
        {filteredNotifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full px-6 py-12">
            <div 
              className="w-20 h-20 rounded-full flex items-center justify-center mb-4"
              style={{ backgroundColor: 'var(--color-card)' }}
            >
              <Bell className="w-10 h-10" style={{ color: 'var(--color-text-muted)' }} />
            </div>
            <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--color-text)' }}>
              No {filter === 'unread' ? 'unread ' : ''}notifications
            </h3>
            <p className="text-sm text-center" style={{ color: 'var(--color-text-muted)' }}>
              {filter === 'unread' 
                ? "You're all caught up!" 
                : "We'll notify you when something new happens"}
            </p>
          </div>
        ) : (
          <div className="p-4 space-y-2">
            <AnimatePresence>
              {filteredNotifications.map((notification, index) => {
                const Icon = getIcon(notification.icon);
                
                return (
                  <motion.div
                    key={notification.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    transition={{ delay: index * 0.05 }}
                    className="relative group"
                  >
                    <motion.button
                      onClick={() => {
                        markAsRead(notification.id);
                        onNotificationClick?.(notification.id);
                      }}
                      className="w-full p-4 rounded-2xl text-left transition-all border relative overflow-hidden"
                      style={{
                        backgroundColor: notification.read 
                          ? 'var(--color-card)' 
                          : 'var(--color-background)',
                        borderColor: notification.read 
                          ? 'var(--color-border)' 
                          : 'var(--color-primary)',
                        borderWidth: notification.read ? '1px' : '2px'
                      }}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                    >
                      {/* Unread indicator glow */}
                      {!notification.read && (
                        <div className="absolute inset-0 bg-gradient-to-r from-[#1DB954]/10 to-transparent pointer-events-none" />
                      )}

                      <div className="flex gap-3 relative z-10">
                        {/* Avatar or Icon */}
                        <div className="relative flex-shrink-0">
                          {notification.avatar ? (
                            <>
                              <img 
                                src={notification.avatar}
                                alt=""
                                className="w-12 h-12 rounded-xl object-cover"
                              />
                              <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-gradient-to-br ${getIconColor(notification.type)} flex items-center justify-center border-2`}
                                style={{ borderColor: 'var(--color-background)' }}
                              >
                                <Icon className="w-3 h-3 text-white" />
                              </div>
                            </>
                          ) : (
                            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${getIconColor(notification.type)} flex items-center justify-center`}>
                              <Icon className="w-6 h-6 text-white" />
                            </div>
                          )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <h3 
                              className={`font-semibold ${!notification.read ? 'font-bold' : ''}`}
                              style={{ color: 'var(--color-text)' }}
                            >
                              {notification.title}
                            </h3>
                            <span className="text-xs flex-shrink-0" style={{ color: 'var(--color-text-muted)' }}>
                              {notification.time}
                            </span>
                          </div>
                          <p 
                            className={`text-sm ${!notification.read ? 'font-medium' : ''}`}
                            style={{ color: 'var(--color-text-muted)' }}
                          >
                            {notification.message}
                          </p>
                        </div>

                        {/* Unread indicator dot */}
                        {!notification.read && (
                          <div className="absolute top-4 right-4 w-2 h-2 bg-[#1DB954] rounded-full" />
                        )}
                      </div>
                    </motion.button>

                    {/* Delete button - Shows on hover */}
                    <motion.button
                      initial={{ opacity: 0, x: 20 }}
                      whileHover={{ opacity: 1, x: 0 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNotification(notification.id);
                      }}
                      className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-[#EF4444] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      whileTap={{ scale: 0.9 }}
                    >
                      <X className="w-4 h-4 text-white" />
                    </motion.button>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
