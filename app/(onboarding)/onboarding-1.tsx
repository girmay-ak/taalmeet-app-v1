/**
 * Onboarding Screen 1: Find Language Partners Nearby
 * First screen in the onboarding flow
 */

import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useTheme } from '@/lib/theme/ThemeProvider';

const { width, height } = Dimensions.get('window');

export default function OnboardingScreen1() {
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
          <Text style={styles.illustrationEmoji}>🌍</Text>
          <View style={[styles.mapIcon, { backgroundColor: colors.primary + '20' }]}>
            <Text style={styles.mapEmoji}>📍</Text>
          </View>
        </View>

        {/* Title */}
        <Text style={[styles.title, { color: colors.text.primary }]}>
          Find Language Partners Nearby
        </Text>

        {/* Description */}
        <Text style={[styles.description, { color: colors.text.secondary }]}>
          Discover native speakers in your area and connect with people who want to practice your target language.
        </Text>

        {/* Progress Indicators */}
        <View style={styles.progressContainer}>
          <View style={[styles.progressDot, { backgroundColor: colors.primary }]} />
          <View style={[styles.progressDot, styles.progressDotInactive, { backgroundColor: colors.border.default }]} />
          <View style={[styles.progressDot, styles.progressDotInactive, { backgroundColor: colors.border.default }]} />
        </View>

        {/* Next Button */}
        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.primary }]}
          onPress={() => router.push('/(onboarding)/onboarding-2')}>
          <Text style={styles.buttonText}>Next</Text>
        </TouchableOpacity>

        {/* Skip */}
        <TouchableOpacity onPress={() => router.replace('/(onboarding)/profile-setup')}>
          <Text style={[styles.skipText, { color: colors.text.secondary }]}>Skip</Text>
        </TouchableOpacity>
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
  mapIcon: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapEmoji: {
    fontSize: 30,
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
  button: {
    width: '100%',
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  skipText: {
    fontSize: 14,
  },
});

