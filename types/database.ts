export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: ProfileInsert;
        Update: ProfileUpdate;
      };
      user_languages: {
        Row: UserLanguage;
        Insert: UserLanguageInsert;
        Update: UserLanguageUpdate;
      };
      users: {
        Row: User;
        Insert: UserInsert;
        Update: UserUpdate;
      };
      locations: {
        Row: Location;
        Insert: LocationInsert;
        Update: LocationUpdate;
      };
      conversations: {
        Row: Conversation;
        Insert: ConversationInsert;
        Update: ConversationUpdate;
      };
      conversation_participants: {
        Row: ConversationParticipant;
        Insert: ConversationParticipantInsert;
        Update: ConversationParticipantUpdate;
      };
      messages: {
        Row: Message;
        Insert: MessageInsert;
        Update: MessageUpdate;
      };
      matches: {
        Row: Match;
        Insert: MatchInsert;
        Update: MatchUpdate;
      };
      connections: {
        Row: Connection;
        Insert: ConnectionInsert;
        Update: ConnectionUpdate;
      };
      availability_status: {
        Row: AvailabilityStatus;
        Insert: AvailabilityStatusInsert;
        Update: AvailabilityStatusUpdate;
      };
      weekly_schedule: {
        Row: WeeklySchedule;
        Insert: WeeklyScheduleInsert;
        Update: WeeklyScheduleUpdate;
      };
      language_sessions: {
        Row: LanguageSession;
        Insert: LanguageSessionInsert;
        Update: LanguageSessionUpdate;
      };
      session_participants: {
        Row: SessionParticipant;
        Insert: SessionParticipantInsert;
        Update: SessionParticipantUpdate;
      };
      discovery_preferences: {
        Row: DiscoveryPreferences;
        Insert: DiscoveryPreferencesInsert;
        Update: DiscoveryPreferencesUpdate;
      };
      blocked_users: {
        Row: BlockedUser;
        Insert: BlockedUserInsert;
        Update: BlockedUserUpdate;
      };
      reports: {
        Row: Report;
        Insert: ReportInsert;
        Update: ReportUpdate;
      };
      user_actions: {
        Row: UserAction;
        Insert: UserActionInsert;
        Update: UserActionUpdate;
      };
      device_tokens: {
        Row: DeviceToken;
        Insert: DeviceTokenInsert;
        Update: DeviceTokenUpdate;
      };
      notification_preferences: {
        Row: NotificationPreferences;
        Insert: NotificationPreferencesInsert;
        Update: NotificationPreferencesUpdate;
      };
      help_articles: {
        Row: HelpArticle;
        Insert: HelpArticleInsert;
        Update: HelpArticleUpdate;
      };
      faqs: {
        Row: FAQ;
        Insert: FAQInsert;
        Update: FAQUpdate;
      };
      support_tickets: {
        Row: SupportTicket;
        Insert: SupportTicketInsert;
        Update: SupportTicketUpdate;
      };
      support_ticket_messages: {
        Row: SupportTicketMessage;
        Insert: SupportTicketMessageInsert;
        Update: never;
      };
      discovery_filter_preferences: {
        Row: DiscoveryFilterPreferences;
        Insert: DiscoveryFilterPreferencesInsert;
        Update: DiscoveryFilterPreferencesUpdate;
      };
      translation_preferences: {
        Row: TranslationPreferences;
        Insert: TranslationPreferencesInsert;
        Update: TranslationPreferencesUpdate;
      };
      translation_history: {
        Row: TranslationHistory;
        Insert: TranslationHistoryInsert;
        Update: never;
      };
      vocabulary: {
        Row: Vocabulary;
        Insert: VocabularyInsert;
        Update: VocabularyUpdate;
      };
    };
  };
}

// ============================================================================
// PROFILES TABLE (New schema)
// ============================================================================

export interface Profile {
  id: string;
  display_name: string;
  avatar_url: string | null;
  bio: string | null;
  city: string | null;
  country: string | null;
  lat: number | null;
  lng: number | null;
  is_online: boolean;
  last_active_at: string;
  created_at: string;
  updated_at: string;
}

