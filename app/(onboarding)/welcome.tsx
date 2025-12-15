/**
 * Welcome Screen
 * Matches Eveno design: Hand holding phone with app preview, welcome message
 */

import { View, Text, TouchableOpacity, StyleSheet, Dimensions, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useTheme } from '@/lib/theme/ThemeProvider';
import { useAuth } from '@/providers';

const { width, height } = Dimensions.get('window');

export default function WelcomeScreen() {
  const { colors } = useTheme();
  const { profile } = useAuth();
  const userName = profile?.displayName || 'Language Learner';

  // Get time-based greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: '#0F0F0F' }]}>
      {/* Background with gradient overlay */}
      <View style={styles.backgroundOverlay} />

      {/* Hand holding phone illustration area */}
      <View style={styles.illustrationContainer}>
        {/* Phone mockup */}
        <View style={[styles.phoneMockup, { backgroundColor: '#1A1A1A', borderColor: colors.border.default }]}>
          {/* Phone screen content */}
          <View style={[styles.phoneScreen, { backgroundColor: colors.background.primary }]}>
            {/* Phone header */}
            <View style={styles.phoneHeader}>
              <View style={styles.phoneUserInfo}>
                <Text style={[styles.phoneGreeting, { color: colors.text.muted }]}>
                  {getGreeting()}
                </Text>
                <Text style={[styles.phoneUserName, { color: colors.text.primary }]} numberOfLines={1}>
                  {userName}
                </Text>
              </View>
            </View>

            {/* Search bar */}
            <View style={[styles.phoneSearchBar, { backgroundColor: colors.background.secondary }]}>
              <Text style={[styles.phoneSearchText, { color: colors.text.muted }]}>
                What language partner...
              </Text>
            </View>

            {/* Event cards preview */}
            <View style={styles.phoneContent}>
              <View style={[styles.phoneCard, { backgroundColor: colors.background.secondary }]}>
                <View style={[styles.phoneCardImage, { backgroundColor: colors.primary + '30' }]} />
                <Text style={[styles.phoneCardText, { color: colors.text.primary }]} numberOfLines={1}>
                  Spanish Exchange
                </Text>
              </View>
              <View style={[styles.phoneCard, { backgroundColor: colors.background.secondary }]}>
                <View style={[styles.phoneCardImage, { backgroundColor: colors.primary + '30' }]} />
                <Text style={[styles.phoneCardText, { color: colors.text.primary }]} numberOfLines={1}>
                  French Practice
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Hand emoji/illustration */}
        <View style={styles.handContainer}>
          <Text style={styles.handEmoji}>👋</Text>
        </View>
      </View>

      {/* Welcome Text */}
      <View style={styles.welcomeContent}>
        <Text style={styles.welcomeTitle}>Welcome to TAALMEET! 👋</Text>
        <Text style={styles.welcomeSubtitle}>
          The best language exchange and partner finding application in this century.
        </Text>

        {/* Action Button */}
        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.primary }]}
          onPress={() => router.push('/(onboarding)/onboarding-1')}
        >
          <Text style={styles.buttonText}>Get Started</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F0F0F',
  },
  backgroundOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#0F0F0F',
    opacity: 0.9,
  },
  illustrationContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 40,
    position: 'relative',
  },
  phoneMockup: {
    width: width * 0.5,
    height: height * 0.5,
    borderRadius: 32,
    borderWidth: 8,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 20,
  },
  phoneScreen: {
    flex: 1,
    borderRadius: 24,
    padding: 12,
  },
  phoneHeader: {
    marginBottom: 12,
  },
  phoneUserInfo: {
    marginBottom: 8,
  },
  phoneGreeting: {
    fontSize: 12,
    marginBottom: 2,
  },
  phoneUserName: {
    fontSize: 16,
    fontWeight: '700',
  },
  phoneSearchBar: {
    height: 36,
    borderRadius: 12,
    paddingHorizontal: 12,
    justifyContent: 'center',
    marginBottom: 16,
  },
  phoneSearchText: {
    fontSize: 11,
  },
  phoneContent: {
    gap: 8,
  },
  phoneCard: {
    height: 60,
    borderRadius: 12,
    padding: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  phoneCardImage: {
    width: 44,
    height: 44,
    borderRadius: 8,
  },
  phoneCardText: {
    flex: 1,
    fontSize: 12,
    fontWeight: '600',
  },
  handContainer: {
    position: 'absolute',
    bottom: -20,
    right: width * 0.15,
  },
  handEmoji: {
    fontSize: 80,
  },
  welcomeContent: {
    padding: 24,
    paddingBottom: 40,
    alignItems: 'center',
  },
  welcomeTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 12,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: '#9CA3AF',
    textAlign: 'center',
    marginBottom: 32,
    paddingHorizontal: 20,
    lineHeight: 24,
  },
  button: {
    width: '100%',
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
