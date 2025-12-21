// Face Scanning Screen - TAALMEET
// Screen for capturing and processing face recognition

import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, Alert, Image } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Camera } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { useEnrollFaceRecognition } from '@/hooks/useVerification';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring,
  withTiming,
  withRepeat,
} from 'react-native-reanimated';

export default function FaceScanScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ sessionId?: string }>();
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  
  const enrollFace = useEnrollFaceRecognition();
  const progress = useSharedValue(0);
  const scanLineY = useSharedValue(0);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  useEffect(() => {
    if (isScanning) {
      // Animate progress
      progress.value = withTiming(100, { duration: 3000 });
      
      // Animate scanning line
      scanLineY.value = withRepeat(
        withTiming(1, { duration: 2000 }),
        -1,
        true
      );

      // Simulate scanning progress
      const interval = setInterval(() => {
        setScanProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            handleScanComplete();
            return 100;
          }
          return prev + 10;
        });
      }, 300);

      return () => clearInterval(interval);
    }
  }, [isScanning]);

  const progressStyle = useAnimatedStyle(() => {
    return {
      width: `${progress.value}%`,
    };
  });

  const scanLineStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: scanLineY.value * 300 }],
    };
  });

  const handleTakeFacePhoto = async () => {
    if (hasPermission === false) {
      Alert.alert('Permission Required', 'Camera permission is required.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 0.8,
      cameraType: ImagePicker.CameraType.front,
    });

    if (!result.canceled && result.assets[0]) {
      setCapturedImage(result.assets[0].uri);
      setIsScanning(true);
    }
  };

  const handleScanComplete = async () => {
    if (!capturedImage) return;

    try {
      await enrollFace.mutateAsync({
        face_image: capturedImage,
        session_id: params.sessionId || '',
      });

      // Navigate to success screen
      router.replace({
        pathname: '/verification/success',
        params: { sessionId: params.sessionId },
      });
    } catch (error: any) {
      Alert.alert('Enrollment Failed', error.message || 'Failed to enroll face recognition');
      setIsScanning(false);
      setScanProgress(0);
      progress.value = 0;
    }
  };

  const handleSkip = () => {
    router.replace({
      pathname: '/verification/success',
      params: { sessionId: params.sessionId, skipped: 'true' },
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-dark-1">
      {/* Header */}
      <View className="px-6 py-4">
        <TouchableOpacity onPress={() => router.back()} className="w-7 h-7">
          <Ionicons name="arrow-back" size={28} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View className="flex-1 px-6 justify-between pb-9">
        {/* Title Section */}
        <View className="mt-6">
          <Text className="text-white text-[32px] font-urbanist-bold text-center leading-[38px] mb-5">
            Face Recognition
          </Text>
          <Text className="text-white text-lg font-urbanist text-center leading-[25px]">
            Add a face recognition to make your account{'\n'}more secure.
          </Text>
        </View>

        {/* Scanning Area */}
        <View className="items-center justify-center">
          {capturedImage && isScanning ? (
            <View className="relative">
              {/* Face Image with Mask */}
              <View className="w-[380px] h-[380px] rounded-full overflow-hidden border-4 border-primary-500">
                <Image
                  source={{ uri: capturedImage }}
                  className="w-full h-full"
                  resizeMode="cover"
                />
                
                {/* Scanning Overlay */}
                <View className="absolute inset-0 bg-black/30">
                  <Animated.View 
                    className="w-full h-1 bg-primary-500 shadow-lg"
                    style={scanLineStyle}
                  />
                </View>
              </View>

              {/* Progress Text */}
              <View className="absolute bottom-0 left-0 right-0 items-center -mb-24">
                <Text className="text-white text-5xl font-urbanist-bold mb-4">
                  {scanProgress}%
                </Text>
                <Text className="text-white text-lg font-urbanist-medium">
                  Verifying your face...
                </Text>
              </View>
            </View>
          ) : (
            <TouchableOpacity
              onPress={handleTakeFacePhoto}
              className="w-[380px] h-[380px] rounded-full bg-dark-3 items-center justify-center border-4 border-dashed border-primary-500"
            >
              <View className="items-center">
                <Ionicons name="scan-circle" size={120} color="#584CF4" />
                <Text className="text-white text-lg font-urbanist-medium mt-6">
                  Tap to scan your face
                </Text>
              </View>
            </TouchableOpacity>
          )}
        </View>

        {/* Action Buttons */}
        {!isScanning && (
          <View className="flex-row gap-3">
            <TouchableOpacity
              onPress={handleSkip}
              className="flex-1 bg-primary-100 py-[18px] rounded-full items-center justify-center"
            >
              <Text className="text-primary-500 text-base font-urbanist-bold">Skip</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleTakeFacePhoto}
              className="flex-1 bg-primary-500 py-[18px] rounded-full items-center justify-center shadow-primary"
              disabled={enrollFace.isPending}
            >
              <Text className="text-white text-base font-urbanist-bold">Continue</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

