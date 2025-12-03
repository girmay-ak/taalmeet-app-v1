/**
 * Success Screen
 * Displayed after successful signup completion
 */

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/lib/theme/ThemeProvider';
import { useAuth } from '@/providers';

interface SuccessScreenProps {
  onComplete: () => void;
}

const FEATURES = [
  { icon: '🗺️', text: 'Discover partners nearby' },
  { icon: '💬', text: 'Chat instantly' },
  { icon: '⭐', text: 'Build connections' },
];

export function SuccessScreen({ onComplete }: SuccessScreenProps) {
  const { colors } = useTheme();
  const { session, loading } = useAuth();
  
  // Animation values
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const featureAnims = useRef(FEATURES.map(() => new Animated.Value(0))).current;

  // Ensure session is available before allowing navigation
  useEffect(() => {
    if (!loading && session) {
      // Session is ready, user can navigate
    }
  }, [session, loading]);

  useEffect(() => {
    // Main circle animation
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 4,
      tension: 40,
      useNativeDriver: true,
    }).start();

    // Fade in text
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      delay: 300,
      useNativeDriver: true,
    }).start();

    // Pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Feature cards staggered animation
    featureAnims.forEach((anim, index) => {
      Animated.timing(anim, {
        toValue: 1,
        duration: 400,
        delay: 600 + index * 100,
        useNativeDriver: true,
      }).start();
    });
  }, []);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background.primary }]}>
      <View style={styles.content}>
        {/* Success Animation */}
        <View style={styles.animationContainer}>
          {/* Pulse Ring */}
          <Animated.View
            style={[
              styles.pulseRing,
              {
                transform: [{ scale: pulseAnim }],
                opacity: pulseAnim.interpolate({
                  inputRange: [1, 1.2],
                  outputRange: [0.3, 0],
                }),
              },
            ]}
          >
            <LinearGradient
              colors={[colors.primary, '#1ED760']}
              style={styles.pulseGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            />
          </Animated.View>

          {/* Main Circle */}
          <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
            <LinearGradient
              colors={[colors.primary, '#1ED760']}
              style={styles.successCircle}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.successEmoji}>🎉</Text>
            </LinearGradient>
          </Animated.View>
        </View>

        {/* Success Message */}
        <Animated.View style={[styles.messageContainer, { opacity: fadeAnim }]}>
          <Text style={[styles.welcomeText, { color: colors.text.primary }]}>
            Welcome to
          </Text>
          <Text style={[styles.brandText, { color: colors.primary }]}>
            TaalMeet!
          </Text>
          <Text style={[styles.descriptionText, { color: colors.text.muted }]}>
            Your profile is ready! Let's find your first language partner.
          </Text>
        </Animated.View>

        {/* Features Preview */}
        <View style={styles.featuresContainer}>
          {FEATURES.map((feature, index) => (
            <Animated.View
              key={index}
              style={[
                styles.featureCard,
                {
                  backgroundColor: colors.background.secondary,
                  borderColor: colors.border.default,
                  opacity: featureAnims[index],
                  transform: [
                    {
                      translateX: featureAnims[index].interpolate({
                        inputRange: [0, 1],
                        outputRange: [-20, 0],
                      }),
                    },
                  ],
                },
              ]}
            >
              <Text style={styles.featureIcon}>{feature.icon}</Text>
              <Text style={[styles.featureText, { color: colors.text.primary }]}>
                {feature.text}
              </Text>
            </Animated.View>
          ))}
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.primaryButton, { backgroundColor: colors.primary }]}
          onPress={onComplete}
          activeOpacity={0.8}
        >
          <Ionicons name="sparkles" size={20} color="#FFFFFF" />
          <Text style={styles.primaryButtonText}>Discover Partners</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={onComplete} style={styles.secondaryButton}>
          <Text style={[styles.secondaryButtonText, { color: colors.text.muted }]}>
            Complete Profile Later
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
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  animationContainer: {
    marginBottom: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pulseRing: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
  },
  pulseGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 80,
  },
  successCircle: {
    width: 128,
    height: 128,
    borderRadius: 64,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  successEmoji: {
    fontSize: 56,
  },
  messageContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  welcomeText: {
    fontSize: 36,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  brandText: {
    fontSize: 36,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  descriptionText: {
    fontSize: 18,
    textAlign: 'center',
    lineHeight: 26,
    maxWidth: 320,
  },
  featuresContainer: {
    width: '100%',
    maxWidth: 360,
    gap: 12,
  },
  featureCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
  },
  featureIcon: {
    fontSize: 24,
  },
  featureText: {
    fontSize: 16,
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 32,
    gap: 12,
  },
  primaryButton: {
    height: 56,
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  secondaryButtonText: {
    fontSize: 14,
  },
});

