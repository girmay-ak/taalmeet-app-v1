export const mockPartners = [
  {
    id: '1',
    name: 'Carlos Mendez',
    age: 28,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
    isOnline: true,
    distance: 0.3, // Very close!
    matchScore: 87,
    verified: true,
    premium: false,
    bio: 'Spanish native speaker passionate about languages and culture. Love coffee, hiking, and deep conversations. Looking forward to helping you with Spanish while improving my Dutch!',
    teaching: { language: 'Spanish', level: 'Native', flag: '🇪🇸' },
    learning: { language: 'Dutch', level: 'B2 - Upper Intermediate', flag: '🇳🇱' },
    languages: { native: 'Spanish', learning: 'Dutch' }, // Add this for popup
    interests: ['Coffee', 'Travel', 'Music', 'Hiking', 'Photography'],
    location: 'Den Haag, Netherlands',
    rating: 4.8,
    reviewCount: 52,
    exchangeCount: 54,
    memberSince: '2024',
    availableNow: true,
    lastActive: 'Active now',
    availability: {
      status: 'available' as const,
      timeLeft: 120, // minutes
      preferences: ['in-person', 'video']
    }
  },
  {
    id: '2',
    name: 'Sophie Laurent',
    age: 25,
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop',
    isOnline: true,
    distance: 0.8,
    matchScore: 92,
    verified: true,
    premium: true,
    bio: 'Bonjour! French teacher who loves meeting new people. Always up for a coffee chat or video call. Let\'s practice together!',
    teaching: { language: 'French', level: 'Native', flag: '🇫🇷' },
    learning: { language: 'English', level: 'C1 - Advanced', flag: '🇬🇧' },
    languages: { native: 'French', learning: 'English' }, // Add this for popup
    interests: ['Art', 'Cooking', 'Literature', 'Yoga', 'Wine'],
    location: 'Den Haag, Netherlands',
    rating: 4.9,
    reviewCount: 78,
    exchangeCount: 92,
    memberSince: '2023',
    availableNow: true,
    lastActive: 'Active now',
    availability: {
      status: 'available' as const,
      timeLeft: 90,
      preferences: ['in-person', 'video', 'chat']
    }
  },
  {
    id: '3',
    name: 'Takeshi Yamamoto',
    age: 32,
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop',
    isOnline: false,
    distance: 2.5,
    matchScore: 78,
    verified: true,
    premium: false,
    bio: 'Software engineer from Tokyo. Love tech, anime, and trying new foods. Happy to teach Japanese in exchange for Dutch practice!',
    teaching: { language: 'Japanese', level: 'Native', flag: '🇯🇵' },
    learning: { language: 'Dutch', level: 'A2 - Elementary', flag: '🇳🇱' },
    languages: { native: 'Japanese', learning: 'Dutch' }, // Add this for popup
    interests: ['Technology', 'Anime', 'Gaming', 'Food', 'Cycling'],
    location: 'Rotterdam, Netherlands',
    rating: 4.7,
    reviewCount: 34,
    exchangeCount: 41,
    memberSince: '2024',
    availableNow: false,
    lastActive: '2 hours ago'
  },
  {
    id: '4',
    name: 'Emma de Vries',
    age: 29,
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop',
    isOnline: true,
    distance: 0.5,
    matchScore: 95,
    verified: true,
    premium: true,
    bio: 'Dutch native, English teacher. Love helping people learn! Also learning Italian. Enjoy long walks, books, and good conversations.',
    teaching: { language: 'Dutch', level: 'Native', flag: '🇳🇱' },
    learning: { language: 'Italian', level: 'B1 - Intermediate', flag: '🇮🇹' },
    languages: { native: 'Dutch', learning: 'Italian' }, // Add this for popup
    interests: ['Reading', 'Walking', 'Teaching', 'History', 'Museums'],
    location: 'Den Haag, Netherlands',
    rating: 5.0,
    reviewCount: 103,
    exchangeCount: 127,
    memberSince: '2023',
    availableNow: true,
    lastActive: 'Active now'
  },
  {
    id: '5',
    name: 'Marco Rossi',
    age: 27,
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop',
    isOnline: false,
    distance: 3.2,
    matchScore: 81,
    verified: false,
    premium: false,
    bio: 'Ciao! Italian chef exploring Dutch cuisine. Let\'s exchange recipes and languages!',
    teaching: { language: 'Italian', level: 'Native', flag: '🇮🇹' },
    learning: { language: 'Dutch', level: 'A1 - Beginner', flag: '🇳🇱' },
    languages: { native: 'Italian', learning: 'Dutch' }, // Add this for popup
    interests: ['Cooking', 'Food', 'Wine', 'Soccer', 'Music'],
    location: 'Delft, Netherlands',
    rating: 4.6,
    reviewCount: 18,
    exchangeCount: 22,
    memberSince: '2024',
    availableNow: false,
    lastActive: '1 day ago'
  },
  {
    id: '6',
    name: 'Yuki Tanaka',
    age: 24,
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop',
    isOnline: true,
    distance: 1.8,
    matchScore: 89,
    verified: true,
    premium: false,
    bio: 'Student and part-time barista. Love languages, K-pop, and making new friends. Let\'s grab coffee!',
    teaching: { language: 'Japanese', level: 'Native', flag: '🇯🇵' },
    learning: { language: 'English', level: 'B2 - Upper Intermediate', flag: '🇬🇧' },
    languages: { native: 'Japanese', learning: 'English' }, // Add this for popup
    interests: ['K-pop', 'Coffee', 'Fashion', 'Photography', 'Cats'],
    location: 'Den Haag, Netherlands',
    rating: 4.9,
    reviewCount: 45,
    exchangeCount: 51,
    memberSince: '2024',
    availableNow: true,
    lastActive: 'Active now'
  }
];

