/**
 * Help & Support Screen - React Native
 */

import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/lib/theme/ThemeProvider';
import { useState } from 'react';

const faqs = [
  {
    question: 'How do I find language partners?',
    answer: 'Use the Discover tab to browse sessions and the Map to find partners nearby.'
  },
  {
    question: 'How does matching work?',
    answer: 'We match you based on language compatibility, location, and shared interests.'
  },
  {
    question: 'Is TaalMeet free?',
    answer: 'Yes! TaalMeet is free with optional Premium features for enhanced experience.'
  },
  {
    question: 'How do I report inappropriate behavior?',
    answer: 'Go to Privacy & Safety settings and tap "Report an Issue".'
  }
];

export default function HelpSupportScreen() {
  const { colors } = useTheme();
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background.primary }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.background.secondary, borderColor: colors.border.default }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text.primary }]}>Help & Support</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Contact Us */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text.muted }]}>CONTACT US</Text>
          <View style={[styles.sectionContent, { backgroundColor: colors.background.secondary, borderColor: colors.border.default }]}>
            <TouchableOpacity style={styles.contactRow}>
              <View style={[styles.iconContainer, { backgroundColor: `${colors.primary}20` }]}>
                <Ionicons name="chatbubble" size={20} color={colors.primary} />
              </View>
              <View style={styles.contactText}>
                <Text style={[styles.contactTitle, { color: colors.text.primary }]}>Live Chat</Text>
                <Text style={[styles.contactSubtitle, { color: colors.text.muted }]}>Chat with our support team</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.text.muted} />
            </TouchableOpacity>
            <View style={[styles.divider, { backgroundColor: colors.border.default }]} />
            <TouchableOpacity style={styles.contactRow}>
              <View style={[styles.iconContainer, { backgroundColor: '#5FB3B320' }]}>
                <Ionicons name="mail" size={20} color="#5FB3B3" />
              </View>
              <View style={styles.contactText}>
                <Text style={[styles.contactTitle, { color: colors.text.primary }]}>Email Support</Text>
                <Text style={[styles.contactSubtitle, { color: colors.text.muted }]}>support@taalmeet.com</Text>
              </View>
              <Ionicons name="open-outline" size={20} color={colors.text.muted} />
            </TouchableOpacity>
          </View>
        </View>

        {/* FAQs */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text.muted }]}>FREQUENTLY ASKED QUESTIONS</Text>
          <View style={styles.faqList}>
            {faqs.map((faq, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.faqItem, { backgroundColor: colors.background.secondary, borderColor: colors.border.default }]}
                onPress={() => setExpandedFaq(expandedFaq === index ? null : index)}
              >
                <View style={styles.faqHeader}>
                  <View style={[styles.faqIcon, { backgroundColor: '#E91E8C20' }]}>
                    <Ionicons name="help-circle" size={18} color="#E91E8C" />
                  </View>
                  <Text style={[styles.faqQuestion, { color: colors.text.primary }]}>{faq.question}</Text>
                  <Ionicons
                    name={expandedFaq === index ? 'chevron-up' : 'chevron-down'}
                    size={20}
                    color={colors.text.muted}
                  />
                </View>
                {expandedFaq === index && (
                  <Text style={[styles.faqAnswer, { color: colors.text.muted }]}>{faq.answer}</Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Resources */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text.muted }]}>RESOURCES</Text>
          <View style={[styles.sectionContent, { backgroundColor: colors.background.secondary, borderColor: colors.border.default }]}>
            <TouchableOpacity style={styles.contactRow}>
              <View style={[styles.iconContainer, { backgroundColor: '#F59E0B20' }]}>
                <Ionicons name="document-text" size={20} color="#F59E0B" />
              </View>
              <View style={styles.contactText}>
                <Text style={[styles.contactTitle, { color: colors.text.primary }]}>User Guide</Text>
                <Text style={[styles.contactSubtitle, { color: colors.text.muted }]}>Learn how to use TaalMeet</Text>
              </View>
              <Ionicons name="open-outline" size={20} color={colors.text.muted} />
            </TouchableOpacity>
            <View style={[styles.divider, { backgroundColor: colors.border.default }]} />
            <TouchableOpacity style={styles.contactRow}>
              <View style={[styles.iconContainer, { backgroundColor: '#8B5CF620' }]}>
                <Ionicons name="shield-checkmark" size={20} color="#8B5CF6" />
              </View>
              <View style={styles.contactText}>
                <Text style={[styles.contactTitle, { color: colors.text.primary }]}>Safety Tips</Text>
                <Text style={[styles.contactSubtitle, { color: colors.text.muted }]}>Stay safe while learning</Text>
              </View>
              <Ionicons name="open-outline" size={20} color={colors.text.muted} />
            </TouchableOpacity>
            <View style={[styles.divider, { backgroundColor: colors.border.default }]} />
            <TouchableOpacity style={styles.contactRow}>
              <View style={[styles.iconContainer, { backgroundColor: `${colors.primary}20` }]}>
                <Ionicons name="people" size={20} color={colors.primary} />
              </View>
              <View style={styles.contactText}>
                <Text style={[styles.contactTitle, { color: colors.text.primary }]}>Community Guidelines</Text>
                <Text style={[styles.contactSubtitle, { color: colors.text.muted }]}>Our community standards</Text>
              </View>
              <Ionicons name="open-outline" size={20} color={colors.text.muted} />
            </TouchableOpacity>
          </View>
        </View>

        {/* App Info */}
        <View style={styles.section}>
          <View style={[styles.appInfo, { backgroundColor: colors.background.secondary, borderColor: colors.border.default }]}>
            <Text style={[styles.appVersion, { color: colors.text.muted }]}>TaalMeet Version 1.0.0</Text>
            <Text style={[styles.appCopyright, { color: colors.text.dark }]}>© 2025 TaalMeet. All rights reserved.</Text>
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
    padding: 16,
    paddingBottom: 0,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  sectionContent: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  contactText: {
    flex: 1,
  },
  contactTitle: {
    fontSize: 15,
    fontWeight: '500',
  },
  contactSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  divider: {
    height: 1,
    marginLeft: 68,
  },
  faqList: {
    gap: 12,
  },
  faqItem: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
  },
  faqHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  faqIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  faqQuestion: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
  },
  faqAnswer: {
    fontSize: 14,
    lineHeight: 20,
    marginTop: 12,
    marginLeft: 44,
  },
  appInfo: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    alignItems: 'center',
  },
  appVersion: {
    fontSize: 14,
    marginBottom: 4,
  },
  appCopyright: {
    fontSize: 12,
  },
});

