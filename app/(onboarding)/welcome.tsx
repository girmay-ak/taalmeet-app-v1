/**
 * Onboarding Screen - React Native Version
 * Converted from ux-template/src/screens/OnboardingScreen.tsx
 * Matches ux-template design with animated backgrounds and walkthrough slides
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  withSequence,
  interpolate,
  Easing,
  FadeIn,
  FadeInDown,
  FadeInUp,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

// Animated Circles Component
function AnimatedCircles({ 
  circles 
}: { 
  circles: Array<{ size: number; x: number; y: number; duration: number; delay: number }> 
}) {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {circles.map((circle, index) => (
        <AnimatedCircle key={index} circle={circle} />
      ))}
    </View>
  );
}

function AnimatedCircle({ circle }: { circle: { size: number; x: number; y: number; duration: number; delay: number } }) {
  const yAnim = useSharedValue(0);
  const xAnim = useSharedValue(0);
  const scaleAnim = useSharedValue(1);
  const opacityAnim = useSharedValue(0.3);

  useEffect(() => {
    yAnim.value = withRepeat(
      withSequence(
        withTiming(-30, { duration: circle.duration * 1000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: circle.duration * 1000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );
    xAnim.value = withRepeat(
      withSequence(
        withTiming(20, { duration: circle.duration * 1000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: circle.duration * 1000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );
    scaleAnim.value = withRepeat(
      withSequence(
        withTiming(1.2, { duration: circle.duration * 1000, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: circle.duration * 1000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );
    opacityAnim.value = withRepeat(
      withSequence(
        withTiming(0.5, { duration: circle.duration * 1000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.3, { duration: circle.duration * 1000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: xAnim.value },
      { translateY: yAnim.value },
      { scale: scaleAnim.value },
    ],
    opacity: opacityAnim.value,
  }));

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          width: circle.size,
          height: circle.size,
          left: `${circle.x}%`,
          top: `${circle.y}%`,
          borderRadius: circle.size / 2,
        },
        animatedStyle,
      ]}
    >
      <LinearGradient
        colors={['rgba(29, 185, 84, 0.2)', 'rgba(30, 215, 96, 0.1)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
    </Animated.View>
  );
}

// Onboarding slides data
const slides = [
  {
    image: require('@/assets/onboarding-1.png'),
    title: 'Find Language\nPartners Nearby',
    description: 'Discover people learning your native language who can teach you theirs, all in your area.',
  },
  {
    image: require('@/assets/onboarding-2.png'),
    title: 'Celebrate Your\nProgress',
    description: 'Track your achievements and milestones as you learn new languages together.',
  },
  {
    image: require('@/assets/onboarding-3.png'),
    title: 'Meet & Practice\nTogether',
    description: 'Connect and practice with language partners through fun conversations.',
  },
  {
    image: require('@/assets/onboarding-4.png'),
    title: 'Learn In Any\nSetting',
    description: 'Engage in language exchanges anywhere, anytime — café, park, train, and more!',
  },
];

// Welcome Screen Component - Matching ux-template Design
function WelcomeScreen({ onNext }: { onNext: () => void }) {
  const welcomeCircles = [
    { size: 300, x: -10, y: -10, duration: 25, delay: 0 },
    { size: 200, x: 70, y: 10, duration: 20, delay: 2 },
    { size: 150, x: 50, y: 60, duration: 22, delay: 1 },
    { size: 100, x: 10, y: 40, duration: 18, delay: 1.5 },
    { size: 80, x: 85, y: 70, duration: 19, delay: 2.5 },
    { size: 60, x: 30, y: 20, duration: 16, delay: 0.5 },
  ];

  return (
    <View style={styles.welcomeContainer}>
      {/* Animated background circles */}
      <AnimatedCircles circles={welcomeCircles} />

      {/* Content */}
      <View style={styles.welcomeContent}>
        <Animated.View
          entering={FadeInDown.duration(800).delay(300)}
          style={styles.welcomeTextContainer}
        >
          {/* Globe Icon */}
          <Animated.View
            entering={FadeInUp.duration(500).delay(500)}
            style={styles.emojiContainer}
          >
            <Text style={styles.emoji}>🌍</Text>
          </Animated.View>

          {/* Welcome Text - Matching ux-template */}
          <View style={styles.titleContainer}>
            <Text style={styles.welcomeToText}>Welcome to </Text>
            <Text style={styles.brandTitle}>TaalMeet</Text>
          </View>

          {/* Description */}
          <Text style={styles.welcomeDescription}>
            Connect with language partners nearby for real conversations and cultural exchange
          </Text>
        </Animated.View>

        {/* Get Started Button - At bottom */}
        <Animated.View
          entering={FadeInUp.duration(500).delay(800)}
          style={styles.welcomeButtonContainer}
        >
          <TouchableOpacity
            onPress={onNext}
            activeOpacity={0.8}
            style={styles.getStartedButton}
          >
            <LinearGradient
              colors={['#1DB954', '#1ED760']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.getStartedGradient}
            >
              <Text style={styles.getStartedText}>Get Started</Text>
              <Ionicons name="chevron-forward" size={24} color="#FFFFFF" />
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </View>
  );
}

