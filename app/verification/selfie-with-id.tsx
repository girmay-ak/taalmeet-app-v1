/**
 * Selfie With ID Screen
 * Modern design with green dashed frame for selfie capture
 */

import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { useUploadSelfieWithID } from '@/hooks/useVerification';
import { useTheme } from '@/lib/theme/ThemeProvider';

const { width, height } = Dimensions.get('window');
const FRAME_WIDTH = width - 48;
const FRAME_HEIGHT = FRAME_WIDTH * 1.2; // Taller for selfie

export default function SelfieWithIDScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const params = useLocalSearchParams<{ sessionId?: string }>();
  const [permission, requestPermission] = useCameraPermissions();
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const cameraRef = useRef<CameraView>(null);
  const uploadSelfie = useUploadSelfieWithID();

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
      aspect: [3, 4],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setCapturedImage(result.assets[0].uri);
    }
  };

  const handleContinue = async () => {
    if (!capturedImage || !params.sessionId) return;

    try {
      await uploadSelfie.mutateAsync({
        request: {
          document_id: params.sessionId, // Using session ID as document ID
          selfie_image: capturedImage,
        },
        sessionId: params.sessionId,
      });

      // Navigate to processing screen
      router.push({
        pathname: '/verification/processing',
        params: { sessionId: params.sessionId },
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to upload selfie. Please try again.');
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
            We need access to your camera to capture your selfie
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
        <Text style={styles.headerTitle}>Selfie With ID</Text>
        <Text style={styles.stepIndicator}>2/2</Text>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressBarContainer}>
        <View style={[styles.progressBar, { width: '100%' }]} />
      </View>

      {/* Camera/Preview Container */}
      <View style={styles.cameraContainer}>
        {!capturedImage ? (
          <>
            {/* Camera View */}
            <CameraView
              ref={cameraRef}
              style={styles.camera}
              facing="front"
            >
              {/* Dashed Frame */}
              <View style={styles.frameContainer}>
                <View style={styles.dashedFrame}>
                  {/* Corner borders */}
                  <View style={[styles.corner, styles.cornerTopLeft]} />
                  <View style={[styles.corner, styles.cornerTopRight]} />
                  <View style={[styles.corner, styles.cornerBottomLeft]} />
                  <View style={[styles.corner, styles.cornerBottomRight]} />
                  
                  {/* Center Icon - Face + ID Card */}
                  <View style={styles.iconContainer}>
                    {/* Face Icon */}
                    <View style={styles.faceIcon}>
                      <View style={styles.faceCircle}>
                        <View style={styles.faceEye} />
                        <View style={styles.faceEye} />
                        <View style={styles.faceSmile} />
                      </View>
                    </View>
                    
                    {/* ID Card Icon */}
                    <View style={styles.smallIdCardIcon}>
                      <View style={styles.smallIdCardPhoto} />
                      <View style={styles.smallIdCardLines}>
                        <View style={styles.smallIdCardLine} />
                        <View style={styles.smallIdCardLine} />
                      </View>
                    </View>
                  </View>
                </View>

                {/* Instructions */}
                <View style={styles.instructionsContainer}>
                  <Text style={styles.instructionTitle}>Position your face</Text>
                  <Text style={styles.instructionSubtitle}>Hold your ID next to your face</Text>
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
                resizeMode="cover"
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
        <Text style={styles.guidelinesTitle}>Selfie With ID Card</Text>
        <Text style={styles.guidelinesSubtitle}>
          Take a clear photo of yourself holding your ID next to your face
        </Text>

        <View style={styles.checklistContainer}>
          <View style={styles.checklistItem}>
            <Ionicons name="checkmark-circle" size={20} color="#1DB954" />
            <Text style={styles.checklistText}>Your face is clearly visible</Text>
          </View>
          <View style={styles.checklistItem}>
            <Ionicons name="checkmark-circle" size={20} color="#1DB954" />
            <Text style={styles.checklistText}>ID card photo is visible and readable</Text>
          </View>
          <View style={styles.checklistItem}>
            <Ionicons name="checkmark-circle" size={20} color="#1DB954" />
            <Text style={styles.checklistText}>Good lighting with no shadows</Text>
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
            disabled={uploadSelfie.isPending}
            activeOpacity={0.8}
          >
            <Text style={styles.continueText}>
              {uploadSelfie.isPending ? 'Uploading...' : 'Continue'}
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
  faceIcon: {
    marginBottom: 12,
  },
  faceCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    borderColor: '#1DB954',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  faceEye: {
    position: 'absolute',
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#1DB954',
    top: 20,
  },
  faceSmile: {
    position: 'absolute',
    width: 24,
    height: 12,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    borderWidth: 2,
    borderTopWidth: 0,
    borderColor: '#1DB954',
    bottom: 12,
  },
  smallIdCardIcon: {
    width: 60,
    height: 38,
    borderWidth: 2,
    borderColor: '#1DB954',
    borderRadius: 6,
    padding: 6,
    flexDirection: 'row',
    gap: 6,
  },
  smallIdCardPhoto: {
    width: 16,
    height: 22,
    borderWidth: 2,
    borderColor: '#1DB954',
    borderRadius: 3,
  },
  smallIdCardLines: {
    flex: 1,
    justifyContent: 'center',
    gap: 3,
  },
  smallIdCardLine: {
    height: 2,
    backgroundColor: '#1DB954',
    borderRadius: 1,
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
