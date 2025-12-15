import { Stack } from 'expo-router';

export default function OnboardingLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="welcome" />
      <Stack.Screen name="onboarding-1" />
      <Stack.Screen name="onboarding-2" />
      <Stack.Screen name="onboarding-3" />
      <Stack.Screen name="profile-setup" />
      <Stack.Screen name="fill-profile" />
      <Stack.Screen name="set-location" />
      <Stack.Screen name="create-pin" />
      <Stack.Screen name="set-fingerprint" />
      <Stack.Screen name="face-recognition" />
    </Stack>
  );
}