// Walkthrough Screen Component
function WalkthroughScreen({
  step,
  onNext,
  onSkip,
}: {
  step: number;
  onNext: () => void;
  onSkip: () => void;
}) {
  const currentSlide = slides[step - 1];
  const rotationAnim = useSharedValue(0);

  const circles = [
    { size: 250, x: 50, y: 15, duration: 20, delay: 0 },
    { size: 150, x: 10, y: 25, duration: 18, delay: 1 },
    { size: 100, x: 80, y: 10, duration: 22, delay: 2 },
    { size: 80, x: 70, y: 40, duration: 19, delay: 1.5 },
    { size: 60, x: 20, y: 45, duration: 16, delay: 2.5 },
    { size: 40, x: 90, y: 30, duration: 17, delay: 0.5 },
  ];

  useEffect(() => {
    rotationAnim.value = withRepeat(
      withTiming(360, { duration: 20000, easing: Easing.linear }),
      -1,
      false
    );
  }, []);

  const rotationStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotationAnim.value}deg` }],
  }));

  return (
    <View style={styles.walkthroughContainer}>
      {/* Animated background circles */}
      <View style={[StyleSheet.absoluteFill, { opacity: 0.4 }]} pointerEvents="none">
        <AnimatedCircles circles={circles} />
      </View>

      {/* Content */}
      <View style={styles.walkthroughContent}>
        {/* Skip button */}
        <View style={styles.skipContainer}>
          <TouchableOpacity onPress={onSkip}>
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>
        </View>

        {/* Main content */}
        <View style={styles.walkthroughMain}>
          {/* Image in circular frame */}
          <Animated.View
            key={`image-${step}`}
            entering={FadeInUp.duration(500)}
            style={styles.imageContainer}
          >
            {/* Outer glow ring */}
            <View style={styles.glowRing} />

            {/* Image container with border */}
            <View style={styles.imageFrame}>
              <Image
                source={currentSlide.image}
                style={styles.onboardingImage}
                resizeMode="cover"
              />
              {/* Overlay gradient */}
              <LinearGradient
                colors={['transparent', 'rgba(15, 15, 15, 0.4)']}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
                style={StyleSheet.absoluteFill}
              />
            </View>

            {/* Animated rotating ring */}
            <Animated.View style={[styles.rotatingRing, rotationStyle]} />
          </Animated.View>

          {/* Text content */}
          <Animated.View
            key={`text-${step}`}
            entering={FadeInUp.duration(500).delay(200)}
            style={styles.textContent}
          >
            <Text style={styles.slideTitle}>{currentSlide.title}</Text>
            <Text style={styles.slideDescription}>{currentSlide.description}</Text>
          </Animated.View>
        </View>

        {/* Bottom section */}
        <View style={styles.bottomSection}>
          {/* Progress dots */}
          <View style={styles.progressDots}>
            {[1, 2, 3, 4].map((dot) => (
              <Animated.View
                key={dot}
                style={[
                  styles.progressDot,
                  dot === step && styles.progressDotActive,
                  {
                    width: dot === step ? 32 : 8,
                  },
                ]}
              />
            ))}
          </View>

          {/* Next button */}
          <TouchableOpacity
            onPress={onNext}
            activeOpacity={0.8}
            style={styles.nextButton}
          >
            <LinearGradient
              colors={['#1DB954', '#1ED760']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.nextButtonGradient}
            >
              <Text style={styles.nextButtonText}>
                {step === 4 ? "Let's Go!" : 'Next'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

// Main Onboarding Screen
export default function OnboardingScreen() {
  const [currentStep, setCurrentStep] = useState(0); // 0 = welcome, 1-4 = walkthrough

  const handleNext = () => {
    if (currentStep === 0) {
      setCurrentStep(1);
    } else if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    } else {
      // Complete onboarding - go to "Let's you in" screen
      router.replace('/(auth)/lets-you-in');
    }
  };

  const handleSkip = () => {
    // Skip onboarding - go to "Let's you in" screen
    router.replace('/(auth)/lets-you-in');
  };

  if (currentStep === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <WelcomeScreen onNext={handleNext} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <WalkthroughScreen step={currentStep} onNext={handleNext} onSkip={handleSkip} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F0F0F',
  },
  welcomeContainer: {
    flex: 1,
    backgroundColor: '#0F0F0F',
    overflow: 'hidden',
  },
  welcomeContent: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingBottom: 48,
    paddingHorizontal: 24,
    zIndex: 10,
  },
  welcomeTextContainer: {
    alignItems: 'center',
    marginBottom: 48,
  },
  emojiContainer: {
    marginBottom: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: {
    fontSize: 96, // Matches ux-template text-8xl
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  welcomeToText: {
    fontSize: 48, // Matches ux-template text-5xl = 48px
    fontWeight: 'bold',
    color: '#FFFFFF',
    lineHeight: 56, // Matches tight line-height
  },
  brandTitle: {
    fontSize: 48, // Matches ux-template text-5xl
    fontWeight: 'bold',
    color: '#1DB954', // Green gradient color (simplified for RN)
    lineHeight: 56,
  },
  welcomeDescription: {
    fontSize: 18, // Matches ux-template text-lg = 18px
    color: '#9CA3AF', // Matches ux-template text-[#9CA3AF]
    textAlign: 'center',
    lineHeight: 28, // Matches ux-template leading-relaxed
    paddingHorizontal: 0,
  },
  welcomeButtonContainer: {
    width: '100%',
  },
  getStartedButton: {
    width: '100%',
    borderRadius: 999, // Matches ux-template rounded-full
    overflow: 'hidden',
    shadowColor: '#1DB954',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8, // Matches ux-template shadow-lg
    elevation: 8,
  },
  getStartedGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16, // Matches ux-template py-4 = 16px
    paddingHorizontal: 24, // Matches ux-template px-6 = 24px
    gap: 8, // Matches ux-template gap-2 = 8px
  },
  getStartedText: {
    fontSize: 18, // Matches ux-template text-lg = 18px
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  walkthroughContainer: {
    flex: 1,
    backgroundColor: '#0F0F0F',
  },
  walkthroughContent: {
    flex: 1,
    paddingTop: 64,
    paddingBottom: 48,
    paddingHorizontal: 24,
    zIndex: 1,
  },
  skipContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 32,
  },
  skipText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#9CA3AF',
  },
  walkthroughMain: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageContainer: {
    width: 288, // Matches ux-template w-72 = 288px
    height: 288, // Matches ux-template h-72 = 288px
    marginBottom: 48, // Matches ux-template mb-12 = 48px
    position: 'relative',
  },
  glowRing: {
    position: 'absolute',
    inset: 0,
    borderRadius: 144, // Half of 288 for perfect circle
    // Gradient glow matching ux-template from-[#1DB954]/30 to-[#1ED760]/30
    backgroundColor: 'rgba(29, 185, 84, 0.3)',
  },
  imageFrame: {
    width: '100%',
    height: '100%',
    borderRadius: 144, // Perfect circle
    borderWidth: 4, // Matches ux-template border-4
    borderColor: '#1DB954', // Matches ux-template border-[#1DB954]
    overflow: 'hidden',
    backgroundColor: '#1A1A1A', // Matches ux-template bg-[#1A1A1A]
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 16, // Matches ux-template shadow-2xl
    elevation: 16,
  },
  onboardingImage: {
    width: '100%',
    height: '100%',
  },
  rotatingRing: {
    position: 'absolute',
    inset: 0,
    borderRadius: 144,
    // Conic gradient effect matching ux-template
    borderWidth: 2,
    borderColor: 'transparent',
    borderTopColor: '#1DB954',
    borderRightColor: '#1DB954',
    // Note: React Native doesn't support conic-gradient directly
    // Using border colors to simulate the effect
  },
  textContent: {
    alignItems: 'center',
    marginBottom: 32,
  },
  slideTitle: {
    fontSize: 30, // Matches ux-template text-3xl
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 16, // Matches ux-template mb-4
    textAlign: 'center',
    lineHeight: 40, // Matches leading-tight
  },
  slideDescription: {
    fontSize: 18, // Matches ux-template text-lg
    color: '#9CA3AF', // Gray-400
    textAlign: 'center',
    lineHeight: 28, // Matches leading-relaxed
    maxWidth: width - 96, // Max width constraint for readability
  },
  bottomSection: {
    gap: 24,
  },
  progressDots: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8, // Matches ux-template gap-2 = 8px
  },
  progressDot: {
    height: 8, // Matches ux-template h-2 = 8px
    borderRadius: 4, // Matches ux-template rounded-full
    backgroundColor: '#3A3A3A', // Matches ux-template bg-[#3A3A3A]
  },
  progressDotActive: {
    backgroundColor: '#1DB954', // Gradient from-[#1DB954] (simplified for RN)
    // Width is set dynamically in the component (32px when active, 8px when inactive)
  },
  nextButton: {
    width: '100%',
    borderRadius: 999, // Matches ux-template rounded-full
    overflow: 'hidden',
    shadowColor: '#1DB954',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8, // Matches ux-template shadow-lg
    elevation: 8,
  },
  nextButtonGradient: {
    paddingVertical: 16, // Matches ux-template py-4 = 16px
    paddingHorizontal: 24, // Matches ux-template px-6 = 24px
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextButtonText: {
    fontSize: 18, // Matches ux-template text-lg = 18px
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
});
