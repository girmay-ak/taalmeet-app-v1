/**
 * Terms of Service Screen
 * Displays the terms of service document
 */

import { ScrollView, Text, View, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/lib/theme/ThemeProvider';

export default function TermsOfServiceScreen() {
  const { colors } = useTheme();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background.primary }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.background.secondary, borderColor: colors.border.default }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text.primary }]}>Terms of Service</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={[styles.title, { color: colors.text.primary }]}>Terms of Service</Text>
          <Text style={[styles.lastUpdated, { color: colors.text.muted }]}>Last Updated: {new Date().toLocaleDateString()}</Text>

          <Text style={[styles.heading, { color: colors.text.primary }]}>1. Acceptance of Terms</Text>
          <Text style={[styles.paragraph, { color: colors.text.secondary }]}>
            By accessing and using TaalMeet ("the Service"), you accept and agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, you may not use the Service.
          </Text>

          <Text style={[styles.heading, { color: colors.text.primary }]}>2. Eligibility</Text>
          <Text style={[styles.paragraph, { color: colors.text.secondary }]}>
            You must be at least 18 years old to use TaalMeet. By using the Service, you represent and warrant that you are 18 years of age or older and have the legal capacity to enter into these Terms.
          </Text>

          <Text style={[styles.heading, { color: colors.text.primary }]}>3. Account Registration</Text>
          <Text style={[styles.paragraph, { color: colors.text.secondary }]}>
            • You must provide accurate, current, and complete information during registration{'\n'}
            • You are responsible for maintaining the confidentiality of your account credentials{'\n'}
            • You are responsible for all activities that occur under your account{'\n'}
            • You must notify us immediately of any unauthorized use of your account{'\n'}
            • You may not create multiple accounts or share your account with others
          </Text>

          <Text style={[styles.heading, { color: colors.text.primary }]}>4. User Conduct</Text>
          <Text style={[styles.paragraph, { color: colors.text.secondary }]}>
            You agree not to:{'\n'}
            • Harass, abuse, or harm other users{'\n'}
            • Post false, misleading, or fraudulent information{'\n'}
            • Use the Service for any illegal purpose{'\n'}
            • Impersonate any person or entity{'\n'}
            • Spam or send unsolicited messages{'\n'}
            • Share inappropriate, offensive, or explicit content{'\n'}
            • Violate any applicable laws or regulations{'\n'}
            • Interfere with or disrupt the Service{'\n'}
            • Attempt to gain unauthorized access to the Service
          </Text>

          <Text style={[styles.heading, { color: colors.text.primary }]}>5. Language Exchange</Text>
          <Text style={[styles.paragraph, { color: colors.text.secondary }]}>
            TaalMeet is a platform for language exchange. Users are responsible for their own safety when meeting in person. We recommend meeting in public places and exercising caution. TaalMeet is not responsible for any interactions between users outside of our platform.
          </Text>

          <Text style={[styles.heading, { color: colors.text.primary }]}>6. Content and Intellectual Property</Text>
          <Text style={[styles.paragraph, { color: colors.text.secondary }]}>
            • You retain ownership of content you post on TaalMeet{'\n'}
            • By posting content, you grant us a license to use, display, and distribute it on the Service{'\n'}
            • You may not post content that infringes on others' intellectual property rights{'\n'}
            • We reserve the right to remove any content that violates these Terms
          </Text>

          <Text style={[styles.heading, { color: colors.text.primary }]}>7. Privacy</Text>
          <Text style={[styles.paragraph, { color: colors.text.secondary }]}>
            Your use of the Service is also governed by our Privacy Policy. Please review our Privacy Policy to understand how we collect, use, and protect your information.
          </Text>

          <Text style={[styles.heading, { color: colors.text.primary }]}>8. Safety and Moderation</Text>
          <Text style={[styles.paragraph, { color: colors.text.secondary }]}>
            • We provide tools to block and report users{'\n'}
            • We reserve the right to suspend or terminate accounts that violate these Terms{'\n'}
            • We may review reported content and take appropriate action{'\n'}
            • Users who engage in harmful behavior may be permanently banned
          </Text>

          <Text style={[styles.heading, { color: colors.text.primary }]}>9. Service Availability</Text>
          <Text style={[styles.paragraph, { color: colors.text.secondary }]}>
            We strive to provide a reliable service but do not guarantee uninterrupted or error-free operation. We may modify, suspend, or discontinue any part of the Service at any time.
          </Text>

          <Text style={[styles.heading, { color: colors.text.primary }]}>10. Termination</Text>
          <Text style={[styles.paragraph, { color: colors.text.secondary }]}>
            • You may delete your account at any time through the app settings{'\n'}
            • We may suspend or terminate your account if you violate these Terms{'\n'}
            • Upon termination, your right to use the Service will immediately cease{'\n'}
            • We may retain certain information as required by law or for legitimate business purposes
          </Text>

          <Text style={[styles.heading, { color: colors.text.primary }]}>11. Disclaimers</Text>
          <Text style={[styles.paragraph, { color: colors.text.secondary }]}>
            THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND. WE DISCLAIM ALL WARRANTIES, EXPRESS OR IMPLIED, INCLUDING WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
          </Text>

          <Text style={[styles.heading, { color: colors.text.primary }]}>12. Limitation of Liability</Text>
          <Text style={[styles.paragraph, { color: colors.text.secondary }]}>
            TO THE MAXIMUM EXTENT PERMITTED BY LAW, WE SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES ARISING FROM YOUR USE OF THE SERVICE.
          </Text>

          <Text style={[styles.heading, { color: colors.text.primary }]}>13. Indemnification</Text>
          <Text style={[styles.paragraph, { color: colors.text.secondary }]}>
            You agree to indemnify and hold us harmless from any claims, damages, losses, or expenses arising from your use of the Service or violation of these Terms.
          </Text>

          <Text style={[styles.heading, { color: colors.text.primary }]}>14. Changes to Terms</Text>
          <Text style={[styles.paragraph, { color: colors.text.secondary }]}>
            We may modify these Terms at any time. We will notify you of material changes by posting the updated Terms in the app. Your continued use of the Service after changes constitutes acceptance of the new Terms.
          </Text>

          <Text style={[styles.heading, { color: colors.text.primary }]}>15. Governing Law</Text>
          <Text style={[styles.paragraph, { color: colors.text.secondary }]}>
            These Terms shall be governed by and construed in accordance with the laws of [Your Jurisdiction], without regard to its conflict of law provisions.
          </Text>

          <Text style={[styles.heading, { color: colors.text.primary }]}>16. Contact Information</Text>
          <Text style={[styles.paragraph, { color: colors.text.secondary }]}>
            If you have questions about these Terms, please contact us at:{'\n\n'}
            Email: legal@taalmeet.com{'\n'}
            Address: [Your Company Address]
          </Text>

          <View style={styles.footer}>
            <Text style={[styles.footerText, { color: colors.text.muted }]}>
              By using TaalMeet, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.
            </Text>
          </View>
        </View>
      </ScrollView>
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
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  section: {
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  lastUpdated: {
    fontSize: 14,
    marginBottom: 24,
  },
  heading: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 24,
    marginBottom: 12,
  },
  paragraph: {
    fontSize: 15,
    lineHeight: 24,
    marginBottom: 16,
  },
  footer: {
    marginTop: 32,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  footerText: {
    fontSize: 14,
    fontStyle: 'italic',
    textAlign: 'center',
  },
});

