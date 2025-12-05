# TaalMeet Web App

Web application for TaalMeet - Language Exchange Platform

## 🚀 Quick Start

### Install Dependencies

```bash
cd web
npm install
```

### Development

```bash
npm run dev
```

The app will start at `http://localhost:3000`

### Build

```bash
npm run build
```

## 📁 Structure

```
web/
├── src/
│   ├── screens/         # All screen components
│   ├── components/      # UI components
│   ├── logos/          # Logo assets
│   ├── data/           # Mock data (to be replaced)
│   └── styles/         # Global styles
├── index.html          # Entry point
├── vite.config.ts      # Vite configuration
└── package.json        # Dependencies
```

## 🔗 Shared Code

The web app can access shared code from the parent directory:

- **Services:** `@/shared/services` - Supabase services
- **Hooks:** `@/shared/hooks` - React Query hooks
- **Types:** `@/shared/types` - TypeScript types
- **Utils:** `@/shared/utils` - Utility functions
- **Lib:** `@/shared/lib` - Library code (Supabase client, etc.)

## 🎨 Design System

- **Framework:** React + TypeScript
- **Styling:** Tailwind CSS
- **UI Components:** Radix UI
- **Animations:** Framer Motion
- **Icons:** Lucide React

## 📝 Next Steps

1. ✅ Copy Figma design files
2. ⏳ Install dependencies
3. ⏳ Integrate Supabase backend
4. ⏳ Replace mock data with real API calls
5. ⏳ Connect shared services and hooks
6. ⏳ Add authentication
7. ⏳ Deploy

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the `web/` directory:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 📚 Documentation

- See `WEB_INTEGRATION_PLAN.md` for integration details
- See `WEB_APP_ARCHITECTURE.md` for architecture decisions

