# TAALMEET - Language Exchange Mobile App

A location-based language exchange mobile app built with React Native, Expo, and Supabase.

## 🚀 Tech Stack

- **React Native** (Expo SDK 54)
- **TypeScript**
- **Expo Router** (file-based routing)
- **Supabase** (Auth, Database, Realtime)
- **React Query** (data fetching & caching)
- **React Hook Form + Zod** (form validation)
- **NativeWind** (Tailwind CSS for React Native)
- **Expo Maps + Reanimated** (maps & animations)

## 📦 Installation

```bash
# Install dependencies
make install

# Copy environment variables
cp .env.example .env
# Then edit .env with your Supabase credentials
```

## 🏃 Development

```bash
# Start development server
make start

# Run on iOS simulator
make ios

# Run on Android emulator
make android

# Run on web
make web
```

## 🛠️ Available Commands

Run `make help` to see all available commands.

## 📁 Project Structure

```
app/
  (auth)/           # Authentication screens
  (onboarding)/     # Onboarding flow
  (tabs)/           # Main app tabs
components/         # Reusable UI components
hooks/              # Custom React hooks
services/           # API & data services
lib/                # Third-party integrations
types/              # TypeScript type definitions
utils/              # Utility functions
supabase/           # Database migrations
```

## 🔐 Environment Variables

Your `.env` file has been configured with your Supabase credentials:

- ✅ Supabase URL: `https://auplkesuhnjbgbawxrxh.supabase.co`
- ✅ Supabase Anon Key: Configured
- ✅ Mapbox Token: Configured

Create a `.env` file in the root directory with the following variables:
- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`
- `EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN`
- `EXPO_PUBLIC_GOOGLE_MAPS_API_KEY`

## 📱 Features

- User authentication
- Location-based user discovery
- Real-time messaging
- Language preferences
- Profile management
- Interactive maps

## 🗄️ Database

Database migrations are in the `supabase/migrations/` folder.

## 📝 Code Quality

```bash
# Lint code
make lint

# Format code
make format

# Type check
make typecheck
```

## 🏗️ Building

```bash
# Development build
make build-dev

# Production build
make build-prod
```

## 📄 License

MIT

