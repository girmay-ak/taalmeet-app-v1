import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ProfileSetup() {
  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-gray-900">
      <View className="flex-1 px-6 py-4">
        <Text className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Set Up Your Profile
        </Text>
        <Text className="text-gray-600 dark:text-gray-400 mb-8">
          Tell us about yourself and the languages you speak
        </Text>
        {/* Profile setup form will be implemented later */}
      </View>
    </SafeAreaView>
  );
}