export const mockConversations = [
  {
    id: '1',
    partnerId: '2',
    partnerName: 'Sophie Laurent',
    partnerAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop',
    isOnline: true,
    lastMessage: 'That sounds great! See you at 3pm tomorrow 🎉',
    timestamp: '2m ago',
    unreadCount: 2,
    isPinned: true
  },
  {
    id: '2',
    partnerId: '1',
    partnerName: 'Carlos Mendez',
    partnerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
    isOnline: true,
    lastMessage: 'Hey! Are you free for a coffee chat this week?',
    timestamp: '1h ago',
    unreadCount: 1,
    isPinned: false
  },
  {
    id: '3',
    partnerId: '4',
    partnerName: 'Emma de Vries',
    partnerAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop',
    isOnline: true,
    lastMessage: 'Thank you so much for the lesson today!',
    timestamp: '3h ago',
    unreadCount: 0,
    isPinned: true
  },
  {
    id: '4',
    partnerId: '6',
    partnerName: 'Yuki Tanaka',
    partnerAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop',
    isOnline: true,
    lastMessage: 'The new coffee shop is amazing! 😍',
    timestamp: '1d ago',
    unreadCount: 0,
    isPinned: false
  },
  {
    id: '5',
    partnerId: '3',
    partnerName: 'Takeshi Yamamoto',
    partnerAvatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop',
    isOnline: false,
    lastMessage: 'Sure, I can help with that grammar point',
    timestamp: '2d ago',
    unreadCount: 0,
    isPinned: false
  }
];

export const mockMessages = [
  {
    id: '1',
    senderId: '2',
    text: 'Hey! How are you doing?',
    timestamp: '10:30 AM',
    isSent: false
  },
  {
    id: '2',
    senderId: 'me',
    text: 'Hi Sophie! I\'m doing great, thanks! How about you?',
    timestamp: '10:32 AM',
    isSent: true
  },
  {
    id: '3',
    senderId: '2',
    text: 'Really good! I was thinking we could meet up for a coffee chat this week?',
    timestamp: '10:33 AM',
    isSent: false
  },
  {
    id: '4',
    senderId: 'me',
    text: 'That sounds perfect! I\'m free on Wednesday afternoon',
    timestamp: '10:35 AM',
    isSent: true
  },
  {
    id: '5',
    senderId: '2',
    text: 'Wednesday works great for me! How about 3pm at Cafe Central?',
    timestamp: '10:36 AM',
    isSent: false
  },
  {
    id: '6',
    senderId: 'me',
    text: 'That sounds great! See you at 3pm tomorrow 🎉',
    timestamp: '10:38 AM',
    isSent: true
  }
];

export const mockReviews = [
  {
    id: '1',
    reviewerName: 'Anna Schmidt',
    reviewerAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop',
    rating: 5,
    date: '2 weeks ago',
    comment: 'Amazing language partner! Very patient and always prepared with interesting topics to discuss.'
  },
  {
    id: '2',
    reviewerName: 'Tom van Berg',
    reviewerAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop',
    rating: 5,
    date: '1 month ago',
    comment: 'Great conversations and really helped me improve my pronunciation. Highly recommend!'
  },
  {
    id: '3',
    reviewerName: 'Lisa Wong',
    reviewerAvatar: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=400&h=400&fit=crop',
    rating: 4,
    date: '2 months ago',
    comment: 'Very friendly and knowledgeable. Looking forward to more sessions!'
  }
];

export const currentUser = {
  id: 'me',
  name: 'Alex Johnson',
  age: 26,
  avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&h=400&fit=crop',
  bio: 'Language enthusiast and coffee lover. Always excited to meet new people and learn about different cultures!',
  teaching: { language: 'English', level: 'Native', flag: '🇬🇧' },
  learning: { language: 'Dutch', level: 'B1 - Intermediate', flag: '🇳🇱' },
  interests: ['Coffee', 'Travel', 'Photography', 'Music', 'Running'],
  location: 'Den Haag, Netherlands',
  rating: 4.9,
  connectionCount: 24,
  exchangeCount: 12,
  memberSince: '2024',
  verified: true,
  premium: false
};