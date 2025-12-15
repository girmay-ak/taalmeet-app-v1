/**
 * Let's You In Screen
 * First authentication screen - Social login options
 * Matches Eveno design
 */

import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/lib/theme/ThemeProvider';
import { TaalMeetLogo } from '@/components';

const { width } = Dimensions.get('window');

export default function LetsYouInScreen() {
  const { colors } = useTheme();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background.primary }]}>
      {/* Back Button */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.back()}
      >
        <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
      </TouchableOpacity>

      {/* Illustration Area */}
      <View style={styles.illustrationContainer}>
        <View style={[styles.illustrationShape, { backgroundColor: colors.primary + '20' }]}>
          <View style={[styles.shapeDot, { backgroundColor: colors.primary + '40' }]} />
          <View style={[styles.shapeDot, styles.shapeDot2, { backgroundColor: colors.primary + '30' }]} />
          <View style={[styles.shapeDot, styles.shapeDot3, { backgroundColor: colors.primary + '20' }]} />
        </View>
      </View>

      {/* Title */}
      <Text style={[styles.title, { color: colors.text.primary }]}>
        Let's you in
      </Text>

      {/* Social Login Buttons */}
      <View style={styles.socialButtonsContainer}>
        <TouchableOpacity
          style={[styles.socialButton, { backgroundColor: colors.background.secondary, borderColor: colors.border.default }]}
          onPress={() => {
            // TODO: Implement Facebook login
            console.log('Facebook login');
          }}
        >
          <Ionicons name="logo-facebook" size={24} color="#1877F2" />
          <Text style={[styles.socialButtonText, { color: colors.text.primary }]}>
            Continue with Facebook
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.socialButton, { backgroundColor: colors.background.secondary, borderColor: colors.border.default }]}
          onPress={() => {
            // TODO: Implement Google login
            console.log('Google login');
          }}
        >
          <View style={[styles.googleIcon, { backgroundColor: colors.background.primary }]}>
            <Text style={styles.googleG}>G</Text>
          </View>
          <Text style={[styles.socialButtonText, { color: colors.text.primary }]}>
            Continue with Google
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.socialButton, { backgroundColor: colors.background.secondary, borderColor: colors.border.default }]}
          onPress={() => {
            // TODO: Implement Apple login
            console.log('Apple login');
          }}
        >
          <Ionicons name="logo-apple" size={24} color={colors.text.primary} />
          <Text style={[styles.socialButtonText, { color: colors.text.primary }]}>
            Continue with Apple
          </Text>
        </TouchableOpacity>
      </View>

      {/* Divider */}
      <View style={styles.divider}>
        <View style={[styles.dividerLine, { backgroundColor: colors.border.default }]} />
        <Text style={[styles.dividerText, { color: colors.text.secondary }]}>or</Text>
        <View style={[styles.dividerLine, { backgroundColor: colors.border.default }]} />
      </View>

      {/* Sign in with Password Button */}
      <TouchableOpacity
        style={[styles.passwordButton, { backgroundColor: colors.primary }]}
        onPress={() => router.push('/(auth)/sign-in')}
      >
        <Text style={styles.passwordButtonText}>Sign in with password</Text>
      </TouchableOpacity>

      {/* Sign Up Link */}
      <View style={styles.signUpContainer}>
        <Text style={[styles.signUpText, { color: colors.text.secondary }]}>
          Don't have an account?{' '}
        </Text>
        <TouchableOpacity onPress={() => router.push('/(auth)/sign-up')}>
          <Text style={[styles.signUpLink, { color: colors.primary }]}>Sign up</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  illustrationContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: width * 0.6,
    marginBottom: 40,
  },
  illustrationShape: {
    width: width * 0.7,
    height: width * 0.7,
    borderRadius: width * 0.35,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  shapeDot: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  shapeDot2: {
    top: 40,
    right: 60,
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  shapeDot3: {
    bottom: 50,
    left: 50,
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 40,
  },
  socialButtonsContainer: {
    gap: 16,
    marginBottom: 24,
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 20,
    gap: 12,
  },
  googleIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  googleG: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4285F4',
  },
  socialButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    paddingHorizontal: 16,
    fontSize: 14,
  },
  passwordButton: {
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  passwordButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  signUpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  signUpText: {
    fontSize: 14,
  },
  signUpLink: {
    fontSize: 14,
    fontWeight: '600',
  },
});

