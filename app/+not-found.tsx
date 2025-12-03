import { Link, Stack } from 'expo-router';
import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Oops!' }} />
      <SafeAreaView className="flex-1 bg-white dark:bg-gray-900">
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            404
          </Text>
          <Text className="text-xl text-gray-600 dark:text-gray-400 mb-8">
            This screen doesn't exist.
          </Text>
          <Link href="/" className="text-primary-500 text-lg font-semibold">
            Go to home screen
          </Link>
        </View>
      </SafeAreaView>
    </>
  );
}

