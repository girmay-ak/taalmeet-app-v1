# Web App Architecture Guide - Separate Web Application

## 🎯 Your Goal: Separate Web App with Landing Page

You want to create a **dedicated web application** with:
- Marketing landing pages
- Full web experience (not just mobile app on web)
- Separate from mobile app but sharing backend

---

## 📐 Architecture Options

### Option 1: Monorepo (Recommended) ⭐
**Same repository, separate apps**

```
taalmeet-app-v1/
├── apps/
│   ├── mobile/          # React Native (Expo) app
│   │   ├── app/
│   │   ├── components/
│   │   └── package.json
│   └── web/             # Next.js/React web app
│       ├── pages/
│       ├── components/
│       └── package.json
├── packages/
│   ├── shared/          # Shared code
│   │   ├── services/    # Supabase services
│   │   ├── hooks/       # React Query hooks
│   │   ├── types/       # TypeScript types
│   │   └── utils/       # Utilities
│   └── ui/              # Shared UI components
├── package.json         # Root package.json
└── turbo.json           # Turborepo config (optional)
```

**Pros:**
- ✅ Share code (services, hooks, types)
- ✅ Single repository
- ✅ Consistent features
- ✅ Easier maintenance

**Cons:**
- ⚠️ More complex setup
- ⚠️ Need monorepo tooling (Turborepo/Nx)

---

### Option 2: Separate Repositories
**Two independent repositories**

```
taalmeet-mobile/         # Current React Native app
taalmeet-web/            # New Next.js web app
```

**Pros:**
- ✅ Simple setup
- ✅ Independent deployments
- ✅ Different teams can work separately
- ✅ Different tech stacks if needed

**Cons:**
- ❌ Code duplication (services, types)
- ❌ Need to sync changes
- ❌ More maintenance overhead

---

## 🏗️ Recommended Architecture: Monorepo with Turborepo

### Structure

```
taalmeet-monorepo/
├── apps/
│   ├── mobile/                    # React Native (Expo)
│   │   ├── app/                   # Expo Router pages
│   │   ├── components/            # Mobile-specific components
│   │   ├── hooks/                 # Mobile hooks (if needed)
│   │   ├── package.json
│   │   └── app.json
│   │
│   └── web/                       # Next.js Web App
│       ├── app/                   # Next.js App Router
│       │   ├── (marketing)/       # Landing pages
│       │   │   ├── page.tsx       # Home/Landing
│       │   │   ├── about/
│       │   │   ├── pricing/
│       │   │   └── contact/
│       │   ├── (auth)/            # Auth pages
│       │   │   ├── login/
│       │   │   └── signup/
│       │   └── (app)/             # Main app (after login)
│       │       ├── dashboard/
│       │       ├── discover/
│       │       ├── chat/
│       │       └── profile/
│       ├── components/
│       │   ├── marketing/         # Landing page components
│       │   │   ├── Hero.tsx
│       │   │   ├── Features.tsx
│       │   │   ├── Testimonials.tsx
│       │   │   └── CTA.tsx
│       │   └── app/               # App components
│       ├── lib/                   # Web-specific libs
│       ├── public/                # Static assets
│       ├── package.json
│       └── next.config.js
│
├── packages/
│   ├── shared/                    # Shared code
│   │   ├── services/              # Supabase services
│   │   │   ├── authService.ts
│   │   │   ├── userService.ts
│   │   │   ├── messagesService.ts
│   │   │   └── index.ts
│   │   ├── hooks/                 # React Query hooks
│   │   │   ├── useAuth.ts
│   │   │   ├── useMessages.ts
│   │   │   └── index.ts
│   │   ├── types/                 # TypeScript types
│   │   │   ├── database.ts
│   │   │   ├── user.ts
│   │   │   └── index.ts
│   │   ├── utils/                 # Utilities
│   │   │   ├── errors.ts
│   │   │   ├── validators.ts
│   │   │   └── index.ts
│   │   ├── config/                # Shared config
│   │   │   └── supabase.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   └── ui/                        # Shared UI components
│       ├── Button.tsx
│       ├── Input.tsx
│       ├── Card.tsx
│       ├── package.json
│       └── tsconfig.json
│
├── package.json                   # Root package.json
├── turbo.json                     # Turborepo config
├── pnpm-workspace.yaml            # or npm/yarn workspaces
└── README.md
```

---

## 🎨 Web App Tech Stack Recommendation

### Framework: **Next.js 14+ (App Router)** ⭐

