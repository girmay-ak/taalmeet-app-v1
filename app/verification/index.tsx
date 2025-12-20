/**
 * Verification Overview Screen
 * Enhanced entry point for the ID verification flow - Matches web design
 */

import React from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, ScrollView, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useStartFullVerification, useVerificationStatus } from '@/hooks/useVerification';
import { useTheme } from '@/lib/theme/ThemeProvider';

export default function VerificationIndexScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const startVerification = useStartFullVerification();
  const { data: status, isLoading } = useVerificationStatus();

  const handleStartVerification = async () => {
    try {
      const session = await startVerification.mutateAsync();
      
      // Navigate to ID type selection first
      router.push({
        pathname: '/verification/select-id-type',
        params: { sessionId: session.id },
      });
    } catch (error) {
      console.error('Failed to start verification:', error);
    }
  };

  const benefits = [
    {
      icon: 'checkmark-circle' as const,
      title: 'Verified Badge',
      description: 'Get a verified badge on your profile that shows you\'re a real person',
      color: '#1DB954',
    },
    {
      icon: 'people' as const,
      title: 'Build Trust',
      description: 'Verified users get 3x more connection requests and responses',
      color: '#1DB954',
    },
    {
      icon: 'headset' as const,
      title: 'Priority Support',
      description: 'Get faster response times from our support team',
      color: '#1DB954',
    },
    {
      icon: 'shield-checkmark' as const,
      title: 'Safety First',
      description: 'Help create a safer community for language learners',
      color: '#1DB954',
    },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background.primary }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.background.secondary, borderBottomColor: colors.border.default }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text.primary }]}>Profile Verification</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Icon */}
        <View style={styles.heroSection}>
          <LinearGradient
            colors={[colors.primary, '#0EA5E9']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.heroIconContainer}
          >
            <Ionicons name="shield-checkmark" size={48} color="#FFFFFF" />
          </LinearGradient>

          <Text style={[styles.title, { color: colors.text.primary }]}>
            Verify Your Profile
          </Text>
          <Text style={[styles.subtitle, { color: colors.text.muted }]}>
            Get verified to build trust with language partners and access exclusive features
          </Text>
        </View>

        {/* Current Status */}
        {status && status.verification_level !== 'none' && (
          <View style={[styles.statusCard, { backgroundColor: '#1DB95420', borderColor: '#1DB95440' }]}>
            <View style={styles.statusHeader}>
              <Ionicons name="shield-checkmark" size={24} color="#1DB954" />
              <View style={styles.statusContent}>
                <Text style={[styles.statusTitle, { color: '#1DB954' }]}>
                  Verification Level: {status.verification_level.toUpperCase()}
                </Text>
                <Text style={[styles.statusSubtext, { color: colors.text.muted }]}>
                  {status.id_verified ? '✓ ID Verified' : '○ ID Pending'}
                  {' · '}
                  {status.face_recognition_enabled ? '✓ Face Enrolled' : '○ Face Pending'}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Benefits Cards */}
        <View style={styles.benefitsSection}>
          {benefits.map((benefit, index) => (
            <View
              key={index}
              style={[
                styles.benefitCard,
                { backgroundColor: colors.background.secondary, borderColor: colors.border.default },
              ]}
            >
              <View style={[styles.benefitIconCircle, { backgroundColor: `${benefit.color}20` }]}>
                <Ionicons name={benefit.icon} size={20} color={benefit.color} />
              </View>
              <View style={styles.benefitContent}>
                <Text style={[styles.benefitTitle, { color: colors.text.primary }]}>
                  {benefit.title}
                </Text>
                <Text style={[styles.benefitDescription, { color: colors.text.muted }]}>
                  {benefit.description}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* What You'll Need */}
        <View style={[styles.requirementsCard, { backgroundColor: colors.background.secondary, borderColor: colors.border.default }]}>
          <Text style={[styles.requirementsTitle, { color: colors.text.primary }]}>
            What You'll Need:
          </Text>
          <View style={styles.requirementsList}>
            <View style={styles.requirementItem}>
              <Ionicons name="document-text" size={16} color="#1DB954" />
              <Text style={[styles.requirementText, { color: colors.text.muted }]}>
                Government-issued ID (Passport, Driver's License, or National ID)
              </Text>
            </View>
            <View style={styles.requirementItem}>
              <Ionicons name="camera" size={16} color="#1DB954" />
              <Text style={[styles.requirementText, { color: colors.text.muted }]}>
                A clear selfie holding your ID
              </Text>
            </View>
          </View>
        </View>

        {/* Privacy Notice */}
        <View style={[styles.privacyNotice, { backgroundColor: colors.background.secondary, borderColor: colors.border.default }]}>
          <Ionicons name="shield-checkmark" size={16} color="#1DB954" style={styles.privacyIcon} />
          <Text style={[styles.privacyText, { color: colors.text.muted }]}>
            Your documents are encrypted and used only for verification. We never share your personal information.
          </Text>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Bottom CTA */}
      <View style={[styles.bottomBar, { backgroundColor: colors.background.secondary, borderTopColor: colors.border.default }]}>
        <TouchableOpacity
          style={styles.startButton}
          onPress={handleStartVerification}
          disabled={startVerification.isPending}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={[colors.primary, '#0EA5E9']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.gradientButton}
          >
            <Text style={styles.startButtonText}>
              {startVerification.isPending ? 'Starting...' : 
               status?.verification_level !== 'none' ? 'Update Verification' : 'Start Verification'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
  },
  heroSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  heroIconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 20,
  },
  statusCard: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 24,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statusContent: {
    flex: 1,
  },
  statusTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4,
  },
  statusSubtext: {
    fontSize: 13,
  },
  benefitsSection: {
    marginBottom: 24,
  },
  benefitCard: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 16,
    alignItems: 'flex-start',
  },
  benefitIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  benefitContent: {
    flex: 1,
  },
  benefitTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  benefitDescription: {
    fontSize: 13,
    lineHeight: 19,
  },
  requirementsCard: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 16,
  },
  requirementsTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 12,
  },
  requirementsList: {
    gap: 8,
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  requirementText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 19,
  },
  privacyNotice: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  privacyIcon: {
    marginTop: 2,
  },
  privacyText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 18,
    marginLeft: 8,
  },
  bottomBar: {
    padding: 20,
    paddingBottom: 24,
    borderTopWidth: 1,
  },
  startButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  gradientButton: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  startButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
