# Web Backend Integration Plan

## Overview
This document outlines the complete plan for integrating the TaalMeet web app with the Supabase backend. The web app currently uses mock data and needs to be connected to real services, hooks, and providers.

---

## Phase 1: Core Infrastructure Setup

### 1.1 Environment Configuration
- [ ] Create `web/.env` file with Supabase credentials
- [ ] Add `.env.example` template
- [ ] Update `vite.config.ts` to load environment variables
- [ ] Add TypeScript types for environment variables

### 1.2 Supabase Client Setup
- [ ] Create `web/src/lib/supabase.ts` (web-optimized version)
  - Use `localStorage` instead of `SecureStore` (web-compatible)
  - Configure auth with web-specific settings
  - Export typed Supabase client
- [ ] Create `web/src/lib/config.ts` for environment variables
- [ ] Add database type definitions

### 1.3 React Query Setup
- [ ] Create `web/src/lib/query-client.ts`
- [ ] Create `web/src/providers/QueryProvider.tsx`
- [ ] Configure React Query with optimal defaults for web
- [ ] Add error handling and retry logic

### 1.4 Authentication Provider
- [ ] Create `web/src/providers/AuthProvider.tsx`
  - Handle auth state changes
  - Provide auth context
  - Handle session persistence
  - Redirect logic for protected routes
- [ ] Create `web/src/hooks/useAuth.ts` (web version)
- [ ] Add auth guards for protected routes

---

## Phase 2: Authentication & User Management

### 2.1 Authentication Screens
- [ ] **LoginScreen** (`web/src/screens/LoginScreen.tsx`)
  - Replace mock auth with `useAuth()` hook
  - Integrate `authService.signIn()`
  - Add error handling and loading states
  - Handle email/password and OAuth flows

- [ ] **SignupFlow** (`web/src/screens/signup/`)
  - Integrate `authService.signUp()`
  - Connect profile creation to `profileService`
  - Add validation with React Hook Form + Zod
  - Handle multi-step form state

- [ ] **SplashScreen** (`web/src/screens/SplashScreen.tsx`)
  - Check auth state on load
  - Redirect based on authentication status

### 2.2 User Profile
- [ ] **ProfileScreen** (`web/src/screens/ProfileScreen.tsx`)
  - Use `useProfile()` hook
  - Integrate `profileService.getProfile()`
  - Add edit functionality with `profileService.updateProfile()`
  - Handle profile image uploads

- [ ] **EditProfileModal** (`web/src/components/modals/EditProfileModal.tsx`)
  - Connect to `profileService.updateProfile()`
  - Add image upload with `storageService`

---

## Phase 3: Discovery & Matching

### 3.1 Discovery Screens
- [ ] **DiscoverScreen** (`web/src/screens/DiscoverScreen.tsx`)
  - Replace mock data with `useDiscover()` hook
  - Integrate `discoverService.getNearbyUsers()`
  - Add filters with `useDiscoveryFilters()`
  - Implement infinite scroll/pagination

- [ ] **DiscoverScreenDesktop** (`web/src/screens/DiscoverScreenDesktop.tsx`)
  - Same integration as mobile version
  - Optimize for desktop layout

- [ ] **Discovery Filters**
  - Integrate `discoveryFilterService`
  - Connect filter UI to backend preferences
  - Apply filters to discovery queries

### 3.2 Partner Profiles
- [ ] **PartnerProfileScreen** (`web/src/screens/PartnerProfileScreen.tsx`)
  - Use `useUser()` hook to fetch partner data
  - Integrate connection requests
  - Add match score display
  - Show availability status

- [ ] **PartnerCard** (`web/src/components/PartnerCard.tsx`)
  - Connect to real user data
  - Add connection request functionality

---

## Phase 4: Connections & Messaging

### 4.1 Connections
- [ ] **ConnectionsScreen** (`web/src/screens/ConnectionsScreen.tsx`)
  - Use `useConnections()` hook
  - Integrate `connectionsService.getConnections()`
  - Add accept/reject connection requests
  - Show connection status

- [ ] **Connection Notifications**
  - Integrate `useConnectionNotifications()`
  - Add real-time connection updates

### 4.2 Messaging
- [ ] **MessagesScreen** (`web/src/screens/MessagesScreen.tsx`)
  - Use `useMessages()` hook
  - Integrate `messagesService.getConversations()`
  - Add real-time message updates
  - Show unread message counts

