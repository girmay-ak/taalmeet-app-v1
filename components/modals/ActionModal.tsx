/**
 * Action Modal
 * Modal for taking moderation actions (warn, suspend, ban)
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/lib/theme/ThemeProvider';

interface ActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetUserId: string;
  targetUserName: string;
  onAction: (actionData: {
    action_type: 'warning' | 'suspension' | 'ban';
    reason: string;
    details?: string;
    duration_days?: number;
  }) => void;
}

export function ActionModal({
  isOpen,
  onClose,
  targetUserId,
  targetUserName,
  onAction,
}: ActionModalProps) {
  const { colors } = useTheme();
  const [actionType, setActionType] = useState<'warning' | 'suspension' | 'ban'>('warning');
  const [reason, setReason] = useState('');
  const [details, setDetails] = useState('');
  const [durationDays, setDurationDays] = useState('7');

  const handleSubmit = () => {
    if (!reason.trim()) {
      return;
    }

    onAction({
      action_type: actionType,
      reason: reason.trim(),
      details: details.trim() || undefined,
      duration_days:
        actionType === 'suspension' && durationDays
          ? parseInt(durationDays, 10)
          : undefined,
    });

    // Reset form
    setReason('');
    setDetails('');
    setDurationDays('7');
    setActionType('warning');
  };

  const handleClose = () => {
    setReason('');
    setDetails('');
    setDurationDays('7');
    setActionType('warning');
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
                  name="shield-outline"
                  size={24}
                  color={colors.semantic.error}
                />
              </View>
              <View>
                <Text style={[styles.headerTitle, { color: colors.text.primary }]}>
                  Take Action
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

          <ScrollView style={styles.content}>
            {/* Action Type Selection */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>
                Action Type
              </Text>
              <View style={styles.actionTypeButtons}>
                <TouchableOpacity
                  style={[
                    styles.actionTypeButton,
                    {
                      backgroundColor:
                        actionType === 'warning'
                          ? colors.semantic.warning + '20'
                          : colors.background.secondary,
                      borderColor:
                        actionType === 'warning'
                          ? colors.semantic.warning
                          : colors.border.default,
                    },
                  ]}
                  onPress={() => setActionType('warning')}
                >
                  <Ionicons
                    name="warning"
                    size={20}
                    color={
                      actionType === 'warning'
                        ? colors.semantic.warning
                        : colors.text.muted
                    }
                  />
                  <Text
                    style={[
                      styles.actionTypeText,
                      {
                        color:
                          actionType === 'warning'
                            ? colors.semantic.warning
                            : colors.text.secondary,
                      },
                    ]}
                  >
                    Warning
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.actionTypeButton,
                    {
                      backgroundColor:
                        actionType === 'suspension'
                          ? colors.primary + '20'
                          : colors.background.secondary,
                      borderColor:
                        actionType === 'suspension'
                          ? colors.primary
                          : colors.border.default,
                    },
                  ]}
                  onPress={() => setActionType('suspension')}
                >
                  <Ionicons
                    name="time"
                    size={20}
                    color={
                      actionType === 'suspension'
                        ? colors.primary
                        : colors.text.muted
                    }
                  />
                  <Text
                    style={[
                      styles.actionTypeText,
                      {
                        color:
                          actionType === 'suspension'
                            ? colors.primary
                            : colors.text.secondary,
                      },
                    ]}
                  >
                    Suspend
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.actionTypeButton,
                    {
                      backgroundColor:
                        actionType === 'ban'
                          ? colors.semantic.error + '20'
                          : colors.background.secondary,
                      borderColor:
                        actionType === 'ban'
                          ? colors.semantic.error
                          : colors.border.default,
                    },
                  ]}
                  onPress={() => setActionType('ban')}
                >
                  <Ionicons
                    name="ban"
                    size={20}
                    color={
                      actionType === 'ban'
                        ? colors.semantic.error
                        : colors.text.muted
                    }
                  />
                  <Text
                    style={[
                      styles.actionTypeText,
                      {
                        color:
                          actionType === 'ban'
                            ? colors.semantic.error
                            : colors.text.secondary,
                      },
                    ]}
                  >
                    Ban
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Reason */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>
                Reason *
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.background.secondary,
                    borderColor: colors.border.default,
                    color: colors.text.primary,
                  },
                ]}
                placeholder="Enter reason for this action"
                placeholderTextColor={colors.text.muted}
                value={reason}
                onChangeText={setReason}
                multiline
                numberOfLines={3}
              />
            </View>

            {/* Duration (for suspensions) */}
            {actionType === 'suspension' && (
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>
                  Duration (days)
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: colors.background.secondary,
                      borderColor: colors.border.default,
                      color: colors.text.primary,
                    },
                  ]}
                  placeholder="7"
                  placeholderTextColor={colors.text.muted}
                  value={durationDays}
                  onChangeText={setDurationDays}
                  keyboardType="numeric"
                />
              </View>
            )}

            {/* Details */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>
                Additional Details (Optional)
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.background.secondary,
                    borderColor: colors.border.default,
                    color: colors.text.primary,
                  },
                ]}
                placeholder="Add any additional context..."
                placeholderTextColor={colors.text.muted}
                value={details}
                onChangeText={setDetails}
                multiline
                numberOfLines={4}
              />
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
                  backgroundColor:
                    reason.trim() && actionType !== 'suspension'
                      ? colors.semantic.error
                      : reason.trim() && durationDays
                      ? colors.semantic.error
                      : colors.border.default,
                },
              ]}
              onPress={handleSubmit}
              disabled={!reason.trim() || (actionType === 'suspension' && !durationDays)}
            >
              <Text style={styles.submitButtonText}>Take Action</Text>
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
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  actionTypeButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  actionTypeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 2,
  },
  actionTypeText: {
    fontSize: 14,
    fontWeight: '600',
  },
  input: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    fontSize: 16,
    minHeight: 44,
    textAlignVertical: 'top',
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

