/**
 * Sign Up Screen
 * Uses the multi-step SignupFlow component
 * Enhanced to match design
 */

import { router } from 'expo-router';
import { SignupFlow } from '@/components';

export default function SignUpScreen() {
  return (
    <SignupFlow
      onComplete={() => router.replace('/(tabs)')}
      onBackToLogin={() => router.push('/(auth)/lets-you-in')}
    />
  );
}
