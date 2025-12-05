# Web App Integration Plan

## 📋 Overview

Integrating Figma AI design from `Languageflagexchangemapwebapp` repository into TaalMeet app for web development.

## 🎯 Source Repository

- **Repo:** `git@github.com:girmay-ak/Languageflagexchangemapwebapp.git`
- **Location:** `figma-design/` (cloned locally)
- **Tech Stack:** Vite + React + TypeScript + Tailwind CSS + Radix UI

## 📁 Structure Analysis

### Figma Design Repo Contains:
- ✅ Complete landing page
- ✅ All screens (Login, Signup, Discover, Chat, Map, Profile, etc.)
- ✅ UI components (Radix UI based)
- ✅ Logos and assets
- ✅ Design system (colors, typography)
- ✅ Mock data

### Current Repo Has:
- ✅ Backend services (Supabase)
- ✅ React Query hooks
- ✅ TypeScript types
- ✅ Mobile app (React Native/Expo)
- ✅ Shared business logic

## 🔄 Integration Strategy

### Option 1: Monorepo Structure (Recommended)
```
taalmeet-app-v1/
├── apps/
│   ├── mobile/          # Current React Native app
│   └── web/             # New Next.js web app (from Figma design)
├── packages/
│   ├── shared/          # Shared services, hooks, types
│   └── ui/              # Shared UI components
```

### Option 2: Simple Integration (Faster)
```
taalmeet-app-v1/
├── app/                 # Mobile app (current)
├── web/                 # Web app (new, from Figma design)
├── services/            # Shared services
├── hooks/               # Shared hooks
└── types/               # Shared types
```

## 📝 Integration Steps

### Phase 1: Setup Web App Structure
1. Create `web/` directory
2. Copy Figma design files
3. Install dependencies
4. Set up build configuration

### Phase 2: Integrate Backend
1. Connect Supabase services
2. Replace mock data with real API calls
3. Integrate React Query hooks
4. Add authentication

### Phase 3: Adapt Components
1. Replace mock data with real data
2. Connect to backend services
3. Add error handling
4. Implement loading states

### Phase 4: Shared Code
1. Extract shared services
2. Share hooks between mobile/web
3. Share types
4. Create shared UI components

## 🚀 Quick Start

1. Copy Figma design to `web/` directory
2. Install dependencies: `cd web && npm install`
3. Start dev server: `npm run dev`
4. Begin backend integration

## 📦 Files to Copy

### Essential:
- `src/screens/` - All screen components
- `src/components/` - UI components
- `src/logos/` - Logo assets
- `package.json` - Dependencies
- `vite.config.ts` - Build config
- `index.html` - Entry point

### To Adapt:
- Replace mock data with API calls
- Connect to Supabase
- Use shared hooks
- Integrate authentication

## 🎨 Design System

The Figma design uses:
- **Colors:** Green theme (#1DB954)
- **Typography:** Outfit + DM Sans
- **Components:** Radix UI
- **Animations:** Framer Motion
- **Styling:** Tailwind CSS

## ✅ Next Actions

1. ✅ Clone Figma design repo
2. ⏳ Create web app structure
3. ⏳ Copy and adapt files
4. ⏳ Integrate backend
5. ⏳ Test and deploy

