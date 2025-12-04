import '@/global.css';
import { Slot } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ThemeProvider } from '@/lib/theme/ThemeProvider';
import { QueryProvider } from '@/providers/QueryProvider';
import { AuthProvider } from '@/providers/AuthProvider';
import { MatchFoundProvider } from '@/providers/MatchFoundProvider';
import { GlobalMatchFoundPopup } from '@/components/matches/GlobalMatchFoundPopup';
import { useColorScheme } from 'react-native';
import { PushNotificationsSetup } from '@/components/notifications/PushNotificationsSetup';

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
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
  );
}

