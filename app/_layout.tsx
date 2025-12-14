import '@/global.css';
import { Slot } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ThemeProvider } from '@/lib/theme/ThemeProvider';
import { QueryProvider } from '@/providers/QueryProvider';
import { AuthProvider } from '@/providers/AuthProvider';
import { MatchFoundProvider } from '@/providers/MatchFoundProvider';
import { GlobalMatchFoundPopup } from '@/components/matches/GlobalMatchFoundPopup';
import { useColorScheme } from 'react-native';
import { PushNotificationsSetup } from '@/components/notifications/PushNotificationsSetup';
import { initializeMapbox } from '@/utils/mapboxConfig';

export default function RootLayout() {
  const colorScheme = useColorScheme();

  // Initialize Mapbox on app startup
  useEffect(() => {
    const initialized = initializeMapbox();
    if (!initialized) {
      console.warn('[App] Mapbox not initialized. Make sure EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN is set in .env');
    }
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryProvider>
        <AuthProvider>
          <MatchFoundProvider>
            <ThemeProvider>
              <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
              <PushNotificationsSetup />
              <Slot />
              <GlobalMatchFoundPopup />
            </ThemeProvider>
          </MatchFoundProvider>
        </AuthProvider>
      </QueryProvider>
    </GestureHandlerRootView>
  );
}

