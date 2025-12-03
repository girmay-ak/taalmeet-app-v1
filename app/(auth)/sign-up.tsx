/**
 * Sign Up Screen
 * Uses the multi-step SignupFlow component
 */

import { router } from 'expo-router';
import { SignupFlow } from '@/components';

export default function SignUpScreen() {
  return (
    <SignupFlow
      onComplete={() => router.replace('/(tabs)')}
      onBackToLogin={() => router.back()}
    />
  );
}
