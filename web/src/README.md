# TaalMeet Mobile App Prototype 🗣️

A fully functional, interactive mobile web app prototype for TaalMeet - a language exchange platform connecting people who want to learn and teach languages.

**Tagline:** "Meet. Speak. Connect."

## ✨ Features Implemented

### **NEW! Redesigned Home Page & Bottom Navigation** 🎨

**🏠 Home Page (Discover) - Events/Meetups Layout:**
- **Header Section:**
  - Profile avatar with "Welcome 👋 [Name]"
  - Notification bell with green indicator
  - "All Language Meetups" subtitle
  - "Happening Today" with event count badge
  
- **Language Filter Tabs:**
  - All, Spanish, Japanese, French, Dutch, German, English
  - White background for active tab
  - Gray outline for inactive tabs
  - Horizontal scroll for mobile
  
- **Meetup Cards:**
  - Event title, date, and time
  - Join percentage indicator (e.g., "75% Joined")
  - Participant avatars with overflow count (e.g., "+12")
  - Arrow navigation button
  - Subtle background tints per language
  - Grouped by language category
  
- **Online Nearby Section (Preserved):**
  - Avatar bubbles with online status
  - Distance indicators
  - Quick access to active partners

**📱 New Bottom Navigation:**
- **Home** - Discover meetups and partners
- **Maps** - Interactive partner map
- **Available** - Set your availability status (NEW!)
- **Chat** - Messages and conversations
- **Profile** - Your profile settings

**🕐 Available Screen (NEW!):**
- Toggle availability on/off with animated switch
- Choose "Available Now" or "Available Later"
- Schedule picker (date & time)
- Preferred location selection:
  - Coffee shops, parks, online video calls
  - Distance indicators
- Visual confirmation when active
- Clean, modern UI with green accents

### **🟢 Complete Availability Feature System** ✨

**🎯 Availability Status Management:**
- **4 Status Types:**
  - 🟢 **Available Now** - Ready to chat or meet immediately
  - 🟡 **Available Soon** - Free in 1-2 hours  
  - 🔴 **Busy** - Not available right now
  - ⚫ **Offline** - Invisible mode
  
- **Quick Toggle Bottom Sheet:**
  - Tap to change status instantly
  - Select time limits (30m, 1h, 2h, all day)
  - Choose meeting preferences (☕ in-person, 📹 video, 📞 call, 💬 chat)
  - Beautiful animated interface
  
- **Full Schedule Management:**
  - Set weekly recurring availability
  - Add/remove time slots per day
  - Visual schedule calendar
  - Automatic reminders

**📅 Weekly Schedule Features:**
- Add multiple time slots per day
- Set recurring weekly patterns
- Time zone support (Amsterdam GMT+1)
- Quick actions to add/remove slots
- Beautiful collapsible day views

**🔔 Smart Notifications:**
- Get notified when favorites come online
- "Partners available nearby" alerts
- Meeting reminders
- Availability expiring warnings
- Custom notification preferences

**👥 Partner Availability Display:**
- Status badges on partner cards (🟢 Available, 🟡 Soon, 🔴 Busy)
- Time remaining indicators ("Free for 2h")
- Meeting preference icons (☕ 📹 📞 💬)
- Real-time status updates
- Online/offline indicators with green dots

**⚙️ Preferences & Settings:**
- Meeting type preferences (in-person, video, voice, chat)
- Time zone configuration
- Notification controls
- Privacy settings
- Auto-off timers with extend options

**🎨 Visual Elements:**
- Color-coded status (Green/Yellow/Red/Gray)
- Animated status transitions
- Pulse animations for available users
- Countdown timers
- Beautiful gradient buttons

### Complete Signup & Onboarding Flow ✅

**🎬 Onboarding (3 Slides)**
- Beautiful illustrated slides with smooth animations
- Skip functionality
- Custom gradients per slide
- Pagination dots

**📝 Signup Flow (4 Steps)**
- **Step 1: Create Account**
  - Full name, email, password, confirm password
  - Real-time password strength indicator (Weak/Fair/Good/Strong)
  - Password requirements checklist (8+ chars, uppercase, number)
  - Progress indicator (1/4)
  
- **Step 2: Your Languages**
  - Searchable language selection
  - "I want to learn" - Multiple language selection
  - "I can teach" - Single language with proficiency level
    - Native, Advanced (C1-C2), Intermediate (B1-B2), Beginner (A1-A2)
  - Selected languages summary chips
  - Progress indicator (2/4)
  
- **Step 3: Your Location**
  - City input with autocomplete
  - Country dropdown with flags
  - Mini map preview with animated pin
  - "Enable GPS" button for auto-detection
  - Privacy protection notice
  - Progress indicator (3/4)
  
- **Step 4: Complete Profile**
  - Avatar upload with camera icon
  - Bio textarea (150 character limit with counter)
  - Interest selection (16 options, max 8)
    - Selected interests show green gradient
  - Terms & Privacy Policy checkbox (required)
  - Progress indicator (4/4)

