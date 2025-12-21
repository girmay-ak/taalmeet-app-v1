// ID Type Selection Screen - TAALMEET
// Screen for selecting which ID document type to scan

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, ScrollView, StyleSheet } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import type { DocumentType } from '@/types/verification';
import Animated, { 
  FadeInDown, 
  FadeIn,
  useAnimatedStyle,
  withSpring,
  useSharedValue,
} from 'react-native-reanimated';

interface IDTypeOption {
  type: DocumentType;
  title: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
  requirements: string[];
}

const ID_TYPES: IDTypeOption[] = [
  {
    type: 'passport',
    title: 'Passport',
    subtitle: 'International travel document',
    icon: 'airplane',
    requirements: [
      'Valid passport with photo page',
      'Clear, readable text',
      'No glare or shadows',
    ],
  },
  {
    type: 'drivers_license',
    title: "Driver's License",
    subtitle: 'Government-issued driving permit',
    icon: 'car',
    requirements: [
      'Front side with photo',
      'Current and not expired',
      'All corners visible',
    ],
  },
  {
    type: 'national_id',
    title: 'National ID Card',
    subtitle: 'Government identification card',
    icon: 'card',
    requirements: [
      'Government-issued ID',
      'Photo clearly visible',
      'Valid and not expired',
    ],
  },
  {
    type: 'residence_permit',
    title: 'Residence Permit',
    subtitle: 'Legal residency document',
    icon: 'home',
    requirements: [
      'Valid residence permit',
      'Photo page visible',
      'Current validity date',
    ],
  },
];

export default function SelectIDTypeScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ sessionId?: string }>();
  const [selectedType, setSelectedType] = useState<DocumentType | null>(null);

  const handleSelectType = (type: DocumentType) => {
    setSelectedType(type);
  };

  const handleContinue = () => {
    if (!selectedType) return;

    router.push({
      pathname: '/verification/photo-id-card',
      params: { 
        sessionId: params.sessionId,
        documentType: selectedType,
      },
    });
  };

  return (
    <View style={styles.container}>
      {/* Gradient Background */}
      <LinearGradient
        colors={['#1a1a2e', '#16213e', '#0f3460']}
        style={StyleSheet.absoluteFill}
      />

      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={28} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Content */}
        <ScrollView 
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* Title Section */}
          <Animated.View entering={FadeIn.duration(600)} style={styles.titleSection}>
            <Text style={styles.title}>Select ID Type</Text>
            <Text style={styles.subtitle}>
              Choose the type of identification document you want to verify
            </Text>
          </Animated.View>

          {/* ID Type Cards */}
          <View style={styles.cardsContainer}>
            {ID_TYPES.map((idType, index) => (
              <IDTypeCard
                key={idType.type}
                idType={idType}
                selected={selectedType === idType.type}
                onSelect={handleSelectType}
                index={index}
              />
            ))}
          </View>

          {/* Info Banner */}
          <Animated.View 
            entering={FadeInDown.delay(400).duration(600)}
            style={styles.infoBanner}
          >
            <View style={styles.infoBannerIcon}>
              <Ionicons name="information-circle" size={24} color="#584CF4" />
            </View>
            <View style={styles.infoBannerContent}>
              <Text style={styles.infoBannerTitle}>Why do we need this?</Text>
              <Text style={styles.infoBannerText}>
                ID verification helps ensure the safety and authenticity of all users on our platform.
              </Text>
            </View>
          </Animated.View>
        </ScrollView>

        {/* Continue Button */}
        <Animated.View 
          entering={FadeInDown.delay(200).duration(600)}
          style={styles.footer}
        >
          <TouchableOpacity
            onPress={handleContinue}
            disabled={!selectedType}
            style={[
              styles.continueButton,
              !selectedType && styles.continueButtonDisabled,
            ]}
          >
            <LinearGradient
              colors={selectedType ? ['#584CF4', '#7369F8'] : ['#3a3a4a', '#3a3a4a']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.continueButtonGradient}
            >
              <Text style={styles.continueButtonText}>
                {selectedType ? 'Continue to Scan' : 'Select an ID Type'}
              </Text>
              {selectedType && (
                <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
              )}
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      </SafeAreaView>
    </View>
  );
}