- [ ] **MessagesScreenDesktop** (`web/src/screens/MessagesScreenDesktop.tsx`)
  - Same integration as mobile
  - Optimize for desktop layout

- [ ] **ChatScreen** (`web/src/screens/ChatScreen.tsx`)
  - Use `useMessages()` for message history
  - Integrate `messagesService.sendMessage()`
  - Add real-time message subscriptions
  - Handle typing indicators
  - Add message read receipts

- [ ] **ConversationCard** (`web/src/components/ConversationCard.tsx`)
  - Connect to real conversation data
  - Show last message and timestamp
  - Display unread count

---

## Phase 5: Map & Location

### 5.1 Map Screens
- [ ] **MapScreen** (`web/src/screens/MapScreen.tsx`)
  - Integrate `useLocation()` hook
  - Use `locationService.updateLocation()`
  - Show nearby users on map
  - Add map markers with user data

- [ ] **EnhancedMapScreen** (`web/src/screens/EnhancedMapScreen.tsx`)
  - Integrate location services
  - Add clustering for many users
  - Show user details on marker click
  - Add search functionality

- [ ] **MapView** (`web/src/components/MapView.tsx`)
  - Connect to location data
  - Update markers in real-time
  - Handle map interactions

---

## Phase 6: Availability & Sessions

### 6.1 Availability
- [ ] **AvailableScreen** (`web/src/screens/AvailableScreen.tsx`)
  - Use `useAvailability()` hook
  - Integrate `availabilityService.getAvailability()`
  - Add time slot management
  - Show availability calendar

- [ ] **AvailabilityBottomSheet** (`web/src/components/AvailabilityBottomSheet.tsx`)
  - Connect to `availabilityService`
  - Add time slot creation/editing
  - Handle availability updates

- [ ] **TimeSlotModal** (`web/src/components/TimeSlotModal.tsx`)
  - Integrate time slot CRUD operations
  - Add validation

### 6.2 Sessions
- [ ] **SessionDetailScreen** (`web/src/screens/SessionDetailScreen.tsx`)
  - Use `useSessions()` hook
  - Integrate `sessionService.getSessions()`
  - Add session booking functionality
  - Show session history

- [ ] **SessionCard** (`web/src/components/SessionCard.tsx`)
  - Connect to real session data
  - Add session actions (join, cancel, etc.)

---

## Phase 7: Settings & Preferences

### 7.1 Settings
- [ ] **SettingsScreen** (`web/src/screens/SettingsScreen.tsx`)
  - Integrate user preferences
  - Add notification settings
  - Connect to `preferencesService`
  - Add account management

### 7.2 Language Preferences
- [ ] **LanguagePreferencesScreen** (`web/src/screens/LanguagePreferencesScreen.tsx`)
  - Use `usePreferences()` hook
  - Integrate language preference updates
  - Connect to `preferencesService`

- [ ] **LanguageEditorModal** (`web/src/components/modals/LanguageEditorModal.tsx`)
  - Add language selection
  - Update user languages

### 7.3 Privacy & Safety
- [ ] **PrivacySafetyScreen** (`web/src/screens/PrivacySafetyScreen.tsx`)
  - Integrate `safetyService`
  - Add block/report functionality
  - Connect to `moderationService`
  - Add privacy settings

---

## Phase 8: Additional Features

### 8.1 Notifications
- [ ] **NotificationsScreen** (`web/src/screens/NotificationsScreen.tsx`)
  - Use `useNotifications()` hook
  - Integrate `notificationsService`
  - Add real-time notification updates
  - Mark notifications as read

- [ ] **Notification Preferences**
  - Connect to notification settings
  - Add preference management

### 8.2 Help & Support
- [ ] **HelpSupportScreen** (`web/src/screens/HelpSupportScreen.tsx`)
  - Use `useHelp()` hook
  - Integrate `helpService`
  - Add FAQ display
  - Add support ticket creation

### 8.3 Gamification
- [ ] Integrate `useGamification()` hook
- [ ] Show user achievements
- [ ] Display points and badges
- [ ] Add leaderboard (if applicable)

### 8.4 Groups & Communities
- [ ] Use `useGroups()` hook
- [ ] Integrate `groupsService`
- [ ] Add group creation/joining
- [ ] Show group posts and events

