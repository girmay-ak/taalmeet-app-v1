import { useEffect } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '@/providers';
import { useTheme } from '@/lib/theme/ThemeProvider';
import { TaalMeetLogo } from '@/components';

export default function Index() {
  const { colors } = useTheme();
  const { session, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (session) {
        // User is logged in, redirect to main app
        router.replace('/(tabs)');
      } else {
        // User is not logged in, redirect to landing page
        router.replace('/(auth)/landing');
      }
    }
  }, [session, loading]);

  // Show loading screen while checking authentication
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.background.primary,
        alignItems: 'center',
        justifyContent: 'center',
      }}>
      <TaalMeetLogo size={80} variant="icon" />
      <Text
        style={{
          fontSize: 32,
          fontWeight: 'bold',
          color: colors.text.primary,
          marginTop: 24,
          marginBottom: 24,
        }}>
        TAALMEET
      </Text>
      <ActivityIndicator size="large" color={colors.primary} />
      <Text
        style={{
          fontSize: 14,
          color: colors.text.secondary,
          marginTop: 16,
        }}>
        Loading...
      </Text>
    </View>
  );
}

