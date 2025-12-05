export type OrganizerType = 'business' | 'user';

export interface Organizer {
  id: string;
  type: OrganizerType;
  name: string;
  avatar: string;
  // Business-specific fields
  businessType?: 'cafe' | 'language_school' | 'restaurant' | 'venue' | 'library';
  rating?: number;
  totalEvents?: number;
  verified?: boolean;
  // User-specific fields
  hostingCount?: number;
  attendanceRate?: number;
  bio?: string;
}

export interface Venue {
  name: string;
  address: string;
  city: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  photos?: string[];
  amenities?: string[];
}

export interface LanguageSession {
  id: string;
  title: string;
  description: string;
  language: string;
  languageFlag: string; // emoji flag
  level: 'beginner' | 'intermediate' | 'advanced' | 'all';
  date: string;
  time: string;
  duration: number; // in minutes
  attendees: string[]; // avatar URLs
  totalAttendees: number;
  maxAttendees: number;
  joinedPercentage: number;
  type: 'coffee' | 'walk' | 'online' | 'restaurant' | 'venue';
  isVirtual: boolean;
  meetingLink?: string;
  location?: string;
  venue?: Venue;
  organizer: Organizer;
  price: number; // 0 for free
  currency: string;
  tags: string[];
  isUserJoined: boolean;
  // Evento API compatible fields
  externalId?: string; // ID from Evento API
  externalSource?: 'evento' | 'internal';
}

