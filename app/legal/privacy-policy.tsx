/**
 * Privacy Policy Screen
 * Displays the privacy policy document
 */

import { ScrollView, Text, View, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/lib/theme/ThemeProvider';

export default function PrivacyPolicyScreen() {
  const { colors } = useTheme();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background.primary }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.background.secondary, borderColor: colors.border.default }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text.primary }]}>Privacy Policy</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={[styles.title, { color: colors.text.primary }]}>Privacy Policy</Text>
          <Text style={[styles.lastUpdated, { color: colors.text.muted }]}>Last Updated: {new Date().toLocaleDateString()}</Text>

          <Text style={[styles.heading, { color: colors.text.primary }]}>1. Introduction</Text>
          <Text style={[styles.paragraph, { color: colors.text.secondary }]}>
            Welcome to TaalMeet ("we," "our," or "us"). We are committed to protecting your privacy and ensuring you have a positive experience on our language exchange platform. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our mobile application.
          </Text>

          <Text style={[styles.heading, { color: colors.text.primary }]}>2. Information We Collect</Text>
          
          <Text style={[styles.subHeading, { color: colors.text.primary }]}>2.1 Information You Provide</Text>
          <Text style={[styles.paragraph, { color: colors.text.secondary }]}>
            • Account Information: Email address, password, display name, profile photo, bio{'\n'}
            • Profile Information: Languages you speak and are learning, proficiency levels, location (city, country){'\n'}
            • Communication: Messages you send through our platform{'\n'}
            • Preferences: Discovery preferences, notification settings, privacy settings
          </Text>

          <Text style={[styles.subHeading, { color: colors.text.primary }]}>2.2 Automatically Collected Information</Text>
          <Text style={[styles.paragraph, { color: colors.text.secondary }]}>
            • Location Data: Precise location data when you enable location services to find nearby language partners{'\n'}
            • Device Information: Device type, operating system, unique device identifiers{'\n'}
            • Usage Data: How you interact with the app, features used, time spent{'\n'}
            • Log Data: IP address, access times, app crashes, performance data
          </Text>

          <Text style={[styles.heading, { color: colors.text.primary }]}>3. How We Use Your Information</Text>
          <Text style={[styles.paragraph, { color: colors.text.secondary }]}>
            We use the information we collect to:{'\n'}
            • Provide and maintain our language exchange service{'\n'}
            • Match you with compatible language partners based on location and language preferences{'\n'}
            • Enable communication between users{'\n'}
            • Send you notifications about matches, messages, and important updates{'\n'}
            • Improve and personalize your experience{'\n'}
            • Ensure safety and prevent abuse through our blocking and reporting features{'\n'}
            • Comply with legal obligations and enforce our Terms of Service
          </Text>

          <Text style={[styles.heading, { color: colors.text.primary }]}>4. Data Sharing and Disclosure</Text>
          
          <Text style={[styles.subHeading, { color: colors.text.primary }]}>4.1 With Other Users</Text>
          <Text style={[styles.paragraph, { color: colors.text.secondary }]}>
            Your profile information (display name, photo, languages, approximate location) is visible to other users to facilitate language exchange connections.
          </Text>

          <Text style={[styles.subHeading, { color: colors.text.primary }]}>4.2 Service Providers</Text>
          <Text style={[styles.paragraph, { color: colors.text.secondary }]}>
            We use third-party services to operate our platform:{'\n'}
            • Supabase: Database and authentication services{'\n'}
            • Eventbrite: Language event information{'\n'}
            • Analytics providers: To understand app usage and improve our service
          </Text>

          <Text style={[styles.subHeading, { color: colors.text.primary }]}>4.3 Legal Requirements</Text>
          <Text style={[styles.paragraph, { color: colors.text.secondary }]}>
            We may disclose your information if required by law, to protect our rights, or to ensure user safety.
          </Text>

          <Text style={[styles.heading, { color: colors.text.primary }]}>5. Data Security</Text>
          <Text style={[styles.paragraph, { color: colors.text.secondary }]}>
            We implement industry-standard security measures to protect your data, including encryption, secure authentication, and access controls. However, no method of transmission over the internet is 100% secure.
          </Text>

          <Text style={[styles.heading, { color: colors.text.primary }]}>6. Your Rights and Choices</Text>
          <Text style={[styles.paragraph, { color: colors.text.secondary }]}>
            You have the right to:{'\n'}
            • Access your personal data{'\n'}
            • Correct inaccurate information{'\n'}
            • Delete your account and data{'\n'}
            • Export your data (GDPR right to data portability){'\n'}
            • Opt-out of certain data collection{'\n'}
            • Block other users{'\n'}
            • Report inappropriate behavior
          </Text>

          <Text style={[styles.heading, { color: colors.text.primary }]}>7. Location Data</Text>
          <Text style={[styles.paragraph, { color: colors.text.secondary }]}>
            We use your location to match you with nearby language partners. You can control location sharing in your device settings or app privacy settings. We do not share your precise location with other users—only approximate distance is shown.
          </Text>

          <Text style={[styles.heading, { color: colors.text.primary }]}>8. Children's Privacy</Text>
          <Text style={[styles.paragraph, { color: colors.text.secondary }]}>
            TaalMeet is intended for users aged 18 and older. We do not knowingly collect information from children under 18. If you believe we have collected information from a child, please contact us immediately.
          </Text>

          <Text style={[styles.heading, { color: colors.text.primary }]}>9. International Data Transfers</Text>
          <Text style={[styles.paragraph, { color: colors.text.secondary }]}>
            Your information may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place to protect your data in accordance with this Privacy Policy.
          </Text>

          <Text style={[styles.heading, { color: colors.text.primary }]}>10. Data Retention</Text>
          <Text style={[styles.paragraph, { color: colors.text.secondary }]}>
            We retain your information for as long as your account is active or as needed to provide services. When you delete your account, we will delete or anonymize your personal data, except where we are required to retain it for legal purposes.
          </Text>

          <Text style={[styles.heading, { color: colors.text.primary }]}>11. Changes to This Policy</Text>
          <Text style={[styles.paragraph, { color: colors.text.secondary }]}>
            We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new policy in the app and updating the "Last Updated" date.
          </Text>

          <Text style={[styles.heading, { color: colors.text.primary }]}>12. Contact Us</Text>
          <Text style={[styles.paragraph, { color: colors.text.secondary }]}>
            If you have questions about this Privacy Policy or our data practices, please contact us at:{'\n\n'}
            Email: privacy@taalmeet.com{'\n'}
            Address: [Your Company Address]
          </Text>

          <View style={styles.footer}>
            <Text style={[styles.footerText, { color: colors.text.muted }]}>
              By using TaalMeet, you agree to the collection and use of information in accordance with this Privacy Policy.
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
  subHeading: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
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

