export interface Notification {
  id: string;
  type: 'match' | 'message' | 'session' | 'like' | 'view';
  title: string;
  message: string;
  avatar?: string;
  timestamp: string;
  isRead: boolean;
}

export const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'match',
    title: 'New Match! 🎉',
    message: 'You and Sophie Laurent are now connected!',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop',
    timestamp: '5 min ago',
    isRead: false
  },
  {
    id: '2',
    type: 'message',
    title: 'Carlos Mendez',
    message: 'Hey! Want to practice Spanish tomorrow?',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
    timestamp: '1 hour ago',
    isRead: false
  },
  {
    id: '3',
    type: 'session',
    title: 'Spanish Coffee Chat',
    message: 'Starting in 30 minutes at Central Cafe',
    avatar: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400&h=400&fit=crop',
    timestamp: '2 hours ago',
    isRead: false
  },
  {
    id: '4',
    type: 'like',
    title: 'Emma Johnson liked your profile',
    message: '92% match • Speaks French & English',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop',
    timestamp: '3 hours ago',
    isRead: true
  },
  {
    id: '5',
    type: 'view',
    title: '5 people viewed your profile',
    message: 'Your profile is getting noticed! Keep it up!',
    timestamp: '5 hours ago',
    isRead: true
  },
  {
    id: '6',
    type: 'session',
    title: 'French Conversation Session',
    message: 'Tomorrow at 6:00 PM • 8 people attending',
    avatar: 'https://images.unsplash.com/photo-1511920170033-f8396924c348?w=400&h=400&fit=crop',
    timestamp: '1 day ago',
    isRead: true
  },
  {
    id: '7',
    type: 'match',
    title: 'New Match!',
    message: 'You and Michael Chen have similar interests',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop',
    timestamp: '2 days ago',
    isRead: true
  }
];