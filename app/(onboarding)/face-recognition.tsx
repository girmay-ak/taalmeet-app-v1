/**
 * Face Recognition Screen
 * Final step of profile setup - Optional biometric security
 */

import { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/lib/theme/ThemeProvider';
import * as LocalAuthentication from 'expo-local-authentication';

export default function FaceRecognitionScreen() {
  const { colors } = useTheme();
  const [isSettingUp, setIsSettingUp] = useState(false);

  const handleSetFaceRecognition = async () => {
    setIsSettingUp(true);
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();

      if (!hasHardware || !isEnrolled) {
        // Skip if not available
        completeSetup();
        return;
      }

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Scan your face',
        cancelLabel: 'Cancel',
        fallbackLabel: 'Use passcode',
      });

      if (result.success) {
        // TODO: Save face recognition/biometric preference
        completeSetup();
      }
    } catch (error) {
      console.error('Face recognition setup error:', error);
    } finally {
      setIsSettingUp(false);
    }
  };

  const completeSetup = () => {
    // Navigate to main app
    router.replace('/(tabs)');
  };

  const handleSkip = () => {
    completeSetup();
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background.primary }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text.primary }]}>
          Face Recognition
        </Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.content}>
        {/* Description */}
        <Text style={[styles.description, { color: colors.text.secondary }]}>
          Add a face recognition to make your account more secure.
        </Text>

        {/* Face Recognition Icon */}
        <View style={styles.iconContainer}>
          <View style={[styles.faceIcon, { backgroundColor: colors.primary + '20' }]}>
            <Ionicons name="scan" size={80} color={colors.primary} />
          </View>
        </View>

        {/* Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.skipButton, { borderColor: colors.border.default }]}
            onPress={handleSkip}
          >
            <Text style={[styles.skipButtonText, { color: colors.text.primary }]}>Skip</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.continueButton, { backgroundColor: colors.primary }]}
            onPress={handleSetFaceRecognition}
            disabled={isSettingUp}
          >
            <Text style={styles.continueButtonText}>
              {isSettingUp ? 'Setting up...' : 'Continue'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
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
    paddingVertical: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 48,
  },
  iconContainer: {
    marginBottom: 32,
  },
  faceIcon: {
    width: 160,
    height: 160,
    borderRadius: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 16,
    width: '100%',
    marginTop: 48,
  },
  skipButton: {
    flex: 1,
    height: 56,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  skipButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  continueButton: {
    flex: 1,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

