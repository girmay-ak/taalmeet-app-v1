import { X, User, MapPin, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

interface Notification {
  id: string;
  type: 'partner-available' | 'favorite-available' | 'nearby-available' | 'expiring';
  title: string;
  message: string;
  icon: string;
  actionLabel?: string;
  secondaryLabel?: string;
  avatar?: string;
}

export function AvailabilityNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'partner-available',
      title: 'Carlos is available now!',
      message: '1.2km away • Available for 2h',
      icon: '🟢',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      actionLabel: 'Message',
      secondaryLabel: 'View Profile'
    }
  ]);

  const removeNotification = (id: string) => {
    setNotifications(notifications.filter(n => n.id !== id));
  };

  return (
    <div className="fixed top-4 right-4 left-4 z-50 space-y-2 pointer-events-none">
      <AnimatePresence>
        {notifications.map((notification) => (
          <motion.div
            key={notification.id}
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-2xl shadow-2xl p-4 pointer-events-auto"
          >
            <div className="flex items-start gap-3">
              {/* Avatar or Icon */}
              {notification.avatar ? (
                <div className="relative">
                  <img
                    src={notification.avatar}
                    alt=""
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div className="absolute -bottom-1 -right-1 text-lg">
                    {notification.icon}
                  </div>
                </div>
              ) : (
                <div className="w-12 h-12 bg-[#10B981]/20 rounded-full flex items-center justify-center text-2xl">
                  {notification.icon}
                </div>
              )}

              {/* Content */}
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-semibold text-white mb-0.5">
                  {notification.title}
                </h4>
                <p className="text-xs text-[#9CA3AF] mb-2">
                  {notification.message}
                </p>

                {/* Actions */}
                {(notification.actionLabel || notification.secondaryLabel) && (
                  <div className="flex gap-2">
                    {notification.actionLabel && (
                      <button className="px-3 py-1.5 bg-gradient-primary text-white text-xs font-semibold rounded-lg active:scale-95 transition-transform">
                        {notification.actionLabel}
                      </button>
                    )}
                    {notification.secondaryLabel && (
                      <button className="px-3 py-1.5 bg-[#0F0F0F] text-white text-xs font-medium rounded-lg active:scale-95 transition-transform">
                        {notification.secondaryLabel}
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Close Button */}
              <button
                onClick={() => removeNotification(notification.id)}
                className="p-1 hover:bg-[#2A2A2A] rounded-lg transition-colors"
              >
                <X className="w-4 h-4 text-[#9CA3AF]" />
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

// Example usage with different notification types:
export const notificationExamples: Notification[] = [
  {
    id: '1',
    type: 'partner-available',
    title: 'Carlos is available now!',
    message: '1.2km away • Available for 2h',
    icon: '🟢',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    actionLabel: 'Message',
    secondaryLabel: 'View Profile'
  },
  {
    id: '2',
    type: 'favorite-available',
    title: 'Your favorite Emma is online!',
    message: 'Want to practice now?',
    icon: '⭐',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
    actionLabel: 'Chat Now'
  },
  {
    id: '3',
    type: 'nearby-available',
    title: '3 partners available within 2km',
    message: 'Anna, Yuki, Lisa are all online',
    icon: '📍',
    actionLabel: 'Open Map'
  },
  {
    id: '4',
    type: 'expiring',
    title: 'Your availability expires in 15min',
    message: 'Tap to extend or change status',
    icon: '⏰',
    actionLabel: 'Extend 1h',
    secondaryLabel: 'Stop'
  }
];