export interface ProfileInsert {
  id: string;
  display_name: string;
  avatar_url?: string | null;
  bio?: string | null;
  city?: string | null;
  country?: string | null;
  lat?: number | null;
  lng?: number | null;
  is_online?: boolean;
  last_active_at?: string;
}

export interface ProfileUpdate {
  display_name?: string;
  avatar_url?: string | null;
  bio?: string | null;
  city?: string | null;
  country?: string | null;
  lat?: number | null;
  lng?: number | null;
  is_online?: boolean;
  last_active_at?: string;
}

// ============================================================================
// USERS TABLE (Legacy - kept for backward compatibility)
// ============================================================================

export interface User {
  id: string;
  email: string;
  full_name: string;
  username: string | null;
  bio: string | null;
  avatar_url: string | null;
  city: string | null;
  country: string | null;
  interests: string[] | null;
  date_of_birth: string | null;
  gender: string | null;
  is_online: boolean;
  last_seen_at: string;
  created_at: string;
  updated_at: string;
}

export interface UserInsert {
  id: string;
  email: string;
  full_name: string;
  username?: string | null;
  bio?: string | null;
  avatar_url?: string | null;
  city?: string | null;
  country?: string | null;
  interests?: string[] | null;
  date_of_birth?: string | null;
  gender?: string | null;
  is_online?: boolean;
  last_seen_at?: string;
}

export interface UserUpdate {
  full_name?: string;
  username?: string | null;
  bio?: string | null;
  avatar_url?: string | null;
  city?: string | null;
  country?: string | null;
  interests?: string[] | null;
  date_of_birth?: string | null;
  gender?: string | null;
  is_online?: boolean;
  last_seen_at?: string;
}

// ============================================================================
// USER_LANGUAGES TABLE (New schema)
// ============================================================================

export interface UserLanguage {
  id: string;
  user_id: string;
  language: string; // e.g., "Spanish", "English"
  level: 'native' | 'advanced' | 'intermediate' | 'beginner' | null;
  role: 'teaching' | 'learning';
  created_at: string;
  updated_at: string;
}

export interface UserLanguageInsert {
  user_id: string;
  language: string;
  level?: 'native' | 'advanced' | 'intermediate' | 'beginner' | null;
  role: 'teaching' | 'learning';
}

export interface UserLanguageUpdate {
  language?: string;
  level?: 'native' | 'advanced' | 'intermediate' | 'beginner' | null;
  role?: 'teaching' | 'learning';
}

export interface Location {
  id: string;
  user_id: string;
  latitude: number;
  longitude: number;
  accuracy: number | null;
  updated_at: string;
}

export interface LocationInsert {
  user_id: string;
  latitude: number;
  longitude: number;
  accuracy?: number | null;
}

export interface LocationUpdate {
  latitude?: number;
  longitude?: number;
  accuracy?: number | null;
}

// ============================================================================
// CONVERSATIONS TABLE
// ============================================================================

export interface Conversation {
  id: string;
  created_at: string;
  updated_at: string;
  last_message_at: string | null;
  last_message_content: string | null;
  last_message_sender_id: string | null;
}

export interface ConversationInsert {
  id?: string;
  created_at?: string;
  updated_at?: string;
  last_message_at?: string | null;
  last_message_content?: string | null;
  last_message_sender_id?: string | null;
}

export interface ConversationUpdate {
  updated_at?: string;
  last_message_at?: string | null;
  last_message_content?: string | null;
  last_message_sender_id?: string | null;
}

// ============================================================================
// CONVERSATION_PARTICIPANTS TABLE
// ============================================================================

export interface ConversationParticipant {
  id: string;
  conversation_id: string;
  user_id: string;
  last_read_at: string | null;
  joined_at: string;
}

export interface ConversationParticipantInsert {
  conversation_id: string;
  user_id: string;
  last_read_at?: string | null;
  joined_at?: string;
}

export interface ConversationParticipantUpdate {
  last_read_at?: string | null;
}

// ============================================================================
// MESSAGES TABLE
// ============================================================================

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  is_read: boolean;
  read_at: string | null;
}

