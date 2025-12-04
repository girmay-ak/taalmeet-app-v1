/**
 * Profile Verification Screen - React Native
 * Verify user identity with ID and selfie
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useTheme } from '@/lib/theme/ThemeProvider';
import * as ImagePicker from 'expo-image-picker';
import { ConfettiRN } from '@/components/animations/ConfettiRN';
import { LinearGradient } from 'expo-linear-gradient';

type VerificationStep = 'intro' | 'upload-id' | 'selfie' | 'processing' | 'success';
type DocumentType = 'passport' | 'id-card' | 'drivers-license' | null;

interface UploadedFile {
  type: 'document' | 'selfie';
  uri: string;
  name: string;
}

export default function ProfileVerificationScreen() {
  const { colors } = useTheme();
  const [step, setStep] = useState<VerificationStep>('intro');
  const [documentType, setDocumentType] = useState<DocumentType>(null);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const handleFileUpload = async (type: 'document' | 'selfie') => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert('Permission Required', 'Please grant camera roll permissions to upload images.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setUploadedFiles([
        ...uploadedFiles.filter((f) => f.type !== type),
        {
          type,
          uri: result.assets[0].uri,
          name: result.assets[0].fileName || 'image.jpg',
        },
      ]);
    }
  };

  const handleTakePhoto = async (type: 'document' | 'selfie') => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert('Permission Required', 'Please grant camera permissions to take photos.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setUploadedFiles([
        ...uploadedFiles.filter((f) => f.type !== type),
        {
          type,
          uri: result.assets[0].uri,
          name: 'photo.jpg',
        },
      ]);
    }
  };

  const removeFile = (type: 'document' | 'selfie') => {
    setUploadedFiles(uploadedFiles.filter((f) => f.type !== type));
  };

  const handleSubmitVerification = () => {
    setStep('processing');
    setTimeout(() => {
      setStep('success');
    }, 3000);
  };

  const renderIntro = () => (
    <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.introContainer}>
        {/* Icon */}
        <View style={[styles.iconContainer, { backgroundColor: colors.primary }]}>
          <Ionicons name="shield-checkmark" size={48} color="#FFFFFF" />
        </View>

        {/* Title */}
        <Text style={[styles.title, { color: colors.text.primary }]}>Verify Your Profile</Text>
        <Text style={[styles.subtitle, { color: colors.text.muted }]}>
          Get verified to build trust with language partners and access exclusive features
        </Text>

        {/* Benefits */}
        <View style={styles.benefitsList}>
          {[
            {
              title: 'Verified Badge',
              description: "Get a verified badge on your profile that shows you're a real person",
            },
            {
              title: 'Build Trust',
              description: 'Verified users get 3x more connection requests and responses',
            },
            {
              title: 'Priority Support',
              description: 'Get faster response times from our support team',
            },
            {
              title: 'Safety First',
              description: 'Help create a safer community for language learners',
            },
          ].map((benefit, index) => (
            <View
              key={index}
              style={[styles.benefitCard, { backgroundColor: colors.background.secondary }]}
            >
              <View style={[styles.benefitIcon, { backgroundColor: `${colors.primary}20` }]}>
                <Ionicons name="checkmark-circle" size={20} color={colors.primary} />
              </View>
              <View style={styles.benefitContent}>
                <Text style={[styles.benefitTitle, { color: colors.text.primary }]}>
                  {benefit.title}
                </Text>
                <Text style={[styles.benefitDescription, { color: colors.text.muted }]}>
                  {benefit.description}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* What You'll Need */}
        <View
          style={[
            styles.requirementsCard,
            { backgroundColor: colors.background.secondary, borderColor: colors.border.default },
          ]}
        >
          <Text style={[styles.requirementsTitle, { color: colors.text.primary }]}>
            What You'll Need:
          </Text>
          <View style={styles.requirementsList}>
            <View style={styles.requirementItem}>
              <Ionicons name="document-text-outline" size={16} color={colors.primary} />
              <Text style={[styles.requirementText, { color: colors.text.muted }]}>
                Government-issued ID (Passport, Driver's License, or National ID)
              </Text>
            </View>
            <View style={styles.requirementItem}>
              <Ionicons name="camera-outline" size={16} color={colors.primary} />
              <Text style={[styles.requirementText, { color: colors.text.muted }]}>
                A clear selfie holding your ID
              </Text>
            </View>
          </View>
        </View>

        {/* Privacy Notice */}
        <View
          style={[
            styles.privacyCard,
            { backgroundColor: colors.background.secondary, borderColor: colors.border.default },
          ]}
        >
          <View style={styles.privacyContent}>
            <Ionicons name="shield-checkmark" size={16} color={colors.primary} />
            <Text style={[styles.privacyText, { color: colors.text.muted }]}>
              Your documents are encrypted and used only for verification. We never share your
              personal information.
            </Text>
          </View>
        </View>

        {/* Continue Button */}
        <TouchableOpacity
          style={[styles.continueButton, { backgroundColor: colors.primary }]}
          onPress={() => setStep('upload-id')}
        >
          <Text style={styles.continueButtonText}>Start Verification</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  const renderDocumentUpload = () => (
    <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.uploadContainer}>
        {/* Progress */}
        <View style={styles.progressSection}>
          <View style={styles.progressHeader}>
            <Text style={[styles.progressLabel, { color: colors.text.muted }]}>Step 1 of 2</Text>
            <Text style={[styles.progressLabel, { color: colors.text.muted }]}>50%</Text>
          </View>
          <View style={[styles.progressBar, { backgroundColor: colors.background.secondary }]}>
            <View style={[styles.progressFill, { backgroundColor: colors.primary, width: '50%' }]} />
          </View>
        </View>

        {/* Title */}
        <Text style={[styles.uploadTitle, { color: colors.text.primary }]}>Upload Your ID</Text>
        <Text style={[styles.uploadSubtitle, { color: colors.text.muted }]}>
          Please upload a clear photo of your government-issued ID
        </Text>

        {/* Document Type Selection */}
        <View style={styles.documentTypeGrid}>
          {[
            { value: 'passport', label: 'Passport', icon: 'card-outline' },
            { value: 'id-card', label: 'National ID', icon: 'id-card-outline' },
            { value: 'drivers-license', label: "Driver's License", icon: 'car-outline' },
          ].map((doc) => (
            <TouchableOpacity
              key={doc.value}
              onPress={() => setDocumentType(doc.value as DocumentType)}
              style={[
                styles.documentTypeButton,
                {
                  borderColor:
                    documentType === doc.value ? colors.primary : colors.border.default,
                  backgroundColor:
                    documentType === doc.value
                      ? `${colors.primary}10`
                      : colors.background.secondary,
                },
              ]}
            >
              <Ionicons
                name={doc.icon as any}
                size={24}
                color={documentType === doc.value ? colors.primary : colors.text.muted}
              />
              <Text
                style={[
                  styles.documentTypeLabel,
                  {
                    color: documentType === doc.value ? colors.primary : colors.text.muted,
                  },
                ]}
              >
                {doc.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Upload Area */}
        <View style={styles.uploadArea}>
          {uploadedFiles.find((f) => f.type === 'document') ? (
            <View style={styles.uploadedImageContainer}>
              <Image
                source={{ uri: uploadedFiles.find((f) => f.type === 'document')?.uri }}
                style={styles.uploadedImage}
              />
              <TouchableOpacity
                style={[styles.removeButton, { backgroundColor: '#EF4444' }]}
                onPress={() => removeFile('document')}
              >
                <Ionicons name="close" size={16} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={[
                styles.uploadButton,
                { borderColor: colors.border.default, backgroundColor: colors.background.secondary },
              ]}
              onPress={() => {
                Alert.alert('Upload Photo', 'Choose an option', [
                  { text: 'Camera', onPress: () => handleTakePhoto('document') },
                  { text: 'Gallery', onPress: () => handleFileUpload('document') },
                  { text: 'Cancel', style: 'cancel' },
                ]);
              }}
            >
              <Ionicons name="cloud-upload-outline" size={48} color={colors.text.muted} />
              <Text style={[styles.uploadButtonText, { color: colors.text.primary }]}>
                Tap to upload photo
              </Text>
              <Text style={[styles.uploadButtonSubtext, { color: colors.text.muted }]}>
                or take a photo with your camera
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Tips */}
        <View
          style={[
            styles.tipsCard,
            { backgroundColor: colors.background.secondary, borderColor: colors.border.default },
          ]}
        >
          <View style={styles.tipsHeader}>
            <Ionicons name="information-circle-outline" size={16} color={colors.primary} />
            <Text style={[styles.tipsTitle, { color: colors.text.primary }]}>Photo Guidelines</Text>
          </View>
          <View style={styles.tipsList}>
            <Text style={[styles.tipText, { color: colors.text.muted }]}>• All text must be clearly visible</Text>
            <Text style={[styles.tipText, { color: colors.text.muted }]}>• No glare or shadows</Text>
            <Text style={[styles.tipText, { color: colors.text.muted }]}>• Full document in frame</Text>
            <Text style={[styles.tipText, { color: colors.text.muted }]}>• Original document (no photocopies)</Text>
          </View>
        </View>

        {/* Buttons */}
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.backButton, { backgroundColor: colors.background.secondary }]}
            onPress={() => setStep('intro')}
          >
            <Text style={[styles.backButtonText, { color: colors.text.primary }]}>Back</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.nextButton,
              { backgroundColor: colors.primary },
              !uploadedFiles.find((f) => f.type === 'document') && styles.nextButtonDisabled,
            ]}
            onPress={() => setStep('selfie')}
            disabled={!uploadedFiles.find((f) => f.type === 'document')}
          >
            <Text style={styles.nextButtonText}>Continue</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );

  const renderSelfieUpload = () => (
    <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.uploadContainer}>
        {/* Progress */}
        <View style={styles.progressSection}>
          <View style={styles.progressHeader}>
            <Text style={[styles.progressLabel, { color: colors.text.muted }]}>Step 2 of 2</Text>
            <Text style={[styles.progressLabel, { color: colors.text.muted }]}>100%</Text>
          </View>
          <View style={[styles.progressBar, { backgroundColor: colors.background.secondary }]}>
            <View
              style={[styles.progressFill, { backgroundColor: colors.primary, width: '100%' }]}
            />
          </View>
        </View>

        {/* Title */}
        <Text style={[styles.uploadTitle, { color: colors.text.primary }]}>Take a Selfie</Text>
        <Text style={[styles.uploadSubtitle, { color: colors.text.muted }]}>
          Take a clear selfie holding your ID next to your face
        </Text>

        {/* Upload Area */}
        <View style={styles.uploadArea}>
          {uploadedFiles.find((f) => f.type === 'selfie') ? (
            <View style={styles.uploadedImageContainer}>
              <Image
                source={{ uri: uploadedFiles.find((f) => f.type === 'selfie')?.uri }}
                style={styles.uploadedSelfie}
              />
              <TouchableOpacity
                style={[styles.removeButton, { backgroundColor: '#EF4444' }]}
                onPress={() => removeFile('selfie')}
              >
                <Ionicons name="close" size={16} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={[
                styles.uploadButton,
                { borderColor: colors.border.default, backgroundColor: colors.background.secondary },
              ]}
              onPress={() => {
                Alert.alert('Take Selfie', 'Choose an option', [
                  { text: 'Camera', onPress: () => handleTakePhoto('selfie') },
                  { text: 'Gallery', onPress: () => handleFileUpload('selfie') },
                  { text: 'Cancel', style: 'cancel' },
                ]);
              }}
            >
              <Ionicons name="camera-outline" size={48} color={colors.text.muted} />
              <Text style={[styles.uploadButtonText, { color: colors.text.primary }]}>
                Tap to take selfie
              </Text>
              <Text style={[styles.uploadButtonSubtext, { color: colors.text.muted }]}>
                Hold your ID next to your face
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Tips */}
        <View
          style={[
            styles.tipsCard,
            { backgroundColor: colors.background.secondary, borderColor: colors.border.default },
          ]}
        >
          <View style={styles.tipsHeader}>
            <Ionicons name="person-outline" size={16} color={colors.primary} />
            <Text style={[styles.tipsTitle, { color: colors.text.primary }]}>Selfie Guidelines</Text>
          </View>
          <View style={styles.tipsList}>
            <Text style={[styles.tipText, { color: colors.text.muted }]}>• Face clearly visible (no sunglasses)</Text>
            <Text style={[styles.tipText, { color: colors.text.muted }]}>• Hold ID next to your face</Text>
            <Text style={[styles.tipText, { color: colors.text.muted }]}>• Good lighting (no shadows)</Text>
            <Text style={[styles.tipText, { color: colors.text.muted }]}>• Look directly at camera</Text>
          </View>
        </View>

        {/* Terms Agreement */}
        <TouchableOpacity
          style={styles.termsRow}
          onPress={() => setAgreedToTerms(!agreedToTerms)}
        >
          <View
            style={[
              styles.checkbox,
              {
                borderColor: agreedToTerms ? colors.primary : colors.border.default,
                backgroundColor: agreedToTerms ? colors.primary : 'transparent',
              },
            ]}
          >
            {agreedToTerms && <Ionicons name="checkmark" size={16} color="#FFFFFF" />}
          </View>
          <Text style={[styles.termsText, { color: colors.text.muted }]}>
            I agree that my information will be used for verification purposes only and will be
            handled according to the{' '}
            <Text style={{ color: colors.primary }}>Privacy Policy</Text>
          </Text>
        </TouchableOpacity>

        {/* Buttons */}
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.backButton, { backgroundColor: colors.background.secondary }]}
            onPress={() => setStep('upload-id')}
          >
            <Text style={[styles.backButtonText, { color: colors.text.primary }]}>Back</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.nextButton,
              { backgroundColor: colors.primary },
              (!uploadedFiles.find((f) => f.type === 'selfie') || !agreedToTerms) &&
                styles.nextButtonDisabled,
            ]}
            onPress={handleSubmitVerification}
            disabled={!uploadedFiles.find((f) => f.type === 'selfie') || !agreedToTerms}
          >
            <Text style={styles.nextButtonText}>Submit</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );

  const renderProcessing = () => (
    <View style={styles.processingContainer}>
      <ActivityIndicator size="large" color={colors.primary} />
      <Text style={[styles.processingTitle, { color: colors.text.primary }]}>
        Verifying Your Identity
      </Text>
      <Text style={[styles.processingSubtitle, { color: colors.text.muted }]}>
        This usually takes 1-2 minutes...
      </Text>
    </View>
  );

  const renderComplete = () => (
    <View style={styles.completeContainer}>
      <ConfettiRN active={true} />
      <View style={[styles.successIcon, { backgroundColor: colors.primary }]}>
        <Ionicons name="checkmark-circle" size={48} color="#FFFFFF" />
      </View>
      <Text style={[styles.completeTitle, { color: colors.text.primary }]}>
        Verification Complete!
      </Text>
      <Text style={[styles.completeSubtitle, { color: colors.text.muted }]}>
        Your profile has been successfully verified. You now have a verified badge!
      </Text>
      <TouchableOpacity
        style={[styles.completeButton, { backgroundColor: colors.primary }]}
        onPress={() => router.back()}
      >
        <Text style={styles.completeButtonText}>Continue to Profile</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background.primary }]}
      edges={['top']}
    >
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.background.secondary, borderColor: colors.border.default }]}>
        {step !== 'processing' && step !== 'success' && (
          <TouchableOpacity
            onPress={() => {
              if (step === 'upload-id') setStep('intro');
              else if (step === 'selfie') setStep('upload-id');
              else router.back();
            }}
            style={styles.backButtonHeader}
          >
            <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
          </TouchableOpacity>
        )}
        <Text style={[styles.headerTitle, { color: colors.text.primary }]}>
          {step === 'intro' && 'Profile Verification'}
          {step === 'upload-id' && 'Upload ID'}
          {step === 'selfie' && 'Take Selfie'}
          {step === 'processing' && 'Processing'}
          {step === 'success' && 'Verified!'}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Content */}
      {step === 'intro' && renderIntro()}
      {step === 'upload-id' && renderDocumentUpload()}
      {step === 'selfie' && renderSelfieUpload()}
      {step === 'processing' && renderProcessing()}
      {step === 'success' && renderComplete()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backButtonHeader: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  introContainer: {
    padding: 24,
    gap: 24,
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
  },
  benefitsList: {
    gap: 16,
  },
  benefitCard: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  benefitIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  benefitContent: {
    flex: 1,
  },
  benefitTitle: {
    fontSize: 15,
    fontWeight: '500',
    marginBottom: 4,
  },
  benefitDescription: {
    fontSize: 13,
    lineHeight: 18,
  },
  requirementsCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  requirementsTitle: {
    fontSize: 15,
    fontWeight: '500',
    marginBottom: 12,
  },
  requirementsList: {
    gap: 12,
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  requirementText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
  privacyCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  privacyContent: {
    flexDirection: 'row',
    gap: 8,
  },
  privacyText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 18,
  },
  continueButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  uploadContainer: {
    padding: 24,
    gap: 24,
  },
  progressSection: {
    gap: 8,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressLabel: {
    fontSize: 12,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  uploadTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  uploadSubtitle: {
    fontSize: 14,
    marginBottom: 16,
  },
  documentTypeGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  documentTypeButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    gap: 8,
  },
  documentTypeLabel: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
  uploadArea: {
    marginVertical: 8,
  },
  uploadButton: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
    gap: 12,
  },
  uploadButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  uploadButtonSubtext: {
    fontSize: 13,
  },
  uploadedImageContainer: {
    position: 'relative',
    borderRadius: 12,
    overflow: 'hidden',
  },
  uploadedImage: {
    width: '100%',
    height: 192,
    resizeMode: 'cover',
  },
  uploadedSelfie: {
    width: '100%',
    height: 256,
    resizeMode: 'cover',
  },
  removeButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tipsCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  tipsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  tipsTitle: {
    fontSize: 15,
    fontWeight: '500',
  },
  tipsList: {
    gap: 4,
  },
  tipText: {
    fontSize: 13,
  },
  termsRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  termsText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 18,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  backButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  nextButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  nextButtonDisabled: {
    opacity: 0.5,
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  processingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    padding: 24,
  },
  processingTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  processingSubtitle: {
    fontSize: 14,
    textAlign: 'center',
  },
  completeContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    padding: 24,
  },
  successIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  completeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  completeSubtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
  },
  completeButton: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    minWidth: 200,
    alignItems: 'center',
  },
  completeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