**Why Next.js?**
- ✅ Server-side rendering (SSR)
- ✅ Static site generation (SSG) for landing pages
- ✅ API routes (if needed)
- ✅ Great SEO for marketing pages
- ✅ Excellent performance
- ✅ Easy deployment (Vercel)

### Styling: **Tailwind CSS**

**Why Tailwind?**
- ✅ Already using NativeWind in mobile
- ✅ Consistent design system
- ✅ Fast development
- ✅ Responsive design

### State Management: **React Query (TanStack Query)**

**Why?**
- ✅ Already using in mobile app
- ✅ Share hooks from `packages/shared`
- ✅ Server state management
- ✅ Caching & synchronization

### Backend: **Supabase** (Shared)

**Why?**
- ✅ Already using in mobile
- ✅ Share services from `packages/shared`
- ✅ Real-time features
- ✅ Authentication

---

## 📄 Landing Page Structure

### Pages Needed

```
web/app/(marketing)/
├── page.tsx              # Home/Landing page
├── about/
│   └── page.tsx          # About us
├── features/
│   └── page.tsx          # Features page
├── pricing/
│   └── page.tsx          # Pricing (if premium)
├── contact/
│   └── page.tsx          # Contact us
├── blog/                 # Blog (optional)
│   └── [slug]/
│       └── page.tsx
└── legal/
    ├── privacy/
    │   └── page.tsx      # Privacy policy
    └── terms/
        └── page.tsx      # Terms of service
```

### Landing Page Sections

1. **Hero Section**
   - Headline + subheadline
   - CTA buttons (Sign Up, Learn More)
   - Hero image/video

2. **Features Section**
   - Key features with icons
   - Benefits for users

3. **How It Works**
   - Step-by-step process
   - Visual flow

4. **Testimonials**
   - User reviews
   - Social proof

5. **Pricing** (if applicable)
   - Free vs Premium
   - Feature comparison

6. **FAQ Section**
   - Common questions
   - Answers

7. **CTA Section**
   - Final call-to-action
   - Sign up form

8. **Footer**
   - Links
   - Social media
   - Legal links

---

## 🔄 Data Sharing Strategy

### Shared Services Package

```typescript
// packages/shared/services/userService.ts
export async function getProfile(userId: string) {
  // Same code used by both mobile and web
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  
  if (error) throw error;
  return data;
}
```

### Shared Hooks Package

```typescript
// packages/shared/hooks/useAuth.ts
export function useAuth() {
  // Same hook used by both mobile and web
  return useQuery({
    queryKey: ['auth', 'session'],
    queryFn: getSession,
  });
}
```

### Platform-Specific Implementations

```typescript
// apps/web/lib/supabase.ts (Web-specific)
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      storage: typeof window !== 'undefined' 
        ? window.localStorage 
        : undefined,
    },
  }
);

// apps/mobile/lib/supabase.ts (Mobile-specific)
import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';

export const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL!,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      storage: {
        getItem: (key) => SecureStore.getItemAsync(key),
        setItem: (key, value) => SecureStore.setItemAsync(key, value),
        removeItem: (key) => SecureStore.deleteItemAsync(key),
      },
    },
  }
);
```

---

## 🚀 Implementation Steps

### Phase 1: Setup Monorepo (Week 1)

1. **Install Turborepo**
   ```bash
   npm install -g turbo
   npx create-turbo@latest taalmeet-monorepo
   ```

2. **Move current mobile app**
   ```bash
   mv taalmeet-app-v1 apps/mobile
   ```

3. **Create web app**
   ```bash
   cd apps
   npx create-next-app@latest web --typescript --tailwind --app
   ```

4. **Create shared packages**
   ```bash
   mkdir -p packages/shared packages/ui
   ```

### Phase 2: Extract Shared Code (Week 2)

1. **Move services to shared package**
   - Move `services/` → `packages/shared/services/`
   - Update imports

2. **Move hooks to shared package**
   - Move `hooks/` → `packages/shared/hooks/`
   - Update imports

3. **Move types to shared package**
   - Move `types/` → `packages/shared/types/`
   - Update imports

### Phase 3: Build Landing Pages (Week 3-4)

1. **Create landing page structure**
   - Hero section
   - Features section
   - How it works
   - Testimonials
   - CTA sections

2. **Design system**
   - Create shared UI components
   - Set up Tailwind theme
   - Responsive design