export interface MessageInsert {
  conversation_id: string;
  sender_id: string;
  content: string;
  is_read?: boolean;
}

export interface MessageUpdate {
  content?: string;
  is_read?: boolean;
  read_at?: string | null;
}

export interface Match {
  id: string;
  user_id_1: string;
  user_id_2: string;
  status: 'pending' | 'accepted' | 'rejected';
  matched_at: string | null;
  created_at: string;
}

export interface MatchInsert {
  user_id_1: string;
  user_id_2: string;
  status?: 'pending' | 'accepted' | 'rejected';
}

export interface MatchUpdate {
  status?: 'pending' | 'accepted' | 'rejected';
  matched_at?: string | null;
}

// ============================================================================
// CONNECTIONS TABLE
// ============================================================================

export interface Connection {
  id: string;
  user_id: string;
  partner_id: string;
  status: 'pending' | 'accepted' | 'rejected' | 'blocked';
  match_score: number;
  created_at: string;
  updated_at: string;
  accepted_at: string | null;
}

export interface ConnectionInsert {
  user_id: string;
  partner_id: string;
  status?: 'pending' | 'accepted' | 'rejected' | 'blocked';
  match_score?: number;
}

export interface ConnectionUpdate {
  status?: 'pending' | 'accepted' | 'rejected' | 'blocked';
  match_score?: number;
  accepted_at?: string | null;
}

// ============================================================================
// AVAILABILITY_STATUS TABLE
// ============================================================================

export interface AvailabilityStatus {
  id: string;
  user_id: string;
  status: 'available' | 'soon' | 'busy' | 'offline';
  duration_minutes: number | null;
  until: string | null;
  preferences: string[]; // JSONB stored as array
  created_at: string;
  updated_at: string;
}

export interface AvailabilityStatusInsert {
  user_id: string;
  status?: 'available' | 'soon' | 'busy' | 'offline';
  duration_minutes?: number | null;
  until?: string | null;
  preferences?: string[];
}

export interface AvailabilityStatusUpdate {
  status?: 'available' | 'soon' | 'busy' | 'offline';
  duration_minutes?: number | null;
  until?: string | null;
  preferences?: string[];
}

// ============================================================================
// WEEKLY_SCHEDULE TABLE
// ============================================================================

export interface WeeklySchedule {
  id: string;
  user_id: string;
  day_of_week: number; // 0=Sunday, 1=Monday, ..., 6=Saturday
  start_time: string; // Format: HH:MM:SS
  end_time: string; // Format: HH:MM:SS
  repeat_weekly: boolean;
  created_at: string;
  updated_at: string;
}

export interface WeeklyScheduleInsert {
  user_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  repeat_weekly?: boolean;
}

export interface WeeklyScheduleUpdate {
  day_of_week?: number;
  start_time?: string;
  end_time?: string;
  repeat_weekly?: boolean;
}

// ============================================================================
// LANGUAGE_SESSIONS TABLE
// ============================================================================

