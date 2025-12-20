/**
 * Photo ID Card Screen
 * Modern design with green dashed frame and clear instructions
 */

import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { useUploadIDCard } from '@/hooks/useVerification';
import { useTheme } from '@/lib/theme/ThemeProvider';

const { width, height } = Dimensions.get('window');
const FRAME_WIDTH = width - 48;
const FRAME_HEIGHT = FRAME_WIDTH * 0.65; // Aspect ratio for ID cards

export default function PhotoIDCardScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const params = useLocalSearchParams<{ sessionId?: string; idType?: string }>();
  const [permission, requestPermission] = useCameraPermissions();
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const cameraRef = useRef<CameraView>(null);
  const uploadIDCard = useUploadIDCard();

  const handleTakePhoto = async () => {
    if (!cameraRef.current) return;

    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
      });

      if (photo) {
        setCapturedImage(photo.uri);
      }
    } catch (error) {
      console.error('Failed to take photo:', error);
      Alert.alert('Error', 'Failed to capture photo. Please try again.');
    }
  };

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 10],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setCapturedImage(result.assets[0].uri);
    }
  };

  const handleContinue = async () => {
    if (!capturedImage || !params.sessionId) return;

    try {
      await uploadIDCard.mutateAsync({
        request: {
          document_type: (params.idType as 'passport' | 'drivers_license' | 'national_id' | 'residence_permit') || 'national_id',
          country_code: 'US', // TODO: Get from user or device
          front_image: capturedImage,
        },
        sessionId: params.sessionId,
      });

      router.push({
        pathname: '/verification/selfie-with-id',
        params: { sessionId: params.sessionId },
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to upload ID card. Please try again.');
    }
  };

  const handleRetake = () => {
    setCapturedImage(null);
  };

  if (!permission) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background.primary }]}>
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: colors.text.primary }]}>
            Loading camera...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background.primary }]}>
        <View style={styles.permissionContainer}>
          <Ionicons name="camera-outline" size={64} color={colors.text.muted} />
          <Text style={[styles.permissionTitle, { color: colors.text.primary }]}>
            Camera Permission Required
          </Text>
          <Text style={[styles.permissionText, { color: colors.text.muted }]}>
            We need access to your camera to capture your ID card
          </Text>
          <TouchableOpacity
            style={[styles.permissionButton, { backgroundColor: '#1DB954' }]}
            onPress={requestPermission}
          >
            <Text style={styles.permissionButtonText}>Grant Permission</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: '#0F0F0F' }]} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Photo ID Card</Text>
        <Text style={styles.stepIndicator}>1/2</Text>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressBarContainer}>
        <View style={[styles.progressBar, { width: '50%' }]} />
      </View>

      {/* Camera/Preview Container */}
      <View style={styles.cameraContainer}>
        {!capturedImage ? (
          <>
            {/* Camera View */}
            <CameraView
              ref={cameraRef}
              style={styles.camera}
              facing="back"
            >
              {/* Dashed Frame */}
              <View style={styles.frameContainer}>
                <View style={styles.dashedFrame}>
                  {/* Corner borders */}
                  <View style={[styles.corner, styles.cornerTopLeft]} />
                  <View style={[styles.corner, styles.cornerTopRight]} />
                  <View style={[styles.corner, styles.cornerBottomLeft]} />
                  <View style={[styles.corner, styles.cornerBottomRight]} />
                  
                  {/* Center Icon */}
                  <View style={styles.iconContainer}>
                    <View style={styles.idCardIcon}>
                      <View style={styles.idCardPhoto} />
                      <View style={styles.idCardLines}>
                        <View style={styles.idCardLine} />
                        <View style={styles.idCardLine} />
                      </View>
                    </View>
                  </View>
                </View>

                {/* Instructions */}
                <View style={styles.instructionsContainer}>
                  <Text style={styles.instructionTitle}>Position your ID card</Text>
                  <Text style={styles.instructionSubtitle}>within the frame</Text>
                </View>
              </View>
            </CameraView>
          </>
        ) : (
          /* Preview Captured Image */
          <View style={styles.previewContainer}>
            <View style={styles.previewCard}>
              <Image
                source={{ uri: capturedImage }}
                style={styles.previewImage}
                resizeMode="contain"
              />
              <TouchableOpacity
                style={styles.retakeButton}
                onPress={handleRetake}
                activeOpacity={0.7}
              >
                <Ionicons name="refresh" size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>

      {/* Guidelines Section */}
      <View style={styles.guidelinesContainer}>
        <Text style={styles.guidelinesTitle}>Photo ID Card</Text>
        <Text style={styles.guidelinesSubtitle}>
          Make sure all four corners are visible and details are clear
        </Text>

        <View style={styles.checklistContainer}>
          <View style={styles.checklistItem}>
            <Ionicons name="checkmark-circle" size={20} color="#1DB954" />
            <Text style={styles.checklistText}>All text is clearly readable</Text>
          </View>
          <View style={styles.checklistItem}>
            <Ionicons name="checkmark-circle" size={20} color="#1DB954" />
            <Text style={styles.checklistText}>No glare or shadows on the card</Text>
          </View>
          <View style={styles.checklistItem}>
            <Ionicons name="checkmark-circle" size={20} color="#1DB954" />
            <Text style={styles.checklistText}>Original card (not a photocopy)</Text>
          </View>
        </View>
      </View>

      {/* Bottom Button */}
      <View style={styles.bottomContainer}>
        {!capturedImage ? (
          <TouchableOpacity
            style={styles.takePhotoButton}
            onPress={handleTakePhoto}
            activeOpacity={0.8}
          >
            <Ionicons name="camera" size={20} color="#FFFFFF" style={styles.buttonIcon} />
            <Text style={styles.takePhotoText}>Take Photo</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.continueButton}
            onPress={handleContinue}
            disabled={uploadIDCard.isPending}
            activeOpacity={0.8}
          >
            <Text style={styles.continueText}>
              {uploadIDCard.isPending ? 'Uploading...' : 'Continue'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  permissionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 24,
    marginBottom: 12,
    textAlign: 'center',
  },
  permissionText: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 20,
  },
  permissionButton: {
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
  },
  permissionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
    marginLeft: 12,
  },
  stepIndicator: {
    color: '#9CA3AF',
    fontSize: 16,
  },
  progressBarContainer: {
    height: 4,
    backgroundColor: '#1A1A1A',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#1DB954',
    borderRadius: 2,
  },
  cameraContainer: {
    flex: 1,
    marginHorizontal: 24,
  },
  camera: {
    flex: 1,
    borderRadius: 20,
    overflow: 'hidden',
  },
  frameContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dashedFrame: {
    width: FRAME_WIDTH,
    height: FRAME_HEIGHT,
    borderWidth: 2,
    borderColor: '#1DB954',
    borderStyle: 'dashed',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderColor: '#1DB954',
  },
  cornerTopLeft: {
    top: -2,
    left: -2,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderTopLeftRadius: 16,
  },
  cornerTopRight: {
    top: -2,
    right: -2,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderTopRightRadius: 16,
  },
  cornerBottomLeft: {
    bottom: -2,
    left: -2,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderBottomLeftRadius: 16,
  },
  cornerBottomRight: {
    bottom: -2,
    right: -2,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderBottomRightRadius: 16,
  },
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  idCardIcon: {
    width: 80,
    height: 50,
    borderWidth: 2,
    borderColor: '#1DB954',
    borderRadius: 8,
    padding: 8,
    flexDirection: 'row',
    gap: 8,
  },
  idCardPhoto: {
    width: 20,
    height: 28,
    borderWidth: 2,
    borderColor: '#1DB954',
    borderRadius: 4,
  },
  idCardLines: {
    flex: 1,
    justifyContent: 'center',
    gap: 4,
  },
  idCardLine: {
    height: 3,
    backgroundColor: '#1DB954',
    borderRadius: 1.5,
  },
  instructionsContainer: {
    position: 'absolute',
    bottom: -60,
    alignItems: 'center',
  },
  instructionTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  instructionSubtitle: {
    color: '#9CA3AF',
    fontSize: 14,
  },
  previewContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewCard: {
    width: FRAME_WIDTH,
    height: FRAME_HEIGHT,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    position: 'relative',
  },
  previewImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  retakeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  guidelinesContainer: {
    padding: 24,
  },
  guidelinesTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  guidelinesSubtitle: {
    color: '#9CA3AF',
    fontSize: 14,
    marginBottom: 16,
    lineHeight: 20,
  },
  checklistContainer: {
    gap: 12,
  },
  checklistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  checklistText: {
    color: '#FFFFFF',
    fontSize: 14,
  },
  bottomContainer: {
    padding: 24,
    paddingBottom: 32,
  },
  takePhotoButton: {
    backgroundColor: '#1DB954',
    paddingVertical: 16,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonIcon: {
    marginRight: 8,
  },
  takePhotoText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  continueButton: {
    backgroundColor: '#1DB954',
    paddingVertical: 16,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  continueText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