### 8.5 Translation Features
- [ ] Use `useTranslation()` hook
- [ ] Integrate `translationService`
- [ ] Add in-chat translation
- [ ] Add vocabulary builder

---

## Phase 9: Real-time Features

### 9.1 Supabase Realtime
- [ ] Set up real-time subscriptions for messages
- [ ] Add real-time connection updates
- [ ] Implement real-time location updates
- [ ] Add real-time notification delivery
- [ ] Handle connection status (online/offline)

### 9.2 WebSocket Optimization
- [ ] Optimize real-time subscriptions for web
- [ ] Add connection pooling
- [ ] Handle reconnection logic
- [ ] Add offline queue for messages

---

## Phase 10: Data Migration & Mock Data Removal

### 10.1 Remove Mock Data
- [ ] Remove `web/src/data/mockData.ts` usage
- [ ] Remove `web/src/data/mockNotifications.ts` usage
- [ ] Remove `web/src/data/mockSessions.ts` usage
- [ ] Replace all mock data imports with hooks

### 10.2 Data Validation
- [ ] Add Zod schemas for all API responses
- [ ] Validate data on fetch
- [ ] Add error boundaries
- [ ] Handle loading and error states

---

## Phase 11: Performance & Optimization

### 11.1 Query Optimization
- [ ] Implement query caching strategies
- [ ] Add pagination for large lists
- [ ] Optimize image loading
- [ ] Add lazy loading for routes

### 11.2 Bundle Optimization
- [ ] Code split by route
- [ ] Lazy load heavy components
- [ ] Optimize imports
- [ ] Add service worker for caching

---

## Phase 12: Error Handling & UX

### 12.1 Error Handling
- [ ] Add global error boundary
- [ ] Handle API errors gracefully
- [ ] Show user-friendly error messages
- [ ] Add retry mechanisms

### 12.2 Loading States
- [ ] Add skeleton loaders
- [ ] Show loading indicators
- [ ] Handle empty states
- [ ] Add optimistic updates

### 12.3 Toast Notifications
- [ ] Integrate toast system (sonner)
- [ ] Show success/error messages
- [ ] Add action confirmations

---

## Implementation Order (Recommended)

### Week 1: Foundation
1. Phase 1: Core Infrastructure Setup
2. Phase 2: Authentication & User Management

### Week 2: Core Features
3. Phase 3: Discovery & Matching
4. Phase 4: Connections & Messaging

### Week 3: Advanced Features
5. Phase 5: Map & Location
6. Phase 6: Availability & Sessions
7. Phase 7: Settings & Preferences

### Week 4: Polish & Optimization
8. Phase 8: Additional Features
9. Phase 9: Real-time Features
10. Phase 10: Data Migration
11. Phase 11: Performance & Optimization
12. Phase 12: Error Handling & UX

---

## File Structure After Integration

```
web/
├── src/
│   ├── lib/
│   │   ├── supabase.ts          # Web Supabase client
│   │   ├── config.ts            # Environment config
│   │   └── query-client.ts      # React Query setup
│   ├── providers/
│   │   ├── AuthProvider.tsx     # Auth context
│   │   └── QueryProvider.tsx    # React Query provider
│   ├── hooks/
│   │   └── useAuth.ts           # Web auth hook
│   ├── services/                # (Optional) Web-specific service wrappers
│   └── ...
├── .env                         # Environment variables
└── .env.example                 # Environment template
```

---

## Dependencies to Add

```json
{
  "@supabase/supabase-js": "^2.39.3",
  "@tanstack/react-query": "^5.17.19",
  "react-hook-form": "^7.55.0",
  "zod": "^3.22.4"
}
```

---

## Testing Checklist

- [ ] Authentication flow (login, signup, logout)
- [ ] Profile management (view, edit, upload image)
- [ ] Discovery feed with filters
- [ ] Connection requests (send, accept, reject)
- [ ] Messaging (send, receive, real-time)
- [ ] Map functionality (location, markers)
- [ ] Availability management
- [ ] Settings and preferences
- [ ] Error handling and edge cases
- [ ] Real-time updates
- [ ] Performance (loading times, bundle size)

---

## Notes

- All services and hooks from the mobile app can be reused
- Web-specific adaptations needed for:
  - Storage (localStorage vs SecureStore)
  - Navigation (React Router vs Expo Router)
  - UI components (web components vs React Native)
- Consider creating web-specific service wrappers if needed
- Maintain consistency with mobile app API contracts

