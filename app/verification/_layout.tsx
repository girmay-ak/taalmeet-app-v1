// Verification Flow Layout - TAALMEET

import { Stack } from 'expo-router';

export default function VerificationLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="select-id-type" />
      <Stack.Screen name="photo-id-card" />
      <Stack.Screen name="selfie-with-id" />
      <Stack.Screen name="face-recognition" />
      <Stack.Screen name="face-scan" />
      <Stack.Screen 
        name="success" 
        options={{
          gestureEnabled: false,
        }}
      />
    </Stack>
  );
}

