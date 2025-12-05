# 📸 TaalMeet Screenshot Guide for React Native Development

## Quick Access

To access the screenshot gallery, add `?screenshots` to your URL:
```
http://localhost:5173/?screenshots
```

Or use the hash:
```
http://localhost:5173/#screenshots
```

## What You'll Find

The screenshot gallery includes **20+ screens** organized into categories:

### 🔐 Auth Screens (3 screens)
- Splash Screen - App launch animation
- Login Screen - User authentication
- Signup Flow - Multi-step registration

### 🏠 Main Screens (3 screens)
- Home (Mobile) - Main discovery feed
- Home (Desktop) - Dashboard with analytics
- Discover (Desktop) - Partner discovery with split view

### 💬 Social Screens (6 screens)
- Messages (Mobile) - Conversations list
- Messages (Desktop) - Split-view messaging
- Chat Screen - One-on-one chat
- Connections - Manage connections
- Available Status - Set availability
- Partner Profile - View partner details

### ⚙️ Settings Screens (4 screens)
- User Profile - Your profile
- Settings - App settings
- Language Preferences - Manage languages
- Privacy & Safety - Privacy controls
- Help & Support - Get help

### 🗺️ Map Screens (2 screens)
- Basic Map - Map view
- Enhanced Map - Advanced map features

## How to Take Screenshots

### Method 1: Individual Screen Screenshots
1. Click on any screen card in the gallery
2. The screen will open in full-size modal
3. Use your system screenshot tool:
   - **Mac:** `Cmd + Shift + 4` (then select area)
   - **Windows:** `Windows + Shift + S`
   - **Linux:** `Print Screen` or `Shift + Print Screen`

### Method 2: Browser Screenshot Tools
Use browser extensions for full-page captures:
- **Chrome/Edge:** [GoFullPage](https://chrome.google.com/webstore)
- **Firefox:** Built-in screenshot tool (`Shift + F2`, type `screenshot`)

### Method 3: Developer Tools
1. Open browser DevTools (`F12`)
2. Toggle device toolbar (`Cmd/Ctrl + Shift + M`)
3. Set to iPhone 14 Pro (393 x 852)
4. Use DevTools screenshot feature

## Organizing Your Screenshots

### Recommended Naming Convention
```
TaalMeet_[Category]_[ScreenName]_[Platform].png

Examples:
TaalMeet_Auth_Login_Mobile.png
TaalMeet_Social_Messages_Desktop.png
TaalMeet_Main_Discover_Mobile.png
```

### Folder Structure for Cursor
```
screenshots/
├── mobile/
│   ├── auth/
│   │   ├── splash.png
│   │   ├── login.png
│   │   └── signup.png
│   ├── main/
│   │   ├── home.png
│   │   └── discover.png
│   ├── social/
│   │   ├── messages.png
│   │   ├── chat.png
│   │   ├── connections.png
│   │   └── partner-profile.png
│   ├── settings/
│   │   ├── profile.png
│   │   ├── settings.png
│   │   ├── language-preferences.png
│   │   └── privacy-safety.png
│   └── maps/
│       └── map.png
└── desktop/
    ├── home.png
    ├── discover.png
    ├── messages.png
    └── enhanced-map.png
```

## Important Notes for React Native

### Mobile Screens (Priority)
Focus on capturing these mobile screens with accurate dimensions:
- **Target Size:** 393 x 852 (iPhone 14 Pro)
- These are the primary screens for React Native conversion

### Design System to Document
When sharing with Cursor, include these design tokens:

#### Colors
```
Primary Green: #1DB954, #1ED760
Teal: #5FB3B3
Background Dark: #0A0A0A
Card Dark: #1A1A1A
Text: #FFFFFF
Text Muted: #9CA3AF
Border: #2A2A2A
```

#### Typography
- Font Family: System fonts (SF Pro on iOS, Roboto on Android)
- Heading sizes, body text sizes
- Font weights used

#### Spacing & Layout
- Border radius values (e.g., 16px, 24px)
- Padding/margin patterns
- Component spacing

#### Components
- Bottom Navigation (5 tabs)
- Cards with glassmorphism
- Gradient buttons
- Badge notifications
- Avatar with premium indicator
- Language pills
- Status badges

### Features to Highlight
1. **Dark Theme** - Entire app uses dark mode
2. **Animations** - Spring animations, page transitions
3. **Glassmorphism** - Backdrop blur effects on cards
4. **Gradients** - Primary gradient for CTAs
5. **Icons** - Lucide icons throughout
6. **Bottom Sheet** - For filters and actions
7. **Map Integration** - Leaflet/Mapbox style maps
8. **Real-time** - Message indicators, online status
9. **Accessibility** - High contrast, clear labels

## Tips for Cursor Prompt

When giving screenshots to Cursor, structure your prompt like this:

```
I'm building a React Native language exchange app called TaalMeet. 

Design System:
- Dark theme with green (#1DB954, #1ED760) and teal (#5FB3B3) accents
- Mobile-first, optimized for iPhone 14 Pro (393x852)
- Glassmorphism UI, spring animations, bottom navigation

Screens attached: [List the screen names]

Please create a React Native app with:
1. React Navigation (Stack + Bottom Tabs)
2. TypeScript
3. Theme system using React Context
4. Reusable components (cards, buttons, badges)
5. Mock data for development

[Attach your screenshots here]
```

## Toggle Between Views

Use the **Mobile/Desktop** toggle in the gallery to switch between:
- 📱 **Mobile View** - Shows mobile-optimized screens (393px width)
- 💻 **Desktop View** - Shows desktop screens with sidebar layout

## Category Filters

Click category buttons to filter screens:
- **All** - Show everything
- **Auth** - Authentication flows
- **Main** - Core app screens
- **Social** - Messaging and connections
- **Settings** - Profile and preferences
- **Maps** - Location-based features

---

## Need Help?

If you encounter any issues with the screenshot gallery:
1. Refresh the page
2. Try a different browser
3. Clear browser cache
4. Check console for errors

Good luck with your React Native development! 🚀