3. **SEO optimization**
   - Meta tags
   - Open Graph
   - Structured data

### Phase 4: Build Web App (Week 5-6)

1. **Auth pages**
   - Login
   - Sign up
   - Password reset

2. **Main app pages**
   - Dashboard
   - Discover
   - Chat
   - Profile

3. **Web-specific features**
   - Desktop layouts
   - Keyboard shortcuts
   - Browser features

---

## 📦 Package.json Structure

### Root package.json

```json
{
  "name": "taalmeet-monorepo",
  "private": true,
  "workspaces": [
    "apps/*",
    "packages/*"
  ],
  "scripts": {
    "dev": "turbo run dev",
    "build": "turbo run build",
    "lint": "turbo run lint",
    "mobile": "turbo run dev --filter=mobile",
    "web": "turbo run dev --filter=web"
  },
  "devDependencies": {
    "turbo": "^1.10.0"
  }
}
```

### Web app package.json

```json
{
  "name": "web",
  "version": "1.0.0",
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start"
  },
  "dependencies": {
    "next": "^14.0.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "@tanstack/react-query": "^5.17.19",
    "@supabase/supabase-js": "^2.39.3",
    "shared": "workspace:*",
    "ui": "workspace:*"
  }
}
```

---

## 🎨 Landing Page Design Ideas

### Modern Landing Page Sections

1. **Hero with Video/Animation**
   - Animated globe showing connections
   - Language exchange visualization
   - Strong headline: "Connect. Learn. Speak."

2. **Interactive Features**
   - Live demo of matching
   - Language selector
   - Distance calculator

3. **Social Proof**
   - User count
   - Success stories
   - Language pairs available

4. **Visual Storytelling**
   - Before/After scenarios
   - User journey map
   - Feature highlights with animations

---

## 🔗 Integration Points

### Shared Backend (Supabase)
- Same database
- Same authentication
- Same real-time features
- Same API

### Shared Business Logic
- User matching algorithm
- Language detection
- Distance calculations
- Gamification system

### Different UI/UX
- Mobile: Touch-optimized, native feel
- Web: Mouse/keyboard, desktop layouts

---

## 📊 Comparison: Monorepo vs Separate Repos

| Aspect | Monorepo | Separate Repos |
|--------|----------|----------------|
| Code Sharing | ✅ Easy | ❌ Manual sync |
| Maintenance | ✅ Single source | ❌ Duplicate work |
| Deployment | ⚠️ Separate | ✅ Independent |
| Team Workflow | ⚠️ Need coordination | ✅ Independent |
| Setup Complexity | ⚠️ More complex | ✅ Simple |
| **Recommendation** | ⭐ **Best for you** | Good for large teams |

---

## 🎯 My Recommendation

**Use Monorepo with Turborepo** because:
1. ✅ You're building both apps
2. ✅ Share 70%+ of code (services, hooks, types)
3. ✅ Consistent features
4. ✅ Easier maintenance
5. ✅ Single source of truth

**Tech Stack:**
- **Mobile:** React Native (Expo) - Current
- **Web:** Next.js 14 + Tailwind CSS
- **Shared:** Services, Hooks, Types in `packages/shared`
- **Backend:** Supabase (shared)

---

## 🚀 Quick Start Guide

### Step 1: Create Monorepo Structure

```bash
# Create new monorepo
npx create-turbo@latest taalmeet-monorepo
cd taalmeet-monorepo

# Move current app
mv ../taalmeet-app-v1 apps/mobile

# Create web app
cd apps
npx create-next-app@latest web --typescript --tailwind --app
```

### Step 2: Create Shared Packages

```bash
# Create shared package
mkdir -p packages/shared/src
cd packages/shared

# Initialize package
npm init -y

# Move shared code
cp -r ../../apps/mobile/services src/
cp -r ../../apps/mobile/hooks src/
cp -r ../../apps/mobile/types src/
```

### Step 3: Set Up Workspaces

```json
// Root package.json
{
  "workspaces": ["apps/*", "packages/*"]
}
```

### Step 4: Install Dependencies

```bash
# From root
npm install

# Install in each workspace
cd apps/web && npm install
cd apps/mobile && npm install
cd packages/shared && npm install
```

---

## 📝 Next Steps

1. **Decide on architecture** (Monorepo recommended)
2. **Set up monorepo structure**
3. **Extract shared code**
4. **Build landing pages**
5. **Build web app features**
6. **Deploy both apps**

Would you like me to help you set up the monorepo structure?