export interface LanguageSession {
  id: string;
  title: string;
  language: string;
  host_user_id: string;
  starts_at: string;
  ends_at: string;
  location: string | null;
  is_online: boolean;
  capacity: number;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface LanguageSessionInsert {
  title: string;
  language: string;
  host_user_id: string;
  starts_at: string;
  ends_at: string;
  location?: string | null;
  is_online?: boolean;
  capacity?: number;
  description?: string | null;
}

export interface LanguageSessionUpdate {
  title?: string;
  language?: string;
  starts_at?: string;
  ends_at?: string;
  location?: string | null;
  is_online?: boolean;
  capacity?: number;
  description?: string | null;
}

// ============================================================================
// SESSION_PARTICIPANTS TABLE
// ============================================================================

export interface SessionParticipant {
  id: string;
  session_id: string;
  user_id: string;
  status: 'joined' | 'waitlisted' | 'left';
  joined_at: string;
  created_at: string;
}

export interface SessionParticipantInsert {
  session_id: string;
  user_id: string;
  status?: 'joined' | 'waitlisted' | 'left';
}

export interface SessionParticipantUpdate {
  status?: 'joined' | 'waitlisted' | 'left';
}

// ============================================================================
// DISCOVERY_PREFERENCES TABLE
// ============================================================================

export interface DiscoveryPreferences {
  id: string;
  user_id: string;
  only_my_languages: boolean;
  show_nearby_first: boolean;
  max_distance_km: number;
  min_match_score: number;
  meeting_type: string[];
  preferred_levels: string[];
  created_at: string;
  updated_at: string;
}

export interface DiscoveryPreferencesInsert {
  user_id: string;
  only_my_languages?: boolean;
  show_nearby_first?: boolean;
  max_distance_km?: number;
  min_match_score?: number;
  meeting_type?: string[];
  preferred_levels?: string[];
}

export interface DiscoveryPreferencesUpdate {
  only_my_languages?: boolean;
  show_nearby_first?: boolean;
  max_distance_km?: number;
  min_match_score?: number;
  meeting_type?: string[];
  preferred_levels?: string[];
}

// ============================================================================
// BLOCKED_USERS TABLE
// ============================================================================

export interface BlockedUser {
  id: string;
  blocker_id: string;
  blocked_id: string;
  created_at: string;
}

export interface BlockedUserInsert {
  blocker_id: string;
  blocked_id: string;
}

export interface BlockedUserUpdate {
  // No updates allowed (immutable)
}

// ============================================================================
// REPORTS TABLE
// ============================================================================

export interface Report {
  id: string;
  reporter_id: string;
  target_id: string;
  reason: string;
  message: string | null;
  status: 'pending' | 'reviewing' | 'resolved' | 'dismissed' | 'action_taken';
  admin_notes: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  action_taken_id: string | null;
  created_at: string;
}

export interface ReportInsert {
  reporter_id: string;
  target_id: string;
  reason: string;
  message?: string | null;
}

export interface ReportUpdate {
  status?: 'pending' | 'reviewing' | 'resolved' | 'dismissed' | 'action_taken';
  admin_notes?: string | null;
  reviewed_by?: string | null;
  reviewed_at?: string | null;
  action_taken_id?: string | null;
}

// ============================================================================
// USER_ACTIONS TABLE
// ============================================================================

export interface UserAction {
  id: string;
  user_id: string;
  action_type: 'warning' | 'suspension' | 'ban';
  reason: string;
  details: string | null;
  duration_days: number | null;
  expires_at: string | null;
  is_active: boolean;
  created_by: string | null;
  created_at: string;
  resolved_at: string | null;
  resolved_by: string | null;
}

export interface UserActionInsert {
  user_id: string;
  action_type: 'warning' | 'suspension' | 'ban';
  reason: string;
  details?: string | null;
  duration_days?: number | null;
  expires_at?: string | null;
  created_by?: string | null;
}

export interface UserActionUpdate {
  is_active?: boolean;
  resolved_at?: string | null;
  resolved_by?: string | null;
}

// ============================================================================
// DEVICE_TOKENS TABLE
// ============================================================================

export interface DeviceToken {
  id: string;
  user_id: string;
  token: string;
  device_id: string | null;
  platform: 'ios' | 'android' | 'web';
  app_version: string | null;
  device_info: Record<string, any> | null;
  is_active: boolean;
  last_used_at: string;
  created_at: string;
  updated_at: string;
}

export interface DeviceTokenInsert {
  user_id: string;
  token: string;
  device_id?: string | null;
  platform: 'ios' | 'android' | 'web';
  app_version?: string | null;
  device_info?: Record<string, any> | null;
}

export interface DeviceTokenUpdate {
  is_active?: boolean;
  last_used_at?: string;
}

// ============================================================================
// NOTIFICATION_PREFERENCES TABLE
// ============================================================================

export interface NotificationPreferences {
  id: string;
  user_id: string;
  push_enabled: boolean;
  new_message_enabled: boolean;
  connection_request_enabled: boolean;
  connection_accepted_enabled: boolean;
  match_found_enabled: boolean;
  session_reminder_enabled: boolean;
  session_starting_soon_enabled: boolean;
  achievement_unlocked_enabled: boolean;
  weekly_summary_enabled: boolean;
  marketing_enabled: boolean;
  quiet_hours_start: string | null;
  quiet_hours_end: string | null;
  timezone: string;
  created_at: string;
  updated_at: string;
}

export interface NotificationPreferencesInsert {
  user_id: string;
  push_enabled?: boolean;
  new_message_enabled?: boolean;
  connection_request_enabled?: boolean;
  connection_accepted_enabled?: boolean;
  match_found_enabled?: boolean;
  session_reminder_enabled?: boolean;
  session_starting_soon_enabled?: boolean;
  achievement_unlocked_enabled?: boolean;
  weekly_summary_enabled?: boolean;
  marketing_enabled?: boolean;
  quiet_hours_start?: string | null;
  quiet_hours_end?: string | null;
  timezone?: string;
}

export interface NotificationPreferencesUpdate {
  push_enabled?: boolean;
  new_message_enabled?: boolean;
  connection_request_enabled?: boolean;
  connection_accepted_enabled?: boolean;
  match_found_enabled?: boolean;
  session_reminder_enabled?: boolean;
  session_starting_soon_enabled?: boolean;
  achievement_unlocked_enabled?: boolean;
  weekly_summary_enabled?: boolean;
  marketing_enabled?: boolean;
  quiet_hours_start?: string | null;
  quiet_hours_end?: string | null;
  timezone?: string;
}

// ============================================================================
// HELP_ARTICLES TABLE
// ============================================================================

export interface HelpArticle {
  id: string;
  title: string;
  slug: string;
  content: string;
  category: 'getting_started' | 'features' | 'troubleshooting' | 'account' | 'safety' | 'payments' | 'other';
  tags: string[] | null;
  order_index: number;
  is_published: boolean;
  view_count: number;
  created_at: string;
  updated_at: string;
  created_by: string | null;
}

export interface HelpArticleInsert {
  title: string;
  slug: string;
  content: string;
  category: 'getting_started' | 'features' | 'troubleshooting' | 'account' | 'safety' | 'payments' | 'other';
  tags?: string[] | null;
  order_index?: number;
  is_published?: boolean;
  created_by?: string | null;
}

export interface HelpArticleUpdate {
  title?: string;
  slug?: string;
  content?: string;
  category?: 'getting_started' | 'features' | 'troubleshooting' | 'account' | 'safety' | 'payments' | 'other';
  tags?: string[] | null;
  order_index?: number;
  is_published?: boolean;
}

// ============================================================================
// FAQS TABLE
// ============================================================================

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: 'general' | 'account' | 'connections' | 'messages' | 'safety' | 'payments' | 'technical' | 'other';
  order_index: number;
  is_published: boolean;
  view_count: number;
  helpful_count: number;
  not_helpful_count: number;
  created_at: string;
  updated_at: string;
  created_by: string | null;
}

