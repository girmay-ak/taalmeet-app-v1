import { useEffect } from 'react';
import { router } from 'expo-router';
import { useAuth } from '@/providers';

export default function Index() {
  const { session, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (session) {
        // Only navigate to main app if profile is loaded
        // This prevents navigation before profile data is available
        if (profile) {
          router.replace('/(tabs)');
        }
        // If no profile after loading is complete, still navigate
        // (edge case: profile fetch failed but user is authenticated)
        else {
          // Give it a moment to load
          const timer = setTimeout(() => {
        router.replace('/(tabs)');
          }, 500);
          return () => clearTimeout(timer);
        }
      } else {
        // User is not logged in, show splash screen
        router.replace('/splash');
      }
    }
  }, [session, profile, loading]);

  // Return null - splash screen will handle the initial display
  return null;
}

