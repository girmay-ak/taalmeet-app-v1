/**
 * Set Your Fingerprint Screen
 * Optional biometric security setup
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

// Conditionally import LocalAuthentication
let LocalAuthentication: any = null;
try {
  LocalAuthentication = require('expo-local-authentication');
} catch {
  // Module not available (e.g., in Expo Go)
  console.log('expo-local-authentication not available');
}

export default function SetFingerprintScreen() {
  const { colors } = useTheme();
  const [isSettingUp, setIsSettingUp] = useState(false);

  const handleSetFingerprint = async () => {
    if (!LocalAuthentication) {
      // Skip if module not available
      router.push('/(onboarding)/face-recognition');
      return;
    }

    setIsSettingUp(true);
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();

      if (!hasHardware || !isEnrolled) {
        // Skip if not available
        router.push('/(onboarding)/face-recognition');
        return;
      }

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Scan your fingerprint',
        cancelLabel: 'Cancel',
      });

      if (result.success) {
        // TODO: Save fingerprint/biometric preference
        router.push('/(onboarding)/face-recognition');
      }
    } catch (error) {
      console.error('Fingerprint setup error:', error);
      // Continue even on error
      router.push('/(onboarding)/face-recognition');
    } finally {
      setIsSettingUp(false);
    }
  };

  const handleSkip = () => {
    router.push('/(onboarding)/face-recognition');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background.primary }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text.primary }]}>
          Set Your Fingerprint
        </Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.content}>
        {/* Description */}
        <Text style={[styles.description, { color: colors.text.secondary }]}>
          Add a fingerprint to make your account more secure.
        </Text>

        {/* Fingerprint Icon */}
        <View style={styles.iconContainer}>
          <View style={[styles.fingerprintIcon, { backgroundColor: colors.primary + '20' }]}>
            <Ionicons name="finger-print" size={80} color={colors.primary} />
          </View>
        </View>

        {/* Instructions */}
        <Text style={[styles.instructions, { color: colors.text.muted }]}>
          Please put your finger on the fingerprint scanner to get started.
        </Text>

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
            onPress={handleSetFingerprint}
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
  fingerprintIcon: {
    width: 160,
    height: 160,
    borderRadius: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  instructions: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 48,
    paddingHorizontal: 32,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 16,
    width: '100%',
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

