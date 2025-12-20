import { useEffect } from 'react';
import { router } from 'expo-router';
import { useAuth } from '@/providers';

export default function Index() {
  const { session, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (session) {
        // User is logged in, redirect to main app
        router.replace('/(tabs)');
      } else {
        // User is not logged in, show splash screen
        router.replace('/splash');
      }
    }
  }, [session, loading]);

  // Return null - splash screen will handle the initial display
  return null;
}

