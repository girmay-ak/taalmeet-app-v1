/**
 * Help & Support Screen - React Native
 */

import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/lib/theme/ThemeProvider';
import { useState } from 'react';
import { useFAQs, useCreateSupportTicket, useSupportTickets, useRateFAQ } from '@/hooks/useHelp';
import { useAuth } from '@/providers';

export default function HelpSupportScreen() {
  const { colors } = useTheme();
  const { user } = useAuth();
  const [expandedFaq, setExpandedFaq] = useState<string | null>(null);
  const [showSupportForm, setShowSupportForm] = useState(false);
  const [supportSubject, setSupportSubject] = useState('');
  const [supportMessage, setSupportMessage] = useState('');
  const [supportCategory, setSupportCategory] = useState<'account' | 'technical' | 'billing' | 'safety' | 'feature_request' | 'bug_report' | 'other'>('other');
  const [searchQuery, setSearchQuery] = useState('');

  const { data: faqs = [], isLoading: faqsLoading } = useFAQs();
  const { data: tickets = [] } = useSupportTickets(user?.id);
  const createTicketMutation = useCreateSupportTicket();
  const rateFAQMutation = useRateFAQ();

  const filteredFAQs = searchQuery
    ? faqs.filter(
        (faq) =>
          faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
          faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : faqs;

  const handleCreateTicket = () => {
    if (!supportSubject.trim() || !supportMessage.trim()) {
      return;
    }

    createTicketMutation.mutate(
      {
        subject: supportSubject.trim(),
        category: supportCategory,
        message: supportMessage.trim(),
      },
      {
        onSuccess: () => {
          setShowSupportForm(false);
          setSupportSubject('');
          setSupportMessage('');
          setSupportCategory('other');
        },
      }
    );
  };

  const handleRateFAQ = (faqId: string, isHelpful: boolean) => {
    rateFAQMutation.mutate({ faqId, isHelpful });
  };

  const openEmail = () => {
    Linking.openURL('mailto:support@taalmeet.com?subject=TaalMeet Support Request');
  };

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
        {/* Search */}
        <View style={styles.section}>
          <View style={[styles.searchContainer, { backgroundColor: colors.background.secondary, borderColor: colors.border.default }]}>
            <Ionicons name="search" size={20} color={colors.text.muted} style={styles.searchIcon} />
            <TextInput
              style={[styles.searchInput, { color: colors.text.primary }]}
              placeholder="Search FAQs..."
              placeholderTextColor={colors.text.muted}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={20} color={colors.text.muted} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Contact Support */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text.muted }]}>CONTACT SUPPORT</Text>
          <View style={[styles.sectionContent, { backgroundColor: colors.background.secondary, borderColor: colors.border.default }]}>
            <TouchableOpacity
              style={styles.contactRow}
              onPress={() => setShowSupportForm(!showSupportForm)}
            >
              <View style={[styles.iconContainer, { backgroundColor: `${colors.primary}20` }]}>
                <Ionicons name="chatbubble" size={20} color={colors.primary} />
              </View>
              <View style={styles.contactText}>
                <Text style={[styles.contactTitle, { color: colors.text.primary }]}>Create Support Ticket</Text>
                <Text style={[styles.contactSubtitle, { color: colors.text.muted }]}>
                  {tickets.length > 0 ? `${tickets.length} active ticket${tickets.length > 1 ? 's' : ''}` : 'Get help from our team'}
                </Text>
              </View>
              <Ionicons
                name={showSupportForm ? 'chevron-up' : 'chevron-down'}
                size={20}
                color={colors.text.muted}
              />
            </TouchableOpacity>

            {showSupportForm && (
              <View style={[styles.supportForm, { borderTopColor: colors.border.default }]}>
                <View style={styles.formGroup}>
                  <Text style={[styles.label, { color: colors.text.primary }]}>Subject</Text>
                  <TextInput
                    style={[styles.input, { backgroundColor: colors.background.primary, borderColor: colors.border.default, color: colors.text.primary }]}
                    placeholder="What can we help you with?"
                    placeholderTextColor={colors.text.muted}
                    value={supportSubject}
                    onChangeText={setSupportSubject}
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={[styles.label, { color: colors.text.primary }]}>Category</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryContainer}>
                    {[
                      { value: 'account', label: 'Account' },
                      { value: 'technical', label: 'Technical' },
                      { value: 'billing', label: 'Billing' },
                      { value: 'safety', label: 'Safety' },
                      { value: 'feature_request', label: 'Feature' },
                      { value: 'bug_report', label: 'Bug' },
                      { value: 'other', label: 'Other' },
                    ].map((cat) => (
                      <TouchableOpacity
                        key={cat.value}
                        style={[
                          styles.categoryChip,
                          {
                            backgroundColor: supportCategory === cat.value ? colors.primary : colors.background.primary,
                            borderColor: colors.border.default,
                          },
                        ]}
                        onPress={() => setSupportCategory(cat.value as any)}
                      >
                        <Text
                          style={[
                            styles.categoryChipText,
                            { color: supportCategory === cat.value ? '#fff' : colors.text.primary },
                          ]}
                        >
                          {cat.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>

                <View style={styles.formGroup}>
                  <Text style={[styles.label, { color: colors.text.primary }]}>Message</Text>
                  <TextInput
                    style={[
                      styles.textArea,
                      { backgroundColor: colors.background.primary, borderColor: colors.border.default, color: colors.text.primary },
                    ]}
                    placeholder="Describe your issue in detail..."
                    placeholderTextColor={colors.text.muted}
                    value={supportMessage}
                    onChangeText={setSupportMessage}
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                  />
                </View>

                <TouchableOpacity
                  style={[
                    styles.submitButton,
                    {
                      backgroundColor: colors.primary,
                      opacity: !supportSubject.trim() || !supportMessage.trim() || createTicketMutation.isPending ? 0.5 : 1,
                    },
                  ]}
                  onPress={handleCreateTicket}
                  disabled={!supportSubject.trim() || !supportMessage.trim() || createTicketMutation.isPending}
                >
                  {createTicketMutation.isPending ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.submitButtonText}>Submit Ticket</Text>
                  )}
                </TouchableOpacity>
              </View>
            )}

            <View style={[styles.divider, { backgroundColor: colors.border.default }]} />
            <TouchableOpacity style={styles.contactRow} onPress={openEmail}>
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
          <Text style={[styles.sectionTitle, { color: colors.text.muted }]}>
            FREQUENTLY ASKED QUESTIONS {faqs.length > 0 && `(${filteredFAQs.length})`}
          </Text>
          {faqsLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
          ) : filteredFAQs.length === 0 ? (
            <View style={[styles.emptyState, { backgroundColor: colors.background.secondary, borderColor: colors.border.default }]}>
              <Ionicons name="help-circle-outline" size={48} color={colors.text.muted} />
              <Text style={[styles.emptyStateText, { color: colors.text.muted }]}>
                {searchQuery ? 'No FAQs found matching your search' : 'No FAQs available'}
              </Text>
            </View>
          ) : (
            <View style={styles.faqList}>
              {filteredFAQs.map((faq) => (
                <View
                  key={faq.id}
                  style={[styles.faqItem, { backgroundColor: colors.background.secondary, borderColor: colors.border.default }]}
                >
                  <TouchableOpacity
                    style={styles.faqHeader}
                    onPress={() => setExpandedFaq(expandedFaq === faq.id ? null : faq.id)}
                  >
                    <View style={[styles.faqIcon, { backgroundColor: '#E91E8C20' }]}>
                      <Ionicons name="help-circle" size={18} color="#E91E8C" />
                    </View>
                    <Text style={[styles.faqQuestion, { color: colors.text.primary }]}>{faq.question}</Text>
                    <Ionicons
                      name={expandedFaq === faq.id ? 'chevron-up' : 'chevron-down'}
                      size={20}
                      color={colors.text.muted}
                    />
                  </TouchableOpacity>
                  {expandedFaq === faq.id && (
                    <View style={styles.faqContent}>
                      <Text style={[styles.faqAnswer, { color: colors.text.muted }]}>{faq.answer}</Text>
                      <View style={styles.faqFeedback}>
                        <Text style={[styles.faqFeedbackText, { color: colors.text.muted }]}>Was this helpful?</Text>
                        <View style={styles.faqFeedbackButtons}>
                          <TouchableOpacity
                            style={[styles.faqFeedbackButton, { backgroundColor: colors.background.primary }]}
                            onPress={() => handleRateFAQ(faq.id, true)}
                          >
                            <Ionicons name="thumbs-up" size={16} color={colors.text.primary} />
                            <Text style={[styles.faqFeedbackButtonText, { color: colors.text.primary }]}>Yes</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={[styles.faqFeedbackButton, { backgroundColor: colors.background.primary }]}
                            onPress={() => handleRateFAQ(faq.id, false)}
                          >
                            <Ionicons name="thumbs-down" size={16} color={colors.text.primary} />
                            <Text style={[styles.faqFeedbackButtonText, { color: colors.text.primary }]}>No</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    </View>
                  )}
                </View>
              ))}
            </View>
          )}
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
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
  supportForm: {
    padding: 16,
    borderTopWidth: 1,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  input: {
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
  },
  textArea: {
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    minHeight: 100,
  },
  categoryContainer: {
    flexDirection: 'row',
  },
  categoryChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    marginRight: 8,
  },
  categoryChipText: {
    fontSize: 13,
    fontWeight: '500',
  },
  submitButton: {
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  faqList: {
    gap: 12,
  },
  faqItem: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  faqHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
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
  faqContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  faqAnswer: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
    marginLeft: 44,
  },
  faqFeedback: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginLeft: 44,
    marginTop: 8,
  },
  faqFeedbackText: {
    fontSize: 12,
  },
  faqFeedbackButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  faqFeedbackButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  faqFeedbackButtonText: {
    fontSize: 12,
    fontWeight: '500',
  },
  loadingContainer: {
    padding: 32,
    alignItems: 'center',
  },
  emptyState: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 32,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 14,
    marginTop: 12,
    textAlign: 'center',
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
