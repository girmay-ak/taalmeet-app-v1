# Web App Setup Guide

## ✅ What's Been Done

1. ✅ Cloned Figma AI design from `Languageflagexchangemapwebapp` repo
2. ✅ Copied all files to `web/` directory
3. ✅ Updated Vite config with shared code path aliases
4. ✅ Created README and documentation

## 🚀 Next Steps

### 1. Install Dependencies

```bash
cd web
npm install
```

### 2. Set Up Environment Variables

Create `web/.env`:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Start Development Server

```bash
npm run dev
```

### 4. Integrate Backend

Replace mock data with real API calls:

- [ ] Connect Supabase client
- [ ] Replace mock data in screens
- [ ] Use shared hooks from `@/shared/hooks`
- [ ] Use shared services from `@/shared/services`
- [ ] Add authentication flow
- [ ] Connect real-time features

## 📁 File Structure

```
web/
├── src/
│   ├── screens/          # All screen components
│   │   ├── LandingPage.tsx
│   │   ├── LoginScreen.tsx
│   │   ├── DiscoverScreen.tsx
│   │   ├── ChatScreen.tsx
│   │   └── ...
│   ├── components/       # UI components
│   │   ├── ui/          # Radix UI components
│   │   └── ...
│   ├── logos/           # Logo assets
│   ├── data/            # Mock data (to replace)
│   └── styles/          # Global styles
├── index.html
├── vite.config.ts
└── package.json
```

## 🔗 Accessing Shared Code

The web app can now access shared code using path aliases:

```typescript
// Services
import { authService } from '@/shared/services';

// Hooks
import { useAuth } from '@/shared/hooks';

// Types
import { User } from '@/shared/types';

// Utils
import { parseSupabaseError } from '@/shared/utils';
```

## 🎨 Design System

- **Framework:** React 18 + TypeScript
- **Build Tool:** Vite
- **Styling:** Tailwind CSS
- **UI Components:** Radix UI
- **Animations:** Framer Motion
- **Icons:** Lucide React

## 📝 Integration Checklist

- [x] Copy Figma design files
- [x] Set up Vite configuration
- [x] Add path aliases for shared code
- [ ] Install dependencies
- [ ] Set up environment variables
- [ ] Integrate Supabase client
- [ ] Replace mock data
- [ ] Add authentication
- [ ] Connect real-time features
- [ ] Test and deploy

## 🐛 Troubleshooting

### Port Already in Use

If port 3000 is in use, update `vite.config.ts`:

```typescript
server: {
  port: 3001, // Change port
}
```

### Module Resolution Issues

Make sure path aliases are correctly set in `vite.config.ts` and `tsconfig.json`.

### Shared Code Not Found

Ensure you're using the correct path aliases:
- `@/shared/services` (not `../services`)
- `@/shared/hooks` (not `../hooks`)