export const mockSessions: LanguageSession[] = [
  {
    id: '1',
    title: 'Coffee & Spanish Conversation',
    description: 'Join us for a relaxed Spanish conversation over coffee. All levels welcome! We\'ll discuss topics like travel, culture, and daily life while improving your speaking skills.',
    language: 'Spanish',
    languageFlag: '🇪🇸',
    level: 'intermediate',
    date: '21 Nov, 25',
    time: '14:00',
    duration: 90,
    attendees: [
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150'
    ],
    totalAttendees: 15,
    maxAttendees: 20,
    joinedPercentage: 75,
    type: 'coffee',
    isVirtual: false,
    location: 'Coffee Lab, Den Haag',
    venue: {
      name: 'Coffee Lab',
      address: 'Papestraat 32',
      city: 'Den Haag',
      coordinates: { lat: 52.0705, lng: 4.3007 },
      photos: ['https://images.unsplash.com/photo-1593536488177-1eb3c2d4e3d2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYWZlJTIwaW50ZXJpb3IlMjBjb3p5fGVufDF8fHx8MTc2MzYwMTY0OXww&ixlib=rb-4.1.0&q=80&w=1080'],
      amenities: ['WiFi', 'Quiet Area', 'Outdoor Seating']
    },
    organizer: {
      id: 'biz_1',
      type: 'business',
      name: 'Coffee Lab Den Haag',
      avatar: 'https://images.unsplash.com/photo-1561336635-c0e118ad72a0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb2ZmZWUlMjBzaG9wJTIwbG9nb3xlbnwxfHx8fDE3NjM2MjM0ODB8MA&ixlib=rb-4.1.0&q=80&w=1080',
      businessType: 'cafe',
      rating: 4.8,
      totalEvents: 42,
      verified: true
    },
    price: 0,
    currency: 'EUR',
    tags: ['conversation', 'beginners-friendly', 'coffee'],
    isUserJoined: false,
    externalSource: 'internal'
  },
  {
    id: '2',
    title: 'Spanish Language Walk',
    description: 'Practice your Spanish while enjoying a scenic walk along Scheveningen Beach. Perfect for intermediate learners who want to practice in a natural setting.',
    language: 'Spanish',
    languageFlag: '🇪🇸',
    level: 'intermediate',
    date: '22 Nov, 25',
    time: '10:00',
    duration: 60,
    attendees: [
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'
    ],
    totalAttendees: 10,
    maxAttendees: 15,
    joinedPercentage: 60,
    type: 'walk',
    isVirtual: false,
    location: 'Scheveningen Beach',
    organizer: {
      id: 'user_1',
      type: 'user',
      name: 'Maria Rodriguez',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
      hostingCount: 28,
      attendanceRate: 95,
      verified: true,
      bio: 'Native Spanish speaker from Madrid. Love helping others learn!'
    },
    price: 0,
    currency: 'EUR',
    tags: ['outdoor', 'walking', 'nature'],
    isUserJoined: true,
    externalSource: 'internal'
  },
  {
    id: '3',
    title: 'Japanese Exchange Online',
    description: 'Weekly virtual Japanese practice session. Share your learning journey, practice reading hiragana, and have casual conversations.',
    language: 'Japanese',
    languageFlag: '🇯🇵',
    level: 'beginner',
    date: '22 Nov, 25',
    time: '15:30',
    duration: 75,
    attendees: [
      'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=150',
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150'
    ],
    totalAttendees: 10,
    maxAttendees: 12,
    joinedPercentage: 80,
    type: 'online',
    isVirtual: true,
    location: 'Online via Zoom',
    meetingLink: 'https://zoom.us/j/123456789',
    organizer: {
      id: 'biz_2',
      type: 'business',
      name: 'Tokyo Language Academy',
      avatar: 'https://images.unsplash.com/photo-1558443957-d056622df610?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsYW5ndWFnZSUyMHNjaG9vbCUyMGNsYXNzcm9vbXxlbnwxfHx8fDE3NjM2NzgwNjl8MA&ixlib=rb-4.1.0&q=80&w=1080',
      businessType: 'language_school',
      rating: 4.9,
      totalEvents: 156,
      verified: true
    },
    price: 0,
    currency: 'EUR',
    tags: ['online', 'beginners', 'hiragana'],
    isUserJoined: false,
    externalSource: 'evento',
    externalId: 'evt_jp_001'
  },
  {
    id: '4',
    title: 'Japanese Language Walk',
    description: 'Explore Westbroekpark while practicing Japanese. Great for nature lovers and language enthusiasts!',
    language: 'Japanese',
    languageFlag: '🇯🇵',
    level: 'all',
    date: '23 Nov, 25',
    time: '11:00',
    duration: 60,
    attendees: [
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150',
      'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=150',
      'https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=150'
    ],
    totalAttendees: 11,
    maxAttendees: 15,
    joinedPercentage: 70,
    type: 'walk',
    isVirtual: false,
    location: 'Westbroekpark',
    organizer: {
      id: 'user_2',
      type: 'user',
      name: 'Kenji Tanaka',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      hostingCount: 15,
      attendanceRate: 92,
      verified: false,
      bio: 'From Osaka, living in The Hague. Let\'s practice together!'
    },
    price: 0,
    currency: 'EUR',
    tags: ['outdoor', 'all-levels', 'nature'],
    isUserJoined: false,
    externalSource: 'internal'
  },
  {
    id: '5',
    title: 'French Café Conversation',
    description: 'Immerse yourself in French culture and language at our cozy café. Discuss literature, cinema, and French cuisine.',
    language: 'French',
    languageFlag: '🇫🇷',
    level: 'intermediate',
    date: '23 Nov, 25',
    time: '16:00',
    duration: 90,
    attendees: [
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
      'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150'
    ],
    totalAttendees: 8,
    maxAttendees: 10,
    joinedPercentage: 85,
    type: 'coffee',
    isVirtual: false,
    location: 'Café de Paris',
    venue: {
      name: 'Café de Paris',
      address: 'Denneweg 8A',
      city: 'Den Haag',
      coordinates: { lat: 52.0862, lng: 4.3121 },
      photos: ['https://images.unsplash.com/photo-1593536488177-1eb3c2d4e3d2?w=400'],
      amenities: ['WiFi', 'French Pastries', 'Terrace']
    },
    organizer: {
      id: 'biz_3',
      type: 'business',
      name: 'Café de Paris',
      avatar: 'https://images.unsplash.com/photo-1561336635-c0e118ad72a0?w=150',
      businessType: 'cafe',
      rating: 4.7,
      totalEvents: 38,
      verified: true
    },
    price: 0,
    currency: 'EUR',
    tags: ['conversation', 'culture', 'coffee'],
    isUserJoined: false,
    externalSource: 'evento',
    externalId: 'evt_fr_002'
  },
  {
    id: '6',
    title: 'Dutch Conversation Practice',
    description: 'Perfect for expats learning Dutch! Practice everyday conversations in a relaxed restaurant setting with local speakers.',
    language: 'Dutch',
    languageFlag: '🇳🇱',
    level: 'beginner',
    date: '24 Nov, 25',
    time: '18:00',
    duration: 120,
    attendees: [
      'https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?w=150',
      'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=150',
      'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150'
    ],
    totalAttendees: 12,
    maxAttendees: 12,
    joinedPercentage: 90,
    type: 'restaurant',
    isVirtual: false,
    location: 'De Rode Leeuw',
    venue: {
      name: 'De Rode Leeuw',
      address: 'Grote Markt 31',
      city: 'Den Haag',
      coordinates: { lat: 52.0775, lng: 4.3125 },
      photos: ['https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400'],
      amenities: ['Traditional Dutch Food', 'Central Location', 'Group Tables']
    },
    organizer: {
      id: 'biz_4',
      type: 'business',
      name: 'De Rode Leeuw Restaurant',
      avatar: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=150',
      businessType: 'restaurant',
      rating: 4.6,
      totalEvents: 24,
      verified: true
    },
    price: 0,
    currency: 'EUR',
    tags: ['beginners', 'dutch-culture', 'food'],
    isUserJoined: true,
    externalSource: 'internal'
  },
  {
    id: '7',
    title: 'German Language Exchange',
    description: 'Virtual German practice for intermediate learners. Focus on pronunciation and conversational fluency.',
    language: 'German',
    languageFlag: '🇩🇪',
    level: 'intermediate',
    date: '24 Nov, 25',
    time: '19:30',
    duration: 60,
    attendees: [
      'https://images.unsplash.com/photo-1590086782792-42dd2350140d?w=150',
      'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=150'
    ],
    totalAttendees: 9,
    maxAttendees: 15,
    joinedPercentage: 65,
    type: 'online',
    isVirtual: true,
    location: 'Online via Google Meet',
    meetingLink: 'https://meet.google.com/xyz-abc-def',
    organizer: {
      id: 'user_3',
      type: 'user',
      name: 'Hans Mueller',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
      hostingCount: 34,
      attendanceRate: 97,
      verified: true,
      bio: 'German teacher with 10 years experience. Let\'s improve together!'
    },
    price: 0,
    currency: 'EUR',
    tags: ['online', 'pronunciation', 'intermediate'],
    isUserJoined: false,
    externalSource: 'internal'
  },
  {
    id: '8',
    title: 'English Conversation Club',
    description: 'Weekly English conversation club for non-native speakers. Discuss current events, practice business English, and make friends!',
    language: 'English',
    languageFlag: '🇬🇧',
    level: 'all',
    date: '25 Nov, 25',
    time: '17:00',
    duration: 90,
    attendees: [
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150',
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150'
    ],
    totalAttendees: 14,
    maxAttendees: 20,
    joinedPercentage: 72,
    type: 'coffee',
    isVirtual: false,
    location: 'Starbucks, Centrum',
    venue: {
      name: 'Starbucks',
      address: 'Spui 30',
      city: 'Den Haag',
      coordinates: { lat: 52.0793, lng: 4.3158 },
      photos: ['https://images.unsplash.com/photo-1593536488177-1eb3c2d4e3d2?w=400'],
      amenities: ['WiFi', 'Long Tables', 'Central Location']
    },
    organizer: {
      id: 'biz_5',
      type: 'business',
      name: 'Starbucks Centrum',
      avatar: 'https://images.unsplash.com/photo-1561336635-c0e118ad72a0?w=150',
      businessType: 'cafe',
      rating: 4.5,
      totalEvents: 67,
      verified: true
    },
    price: 0,
    currency: 'EUR',
    tags: ['all-levels', 'business-english', 'networking'],
    isUserJoined: false,
    externalSource: 'evento',
    externalId: 'evt_en_003'
  }
];

export const languageCategories = ['All', 'Spanish', 'Japanese', 'French', 'Dutch', 'German', 'English'];
