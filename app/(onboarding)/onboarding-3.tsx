/**
 * Onboarding Screen 3: Join Language Exchange Sessions
 * Third and final screen in the onboarding flow
 */

import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useTheme } from '@/lib/theme/ThemeProvider';

const { width } = Dimensions.get('window');

export default function OnboardingScreen3() {
  const { colors } = useTheme();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background.primary }]}>
      {/* Decorative Background Elements */}
      <View style={styles.decorativeContainer}>
        <View style={[styles.circle, styles.circle1, { backgroundColor: colors.primary + '20' }]} />
        <View style={[styles.circle, styles.circle2, { backgroundColor: colors.primary + '15' }]} />
        <View style={[styles.dot, styles.dot1, { backgroundColor: colors.primary + '30' }]} />
        <View style={[styles.dot, styles.dot2, { backgroundColor: colors.primary + '25' }]} />
        <View style={[styles.dot, styles.dot3, { backgroundColor: colors.primary + '20' }]} />
      </View>

      <View style={styles.content}>
        {/* Illustration Area */}
        <View style={styles.illustrationContainer}>
          <Text style={styles.illustrationEmoji}>🎯</Text>
          <View style={[styles.sessionIcon, { backgroundColor: colors.primary + '20' }]}>
            <Text style={styles.sessionEmoji}>👥</Text>
          </View>
        </View>

        {/* Title */}
        <Text style={[styles.title, { color: colors.text.primary }]}>
          Join Language Exchange Sessions
        </Text>

        {/* Description */}
        <Text style={[styles.description, { color: colors.text.secondary }]}>
          Participate in group sessions, meetups, and events to practice languages with multiple partners at once.
        </Text>

        {/* Progress Indicators */}
        <View style={styles.progressContainer}>
          <View style={[styles.progressDot, styles.progressDotInactive, { backgroundColor: colors.border.default }]} />
          <View style={[styles.progressDot, styles.progressDotInactive, { backgroundColor: colors.border.default }]} />
          <View style={[styles.progressDot, { backgroundColor: colors.primary }]} />
        </View>

        {/* Navigation Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.backButton, { borderColor: colors.border.default }]}
            onPress={() => router.back()}>
            <Text style={[styles.backButtonText, { color: colors.text.secondary }]}>Back</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: colors.primary }]}
            onPress={() => router.replace('/(onboarding)/profile-setup')}>
            <Text style={styles.buttonText}>Get Started</Text>
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
  decorativeContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  circle: {
    position: 'absolute',
    borderRadius: 1000,
  },
  circle1: {
    width: 200,
    height: 200,
    top: -50,
    right: -50,
  },
  circle2: {
    width: 150,
    height: 150,
    top: 100,
    right: -30,
  },
  dot: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  dot1: {
    top: 120,
    right: 80,
  },
  dot2: {
    top: 150,
    right: 100,
  },
  dot3: {
    top: 180,
    right: 60,
  },
  content: {
    flex: 1,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  illustrationContainer: {
    width: width * 0.7,
    height: width * 0.7,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 48,
    position: 'relative',
  },
  illustrationEmoji: {
    fontSize: 120,
  },
  sessionIcon: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 65,
    height: 65,
    borderRadius: 32.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sessionEmoji: {
    fontSize: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 48,
    paddingHorizontal: 20,
    lineHeight: 24,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
    gap: 8,
  },
  progressDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  progressDotInactive: {
    opacity: 0.3,
  },
  buttonContainer: {
    width: '100%',
    flexDirection: 'row',
    gap: 12,
  },
  backButton: {
    flex: 1,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  button: {
    flex: 1,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

