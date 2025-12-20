// Face Recognition Intro Screen - TAALMEET
// Introduction screen for face recognition feature

import React from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, Image } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function FaceRecognitionScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ sessionId?: string }>();

  const handleSkip = () => {
    // Skip face recognition and go to success
    router.replace({
      pathname: '/verification/success',
      params: { sessionId: params.sessionId, skipped: 'true' },
    });
  };

  const handleContinue = () => {
    // Go to face scanning screen
    router.push({
      pathname: '/verification/face-scan',
      params: { sessionId: params.sessionId },
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="px-6 py-4">
        <TouchableOpacity onPress={() => router.back()} className="w-7 h-7">
          <Ionicons name="arrow-back" size={28} color="#212121" />
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View className="flex-1 px-6 justify-between pb-9">
        {/* Title Section */}
        <View className="mt-6">
          <Text className="text-greyscale-900 text-[32px] font-urbanist-bold text-center leading-[38px] mb-5">
            Face Recognition
          </Text>
          <Text className="text-greyscale-900 text-lg font-urbanist text-center leading-[25px]">
            Add a face recognition to make your account{'\n'}more secure.
          </Text>
        </View>

        {/* Face Recognition Illustration */}
        <View className="items-center justify-center">
          <View className="w-[340px] h-[340px] items-center justify-center">
            {/* Face Circle with Dots */}
            <View className="relative w-full h-full items-center justify-center">
              {/* Outer Circle */}
              <View className="w-72 h-72 rounded-full border-4 border-primary-200 items-center justify-center">
                {/* Middle Circle */}
                <View className="w-56 h-56 rounded-full border-4 border-primary-300 items-center justify-center">
                  {/* Inner Circle */}
                  <View className="w-40 h-40 rounded-full bg-primary-100 items-center justify-center">
                    <Ionicons name="person" size={80} color="#584CF4" />
                  </View>
                </View>
              </View>

              {/* Scanning Dots */}
              <View className="absolute w-full h-full">
                {/* Top Left */}
                <View className="absolute top-12 left-12 w-3 h-3 rounded-full bg-success" />
                {/* Top Right */}
                <View className="absolute top-12 right-12 w-3 h-3 rounded-full bg-success" />
                {/* Middle Left */}
                <View className="absolute top-1/2 left-8 w-3 h-3 rounded-full bg-success" />
                {/* Middle Right */}
                <View className="absolute top-1/2 right-8 w-3 h-3 rounded-full bg-success" />
                {/* Bottom Left */}
                <View className="absolute bottom-12 left-12 w-3 h-3 rounded-full bg-success" />
                {/* Bottom Right */}
                <View className="absolute bottom-12 right-12 w-3 h-3 rounded-full bg-success" />
                {/* Center Top */}
                <View className="absolute top-8 left-1/2 -ml-1.5 w-3 h-3 rounded-full bg-success" />
                {/* Center Bottom */}
                <View className="absolute bottom-8 left-1/2 -ml-1.5 w-3 h-3 rounded-full bg-success" />
              </View>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View className="flex-row gap-3">
          <TouchableOpacity
            onPress={handleSkip}
            className="flex-1 bg-primary-100 py-[18px] rounded-full items-center justify-center"
          >
            <Text className="text-success text-base font-urbanist-bold">Skip</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleContinue}
            className="flex-1 bg-success py-[18px] rounded-full items-center justify-center shadow-success"
          >
            <Text className="text-white text-base font-urbanist-bold">Continue</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