**🎉 Success Screen**
- Animated celebration with pulse effects
- Feature preview cards
- "Discover Partners" CTA
- "Complete Profile Later" option

### Phase 1 MVP Screens (Complete!)

✅ **Authentication**
- Modern login screen with email/password
- Social login buttons (Google, Apple)
- Form validation and loading states
- Smooth animations

✅ **Discover Tab**
- Partner discovery with smart cards
- Online nearby section (horizontal scroll)
- Quick filters (Available Now, Near Me, Verified, Premium)
- Search functionality
- Match percentage indicators
- Real-time availability status

✅ **Messages Tab**
- Conversation list with unread indicators
- Pinned conversations
- Tabs: All, Unread, Archived
- Empty states
- Search conversations

✅ **Chat Screen**
- Real-time chat interface
- Message bubbles (sent/received)
- Online status and typing indicators
- Video/voice call buttons
- Emoji picker support
- Image/attachment buttons

✅ **Map View**
- Interactive partner map
- Partner markers with avatars
- Pulse animations for available users
- Bottom sheet with partner list
- Expandable/collapsible view
- Location controls

✅ **Connections Tab**
- Three tabs: Connections, Requests, Suggested
- Connection request management
- Quick actions (Accept/Decline)
- Partner suggestions

✅ **Profile Screen**
- User profile with stats
- Edit profile options
- Languages (teaching/learning) with proficiency bars
- Interests tags
- Availability toggle
- Premium upgrade banner
- Settings and account options

✅ **Partner Profile**
- Detailed partner information
- Reviews and ratings
- Languages and proficiency
- Match score
- Quick actions (Chat, Video Call, Favorite)
- Report/block options

## 🎨 Design System

**NEW TaalMeet Green Brand Colors:**
- Primary Green: #1DB954
- Light Green: #1ED760
- Dark Green: #169640
- Secondary Teal: #5FB3B3
- Background: Dark (#0F0F0F)
- Cards: #1A1A1A
- Success: #10B981

**Typography:**
- Headers: Outfit (bold, modern)
- Body: DM Sans (readable, clean)

**Components:**
- Gradient buttons with hover effects
- Card-based layouts
- Smooth animations with Motion/React
- Interactive micro-interactions
- Bottom navigation with badges

## 🚀 Tech Stack

- **React** - UI framework
- **TypeScript** - Type safety
- **Tailwind CSS v4** - Styling
- **Motion (Framer Motion)** - Animations
- **Lucide React** - Icons

## 📱 Mobile-First Design

- Optimized for iPhone 14 Pro (393px width)
- Touch-friendly interactions
- Smooth transitions
- Pull-to-refresh ready
- Bottom navigation for thumb zone accessibility

## 🎯 Key Interactions

1. **Bottom Nav** - Tap to switch between main tabs
2. **Partner Cards** - Tap to view profile, inline actions for message/like
3. **Chat** - Real-time messaging with send button
4. **Map** - Tap markers to see details, expandable bottom sheet
5. **Connections** - Accept/decline requests, connect with suggested partners

## 🎭 Animations & Effects

- Page transitions with slide effect
- Card entrance animations (stagger)
- Pulse rings for online/available status
- Shimmer loading states
- Button press feedback
- Smooth scroll

## 📊 Mock Data

The app includes realistic mock data for:
- 6 diverse language partners
- 5 conversations with unread counts
- 3 reviews per partner
- Current user profile

## 🔄 Navigation Flow

```
Login → Discover (Default)
         ├─→ Partner Profile → Chat
         ├─→ Map → Partner Profile
         ├─→ Messages → Chat
         ├─→ Connections → Partner Profile
         └─→ Profile
```

## 💡 Next Steps

To extend this prototype:
1. Add Signup multi-step flow
2. Implement filter modal
3. Add onboarding screens
4. Create events/meetups screen
5. Build settings screens
6. Add notification center
7. Integrate real backend (Supabase suggested)
8. Add real-time features with WebSocket
9. Implement geolocation APIs
10. Add payment for Premium

## 🎨 Design Highlights

- **Unique Typography** - Outfit + DM Sans (avoiding generic fonts)
- **Bold Gradients** - Pink/teal theme stands out
- **Micro-interactions** - Pulse animations, scale feedback
- **Dark Theme** - Easy on eyes, modern aesthetic
- **Glassmorphism** - Subtle backdrop blur effects

## 📸 Screenshots

Check out these key screens:
- 🏠 Discover: Partner browsing with filters
- 💬 Messages: Clean conversation list
- 🗺️ Map: Interactive partner map
- 👤 Profile: Comprehensive user profile
- 💭 Chat: Beautiful messaging interface

---

Built with ❤️ for TaalMeet - Connect. Learn. Grow.