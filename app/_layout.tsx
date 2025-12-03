import '@/global.css';
import { Slot } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ThemeProvider } from '@/lib/theme/ThemeProvider';
import { QueryProvider } from '@/providers/QueryProvider';
import { AuthProvider } from '@/providers/AuthProvider';
import { useColorScheme } from 'react-native';

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <QueryProvider>
      <AuthProvider>
        <ThemeProvider>
          <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
          <Slot />
        </ThemeProvider>
      </AuthProvider>
    </QueryProvider>
  );
}

