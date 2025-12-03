/**
 * Welcome/Onboarding Screen
 * First screen after signup
 */

import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { FlowingWavesRN } from '@/components';
import { useTheme } from '@/lib/theme/ThemeProvider';

export default function WelcomeScreen() {
  const { colors } = useTheme();
  const { width } = Dimensions.get('window');

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background.primary }]}>
      {/* Background */}
      <View style={styles.backgroundWaves}>
        <FlowingWavesRN />
      </View>

      <View style={styles.content}>
        {/* Logo */}
        <View style={[styles.logoContainer, { backgroundColor: colors.primary }]}>
          <Text style={styles.logoText}>💬</Text>
        </View>

        {/* Title */}
        <Text style={[styles.title, { color: colors.text.primary }]}>
          Welcome to TaalMeet! 🎉
        </Text>

        <Text style={[styles.subtitle, { color: colors.text.secondary }]}>
          Let's set up your profile to connect with language partners around the world
        </Text>

        {/* Features */}
        <View style={styles.features}>
          {[
            { icon: '🌍', title: 'Find Partners', desc: 'Connect with native speakers nearby' },
            { icon: '💬', title: 'Practice Live', desc: 'Real conversations, real progress' },
            { icon: '🎯', title: 'Track Goals', desc: 'Monitor your language journey' },
          ].map((feature, index) => (
            <View
              key={index}
              style={[
                styles.featureCard,
                { backgroundColor: colors.background.secondary, borderColor: colors.border.default },
              ]}>
              <Text style={styles.featureIcon}>{feature.icon}</Text>
              <Text style={[styles.featureTitle, { color: colors.text.primary }]}>
                {feature.title}
              </Text>
              <Text style={[styles.featureDesc, { color: colors.text.secondary }]}>
                {feature.desc}
              </Text>
            </View>
          ))}
        </View>

        {/* Continue Button */}
        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.primary }]}
          onPress={() => router.push('/(onboarding)/profile-setup')}>
          <Text style={styles.buttonText}>Continue to Profile Setup</Text>
        </TouchableOpacity>

        {/* Skip */}
        <TouchableOpacity onPress={() => router.replace('/(tabs)')}>
          <Text style={[styles.skipText, { color: colors.text.secondary }]}>
            Skip for now
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundWaves: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 300,
  },
  content: {
    flex: 1,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  logoText: {
    fontSize: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 40,
    paddingHorizontal: 20,
  },
  features: {
    width: '100%',
    marginBottom: 40,
  },
  featureCard: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 12,
    alignItems: 'center',
  },
  featureIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  featureDesc: {
    fontSize: 14,
    textAlign: 'center',
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