export interface FAQInsert {
  question: string;
  answer: string;
  category: 'general' | 'account' | 'connections' | 'messages' | 'safety' | 'payments' | 'technical' | 'other';
  order_index?: number;
  is_published?: boolean;
  created_by?: string | null;
}

export interface FAQUpdate {
  question?: string;
  answer?: string;
  category?: 'general' | 'account' | 'connections' | 'messages' | 'safety' | 'payments' | 'technical' | 'other';
  order_index?: number;
  is_published?: boolean;
}

// ============================================================================
// SUPPORT_TICKETS TABLE
// ============================================================================

export interface SupportTicket {
  id: string;
  user_id: string;
  subject: string;
  category: 'account' | 'technical' | 'billing' | 'safety' | 'feature_request' | 'bug_report' | 'other';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'waiting_user' | 'resolved' | 'closed';
  assigned_to: string | null;
  first_message: string;
  last_message_at: string;
  resolved_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface SupportTicketInsert {
  user_id: string;
  subject: string;
  category: 'account' | 'technical' | 'billing' | 'safety' | 'feature_request' | 'bug_report' | 'other';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  first_message: string;
}

export interface SupportTicketUpdate {
  subject?: string;
  category?: 'account' | 'technical' | 'billing' | 'safety' | 'feature_request' | 'bug_report' | 'other';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  status?: 'open' | 'in_progress' | 'waiting_user' | 'resolved' | 'closed';
  assigned_to?: string | null;
  resolved_at?: string | null;
}

// ============================================================================
// SUPPORT_TICKET_MESSAGES TABLE
// ============================================================================

export interface SupportTicketMessage {
  id: string;
  ticket_id: string;
  sender_id: string;
  message: string;
  is_internal: boolean;
  attachments: Record<string, any> | null;
  created_at: string;
}

export interface SupportTicketMessageInsert {
  ticket_id: string;
  sender_id: string;
  message: string;
  is_internal?: boolean;
  attachments?: Record<string, any> | null;
}

// ============================================================================
// DISCOVERY_FILTER_PREFERENCES TABLE
// ============================================================================

export interface DiscoveryFilterPreferences {
  id: string;
  user_id: string;
  max_distance: number;
  preferred_languages: string[] | null;
  gender_preference: 'all' | 'male' | 'female' | 'other' | 'prefer_not_to_say';
  availability_filter: boolean;
  timezone_match: boolean;
  min_match_score: number;
  created_at: string;
  updated_at: string;
}

export interface DiscoveryFilterPreferencesInsert {
  user_id: string;
  max_distance?: number;
  preferred_languages?: string[] | null;
  gender_preference?: 'all' | 'male' | 'female' | 'other' | 'prefer_not_to_say';
  availability_filter?: boolean;
  timezone_match?: boolean;
  min_match_score?: number;
}

export interface DiscoveryFilterPreferencesUpdate {
  max_distance?: number;
  preferred_languages?: string[] | null;
  gender_preference?: 'all' | 'male' | 'female' | 'other' | 'prefer_not_to_say';
  availability_filter?: boolean;
  timezone_match?: boolean;
  min_match_score?: number;
}

// ============================================================================
// TRANSLATION_PREFERENCES TABLE
// ============================================================================

export interface TranslationPreferences {
  id: string;
  user_id: string;
  auto_translate_enabled: boolean;
  default_target_language: string | null;
  show_original_text: boolean;
  translation_provider: 'libretranslate' | 'google' | 'microsoft';
  created_at: string;
  updated_at: string;
}

export interface TranslationPreferencesInsert {
  user_id: string;
  auto_translate_enabled?: boolean;
  default_target_language?: string | null;
  show_original_text?: boolean;
  translation_provider?: 'libretranslate' | 'google' | 'microsoft';
}

export interface TranslationPreferencesUpdate {
  auto_translate_enabled?: boolean;
  default_target_language?: string | null;
  show_original_text?: boolean;
  translation_provider?: 'libretranslate' | 'google' | 'microsoft';
}

// ============================================================================
// TRANSLATION_HISTORY TABLE
// ============================================================================

export interface TranslationHistory {
  id: string;
  user_id: string;
  original_text: string;
  translated_text: string;
  source_language: string;
  target_language: string;
  detected_language: string | null;
  context: string | null;
  message_id: string | null;
  created_at: string;
}

export interface TranslationHistoryInsert {
  user_id: string;
  original_text: string;
  translated_text: string;
  source_language: string;
  target_language: string;
  detected_language?: string | null;
  context?: string | null;
  message_id?: string | null;
}

// ============================================================================
// VOCABULARY TABLE
// ============================================================================

export interface Vocabulary {
  id: string;
  user_id: string;
  word: string;
  translation: string;
  source_language: string;
  target_language: string;
  example_sentence: string | null;
  difficulty_level: number;
  times_reviewed: number;
  last_reviewed_at: string | null;
  mastery_level: number;
  tags: string[] | null;
  created_at: string;
  updated_at: string;
}

export interface VocabularyInsert {
  user_id: string;
  word: string;
  translation: string;
  source_language: string;
  target_language: string;
  example_sentence?: string | null;
  difficulty_level?: number;
  tags?: string[] | null;
}

export interface VocabularyUpdate {
  example_sentence?: string | null;
  difficulty_level?: number;
  times_reviewed?: number;
  last_reviewed_at?: string | null;
  mastery_level?: number;
  tags?: string[] | null;
}

