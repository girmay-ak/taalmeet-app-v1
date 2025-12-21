/**
 * Let's You In Screen
 * Social login and password sign-in options
 * Based on Figma design: Eveno Event Booking App UI Kit
 */

import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/lib/theme/ThemeProvider';
import { TaalMeetLogo } from '@/components';
import { Image } from 'expo-image';

const { width } = Dimensions.get('window');

interface SocialButtonProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  iconColor?: string;
  onPress: () => void;
  colors: any;
}

function SocialButton({ icon, label, iconColor, onPress, colors }: SocialButtonProps) {
  return (
    <TouchableOpacity
      style={[
        styles.socialButton,
        {
          backgroundColor: colors.background.primary,
          borderColor: colors.border.default,
        },
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Ionicons name={icon} size={24} color={iconColor || colors.text.primary} />
      <Text style={[styles.socialButtonText, { color: colors.text.primary }]}>{label}</Text>
    </TouchableOpacity>
  );
}

export default function LetsYouInScreen() {
  const { colors } = useTheme();
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 7,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleBack = () => {
    router.back();
  };

  const handleFacebookLogin = () => {
    // TODO: Implement Facebook login
    console.log('Facebook login');
  };

  const handleGoogleLogin = () => {
    // TODO: Implement Google login
    console.log('Google login');
  };

  const handleAppleLogin = () => {
    // TODO: Implement Apple login
    console.log('Apple login');
  };

  const handlePasswordSignIn = () => {
    router.push('/(auth)/sign-in');
  };

  const handleSignUp = () => {
    router.push('/(auth)/sign-up');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background.primary }]}>
      <StatusBar style={colors.mode === 'dark' ? 'light' : 'dark'} />
      
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* Header with Back Button */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={handleBack}
            style={styles.backButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
          </TouchableOpacity>
        </View>

        {/* Illustration Section */}
        <Animated.View
          style={[
            styles.illustrationContainer,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <View style={styles.illustrationWrapper}>
            <TaalMeetLogo size={180} variant="icon" />
          </View>
        </Animated.View>

        {/* Title */}
        <Animated.View
          style={[
            styles.titleContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <Text style={[styles.title, { color: colors.text.primary }]}>Let's you in</Text>
        </Animated.View>

        {/* Social Login Buttons */}
        <Animated.View
          style={[
            styles.buttonsContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          {/* Facebook */}
          <SocialButton
            icon="logo-facebook"
            label="Continue with Facebook"
            iconColor="#1877F2"
            onPress={handleFacebookLogin}
            colors={colors}
          />

          {/* Google */}
          <SocialButton
            icon="logo-google"
            label="Continue with Google"
            iconColor="#4285F4"
            onPress={handleGoogleLogin}
            colors={colors}
          />

          {/* Apple */}
          <SocialButton
            icon="logo-apple"
            label="Continue with Apple"
            iconColor={colors.text.primary}
            onPress={handleAppleLogin}
            colors={colors}
          />

          {/* Divider */}
          <View style={styles.dividerContainer}>
            <View style={[styles.dividerLine, { backgroundColor: colors.border.default }]} />
            <Text style={[styles.dividerText, { color: colors.text.muted }]}>or</Text>
            <View style={[styles.dividerLine, { backgroundColor: colors.border.default }]} />
          </View>

          {/* Password Sign In Button */}
          <TouchableOpacity
            style={[
              styles.passwordButton,
              {
                backgroundColor: colors.primary,
                shadowColor: colors.primary,
              },
            ]}
            onPress={handlePasswordSignIn}
            activeOpacity={0.8}
          >
            <Text style={styles.passwordButtonText}>Sign in with password</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Sign Up Link */}
        <Animated.View
          style={[
            styles.footerContainer,
            {
              opacity: fadeAnim,
            },
          ]}
        >
          <Text style={[styles.footerText, { color: colors.text.muted }]}>
            Don't have an account?{' '}
          </Text>
          <TouchableOpacity onPress={handleSignUp} activeOpacity={0.7}>
            <Text style={[styles.signUpLink, { color: colors.primary }]}>Sign up</Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 48,
  },
  header: {
    height: 48,
    justifyContent: 'center',
    marginBottom: 24,
  },
  backButton: {
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  illustrationContainer: {
    height: 200,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 48,
  },
  illustrationWrapper: {
    width: 237,
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleContainer: {
    marginBottom: 48,
    alignItems: 'center',
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    textAlign: 'center',
    lineHeight: 57.6, // 48 * 1.2
    letterSpacing: 0,
  },
  buttonsContainer: {
    width: '100%',
    gap: 16,
    marginBottom: 24,
    alignItems: 'center',
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 32,
    paddingVertical: 18,
    gap: 12,
    width: '100%',
  },
  socialButtonText: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    gap: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  passwordButton: {
    height: 56,
    borderRadius: 100, // Fully rounded
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: { width: 4, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 8,
    width: 380,
    maxWidth: '100%',
  },
  passwordButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 0.2,
  },
  footerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 'auto',
    paddingTop: 24,
  },
  footerText: {
    fontSize: 14,
    letterSpacing: 0.2,
  },
  signUpLink: {
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
});

