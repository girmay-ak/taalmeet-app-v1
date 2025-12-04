/**
 * Report User Modal
 * React Native modal for reporting users
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/lib/theme/ThemeProvider';
import { useReportUser } from '@/hooks/useSafety';

interface ReportUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetUserId: string;
  targetUserName: string;
}

const reportReasons = [
  { id: 'harassment', label: 'Harassment or Bullying' },
  { id: 'spam', label: 'Spam or Scam' },
  { id: 'inappropriate', label: 'Inappropriate Content' },
  { id: 'fake', label: 'Fake Profile' },
  { id: 'other', label: 'Other' },
];

export function ReportUserModal({
  isOpen,
  onClose,
  targetUserId,
  targetUserName,
}: ReportUserModalProps) {
  const { colors } = useTheme();
  const reportUserMutation = useReportUser();
  const [selectedReason, setSelectedReason] = useState<string>('');
  const [message, setMessage] = useState('');

  const handleSubmit = async () => {
    if (!selectedReason) {
      Alert.alert('Required', 'Please select a reason for reporting');
      return;
    }

    try {
      await reportUserMutation.mutateAsync({
        target_id: targetUserId,
        reason: reportReasons.find((r) => r.id === selectedReason)?.label || selectedReason,
        message: message.trim() || undefined,
      });
      handleClose();
    } catch (error) {
      // Error is handled by the hook
    }
  };

  const handleClose = () => {
    setSelectedReason('');
    setMessage('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <Modal
      visible={isOpen}
      animationType="slide"
      transparent
      onRequestClose={handleClose}
    >
      <View style={styles.modalOverlay}>
        <SafeAreaView
          style={[
            styles.modalContent,
            { backgroundColor: colors.background.primary },
          ]}
          edges={['bottom']}
        >
          {/* Header */}
          <View
            style={[
              styles.header,
              { borderBottomColor: colors.border.default },
            ]}
          >
            <View style={styles.headerLeft}>
              <View
                style={[
                  styles.iconContainer,
                  { backgroundColor: colors.semantic.error + '20' },
                ]}
              >
                <Ionicons
                  name="flag-outline"
                  size={24}
                  color={colors.semantic.error}
                />
              </View>
              <View>
                <Text style={[styles.headerTitle, { color: colors.text.primary }]}>
                  Report User
                </Text>
                <Text style={[styles.headerSubtitle, { color: colors.text.muted }]}>
                  {targetUserName}
                </Text>
              </View>
            </View>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={colors.text.primary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            <Text style={[styles.description, { color: colors.text.secondary }]}>
              Please select a reason for reporting this user. Your report will be
              reviewed by our moderation team.
            </Text>

            {/* Reason Selection */}
            <View style={styles.reasonsContainer}>
              {reportReasons.map((reason) => (
                <TouchableOpacity
                  key={reason.id}
                  style={[
                    styles.reasonButton,
                    {
                      backgroundColor:
                        selectedReason === reason.id
                          ? colors.primary + '20'
                          : colors.background.secondary,
                      borderColor:
                        selectedReason === reason.id
                          ? colors.primary
                          : colors.border.default,
                    },
                  ]}
                  onPress={() => setSelectedReason(reason.id)}
                >
                  <View style={styles.reasonContent}>
                    <Text
                      style={[
                        styles.reasonLabel,
                        {
                          color:
                            selectedReason === reason.id
                              ? colors.primary
                              : colors.text.primary,
                        },
                      ]}
                    >
                      {reason.label}
                    </Text>
                    {selectedReason === reason.id && (
                      <Ionicons name="checkmark-circle" size={20} color={colors.primary} />
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </View>

            {/* Additional Message */}
            <View style={styles.messageContainer}>
              <Text style={[styles.messageLabel, { color: colors.text.primary }]}>
                Additional Details (Optional)
              </Text>
              <TextInput
                style={[
                  styles.messageInput,
                  {
                    backgroundColor: colors.background.secondary,
                    borderColor: colors.border.default,
                    color: colors.text.primary,
                  },
                ]}
                placeholder="Provide more details about the issue..."
                placeholderTextColor={colors.text.muted}
                value={message}
                onChangeText={setMessage}
                multiline
                numberOfLines={4}
                maxLength={2000}
                textAlignVertical="top"
              />
              <Text style={[styles.charCount, { color: colors.text.muted }]}>
                {message.length}/2000
              </Text>
            </View>
          </ScrollView>

          {/* Footer */}
          <View
            style={[
              styles.footer,
              { borderTopColor: colors.border.default },
            ]}
          >
            <TouchableOpacity
              style={[
                styles.cancelButton,
                { backgroundColor: colors.background.secondary },
              ]}
              onPress={handleClose}
            >
              <Text style={[styles.cancelButtonText, { color: colors.text.primary }]}>
                Cancel
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.submitButton,
                {
                  backgroundColor: selectedReason
                    ? colors.semantic.error
                    : colors.border.default,
                },
              ]}
              onPress={handleSubmit}
              disabled={!selectedReason || reportUserMutation.isPending}
            >
              <Text style={styles.submitButtonText}>Submit Report</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  headerSubtitle: {
    fontSize: 14,
    marginTop: 2,
  },
  closeButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 24,
  },
  reasonsContainer: {
    gap: 12,
    marginBottom: 24,
  },
  reasonButton: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
  },
  reasonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  reasonLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  messageContainer: {
    marginBottom: 16,
  },
  messageLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  messageInput: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    minHeight: 100,
    fontSize: 16,
  },
  charCount: {
    fontSize: 12,
    textAlign: 'right',
    marginTop: 4,
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    padding: 16,
    borderTopWidth: 1,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  submitButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