// ID Type Card Component
function IDTypeCard({ 
  idType, 
  selected, 
  onSelect, 
  index 
}: { 
  idType: IDTypeOption; 
  selected: boolean; 
  onSelect: (type: DocumentType) => void;
  index: number;
}) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  const handlePress = () => {
    scale.value = withSpring(0.95, {}, () => {
      scale.value = withSpring(1);
    });
    onSelect(idType.type);
  };

  return (
    <Animated.View entering={FadeInDown.delay(index * 100).duration(600)}>
      <TouchableOpacity onPress={handlePress} activeOpacity={0.9}>
        <Animated.View style={[animatedStyle]}>
          <View style={[styles.card, selected && styles.cardSelected]}>
            {/* Card Header */}
            <View style={styles.cardHeader}>
              <View style={[styles.iconContainer, selected && styles.iconContainerSelected]}>
                <Ionicons 
                  name={idType.icon} 
                  size={28} 
                  color={selected ? '#584CF4' : '#FFFFFF'} 
                />
              </View>
              <View style={styles.cardHeaderText}>
                <Text style={styles.cardTitle}>{idType.title}</Text>
                <Text style={styles.cardSubtitle}>{idType.subtitle}</Text>
              </View>
              <View style={styles.checkContainer}>
                {selected && (
                  <Animated.View entering={FadeIn.duration(300)}>
                    <Ionicons name="checkmark-circle" size={28} color="#584CF4" />
                  </Animated.View>
                )}
              </View>
            </View>

            {/* Requirements (shown when selected) */}
            {selected && (
              <Animated.View 
                entering={FadeInDown.duration(400)}
                style={styles.requirementsContainer}
              >
                <Text style={styles.requirementsTitle}>Requirements:</Text>
                {idType.requirements.map((req, idx) => (
                  <View key={idx} style={styles.requirementItem}>
                    <View style={styles.requirementDot} />
                    <Text style={styles.requirementText}>{req}</Text>
                  </View>
                ))}
              </Animated.View>
            )}
          </View>
        </Animated.View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  backButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 24,
    paddingBottom: 120,
  },
  titleSection: {
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontFamily: 'Urbanist-Bold',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Urbanist-Regular',
    color: 'rgba(255, 255, 255, 0.7)',
    lineHeight: 24,
  },
  cardsContainer: {
    gap: 16,
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    padding: 20,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  cardSelected: {
    backgroundColor: 'rgba(88, 76, 244, 0.15)',
    borderColor: '#584CF4',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  iconContainerSelected: {
    backgroundColor: 'rgba(88, 76, 244, 0.2)',
  },
  cardHeaderText: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontFamily: 'Urbanist-Bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 14,
    fontFamily: 'Urbanist-Regular',
    color: 'rgba(255, 255, 255, 0.6)',
  },
  checkContainer: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  requirementsContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  requirementsTitle: {
    fontSize: 14,
    fontFamily: 'Urbanist-SemiBold',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  requirementDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#584CF4',
    marginRight: 12,
  },
  requirementText: {
    fontSize: 13,
    fontFamily: 'Urbanist-Regular',
    color: 'rgba(255, 255, 255, 0.8)',
    flex: 1,
  },
  infoBanner: {
    marginTop: 24,
    flexDirection: 'row',
    backgroundColor: 'rgba(88, 76, 244, 0.15)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(88, 76, 244, 0.3)',
  },
  infoBannerIcon: {
    marginRight: 12,
  },
  infoBannerContent: {
    flex: 1,
  },
  infoBannerTitle: {
    fontSize: 14,
    fontFamily: 'Urbanist-SemiBold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  infoBannerText: {
    fontSize: 13,
    fontFamily: 'Urbanist-Regular',
    color: 'rgba(255, 255, 255, 0.7)',
    lineHeight: 18,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
    paddingBottom: 36,
    paddingTop: 16,
    backgroundColor: 'rgba(26, 26, 46, 0.95)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  continueButton: {
    borderRadius: 100,
    overflow: 'hidden',
    shadowColor: '#584CF4',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  continueButtonDisabled: {
    shadowOpacity: 0,
    elevation: 0,
  },
  continueButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 32,
    gap: 8,
  },
  continueButtonText: {
    fontSize: 16,
    fontFamily: 'Urbanist-Bold',
    color: '#FFFFFF',
  },
});

