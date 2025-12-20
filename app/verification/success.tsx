/**
 * Verification Success Screen
 * Celebratory success screen after completing verification
 */

import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring,
  withTiming,
  withSequence,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import { useCompleteFullVerification } from '@/hooks/useVerification';
import { useTheme } from '@/lib/theme/ThemeProvider';

const { width } = Dimensions.get('window');

export default function VerificationSuccessScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const params = useLocalSearchParams<{ sessionId?: string; skipped?: string }>();
  const completeVerification = useCompleteFullVerification();

  // Animation values
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);
  const checkScale = useSharedValue(0);

  useEffect(() => {
    // Complete verification session
    if (params.sessionId) {
      completeVerification.mutate(params.sessionId);
    }

    // Start animations
    scale.value = withSpring(1, {
      damping: 15,
      stiffness: 100,
    });

    opacity.value = withTiming(1, {
      duration: 500,
      easing: Easing.out(Easing.ease),
    });

    checkScale.value = withDelay(
      200,
      withSequence(
        withSpring(1.2, { damping: 10, stiffness: 100 }),
        withSpring(1, { damping: 15, stiffness: 100 })
      )
    );

    // Auto-redirect after 4 seconds
    const timer = setTimeout(() => {
      router.replace('/(tabs)');
    }, 4000);

    return () => clearTimeout(timer);
  }, []);

  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const checkStyle = useAnimatedStyle(() => ({
    transform: [{ scale: checkScale.value }],
  }));

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background.primary }]} edges={['top', 'bottom']}>
      {/* Semi-transparent overlay */}
      <View style={styles.overlay} />

      {/* Success Content */}
      <View style={styles.contentContainer}>
        <Animated.View style={[styles.card, { backgroundColor: colors.background.secondary }, containerStyle]}>
          {/* Decorative Circles */}
          <View style={styles.decorativeContainer}>
            <View style={[styles.decorativeCircleLarge, { backgroundColor: `${colors.primary}15` }]} />
            <View style={[styles.decorativeCircleSmall1, { backgroundColor: `${colors.primary}40` }]} />
            <View style={[styles.decorativeCircleSmall2, { backgroundColor: `${colors.primary}30` }]} />
            <View style={[styles.decorativeCircleSmall3, { backgroundColor: `${colors.primary}20` }]} />
            <View style={[styles.decorativeCircleSmall4, { backgroundColor: `${colors.primary}30` }]} />
          </View>

          {/* Success Icon */}
          <Animated.View style={[styles.iconContainer, checkStyle]}>
            <LinearGradient
              colors={['#1DB954', '#0EA5E9']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.iconGradient}
            >
              <Ionicons name="checkmark-circle" size={72} color="#FFFFFF" />
            </LinearGradient>
          </Animated.View>

          {/* Success Message */}
          <Text style={[styles.title, { color: '#1DB954' }]}>
            Verification Complete!
          </Text>
          <Text style={[styles.subtitle, { color: colors.text.muted }]}>
            Your profile has been successfully verified. You now have a verified badge!
          </Text>

          {/* Benefits Preview */}
          <View style={[styles.benefitsContainer, { backgroundColor: `${colors.primary}10`, borderColor: `${colors.primary}20` }]}>
            <View style={styles.benefitRow}>
              <Ionicons name="checkmark-circle" size={16} color="#1DB954" />
              <Text style={[styles.benefitText, { color: colors.text.primary }]}>
                Verified badge added to your profile
              </Text>
            </View>
            <View style={styles.benefitRow}>
              <Ionicons name="checkmark-circle" size={16} color="#1DB954" />
              <Text style={[styles.benefitText, { color: colors.text.primary }]}>
                Increased trust and visibility
              </Text>
            </View>
            <View style={styles.benefitRow}>
              <Ionicons name="checkmark-circle" size={16} color="#1DB954" />
              <Text style={[styles.benefitText, { color: colors.text.primary }]}>
                Priority support enabled
              </Text>
            </View>
          </View>

          {/* Action Button */}
          <TouchableOpacity
            style={styles.button}
            onPress={() => router.replace('/(tabs)')}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={[colors.primary, '#0EA5E9']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.buttonGradient}
            >
              <Text style={styles.buttonText}>Continue to Profile</Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* Auto-redirect notice */}
          <Text style={[styles.redirectText, { color: colors.text.muted }]}>
            Redirecting in a few seconds...
          </Text>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 32,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  decorativeContainer: {
    position: 'absolute',
    top: 20,
    left: 20,
    right: 20,
    height: 180,
  },
  decorativeCircleLarge: {
    position: 'absolute',
    top: 20,
    left: 20,
    width: 140,
    height: 140,
    borderRadius: 70,
  },
  decorativeCircleSmall1: {
    position: 'absolute',
    top: 20,
    right: 0,
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  decorativeCircleSmall2: {
    position: 'absolute',
    top: 0,
    left: 10,
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  decorativeCircleSmall3: {
    position: 'absolute',
    bottom: 32,
    left: 4,
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  decorativeCircleSmall4: {
    position: 'absolute',
    bottom: 0,
    right: 60,
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  iconContainer: {
    marginBottom: 24,
    zIndex: 10,
  },
  iconGradient: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  benefitsContainer: {
    width: '100%',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 24,
    gap: 8,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  benefitText: {
    fontSize: 13,
    flex: 1,
  },
  button: {
    width: '100%',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
  },
  buttonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  redirectText: {
    fontSize: 12,
    textAlign: 'center',
  },
});
